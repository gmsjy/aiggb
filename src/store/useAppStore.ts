/**
 * 全局状态 —— 见 SPEC.md §3.3
 *
 * - config: AI 设置（持久化到 localStorage，写明显式告警）
 * - domain: 通用 / 物理（影响 system prompt）
 * - messages: 聊天历史
 * - ggbApi: 由 <GGBCanvas> 注入；不持久化
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GGBAppletApi } from "../types/ggb";
import type { AIResponse, Command } from "../lib/schema";
import type { AIConfig } from "../lib/aiClient";
import type { ExecResult } from "../lib/ggbBridge";
import type { Domain } from "../lib/prompts";
import type { ProblemAnalysis } from "../lib/problemSchema";
import { takeSnapshot, restoreSnapshot, replayConstructionLog } from "../lib/pipeline";
import {
  type Session,
  type SessionMeta,
  createSessionId,
  titleFromMessages,
  saveSession,
  loadSession,
  listSessions,
  deleteSession,
  clearAllSessions as clearAllSessionsDb,
} from "../lib/sessionStore";

/** 会话索引的 localStorage key（与 aiggb_config 分离，不含 API Key） */
const SESSION_STORAGE_KEY = "aiggb_sessions";
interface SessionIndexState {
  currentId: string | null;
  index: SessionMeta[];
}
function readSessionIndexState(): SessionIndexState {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return { currentId: null, index: [] };
    const p = JSON.parse(raw) as Partial<SessionIndexState>;
    return {
      currentId: typeof p.currentId === "string" ? p.currentId : null,
      index: Array.isArray(p.index) ? p.index : [],
    };
  } catch {
    return { currentId: null, index: [] };
  }
}
function writeSessionIndexState(s: SessionIndexState): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(s));
  } catch { /* 容量/隐私模式异常静默 */ }
}

// ── token 用量历史（每轮对话一条，localStorage 独立 key，设置面板统计图消费） ──
const TOKEN_HISTORY_KEY = "aiggb_token_usage";
/** 最多保留的对话轮次（每条 ~50 字节，100 条约 5KB） */
const MAX_TOKEN_HISTORY = 100;

/** 一轮对话的 token 用量记录 */
export interface TokenRecord {
  /** 轮次结束时间戳（毫秒） */
  ts: number;
  /** 输入 token */
  prompt: number;
  /** 输出 token */
  completion: number;
  /** 命中服务端前缀缓存（KV Cache）的输入 token（DeepSeek 提供；旧记录无此字段） */
  cacheHit?: number;
}

function readTokenHistory(): TokenRecord[] {
  try {
    const raw = localStorage.getItem(TOKEN_HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr)
      ? arr.filter((r): r is TokenRecord =>
          r != null && typeof (r as TokenRecord).ts === "number" &&
          typeof (r as TokenRecord).prompt === "number" &&
          typeof (r as TokenRecord).completion === "number"
        )
      : [];
  } catch {
    return [];
  }
}
function writeTokenHistory(h: TokenRecord[]): void {
  try {
    localStorage.setItem(TOKEN_HISTORY_KEY, JSON.stringify(h.slice(-MAX_TOKEN_HISTORY)));
  } catch { /* 容量异常静默 */ }
}

export interface AssistantPayload {
  explanation: string;
  commands: Command[];
  results: ExecResult[];
  /** AI 反问用户（有值时 commands 为空） */
  ask?: string;
  /** Phase 2 自检报告 */
  self_check?: string;
}

export type ChatTurn =
  | { id: string; role: "user"; content: string; attachments?: string[] }
  | {
      id: string;
      role: "assistant";
      payload: AssistantPayload;
    }
  | { id: string; role: "ask"; payload: { question: string } }
  | { id: string; role: "error"; content: string }
  | {
      id: string;
      role: "spec-review";
      payload: { spec: string; status: "pending" | "confirmed" | "rejected" };
    }
  | {
      id: string;
      role: "problem-review";
      payload: {
        problem: ProblemAnalysis;
        status: "pending" | "confirmed" | "rejected";
      };
    };

interface PersistedState {
  config: AIConfig | null;
  domain: Domain;
  privacyAcknowledged: boolean;
  /** Feature Flag: true = 工具调用代理模式, false = 两阶段流水线（默认） */
  agentMode: boolean;
  /** 模板使用频率（模板 id → 点击次数），供 TemplateGallery 排序（偏好记忆） */
  templateUsage: Record<string, number>;
}

interface AppState extends PersistedState {
  ggbApi: GGBAppletApi | null;
  ggbAppName: "classic" | "3d";
  messages: ChatTurn[];
  /**
   * 已成功执行的底层 GGB 命令日志（按轮追加）。
   * 用于修复回路全失败回滚时、快照不可用情况下的兜底重建（newConstruction + 重放）。
   */
  constructionLog: string[];
  isThinking: boolean;
  /** 会话累计 token 用量（prompt/completion，运行期不持久化，随会话清空）。
   *  cacheHit = 累计命中服务端前缀缓存（KV Cache）的输入 token */
  tokenUsage: { prompt: number; completion: number; cacheHit?: number };
  /** 本轮对话累计 token（runRound 结束入历史，不持久化） */
  roundTokenUsage: { prompt: number; completion: number; cacheHit?: number };
  /** token 用量历史（每轮对话一条，持久化，设置面板统计图消费） */
  tokenHistory: TokenRecord[];

  // ── 会话历史（多会话管理） ──
  /** 当前会话 id（IndexedDB sessionStore 的 Session.id） */
  currentSessionId: string | null;
  /** 当前会话标题（重命名 或 自动生成） */
  sessionTitle: string;
  /** 当前会话创建时间戳 */
  sessionCreatedAt: number;
  /** 会话列表索引（轻量元数据，SessionDialog 直接读） */
  sessionIndex: SessionMeta[];
  /** 跨模式切换时待恢复的画布快照（GGBCanvas appletOnLoad 时消费） */
  pendingCanvasSnapshot: string | null;
  /** 待恢复快照的目标画布模式（消费方必须模式匹配才允许 setBase64，
   *  防止 3D 快照被灌进 classic applet——2026-09 二轮整机实测：刷新后模式不恢复，
   *  classic applet 消费 3D 快照导致状态不一致/画布空） */
  pendingCanvasSnapshotMode: "classic" | "3d" | null;

  // setters
  setConfig: (c: AIConfig | null) => void;
  clearKey: () => void;
  setDomain: (d: Domain) => void;
  acknowledgePrivacy: () => void;
  setGGBApi: (api: GGBAppletApi | null) => void;
  setThinking: (b: boolean) => void;
  setAppName: (name: "classic" | "3d") => void;
  setAgentMode: (on: boolean) => void;
  recordTemplateUse: (id: string) => void;
  /** 累加一次 AI 调用的 token 用量（cacheHit = KV Cache 命中输入 token，可选） */
  addTokenUsage: (u: { prompt: number; completion: number; cacheHit?: number }) => void;
  /** 一轮对话开始：清零本轮累计 */
  startRound: () => void;
  /** 一轮对话结束：本轮累计入历史（持久化）并清零 */
  finishRound: () => void;
  /** 启动时从 localStorage 装载 token 历史 */
  loadTokenHistory: () => void;

  appendMessage: (t: ChatTurn) => void;
  clearMessages: () => void;
  undoLastTurn: () => void;
  appendAIResponse: (resp: AIResponse, results: ExecResult[]) => void;

  // ── 会话历史 action ──
  /** 启动初始化：从 localStorage 索引装载当前会话（消息入 store，快照由 GGBCanvas 恢复） */
  initSessionFromStorage: () => Promise<void>;
  /** 保存当前会话到 IndexedDB + 更新索引（轮结束 / 切换前调用） */
  persistCurrentSession: () => Promise<void>;
  /** 新建空会话：清空消息 + 画布 + 设为当前 */
  createNewSession: () => Promise<void>;
  /** 切换会话：保存当前 → 装载目标（消息 + 画布恢复） */
  switchToSession: (id: string) => Promise<void>;
  /** 删除会话（删当前则自动新建） */
  deleteSessionById: (id: string) => Promise<void>;
  /** 重命名会话 */
  renameSession: (id: string, title: string) => Promise<void>;
  /** 清空全部会话（新建一个空会话进入） */
  clearAllSessions: () => Promise<void>;
}

let _uid = 0;
const uid = () => `m-${Date.now()}-${_uid++}`;
/** 会话初始化防重（StrictMode double-invoke effect 竞态） */
let _sessionInitStarted = false;

/** 从消息历史重建构造日志（撤销后日志须与剩余轮次一致） */
function logFromMessages(msgs: ChatTurn[]): string[] {
  return msgs.flatMap(m =>
    m.role === "assistant" ? m.payload.results.filter(r => r.ok).flatMap(r => r.expanded) : []
  );
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      config: null,
      domain: "general",
      privacyAcknowledged: false,
      agentMode: false,
      templateUsage: {},
      ggbApi: null,
      ggbAppName: "classic",
      messages: [],
      constructionLog: [],
      isThinking: false,
      tokenUsage: { prompt: 0, completion: 0 },
      roundTokenUsage: { prompt: 0, completion: 0 },
      tokenHistory: [],
      currentSessionId: null,
      sessionTitle: "新会话",
      sessionCreatedAt: 0,
      sessionIndex: [],
      pendingCanvasSnapshot: null,
      pendingCanvasSnapshotMode: null,

      setConfig: c => set({ config: c }),
      clearKey: () => set({ config: null, privacyAcknowledged: false }),
      setDomain: d => set({ domain: d }),
      acknowledgePrivacy: () => set({ privacyAcknowledged: true }),
      setGGBApi: api => set({ ggbApi: api }),
      setThinking: b => set({ isThinking: b }),
      setAppName: name => set({ ggbAppName: name }),
      setAgentMode: on => set({ agentMode: on }),
      recordTemplateUse: id => set(state => ({
        templateUsage: { ...(state.templateUsage ?? {}), [id]: ((state.templateUsage ?? {})[id] ?? 0) + 1 }
      })),
      addTokenUsage: u => set(state => ({
        tokenUsage: {
          prompt: state.tokenUsage.prompt + u.prompt,
          completion: state.tokenUsage.completion + u.completion,
          cacheHit: (state.tokenUsage.cacheHit ?? 0) + (u.cacheHit ?? 0)
        },
        roundTokenUsage: {
          prompt: state.roundTokenUsage.prompt + u.prompt,
          completion: state.roundTokenUsage.completion + u.completion,
          cacheHit: (state.roundTokenUsage.cacheHit ?? 0) + (u.cacheHit ?? 0)
        }
      })),
      startRound: () => set({ roundTokenUsage: { prompt: 0, completion: 0 } }),
      finishRound: () => {
        const round = get().roundTokenUsage;
        if (round.prompt > 0 || round.completion > 0) {
          const record: TokenRecord = {
            ts: Date.now(),
            prompt: round.prompt,
            completion: round.completion,
            ...(round.cacheHit ? { cacheHit: round.cacheHit } : {})
          };
          const history = [...get().tokenHistory, record].slice(-MAX_TOKEN_HISTORY);
          writeTokenHistory(history);
          set({ tokenHistory: history, roundTokenUsage: { prompt: 0, completion: 0 } });
        }
      },
      loadTokenHistory: () => set({ tokenHistory: readTokenHistory() }),

      // ── 会话历史 actions ──
      initSessionFromStorage: async () => {
        // ★ StrictMode 会 double-invoke effect → 两次 init 并发。用模块级 flag 防重，
        //   否则两次都读到 currentSessionId=null 会重复创建默认会话。
        if (_sessionInitStarted) return;
        _sessionInitStarted = true;
        const { currentId } = readSessionIndexState();
        if (currentId) {
          const loaded = await loadSession(currentId);
          if (loaded) {
            // ★ 恢复画布模式：会话保存的 ggbAppName 必须回填（2026-09 二轮整机实测：
            //   3D 会话刷新后模式回落 classic，快照经 setBase64 把 3D 透视带进 classic
            //   applet → 顶栏/store 与画布真实模式不一致，再点模式切换会清空画布）
            const needMode: "classic" | "3d" = loaded.ggbAppName === "3d" ? "3d" : "classic";
            const modeChanged = get().ggbAppName !== needMode;
            set({
              currentSessionId: loaded.id,
              sessionTitle: loaded.title,
              sessionCreatedAt: loaded.createdAt,
              messages: loaded.messages,
              constructionLog: loaded.constructionLog,
              domain: loaded.domain,
              agentMode: loaded.agentMode,
              // 画布快照由 GGBCanvas appletOnLoad 恢复（模式门控：消费方 applet 模式必须一致）
              pendingCanvasSnapshot: loaded.canvasSnapshot ?? null,
              pendingCanvasSnapshotMode: loaded.canvasSnapshot ? needMode : null,
            });
            if (modeChanged) set({ ggbAppName: needMode }); // 触发 GGBCanvas 重建消费快照
          }
        }
        if (!get().currentSessionId) {
          // 无持久化会话 → 新建默认会话
          const id = createSessionId();
          const now = Date.now();
          await saveSession({
            id, title: "新会话", createdAt: now, updatedAt: now,
            domain: get().domain, agentMode: get().agentMode, ggbAppName: get().ggbAppName,
            messages: [], constructionLog: [], canvasSnapshot: null,
          });
          set({ currentSessionId: id, sessionTitle: "新会话", sessionCreatedAt: now, pendingCanvasSnapshot: null, pendingCanvasSnapshotMode: null });
        }
        const metas = await listSessions();
        set({ sessionIndex: metas });
        writeSessionIndexState({ currentId: get().currentSessionId, index: metas });
        // 若 applet 已就绪且模式一致则立即恢复画布快照；否则由 GGBCanvas appletOnLoad 消费。
        // ★ 本轮刚改过模式时必须跳过：此时 ggbApi 仍指向旧模式 applet，
        //   把 3D 快照灌进 classic applet 正是本次要修的状态不一致根因
        const api = get().ggbApi;
        const snap = get().pendingCanvasSnapshot;
        const snapMode = get().pendingCanvasSnapshotMode;
        const modeChanged = snapMode !== null && snapMode !== get().ggbAppName;
        if (api && snap && snapMode === get().ggbAppName) {
          await restoreSnapshot(api, snap);
          set({ pendingCanvasSnapshot: null, pendingCanvasSnapshotMode: null });
        } else if (api && snap && modeChanged) {
          console.log("[AiGGB] 会话快照等待模式重建后消费（" + snapMode + "）");
        }
      },

      persistCurrentSession: async () => {
        const st = get();
        const sessionId = st.currentSessionId;
        if (!sessionId) return;
        const snapshot = await takeSnapshot(st.ggbApi);
        // 标题：未重命名（默认"新会话"）且已有消息 → 自动从首条 user 消息生成
        let title = st.sessionTitle;
        if ((title === "新会话" || title === "") && st.messages.length > 0) {
          title = titleFromMessages(st.messages);
        }
        const session: Session = {
          id: sessionId,
          title,
          createdAt: st.sessionCreatedAt || Date.now(),
          updatedAt: Date.now(),
          domain: st.domain,
          agentMode: st.agentMode,
          ggbAppName: st.ggbAppName,
          messages: st.messages,
          constructionLog: st.constructionLog,
          canvasSnapshot: snapshot,
        };
        await saveSession(session);
        if (get().sessionTitle !== title) set({ sessionTitle: title });
        const metas = await listSessions();
        set({ sessionIndex: metas });
        writeSessionIndexState({ currentId: sessionId, index: metas });
      },

      createNewSession: async () => {
        const id = createSessionId();
        const now = Date.now();
        await saveSession({
          id, title: "新会话", createdAt: now, updatedAt: now,
          domain: get().domain, agentMode: get().agentMode, ggbAppName: get().ggbAppName,
          messages: [], constructionLog: [], canvasSnapshot: null,
        });
        set({
          currentSessionId: id, sessionTitle: "新会话", sessionCreatedAt: now,
          messages: [], constructionLog: [], pendingCanvasSnapshot: null,
          tokenUsage: { prompt: 0, completion: 0 },
        });
        get().ggbApi?.newConstruction();
        const metas = await listSessions();
        set({ sessionIndex: metas });
        writeSessionIndexState({ currentId: id, index: metas });
      },

      switchToSession: async id => {
        const st = get();
        if (st.currentSessionId === id) return;
        // 保存当前会话（含画布快照）
        await st.persistCurrentSession();
        const loaded = await loadSession(id);
        if (!loaded) return;
        const targetMode: "classic" | "3d" = loaded.ggbAppName === "3d" ? "3d" : "classic";
        set({
          currentSessionId: loaded.id,
          sessionTitle: loaded.title,
          sessionCreatedAt: loaded.createdAt,
          messages: loaded.messages,
          constructionLog: loaded.constructionLog,
          domain: loaded.domain,
          agentMode: loaded.agentMode,
          pendingCanvasSnapshot: loaded.canvasSnapshot ?? null,
          pendingCanvasSnapshotMode: loaded.canvasSnapshot ? targetMode : null,
          tokenUsage: { prompt: 0, completion: 0 },
        });
        // 画布模式：目标会话模式与当前不同 → 触发 applet 重建（appletOnLoad 恢复快照）
        if (loaded.ggbAppName !== get().ggbAppName) {
          get().setAppName(loaded.ggbAppName);
        } else {
          const api = get().ggbApi;
          // 同模式：清空 + 立即恢复（消费待恢复快照）
          if (api) {
            api.newConstruction();
            if (loaded.canvasSnapshot) {
              await restoreSnapshot(api, loaded.canvasSnapshot);
              set({ pendingCanvasSnapshot: null, pendingCanvasSnapshotMode: null });
            } else {
              replayConstructionLog(api, loaded.constructionLog);
            }
          }
        }
        const metas = await listSessions();
        set({ sessionIndex: metas });
        writeSessionIndexState({ currentId: id, index: metas });
      },

      deleteSessionById: async id => {
        await deleteSession(id);
        if (get().currentSessionId === id) {
          await get().createNewSession();
        } else {
          const metas = await listSessions();
          set({ sessionIndex: metas });
          writeSessionIndexState({ currentId: get().currentSessionId, index: metas });
        }
      },

      renameSession: async (id, title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        const loaded = await loadSession(id);
        if (loaded) {
          loaded.title = trimmed;
          loaded.updatedAt = Date.now();
          await saveSession(loaded);
        }
        if (get().currentSessionId === id) set({ sessionTitle: trimmed });
        const metas = await listSessions();
        set({ sessionIndex: metas });
        writeSessionIndexState({ currentId: get().currentSessionId, index: metas });
      },

      clearAllSessions: async () => {
        await clearAllSessionsDb();
        const id = createSessionId();
        const now = Date.now();
        await saveSession({
          id, title: "新会话", createdAt: now, updatedAt: now,
          domain: get().domain, agentMode: get().agentMode, ggbAppName: get().ggbAppName,
          messages: [], constructionLog: [], canvasSnapshot: null,
        });
        set({
          currentSessionId: id, sessionTitle: "新会话", sessionCreatedAt: now,
          messages: [], constructionLog: [], pendingCanvasSnapshot: null,
          tokenUsage: { prompt: 0, completion: 0 },
        });
        get().ggbApi?.newConstruction();
        const metas = await listSessions();
        set({ sessionIndex: metas });
        writeSessionIndexState({ currentId: id, index: metas });
      },

      appendMessage: t => set(state => ({ messages: [...state.messages, t] })),

      appendAIResponse: (resp, results) =>
        set(state => {
          if (resp.ask) {
            return {
              messages: [
                ...state.messages,
                { id: uid(), role: "ask", payload: { question: resp.ask } }
              ]
            };
          }
          const logAdd = results.filter(r => r.ok).flatMap(r => r.expanded);
          return {
            messages: [
              ...state.messages,
              {
                id: uid(),
                role: "assistant",
                payload: { explanation: resp.explanation, commands: resp.commands, results, ask: resp.ask, self_check: (resp as Record<string,unknown>).self_check as string | undefined }
              }
            ],
            constructionLog: logAdd.length > 0 ? [...state.constructionLog, ...logAdd] : state.constructionLog
          };
        }),

      clearMessages: () => set({ messages: [], constructionLog: [], tokenUsage: { prompt: 0, completion: 0 } }),

      undoLastTurn: () =>
        set(state => {
          // 删除最后一组 user + assistant
          const idxAssistant = [...state.messages].reverse().findIndex(m => m.role === "assistant");
          if (idxAssistant < 0) return state;
          const realAssistant = state.messages.length - 1 - idxAssistant;
          let start = realAssistant;
          for (let i = realAssistant - 1; i >= 0; i--) {
            if (state.messages[i].role === "user") {
              start = i;
              break;
            }
          }
          const remaining = state.messages.slice(0, start);
          return { messages: remaining, constructionLog: logFromMessages(remaining) };
        })
    }),
    {
      name: "aiggb_config",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedState => ({
        config: state.config,
        domain: state.domain,
        privacyAcknowledged: state.privacyAcknowledged,
        agentMode: state.agentMode,
        templateUsage: state.templateUsage
      }),
      // v1→v2：移除 highschool 分类，旧值回归 general
      // v2→v3：flashModel → lightModel
      // v3→v4：visionModel 为可选字段，无需迁移；版本号仅作里程碑记录
      migrate: (persisted, version) => {
        const s = (persisted ?? {}) as Record<string, unknown>;
        const out = { ...(persisted ?? {}) } as Partial<PersistedState>;
        if (version < 2 && s.domain === "highschool") {
          out.domain = "general";
        }
        if (version < 3 && out.config) {
          const cfg = out.config as unknown as Record<string, unknown>;
          if (typeof cfg.flashModel === "string" && cfg.flashModel.length > 0 && !cfg.lightModel) {
            cfg.lightModel = cfg.flashModel;
          }
        }
        // v3→v4: no-op（visionModel 可选，缺省时 resolveModel 回退 config.model）
        return out as PersistedState;
      }
    }
  )
);

// 工厂：用于在外部生成消息 id
export const newMessageId = uid;
