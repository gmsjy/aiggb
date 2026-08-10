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
import { hexToRgb } from "./ggbBridge";
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
  // ★ 3D 模式禁用 batch：GGB web3d 在 setRepaintingActive(true) 后可能触发内部
  //    布局重组使 3D 视图被 DockGlassPane 替换 → canvas 全部消失（GGB 内部 bug）
  const useBatch = calls.length > 2 && appMode !== "3d";
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

function dispatch(
  api: GGBAppletApi,
  name: string,
  args: Record<string, unknown>
): string {
  switch (name) {
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

    case "create_slider": {
      const { name: n, min, max, step, value, unit, label } = args as {
        name: string; min: number | string; max: number | string; step: number | string; value: number | string;
        unit?: string; label?: string;
      };
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
      const cmd = `${n}(x) = ${expression}`;
      // 如果表达式不含 x，当做普通赋值
      const finalCmd = expression.includes("x") ? cmd : `${n} = ${expression}`;
      const ok = api.evalCommand(finalCmd);
      if (!ok) throw new Error(`创建函数/表达式 ${n} 失败：${finalCmd}`);
      return expression.includes("x")
        ? `函数 ${n}(x) = ${expression} 已创建`
        : `表达式 ${n} = ${expression} 已创建`;
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
        api.setCoordSystem(xmin, xmax, ymin, ymax);
        changes.push(`视窗=[${xmin},${xmax}]×[${ymin},${ymax}]`);
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
