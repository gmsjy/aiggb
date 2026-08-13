/**
 * GeoGebra Bridge —— 见 SPEC.md §4.2 / §4A.3
 *
 * 把 schema 中的 op 翻译为对 GGBAppletApi 的真实调用，并返回每条命令的执行结果。
 * 失败的命令不会中断后续执行，统一返回结果列表交给上层。
 *
 * Phase 1 增强 (2026-08):
 *   - style op 补全 pointSize/pointStyle 原生 API
 *   - 批量执行 setRepaintingActive 包裹（性能优化）
 *   - OP_API_MAP 统一映射表（优先原生 API，无对应才回退 evalCommand）
 *   - exportSVG / exportPDF 导出
 *   - applyCanvasConfig 画布配置（domain 切换时调用）
 */
import type { Command } from "./schema";
import type { GGBAppletApi } from "../types/ggb";
import { PHYSICS_CONSTANTS } from "./physics";

/** 全局自增临时对象 id：避免 vector/forceDiagram 的辅助矢量名跨命令复用导致动态污染 */
let _tmpSeq = 0;
function genTmpId(prefix: string): string {
  return `${prefix}${_tmpSeq++}`;
}

/** 重置临时对象计数器——画布清空 / applet 重建时调用，避免长会话下临时名无限膨胀 */
export function resetTmpIds(): void {
  _tmpSeq = 0;
}

export interface ExecResult {
  ok: boolean;
  command: Command;
  /** 该 op 实际执行的最底层 GGB 命令（供错误回喂 AI） */
  expanded: string[];
  error?: string;
}

/** 把所有命令逐条执行，失败不停。批量操作期间暂停重绘以提升性能。 */
export function executeCommands(api: GGBAppletApi, commands: Command[], appMode?: "2d" | "3d"): ExecResult[] {
  // ★ 批量执行：暂停重绘 → 逐条执行 → 恢复重绘（一次性渲染，避免逐条重绘闪烁）
  //    历史：曾因旧 GGB 5.4.920 的 DockGlassPane 崩溃，对 3D 禁用 batch。
  //    2026-08 升级到官方 5.4.927.1 bundle 后实测：3D batch 不再触发 DockGlassPane
  //    （120 条 3D 命令压测 0 事件），且禁用 batch 会导致代数区 canvasDef 逐步重建闪烁。
  //    故 2D/3D 统一启用 batch。
  void appMode;
  const useBatch = commands.length > 3;
  // DIAGNOSTIC: 记录 batch 前后的 canvas 数量（仅浏览器）
  const inBrowser = typeof document !== "undefined";
  const canvasBefore = inBrowser
    ? (document.getElementById("ggb-container")?.querySelectorAll("canvas")?.length ?? -1)
    : -1;
  console.log("[AiGGB:DIAG] executeCommands: 开始执行", commands.length, "条命令, batch=", useBatch,
    canvasBefore >= 0 ? `canvas=${canvasBefore}` : "");
  if (useBatch) {
    console.log("[AiGGB:DIAG] setRepaintingActive(false) — 暂停重绘");
    api.setRepaintingActive(false);
  }
  try {
    // ★ 方案 A（静态排序）+ 方案 C（分层重试）：
    //    GGB 严格按依赖顺序执行（先点、后线、再面）。模型生成的命令可能乱序，
    //    仅靠 map 按数组顺序执行会导致依赖对象未就绪而失败，或 GGB 静默创建自由点污染。
    //    - orderCommands：按 op 优先级重排（constants→slider→eval→vector→animate→style）
    //    - 分层重试：第一轮执行全部，失败的进下一轮（此时前面成功的已建好依赖）
    const ordered = orderCommands(commands);
    const results = new Map<number, ExecResult>();

    let pending = ordered;
    for (let pass = 0; pass < MAX_EXEC_PASSES && pending.length > 0; pass++) {
      const retry: Array<{ cmd: Command; idx: number }> = [];
      for (const { cmd, idx } of pending) {
        const r = executeOne(api, cmd);
        results.set(idx, r);
        if (!r.ok) {
          console.warn(`[AiGGB:DIAG] executeCommands [${idx}] pass${pass + 1}: ❌ ${cmd.op} 执行失败 —`, r.error);
          // 失败且可重试（非幂等 op 不做多次副作用）→ 下轮重试
          if (pass < MAX_EXEC_PASSES - 1 && !NON_IDEMPOTENT_OPS.has(cmd.op)) {
            retry.push({ cmd, idx });
          }
        }
      }
      pending = retry;
    }

    // ★ 对齐原始 commands 数组顺序返回（constructionLog 回滚重放需按模型生成顺序）
    return commands.map((_, i) => results.get(i) as ExecResult);
  } finally {
    if (useBatch) {
      console.log("[AiGGB:DIAG] setRepaintingActive(true) — 恢复重绘 (可能触发大量 GPU 渲染)");
      api.setRepaintingActive(true);
      // ★ DIAGNOSTIC: setRepaintingActive(true) 是已知的 canvas 消失触发点
      const canvasAfter = inBrowser
        ? (document.getElementById("ggb-container")?.querySelectorAll("canvas")?.length ?? -1)
        : -1;
      if (canvasAfter === 0 && canvasBefore > 0) {
        console.error(`[AiGGB:DIAG] ⚠⚠⚠ setRepaintingActive(true) 后 canvas 从 ${canvasBefore} → 0！GGB 内部渲染容器重建失败！`);
      } else if (canvasBefore >= 0) {
        console.log(`[AiGGB:DIAG] setRepaintingActive(true) 后 canvas=${canvasAfter} (之前=${canvasBefore})`);
      }
    }
  }
}

/** 分层重试的最大轮数（第 1 轮 + 2 次重试），覆盖 eval 内部依赖乱序 */
const MAX_EXEC_PASSES = 3;

/** op 静态执行优先级：数值越小越先执行。覆盖 GGB 的依赖顺序（先点、后线、再面）。 */
const OP_PRIORITY: Record<string, number> = {
  constants: 0,      // 物理常量先注入
  slider: 1,         // 滑块
  eval: 2,           // 点/线/面（内部乱序靠分层重试解决）
  vector: 3,         // 引用已存在的点
  forceDiagram: 3,
  animate: 4,        // 引用滑块/点
  trace: 4,
  physicsTrace: 4,
  style: 5,          // 引用已创建对象
  caption: 5,
  view: 6,           // 视窗最后
  unitAxes: 6,
  delete: 7,         // 删除放最后（不挡构造）
  reset: 7,
};

/** 非幂等 op：分层重试时跳过（重复执行有副作用） */
const NON_IDEMPOTENT_OPS = new Set(["delete", "reset"]);

/**
 * 按 op 依赖优先级重排命令（方案 A：跨 op 静态排序）。
 * 仅改变执行次序；调用方负责把返回结果映射回原始顺序。
 */
export function orderCommands(commands: Command[]): Array<{ cmd: Command; idx: number }> {
  return commands
    .map((cmd, idx) => ({ cmd, idx }))
    .sort((a, b) => (OP_PRIORITY[a.cmd.op] ?? 9) - (OP_PRIORITY[b.cmd.op] ?? 9));
}

function executeOne(api: GGBAppletApi, cmd: Command): ExecResult {
  const expanded: string[] = [];
  try {
    switch (cmd.op) {
      case "eval": {
        expanded.push(cmd.cmd);
        const ok = api.evalCommand(cmd.cmd);
        return { ok, command: cmd, expanded, error: ok ? undefined : "GGB evalCommand 返回 false" };
      }

      case "slider": {
        // GGB Slider 语法： name = Slider(min, max, step, speed, width, isAngle, horizontal, animating, random)
        const sliderCmd = `${cmd.name} = Slider(${cmd.min}, ${cmd.max}, ${cmd.step}, 1, 150, false, true, false, false)`;
        expanded.push(sliderCmd);
        const ok = api.evalCommand(sliderCmd);
        if (!ok) return { ok, command: cmd, expanded, error: "滑块创建失败" };
        // 初值
        api.evalCommand(`SetValue(${cmd.name}, ${cmd.value})`);
        // 标注
        const captionText = cmd.label
          ? cmd.unit
            ? `${cmd.label} = %v ${cmd.unit}`
            : `${cmd.label} = %v`
          : cmd.unit
          ? `${cmd.name} = %v ${cmd.unit}`
          : "";
        if (captionText) {
          api.setCaption(cmd.name, captionText);
          api.setLabelStyle(cmd.name, 3); // NAME_VALUE_CAPTION → 3 (caption)
        }
        return { ok: true, command: cmd, expanded };
      }

      case "animate": {
        // 目标存在性预检：动画目标必须是已存在对象（通常是滑块 / 点）
        if (!api.exists(cmd.target)) {
          return {
            ok: false,
            command: cmd,
            expanded: [],
            error: `动画目标 ${cmd.target} 不存在；请先通过 slider 或 eval 创建该对象，再启动动画`
          };
        }
        if (cmd.speed !== undefined) {
          api.setAnimationSpeed(cmd.target, cmd.speed);
        }
        if (cmd.repeat) {
          // GGB 动画类型：0 oscillating, 1 increasing, 2 decreasing, 3 increasing once
          // ★ 无原生 API，必须走 evalCommand；但 SetAnimationType 在白名单中，合法
          const map = { oscillating: 0, increasing: 1, once: 3 } as const;
          api.evalCommand(`SetAnimationType(${cmd.target}, ${map[cmd.repeat]})`);
        }
        api.setAnimating(cmd.target, cmd.on);
        if (cmd.on) api.startAnimation();
        else api.stopAnimation();
        return { ok: true, command: cmd, expanded };
      }

      case "trace": {
        // 目标存在性预检：轨迹目标必须是已存在对象
        if (!api.exists(cmd.target)) {
          return {
            ok: false,
            command: cmd,
            expanded: [],
            error: `轨迹目标 ${cmd.target} 不存在；请先通过 eval 创建该对象，再开启轨迹`
          };
        }
        api.setTrace(cmd.target, cmd.on);
        return { ok: true, command: cmd, expanded };
      }

      case "style": {
        // ★ 使用 OP_API_MAP 统一分发：优先原生 API
        if (cmd.color) {
          const [r, g, b] = hexToRgb(cmd.color);
          api.setColor(cmd.target, r, g, b);
        }
        if (cmd.thickness !== undefined) api.setLineThickness(cmd.target, cmd.thickness);
        if (cmd.visible !== undefined) api.setVisible(cmd.target, cmd.visible);
        if (cmd.dashed) api.setLineStyle(cmd.target, 1);
        if (cmd.pointSize !== undefined) api.setPointSize(cmd.target, cmd.pointSize);
        if (cmd.pointStyle !== undefined) api.setPointStyle(cmd.target, cmd.pointStyle);
        if (cmd.opacity !== undefined) {
          // ★ SetLineOpacity 无原生 API，必须走 evalCommand；
          //    若对象不支持（如 3D 立体）则回退 setFilling
          const opacityCmd = `SetLineOpacity(${cmd.target}, ${cmd.opacity})`;
          expanded.push(opacityCmd);
          if (!api.evalCommand(opacityCmd)) {
            api.setFilling(cmd.target, cmd.opacity);
          }
        }
        return { ok: true, command: cmd, expanded };
      }

      case "view": {
        api.setCoordSystem(cmd.xmin, cmd.xmax, cmd.ymin, cmd.ymax);
        if (cmd.axesUnit && api.setAxisUnits) {
          api.setAxisUnits(1, cmd.axesUnit[0], cmd.axesUnit[1], "");
        }
        return { ok: true, command: cmd, expanded };
      }

      case "caption": {
        api.setCaption(cmd.target, cmd.text);
        api.setLabelStyle(cmd.target, 3);
        return { ok: true, command: cmd, expanded };
      }

      case "delete": {
        // ★ 与 toolExecutor.delete_object 保持一致：目标不存在时报错
        //    （提示 LLM 对象名可能拼错，而非静默 no-op 让画布处于意外状态）
        if (!api.exists(cmd.target)) {
          return {
            ok: false,
            command: cmd,
            expanded: [],
            error: `对象 ${cmd.target} 不存在，无法删除；请检查对象名（可用 list_objects 确认）`
          };
        }
        api.deleteObject(cmd.target);
        return { ok: true, command: cmd, expanded };
      }

      case "reset": {
        console.warn("[AiGGB:DIAG] ★ newConstruction() — 清空画布所有对象!");
        api.newConstruction();
        resetTmpIds();
        return { ok: true, command: cmd, expanded };
      }

      // —— 物理基元 ——
      case "vector": {
        const startOk = isCoordLiteral(cmd.from) || api.exists(cmd.from);
        if (!startOk) {
          return {
            ok: false,
            command: cmd,
            expanded: [`${cmd.name} = Vector(${cmd.from}, ${cmd.to})`],
            error: `起点 ${cmd.from} 不存在；请先用 eval 命令创建该 Point，或把 from 改成坐标字面量如 "(0,0)"`
          };
        }

        // 容错：检测 "block + Gvec" 模式 —— Gvec 是 Point 则 Point+Point 会崩
        // 自动转换为 "Vector(at, at + Vector((0,0), offset))" = Point+Vector 安全形式
        const plusMatch = /^(.+)\s*\+\s*(\w[\w.]*)\s*$/.exec(cmd.to.trim());
        if (plusMatch) {
          const atExpr = plusMatch[1].trim();
          const offsetVar = plusMatch[2].trim();
          // 偏移量必须是已存在的 GGB 对象（不是字面量）才需要转换
          if (!isCoordLiteral(offsetVar) && api.exists(offsetVar)) {
            // 两步法：先把偏移量转成真正的 Vector，再 Point+Vector
            // 临时名用全局自增 id，避免多条 vector op 复用同名临时对象导致动态污染
            const tmpId = genTmpId("_vv");
            const c1 = `${tmpId} = Vector((0,0), ${offsetVar})`;
            expanded.push(c1);
            let ok = api.evalCommand(c1);
            if (ok) {
              const c2 = `${cmd.name} = Vector(${atExpr}, ${atExpr} + ${tmpId})`;
              expanded.push(c2);
              ok = api.evalCommand(c2);
              api.setVisible(tmpId, false);
            }
            if (ok) {
              if (cmd.color) {
                const [r, g, b] = hexToRgb(cmd.color);
                api.setColor(cmd.name, r, g, b);
              }
              api.setLineThickness(cmd.name, 4);
              if (cmd.label) {
                api.setCaption(cmd.name, cmd.label);
                api.setLabelStyle(cmd.name, 3);
              }
              return { ok: true, command: cmd, expanded };
            }
            return {
              ok: false,
              command: cmd,
              expanded,
              error: `矢量创建失败：to="${cmd.to}" 中 ${offsetVar} 是 Point 不是 Vector（GGB 中 Point+Point 未定义）。请改用 forceDiagram op，或把偏移量写成画括字面量 "(...,...)" 而非赋给变量`
            };
          }
        }

        const vCmd = `${cmd.name} = Vector(${cmd.from}, ${cmd.to})`;
        expanded.push(vCmd);
        const ok = api.evalCommand(vCmd);
        if (!ok) {
          return {
            ok,
            command: cmd,
            expanded,
            error: `矢量创建失败。可能原因：(1) to="${cmd.to}" 包含 Point+Point；(2) to 表达式出现 NaN/除零。请改用 forceDiagram op 自动处理类型安全，或确保 to 为坐标字面量`
          };
        }
        if (cmd.color) {
          const [r, g, b] = hexToRgb(cmd.color);
          api.setColor(cmd.name, r, g, b);
        }
        api.setLineThickness(cmd.name, 4);
        if (cmd.label) {
          api.setCaption(cmd.name, cmd.label);
          api.setLabelStyle(cmd.name, 3);
        }
        return { ok: true, command: cmd, expanded };
      }

      case "forceDiagram": {
        const startOk = isCoordLiteral(cmd.at) || api.exists(cmd.at);
        if (!startOk) {
          return {
            ok: false,
            command: cmd,
            expanded: [],
            error: `力图作用点 ${cmd.at} 不存在；请先用 eval 命令创建该 Point（例如 "block = (2*cos(theta), 2*sin(theta))")，或把 at 改成坐标字面量`
          };
        }
        const failed: string[] = [];
        for (let fi = 0; fi < cmd.forces.length; fi++) {
          const f = cmd.forces[fi];
          // 临时名全局自增：单个 forceDiagram 内 fi 唯一，跨命令也唯一
          const tmpId = genTmpId("_fv");
          // Step 1: 用 Vector((0,0), endPoint) 创建位移矢量（而非 Point 相加）
          //         GGB 中 Vector((0,0),(dx,dy)) 始终产生 Vector，不会被推断为 Point
          const tmpCmd = `${tmpId} = Vector((0,0), ${f.vec})`;
          expanded.push(tmpCmd);
          let ok = api.evalCommand(tmpCmd);
          if (!ok) {
            failed.push(`${f.name} (位移矢量创建失败)`);
            continue;
          }
          // Step 2: Point + Vector = translated Point（GGB 保证成立）
          const vCmd = `${f.name} = Vector(${cmd.at}, ${cmd.at} + ${tmpId})`;
          expanded.push(vCmd);
          ok = api.evalCommand(vCmd);
          if (!ok) {
            failed.push(`${f.name} (终点计算失败)`);
            continue;
          }
          if (f.color) {
            const [r, g, b] = hexToRgb(f.color);
            api.setColor(f.name, r, g, b);
          } else {
            const [r, g, b] = hexToRgb("#e53935");
            api.setColor(f.name, r, g, b);
          }
          api.setLineThickness(f.name, 4);
          if (f.label) {
            api.setCaption(f.name, f.label);
            api.setLabelStyle(f.name, 3);
          }
          // 隐藏辅助矢量
          api.setVisible(tmpId, false);
        }
        return failed.length === 0
          ? { ok: true, command: cmd, expanded }
          : { ok: false, command: cmd, expanded, error: `力矢量创建失败: ${failed.join(", ")}` };
      }

      case "physicsTrace": {
        // MVP 阶段：trail 走原生 trace；stroboscopic 也启用 trace，并提示 AI 在需要时显式生成 Sequence 采样
        api.setTrace(cmd.target, true);
        return { ok: true, command: cmd, expanded };
      }

      case "unitAxes": {
        const xLabel = cmd.xLabel ? `${cmd.xLabel}/${cmd.xUnit}` : `/${cmd.xUnit}`;
        const yLabel = cmd.yLabel ? `${cmd.yLabel}/${cmd.yUnit}` : `/${cmd.yUnit}`;
        api.setAxisLabels(1, xLabel, yLabel, "");
        return { ok: true, command: cmd, expanded };
      }

      case "constants": {
        for (const name of cmd.names) {
          const def = PHYSICS_CONSTANTS[name];
          if (!def) continue;
          if (api.exists(name)) continue; // 已存在不重复
          const c = `${name} = ${def.value}`;
          expanded.push(c);
          api.evalCommand(c);
          api.setVisible(name, false); // 常量不显示在画布
        }
        return { ok: true, command: cmd, expanded };
      }

      default: {
        // schema 已约束 op，此处兜底防未来扩展遗漏
        return {
          ok: false,
          command: cmd,
          expanded,
          error: `未知 op：${(cmd as { op?: string }).op ?? "(无)"}`
        };
      }
    }
  } catch (err) {
    console.error(`[AiGGB:DIAG] executeOne 抛出异常 (${cmd.op}):`, err instanceof Error ? err.message : String(err));
    return {
      ok: false,
      command: cmd,
      expanded,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

// ──── 样式操作统一映射表 (OP_API_MAP) ────

/**
 * style op 子操作的 {原生 API 调用 / evalCommand 回退} 映射。
 * 优先使用原生 API（更快、类型安全）；仅当无对应原生 API 时才回退 evalCommand。
 *
 * 键命名：style_{子字段名}
 * 值：null 表示「无原生 API，必须走 evalCommand」
 */
export const OP_API_MAP = {
  // 原生 API 可用
  style_color: (api: GGBAppletApi, target: string, hex: string) => {
    const [r, g, b] = hexToRgb(hex);
    api.setColor(target, r, g, b);
  },
  style_thickness: (api: GGBAppletApi, target: string, t: number) => api.setLineThickness(target, t),
  style_visible: (api: GGBAppletApi, target: string, v: boolean) => api.setVisible(target, v),
  style_dashed: (api: GGBAppletApi, target: string) => api.setLineStyle(target, 1),
  style_pointSize: (api: GGBAppletApi, target: string, s: number) => api.setPointSize(target, s),
  style_pointStyle: (api: GGBAppletApi, target: string, s: number) => api.setPointStyle(target, s),
  style_filling: (api: GGBAppletApi, target: string, v: number) => api.setFilling(target, v),

  // 无原生 API，必须走 evalCommand（在白名单中，合法）
  style_opacity: null, // → SetLineOpacity(target, opacity)
  animate_repeat: null, // → SetAnimationType(target, type)

  // 动画控制（原生 API 可用）
  animate_start: (api: GGBAppletApi) => api.startAnimation(),
  animate_stop: (api: GGBAppletApi) => api.stopAnimation(),
  animate_speed: (api: GGBAppletApi, target: string, speed: number) => api.setAnimationSpeed(target, speed),
  animate_set: (api: GGBAppletApi, target: string, on: boolean) => api.setAnimating(target, on),

  // 3D 模式
  view3D_enable: (api: GGBAppletApi) => api.enable3D(true),
  view3D_perspective: (api: GGBAppletApi) => api.setPerspective("3d"),
} as const;

// ──── 画布配置 ────

/** 画布模式 */
export type CanvasMode = "2d" | "3d";
/** 领域 */
export type CanvasDomain = "general" | "physics";

/**
 * 根据 domain / mode 应用画布级配置。
 * 在 domain 切换或画布就绪时调用。
 */
export function applyCanvasConfig(
  api: GGBAppletApi,
  domain: CanvasDomain,
  mode: CanvasMode
): void {
  // 教学场景防误操作：禁止右键菜单和标签拖拽
  api.enableRightClick(false);
  api.enableLabelDrags(false);

  // 物理 / 立体几何模式下开启 3D
  if (mode === "3d") {
    api.enable3D(true);
  }

  // 关闭即时点创建（防止工具误触生成匿名点）
  api.setOnTheFlyPointCreationActive(false);

  // 网格：物理域默认开启便于量读
  if (domain === "physics") {
    api.setGridVisible(true);
  }

  // 错误对话框关闭（静默处理，由前端捕获展示）
  api.setErrorDialogsActive(false);
}

// ──── 导出 ────

/** 导出当前画布为 base64 编码的 .ggb 文件内容（不含 data: 前缀） */
export function exportGGB(api: GGBAppletApi): Promise<string> {
  return new Promise(resolve => {
    api.getBase64(data => resolve(data));
  });
}

/** 导出 PNG（DataURL） */
export function exportPNG(api: GGBAppletApi): string {
  const base64 = api.getPNGBase64(1, false, 96);
  return `data:image/png;base64,${base64}`;
}

/** 导出 SVG（回调式，3D 视图返回 null） */
export function exportSVG(api: GGBAppletApi): Promise<string | null> {
  return new Promise(resolve => {
    api.exportSVG((svg: string | null) => resolve(svg));
  });
}

/** 导出 PDF（回调式） */
export function exportPDF(api: GGBAppletApi, scale = 1): Promise<string> {
  return new Promise(resolve => {
    api.exportPDF(scale, (pdf: string) => resolve(pdf));
  });
}

// ──── 画布快照（供满足度评估使用） ────

/**
 * 生成画布富文本快照：对象名 → 类型 → 定义 → 值 → 样式 → 标注 → 可见性。
 * 包含完整的样式元数据（颜色/粗细/线型/透明度/点样式），
 * 供纯文本模型做逻辑审查——不需要"看"图形，读快照即可核对。
 */
export function getRichSnapshot(api: GGBAppletApi): string {
  const names = api.getAllObjectNames();
  console.log("[AiGGB:DIAG] getRichSnapshot —", names.length, "个对象:", names.slice(0, 10).join(","), names.length > 10 ? `...(${names.length - 10} more)` : "");
  if (names.length === 0) return "(空画布)";

  const lines: string[] = [];
  for (const name of names) {
    const parts: string[] = [];
    const type = api.getObjectType(name);
    const def = api.getCommandString(name) || api.getDefinitionString(name);

    // 基本信息：名称、类型、定义
    parts.push(`${name} (${type}): ${def}`);

    // 值（点取坐标，其他取值）
    try {
      if (type === "point" || type === "vector") {
        const xs = safeNum(api.getXcoord(name));
        const ys = safeNum(api.getYcoord(name));
        const zs = safeNum(api.getZcoord?.(name));
        parts.push(`  pos=(${xs}, ${ys}${zs !== undefined ? `, ${zs}` : ""})`);
      } else if (type === "slider" || type === "number") {
        parts.push(`  value=${safeNum(api.getValue(name))}`);
      }
    } catch { /* 部分对象可能无值 */ }

    // 样式元数据（仅当非默认值时输出，减少 token）
    try {
      const styleMeta: string[] = [];
      const color = api.getColor(name);
      if (color && color !== "#000000") styleMeta.push(`color=${color}`);
      const thickness = api.getLineThickness?.(name);
      if (thickness && thickness > 1) styleMeta.push(`thickness=${thickness}`);
      const lineStyle = api.getLineStyle?.(name);
      if (lineStyle && lineStyle > 0) styleMeta.push(`dashed`);
      const filling = api.getFilling?.(name);
      if (filling !== undefined && filling < 1) styleMeta.push(`opacity=${filling.toFixed(2)}`);
      const ptSize = api.getPointSize?.(name);
      // Point size default varies; report only if set
      const ptStyle = api.getPointStyle?.(name);
      if (ptStyle !== undefined && ptStyle > 0) styleMeta.push(`pointStyle=${ptStyle}`);
      if (ptSize !== undefined && ptSize > 1) styleMeta.push(`pointSize=${ptSize}`);
      const caption = api.getCaption?.(name, true);
      if (caption) styleMeta.push(`caption="${caption}"`);
      const visible = api.getVisible(name);
      if (visible === false) styleMeta.push(`hidden`);
      if (styleMeta.length) parts.push(`  style: ${styleMeta.join(", ")}`);
    } catch { /* 样式 API 可能对新对象类型不可用 */ }

    lines.push(parts.join("\n"));
  }
  return lines.join("\n\n");
}

/** 保留旧版简单快照作为别名（agent loop / tool executor 仍在使用） */
export function getCanvasSnapshot(api: GGBAppletApi): string {
  return getRichSnapshot(api);
}

function safeNum(v: number | undefined | null): string {
  if (v === undefined || v === null) return "?";
  if (!Number.isFinite(v)) return v.toString();
  return Number.isInteger(v) ? v.toString() : v.toFixed(4);
}

// ──── 工具函数 ────

export function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace(/^#/, "");
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16)
  ];
}

/** 粗略判断字符串是不是 GGB 坐标字面量，如 "(1,2)" / "(a, b+1)" */
function isCoordLiteral(s: string): boolean {
  return /^\s*\(/.test(s) && /\)\s*$/.test(s);
}

/** 把一组 ExecResult 中失败项汇总成传给 prompts.buildCheckerPrompt 的入参 */
export function collectFailures(results: ExecResult[]): { cmd: string; error: string }[] {
  return results
    .filter(r => !r.ok)
    .map(r => ({
      cmd: r.expanded.length ? r.expanded.join("; ") : JSON.stringify(r.command),
      error: diagnose(r) ?? "未知错误"
    }));
}

/** 启发式诊断：根据失败命令内容给出更具体的修复建议 */
function diagnose(r: ExecResult): string | undefined {
  const raw = r.error ?? "";
  if (/Vector/i.test(raw)) {
    const cmdStr = r.expanded.join(" ") + JSON.stringify(r.command);
    if (/\/\s*Emag/i.test(cmdStr) || /\/\s*E_y/i.test(cmdStr) || /\/\s*E\b/i.test(cmdStr)) {
      return `矢量创建失败，很可能是分母在某个网格点处为零。请检查：(1) 分母是否加了 +0.001 防除零？(2) Ex/Ey 在电荷位置处是否产生 NaN？`;
    }
    if (/\b(Ex|Ey|E)\s*\(/i.test(cmdStr)) {
      const cmdStr2 = r.expanded.join(" ");
      if (!/\+0\.0*[0-9]/.test(cmdStr2)) {
        return `矢量创建失败，疑似分母缺少 epsilon 防护。请在所有分母含 (x-x0)^2+y^2 的表达式中加 +0.001：((x-x0)^2+y^2+0.001)^1.5`;
      }
    }
    return `矢量创建失败，可能原因：(1) from/to 使用了尚未声明的对象名；(2) 表达式在 Sequence 内产生了 undefined；(3) 分母除零。请用坐标字面量 "(x,y)" 代替对象名，并在所有距离平方分母中加 +0.001`;
  }
  if (/Slider/i.test(raw)) {
    return "滑块创建失败，检查 Slider(min, max, step, ...) 参数是否合法（step>0, min<max）";
  }
  return raw;
}

// ──── 手动模式切换 ────

/** 注册 setAppName 回调（ChatPanel 调用前由 App 注入，供手动 2D↔3D 切换使用） */
let _setAppNameFn: ((name: "classic" | "3d") => void) | null = null;

export function registerAppNameSetter(fn: (name: "classic" | "3d") => void): void {
  _setAppNameFn = fn;
}

/** 手动切换 applet 模式（由 Toolbar 2D/3D 按钮调用） */
export function switchAppletMode(name: "classic" | "3d"): void {
  console.log(`[AiGGB] switching appName to '${name}'`);
  if (_setAppNameFn) {
    _setAppNameFn(name);
    console.log(`[AiGGB] setAppName('${name}') called → GGBCanvas will rebuild`);
  } else {
    console.warn("[AiGGB] setAppName not registered");
  }
}
