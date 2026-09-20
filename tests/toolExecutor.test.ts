/**
 * toolExecutor L1 单测（0 API）—— Agent 工具执行层
 *   node --test --import tsx tests/toolExecutor.test.ts
 *
 * 覆盖：
 *   A. 完整链路（Zod 校验 → 安全拦截 → dispatch）：合法/非法参数、中文标识符拒绝
 *   B. dispatch 行为（MockGGB 断言对象类型与命令形态）：
 *      create_function 三形态防误判回归、create_vector 类型错误、
 *      安全拦截（eval_raw 黑名单/XSS、delete 临时对象）、物理常量注入
 *   C. toolCallToEvalCommands 往返一致性：工具调用 → eval 命令 → Mock 重放
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  executeToolCall,
  executeToolCalls,
  toolCallToEvalCommands,
  isEvalAutoSafe
} from "../src/lib/toolExecutor";
import { MockGGB } from "./mockGGB";
import type { GGBAppletApi } from "../src/types/ggb";

/** 构造一个 ToolCallRequest */
function call(name: string, args: Record<string, unknown>, id = "t1") {
  return { id, name, arguments: args };
}

/** 执行单个工具调用并解包 tool result JSON */
function run(api: MockGGB, name: string, args: Record<string, unknown>, id = "t1") {
  const r = executeToolCall(api as unknown as GGBAppletApi, call(name, args, id));
  assert.equal(r.role, "tool");
  return JSON.parse(r.content) as { success: boolean; result?: string; error?: string };
}

// ═══════════════════════════════════════════════════
// A. 完整链路：Zod 校验 + 分发
// ═══════════════════════════════════════════════════

test("参数校验：create_circle 缺 radius → 拒绝", () => {
  const mock = new MockGGB();
  const r = run(mock, "create_circle", { name: "c", center: "O" });
  assert.equal(r.success, false);
  assert.match(r.error ?? "", /参数校验失败/);
});

test("参数校验：中文标识符 → 拒绝", () => {
  const mock = new MockGGB();
  const r = run(mock, "create_points", { points: [{ name: "圆心", x: 0, y: 0 }] });
  assert.equal(r.success, false);
  assert.match(r.error ?? "", /参数校验失败/);
});

test("set_style 容错：字符串数值/布尔通过（与 JSON 流水线 style op 一致）", () => {
  const mock = new MockGGB();
  run(mock, "create_points", { points: [{ name: "A", x: 0, y: 0 }] });
  // 严格 z.number()/z.boolean() 会拒绝 "0.5"/"true"；NumLike/BoolLike 应放行
  const r = run(mock, "set_style", { target: "A", opacity: "0.5", dashed: "true", thickness: "3", visible: "yes" }, "t-tol");
  assert.equal(r.success, true, `实际错误：${r.error}`);
});

test("set_style 容错：超值域仍拒绝", () => {
  const mock = new MockGGB();
  run(mock, "create_points", { points: [{ name: "A", x: 0, y: 0 }] });
  const r = run(mock, "set_style", { target: "A", opacity: "1.5" }, "t-range");
  assert.equal(r.success, false);
  assert.match(r.error ?? "", /参数校验失败/);
  assert.match(r.error ?? "", /0~1/);
});

test("create_points：2D/3D 坐标均通过，Mock 注册为 Point", () => {
  const mock = new MockGGB();
  const r2 = run(mock, "create_points", { points: [{ name: "A", x: 0, y: 0 }] });
  assert.equal(r2.success, true);
  assert.ok(mock.exists("A"));
  assert.equal(mock.getObjectType("A"), "Point");

  const r3 = run(mock, "create_points", { points: [{ name: "B", x: 1, y: 2, z: 3 }] });
  assert.equal(r3.success, true);
  assert.ok(mock.exists("B"));
});

test("create_sliders：Slider(...) 完整参数 + SetValue 生效", () => {
  const mock = new MockGGB();
  const r = run(mock, "create_sliders", {
    sliders: [{ name: "t", min: 0, max: 5, step: 0.02, value: 0, unit: "s", label: "时间" }]
  });
  assert.equal(r.success, true);
  assert.ok(mock.exists("t"));
  assert.equal(mock.getObjectType("t"), "Number");
});

// ═══════════════════════════════════════════════════
// B. dispatch 行为
// ═══════════════════════════════════════════════════

test("create_function 三形态：真函数 / 数值 / 多变量表达式", () => {
  const mock = new MockGGB();
  // ① 真函数 f = sin(x) → Function
  assert.equal(run(mock, "create_function", { name: "f", expression: "sin(x)" }).success, true);
  assert.equal(mock.getObjectType("f"), "Function");
  // ② 数值表达式（依赖滑块）→ Number
  run(mock, "create_sliders", { sliders: [{ name: "v0", min: 1, max: 50, step: 1, value: 20 }] });
  run(mock, "create_sliders", { sliders: [{ name: "theta", min: 0, max: 1.5708, step: 0.01, value: 0.785 }] });
  run(mock, "create_sliders", { sliders: [{ name: "t", min: 0, max: 5, step: 0.02, value: 0 }] });
  assert.equal(
    run(mock, "create_function", { name: "Px", expression: "v0*cos(theta)*t" }).success,
    true
  );
  assert.equal(mock.getObjectType("Px"), "Number");
  // ③ ★ 回归：x^2+y^2 含字符 x 但不是单变量函数 → 必须按数值表达式处理
  assert.equal(run(mock, "create_function", { name: "ex", expression: "x^2+y^2" }).success, true);
  assert.equal(mock.getObjectType("ex"), "Number");
});

test("create_vector：起点不存在 → preflight 拦截（recoverable 文案，与熔断口径一致）", () => {
  const mock = new MockGGB();
  const r = run(mock, "create_vector", { name: "v", from: "A", to: "(1,1)" });
  assert.equal(r.success, false);
  assert.match(r.error ?? "", /执行前检查失败：依赖对象 A 不存在/);
});

test("create_vector：Point+Point 目标 → Mock 捕获执行失败", () => {
  const mock = new MockGGB();
  run(mock, "create_points", { points: [{ name: "A", x: 0, y: 0 }] });
  run(mock, "create_points", { points: [{ name: "B", x: 1, y: 1 }] });
  const r = run(mock, "create_vector", { name: "v", from: "A", to: "A+B" });
  assert.equal(r.success, false, "Point+Point 应执行失败");
});

test("安全拦截：eval_raw 黑名单命令（Execute）→ 拦截", () => {
  const mock = new MockGGB();
  const r = run(mock, "eval_raw", { command: "Execute(GetScriptingManager())" });
  assert.equal(r.success, false);
  assert.match(r.error ?? "", /安全拦截/);
});

test("安全拦截：eval_raw XSS 片段 → 拦截", () => {
  const mock = new MockGGB();
  const r = run(mock, "eval_raw", { command: "a = Text('<script>alert(1)</script>', A)" });
  assert.equal(r.success, false);
});

test("安全拦截：文本字面量中的 onxx= 不误伤（on\\w+= 只查剥离字面量后的命令）", () => {
  const mock = new MockGGB();
  run(mock, "create_points", { points: [{ name: "A", x: 0, y: 0 }] });
  const r = run(mock, "eval_raw", { command: 'T = Text("onward=5", A)' }, "t-xss");
  assert.equal(
    (r.error ?? "").includes("安全拦截"),
    false,
    `文本内容不应触发 XSS 拦截，实际：${r.error}`
  );
});

test("安全拦截：delete_object 临时对象 → 拦截", () => {
  const mock = new MockGGB();
  mock.seed([{ name: "_tmp1" }]);
  const r = run(mock, "delete_object", { target: "_tmp1" });
  assert.equal(r.success, false);
  assert.match(r.error ?? "", /禁止删除临时对象/);
});

test("physics_constants：注入 g/k_e，未知常量被 preFlight 拦截", () => {
  const mock = new MockGGB();
  const r = run(mock, "physics_constants", { names: ["g", "k_e"] });
  assert.equal(r.success, true);
  assert.ok(mock.exists("g"));
  assert.ok(mock.exists("k_e"));
  // 全未知 → preFlight 拦截（不触发 evalCommand，避免污染画布）
  const r2 = run(mock, "physics_constants", { names: ["zzz"] });
  assert.equal(r2.success, false);
  assert.match(r2.error ?? "", /执行前检查失败/);
  assert.match(r2.error ?? "", /未知物理常量/);
});

// ── preFlight 语义预检：Zod 查不出、GGB 会崩的逻辑错误 ──

test("preFlight：create_circle 负半径 → 拦截", () => {
  const mock = new MockGGB();
  // preFlight 半径检查先于依赖检查 → 无需 seed 圆心
  const r = run(mock, "create_circle", { name: "c", center: "O", radius: -3 });
  assert.equal(r.success, false);
  assert.match(r.error ?? "", /半径必须为正数/);
});

test("preFlight：create_slider min≥max → 拦截", () => {
  const mock = new MockGGB();
  const r = run(mock, "create_sliders", { sliders: [{ name: "t", min: 10, max: 5, step: 0.1, value: 7 }] });
  assert.equal(r.success, false);
  assert.match(r.error ?? "", /min\(10\) 必须小于 max\(5\)/);
});

test("preFlight：create_slider 初值越界 → 拦截", () => {
  const mock = new MockGGB();
  const r = run(mock, "create_sliders", { sliders: [{ name: "t", min: 0, max: 5, step: 0.1, value: 9 }] });
  assert.equal(r.success, false);
  assert.match(r.error ?? "", /初值 9 超出范围/);
});

test("preFlight：create_vector 除零表达式 → 拦截", () => {
  const mock = new MockGGB();
  // preFlight 除零检查先于 dispatch 的起点检查 → 无需 seed 起点
  const r = run(mock, "create_vector", { name: "v", from: "A", to: "(1/0, 2)" });
  assert.equal(r.success, false);
  assert.match(r.error ?? "", /除零/);
});

test("preFlight：依赖对象缺失 → 拦截（比 dispatch 报错更早）", () => {
  const mock = new MockGGB();
  // create_circle 的 center 缺失：preFlight 拦截
  const r = run(mock, "create_circle", { name: "c", center: "O", radius: 3 });
  assert.equal(r.success, false);
  assert.match(r.error ?? "", /依赖对象 O 不存在/);
});

test("executeToolCalls：批量执行全部成功", () => {
  const mock = new MockGGB();
  const calls = [
    call("create_points", { points: [{ name: "A", x: 0, y: 0 }] }, "c1"),
    call("create_points", { points: [{ name: "B", x: 1, y: 1 }] }, "c2"),
    call("create_segment", { name: "s", start: "A", end: "B" }, "c3")
  ];
  const results = executeToolCalls(mock as unknown as GGBAppletApi, calls, "2d");
  assert.equal(results.length, 3);
  for (const r of results) {
    const p = JSON.parse(r.content) as { success: boolean };
    assert.equal(p.success, true);
  }
  assert.ok(mock.exists("s"));
});

// ═══════════════════════════════════════════════════
// C. toolCallToEvalCommands 往返一致性
// ═══════════════════════════════════════════════════

test("映射：create_point → 坐标赋值", () => {
  const cmds = toolCallToEvalCommands("create_point", JSON.stringify({ name: "A", x: 1, y: 2 }));
  assert.deepEqual(cmds, ["A = (1, 2)"]);
});

test("映射：create_slider → Slider + SetValue 两条", () => {
  const cmds = toolCallToEvalCommands(
    "create_slider",
    JSON.stringify({ name: "t", min: 0, max: 5, step: 0.02, value: 0 })
  );
  assert.deepEqual(cmds, [
    "t = Slider(0, 5, 0.02, 1, 150, false, true, false, false)",
    "SetValue(t, 0)"
  ]);
});

test("映射：非构造工具（set_style/animation/查询）→ 空数组", () => {
  assert.deepEqual(toolCallToEvalCommands("set_style", JSON.stringify({ target: "c", color: "#ff0000" })), []);
  assert.deepEqual(toolCallToEvalCommands("set_animation", JSON.stringify({ target: "t", action: "start" })), []);
  assert.deepEqual(toolCallToEvalCommands("list_objects", JSON.stringify({})), []);
});

test("映射：JSON 解析失败 → 空数组（不抛错）", () => {
  assert.deepEqual(toolCallToEvalCommands("create_point", "not-json"), []);
});

test("映射：physics_constants → 常量赋值", () => {
  const cmds = toolCallToEvalCommands("physics_constants", JSON.stringify({ names: ["g"] }));
  assert.deepEqual(cmds, ["g = 9.8"]);
});

test("往返一致性：工具序列 → eval 命令 → Mock 重放 → 对象类型正确", () => {
  const mock = new MockGGB();
  const steps: Array<[string, Record<string, unknown>]> = [
    ["create_point", { name: "A", x: 0, y: 0 }],
    ["create_point", { name: "B", x: 3, y: 0 }],
    ["create_slider", { name: "r", min: 1, max: 5, step: 0.1, value: 2 }],
    ["create_circle", { name: "c", center: "A", radius: "r" }],
    ["create_function", { name: "f", expression: "sin(x)" }],
    ["create_segment", { name: "s", start: "A", end: "B" }]
  ];
  for (const [name, args] of steps) {
    const cmds = toolCallToEvalCommands(name, JSON.stringify(args));
    for (const cmd of cmds) {
      assert.equal(mock.evalCommand(cmd), true, `重放失败：${cmd}`);
    }
  }
  assert.ok(mock.exists("A") && mock.exists("B") && mock.exists("r"));
  assert.equal(mock.getObjectType("c"), "Circle");
  assert.equal(mock.getObjectType("s"), "Segment");
  assert.equal(mock.getObjectType("f"), "Function");
});

// ═══════════════════════════════════════════════════
// 几何动词层 + 视图观测
// ═══════════════════════════════════════════════════

test("直线/中点/交点构造：走免确认 eval_raw（薄包装工具已下线），mock 正常建模", () => {
  const mock = new MockGGB();
  run(mock, "create_points", { points: [{ name: "A", x: 0, y: 0 }, { name: "B", x: 2, y: 0 }] });
  const r1 = run(mock, "eval_raw", { command: "l = Line(A, B)" });
  assert.equal(r1.success, true, r1.error);
  assert.equal(mock.getObjectType("l"), "Line");
  const r2 = run(mock, "eval_raw", { command: "M = Midpoint(A, B)" });
  assert.equal(r2.success, true, r2.error);
  run(mock, "create_circle", { name: "c", center: "A", radius: 2 });
  const r3 = run(mock, "eval_raw", { command: "X = Intersect(l, c)" });
  assert.equal(r3.success, true, r3.error);
  assert.ok(mock.exists("M") && mock.exists("X"));
});

test("transform_object：四种模式生成对应命令 + 重放映射", () => {
  const mock = new MockGGB();
  run(mock, "create_points", { points: [{ name: "A", x: 1, y: 1 }] });
  run(mock, "create_points", { points: [{ name: "O", x: 0, y: 0 }] });
  run(mock, "eval_raw", { command: "ax = Line(A, O)" });
  run(mock, "create_vector", { name: "v", from: "O", to: "O+(1,0)" });
  assert.equal(run(mock, "transform_object", { name: "Ar", mode: "reflect", target: "A", line: "ax" }).success, true);
  assert.equal(run(mock, "transform_object", { name: "Arot", mode: "rotate", target: "A", center: "O", angle: 90 }).success, true);
  assert.equal(run(mock, "transform_object", { name: "At", mode: "translate", target: "A", vector: "v" }).success, true);
  assert.equal(run(mock, "transform_object", { name: "Ad", mode: "dilate", target: "A", center: "O", factor: 2 }).success, true);
  const cmds = toolCallToEvalCommands("transform_object", JSON.stringify({ name: "Ad2", mode: "dilate", target: "A", center: "O", factor: 3 }));
  assert.deepEqual(cmds, ["Ad2 = Dilate(A, 3, O)"]);
  const rot = toolCallToEvalCommands("transform_object", JSON.stringify({ name: "R1", mode: "rotate", target: "A", center: "O", angle: 90 }));
  assert.deepEqual(rot, ["R1 = Rotate(A, 90°, O)"], "数值角度应带度符号");
});

test("transform_object preflight：缺参与依赖缺失 → 执行前检查失败", () => {
  const mock = new MockGGB();
  run(mock, "create_points", { points: [{ name: "A", x: 0, y: 0 }] });
  const r1 = run(mock, "transform_object", { name: "X", mode: "reflect", target: "A" });
  assert.match(r1.error ?? "", /执行前检查失败：reflect 需要 line/);
  const r2 = run(mock, "transform_object", { name: "X", mode: "rotate", target: "A", center: "Nope", angle: 30 });
  assert.match(r2.error ?? "", /执行前检查失败：依赖对象 Nope 不存在/);
});

test("get_canvas_info：视窗 + 包围盒 + 出框提示", () => {
  const mock = new MockGGB();
  const r0 = run(mock, "get_canvas_info", {});
  assert.match(r0.result ?? "", /画布为空/);
  run(mock, "create_points", { points: [{ name: "A", x: 50, y: 50 }] }); // 默认视窗 [-10,10] 之外
  const r = run(mock, "get_canvas_info", {});
  assert.match(r.result ?? "", /视窗: x\[-10, 10\], y\[-10, 10\]/);
  assert.match(r.result ?? "", /对象包围盒并集/);
  assert.match(r.result ?? "", /完全在视窗外: A/);
  assert.match(r.result ?? "", /fit_view_to/);
});

test("fit_view_to：按对象包围盒适配视窗（含 padding）", () => {
  const mock = new MockGGB();
  run(mock, "create_points", { points: [{ name: "A", x: 50, y: 50 }] });
  run(mock, "create_points", { points: [{ name: "B", x: 52, y: 48 }] });
  const r = run(mock, "fit_view_to", { padding: 0.5 });
  assert.equal(r.success, true, r.error);
  // padding 0.5 → 包围盒 [50,52]×[48,50] 外扩 1 → x[49,53]，无 DOM 时 fitViewToAspect 原样应用
  assert.ok(mock.getXmin() <= 49 && mock.getXmax() >= 53, `实际视窗 x[${mock.getXmin()}, ${mock.getXmax()}]`);
  assert.ok(mock.getYmin() <= 47 && mock.getYmax() >= 51, `实际视窗 y[${mock.getYmin()}, ${mock.getYmax()}]`);
});

test("fit_view_to：目标均不存在 → 提示而非异常", () => {
  const mock = new MockGGB();
  const r = run(mock, "fit_view_to", { targets: ["Nope"] });
  assert.equal(r.success, true);
  assert.match(r.result ?? "", /均不存在/);
});

test("isEvalAutoSafe：赋值形态免确认；Delete/非赋值/黑名单拒绝", () => {
  assert.equal(isEvalAutoSafe("eval_raw", { command: "P = Cube(A, 2)" }, "3d"), true, "3D 构造赋值形态应免确认");
  assert.equal(isEvalAutoSafe("eval_raw", { command: "SetColor(A, 1, 2, 3)" }, "3d"), false, "非赋值 scripting 不降档");
  assert.equal(isEvalAutoSafe("eval_raw", { command: "Delete(A)" }, "2d"), false, "Delete 不降档");
  assert.equal(isEvalAutoSafe("eval_raw", { command: "x = Execute(k)" }, "2d"), false, "黑名单命令不降档");
  assert.equal(isEvalAutoSafe("eval_raw", { command: "s = Segment(A, B" }, "2d"), false, "括号不平衡不降档");
  assert.equal(isEvalAutoSafe("create_points", { points: [{ name: "A", x: 0, y: 0 }] }), false, "非 eval 工具不适用");
});

// ═══════════════════════════════════════════════════
// 物理演示层：attach_vector / create_readout / create_spring / create_fractal
// ═══════════════════════════════════════════════════

test("attach_vector：显式 scale 生成助手+矢量+隐藏", () => {
  const mock = new MockGGB();
  run(mock, "create_sliders", { sliders: [
    { name: "v0", min: 1, max: 50, step: 1, value: 20 },
    { name: "theta", min: 0, max: 1.5708, step: 0.01, value: 0.785 },
  ] });
  run(mock, "create_points", { points: [{ name: "P", x: 0, y: 0 }] });
  const r = run(mock, "attach_vector", {
    name: "v", anchor: "P", exprX: "v0*cos(theta)", exprY: "v0*sin(theta)", scale: 0.5, color: "#43a047",
  });
  assert.equal(r.success, true, r.error);
  assert.ok(mock.exists("Magv"), "模长助手应存在");
  assert.ok(mock.exists("Tipv"), "尾点助手应存在");
  assert.ok(mock.exists("v"), "矢量应存在");
  assert.equal(mock.getObjectType("v"), "Vector");
  // 重放映射：5 条命令（助手×2 + 矢量 + 隐藏×2）
  const cmds = toolCallToEvalCommands("attach_vector", JSON.stringify({
    name: "v2", anchor: "P", exprX: "a", exprY: "b", scale: 0.3,
  }));
  assert.equal(cmds.length, 5);
  assert.match(cmds[1], /Tipv2 = P \+ \(a \* 0\.3, b \* 0\.3\)/);
});

test("attach_vector：anchor 缺失/非点 → 拦截", () => {
  const mock = new MockGGB();
  const r1 = run(mock, "attach_vector", { name: "v", anchor: "Nope", exprX: "1", exprY: "0" });
  assert.match(r1.error ?? "", /依赖对象 Nope 不存在/);
  run(mock, "create_sliders", { sliders: [{ name: "s", min: 0, max: 1, step: 0.1, value: 0.5 }] });
  const r2 = run(mock, "attach_vector", { name: "v", anchor: "s", exprX: "1", exprY: "0" });
  assert.match(r2.error ?? "", /必须是 Point/);
});

test("attach_vector：mock 求值 0 → 自动缩放回退 0.2", () => {
  const mock = new MockGGB();
  run(mock, "create_points", { points: [{ name: "P", x: 0, y: 0 }] });
  const r = run(mock, "attach_vector", { name: "w", anchor: "P", exprX: "1+1", exprY: "0" });
  assert.equal(r.success, true, r.error);
  assert.match(r.result ?? "", /自动归一化/);
  assert.match(r.result ?? "", /×0\.2/);
});

test("create_readout：生成动态文本（round 小写）+ at 校验", () => {
  const mock = new MockGGB();
  run(mock, "create_sliders", { sliders: [{ name: "t", min: 0, max: 5, step: 0.02, value: 1 }] });
  run(mock, "create_points", { points: [{ name: "P", x: 5, y: 5 }] });
  const r = run(mock, "create_readout", {
    name: "info", at: "P",
    items: [{ label: "t", expr: "t", unit: "s", decimals: 1 }],
  });
  assert.equal(r.success, true, r.error);
  assert.ok(mock.exists("info"));
  const r2 = run(mock, "create_readout", { name: "bad", at: "Nope", items: [{ label: "x", expr: "1" }] });
  assert.match(r2.error ?? "", /依赖对象 Nope 不存在/);
});

test("create_spring：默认圈数 + 重合拦截 + 映射分段数", () => {
  const mock = new MockGGB();
  run(mock, "create_points", { points: [{ name: "A", x: 0, y: 0 }, { name: "B", x: 4, y: 1 }] });
  const r = run(mock, "create_spring", { name: "sp", from: "A", to: "B" });
  assert.equal(r.success, true, r.error);
  assert.ok(mock.exists("sp") && mock.exists("spLen"), "弹簧与长度助手应存在");
  const r2 = run(mock, "create_spring", { name: "sp2", from: "A", to: "A" });
  assert.match(r2.error ?? "", /执行前检查失败/);
  const cmds = toolCallToEvalCommands("create_spring", JSON.stringify({ name: "sp3", from: "A", to: "B", coils: 6 }));
  assert.equal(cmds.length, 3, "长度助手 + PolyLine + 隐藏");
  assert.match(cmds[1], /PolyLine\(Sequence\(/);
  assert.match(cmds[1], /k \/ 12/, "coils=6 → 2×6=12 分段");
});

test("create_fractal：四种 kind 生成 PolyLine + 深度护栏", () => {
  const mock = new MockGGB();
  const kinds = [
    ["koch", 1], ["snowflake", 1], ["sierpinski", 3], ["dragon", 6],
  ] as const;
  for (const [kind, depth] of kinds) {
    const r = run(mock, "create_fractal", { name: "f_" + kind, kind, depth });
    assert.equal(r.success, true, `${kind}: ${r.error}`);
    assert.ok(mock.exists("f_" + kind));
  }
  // koch depth1 → 4 段 = 5 个顶点（映射输出）
  const cmds = toolCallToEvalCommands("create_fractal", JSON.stringify({ name: "k1", kind: "koch", depth: 1 }));
  assert.equal(cmds.length, 1);
  const pts = (cmds[0].match(/\(/g) || []).length - 1; // 去掉 PolyLine( 本身
  assert.equal(pts, 5, "koch depth1 应为 5 个顶点");
  // 深度护栏：koch depth 99 → 段数被截断到 ≤ 4500
  const big = toolCallToEvalCommands("create_fractal", JSON.stringify({ name: "k2", kind: "koch", depth: 99 }));
  const segs = ((big[0].match(/\), \(/g) || []).length) + 1;
  assert.ok(segs <= 4501, `超限深度应被护栏截断（实际 ${segs} 段）`);
});
