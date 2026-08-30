/**
 * 聊天面板 —— SPEC.md §5
 * 主流程：输入 → 思考 → 执行 → (失败自修复 ≤ 2 次)
 *
 * 编排核心已提取至 src/lib/pipeline.ts（纯 TS 状态机，可单测）；
 * 本组件只负责：输入 UI、消息渲染、store 依赖注入、规格确认事件桥接。
 *
 * 并发锁（runningRef）只在 runRound 一处获取/释放：runPipeline 返回的
 * Promise 在整个流程（含确认等待 / 降级 / 重试 / 取消）结束前不 resolve。
 */
import { useEffect, useRef, useState } from "react";
import { Send, Loader2, X, Paperclip } from "lucide-react";
import { useAppStore, newMessageId } from "../store/useAppStore";
import { AISchemaError } from "../lib/aiClient";
import { resolveModel } from "../lib/aiClient";
import { runPipeline, runAgentPipeline, runVisionPipeline, type PipelineDeps, type ReviewHandle, type ProblemHandle } from "../lib/pipeline";
import { abortCurrentRun, beginRun, endRun, wasAborted, onRunCancelled } from "../lib/runControl";
import type { ConfirmationRequest, ConfirmationDecision } from "../lib/agentLoop";
import type { ProblemAnalysis } from "../lib/problemSchema";
import { validateImageFile, fileToDataUrl, MAX_IMAGES } from "../lib/imageInput";
import { MessageBubble } from "./MessageBubble";

export function ChatPanel() {
  const [input, setInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ★ 并发守卫：一轮 runRound 未结束前忽略新的 send/模板触发
  const runningRef = useRef<boolean>(false);
  // ★ 始终指向最新的 send（避免 effect 注册时的 stale closure）
  const sendRef = useRef<(text: string) => void>(() => {});
  // ★ 当前轮的规格确认句柄：spec-review 气泡事件通过此句柄回传决定
  const reviewHandleRef = useRef<ReviewHandle | null>(null);
  // ★ 当前轮的题目确认句柄：problem-review 气泡事件通过此句柄回传决定
  const problemHandleRef = useRef<ProblemHandle | null>(null);

  const config = useAppStore(s => s.config);
  const domain = useAppStore(s => s.domain);
  const agentMode = useAppStore(s => s.agentMode);
  const messages = useAppStore(s => s.messages);
  const ggbApi = useAppStore(s => s.ggbApi);
  const setThinking = useAppStore(s => s.setThinking);
  const isThinking = useAppStore(s => s.isThinking);
  const appendMessage = useAppStore(s => s.appendMessage);
  const clearMessages = useAppStore(s => s.clearMessages);

  // Agent mode: confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    requests: ConfirmationRequest[];
    resolve: (decisions: ConfirmationDecision[]) => void;
  } | null>(null);

  // Agent mode: 实时思考步骤 / 流式文本展示（减少等待焦虑）
  const [agentStep, setAgentStep] = useState("");
  const agentStepRef = useRef("");
  const lastStepFlushRef = useRef(0);

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

  // 规格确认气泡事件 → 当前轮 handle（handle 每轮新建，ref 始终指向最新，无 stale 问题）
  useEffect(() => {
    const onConfirm = (e: Event) => {
      reviewHandleRef.current?.confirm((e as CustomEvent<string>).detail);
    };
    const onRetry = () => reviewHandleRef.current?.retry();
    window.addEventListener("aiggb:spec-confirm", onConfirm);
    window.addEventListener("aiggb:spec-retry", onRetry);
    return () => {
      window.removeEventListener("aiggb:spec-confirm", onConfirm);
      window.removeEventListener("aiggb:spec-retry", onRetry);
    };
  }, []);

  // 题目确认气泡事件 → 当前轮 handle
  useEffect(() => {
    const onProblemConfirm = (e: Event) => {
      problemHandleRef.current?.confirm((e as CustomEvent<ProblemAnalysis>).detail);
    };
    const onProblemRetry = () => problemHandleRef.current?.retry();
    window.addEventListener("aiggb:problem-confirm", onProblemConfirm);
    window.addEventListener("aiggb:problem-retry", onProblemRetry);
    return () => {
      window.removeEventListener("aiggb:problem-confirm", onProblemConfirm);
      window.removeEventListener("aiggb:problem-retry", onProblemRetry);
    };
  }, []);

  // ★ 取消/组件卸载时清理 confirmDialog，避免 Promise 悬挂
  useEffect(() => {
    const unsub = onRunCancelled(() => {
      setConfirmDialog(d => {
        if (d) {
          // 全部拒绝以释放 agent loop 等待
          d.resolve(d.requests.map(r => ({ action: "deny" as const, toolCallId: r.toolCallId })));
        }
        return null;
      });
    });
    return () => {
      unsub();
      // 卸载时也清理
      setConfirmDialog(d => {
        if (d) {
          d.resolve(d.requests.map(r => ({ action: "deny" as const, toolCallId: r.toolCallId })));
        }
        return null;
      });
    };
  }, []);

  /** 节流式更新 agent 步骤文本：流式 chunk 高频到来时限制 re-render 频率 */
  const pushAgentStep = (text: string) => {
    agentStepRef.current = text;
    const now = Date.now();
    if (now - lastStepFlushRef.current >= 120) {
      lastStepFlushRef.current = now;
      setAgentStep(text);
    }
  };

  const canSend = !!config?.apiKey && !!ggbApi && !isThinking && !runningRef.current && (input.trim().length > 0 || images.length > 0);

  const send = (text: string, imgs: string[] = []) => {
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

    appendMessage({
      id: newMessageId(),
      role: "user",
      content: text,
      attachments: imgs.length ? imgs : undefined
    });

    void runRound(text, imgs);
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

  // ★★ runRound：并发锁 + store 依赖注入 → pipeline ★★
  const runRound = async (userText: string, _imgs: string[] = []) => {
    if (runningRef.current) return;
    runningRef.current = true;
    setThinking(true);
    // ★ token 统计：一轮对话开始，清零本轮累计
    useAppStore.getState().startRound();
    const signal = beginRun();
    try {
      const appMode: "2d" | "3d" = useAppStore.getState().ggbAppName === "3d" ? "3d" : "2d";
      const deps: PipelineDeps = {
        config: config!,
        domain,
        appMode,
        signal,
        getApi: () => useAppStore.getState().ggbApi,
        getMessages: () => useAppStore.getState().messages,
        getConstructionLog: () => useAppStore.getState().constructionLog,
        appendMessage: m => useAppStore.getState().appendMessage(m),
        appendAIResponse: (r, res) => useAppStore.getState().appendAIResponse(r, res),
        updateSpecReview: (id, spec, status) =>
          useAppStore.setState(s => ({
            messages: s.messages.map(m =>
              m.role === "spec-review" && m.id === id ? { ...m, payload: { spec, status } } : m
            )
          })),
        removeMessage: id =>
          useAppStore.setState(s => ({ messages: s.messages.filter(m => m.id !== id) })),
        setThinking,
        newMessageId,
        heavyModel: resolveModel(config!, "heavy"),
        lightModel: resolveModel(config!, "light"),
        visionModel: resolveModel(config!, "vision"),
        onTokenUsage: u => useAppStore.getState().addTokenUsage(u),
        updateProblemReview: (id, problem, status) =>
          useAppStore.setState(s => ({
            messages: s.messages.map(m =>
              m.role === "problem-review" && m.id === id ? { ...m, payload: { problem, status } } : m
            )
          })),
      };
      // ★ 路由：带图 → 视觉识别管线；否则按模式开关
      const sharedCallbacks = {
        onReview: (handle: ReviewHandle) => {
          reviewHandleRef.current = handle;
        },
        onConfirm: async (requests: ConfirmationRequest[]) => {
          return new Promise<ConfirmationDecision[]>(resolve => {
            setConfirmDialog({ requests, resolve });
          });
        },
        onAgentStep: pushAgentStep,
        onProblemReview: (handle: ProblemHandle) => {
          problemHandleRef.current = handle;
        },
      };

      if (_imgs.length > 0) {
        await runVisionPipeline({ text: userText, images: _imgs }, deps, sharedCallbacks);
      } else if (useAppStore.getState().agentMode) {
        await runAgentPipeline(userText, deps, sharedCallbacks);
      } else {
        await runPipeline(userText, deps, sharedCallbacks);
      }
    } catch (err) {
      if (!wasAborted()) {
        appendMessage({ id: newMessageId(), role: "error", content: describeError(err) });
      }
    } finally {
      reviewHandleRef.current = null;
      problemHandleRef.current = null;
      endRun();
      runningRef.current = false;
      setThinking(false);
      setAgentStep(""); // 重置 Agent 步骤
      agentStepRef.current = "";
      // ★ token 统计：一轮对话结束，本轮累计入历史（持久化）
      useAppStore.getState().finishRound();
      // ★ 轮结束落盘：保存当前会话（消息 + 画布快照）到 IndexedDB。
      //    fire-and-forget 不阻塞 UI；任何路径（两阶段/agent/异常/中止）都会经过这里。
      void useAppStore.getState().persistCurrentSession();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (canSend) {
        send(input.trim(), images);
        setInput("");
        setImages([]);
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
        {/* Agent mode: dangerous tool confirmation dialog */}
        {confirmDialog && (
          <div className="confirm-overlay">
            <div className="confirm-dialog">
              <h4>⚠ 工具调用确认</h4>
              <p className="confirm-hint">AI 请求执行以下操作。部分操作可能修改画布：</p>
              <ul className="confirm-list">
                {confirmDialog.requests.map((req, i) => (
                  <li key={i}>
                    <code>{req.toolName}</code>
                    <span>{req.description}</span>
                  </li>
                ))}
              </ul>
              <div className="confirm-actions">
                <button
                  className="confirm-deny"
                  onClick={() => {
                    const decisions = confirmDialog.requests.map(r => ({
                      action: "deny" as const, toolCallId: r.toolCallId
                    }));
                    confirmDialog.resolve(decisions);
                    setConfirmDialog(null);
                  }}
                >
                  全部拒绝
                </button>
                <button
                  className="confirm-approve"
                  onClick={() => {
                    const decisions = confirmDialog.requests.map(r => ({
                      action: "approve" as const, toolCallId: r.toolCallId
                    }));
                    confirmDialog.resolve(decisions);
                    setConfirmDialog(null);
                  }}
                >
                  全部允许
                </button>
                <button
                  className="confirm-trust"
                  onClick={() => {
                    const decisions: ConfirmationDecision[] = [
                      { action: "approve_all" },
                      ...confirmDialog.requests.slice(1).map(r => ({
                        action: "approve" as const, toolCallId: r.toolCallId
                      }))
                    ];
                    confirmDialog.resolve(decisions);
                    setConfirmDialog(null);
                  }}
                >
                  信任此会话（后续自动批准）
                </button>
              </div>
            </div>
          </div>
        )}
        {isThinking && (
          <div className="thinking">
            <Loader2 size={14} className="spin" />
            {agentMode
              ? (agentStep
                  ? <span className="thinking-text">{agentStep.length > 120 ? agentStep.slice(0, 120) + "…" : agentStep}</span>
                  : <span>Agent 构造中…（可观察右侧脚本面板）</span>)
              : <span>AI 思考中…</span>}
            <button
              className="thinking-cancel"
              onClick={() => abortCurrentRun()}
              title="取消本次请求"
            >
              <X size={12} /> 取消
            </button>
          </div>
        )}
      </div>

      <div
        className="chat-input-area"
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dragover"); }}
        onDragLeave={e => { e.currentTarget.classList.remove("dragover"); }}
        onDrop={async e => {
          e.preventDefault();
          e.currentTarget.classList.remove("dragover");
          const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
          if (!files.length) return;
          const remaining = MAX_IMAGES - images.length;
          if (remaining <= 0) {
            appendMessage({ id: newMessageId(), role: "error", content: `最多附加 ${MAX_IMAGES} 张图片` });
            return;
          }
          for (const file of files.slice(0, remaining)) {
            const err = validateImageFile(file);
            if (err) { appendMessage({ id: newMessageId(), role: "error", content: err }); continue; }
            try {
              const url = await fileToDataUrl(file);
              setImages(prev => [...prev, url]);
            } catch (e2) {
              appendMessage({ id: newMessageId(), role: "error", content: e2 instanceof Error ? e2.message : "图片处理失败" });
            }
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={async e => {
            const files = Array.from(e.target.files ?? []);
            const remaining = MAX_IMAGES - images.length;
            if (remaining <= 0) {
              appendMessage({ id: newMessageId(), role: "error", content: `最多附加 ${MAX_IMAGES} 张图片` });
              e.target.value = "";
              return;
            }
            for (const file of files.slice(0, remaining)) {
              const err = validateImageFile(file);
              if (err) { appendMessage({ id: newMessageId(), role: "error", content: err }); continue; }
              try {
                const url = await fileToDataUrl(file);
                setImages(prev => [...prev, url]);
              } catch (e2) {
                appendMessage({ id: newMessageId(), role: "error", content: e2 instanceof Error ? e2.message : "图片处理失败" });
              }
            }
            e.target.value = "";
          }}
        />
        <button
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          title={`附加图片（最多 ${MAX_IMAGES} 张）`}
          disabled={!config?.apiKey || runningRef.current}
        >
          <Paperclip size={16} />
        </button>
        <div className="input-stack">
          {images.length > 0 && (
            <div className="attach-strip">
              {images.map((url, i) => (
                <div key={i} className="attach-thumb">
                  <img src={url} alt={`预览 ${i + 1}`} />
                  <button
                    className="attach-thumb-remove"
                    onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                    aria-label="移除"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={async e => {
              const items = e.clipboardData?.items;
              if (!items) return;
              const imageItems = Array.from(items).filter(it => it.type.startsWith("image/"));
              if (!imageItems.length) return;
              e.preventDefault();
              const remaining = MAX_IMAGES - images.length;
              if (remaining <= 0) {
                appendMessage({ id: newMessageId(), role: "error", content: `最多附加 ${MAX_IMAGES} 张图片` });
                return;
              }
              for (const item of imageItems.slice(0, remaining)) {
                const file = item.getAsFile();
                if (!file) continue;
                const err = validateImageFile(file);
                if (err) { appendMessage({ id: newMessageId(), role: "error", content: err }); continue; }
                try {
                  const url = await fileToDataUrl(file);
                  setImages(prev => [...prev, url]);
                } catch (e2) {
                  appendMessage({ id: newMessageId(), role: "error", content: e2 instanceof Error ? e2.message : "图片处理失败" });
                }
              }
            }}
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
        </div>
        <button
          className="send-btn"
          disabled={!canSend}
          onClick={() => {
            if (canSend) {
              send(input.trim(), images);
              setInput("");
              setImages([]);
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
