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
import { hexToRgb, fitViewToAspect, isScriptingCommand } from "./ggbBridge";
import { correctCommand } from "./commandCorrect";
import { validateGGBCommand } from "./commandValidate";
import { shouldBatch, markRepaintBusy } from "./repaintGate";
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
  call: ToolCallRequest,
  appMode?: "2d" | "3d"
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
    const result = dispatch(api, call.name, args, appMode);
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
  // ★ 批量执行：暂停重绘 → 逐条 → 恢复（策略见 repaintGate.shouldBatch）。
  //    实测证据：不批处理时每条命令都会让代数区（avOutput / avDefinition / canvasDef）
  //    逐行重建，就是用户看到的绘图闪烁。任何非空批次都批处理；3D 可由用户关闭。
  const useBatch = shouldBatch(calls.length, appMode);
  if (useBatch) {
    api.setRepaintingActive(false);
  }
  try {
    return calls.map(c => executeToolCall(api, c, appMode));
  } finally {
    if (useBatch) {
      api.setRepaintingActive(true);
      // ★ 恢复重绘后进入静默期，避免心跳把 GGB 整屏重绘的瞬时空白误判为画布消失
      markRepaintBusy();
    }
  }
}

// ──── 分发 ────

/** 组装 transform_object 的 GGB 命令（dispatch 与重放映射共用）。参数缺失返回 null */
function buildTransformCommand(args: Record<string, unknown>): string | null {
  const { name: n, mode, target } = args as { name: string; mode: string; target: string };
  switch (mode) {
    case "reflect":
      return args.line !== undefined ? `${n} = Reflect(${target}, ${String(args.line)})` : null;
    case "rotate":
      return args.center !== undefined && args.angle !== undefined
        ? `${n} = Rotate(${target}, ${typeof args.angle === "number" ? args.angle + "°" : String(args.angle)}, ${String(args.center)})`
        : null;
    case "translate":
      return args.vector !== undefined ? `${n} = Translate(${target}, ${String(args.vector)})` : null;
    case "dilate":
      return args.center !== undefined && args.factor !== undefined
        ? `${n} = Dilate(${target}, ${String(args.factor)}, ${String(args.center)})`
        : null;
    default:
      return null;
  }
}

/** 组装 eval_sequence 的 GGB 命令（dispatch / 重放映射 / 自动降档判定共用） */
export function buildSequenceCommand(args: {
  name: string; expr: string; var: string;
  start: unknown; end: unknown; step: unknown;
}): string {
  return `${args.name} = Sequence(${args.expr}, ${args.var}, ${args.start}, ${args.end}, ${args.step})`;
}

/** 组装 create_readout 的 Text 命令（dispatch 与重放映射共用）。round 小写——大写 Round 在自托管 bundle 不可用 */
function buildReadoutCommand(
  name: string,
  at: string,
  items: Array<{ label: string; expr: string; unit?: string; decimals?: number }>
): string {
  const esc = (s: string) => s.replace(/"/g, "");
  const segs = items.map(it => {
    const dec = typeof it.decimals === "number" && it.decimals >= 0 && it.decimals <= 4 ? Math.floor(it.decimals) : 1;
    return `${esc(it.label)} = " + round(${it.expr}, ${dec}) + "${esc(it.unit ?? "")}`;
  });
  return `${name} = Text("${segs.join('" + " | " + "')}", ${at})`;
}

/** 组装 create_spring 的命令列表（助手长度 + 锯齿 PolyLine + 隐藏助手；dispatch 与重放映射共用） */
function buildSpringCommands(
  name: string, from: string, to: string, coils: number, amp: number
): string[] {
  const lenName = `${name}Len`;
  const pts = `(x(${from}) + (x(${to}) - x(${from})) * k / ${2 * coils} - (y(${to}) - y(${from})) * ${amp} / ${lenName} * sin(k * pi / ${coils}), y(${from}) + (y(${to}) - y(${from})) * k / ${2 * coils} + (x(${to}) - x(${from})) * ${amp} / ${lenName} * sin(k * pi / ${coils}))`;
  return [
    `${lenName} = Distance(${from}, ${to}) + 0.001`,
    `${name} = PolyLine(Sequence(${pts}, k, 0, ${2 * coils}))`,
    `SetVisibleInView(${lenName}, 1, false)`,
  ];
}

// ──── 分形：L-system + 海龟图形（TS 侧数值生成）。注：Zip/Flatten/Element/KeepIf 在自托管
//      bundle（5.4.927）实测可用（含 Zip 内嵌 If、变长展开+Flatten），列表代数做分形不可行
//      的真实原因是：每一代重写须静态展开（无循环）、乌龟状态折叠依赖 O(n²) 前缀和技巧、
//      深度无法滑块驱动——TS 数值生成更可靠。真正不可用的命令：El（从无此命令，正确名
//      Element）、大写 Round（仅小写函数 round）、小写 mod（仅大写命令 Mod）、CumulativeSum ────

/** PolyLine 单命令段数护栏（4096 段实测 ~540ms 可接受，取 4500 留余量） */
const FRACTAL_MAX_SEGMENTS = 4500;

const FRACTAL_SPECS: Record<string, { axiom: string; rules: Record<string, string>; angleDeg: number; growth: number }> = {
  koch: { axiom: "F", rules: { F: "F+F--F+F" }, angleDeg: 60, growth: 4 },
  snowflake: { axiom: "F--F--F", rules: { F: "F+F--F+F" }, angleDeg: 60, growth: 4 },
  sierpinski: { axiom: "A", rules: { A: "B-A-B", B: "A+B+A" }, angleDeg: 60, growth: 3 },
  dragon: { axiom: "F", rules: { F: "F+G", G: "F-G" }, angleDeg: 90, growth: 2 },
};

/** 生成分形 PolyLine 的坐标串。深度超段数护栏时自动截断到允许的最大深度 */
export function buildFractalPolyLine(
  kind: "koch" | "snowflake" | "sierpinski" | "dragon",
  depth: number
): { coords: string; segments: number; depth: number } {
  const spec = FRACTAL_SPECS[kind];
  const initSegs = (spec.axiom.match(/F|A|B/g) || []).length;
  let d = Math.max(1, Math.floor(Number(depth) || 1));
  while (d > 1 && initSegs * Math.pow(spec.growth, d) > FRACTAL_MAX_SEGMENTS) d--;

  let s = spec.axiom;
  for (let i = 0; i < d; i++) {
    let next = "";
    for (const ch of s) next += spec.rules[ch] ?? ch;
    s = next;
  }
  const rad = (spec.angleDeg * Math.PI) / 180;
  const pts: string[] = [];
  let x = 0, y = 0, head = 0;
  pts.push(`(${x.toFixed(4)}, ${y.toFixed(4)})`);
  for (const ch of s) {
    if (ch === "F" || ch === "A" || ch === "B") {
      x += Math.cos(head);
      y += Math.sin(head);
      pts.push(`(${x.toFixed(4)}, ${y.toFixed(4)})`);
    } else if (ch === "+") head += rad;
    else if (ch === "-") head -= rad;
  }
  if (kind === "snowflake") pts.push(pts[0]); // 闭合
  return { coords: pts.join(", "), segments: pts.length - 1, depth: d };
}

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
  args: Record<string, unknown>,
  appMode?: "2d" | "3d"
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
      // ★ 全部失败 → 硬失败（与旧 create_point 同口径）：否则 success:true 会骗过熔断与回放分类
      if (ok.length === 0) throw new Error(`批量创建点全部失败：${fail.join("; ")}`);
      return parts.join("  ");
    }

    // ═══ 创建 ═══
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
      // ★ 全部失败 → 硬失败（同 create_points 口径）
      if (results.length === 0) throw new Error(`批量创建滑块全部失败：${errors.join("; ")}`);
      return parts.join("  ");
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

    // ═══ 几何动词层（transform 保留——°单位/按模式必填参数是真智能；
    //     薄包装单命令 line/midpoint/intersect/locus 已由免确认 eval_raw + KB 惯用法承接） ═══
    case "transform_object": {
      const { name: n, mode, target } = args as { name: string; mode: string; target: string };
      if (!api.exists(target)) throw new Error(`变换目标 ${target} 不存在`);
      const cmd = buildTransformCommand(args);
      if (!cmd) throw new Error(`变换参数不完整：mode=${mode}（按工具描述补全必填参数）`);
      const ok = api.evalCommand(cmd);
      if (!ok) throw new Error(`变换 ${mode} 执行失败：${cmd}`);
      const labels: Record<string, string> = { reflect: "轴对称", rotate: "旋转", translate: "平移", dilate: "缩放" };
      return `已${labels[mode] ?? mode}：${target} → ${n}`;
    }

    // ═══ 物理演示层（矢量随动 / 读数 / 弹簧 / 分形） ═══
    case "attach_vector": {
      const { name: n, anchor, exprX, exprY, scale } = args as {
        name: string; anchor: string; exprX: string; exprY: string; scale?: number | string; color?: string; label?: string;
      };
      // 助手名大写开头（Mag/Tip）——小写名的坐标表达式会被 GGB 隐式推断为 Vector，Vector() 引用即失败
      const magName = `Mag${n}`;
      const tipName = `Tip${n}`;
      // ① 模长助手（隐藏）：显式 scale 时仍生成（重放一致），只是不参与缩放
      if (!api.evalCommand(`${magName} = sqrt((${exprX})^2 + (${exprY})^2)`)) {
        throw new Error(`矢量分量表达式求值失败：sqrt((${exprX})^2 + (${exprY})^2)（检查括号配对与已定义的量）`);
      }
      // ② 缩放：显式 scale 优先；缺省按视窗宽度 15% 自动归一化
      let effScale = typeof scale === "number" && Number.isFinite(scale) && scale > 0 ? scale : null;
      let scaleNote = "显式";
      if (effScale === null) {
        const xmin = api.getXmin?.(), xmax = api.getXmax?.();
        const viewW = xmin !== undefined && xmax !== undefined && xmax > xmin ? xmax - xmin : 10;
        const targetLen = viewW * 0.15;
        const mag = api.getValue(magName);
        effScale = mag > 1e-9 ? Math.round(targetLen / mag * 1000) / 1000 : 0.2;
        scaleNote = "自动归一化";
      }
      // ③ 尾点 + 矢量
      if (!api.evalCommand(`${tipName} = ${anchor} + (${exprX} * ${effScale}, ${exprY} * ${effScale})`)) {
        throw new Error(`矢量尾点创建失败：${tipName} = ${anchor} + ((${exprX}), (${exprY})) × ${effScale}`);
      }
      if (!api.evalCommand(`${n} = Vector(${anchor}, ${tipName})`)) {
        throw new Error(`矢量 ${n} 创建失败`);
      }
      api.setVisible(magName, false);
      api.setVisible(tipName, false);
      const { color, label } = args as { color?: string; label?: string };
      if (color) { const [r, g, b] = hexToRgb(color); api.setColor(n, r, g, b); }
      api.setLineThickness(n, 4);
      if (label) { api.setCaption(n, label); api.setLabelStyle(n, 3); }
      return `矢量 ${n} 已锚定 ${anchor}（缩放 ×${effScale}，${scaleNote}；端点随 ${anchor} 实时跟随）`;
    }

    case "create_readout": {
      const { name: n, at, items } = args as {
        name: string; at: string;
        items: Array<{ label: string; expr: string; unit?: string; decimals?: number }>;
      };
      const cmd = buildReadoutCommand(n, at, items);
      if (!api.evalCommand(cmd)) {
        throw new Error(`读数条 ${n} 创建失败：${cmd.slice(0, 120)}（检查 expr 是否引用了已定义的量）`);
      }
      return `读数条 ${n} 已创建于 ${at}（${items.length} 项，随动画实时刷新）`;
    }

    case "create_spring": {
      const { name: n, from, to } = args as {
        name: string; from: string; to: string; coils?: number; amp?: number; thickness?: number;
      };
      const coils = typeof args.coils === "number" && args.coils >= 4 && args.coils <= 16 ? Math.floor(args.coils) : 8;
      const amp = typeof args.amp === "number" && args.amp > 0 && args.amp <= 2 ? args.amp : 0.3;
      const [lenCmd, polyCmd] = buildSpringCommands(n, from, to, coils, amp);
      if (!api.evalCommand(lenCmd)) {
        throw new Error(`弹簧长度助手创建失败（检查 ${from} / ${to} 是否为已存在的点）`);
      }
      if (!api.evalCommand(polyCmd)) {
        throw new Error(`弹簧 ${n} 创建失败`);
      }
      api.setVisible(`${n}Len`, false);
      if (args.thickness !== undefined) api.setLineThickness(n, args.thickness as number);
      return `弹簧 ${n} 已创建（${from} ↔ ${to}，${coils} 圈；端点移动实时伸缩）`;
    }

    case "create_fractal": {
      const { name: n, kind, depth, color, thickness } = args as {
        name: string; kind: "koch" | "snowflake" | "sierpinski" | "dragon"; depth: number; color?: string; thickness?: number;
      };
      const built = buildFractalPolyLine(kind, depth);
      const ok = api.evalCommand(`${n} = PolyLine(${built.coords})`);
      if (!ok) throw new Error(`分形 ${n} 创建失败（${kind} depth=${built.depth}，${built.segments} 段）`);
      if (color) { const [r, g, b] = hexToRgb(color); api.setColor(n, r, g, b); }
      api.setLineThickness(n, thickness ?? 2);
      return `分形 ${n}（${kind}，depth=${built.depth}，${built.segments} 段）已创建。深度固定——如需「逐级生长」演示，按 depth 1..N 多次创建并切换可见性`;
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
        // ★ v1.8：**不在运行时切换透视**。
        //    实测日志（[AiGGB:DIAG]）：classic 画布下 setPerspective("3d") 会触发 GGB
        //    内部视图过渡（DockGlassPane 接管），动画不完成时 canvas 全部消失 →
        //    心跳被迫硬重建 applet（销毁 + 重注入 + 快照恢复），用户看到明显闪烁。
        //    2D↔3D 的正规路径是工具栏切换 → setAppName（store）→ GGBCanvas 监听重建，整体重注入 applet。
        const already3D = api.getPerspectiveXML?.()?.includes("3D");
        changes.push(already3D
          ? "3D 透视（已是 3D）"
          : "⚠ 当前是 2D 画布，未切换 3D 透视（运行时切透视会导致绘图区闪烁）——如需 3D 请用工具栏切到 3D 模式后重发");
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
      // 可见性：getVisible 只读主标志位；SetVisibleInView 的视图掩码记在 <show ... ev="...">。
      // 实测（5.4.927）：命令隐藏 → object="true" + ev 出现；JS setVisible(false) → object="false"。
      let visible = api.getVisible(n);
      const showM = /<show\b[^>]*\/>/.exec(String(api.getXML?.(n) ?? ""));
      if (showM) {
        const objM = /object="(true|false)"/.exec(showM[0]);
        if (objM) visible = objM[1] === "true";
        if (/ ev="/.test(showM[0])) visible = false;
      }
      return `${n}：类型=${type}，定义=${cmd}${value ? "，值=" + value : ""}，可见=${visible ? "是" : "否"}`;
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

    case "get_canvas_info": {
      const r2 = (v: number) => Math.round(v * 100) / 100;
      const lines: string[] = [];
      const xmin = api.getXmin?.(), xmax = api.getXmax?.(), ymin = api.getYmin?.(), ymax = api.getYmax?.();
      const hasView = xmin !== undefined && xmax !== undefined && ymin !== undefined && ymax !== undefined;
      lines.push(hasView
        ? `视窗: x[${r2(xmin!)}, ${r2(xmax!)}], y[${r2(ymin!)}, ${r2(ymax!)}]`
        : "视窗: 未知（当前 applet 不支持读取）");
      const names = api.getAllObjectNames();
      if (names.length === 0) {
        lines.push("对象: 画布为空");
        return lines.join("\n");
      }
      let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity, counted = 0;
      const outside: string[] = [];
      for (const n of names) {
        const bb = api.getBoundingBox?.(n);
        if (!bb || bb.length < 6) continue;
        counted++;
        bx0 = Math.min(bx0, bb[0]); by0 = Math.min(by0, bb[1]);
        bx1 = Math.max(bx1, bb[3]); by1 = Math.max(by1, bb[4]);
        if (hasView && (bb[3] < xmin! || bb[0] > xmax! || bb[4] < ymin! || bb[1] > ymax!)) {
          outside.push(n);
        }
      }
      if (counted === 0) {
        lines.push(`对象: ${names.slice(0, 30).join(", ")}${names.length > 30 ? ` 等共 ${names.length} 个` : ""}（包围盒不可用）`);
      } else {
        lines.push(`对象包围盒并集: x[${r2(bx0)}, ${r2(bx1)}], y[${r2(by0)}, ${r2(by1)}]（${counted}/${names.length} 个可测）`);
        if (outside.length > 0) {
          lines.push(`⚠ 完全在视窗外: ${outside.join(", ")} → 建议调用 fit_view_to`);
        }
      }
      return lines.join("\n");
    }

    case "fit_view_to": {
      const { targets, padding } = args as { targets?: string[]; padding?: number };
      const pad = typeof padding === "number" && padding >= 0 && padding <= 0.5 ? padding : 0.1;
      const wanted = targets ?? [];
      const missing = wanted.filter(t => !api.exists(t));
      const names = wanted.length > 0 ? wanted.filter(t => api.exists(t)) : api.getAllObjectNames();
      if (names.length === 0) {
        return wanted.length > 0 ? `目标对象均不存在：${missing.join(", ")}` : "画布为空，无需调整视窗";
      }
      let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity, counted = 0;
      for (const n of names) {
        const bb = api.getBoundingBox?.(n);
        if (!bb || bb.length < 6) continue;
        counted++;
        bx0 = Math.min(bx0, bb[0]); by0 = Math.min(by0, bb[1]);
        bx1 = Math.max(bx1, bb[3]); by1 = Math.max(by1, bb[4]);
      }
      if (counted === 0) {
        return "无法测量对象包围盒（applet 不支持），视窗未调整——请改用 set_view 手动指定";
      }
      // 单点/共线时维度为 0 → 以中心坐标或 1 兜底，保证视窗不为零宽
      const px = (bx1 - bx0 > 0 ? bx1 - bx0 : Math.max(Math.abs(bx0), 1)) * pad;
      const py = (by1 - by0 > 0 ? by1 - by0 : Math.max(Math.abs(by0), 1)) * pad;
      const fit = fitViewToAspect(api, bx0 - px, bx1 + px, by0 - py, by1 + py);
      api.setCoordSystem(fit.xmin, fit.xmax, fit.ymin, fit.ymax);
      const r2 = (v: number) => Math.round(v * 100) / 100;
      return `视窗已适配 ${counted} 个对象 → x[${r2(fit.xmin)}, ${r2(fit.xmax)}], y[${r2(fit.ymin)}, ${r2(fit.ymax)}]` +
        (missing.length > 0 ? `（跳过不存在: ${missing.join(", ")}）` : "");
    }

    // ═══ 高级 ═══
    // ★ eval_sequence 工具已下线：Sequence 由免确认 eval_raw 直接提交（validateGGBCommand
    //   的 Sequence 五重载契约 + validateSequenceArgs 语义校验不变，走 eval_raw 路径生效）
    case "eval_raw": {
      const { command } = args as { command: string };
      // RAG 纠正：Levenshtein 模糊修正 + 臆造命令映射
      const correction = correctCommand(command);
      const finalCmd = correction.changed ? correction.corrected : command;
      // ★ 静态语法预检：接住 GGB 引擎只会回 false 的语法错误（括号/逗号/参数个数）
      const check = validateGGBCommand(finalCmd, appMode);
      if (!check.ok) throw new Error(check.message);
      const ok = api.evalCommand(finalCmd);
      // ★ scripting 命令成功也返回 false（见 ggbBridge.isScriptingCommand），不以此判失败
      if (!ok && !isScriptingCommand(finalCmd)) throw new Error(`命令执行失败：${finalCmd}`);
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

    // XSS 拦截：<script>/javascript: 对原始命令检查（字面量里出现也难有合法用途）；
    // on\w+= 用剥离字面量后的命令，避免 Text("onward=5") 之类的文本内容被误伤
    if (/<script|javascript:/i.test(cmd) || /on\w+=/i.test(stripped)) {
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

    case "transform_object": {
      const mode = args.mode as string | undefined;
      if (mode === "reflect" && args.line === undefined) return `reflect 需要 line（对称轴对象名）`;
      if (mode === "rotate" && (args.center === undefined || args.angle === undefined)) {
        return `rotate 需要 center（旋转中心）与 angle（角度）`;
      }
      if (mode === "translate" && args.vector === undefined) return `translate 需要 vector（平移矢量对象名）`;
      if (mode === "dilate" && (args.center === undefined || args.factor === undefined)) {
        return `dilate 需要 center（缩放中心）与 factor（缩放因子）`;
      }
      for (const k of ["line", "center", "vector"] as const) {
        const v = args[k];
        if (typeof v === "string" && !api.exists(v)) return `依赖对象 ${v} 不存在；请先创建它`;
      }
      break;
    }

    case "attach_vector": {
      const a = String(args.anchor ?? "");
      if (api.exists(a)) {
        const anchorType = api.getObjectType(a);
        if (!/point/i.test(anchorType)) {
          return `attach_vector 的 anchor 必须是 Point（当前 ${a} 类型为 ${anchorType}）`;
        }
      }
      break;
    }

    case "create_readout": {
      const at = String(args.at ?? "");
      if (api.exists(at)) {
        const atType = api.getObjectType(at);
        if (!/point/i.test(atType)) return `create_readout 的 at 必须是 Point（当前类型 ${atType}）`;
      }
      break;
    }

    case "create_spring": {
      if (args.from === args.to && args.from !== undefined) {
        return `弹簧两端点不能相同（from=to=${String(args.from)}）`;
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
    // ★ create_vector 的 from 必须与 dispatch 同口径走预检：否则 from 缺失落到 dispatch
    //   抛「起点 X 不存在」——按硬失败计入熔断，且文案不匹配 MISSING_OBJ_RE 拿不到重试指引
    ["create_vector", "from"],
    ["transform_object", "target"],
    ["attach_vector", "anchor"], ["create_readout", "at"],
    ["create_spring", "from"], ["create_spring", "to"],
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

// ──── eval_raw / eval_sequence 自动安全降档 ────

/**
 * eval_raw 命令的免确认判定。满足全部条件 → 危险降为安全（不弹用户确认）：
 *   ① 赋值形态（标识符 = ...）——产生新对象的声明式构造（Cube/Sphere/Surface/IntersectPath
 *      等 3D 命令全是此形态）；纯 scripting 命令（SetColor/ZoomIn 等）无 "=" 天然排除
 *   ② 不含 Delete（删除破坏性明确且成败不可辨，必须人工确认）
 *   ③ 通过硬黑名单 + XSS 安全拦截
 *   ④ 通过静态语法预检（括号配对/参数个数/3D 禁令）
 */
export function isEvalRawAutoSafe(command: string, appMode?: "2d" | "3d"): boolean {
  const cmd = command.trim();
  if (!/^[A-Za-z_]\w*\s*=\s*\S/.test(cmd)) return false;
  if (/\bDelete\s*\(/i.test(cmd)) return false;
  // 剥离字符串字面量后查黑名单（与 checkSafety 同语义），XSS 检查拆两半（同 eval_raw 执行路径）
  const stripped = cmd.replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, "").replace(/'[^'\\]*(?:\\.[^'\\]*)*"/g, "");
  if (FORBIDDEN_RE.test(stripped)) return false;
  if (/<script|javascript:/i.test(cmd) || /on\w+=/i.test(stripped)) return false;
  return validateGGBCommand(cmd, appMode).ok;
}

/** eval_raw 工具调用的自动降档判定（args 来自模型输出，未经 Zod） */
export function isEvalAutoSafe(
  toolName: string,
  args: Record<string, unknown>,
  appMode?: "2d" | "3d"
): boolean {
  if (toolName === "eval_raw") {
    return isEvalRawAutoSafe(String(args.command ?? ""), appMode);
  }
  return false;
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
    // ═══ 已下线工具的重放兼容（create_point/slider/line/midpoint/intersect/locus/eval_sequence）：
    //     历史轨迹按工具名查映射回放 constructionLog，不能随工具下线而断 ═══
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
    case "create_line": {
      const { name: n, from, to } = args as { name: string; from: string; to: string };
      return [`${n} = Line(${from}, ${to})`];
    }
    case "create_midpoint": {
      const { name: n, a, b } = args as { name: string; a: string; b: string };
      return [`${n} = Midpoint(${a}, ${b})`];
    }
    case "create_intersect": {
      const { name: n, first, second } = args as { name: string; first: string; second: string };
      return [`${n} = Intersect(${first}, ${second})`];
    }
    case "create_locus": {
      const { name: n, point, path } = args as { name: string; point: string; path: string };
      return [`${n} = Locus(${point}, ${path})`];
    }
    case "transform_object": {
      const cmd = buildTransformCommand(args);
      return cmd ? [cmd] : [];
    }
    case "eval_raw": {
      const { command } = args as { command: string };
      return [command];
    }
    case "eval_sequence": {
      const { name: n, expr, var: loopVar, start, end, step } = args as {
        name: string; expr: string; var: string; start: number | string; end: number | string; step: number | string;
      };
      return [buildSequenceCommand({ name: n, expr, var: loopVar, start, end, step })];
    }
    case "physics_constants": {
      const { names } = args as { names: string[] };
      return (names ?? []).map(n => {
        const def = PHYSICS_CONSTANTS[n];
        return def ? `${n} = ${def.value}` : `# unknown constant: ${n}`;
      });
    }
    case "attach_vector": {
      const { name: n, anchor, exprX, exprY, scale } = args as {
        name: string; anchor: string; exprX: string; exprY: string; scale?: number | string;
      };
      const s = typeof scale === "number" && Number.isFinite(scale) && scale > 0 ? scale : 0.2;
      return [
        `Mag${n} = sqrt((${exprX})^2 + (${exprY})^2)`,
        `Tip${n} = ${anchor} + (${exprX} * ${s}, ${exprY} * ${s})`,
        `${n} = Vector(${anchor}, Tip${n})`,
        `SetVisibleInView(Mag${n}, 1, false)`,
        `SetVisibleInView(Tip${n}, 1, false)`,
      ];
    }
    case "create_readout": {
      const { name: n, at, items } = args as {
        name: string; at: string;
        items: Array<{ label: string; expr: string; unit?: string; decimals?: number }>;
      };
      return [buildReadoutCommand(n, at, items)];
    }
    case "create_spring": {
      const { name: n, from, to, coils, amp } = args as {
        name: string; from: string; to: string; coils?: number; amp?: number;
      };
      const c = typeof coils === "number" && coils >= 4 && coils <= 16 ? Math.floor(coils) : 8;
      const a = typeof amp === "number" && amp > 0 && amp <= 2 ? amp : 0.3;
      return buildSpringCommands(n, from, to, c, a);
    }
    case "create_fractal": {
      const { name: n, kind, depth } = args as {
        name: string; kind: "koch" | "snowflake" | "sierpinski" | "dragon"; depth: number;
      };
      const built = buildFractalPolyLine(kind, depth);
      return [`${n} = PolyLine(${built.coords})`];
    }
    // set_style / set_animation / set_view / set_unit_axes / create_trace / create_text
    // delete_object / clear_canvas / get_object_info / list_objects
    // 这些使用 GGB API 而非 eval，不产生可重放的 eval 命令
    default:
      return [];
  }
}
