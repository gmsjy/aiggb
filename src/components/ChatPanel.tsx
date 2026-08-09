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
import { Send, Loader2, X } from "lucide-react";
import { useAppStore, newMessageId } from "../store/useAppStore";
import { AISchemaError } from "../lib/aiClient";
import { runPipeline, type PipelineDeps, type ReviewHandle } from "../lib/pipeline";
import { abortCurrentRun, beginRun, endRun, wasAborted } from "../lib/runControl";
import { MessageBubble } from "./MessageBubble";

export function ChatPanel() {
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  // ★ 并发守卫：一轮 runRound 未结束前忽略新的 send/模板触发
  const runningRef = useRef<boolean>(false);
  // ★ 始终指向最新的 send（避免 effect 注册时的 stale closure）
  const sendRef = useRef<(text: string) => void>(() => {});
  // ★ 当前轮的规格确认句柄：spec-review 气泡事件通过此句柄回传决定
  const reviewHandleRef = useRef<ReviewHandle | null>(null);

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

  // ★★ runRound：并发锁 + store 依赖注入 → pipeline ★★
  const runRound = async (userText: string) => {
    if (runningRef.current) return;
    runningRef.current = true;
    setThinking(true);
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
        newMessageId
      };
      // runPipeline 直到整个流程结束才 resolve，锁在此 finally 统一释放
      await runPipeline(userText, deps, {
        onReview: handle => {
          reviewHandleRef.current = handle;
        }
      });
    } catch (err) {
      if (!wasAborted()) {
        appendMessage({ id: newMessageId(), role: "error", content: describeError(err) });
      }
    } finally {
      reviewHandleRef.current = null;
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
