/**
 * 顶栏工具栏 —— 见 SPEC.md §5.4
 */
import { useEffect, useState } from "react";
import {
  Settings,
  Trash2,
  Undo2,
  Download,
  Camera,
  ClipboardCopy,
  LayoutGrid,
  Atom,
  Sigma,
  MonitorDown,
  Box
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { executeCommands, exportGGB, exportPNG, resetTmpIds, applyCanvasConfig } from "../lib/ggbBridge";
import { abortCurrentRun } from "../lib/runControl";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Props {
  onOpenSettings: () => void;
  onOpenGallery: () => void;
}

export function Toolbar({ onOpenSettings, onOpenGallery }: Props) {
  const ggbApi = useAppStore(s => s.ggbApi);
  const ggbAppName = useAppStore(s => s.ggbAppName);
  const setAppName = useAppStore(s => s.setAppName);
  const domain = useAppStore(s => s.domain);
  const setDomain = useAppStore(s => s.setDomain);
  const agentMode = useAppStore(s => s.agentMode);
  const setAgentMode = useAppStore(s => s.setAgentMode);
  const messages = useAppStore(s => s.messages);
  const clearMessages = useAppStore(s => s.clearMessages);
  const undoLastTurn = useAppStore(s => s.undoLastTurn);
  const [domainToast, setDomainToast] = useState<string | null>(null);

  const switchDomain = (d: typeof domain) => {
    if (d === domain) return;
    setDomain(d);
    // ★ Phase 1.2: 领域切换时应用画布级配置
    const api = useAppStore.getState().ggbApi;
    if (api) {
      applyCanvasConfig(api, d, ggbAppName === "3d" ? "3d" : "2d");
    }
    const msg =
      d === "physics"
        ? "已切换 ⚛ 物理模式 — 启用矢量箭头、物理常量、受力分析等专项支持"
        : "已切换 📐 数学模式 — 通用几何、函数、圆锥曲线、数列";
    setDomainToast(msg);
    setTimeout(() => setDomainToast(null), 2500);
  };

  const toggleMode = () => {
    // ★ 取消进行中的请求，避免切模式后旧响应再写入已清空的消息
    abortCurrentRun();
    const next: "classic" | "3d" = ggbAppName === "3d" ? "classic" : "3d";
    if (confirm(next === "3d"
      ? "切换到 3D 画布？当前画布和图元将被清空。"
      : "切换回 2D 平面画布？当前 3D 对象将被清空。")) {
      setAppName(next);
      clearMessages();
    }
  };

  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClear = () => {
    if (!ggbApi) return;
    if (confirm("清空画布与聊天历史？")) {
      // ★ 取消进行中的请求，防止旧响应追加到已清空的消息/画布
      abortCurrentRun();
      // ★ 先 newConstruction 保底清空当前画布（2D 模式下 setAppName 同值不会触发重建）
      ggbApi.newConstruction();
      resetTmpIds();
      setAppName("classic");  // 重置回平面模式（3D→2D 时由重建清空）
      clearMessages();
    }
  };

  const onUndo = () => {
    if (!ggbApi || messages.length === 0) return;
    if (!messages.some(m => m.role === "assistant")) return;
    abortCurrentRun();
    undoLastTurn();
    ggbApi.newConstruction();
    resetTmpIds();
    // ★ 完整重放剩余轮次的所有 op（eval/slider/vector/forceDiagram/animate/...），
    //   而非只重放 eval——否则滑块/矢量等会丢失，构造与历史不一致
    const after = useAppStore.getState().messages;
    for (const m of after) {
      if (m.role === "assistant") {
        executeCommands(ggbApi, m.payload.commands);
      }
    }
  };

  const onExportGGB = async () => {
    if (!ggbApi) return;
    const data = await exportGGB(ggbApi);
    const blob = await (await fetch(`data:application/octet-stream;base64,${data}`)).blob();
    triggerDownload(blob, `aiggb-${Date.now()}.ggb`);
  };

  const onScreenshot = async () => {
    if (!ggbApi) return;
    const dataUrl = exportPNG(ggbApi);
    const blob = await (await fetch(dataUrl)).blob();
    triggerDownload(blob, `aiggb-${Date.now()}.png`);
  };

  const onCopyScript = async () => {
    const cmds = messages.flatMap(m =>
      m.role === "assistant"
        ? m.payload.commands.filter(c => c.op === "eval").map(c => (c as { cmd: string }).cmd)
        : []
    );
    await navigator.clipboard.writeText(cmds.join("\n"));
    alert(`已复制 ${cmds.length} 条 GGB 命令到剪贴板`);
  };

  const onInstall = async () => {
    if (!installEvt) {
      alert("当前浏览器或环境不支持自动安装。\n你也可以在浏览器菜单中选择 “安装 AiGGB” 或 “添加到主屏幕”。");
      return;
    }
    await installEvt.prompt();
    const { outcome } = await installEvt.userChoice;
    if (outcome === "accepted") setInstallEvt(null);
  };

  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <span className="logo">∮</span>
        <span className="title">AiGGB</span>
        <span className="subtitle">AI × GeoGebra</span>
      </div>

      {domainToast && <div className="domain-toast">{domainToast}</div>}

      <div className="toolbar-actions">
        <div className="domain-switch">
          <button
            className={domain === "general" ? "active" : ""}
            onClick={() => switchDomain("general")}
            title="数学模式：几何、函数、圆锥曲线、数列、3D 几何体"
          >
            <Sigma size={14} /> 数学
          </button>
          <button
            className={domain === "physics" ? "active" : ""}
            onClick={() => switchDomain("physics")}
            title="物理域：矢量、常量、受力分析、电场"
          >
            <Atom size={14} /> 物理
          </button>
        </div>

        <button
          className={ggbAppName === "3d" ? "active" : ""}
          onClick={toggleMode}
          title={ggbAppName === "3d" ? "当前 3D 模式 · 点击切回平面" : "当前平面模式 · 点击切换到 3D"}
        >
          <Box size={14} /> {ggbAppName === "3d" ? "3D" : "平面"}
        </button>

        <button
          className={agentMode ? "active agent-on" : ""}
          onClick={() => setAgentMode(!agentMode)}
          title={agentMode
            ? "当前：代理模式（逐步构造）— 点击切换回两阶段模式"
            : "当前：两阶段模式 — 点击切换为代理模式（逐步构造+实时反馈）"}
        >
          🤖 {agentMode ? "代理" : "两阶段"}
        </button>

        <button onClick={onOpenGallery} title="物理 / 数学模板">
          <LayoutGrid size={16} /> 模板
        </button>
        <button onClick={onUndo} disabled={messages.length === 0} title="撤销上一轮 AI 命令">
          <Undo2 size={16} />
        </button>
        <button onClick={onClear} title="清空画布与聊天">
          <Trash2 size={16} />
        </button>
        <button onClick={onExportGGB} disabled={!ggbApi} title="导出 .ggb 文件">
          <Download size={16} />
        </button>
        <button onClick={onScreenshot} disabled={!ggbApi} title="截图 PNG">
          <Camera size={16} />
        </button>
        <button onClick={onCopyScript} title="复制 GGB 脚本">
          <ClipboardCopy size={16} />
        </button>
        {installEvt && (
          <button onClick={onInstall} className="install" title="安装到桌面">
            <MonitorDown size={16} /> 安装
          </button>
        )}
        <button onClick={onOpenSettings} title="API 设置">
          <Settings size={16} />
        </button>
      </div>
    </header>
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
