/**
 * 会话历史弹层 —— 列表展示 / 新建 / 切换 / 删除 / 重命名 / 清空
 *
 * 骨架仿 SettingsDialog/TrainingDialog：modal-overlay → modal → header + 内容。
 * 所有持久化操作委托 useAppStore 的会话 actions（内部走 IndexedDB sessionStore + localStorage 索引）。
 */
import { Plus, Trash2, Pencil, MessageSquare, X } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export function SessionDialog({ onClose }: { onClose: () => void }) {
  const sessions = useAppStore(s => s.sessionIndex);
  const currentId = useAppStore(s => s.currentSessionId);

  const createNew = () => {
    void useAppStore.getState().createNewSession();
    onClose();
  };
  const switchTo = (id: string) => {
    if (id !== currentId) {
      void useAppStore.getState().switchToSession(id);
    }
    onClose();
  };
  const remove = (id: string, title: string) => {
    if (window.confirm(`删除会话「${title || "未命名"}」？其消息与画布将一并删除。`)) {
      void useAppStore.getState().deleteSessionById(id);
    }
  };
  const rename = (id: string, title: string) => {
    const next = window.prompt("重命名会话", title || "新会话");
    if (next && next.trim()) {
      void useAppStore.getState().renameSession(id, next.trim());
    }
  };
  const clearAll = () => {
    if (window.confirm("清除全部会话？将新建一个空白会话，所有历史不可恢复。")) {
      void useAppStore.getState().clearAllSessions();
      onClose();
    }
  };

  const fmt = (ts: number): string => {
    if (!ts) return "";
    const d = new Date(ts);
    const sameDay = d.toDateString() === new Date().toDateString();
    return sameDay
      ? d.toTimeString().slice(0, 5)
      : d.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>会话历史</h2>
          <button className="icon-btn" onClick={onClose} aria-label="close">
            <X size={18} />
          </button>
        </header>

        <button className="session-new" onClick={createNew}>
          <Plus size={14} /> 新建会话
        </button>

        {sessions.length === 0 ? (
          <p className="session-empty">
            <MessageSquare size={16} /> 暂无历史会话。发送消息后自动保存。
          </p>
        ) : (
          <ul className="session-list">
            {sessions.map(s => (
              <li
                key={s.id}
                className={`session-item ${s.id === currentId ? "active" : ""}`}
                onClick={() => switchTo(s.id)}
              >
                <span className="session-title">{s.title || "未命名"}</span>
                <span className="session-meta">
                  {s.ggbAppName === "3d" ? "3D · " : "2D · "}
                  {s.messageCount} 条 · {fmt(s.updatedAt)}
                </span>
                <span className="session-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="icon-btn"
                    title="重命名"
                    onClick={() => rename(s.id, s.title)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="icon-btn"
                    title="删除"
                    onClick={() => remove(s.id, s.title)}
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <footer className="actions">
          <span className="spacer" />
          <button className="danger" onClick={clearAll}>
            <Trash2 size={14} /> 清除全部会话
          </button>
        </footer>
      </div>
    </div>
  );
}
