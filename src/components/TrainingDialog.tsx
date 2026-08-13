/**
 * 训练数据管理面板 —— 训练数据闭环的 UI 层
 *
 * 功能：
 *   - 查看统计（成功执行样本 / 成功轨迹 / 失败轨迹）
 *   - 导出全部训练数据为 JSON（备份 / 迁移 / 分享）
 *   - 从 JSON 导入训练数据（多设备融合）
 *   - 清空全部训练数据
 *   - 失败轨迹列表（供回放 / 分析）
 *
 * 数据源：IndexedDB（trainingStore.executions + trajectoryStore.trajectories）
 * 非浏览器环境（无 indexedDB）下统计显示 0，导出/导入静默失败。
 */
import { useCallback, useEffect, useState } from "react";
import { X, Download, Upload, Trash2, Database, AlertTriangle } from "lucide-react";
import {
  exportAllData,
  importData,
  clearAllData,
  getTrainingStats,
  type TrainingBackup,
} from "../lib/trainingStore";
import { getAllTrajectories, type TrajectoryRecord } from "../lib/trajectoryStore";

interface Props {
  onClose: () => void;
}

interface Stats {
  executions: number;
  scenes: number;
  successTrajectories: number;
  failedTrajectories: number;
}

export function TrainingDialog({ onClose }: Props) {
  const [stats, setStats] = useState<Stats>({ executions: 0, scenes: 0, successTrajectories: 0, failedTrajectories: 0 });
  const [failedTrajs, setFailedTrajs] = useState<TrajectoryRecord[]>([]);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const [s, trajs] = await Promise.all([getTrainingStats(), getAllTrajectories()]);
    setStats(s);
    setFailedTrajs(trajs.filter(t => !t.success).sort((a, b) => b.ts - a.ts).slice(0, 10));
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const onExport = async () => {
    setBusy(true);
    try {
      const backup = await exportAllData();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      triggerDownload(blob, `aiggb-training-${new Date().toISOString().slice(0, 10)}.json`);
      setStatus({ ok: true, msg: `已导出 ${backup.executions.length} 个执行样本 + ${backup.trajectories.length} 条轨迹` });
    } catch {
      setStatus({ ok: false, msg: "导出失败（可能非浏览器环境）" });
    } finally {
      setBusy(false);
    }
  };

  const onImport = async (file: File) => {
    setBusy(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<TrainingBackup>;
      if (!parsed.executions && !parsed.trajectories) {
        setStatus({ ok: false, msg: "文件格式不正确：缺少 executions / trajectories" });
        return;
      }
      const result = await importData(parsed);
      await refresh();
      setStatus({ ok: true, msg: `已导入 ${result.executions} 个执行样本 + ${result.trajectories} 条轨迹` });
    } catch {
      setStatus({ ok: false, msg: "导入失败：文件不是合法 JSON 或格式不符" });
    } finally {
      setBusy(false);
    }
  };

  const onClear = async () => {
    if (!confirm("确定清空全部训练数据？此操作不可撤销。")) return;
    setBusy(true);
    try {
      await clearAllData();
      await refresh();
      setStatus({ ok: true, msg: "已清空全部训练数据" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal training-modal" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>训练数据管理</h2>
          <button className="icon-btn" onClick={onClose} aria-label="close">
            <X size={18} />
          </button>
        </header>

        <div className="training-stats">
          <div className="stat-card">
            <Database size={18} />
            <div>
              <strong>{stats.executions}</strong>
              <span>成功执行样本</span>
            </div>
          </div>
          <div className="stat-card">
            <Database size={18} />
            <div>
              <strong>{stats.scenes}</strong>
              <span>聚合场景</span>
            </div>
          </div>
          <div className="stat-card">
            <Database size={18} />
            <div>
              <strong>{stats.successTrajectories}</strong>
              <span>成功轨迹</span>
            </div>
          </div>
          <div className="stat-card warn">
            <AlertTriangle size={18} />
            <div>
              <strong>{stats.failedTrajectories}</strong>
              <span>失败轨迹</span>
            </div>
          </div>
        </div>

        <div className="training-actions">
          <button className="primary" onClick={onExport} disabled={busy}>
            <Download size={14} /> 导出训练数据
          </button>
          <label className="button-like">
            <Upload size={14} /> 导入训练数据
            <input
              type="file"
              accept="application/json,.json"
              style={{ display: "none" }}
              disabled={busy}
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) void onImport(f);
                e.target.value = "";
              }}
            />
          </label>
          <button className="danger" onClick={onClear} disabled={busy}>
            <Trash2 size={14} /> 清空
          </button>
        </div>

        {status && (
          <div className={`test-result ${status.ok ? "ok" : "fail"}`}>{status.msg}</div>
        )}

        {failedTrajs.length > 0 && (
          <div className="training-failed">
            <h4>最近失败轨迹（回放参考）</h4>
            <ul>
              {failedTrajs.map(t => (
                <li key={t.id}>
                  <span className="failed-user">「{t.userText.slice(0, 30)}」</span>
                  <span className="failed-reason">{t.finalText.slice(0, 50) || "(无最终回复)"}</span>
                  <code>{t.iterations} 轮</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
