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
  | { id: string; role: "user"; content: string }
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
    };

interface PersistedState {
  config: AIConfig | null;
  domain: Domain;
  privacyAcknowledged: boolean;
  /** Feature Flag: true = 工具调用代理模式, false = 两阶段流水线（默认） */
  agentMode: boolean;
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

  // setters
  setConfig: (c: AIConfig | null) => void;
  clearKey: () => void;
  setDomain: (d: Domain) => void;
  acknowledgePrivacy: () => void;
  setGGBApi: (api: GGBAppletApi | null) => void;
  setThinking: (b: boolean) => void;
  setAppName: (name: "classic" | "3d") => void;
  setAgentMode: (on: boolean) => void;

  appendMessage: (t: ChatTurn) => void;
  clearMessages: () => void;
  undoLastTurn: () => void;
  appendAIResponse: (resp: AIResponse, results: ExecResult[]) => void;
}

let _uid = 0;
const uid = () => `m-${Date.now()}-${_uid++}`;

/** 从消息历史重建构造日志（撤销后日志须与剩余轮次一致） */
function logFromMessages(msgs: ChatTurn[]): string[] {
  return msgs.flatMap(m =>
    m.role === "assistant" ? m.payload.results.filter(r => r.ok).flatMap(r => r.expanded) : []
  );
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      config: null,
      domain: "general",
      privacyAcknowledged: false,
      agentMode: false,
      ggbApi: null,
      ggbAppName: "classic",
      messages: [],
      constructionLog: [],
      isThinking: false,

      setConfig: c => set({ config: c }),
      clearKey: () => set({ config: null, privacyAcknowledged: false }),
      setDomain: d => set({ domain: d }),
      acknowledgePrivacy: () => set({ privacyAcknowledged: true }),
      setGGBApi: api => set({ ggbApi: api }),
      setThinking: b => set({ isThinking: b }),
      setAppName: name => set({ ggbAppName: name }),
      setAgentMode: on => set({ agentMode: on }),

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

      clearMessages: () => set({ messages: [], constructionLog: [] }),

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
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedState => ({
        config: state.config,
        domain: state.domain,
        privacyAcknowledged: state.privacyAcknowledged,
        agentMode: state.agentMode
      }),
      // v1→v2：移除 highschool 分类，旧值回归 general
      // v2→v3：flashModel → lightModel
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
        return out as PersistedState;
      }
    }
  )
);

// 工厂：用于在外部生成消息 id
export const newMessageId = uid;
