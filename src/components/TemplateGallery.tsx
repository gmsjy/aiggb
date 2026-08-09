/**
 * 模板库
 *
 * 按 domain（数学/物理）+ 画布模式（2D/3D）双重过滤。
 * 3D 模式下展示全部 3D 模板，2D 模式下按 domain 展示。
 */
import { X } from "lucide-react";
import { TEMPLATES } from "../lib/templates";
import { useAppStore } from "../store/useAppStore";

interface Props {
  onClose: () => void;
}

export function TemplateGallery({ onClose }: Props) {
  const domain = useAppStore(s => s.domain);
  const ggbAppName = useAppStore(s => s.ggbAppName);
  const currentMode: "2d" | "3d" = ggbAppName === "3d" ? "3d" : "2d";

  const onPick = (prompt: string) => {
    onClose();
    window.dispatchEvent(new CustomEvent("aiggb:send", { detail: prompt }));
  };

  // 3D 模式：展示所有 3D 模板；2D 模式：按 domain 过滤 2D 模板
  const items = currentMode === "3d"
    ? TEMPLATES.filter(t => t.mode === "3d")
    : TEMPLATES.filter(t => t.mode === "2d" && t.domain === domain);

  const title = currentMode === "3d"
    ? "3D 立体场景模板"
    : domain === "physics" ? "物理场景模板 · 平面" : "数学场景模板 · 平面";

  const emptyHint = currentMode === "3d"
    ? "3D 模式下支持正方体、四面体、圆柱、球体、棱锥、空间曲线、螺旋运动…"
    : domain === "physics"
      ? "支持矢量箭头、受力分析、电场线、单摆、弹簧振子、行波、驻波…"
      : "支持几何构造、函数、圆锥曲线、参数曲线、定积分、玫瑰线…";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="close">
            <X size={18} />
          </button>
        </header>
        <p className="muted small">
          点击卡片即向 AI 发送对应描述，由 AI 即时生成可调参数的动图。
        </p>
        {items.length === 0 ? (
          <p className="muted" style={{ marginTop: "var(--space-3)", textAlign: "center" }}>
            当前模式下暂无模板。
            <br /><small>{emptyHint}</small>
          </p>
        ) : (
          <>
            <p className="muted small" style={{ marginTop: "var(--space-1)" }}>
              {emptyHint}
            </p>
            <div className="template-grid">
              {items.map(t => (
                <button key={t.id} className="template-card" onClick={() => onPick(t.prompt)}>
                  <span className="template-icon">{t.icon}</span>
                  <span className="template-title">{t.title}</span>
                  <span className="template-subtitle">{t.subtitle}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
