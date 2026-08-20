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
import { restoreSnapshot } from "../lib/pipeline";
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
    let loadTimer: ReturnType<typeof setTimeout> | null = null; // applet 加载超时守卫
    const webglCleanups: Array<() => void> = []; // WebGL 事件监听清理函数
    const mode = ggbAppName; // 固定本代次的目标模式

    /** 取消挂起的加载超时守卫（成功加载 / 切代次时调用） */
    const clearLoadTimer = () => {
      if (loadTimer !== null) {
        clearTimeout(loadTimer);
        loadTimer = null;
      }
    };

    const inject = (w: number, h: number, force = false) => {
      if (!active) {
        console.log("[AiGGB:DIAG] inject() called but active=false, skipping");
        return; // 已卸载 / 已切换到新模式
      }
      if (!window.GGBApplet) {
        console.log("[AiGGB:DIAG] deployggb not loaded yet, retrying in", RETRY_INTERVAL, "ms");
        retryTimer = setTimeout(() => inject(w, h, force), RETRY_INTERVAL);
        return;
      }
      if (injectingRef.current) {
        console.log("[AiGGB:DIAG] inject() called but already injecting, skipping");
        return;
      }

      // ★ 防御：已有的 applet 含对象时不重建（避免销毁用户可见的绘图）。
      //    GeoGebra HTML5 applet 内部会自适应容器尺寸变化。
      //    force=true 时跳过此检查（用于心跳恢复/scene重建）。
      const curApi = useAppStore.getState().ggbApi;
      if (curApi && !force) {
        try {
          const objCount = curApi.getObjectNumber();
          console.log("[AiGGB:DIAG] inject() — getObjectNumber()=", objCount, "mode=", mode);
          if (objCount > 0) {
            console.log("[AiGGB] inject: skip rebuild (canvas has objects, GeoGebra handles resize internally)");
            try { curApi.refreshViews(); } catch { /* 忽略 */ }
            return;
          }
        } catch (err) {
          // ★ getObjectNumber() 可能在 3D 渲染忙碌时抛出异常；
          //    此时不应销毁画布——保留现有 applet，仅尝试触发重绘恢复。
          console.warn("[AiGGB:DIAG] inject: getObjectNumber() THREW — 不销毁画布，尝试 refreshViews");
          console.warn("[AiGGB:DIAG] getObjectNumber error:", err);
          try { curApi.refreshViews(); } catch { /* 忽略 */ }
          return;
        }
      }

      // ★ 走到了这里 = 即将销毁重建！
      console.warn("[AiGGB:DIAG] inject() 即将执行 applet 重建 (mode=" + mode + ", " + w + "x" + h +
        (force ? ", FORCE" : "") + ")");

      injectingRef.current = true;

      // ★ 销毁旧 applet（DIAGNOSTIC：这是画布消失的唯一 DOM 销毁点）
      console.warn("[AiGGB:DIAG] ★★★ containerEl.innerHTML = '' — 即将销毁 GGB applet DOM ★★★");
      console.warn("[AiGGB:DIAG] call stack:", new Error("DIAGNOSTIC STACK").stack);
      console.warn("[AiGGB:DIAG] 此时 ggbAppName=", mode, " active=", active, " containerEl children:", containerEl.children.length);
      containerEl.innerHTML = "";
      console.warn("[AiGGB:DIAG] applet 已销毁，containerEl children 剩余:", containerEl.children.length);

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
            // ★ 画布符号表同步：监听对象增删/更新，供 Phase 2 编译注入画布状态
            const refreshSymbols = () => {
              try {
                const names = api.getAllObjectNames();
                useAppStore.getState().setSymbolTable(
                  names.slice(0, 80).map(n => ({
                    name: n,
                    type: api.getObjectType(n),
                    cmd: api.getCommandString(n) ?? "",
                  }))
                );
              } catch { /* 画布未就绪时忽略 */ }
            };
            refreshSymbols();
            try {
              api.registerAddListener(() => refreshSymbols());
              api.registerRemoveListener(() => refreshSymbols());
              api.registerUpdateListener(() => refreshSymbols());
            } catch { /* listener 可选，失败不影响 */ }
            // ★ Phase 1.2: 画布就绪时应用领域级配置
            const curDomain = useAppStore.getState().domain;
            applyCanvasConfig(api, curDomain, mode === "3d" ? "3d" : "2d");
            injectingRef.current = false;
            clearLoadTimer(); // 加载成功：取消超时守卫
            console.log("[AiGGB] " + mode + " loaded");

            // ★ 会话恢复：消费 pendingCanvasSnapshot（initSessionFromStorage /
            //   switchToSession 在模式重建时缓存的画布快照）
            const pending = useAppStore.getState().pendingCanvasSnapshot;
            if (pending) {
              console.log("[AiGGB] 恢复会话画布快照（" + pending.length + " 字符）");
              void restoreSnapshot(api, pending).then(ok => {
                if (ok) useAppStore.setState({ pendingCanvasSnapshot: null });
                else console.warn("[AiGGB] 会话画布快照恢复失败（回退到画布空状态）");
              });
            }

            // ★ 3D 模式：监听 WebGL context 丢失/恢复（3D 渲染崩溃时画布可能白屏）
            if (mode === "3d") {
              const onContextLost = (e: Event) => {
                e.preventDefault(); // 告知浏览器我们想处理恢复
                console.warn("[AiGGB] WebGL context lost — 3D 渲染可能白屏，等待恢复…");
              };
              const onContextRestored = () => {
                console.log("[AiGGB] WebGL context restored — 触发重绘");
                if (!active) return;
                try { api.refreshViews(); } catch { /* 忽略 */ }
                try { api.setRepaintingActive(true); } catch { /* 忽略 */ }
              };
              containerEl.addEventListener("webglcontextlost", onContextLost, true);
              containerEl.addEventListener("webglcontextrestored", onContextRestored, true);
              // 清理在 effect cleanup 中注册（见下方 push）
              webglCleanups.push(() => {
                containerEl.removeEventListener("webglcontextlost", onContextLost, true);
                containerEl.removeEventListener("webglcontextrestored", onContextRestored, true);
              });
            }
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

      // ★ 加载超时守卫：若 appletOnLoad 迟迟不触发（deployggb/WebGL 卡死），复位 injectingRef，
      //   确保心跳恢复等后续 inject 不被永久阻塞。超时后等 GGB 自行恢复或由心跳再次触发。
      clearLoadTimer();
      const LOAD_TIMEOUT_MS = 15000;
      loadTimer = setTimeout(() => {
        if (!active) return;
        console.warn("[AiGGB:DIAG] ⚠ applet 加载超时（15s），复位 injectingRef 以允许重试");
        injectingRef.current = false;
      }, LOAD_TIMEOUT_MS);

      try {
        applet.inject(CONTAINER_ID);
      } catch (err) {
        // applet.inject 同步抛错：不能让 injectingRef 卡死
        console.error("[AiGGB:DIAG] applet.inject() 抛错，复位 injectingRef：", err);
        clearLoadTimer();
        injectingRef.current = false;
      }
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
        //    ★ 关键：观察目标是 ggb-panel（会随窗口响应），而非 #ggb-container——
        //       GGB 注入时会给 #ggb-container 设内联 width/height 锁死初始尺寸，
        //       监听它会导致尺寸永远不变、ResizeObserver 永不触发。
        //    有对象时用 setSize 更新 GGB 内部尺寸（内联高度 + canvas 一并跟随）。
        const curApi = useAppStore.getState().ggbApi;
        if (curApi) {
          try {
            const objCount = curApi.getObjectNumber();
            console.log("[AiGGB:DIAG] ResizeObserver — getObjectNumber()=", objCount, "size=", w, "x", h);
            if (objCount > 0) {
              console.log("[AiGGB] ResizeObserver: 同步 GGB 内部尺寸 " + w + "x" + h + "（保留对象，不重建）");
              const apiAny = curApi as unknown as { setSize?: (w: number, h: number) => void };
              if (typeof apiAny.setSize === "function") {
                try { apiAny.setSize(w, h); } catch { /* 忽略 */ }
              }
              try { curApi.refreshViews(); } catch { /* 忽略 */ }
              return;
            }
          } catch (err) {
            // ★ DIAGNOSTIC: 记录异常详情
            console.warn("[AiGGB:DIAG] ResizeObserver — getObjectNumber() THREW, 走重建路径 (可能触发画布消失!)");
            console.warn("[AiGGB:DIAG] ResizeObserver getObjectNumber error:", err);
          }
        }
        console.warn("[AiGGB:DIAG] ResizeObserver 触发 inject() — size=", w, "x", h, " hasApi=", !!curApi);
        if (rebuildTimer !== null) clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(() => {
          rebuildTimer = null;
          inject(w, h);
        }, REBUILD_DEBOUNCE);
      }
    });
    // ★ 观察 ggb-panel（会随窗口响应）而非 #ggb-container：
    //    GGB 注入后给容器设内联固定尺寸，监听容器本身会永不触发。
    const observeTarget = (containerEl.parentElement as HTMLElement | null) ?? containerEl;
    ro.observe(observeTarget);

    // ★★★ DIAGNOSTIC: MutationObserver 监控画布容器 DOM 变化 ★★★
    //    任何子元素增删 + 属性变化都会记录，用于定位画布DOM是否被谁移除了
    const domMo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          const removed = m.removedNodes.length;
          const added = m.addedNodes.length;
          if (removed > 0 || added > 0) {
            console.warn(`[AiGGB:DIAG] GGB 容器 DOM 变化: +${added} -${removed}`,
              "target:", (m.target as Element).id || m.target);
            m.removedNodes.forEach((n, i) => {
              const el = n as Element;
              const info = el.tagName ? `${el.tagName}${el.id ? "#"+el.id : ""}${el.className ? "."+String(el.className).split(" ").join(".") : ""}` : String(n);
              console.warn(`[AiGGB:DIAG]   移除[${i}]:`, info.slice(0, 200));
            });
            // ★ 也记录添加了哪些节点（判断 GGB 是否重建了渲染容器）
            m.addedNodes.forEach((n, i) => {
              const el = n as Element;
              const info = el.tagName ? `${el.tagName}${el.id ? "#"+el.id : ""}${el.className ? "."+String(el.className).split(" ").join(".") : ""}` : String(n);
              const childCanvasCount = el.tagName ? el.querySelectorAll("canvas").length : 0;
              console.warn(`[AiGGB:DIAG]   添加[${i}]:`, info.slice(0, 200), `含 ${childCanvasCount} 个 canvas`);
            });
          }
        }
        if (m.type === "attributes" && m.target instanceof Element) {
          const el = m.target as Element;
          // 只关心 canvas 元素的属性变化和 style/class 变化
          if (el.tagName === "CANVAS" || el.tagName === "DIV" && (m.attributeName === "style" || m.attributeName === "class" || m.attributeName === "hidden")) {
            console.warn(`[AiGGB:DIAG] 属性变化: ${el.tagName}${el.id ? "#"+el.id : ""} ${m.attributeName}=${JSON.stringify(el.getAttribute(m.attributeName!))}`);
          }
        }
      }
    });
    domMo.observe(containerEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class", "hidden", "width", "height"] });

    // ★★★ 心跳监控 + 自动恢复 ★★★
    let canvasCount = 0;
    let recoveryInProgress = false; // 恢复进行中不重复计数
    let dockGlassPaneSeen = false;  // DockGlassPane 出现 → 跳过软恢复直接硬重建
    const heartbeat = setInterval(() => {
      const canvases = containerEl.querySelectorAll("canvas");
      const newCount = canvases.length;
      const hasDockGlassPane = containerEl.querySelector(".DockGlassPane") !== null;

      if (newCount !== canvasCount) {
        const sizes = newCount > 0 ? Array.from(canvases).map(c => `${c.width}x${c.height}`).join(",") : "(无canvas)";
        console.warn(`[AiGGB:DIAG] 心跳: canvas ${canvasCount}→${newCount}` +
          (hasDockGlassPane ? " ⚠DockGlassPane!" : ""), sizes);
        canvasCount = newCount;
      }

      // canvas 恢复 → 重置一切
      if (newCount > 0 && dockGlassPaneSeen) {
        console.log(`[AiGGB:DIAG] ✅ canvas 已恢复 (${newCount} 个)`);
        dockGlassPaneSeen = false;
        recoveryInProgress = false;
        return;
      }

      const api = useAppStore.getState().ggbApi;
      if (!api) return;

      let objCount = 0;
      try { objCount = api.getObjectNumber(); } catch { return; }

      // 正常空画布 → 无需恢复
      if (objCount === 0 && newCount === 0) {
        dockGlassPaneSeen = false;
        recoveryInProgress = false;
        return;
      }

      // 有对象但无 canvas + DockGlassPane → 立即硬重建（AG→3d 软恢复本身也触发闪烁，跳过）
      if (objCount > 0 && newCount === 0 && hasDockGlassPane && !recoveryInProgress && !dockGlassPaneSeen) {
        recoveryInProgress = true;
        dockGlassPaneSeen = true;
        console.error(`[AiGGB:DIAG] ⚠ DockGlassPane 导致画布消失 (${objCount}对象) → 保存快照并重建 applet`);

        // 用 CSS 隐藏容器，避免销毁/重建过程中的闪烁
        containerEl.style.visibility = "hidden";

        let snapshot: string | null = null;
        const doRebuild = () => {
          if (!containerEl) return;
          const rect = containerEl.getBoundingClientRect();
          inject(Math.floor(rect.width), Math.floor(rect.height), true); // force
          // 重建后恢复快照
          if (snapshot) {
            const tryRestore = () => {
              const newApi = useAppStore.getState().ggbApi;
              if (newApi) {
                try {
                  newApi.setBase64(snapshot!, () => {
                    console.log("[AiGGB:DIAG] ✅ applet 重建完成，快照已恢复");
                    containerEl.style.visibility = ""; // 恢复可见
                    recoveryInProgress = false;
                  });
                } catch (err) {
                  console.warn("[AiGGB:DIAG] 快照恢复失败:", err);
                  containerEl.style.visibility = "";
                  recoveryInProgress = false;
                }
              } else {
                setTimeout(tryRestore, 100);
              }
            };
            setTimeout(tryRestore, 500);
          } else {
            // 无快照：等 appletOnLoad 后显示
            setTimeout(() => {
              containerEl.style.visibility = "";
              recoveryInProgress = false;
            }, 1500);
          }
        };

        try {
          api.getBase64((data: string) => {
            snapshot = data ?? null;
            if (snapshot) console.log("[AiGGB:DIAG] 快照已保存，长度:", snapshot.length);
            doRebuild();
          });
          setTimeout(() => { if (snapshot === null) doRebuild(); }, 3000);
        } catch { doRebuild(); }
        return;
      }

      // 有对象但无 canvas (非 DockGlassPane) → 常规软恢复
      if (objCount > 0 && newCount === 0 && !hasDockGlassPane && !recoveryInProgress) {
        recoveryInProgress = true;
        console.warn(`[AiGGB:DIAG] ⚠ 画布消失 (${objCount}对象, 非DockGlassPane) → 尝试 refreshViews`);
        try { api.refreshViews(); } catch { /* ignore */ }
        setTimeout(() => {
          try { api.setRepaintingActive(true); } catch { /* ignore */ }
          try { api.setPerspective(mode === "3d" ? "3d" : "AG"); } catch { /* ignore */ }
          recoveryInProgress = false;
        }, 300);
      }
    }, 2000);

    return () => {
      console.log("[AiGGB:DIAG] effect cleanup — 即将取消 ggbApi + 清理监听器 (mode=", mode, ")");
      active = false;              // 作废本代次：pending retry/rebuild/inject 全部失效
      if (retryTimer !== null) clearTimeout(retryTimer);
      if (rebuildTimer !== null) clearTimeout(rebuildTimer);
      clearLoadTimer();           // 取消加载超时守卫
      ro.disconnect();
      domMo.disconnect();
      clearInterval(heartbeat);
      setGGBApi(null);
      injectingRef.current = false; // 复位，确保下一代能正常注入
      for (const fn of webglCleanups) fn(); // 清理 WebGL 事件监听
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ggbAppName]); // ★ ggbAppName 变化时销毁重建

  return (
    <section className="ggb-panel">
      <div className="ggb-host" id={CONTAINER_ID} ref={containerRef} />
    </section>
  );
}
