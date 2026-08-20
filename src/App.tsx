import { useEffect, useState } from "react";
import { useAppStore } from "./store/useAppStore";
import { registerAppNameSetter } from "./lib/ggbBridge";
import { SettingsDialog } from "./components/SettingsDialog";
import { TrainingDialog } from "./components/TrainingDialog";
import { SessionDialog } from "./components/SessionDialog";
import { ChatPanel } from "./components/ChatPanel";
import { GGBCanvas } from "./components/GGBCanvas";
import { ScriptPanel } from "./components/ScriptPanel";
import { Toolbar } from "./components/Toolbar";
import { TemplateGallery } from "./components/TemplateGallery";
import { PWAUpdatePrompt } from "./components/PWAUpdatePrompt";

const SCRIPT_COLLAPSED_KEY = "aiggb_script_collapsed";

export function App() {
  const config = useAppStore(s => s.config);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [galleryOpen, setGalleryOpen] = useState<boolean>(false);
  const [trainingOpen, setTrainingOpen] = useState<boolean>(false);
  const [sessionsOpen, setSessionsOpen] = useState<boolean>(false);
  const [offline, setOffline] = useState<boolean>(typeof navigator !== "undefined" && !navigator.onLine);
  const [scriptCollapsed, setScriptCollapsed] = useState<boolean>(
    () => typeof localStorage !== "undefined" && localStorage.getItem(SCRIPT_COLLAPSED_KEY) === "1"
  );

  // 首次启动或缺失 Key 时自动弹出设置面板
  useEffect(() => {
    if (!config?.apiKey) setSettingsOpen(true);
  }, [config?.apiKey]);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // 监听 ScriptPanel 内部对 localStorage 的写入，同步根布局 class
  useEffect(() => {
    const sync = () =>
      setScriptCollapsed(localStorage.getItem(SCRIPT_COLLAPSED_KEY) === "1");
    window.addEventListener("aiggb:script-toggle", sync);
    return () => window.removeEventListener("aiggb:script-toggle", sync);
  }, []);

  // 注册 2D↔3D applet 切换回调
  useEffect(() => {
    registerAppNameSetter(name => useAppStore.getState().setAppName(name));
  }, []);

  // ★ 启动恢复会话历史：从 localStorage 索引装载当前会话（消息入 store，
  //    画布快照由 GGBCanvas appletOnLoad 消费 pendingCanvasSnapshot 恢复）
  useEffect(() => {
    void useAppStore.getState().initSessionFromStorage();
    // ★ 装载 token 用量历史（设置面板统计图消费）
    useAppStore.getState().loadTokenHistory();
  }, []);

  return (
    <div className="app-shell">
      <Toolbar
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenGallery={() => setGalleryOpen(true)}
        onOpenSessions={() => setSessionsOpen(true)}
      />

      {offline && (
        <div className="offline-banner">
          离线模式：AI 调用将失败，但模板、画布和已生成的动图仍可使用。
        </div>
      )}

      <div className={`main-split ${scriptCollapsed ? "script-collapsed" : ""}`}>
        <ChatPanel />
        <GGBCanvas />
        <ScriptPanel />
      </div>

      {settingsOpen && (
        <SettingsDialog
          onClose={() => setSettingsOpen(false)}
          onOpenTraining={() => setTrainingOpen(true)}
        />
      )}
      {galleryOpen && <TemplateGallery onClose={() => setGalleryOpen(false)} />}
      {sessionsOpen && <SessionDialog onClose={() => setSessionsOpen(false)} />}
      {trainingOpen && <TrainingDialog onClose={() => setTrainingOpen(false)} />}
      <PWAUpdatePrompt />
    </div>
  );
}
