/**
 * 工具执行器 —— 将 AI 的 Function Calling 请求映射到 GGB API 调用
 *
 * 职责：
 *   1. Zod 校验工具参数
 *   2. 黑名单/安全拦截（eval_raw 禁止 JavaScript/Execute 等）
 *   3. 调用 GGB API 执行
 *   4. 返回统一格式的观察结果（success + result/error）
 */

import type { GGBAppletApi } from "../types/ggb";
import { TOOL_SCHEMAS } from "./tools";
import { GGB_FORBIDDEN_COMMANDS } from "./commands";
import { hexToRgb, fitViewToAspect } from "./ggbBridge";
import { correctCommand } from "./commandCorrect";
import { PHYSICS_CONSTANTS } from "./physics";

// ──── 结果类型 ────

export interface ToolCallRequest {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  tool_call_id: string;
  role: "tool";
  content: string; // JSON 字符串：{ success, result?, error? }
}

// ──── 主入口 ────

/** 执行单个工具调用，返回 tool_result 消息 */
export function executeToolCall(
  api: GGBAppletApi,
  call: ToolCallRequest
): ToolResult {
  const schema = TOOL_SCHEMAS[call.name];
  let args: Record<string, unknown>;

  // Step 1: Zod 校验参数
  if (schema) {
    const parsed = schema.safeParse(call.arguments);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map(i => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      return formatResult(call.id, false, undefined, `参数校验失败：${detail}`);
    }
    args = parsed.data as Record<string, unknown>;
  } else {
    args = call.arguments;
  }

  // Step 2: 安全拦截
  const safetyCheck = checkSafety(call.name, args);
  if (safetyCheck) {
    return formatResult(call.id, false, undefined, safetyCheck);
  }

  // Step 2.5: 语义预检（Pre-flight）——拦截 Zod 查不出、GGB 会崩的逻辑错误
  //    （如负半径、min>=max、端点相同）。字符串表达式无法静态判断 → 仅检查字面量 number。
  const preFlight = preFlightCheck(api, call.name, args);
  if (preFlight) {
    return formatResult(call.id, false, undefined, `执行前检查失败：${preFlight}`);
  }

  // Step 3: 执行
  try {
    const result = dispatch(api, call.name, args);
    return formatResult(call.id, true, result);
  } catch (err) {
    return formatResult(
      call.id,
      false,
      undefined,
      err instanceof Error ? err.message : String(err)
    );
  }
}

/** 批量执行工具调用 */
export function executeToolCalls(
  api: GGBAppletApi,
  calls: ToolCallRequest[],
  appMode?: "2d" | "3d"
): ToolResult[] {
  // ★ 批量执行：暂停重绘 → 逐条 → 恢复（2D/3D 统一）。
  //    旧版曾对 3D 禁用 batch 防 DockGlassPane，升级到 5.4.927.1 后已不复发，
  //    而禁用 batch 会导致代数区逐条重建闪烁（见 ggbBridge.executeCommands 注释）。
  void appMode;
  const useBatch = calls.length > 2;
  if (useBatch) {
    api.setRepaintingActive(false);
  }
  try {
    return calls.map(c => executeToolCall(api, c));
  } finally {
    if (useBatch) {
      api.setRepaintingActive(true);
    }
  }
}

// ──── 分发 ────

/** 创建单个滑块的内部 helper，供 create_slider 和 create_sliders 共用 */
function createOneSlider(
  api: GGBAppletApi,
  args: { name: string; min: number | string; max: number | string; step: number | string; value: number | string; unit?: string; label?: string }
): string {
  const { name: n, min, max, step, value, unit, label } = args;
  const cmd = `${n} = Slider(${min}, ${max}, ${step}, 1, 150, false, true, false, false)`;
  const ok = api.evalCommand(cmd);
  if (!ok) throw new Error(`创建滑块 ${n} 失败`);
  api.evalCommand(`SetValue(${n}, ${value})`);
  const captionText = label
    ? unit ? `${label} = %v ${unit}` : `${label} = %v`
    : unit ? `${n} = %v ${unit}` : "";
  if (captionText) {
    api.setCaption(n, captionText);
    api.setLabelStyle(n, 3);
  }
  return `滑块 ${n} 已创建（${min}~${max}，步长 ${step}，初值 ${value}${unit ? " " + unit : ""}）`;
}

function dispatch(
  api: GGBAppletApi,
  name: string,
  args: Record<string, unknown>
): string {
  switch (name) {
    // ═══ 批量创建（优先使用，减少 API 往返） ═══
    case "create_points": {
      const { points } = args as {
        points: Array<{ name: string; x: number | string; y: number | string; z?: number | string }>;
      };
      const ok: string[] = [];
      const fail: string[] = [];
      for (const p of points) {
        try {
          const coords = p.z !== undefined
            ? `(${p.x}, ${p.y}, ${p.z})`
            : `(${p.x}, ${p.y})`;
          const r = api.evalCommand(`${p.name} = ${coords}`);
          if (!r) throw new Error(`evalCommand 返回 false`);
          ok.push(`${p.name}${coords}`);
        } catch (e) {
          fail.push(`${p.name}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      const parts: string[] = [];
      if (ok.length) parts.push(`✓ ${ok.join(", ")}`);
      if (fail.length) parts.push(`✗ ${fail.join("; ")}`);
      if (!parts.length) throw new Error("批量创建点全部失败");
      return parts.join("  ");
    }

    // ═══ 创建 ═══
    case "create_point": {
      const { name: n, x, y } = args as { name: string; x: number | string; y: number | string; z?: number | string };
      const z = (args as { z?: number | string }).z;
      const coords = z !== undefined
        ? `(${x}, ${y}, ${z})`
        : `(${x}, ${y})`;
      const cmd = `${n} = ${coords}`;
      const ok = api.evalCommand(cmd);
      if (!ok) throw new Error(`创建点 ${n} 失败`);
      return `点 ${n} 已创建于 ${coords}`;
    }

    case "create_segment": {
      const { name: n, start, end } = args as { name: string; start: string; end: string };
      if (!api.exists(start)) throw new Error(`起点 ${start} 不存在`);
      if (!api.exists(end)) throw new Error(`终点 ${end} 不存在`);
      const ok = api.evalCommand(`${n} = Segment(${start}, ${end})`);
      if (!ok) throw new Error(`创建线段 ${n} 失败`);
      return `线段 ${n} 已创建（${start} → ${end}）`;
    }

    case "create_circle": {
      const { name: n, center, radius } = args as { name: string; center: string; radius: number | string };
      if (!api.exists(center)) throw new Error(`圆心 ${center} 不存在`);
      const ok = api.evalCommand(`${n} = Circle(${center}, ${radius})`);
      if (!ok) throw new Error(`创建圆 ${n} 失败`);
      return `圆 ${n} 已创建（圆心 ${center}，半径 ${radius}）`;
    }

    case "create_polygon": {
      const { name: n, vertices } = args as { name: string; vertices: string[] };
      for (const v of vertices) {
        if (!api.exists(v)) throw new Error(`顶点 ${v} 不存在`);
      }
      const ok = api.evalCommand(`${n} = Polygon(${vertices.join(", ")})`);
      if (!ok) throw new Error(`创建多边形 ${n} 失败`);
      return `多边形 ${n} 已创建（${vertices.length} 个顶点）`;
    }

    case "create_sliders": {
      const { sliders } = args as {
        sliders: Array<{ name: string; min: number | string; max: number | string; step: number | string; value: number | string; unit?: string; label?: string }>;
      };
      const results: string[] = [];
      const errors: string[] = [];
      for (const s of sliders) {
        try {
          results.push(createOneSlider(api, s));
        } catch (e) {
          errors.push(`${s.name}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      const parts: string[] = [];
      if (results.length) parts.push(results.join("；"));
      if (errors.length) parts.push(`✗ ${errors.join("; ")}`);
      if (!parts.length) throw new Error("批量创建滑块全部失败");
      return parts.join("  ");
    }

    case "create_slider": {
      return createOneSlider(api, args as {
        name: string; min: number | string; max: number | string; step: number | string; value: number | string;
        unit?: string; label?: string;
      });
    }

    case "create_vector": {
      const { name: n, from, to, color } = args as {
        name: string; from: string; to: string; color?: string;
      };
      if (!api.exists(from)) throw new Error(`起点 ${from} 不存在`);
      const cmd = `${n} = Vector(${from}, ${to})`;
      const ok = api.evalCommand(cmd);
      if (!ok) throw new Error(`创建矢量 ${n} 失败（可能 to="${to}" 包含 Point+Point 或除零）`);
      if (color) {
        const [r, g, b] = hexToRgb(color);
        api.setColor(n, r, g, b);
      }
      api.setLineThickness(n, 4);
      return `矢量 ${n} 已创建（${from} → ${to}）`;
    }

    case "create_text": {
      const { name: n, text, position } = args as { name: string; text: string; position: string };
      if (!api.exists(position)) throw new Error(`定位点 ${position} 不存在`);
      const escaped = text.replace(/"/g, '\\"');
      const ok = api.evalCommand(`${n} = Text("${escaped}", ${position})`);
      if (!ok) throw new Error(`创建文本 ${n} 失败`);
      return `文本 "${text}" 已创建于 ${position}`;
    }

    // ═══ 新增：函数/参数曲线 ═══
    case "create_function": {
      const { name: n, expression } = args as { name: string; expression: string };
      // GGB 自动推断类型：f = sin(x) → 函数，Px = v0*cos(theta)*t → 数值表达式
      // 不必显式写 f(x) = …，避免误判（如 "x^2+y^2" 含字符 x 但不是单变量函数）
      const cmd = `${n} = ${expression}`;
      const ok = api.evalCommand(cmd);
      if (!ok) throw new Error(`创建函数/表达式 ${n} 失败：${cmd}`);
      return `${n} = ${expression} 已创建`;
    }

    case "create_parametric": {
      const { name: n, xExpr, yExpr, zExpr, tMin, tMax } = args as {
        name: string; xExpr: string; yExpr: string; zExpr?: string; tMin: number | string; tMax: number | string;
      };
      const curveCmd = zExpr
        ? `Curve(${xExpr}, ${yExpr}, ${zExpr}, t, ${tMin}, ${tMax})`
        : `Curve(${xExpr}, ${yExpr}, t, ${tMin}, ${tMax})`;
      const cmd = `${n} = ${curveCmd}`;
      const ok = api.evalCommand(cmd);
      if (!ok) throw new Error(`创建参数曲线 ${n} 失败`);
      return `参数曲线 ${n} 已创建（t: ${tMin}→${tMax}）`;
    }

    // ═══ 物理专用 ═══
    case "physics_constants": {
      const { names } = args as { names: string[] };
      const failed: string[] = [];
      for (const name of names) {
        const def = PHYSICS_CONSTANTS[name];
        if (!def) { failed.push(name); continue; }
        if (api.exists(name)) continue;
        api.evalCommand(`${name} = ${def.value}`);
        api.setVisible(name, false);
      }
      const ok = names.filter(n => !failed.includes(n));
      return ok.length > 0
        ? `物理常量已注入：${ok.join(", ")}${failed.length ? `（未知：${failed.join(", ")}）` : ""}`
        : `物理常量注入失败：未知常量 ${failed.join(", ")}`;
    }

    case "create_trace": {
      const { target, mode } = args as { target: string; mode: "trail" | "stroboscopic" };
      if (!api.exists(target)) throw new Error(`轨迹目标 ${target} 不存在`);
      api.setTrace(target, true);
      return mode === "trail"
        ? `轨迹已开启：${target}（拖尾模式）`
        : `轨迹已开启：${target}（频闪模式，实际采样由 Sequence 显式生成）`;
    }

    case "set_unit_axes": {
      const { xUnit, yUnit, xLabel, yLabel } = args as {
        xUnit: string; yUnit: string; xLabel?: string; yLabel?: string;
      };
      const xl = xLabel ? `${xLabel}/${xUnit}` : `/${xUnit}`;
      const yl = yLabel ? `${yLabel}/${yUnit}` : `/${yUnit}`;
      if (api.setAxisLabels) {
        api.setAxisLabels(1, xl, yl, "");
      }
      return `坐标轴已设置：x=${xl} y=${yl}`;
    }

    // ═══ 修改 ═══
    case "set_style": {
      const { target, color, thickness, opacity, dashed, visible, pointSize, pointStyle } = args as {
        target: string; color?: string; thickness?: number; opacity?: number;
        dashed?: boolean; visible?: boolean; pointSize?: number; pointStyle?: number;
      };
      if (!api.exists(target)) throw new Error(`对象 ${target} 不存在`);
      const changes: string[] = [];
      if (color) { const [r, g, b] = hexToRgb(color); api.setColor(target, r, g, b); changes.push(`颜色=${color}`); }
      if (thickness !== undefined) { api.setLineThickness(target, thickness); changes.push(`粗细=${thickness}`); }
      if (dashed !== undefined) { api.setLineStyle(target, dashed ? 1 : 0); changes.push(`虚线=${dashed}`); }
      if (visible !== undefined) { api.setVisible(target, visible); changes.push(`可见=${visible}`); }
      if (pointSize !== undefined) { api.setPointSize(target, pointSize); changes.push(`点大小=${pointSize}`); }
      if (pointStyle !== undefined) { api.setPointStyle(target, pointStyle); changes.push(`点样式=${pointStyle}`); }
      if (opacity !== undefined) {
        if (!api.evalCommand(`SetLineOpacity(${target}, ${opacity})`)) {
          api.setFilling(target, opacity);
        }
        changes.push(`透明度=${opacity}`);
      }
      return `样式已应用：${target}（${changes.join("，")}）`;
    }

    case "set_animation": {
      const { target, action, speed, repeat } = args as {
        target: string; action: "start" | "stop"; speed?: number; repeat?: "oscillating" | "increasing" | "once";
      };
      if (!api.exists(target)) throw new Error(`动画目标 ${target} 不存在`);
      if (speed !== undefined) api.setAnimationSpeed(target, speed);
      if (repeat) {
        const map = { oscillating: 0, increasing: 1, once: 3 };
        api.evalCommand(`SetAnimationType(${target}, ${map[repeat]})`);
      }
      if (action === "start") {
        api.setAnimating(target, true);
        api.startAnimation();
        return `动画已启动：${target}${speed ? " 速度=" + speed : ""}${repeat ? " 模式=" + repeat : ""}`;
      } else {
        api.stopAnimation();
        return `动画已停止：${target}`;
      }
    }

    case "set_view": {
      const { xmin, xmax, ymin, ymax, xUnit, yUnit, showGrid, perspective } = args as {
        xmin?: number; xmax?: number; ymin?: number; ymax?: number;
        xUnit?: string; yUnit?: string; showGrid?: boolean; perspective?: "2d" | "3d";
      };
      const changes: string[] = [];
      if (xmin !== undefined && xmax !== undefined && ymin !== undefined && ymax !== undefined) {
        // ★ 视窗宽高比校正：以画布实际宽高比适配，避免圆变椭圆/比例失真
        const fit = fitViewToAspect(api, xmin, xmax, ymin, ymax);
        api.setCoordSystem(fit.xmin, fit.xmax, fit.ymin, fit.ymax);
        changes.push(`视窗=[${fit.xmin},${fit.xmax}]×[${fit.ymin},${fit.ymax}]（按画布宽高比适配）`);
      }
      if (xUnit && yUnit && api.setAxisUnits) {
        api.setAxisUnits(1, xUnit, yUnit, "");
        changes.push(`轴单位=${xUnit},${yUnit}`);
      }
      if (showGrid !== undefined) {
        api.setGridVisible(showGrid);
        changes.push(`网格=${showGrid}`);
      }
      if (perspective === "3d") {
        api.enable3D(true);
        // ★ 检测当前是否已是 3D 视图——重复 setPerspective("3d") 可能触发
        //    GGB 内部 DockGlassPane 接管视图过度、导致 3D iframe 被销毁。
        //    仅在非 3D 时才切换透视，避免无意义触发 GGB 内部布局 bug。
        const already3D = api.getPerspectiveXML?.()?.includes("3D");
        if (!already3D) {
          api.setPerspective("3d");
        }
        changes.push("3D 透视");
      }
      return changes.length ? `视图已更新：${changes.join("，")}` : "视图未更改（无有效参数）";
    }

    // ═══ 删除 ═══
    case "delete_object": {
      const { target } = args as { target: string };
      if (!api.exists(target)) throw new Error(`对象 ${target} 不存在`);
      api.deleteObject(target);
      return `已删除对象：${target}`;
    }

    case "clear_canvas": {
      api.newConstruction();
      return "画布已清空（所有对象已删除）";
    }

    // ═══ 查询 ═══
    case "get_object_info": {
      const { name: n } = args as { name: string };
      if (!api.exists(n)) throw new Error(`对象 ${n} 不存在`);
      const type = api.getObjectType(n);
      const cmd = api.getCommandString(n);
      const value = api.getValueString?.(n) ?? "";
      return `${n}：类型=${type}，定义=${cmd}${value ? "，值=" + value : ""}`;
    }

    case "list_objects": {
      const { type } = args as { type?: string };
      const all = api.getAllObjectNames(type);
      if (all.length === 0) return "画布为空（无对象）";
      const details: string[] = [];
      for (const n of all.slice(0, 50)) {
        const t = api.getObjectType(n);
        details.push(`${n} (${t})`);
      }
      const suffix = all.length > 50 ? ` …等共 ${all.length} 个对象` : `（共 ${all.length} 个）`;
      return details.join(", ") + suffix;
    }

    // ═══ 高级 ═══
    case "eval_sequence": {
      const { name: n, expr, var: loopVar, start, end, step } = args as {
        name: string; expr: string; var: string; start: number | string; end: number | string; step: number | string;
      };
      const cmd = `${n} = Sequence(${expr}, ${loopVar}, ${start}, ${end}, ${step})`;
      // RAG 纠正：Levenshtein 模糊修正命令名
      const correction = correctCommand(cmd);
      const finalCmd = correction.changed ? correction.corrected : cmd;
      const ok = api.evalCommand(finalCmd);
      if (!ok) throw new Error(`Sequence 执行失败：${finalCmd}`);
      const note = correction.changed
        ? `（已纠正：${correction.suggestions.join("; ")}）`
        : "";
      return `序列 ${n} 已创建${note}`;
    }

    case "eval_raw": {
      const { command } = args as { command: string };
      // RAG 纠正：Levenshtein 模糊修正 + 臆造命令映射
      const correction = correctCommand(command);
      const finalCmd = correction.changed ? correction.corrected : command;
      const ok = api.evalCommand(finalCmd);
      if (!ok) throw new Error(`命令执行失败：${finalCmd}`);
      const note = correction.changed
        ? `（已纠正：${correction.suggestions.join("; ")}）`
        : correction.suggestions.length > 0
        ? `（警告：${correction.suggestions.join("; ")}）`
        : "";
      return `命令已执行：${finalCmd}${note}`;
    }

    default:
      throw new Error(`未知工具：${name}`);
  }
}

// ──── 安全拦截 ────

const FORBIDDEN_RE = new RegExp(
  `\\b(?:${GGB_FORBIDDEN_COMMANDS.join("|")})\\s*\\(`,
  "i"
);

function checkSafety(name: string, args: Record<string, unknown>): string | null {
  if (name === "eval_raw") {
    const cmd = (args as { command: string }).command;
    if (!cmd || cmd.trim().length === 0) return "命令为空";

    // 硬黑名单拦截
    // 剥离字符串字面量后再检查
    const stripped = cmd.replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, "")
      .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, "");
    if (FORBIDDEN_RE.test(stripped)) {
      return `命令被安全拦截：使用了禁止的 GGB 命令。请用专用工具替代。`;
    }

    // XSS 拦截
    if (/<script|javascript:|on\w+=/i.test(cmd)) {
      return "命令被安全拦截：含有危险片段";
    }
  }

  if (name === "delete_object") {
    // 禁止删除系统级对象（_ 前缀的临时对象）
    const target = (args as { target: string }).target;
    if (target.startsWith("_")) {
      return `禁止删除临时对象 ${target}`;
    }
  }

  return null; // 通过
}

/**
 * 语义预检（Pre-flight）——在触发 GGB API 前拦截逻辑错误。
 * 与 Zod 校验互补：Zod 查类型/必填/正则，这里查【跨字段语义】（负半径、min>=max 等）。
 * 字符串表达式（如 radius="R"、"v0*t"）无法静态判断正负 → 仅检查字面量 number。
 * 返回错误文案，或 null（通过）。
 */
function preFlightCheck(
  api: GGBAppletApi,
  name: string,
  args: Record<string, unknown>
): string | null {
  const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

  switch (name) {
    case "create_circle": {
      const radius = args.radius;
      if (isNum(radius) && radius <= 0) {
        return `半径必须为正数，当前 radius=${radius}。建议改为 1 或 2，或引用滑块/表达式（如 "R"）`;
      }
      break;
    }

    case "create_slider":
    case "create_sliders": {
      const list: Array<{ name?: string; min?: unknown; max?: unknown; step?: unknown; value?: unknown }> =
        name === "create_sliders" ? (args.sliders as never[]) ?? [] : [args];
      for (const s of list) {
        const label = s.name ?? "?";
        if (isNum(s.min) && isNum(s.max) && s.min >= s.max) {
          return `滑块 ${label} 的 min(${s.min}) 必须小于 max(${s.max})`;
        }
        if (isNum(s.step) && s.step <= 0) {
          return `滑块 ${label} 的 step 必须为正数，当前=${s.step}`;
        }
        if (isNum(s.value) && isNum(s.min) && isNum(s.max) && (s.value < s.min || s.value > s.max)) {
          return `滑块 ${label} 的初值 ${s.value} 超出范围 [${s.min}, ${s.max}]`;
        }
      }
      break;
    }

    case "create_parametric": {
      if (isNum(args.tMin) && isNum(args.tMax) && args.tMin >= args.tMax) {
        return `参数曲线的 tMin(${args.tMin}) 必须小于 tMax(${args.tMax})`;
      }
      break;
    }

    case "set_view": {
      if (isNum(args.xmin) && isNum(args.xmax) && args.xmin >= args.xmax) {
        return `视窗的 xmin(${args.xmin}) 必须小于 xmax(${args.xmax})`;
      }
      if (isNum(args.ymin) && isNum(args.ymax) && args.ymin >= args.ymax) {
        return `视窗的 ymin(${args.ymin}) 必须小于 ymax(${args.ymax})`;
      }
      break;
    }

    case "create_segment": {
      if (args.start === args.end) {
        return `线段两端点不能相同（start=end=${args.start}）`;
      }
      break;
    }

    case "create_polygon": {
      const vertices = (args.vertices as string[]) ?? [];
      if (new Set(vertices).size < 3) {
        return `多边形至少需要 3 个不同顶点，当前给了 ${vertices.join(", ")}`;
      }
      break;
    }

    case "create_vector": {
      // to 坐标表达式中检测除零风险（静态字面量分母为 0）
      const to = String(args.to ?? "");
      const divByZero = /\/\s*0(?![.\d])/.test(to);
      if (divByZero) {
        return `矢量终点表达式 "${to}" 包含除零（分母为 0），GGB 会报 NaN。请改为 +0.001 防除零`;
      }
      break;
    }

    case "physics_constants": {
      const known = new Set(Object.keys(PHYSICS_CONSTANTS));
      const unknown = (args.names as string[] ?? []).filter(n => !known.has(n));
      if (unknown.length > 0) {
        return `未知物理常量：${unknown.join(", ")}。可用：${[...known].join(", ")}`;
      }
      break;
    }
  }

  // 依赖检查：from/center/position 等引用的对象若存在性可判定且缺失 → 提示
  const refTargets: Array<[string, string]> = [
    ["create_segment", "start"], ["create_segment", "end"],
    ["create_circle", "center"], ["create_text", "position"],
    ["create_trace", "target"], ["set_animation", "target"],
    ["set_style", "target"], ["get_object_info", "name"],
    ["delete_object", "target"],
  ];
  for (const [toolName, field] of refTargets) {
    if (name === toolName) {
      const target = args[field];
      if (typeof target === "string" && !api.exists(target)) {
        return `依赖对象 ${target} 不存在；请先用 create_point / create_slider 等创建它`;
      }
    }
  }

  return null; // 通过
}

// ──── 格式化 ────

function formatResult(
  tool_call_id: string,
  success: boolean,
  result?: string,
  error?: string
): ToolResult {
  return {
    tool_call_id,
    role: "tool",
    content: JSON.stringify({ success, ...(result ? { result } : {}), ...(error ? { error } : {}) }),
  };
}

// ──── 工具调用 → 可重放 GGB eval 命令（供 undo / constructionLog 使用） ────

/**
 * 将一个工具调用映射为等价的 GGB eval 命令列表。
 * 返回空数组表示该工具调用不产生可重放的 eval 命令（如 set_style / set_animation 等 API 调用）。
 * 用于 undo 时重放构造类命令，以及 constructionLog 快照回滚兜底。
 */
export function toolCallToEvalCommands(name: string, argsJson: string): string[] {
  let args: Record<string, unknown>;
  try { args = JSON.parse(argsJson) as Record<string, unknown>; } catch { return []; }

  switch (name) {
    case "create_point": {
      const { name: n, x, y } = args as { name: string; x: number | string; y: number | string; z?: number | string };
      const z = (args as { z?: number | string }).z;
      return z !== undefined ? [`${n} = (${x}, ${y}, ${z})`] : [`${n} = (${x}, ${y})`];
    }
    case "create_points": {
      const { points } = args as { points?: Array<{ name: string; x: number | string; y: number | string; z?: number | string }> };
      return (points ?? []).map(p => {
        const coords = p.z !== undefined ? `(${p.x}, ${p.y}, ${p.z})` : `(${p.x}, ${p.y})`;
        return `${p.name} = ${coords}`;
      });
    }
    case "create_slider": {
      const { name: n, min, max, step, value } = args as { name: string; min: number | string; max: number | string; step: number | string; value: number | string };
      return [`${n} = Slider(${min}, ${max}, ${step}, 1, 150, false, true, false, false)`, `SetValue(${n}, ${value})`];
    }
    case "create_sliders": {
      const { sliders } = args as { sliders?: Array<{ name: string; min: number | string; max: number | string; step: number | string; value: number | string }> };
      return (sliders ?? []).flatMap(s => [
        `${s.name} = Slider(${s.min}, ${s.max}, ${s.step}, 1, 150, false, true, false, false)`,
        `SetValue(${s.name}, ${s.value})`
      ]);
    }
    case "create_segment": {
      const { name: n, start, end } = args as { name: string; start: string; end: string };
      return [`${n} = Segment(${start}, ${end})`];
    }
    case "create_circle": {
      const { name: n, center, radius } = args as { name: string; center: string; radius: number | string };
      return [`${n} = Circle(${center}, ${radius})`];
    }
    case "create_polygon": {
      const { name: n, vertices } = args as { name: string; vertices: string[] };
      return [`${n} = Polygon(${vertices.join(", ")})`];
    }
    case "create_vector": {
      const { name: n, from, to } = args as { name: string; from: string; to: string };
      return [`${n} = Vector(${from}, ${to})`];
    }
    case "create_function": {
      const { name: n, expression } = args as { name: string; expression: string };
      return [`${n} = ${expression}`];
    }
    case "create_parametric": {
      const { name: n, xExpr, yExpr, zExpr, tMin, tMax } = args as {
        name: string; xExpr: string; yExpr: string; zExpr?: string; tMin: number | string; tMax: number | string;
      };
      const curveCmd = zExpr
        ? `Curve(${xExpr}, ${yExpr}, ${zExpr}, t, ${tMin}, ${tMax})`
        : `Curve(${xExpr}, ${yExpr}, t, ${tMin}, ${tMax})`;
      return [`${n} = ${curveCmd}`];
    }
    case "eval_raw": {
      const { command } = args as { command: string };
      return [command];
    }
    case "eval_sequence": {
      const { name: n, expr, var: loopVar, start, end, step } = args as {
        name: string; expr: string; var: string; start: number | string; end: number | string; step: number | string;
      };
      return [`${n} = Sequence(${expr}, ${loopVar}, ${start}, ${end}, ${step})`];
    }
    case "physics_constants": {
      const { names } = args as { names: string[] };
      return (names ?? []).map(n => {
        const def = PHYSICS_CONSTANTS[n];
        return def ? `${n} = ${def.value}` : `# unknown constant: ${n}`;
      });
    }
    // set_style / set_animation / set_view / set_unit_axes / create_trace / create_text
    // delete_object / clear_canvas / get_object_info / list_objects
    // 这些使用 GGB API 而非 eval，不产生可重放的 eval 命令
    default:
      return [];
  }
}
