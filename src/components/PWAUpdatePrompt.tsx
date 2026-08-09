/**
 * PWA 版本更新提示 —— SPEC.md §3A.3
 */
import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";

export function PWAUpdatePrompt() {
  const [show, setShow] = useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW(swUrl) {
      console.info("[PWA] SW registered:", swUrl);
    },
    onRegisterError(err) {
      console.warn("[PWA] SW register error:", err);
    }
  });

  useEffect(() => {
    if (needRefresh) setShow(true);
  }, [needRefresh]);

  if (!show) return null;

  return (
    <div className="pwa-update">
      <RefreshCw size={14} />
      <span>检测到新版本</span>
      <button
        className="primary"
        onClick={() => {
          setShow(false);
          void updateServiceWorker(true);
        }}
      >
        刷新启用
      </button>
      <button
        className="icon-btn"
        onClick={() => {
          setShow(false);
          setNeedRefresh(false);
        }}
        aria-label="dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
