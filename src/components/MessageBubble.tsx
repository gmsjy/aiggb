/**
 * 消息气泡 —— 渲染 user / assistant / error 三类
 *
 * - assistant：渲染 explanation (markdown + LaTeX) + 命令折叠预览 + 执行结果
 */
import { useState, useEffect, useCallback } from "react";
import { Check, X, ChevronDown, ChevronRight, AlertTriangle, User2, Sparkles, HelpCircle, Edit3, CheckCircle, RefreshCw, FileSearch } from "lucide-react";
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
    return <UserBubble turn={turn} />;
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
  if (turn.role === "problem-review") {
    return <ProblemReviewBubble turn={turn} />;
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

/** 题目识别确认气泡——用户可编辑题干后确认或重新识别 */
function ProblemReviewBubble({ turn }: { turn: Extract<ChatTurn, { role: "problem-review" }> }) {
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState(turn.payload.problem.problem_text);
  const isDone = turn.payload.status !== "pending";

  const onConfirm = () => {
    const problem = editing
      ? { ...turn.payload.problem, problem_text: editedText }
      : turn.payload.problem;
    window.dispatchEvent(new CustomEvent("aiggb:problem-confirm", { detail: problem }));
  };
  const onRetry = () => {
    window.dispatchEvent(new CustomEvent("aiggb:problem-retry"));
  };

  if (isDone) {
    return (
      <div className="bubble bubble-assistant">
        <FileSearch size={14} className="bubble-icon" />
        <div className="bubble-body">
          <span className="ask-label">
            {turn.payload.status === "confirmed" ? "已确认题目解读" : "已放弃题目解读"}
          </span>
        </div>
      </div>
    );
  }

  const { problem } = turn.payload;

  return (
    <div className="bubble bubble-spec-review">
      <FileSearch size={14} className="bubble-icon" />
      <div className="bubble-body">
        <div className="spec-review-label">AI 识别的题目——请确认或修改后开始绘制</div>

        <div className="problem-section">
          <div className="problem-section-title">题干</div>
          {editing ? (
            <textarea
              className="spec-edit-area"
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              rows={4}
              autoFocus
            />
          ) : (
            <pre className="spec-preview">{problem.problem_text}</pre>
          )}
        </div>

        {problem.knowns.length > 0 && (
          <div className="problem-section">
            <div className="problem-section-title">已知量</div>
            <div className="problem-chips">
              {problem.knowns.map((k, i) => (
                <span key={i} className="problem-chip">
                  {k.name}{k.value !== undefined ? ` = ${k.value}` : ""}{k.unit ? ` ${k.unit}` : ""}
                </span>
              ))}
            </div>
          </div>
        )}

        {problem.goal && (
          <div className="problem-section">
            <div className="problem-section-title">目标</div>
            <div>{problem.goal}</div>
          </div>
        )}

        {problem.figure && (
          <div className="problem-section">
            <div className="problem-section-title">图示信息</div>
            <div>{problem.figure}</div>
          </div>
        )}

        {problem.animation_hints.length > 0 && (
          <div className="problem-section">
            <div className="problem-section-title">动画要素建议</div>
            <ul className="problem-list">
              {problem.animation_hints.map((h, i) => (
                <li key={i}>[{h.type}] {h.desc}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="spec-review-actions">
          <button className="spec-btn edit" onClick={() => setEditing(!editing)}>
            {editing ? "预览" : <><Edit3 size={12} /> 编辑题干</>}
          </button>
          <button className="spec-btn retry" onClick={onRetry}>
            <RefreshCw size={12} /> 重新识别
          </button>
          <button className="spec-btn confirm" onClick={onConfirm}>
            <CheckCircle size={12} /> 确认并绘制
          </button>
        </div>
      </div>
    </div>
  );
}

/** 用户气泡：文字 + 图片附件 */
function UserBubble({ turn }: { turn: Extract<ChatTurn, { role: "user" }> }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  return (
    <>
      <div className="bubble bubble-user">
        <User2 size={14} className="bubble-icon" />
        <div className="bubble-body">
          {turn.content && <div>{turn.content}</div>}
          {turn.attachments && turn.attachments.length > 0 && (
            <div className="msg-images">
              {turn.attachments.map((url, i) => (
                <img key={i} src={url} alt={`附件 ${i + 1}`} onClick={() => setLightboxUrl(url)} />
              ))}
            </div>
          )}
        </div>
      </div>
      {lightboxUrl && <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
    </>
  );
}

/** 灯箱：全屏遮罩放大查看图片 */
function Lightbox({ url, onClose }: { url: string; onClose: () => void }) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <img src={url} alt="预览" onClick={e => e.stopPropagation()} />
    </div>
  );
}

function formatCommand(cmd: { op: string }): string {
  const { op: _op, ...rest } = cmd as Record<string, unknown> & { op: string };
  void _op;
  return JSON.stringify(rest);
}
