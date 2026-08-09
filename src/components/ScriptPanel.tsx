/**
 * 实时 GGB 脚本面板 —— 右栏（三栏布局）
 *
 * 数据来源：store.messages 中所有 assistant 回合的 ExecResult.expanded
 * 显示规则：
 *   - 成功命令以原文展示
 *   - 失败命令以红色背景 + 注释错误原因
 *   - 按时间顺序拼接，与画布完全同步
 *   - 可折叠为竖向窄条，把空间让给 GGB 画布
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronsRight,
  ChevronsLeft,
  ClipboardCopy,
  Download,
  FileCode2
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const STORAGE_KEY = "aiggb_script_collapsed";

export function ScriptPanel() {
  const messages = useAppStore(s => s.messages);
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === "1"
  );
  const bodyRef = useRef<HTMLPreElement>(null);

  const lines = useMemo(() => buildScript(messages), [messages]);

  // 新行追加时自动滚到底部
  useEffect(() => {
    if (collapsed) return;
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [lines.length, collapsed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    window.dispatchEvent(new CustomEvent("aiggb:script-toggle"));
  }, [collapsed]);

  const onCopy = async () => {
    if (!lines.length) return;
    const text = lines
      .filter(l => l.kind !== "comment")
      .map(l => l.text)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onDownload = () => {
    if (!lines.length) return;
    const blob = new Blob([lines.map(l => l.text).join("\n")], {
      type: "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aiggb-${Date.now()}.ggb.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const okCount = lines.filter(l => l.kind === "ok").length;
  const failCount = lines.filter(l => l.kind === "fail").length;

  if (collapsed) {
    return (
      <section className="script-panel collapsed" aria-label="GGB 脚本（已折叠）">
        <button
          className="script-rail"
          onClick={() => setCollapsed(false)}
          title="展开 GGB 脚本面板"
        >
          <ChevronsLeft size={14} />
          <FileCode2 size={14} />
          <span className="rail-text">
            GGB 脚本 · {okCount}
            {failCount > 0 && <span className="fail-count"> · {failCount}✗</span>}
          </span>
        </button>
      </section>
    );
  }

  return (
    <section className="script-panel">
      <header className="script-header">
        <div className="script-title">
          <FileCode2 size={14} />
          <span>GGB 脚本</span>
          <span className="script-stat">
            {okCount} 行
            {failCount > 0 && <span className="fail-count"> · {failCount} 失败</span>}
          </span>
        </div>
        <div className="script-actions">
          <button onClick={onCopy} disabled={!lines.length} title="复制可执行命令">
            <ClipboardCopy size={14} />
            {copied ? "已复制" : "复制"}
          </button>
          <button onClick={onDownload} disabled={!lines.length} title="下载 .txt">
            <Download size={14} />
          </button>
          <button
            className="icon-btn"
            onClick={() => setCollapsed(true)}
            title="折叠脚本面板"
            aria-label="collapse"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </header>

      <pre className="script-body" ref={bodyRef}>
        {lines.length === 0 ? (
          <div className="script-empty">
            // 暂无命令
            <br />
            //
            <br />
            // 在左侧聊天框输入需求，
            <br />
            // AI 生成的 GGB 脚本会
            <br />
            // 实时显示在这里。
          </div>
        ) : (
          lines.map((l, i) => (
            <div key={i} className={`script-line ${l.kind}`}>
              <span className="ln">{String(i + 1).padStart(3, " ")}</span>
              <code>{l.text}</code>
            </div>
          ))
        )}
      </pre>
    </section>
  );
}

interface ScriptLine {
  kind: "ok" | "fail" | "comment";
  text: string;
}

function buildScript(messages: ReturnType<typeof useAppStore.getState>["messages"]): ScriptLine[] {
  const out: ScriptLine[] = [];
  let turnIdx = 0;
  for (const m of messages) {
    if (m.role !== "assistant") continue;
    turnIdx++;
    const userMsg = findUserBefore(messages, m.id);
    out.push({
      kind: "comment",
      text: `// —— 第 ${turnIdx} 轮${userMsg ? "：" + truncate(userMsg, 80) : ""} ——`
    });
    for (const r of m.payload.results) {
      if (r.expanded.length === 0) {
        out.push({
          kind: r.ok ? "comment" : "fail",
          text: `// [${r.command.op}] ${r.ok ? "" : "FAILED: " + (r.error ?? "")}`
        });
        continue;
      }
      for (const cmd of r.expanded) {
        out.push({
          kind: r.ok ? "ok" : "fail",
          text: r.ok ? cmd : `${cmd}  // ✗ ${r.error ?? "失败"}`
        });
      }
    }
  }
  return out;
}

function findUserBefore(
  messages: ReturnType<typeof useAppStore.getState>["messages"],
  assistantId: string
): string | null {
  const idx = messages.findIndex(m => m.id === assistantId);
  if (idx < 0) return null;
  for (let i = idx - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "user") return m.content;
    if (m.role === "assistant") return null;
  }
  return null;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
