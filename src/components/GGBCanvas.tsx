/**
 * GeoGebra 画布 —— SPEC.md §3 / §4A.6
 *
 * 通过官方 deployggb.js 注入 applet；加载完成后把 GGBAppletApi 写入 store。
 * 监听 ggbAppName 变化：classic → 3d 时销毁旧 applet 并重建。
 *
 * 防竞态：每次 effect 建立独立「代次」(gen)，cleanup 时作废旧代次、
 * 取消 pending retry timer、复位 injectingRef，避免快速切换 2D↔3D 时
 * 残留 retry 把刚注入的画布覆盖成错误模式。
 */
import { useEffect, useRef } from "react";
import { useAppStore } from "../store/useAppStore";
import { resetTmpIds, applyCanvasConfig } from "../lib/ggbBridge";
import type { GGBAppletApi } from "../types/ggb";

const CONTAINER_ID = "ggb-container";
const RETRY_INTERVAL = 100;
const REBUILD_DEBOUNCE = 350;

export function GGBCanvas() {
  const setGGBApi = useAppStore(s => s.setGGBApi);
  const ggbAppName = useAppStore(s => s.ggbAppName);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const injectingRef = useRef<boolean>(false);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    let active = true; // 本代次是否仍有效
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
    const mode = ggbAppName; // 固定本代次的目标模式

    const inject = (w: number, h: number) => {
      if (!active) return; // 已卸载 / 已切换到新模式
      if (!window.GGBApplet) {
        retryTimer = setTimeout(() => inject(w, h), RETRY_INTERVAL);
        return;
      }
      if (injectingRef.current) return;

      // ★ 防御：已有的 applet 含对象时不重建（避免销毁用户可见的绘图）。
      //    GeoGebra HTML5 applet 内部会自适应容器尺寸变化。
      const curApi = useAppStore.getState().ggbApi;
      if (curApi) {
        try {
          if (curApi.getObjectNumber() > 0) {
            console.log("[AiGGB] inject: skip rebuild (canvas has objects, GeoGebra handles resize internally)");
            try { curApi.refreshViews(); } catch { /* 忽略 */ }
            return;
          }
        } catch { /* API 不可用则走重建 */ }
      }

      injectingRef.current = true;

      // ★ 销毁旧 applet
      containerEl.innerHTML = "";

      console.log("[AiGGB] injecting applet:", mode, w, "×", h);

      const applet = new window.GGBApplet(
        {
          appName: mode,                    // ★ "classic" 或 "3d"
          width: w,
          height: h,
          showToolBar: true,
          showAlgebraInput: true,
          showMenuBar: false,
          showResetIcon: false,
          showKeyboardOnFocus: false,
          enableLabelDrags: false,
          enableShiftDragZoom: true,
          enableRightClick: false,
          errorDialogsActive: false,
          useBrowserForJS: true,
          language: "zh",
          preventFocus: true,
          appletOnLoad: (api: GGBAppletApi) => {
            if (!active) return; // 已切换模式，忽略过期 applet 的回调
            resetTmpIds(); // 新画布：临时对象名从头开始
            setGGBApi(api);
            // ★ Phase 1.2: 画布就绪时应用领域级配置
            const curDomain = useAppStore.getState().domain;
            applyCanvasConfig(api, curDomain, mode === "3d" ? "3d" : "2d");
            injectingRef.current = false;
            console.log("[AiGGB] " + mode + " loaded");
          }
        },
        true
      );
      // ★ 本地 codebase（官方 GeoGebra bundle 5.0）：完全离线。
      //   2D/3D 恒用 web3d 模块（超集，含 2D 渲染）——codebase 恒定避免 deployggb 模块切换复用。
      //   deployggb 对相对路径不生效（indexOf("//") 判断），须传完整 URL。
      const codebaseUrl = new URL("./GeoGebra/HTML5/5.0/web3d/", window.location.href).href;
      if (typeof (applet as unknown as { setHTML5Codebase?: (url: string) => void }).setHTML5Codebase === "function") {
        (applet as unknown as { setHTML5Codebase: (url: string) => void }).setHTML5Codebase(codebaseUrl);
      }
      applet.inject(CONTAINER_ID);
    };

    // 初始注入或 appName 变化时重建
    const rect = containerEl.getBoundingClientRect();
    lastSizeRef.current = { w: Math.floor(rect.width), h: Math.floor(rect.height) };
    inject(lastSizeRef.current.w, lastSizeRef.current.h);

    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (!active) return;
        const w = Math.floor(entry.contentRect.width);
        const h = Math.floor(entry.contentRect.height);
        const last = lastSizeRef.current;
        if (Math.abs(w - last.w) < 40 && Math.abs(h - last.h) < 40) continue;
        lastSizeRef.current = { w, h };
        // ★ 如果画布已有对象，跳过重建以免清空用户可见的绘图。
        //    GeoGebra 内部有自适应 resize 逻辑；只有空画布（初始/刚切模式）才重建。
        const curApi = useAppStore.getState().ggbApi;
        if (curApi) {
          try {
            if (curApi.getObjectNumber() > 0) {
              console.log("[AiGGB] ResizeObserver: skip rebuild (canvas has objects, GeoGebra handles resize internally)");
              // 通知 GeoGebra 触发重绘以适应新容器尺寸
              try { curApi.refreshViews(); } catch { /* 忽略 */ }
              return;
            }
          } catch { /* API 不可用则走重建 */ }
        }
        if (rebuildTimer !== null) clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(() => {
          rebuildTimer = null;
          inject(w, h);
        }, REBUILD_DEBOUNCE);
      }
    });
    ro.observe(containerEl);

    return () => {
      active = false;              // 作废本代次：pending retry/rebuild/inject 全部失效
      if (retryTimer !== null) clearTimeout(retryTimer);
      if (rebuildTimer !== null) clearTimeout(rebuildTimer);
      ro.disconnect();
      setGGBApi(null);
      injectingRef.current = false; // 复位，确保下一代能正常注入
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ggbAppName]); // ★ ggbAppName 变化时销毁重建

  return (
    <section className="ggb-panel">
      <div className="ggb-host" id={CONTAINER_ID} ref={containerRef} />
    </section>
  );
}
