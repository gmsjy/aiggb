/**
 * 聊天面板 —— SPEC.md §5
 * 主流程：输入 → 思考 → 执行 → (失败自修复 ≤ 2 次)
 *
 * 两阶段流水线：
 *   Phase 1（flash 精炼）→ 规格确认气泡 → Phase 2（编译）→ executeAndRepair
 * 并发锁（runningRef）只在 runRound 一处获取/释放：runTwoPhase 返回的 Promise
 * 在整个流程（含 doPhase2 / 降级 / 重试 / 取消）结束前不 resolve。
 */
import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useAppStore, newMessageId } from "../store/useAppStore";
import { chat, AIError, AISchemaError, chatRaw, type ChatMessage } from "../lib/aiClient";
import { collectFailures, executeCommands } from "../lib/ggbBridge";
import { buildSystemPrompt, buildCompilePrompt, buildFormatRepairMessage, buildCheckerPrompt } from "../lib/prompts";
import { buildRefinePrompt } from "../lib/refinePrompt";
import { batchCorrect, correctionsToRepairContext } from "../lib/commandCorrect";
import { RefinedSpec, type RefinedSpec as RefinedSpecT } from "../lib/specSchema";
import { lookupCachedSpec, storeCachedSpec } from "../lib/specCache";
import type { AIResponse } from "../lib/schema";
import type { GGBAppletApi } from "../types/ggb";
import { MessageBubble } from "./MessageBubble";
import { beginRun, endRun, onRunCancelled, wasAborted } from "../lib/runControl";

const MAX_REPAIR = 2;
const MAX_FORMAT_RETRY = 2;
const HISTORY_WINDOW = 6; // 最近 N 轮发给 AI

export function ChatPanel() {
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  // ★ 并发守卫：一轮 runRound 未结束前忽略新的 send/模板触发
  const runningRef = useRef<boolean>(false);
  // ★ 始终指向最新的 send（避免 effect 注册时的 stale closure）
  const sendRef = useRef<(text: string) => void>(() => {});

  const config = useAppStore(s => s.config);
  const domain = useAppStore(s => s.domain);
  const messages = useAppStore(s => s.messages);
  const ggbApi = useAppStore(s => s.ggbApi);
  const setThinking = useAppStore(s => s.setThinking);
  const isThinking = useAppStore(s => s.isThinking);
  const appendMessage = useAppStore(s => s.appendMessage);
  const clearMessages = useAppStore(s => s.clearMessages);

  // 自动滚到底部
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  // 监听模板库发来的 prompt
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (typeof ce.detail !== "string" || !ce.detail.trim()) return;
      // ★ 先校验 Key / 并发，再清空画布——避免无 Key 时先清掉历史再报错
      if (!useAppStore.getState().config?.apiKey) {
        appendMessage({ id: newMessageId(), role: "error", content: "请先在设置中填入 API Key" });
        return;
      }
      if (runningRef.current) {
        appendMessage({ id: newMessageId(), role: "error", content: "上一条命令仍在执行，请稍候" });
        return;
      }
      // 模板触发的：先清空画布 + 聊天记录，避免新旧构造混乱
      useAppStore.getState().ggbApi?.newConstruction();
      clearMessages();
      // ★ 用 ref 调用最新 send，避免 effect 注册时的 stale closure
      sendRef.current(ce.detail.trim());
    };
    window.addEventListener("aiggb:send", handler);
    return () => window.removeEventListener("aiggb:send", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.apiKey, ggbApi]);

  const canSend = !!config?.apiKey && !!ggbApi && !isThinking && !runningRef.current && input.trim().length > 0;

  const send = (text: string) => {
    if (!config?.apiKey) {
      appendMessage({ id: newMessageId(), role: "error", content: "请先在设置中填入 API Key" });
      return;
    }
    if (!ggbApi) {
      appendMessage({ id: newMessageId(), role: "error", content: "GeoGebra 画布尚未就绪，请稍候" });
      return;
    }
    // ★ 并发守卫：一轮未结束前忽略新发送，避免多轮交错执行
    if (runningRef.current) {
      appendMessage({ id: newMessageId(), role: "error", content: "上一条命令仍在执行，请稍候" });
      return;
    }

    appendMessage({ id: newMessageId(), role: "user", content: text });

    void runRound(text);
  };
  // ★ 必须在 send 声明之后赋值（TDZ：声明前访问 const 会抛 ReferenceError）
  sendRef.current = send;

  /** 把异常转成用户可见的错误文案 */
  const describeError = (err: unknown): string => {
    const prefix = err instanceof AISchemaError
      ? "AI 返回格式异常（多次重试后仍失败）"
      : "AI 调用失败";
    const msg = err instanceof Error ? err.message : String(err);
    return `${prefix}：${msg}`;
  };

  /** 保存当前画布为 base64 快照（带超时兜底，防止 getBase64 回调不触发导致 runRound 挂死） */
  const takeSnapshot = (api: GGBAppletApi | null): Promise<string | null> =>
    new Promise(resolve => {
      if (!api) return resolve(null);
      let settled = false;
      const done = (v: string | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(v);
      };
      const timer = setTimeout(() => done(null), 3000); // 超时 3s 放弃快照
      try {
        // getBase64 可能是同步返回字符串 或 异步回调，兼容两种
        const sync = api.getBase64(d => done(d ?? null));
        if (typeof sync === "string" && sync.length > 0) done(sync);
      } catch {
        done(null);
      }
    });

  /** 从 base64 快照恢复画布（带超时兜底） */
  const restoreSnapshot = (api: GGBAppletApi | null, snapshot: string): Promise<void> =>
    new Promise(resolve => {
      if (!api) return resolve();
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(done, 3000);
      try {
        api.setBase64(snapshot, done);
      } catch {
        done();
      }
    });

  /** 回滚后重放上一轮之前的成功命令 */
  const replayPriorCommands = (api: GGBAppletApi | null) => {
    if (!api) return;
    const all = useAppStore.getState().messages;
    for (const m of all) {
      if (m.role === "assistant") {
        for (const r of m.payload.results) {
          if (r.ok && r.expanded.length > 0) {
            // 重放构造型命令（赋值 / 函数定义，如 "P = ..."、"Ex(x,y) = ..."）
            for (const cmd of r.expanded) {
              if (/^[\w]+\s*(?:\([^)]*\))?\s*=/.test(cmd)) {
                api.evalCommand(cmd);
              }
            }
          }
        }
      }
    }
  };

  /** 调用 chat；遇到 AISchemaError 则把原始输出与 detail 反馈给 AI 重试，最多 MAX_FORMAT_RETRY 次 */
  const chatWithFormatRetry = async (
    msgs: ChatMessage[],
    notify: (msg: string) => void,
    signal?: AbortSignal
  ) => {
    let conv: ChatMessage[] = msgs;
    for (let i = 0; i <= MAX_FORMAT_RETRY; i++) {
      try {
        return await chat(config!, conv, signal);
      } catch (err) {
        if (err instanceof AISchemaError && i < MAX_FORMAT_RETRY) {
          // 给用户一个可见提示，告诉它正在自动重试
          notify(`AI 返回格式异常（${err.message}：${err.detail}），正在自动重试 ${i + 1}/${MAX_FORMAT_RETRY}…`);
          conv = [
            ...conv,
            { role: "assistant", content: err.raw },
            { role: "user", content: buildFormatRepairMessage(err.raw, err.detail) }
          ];
          continue;
        }
        throw err;
      }
    }
    throw new AIError("AI 多次返回格式错误，已放弃");
  };

  /**
   * 执行 + RAG 纠正 + 失败自修复（两阶段与单阶段共用）
   * 负责把 AI 输出转换为画布命令并保证执行成功；失败走 checker 修复回路（≤ MAX_REPAIR 次）。
   */
  const executeAndRepair = async (response: AIResponse, originalRequest: string, signal?: AbortSignal) => {
    // —— [ASK] 反问：AI 需要用户澄清，不执行命令 ——
    if (response.ask) {
      useAppStore.getState().appendAIResponse(response, []);
      return;
    }

    // ★ 实时从 store 取 api：3D 切换后旧的 ggbApi 闭包已过期，
    //   必须用最新的 applet 才能让命令真正作用到 3D 画布上
    const api = useAppStore.getState().ggbApi;
    if (!api) {
      appendMessage({ id: newMessageId(), role: "error", content: "GeoGebra 画布尚未就绪，请稍候" });
      return;
    }

    // ★ RAG 纠正：对 AI 输出的 eval 命令做模糊匹配修正（臆造/笔误 → 正确命令）
    const correction = batchCorrect(response.commands.filter(c => c.op === "eval").map(c => ({ cmd: (c as { cmd: string }).cmd })));
    if (correction.anyChanged) {
      let evalIdx = 0;
      for (const c of response.commands) {
        if (c.op === "eval") {
          const corrected = correction.results[evalIdx++];
          if (corrected?.changed) {
            (c as { cmd: string }).cmd = corrected.corrected;
          }
        }
      }
    }

    // ★ 快照：执行前保存画布状态，用于失败回滚
    const snapshot = await takeSnapshot(api);

    let results = executeCommands(api, response.commands);
    useAppStore.getState().appendAIResponse(response, results);

    // ★ 若 RAG 纠正了命令，将纠正信息注入修复上下文以供后续修复参考
    let ragRepairNote: string | null = null;
    if (correction.anyChanged || correction.results.some(r => r.suggestions.length > 0)) {
      ragRepairNote = correctionsToRepairContext(correction);
    }

    // —— 失败自修复（命令执行失败） ——
    let attempts = 0;
    while (attempts < MAX_REPAIR) {
      const failures = collectFailures(results);
      if (failures.length === 0) break;
      attempts++;

      // 全部失败且是首次修复 → 回滚到快照，避免半成功状态污染
      if (attempts === 1 && failures.length === results.length && snapshot) {
        await restoreSnapshot(api, snapshot);
        // 回滚后重放已成功的历史命令，仅保留干净的状态
        replayPriorCommands(api);
      }

      // 修复循环中也要实时取最新 api
      const curApi = useAppStore.getState().ggbApi ?? api;
      const existingObjs = curApi?.getAllObjectNames() ?? [];

      // ★ 核对检查角色：用独立的 checker prompt（专注修复，不重新生成）
      const checkerSystem = buildCheckerPrompt(failures, existingObjs, originalRequest);
      // ★ 注入 RAG 纠正信息到修复消息（提示 AI 哪些命令已被纠正、哪些需要避免）
      let repairUserMsg = JSON.stringify(response);
      if (ragRepairNote) {
        repairUserMsg = ragRepairNote + "\n\n" + repairUserMsg;
      }
      response = await chatWithFormatRetry(
        [
          { role: "system", content: checkerSystem },
          { role: "assistant", content: repairUserMsg }
        ],
        msg => appendMessage({ id: newMessageId(), role: "error", content: msg }),
        signal
      );
      if (response.ask) {
        useAppStore.getState().appendAIResponse(response, []);
        return;
      }
      // ★ RAG 纠正：修复后的响应也做模糊匹配修正
      const repairCorrection = batchCorrect(response.commands.filter(c => c.op === "eval").map(c => ({ cmd: (c as { cmd: string }).cmd })));
      if (repairCorrection.anyChanged) {
        let ei = 0;
        for (const c of response.commands) {
          if (c.op === "eval") {
            const r = repairCorrection.results[ei++];
            if (r?.changed) { (c as { cmd: string }).cmd = r.corrected; }
          }
        }
        ragRepairNote = correctionsToRepairContext(repairCorrection);
      }
      results = executeCommands(useAppStore.getState().ggbApi ?? api, response.commands);
      useAppStore.getState().appendAIResponse(response, results);
    }
  };

  // ── 单阶段降级路径（Phase 1 失败 / 规格无效时回退）──
  const runSinglePhase = async (userText: string, signal?: AbortSignal) => {
    setThinking(true);
    try {
      // ★ 由 Toolbar 手动切换 2D/3D，不由 AI 判定。
      //   从 store 取当前画布模式（"classic"→2d, "3d"→3d），传给 prompt。
      const appMode: "2d" | "3d" = useAppStore.getState().ggbAppName === "3d" ? "3d" : "2d";
      const systemPrompt = buildSystemPrompt(domain, appMode);
      const history = collectHistory(messages, HISTORY_WINDOW);
      const baseMessages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userText }
      ];

      const response = await chatWithFormatRetry(baseMessages, msg =>
        appendMessage({ id: newMessageId(), role: "error", content: msg })
      , signal);

      await executeAndRepair(response, userText, signal);
    } catch (err) {
      if (!wasAborted()) {
        appendMessage({ id: newMessageId(), role: "error", content: describeError(err) });
      }
    }
  };

  // ── 两阶段主流程 ──
  // 返回的 Promise 在整个流程（Phase1 → 确认 → Phase2 → 修复）结束前不 resolve；
  // 并发锁由 runRound 统一获取/释放，这里只负责「何时完成」。
  const runTwoPhase = (userText: string, appMode: "2d" | "3d", signal?: AbortSignal): Promise<void> =>
    new Promise<void>(resolve => {
      const phase1 = async () => {
        try {
          const existingObjs = useAppStore.getState().ggbApi?.getAllObjectNames() ?? [];

          // ★ Phase 1：意图 → 精炼规格（缓存优先）
          let spec = lookupCachedSpec(userText, domain, appMode, existingObjs);
          if (!spec) {
            const refinePrompt = buildRefinePrompt(domain);
            const phase1Messages: ChatMessage[] = [
              { role: "system", content: refinePrompt },
              { role: "user", content: userText }
            ];
            try {
              const flashModel = config?.flashModel;
              const rawSpec = await chatRaw(config!, phase1Messages, signal, flashModel);
              spec = parseRefinedSpec(rawSpec);
              if (spec && !spec.ask) {
                storeCachedSpec(userText, domain, appMode, existingObjs, spec);
              }
            } catch (err) {
              if (wasAborted()) { resolve(); return; }
              console.warn("[TwoPhase] Phase 1 failed, falling back to single-phase", err);
              await runSinglePhase(userText, signal);
              resolve();
              return;
            }
          }

          // ★ 规格无效 → 降级
          if (!spec?.spec) {
            console.warn("[TwoPhase] empty spec, falling back to single-phase");
            await runSinglePhase(userText, signal);
            resolve();
            return;
          }

          // ★ 反问？直接展示
          if (spec.ask) {
            useAppStore.getState().appendAIResponse(
              { explanation: "需要确认", commands: [], ask: spec.ask },
              []
            );
            resolve();
            return;
          }

          // ★ 清除思考状态，展示规格确认气泡，等待用户审阅（并发锁保持占用）
          setThinking(false);
          const reviewId = newMessageId();
          appendMessage({ id: reviewId, role: "spec-review", payload: { spec: spec.spec, status: "pending" } });

          let phase2Guard = false; // 防快速双击触发并发 Phase 2
          let finished = false;
          const finish = () => {
            if (finished) return;
            finished = true;
            cleanup();
            resolve();
          };
          const cleanup = () => {
            window.removeEventListener("aiggb:spec-confirm", onConfirm);
            window.removeEventListener("aiggb:spec-retry", onRetry);
            unsubscribeCancel();
          };

          // ★ 取消（清空/切模式）时同步结束等待，释放并发锁，避免锁悬挂
          const unsubscribeCancel = onRunCancelled(finish);

          const doPhase2 = async (finalSpec: string) => {
            if (phase2Guard) return;
            phase2Guard = true;
            setThinking(true);
            try {
              // 标记为已确认（原地更新气泡状态，而非追加同 id 消息，避免 React key 冲突）
              useAppStore.setState(s => ({
                messages: s.messages.map(m =>
                  m.role === "spec-review" && m.id === reviewId
                    ? { ...m, payload: { spec: finalSpec, status: "confirmed" as const } }
                    : m
                )
              }));

              const compilePrompt = buildCompilePrompt(domain, appMode);
              const history = collectHistory(messages, Math.ceil(HISTORY_WINDOW / 2));
              const phase2Messages: ChatMessage[] = [
                { role: "system", content: compilePrompt },
                ...history,
                { role: "user", content: finalSpec }
              ];

              const response = await chatWithFormatRetry(phase2Messages, msg =>
                appendMessage({ id: newMessageId(), role: "error", content: msg })
              , signal);

              await executeAndRepair(response, finalSpec, signal);
            } catch (err) {
              if (!wasAborted()) {
                appendMessage({ id: newMessageId(), role: "error", content: describeError(err) });
              }
            } finally {
              setThinking(false);
              finish();
            }
          };

          const onConfirm = (e: Event) => {
            const finalSpec = (e as CustomEvent<string>).detail;
            void doPhase2(finalSpec);
          };
          const onRetry = () => {
            // 移除旧确认气泡（避免重复），然后重新执行 Phase 1
            useAppStore.setState(s => ({
              messages: s.messages.filter(m => m.id !== reviewId)
            }));
            setThinking(true);
            cleanup();
            runTwoPhase(userText, appMode, signal)
              .then(resolve)
              .catch(() => resolve());
          };

          window.addEventListener("aiggb:spec-confirm", onConfirm, { once: true });
          window.addEventListener("aiggb:spec-retry", onRetry, { once: true });
        } catch (err) {
          if (!wasAborted()) {
            appendMessage({ id: newMessageId(), role: "error", content: describeError(err) });
          }
          resolve();
        }
      };
      void phase1();
    });

  // ★★ runRound 路由（两阶段为主，Phase 1 失败自动降级单阶段）★★
  const runRound = async (userText: string) => {
    if (runningRef.current) return;
    runningRef.current = true;
    setThinking(true);
    const signal = beginRun();
    try {
      const appMode: "2d" | "3d" = useAppStore.getState().ggbAppName === "3d" ? "3d" : "2d";
      // runTwoPhase 直到整个流程结束才 resolve，锁在此 finally 统一释放
      await runTwoPhase(userText, appMode, signal);
    } catch (err) {
      if (!wasAborted()) {
        appendMessage({ id: newMessageId(), role: "error", content: describeError(err) });
      }
    } finally {
      endRun();
      runningRef.current = false;
      setThinking(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (canSend) {
        send(input.trim());
        setInput("");
      }
    }
  };

  return (
    <section className="chat-panel">
      <div className="chat-messages" ref={listRef}>
        {messages.length === 0 && (
          <div className="empty-hint">
            <h3>{domain === "physics" ? "物理模式 · 开始动态模拟" : "数学模式 · 开始几何构造"}</h3>
            {domain === "physics" ? (
              <>
                <p>试试：<em>「斜抛运动，v0=20 m/s，仰角 45°」</em></p>
                <p className="muted">支持矢量箭头、受力分析、电场线、单摆、弹簧振子…</p>
              </>
            ) : (
              <>
                <p>试试：<em>「过三点 (0,0) (3,0) (1,2) 画外接圆」</em></p>
                <p className="muted">支持几何构造、函数、圆锥曲线、参数曲线、3D 几何体…</p>
              </>
            )}
            <p className="muted">或点击右上方「模板」一键加载场景。Ctrl+Enter 发送。</p>
          </div>
        )}
        {messages.map(m => (
          <MessageBubble key={m.id} turn={m} />
        ))}
        {isThinking && (
          <div className="thinking">
            <Loader2 size={14} className="spin" /> AI 思考中…
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            !config?.apiKey
              ? "请先在右上角『设置』中配置 API Key…"
              : domain === "physics"
              ? "描述物理场景：如 斜抛 v0=20 仰角 45° / 单摆 L=1 θ0=π/6 …  (Ctrl+Enter 发送)"
              : "描述数学图形：如 外接圆 / sin(kx) / 摆线 / 椭圆 a=3 b=2 / 正方体截面 …  (Ctrl+Enter 发送)"
          }
          rows={3}
          disabled={!config?.apiKey}
        />
        <button
          className="send-btn"
          disabled={!canSend}
          onClick={() => {
            if (canSend) {
              send(input.trim());
              setInput("");
            }
          }}
          title="Ctrl+Enter 发送"
        >
          <Send size={16} />
        </button>
      </div>
    </section>
  );
}

/** 解析 Phase 1 的纯文本输出为 RefinedSpec（code fence 剥离 + JSON 容错） */
function parseRefinedSpec(raw: string): RefinedSpecT | null {
  const cleaned = raw.trim()
    .replace(/^```json?\s*/, "").replace(/\s*```$/, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { spec: cleaned.slice(0, 3000) };
  }
  const result = RefinedSpec.safeParse(parsed);
  return result.success ? result.data : { spec: cleaned.slice(0, 3000) };
}

function collectHistory(
  messages: ReturnType<typeof useAppStore.getState>["messages"],
  windowSize: number
): ChatMessage[] {
  // 把历史折叠成 user / assistant，仅保留最近 windowSize 轮，避免上下文爆炸
  const collapsed: ChatMessage[] = [];
  for (const m of messages) {
    if (m.role === "user") collapsed.push({ role: "user", content: m.content });
    else if (m.role === "assistant") {
      const payload: Record<string, unknown> = {
        explanation: m.payload.explanation,
        commands: m.payload.commands
      };
      if (m.payload.self_check) payload.self_check = m.payload.self_check;
      collapsed.push({ role: "assistant", content: JSON.stringify(payload) });
    }
  }
  // 取最后 2*windowSize 条消息（user+assistant 配对）
  return collapsed.slice(-windowSize * 2);
}
