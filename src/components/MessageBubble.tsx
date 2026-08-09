/**
 * 消息气泡 —— 渲染 user / assistant / error 三类
 *
 * - assistant：渲染 explanation (markdown + LaTeX) + 命令折叠预览 + 执行结果
 */
import { useState } from "react";
import { Check, X, ChevronDown, ChevronRight, AlertTriangle, User2, Sparkles, HelpCircle, Edit3, CheckCircle, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { ChatTurn } from "../store/useAppStore";

interface Props {
  turn: ChatTurn;
}

export function MessageBubble({ turn }: Props) {
  if (turn.role === "spec-review") {
    return <SpecReviewBubble turn={turn} />;
  }
  if (turn.role === "user") {
    return (
      <div className="bubble bubble-user">
        <User2 size={14} className="bubble-icon" />
        <div className="bubble-body">{turn.content}</div>
      </div>
    );
  }
  if (turn.role === "error") {
    return (
      <div className="bubble bubble-error">
        <AlertTriangle size={14} className="bubble-icon" />
        <div className="bubble-body">{turn.content}</div>
      </div>
    );
  }
  if (turn.role === "ask") {
    return (
      <div className="bubble bubble-ask">
        <HelpCircle size={14} className="bubble-icon" />
        <div className="bubble-body">
          <span className="ask-label">AI 需要确认</span>
          <p>{turn.payload.question}</p>
          <span className="ask-hint">请在下方输入框回复，Ctrl+Enter 发送</span>
        </div>
      </div>
    );
  }
  return <AssistantBubble turn={turn} />;
}

function AssistantBubble({ turn }: { turn: Extract<ChatTurn, { role: "assistant" }> }) {
  const [open, setOpen] = useState(false);
  const { explanation, commands, results } = turn.payload;
  const failed = results.filter(r => !r.ok).length;
  const total = results.length;
  return (
    <div className="bubble bubble-assistant">
      <Sparkles size={14} className="bubble-icon" />
      <div className="bubble-body">
        <div className="markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {explanation}
          </ReactMarkdown>
        </div>

        {turn.payload.self_check && turn.payload.self_check !== "ok" && (
          <details className="self-check-details">
            <summary className="self-check-summary">AI 自检报告</summary>
            <div className="self-check-body markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{turn.payload.self_check}</ReactMarkdown>
            </div>
          </details>
        )}

        <button className="cmd-toggle" onClick={() => setOpen(o => !o)}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {failed > 0 ? (
            <span className="cmd-status fail">
              {total - failed}/{total} 条执行成功 · {failed} 条失败
            </span>
          ) : (
            <span className="cmd-status ok">{total} 条命令执行成功</span>
          )}
        </button>

        {open && (
          <ol className="cmd-list">
            {results.map((r, i) => (
              <li key={i} className={r.ok ? "ok" : "fail"}>
                {r.ok ? <Check size={12} /> : <X size={12} />}
                <code>
                  {r.expanded.length
                    ? r.expanded.join("; ")
                    : `${r.command.op} ${formatCommand(r.command)}`}
                </code>
                {r.error && <span className="err">{r.error}</span>}
              </li>
            ))}
            {commands.length === 0 && <li className="muted">（本轮无命令）</li>}
          </ol>
        )}
      </div>
    </div>
  );
}

/** Phase 1 精炼规格确认气泡——用户可编辑规格后确认或重新生成 */
function SpecReviewBubble({ turn }: { turn: Extract<ChatTurn, { role: "spec-review" }> }) {
  const [editing, setEditing] = useState(false);
  const [editedSpec, setEditedSpec] = useState(turn.payload.spec);
  const isDone = turn.payload.status !== "pending";

  const onConfirm = () => {
    const spec = editing ? editedSpec : turn.payload.spec;
    window.dispatchEvent(new CustomEvent("aiggb:spec-confirm", { detail: spec }));
  };
  const onRetry = () => {
    window.dispatchEvent(new CustomEvent("aiggb:spec-retry"));
  };

  if (isDone) {
    return (
      <div className="bubble bubble-assistant">
        <Edit3 size={14} className="bubble-icon" />
        <div className="bubble-body">
          <span className="ask-label">
            {turn.payload.status === "confirmed" ? "已确认规格" : "已放弃规格"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bubble bubble-spec-review">
      <Edit3 size={14} className="bubble-icon" />
      <div className="bubble-body">
        <div className="spec-review-label">AI 精炼的绘图规格——请确认或修改后开始绘制</div>
        {editing ? (
          <textarea
            className="spec-edit-area"
            value={editedSpec}
            onChange={e => setEditedSpec(e.target.value)}
            rows={6}
            autoFocus
          />
        ) : (
          <pre className="spec-preview">{turn.payload.spec}</pre>
        )}
        <div className="spec-review-actions">
          <button className="spec-btn edit" onClick={() => setEditing(!editing)}>
            {editing ? "预览" : <><Edit3 size={12} /> 编辑</>}
          </button>
          <button className="spec-btn retry" onClick={onRetry}>
            <RefreshCw size={12} /> 重新生成
          </button>
          <button className="spec-btn confirm" onClick={onConfirm}>
            <CheckCircle size={12} /> 确认绘制
          </button>
        </div>
      </div>
    </div>
  );
}

function formatCommand(cmd: { op: string }): string {
  const { op: _op, ...rest } = cmd as Record<string, unknown> & { op: string };
  void _op;
  return JSON.stringify(rest);
}
