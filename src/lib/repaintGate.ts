/**
 * 画布重绘门控 —— 批处理策略 +「刚恢复重绘」静默期（绘图时闪烁防治）
 *
 * 背景（实测日志证据 + 四条已知路径）：
 *   浏览器日志（`[AiGGB:DIAG]`）在绘图时反复出现
 *     `移除 DIV.avOutput / DIV.avDefinition / DIV.avValue`、`添加 DIV.avDefinition 含 1 个 canvas`
 *   即 **代数区（Algebra View）逐行重建**：每条命令都让代数行的 canvasDef 重建一次。
 *   把整批命令包进一次 `setRepaintingActive(false/true)` 可把 N 次重建压成 1 次。
 *
 *   1. 逐条重绘：未批处理时每条命令触发一次整屏重绘 + 代数区逐行重建（对象"一跳一跳"）。
 *   2. 恢复重绘：`setRepaintingActive(true)` 让 GGB 做整屏重绘 + 内部布局重组，
 *      3D 视图可能出现几帧 canvas 空白（历史上的 DockGlassPane 根因）。
 *   3. 误判重建：GGBCanvas 的 2s 心跳若在 ②的空白窗口内读到 canvas=0，会判定
 *      "画布消失"并硬重建 applet（visibility:hidden → inject → setBase64）→"闪一下 + 停顿"。
 *   4. 尺寸抖动：ResizeObserver 逐帧 setSize + refreshViews。
 *
 * 本模块负责 ①③：所有非空批次一律暂停/恢复重绘（3D 可由用户关闭），
 * 恢复后进入静默期，心跳在此期间跳过存活判定。
 *
 * 纯 TS、零 React 依赖，可在 Node 单测环境直接调用。
 */

/** 3D 批量渲染开关的 localStorage 键（值为 "0" = 关闭） */
export const BATCH_3D_STORAGE_KEY = "aiggb_batch_3d";

/** 画布逐节点诊断日志开关（"1" = 输出 MutationObserver 明细；默认只保留关键日志） */
export const DIAG_VERBOSE_KEY = "aiggb_diag";

/** 恢复重绘后的静默期（ms）：覆盖 GGB 整屏重绘 + canvas 重建窗口 */
export const REPAINT_GRACE_MS = 2000;

/**
 * 批处理最小条数。
 * ★ 取 1：单条命令内部通常也会展开成多条 evalCommand（create + SetCaption + SetColor…），
 *   批处理同样能把这些代数区重建合并成一次；实测「每轮 1~2 个工具调用」正是闪烁高发场景。
 */
export const BATCH_MIN_COMMANDS = 1;

/** 是否输出逐节点的画布诊断日志（默认关闭：MutationObserver 回调里打 console 本身会造成卡顿） */
export function isDiagVerbose(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(DIAG_VERBOSE_KEY) === "1";
  } catch {
    return false;
  }
}

/** 3D 批量渲染是否启用（默认启用；关闭可换取 3D 绘图区更平滑，代价是代数区逐行重建） */
export function isBatch3DEnabled(): boolean {
  if (typeof localStorage === "undefined") return true;
  try {
    return localStorage.getItem(BATCH_3D_STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

/** 设置 3D 批量渲染开关 */
export function setBatch3DEnabled(on: boolean): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(BATCH_3D_STORAGE_KEY, on ? "1" : "0");
  } catch {
    /* 隐私模式等场景下忽略 */
  }
}

/**
 * 是否对该批次启用批量渲染（暂停重绘 → 执行 → 恢复，整批一次重绘）。
 *
 * - count < 1：空批次，无需处理
 * - 2D：一律批处理（实测不批处理会导致代数区 canvasDef 逐行重建闪烁）
 * - 3D：默认同样批处理，但可由用户在设置面板关闭（换取 3D 视图不整屏重绘）
 */
export function shouldBatch(count: number, appMode: "2d" | "3d" | undefined): boolean {
  if (count < BATCH_MIN_COMMANDS) return false;
  if (appMode === "3d") return isBatch3DEnabled();
  return true;
}

// ──── 静默期（重绘窗口）────

let busyUntil = 0;

/** 标记"正在重绘 / 刚恢复重绘"（批处理恢复、applet 重建后调用） */
export function markRepaintBusy(ms: number = REPAINT_GRACE_MS): void {
  busyUntil = Date.now() + ms;
}

/** 是否处于重绘静默期（心跳应跳过画布存活判定） */
export function isRepaintBusy(): boolean {
  return Date.now() < busyUntil;
}

// ──── 批处理执行包装 ────

/** 支持暂停/恢复重绘的最小 API 形状（避免依赖 GGB 类型定义） */
export interface RepaintToggleApi {
  setRepaintingActive(flag: boolean): void;
}

/**
 * 在批处理窗口内执行一段同步逻辑：暂停重绘 → 执行 → 恢复重绘 + 进入静默期。
 *
 * 用途：Agent 危险工具组、`executeCommands`、`executeToolCalls` 等批量执行入口，
 * 把「N 条命令 = N 次整屏重绘 + N 次代数区逐行重建」压成一次。
 * `fn` 抛错时同样恢复重绘（finally），保证画布不会永久停更。
 */
export function withRepaintBatch<T>(
  api: RepaintToggleApi,
  count: number,
  appMode: "2d" | "3d" | undefined,
  fn: () => T
): T {
  if (!shouldBatch(count, appMode)) return fn();
  api.setRepaintingActive(false);
  try {
    return fn();
  } finally {
    api.setRepaintingActive(true);
    markRepaintBusy();
  }
}
