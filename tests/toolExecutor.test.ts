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
  toolCallToEvalCommands
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
  const r = run(mock, "create_point", { name: "圆心", x: 0, y: 0 });
  assert.equal(r.success, false);
  assert.match(r.error ?? "", /参数校验失败/);
});

test("create_point：2D/3D 坐标均通过，Mock 注册为 Point", () => {
  const mock = new MockGGB();
  const r2 = run(mock, "create_point", { name: "A", x: 0, y: 0 });
  assert.equal(r2.success, true);
  assert.ok(mock.exists("A"));
  assert.equal(mock.getObjectType("A"), "Point");

  const r3 = run(mock, "create_point", { name: "B", x: 1, y: 2, z: 3 });
  assert.equal(r3.success, true);
  assert.ok(mock.exists("B"));
});

test("create_slider：Slider(...) 完整参数 + SetValue 生效", () => {
  const mock = new MockGGB();
  const r = run(mock, "create_slider", {
    name: "t", min: 0, max: 5, step: 0.02, value: 0, unit: "s", label: "时间"
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
  run(mock, "create_slider", { name: "v0", min: 1, max: 50, step: 1, value: 20 });
  run(mock, "create_slider", { name: "theta", min: 0, max: 1.5708, step: 0.01, value: 0.785 });
  run(mock, "create_slider", { name: "t", min: 0, max: 5, step: 0.02, value: 0 });
  assert.equal(
    run(mock, "create_function", { name: "Px", expression: "v0*cos(theta)*t" }).success,
    true
  );
  assert.equal(mock.getObjectType("Px"), "Number");
  // ③ ★ 回归：x^2+y^2 含字符 x 但不是单变量函数 → 必须按数值表达式处理
  assert.equal(run(mock, "create_function", { name: "ex", expression: "x^2+y^2" }).success, true);
  assert.equal(mock.getObjectType("ex"), "Number");
});

test("create_vector：起点不存在 → 报错提示", () => {
  const mock = new MockGGB();
  const r = run(mock, "create_vector", { name: "v", from: "A", to: "(1,1)" });
  assert.equal(r.success, false);
  assert.match(r.error ?? "", /起点 A 不存在/);
});

test("create_vector：Point+Point 目标 → Mock 捕获执行失败", () => {
  const mock = new MockGGB();
  run(mock, "create_point", { name: "A", x: 0, y: 0 });
  run(mock, "create_point", { name: "B", x: 1, y: 1 });
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
  const r = run(mock, "create_slider", { name: "t", min: 10, max: 5, step: 0.1, value: 7 });
  assert.equal(r.success, false);
  assert.match(r.error ?? "", /min\(10\) 必须小于 max\(5\)/);
});

test("preFlight：create_slider 初值越界 → 拦截", () => {
  const mock = new MockGGB();
  const r = run(mock, "create_slider", { name: "t", min: 0, max: 5, step: 0.1, value: 9 });
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
    call("create_point", { name: "A", x: 0, y: 0 }, "c1"),
    call("create_point", { name: "B", x: 1, y: 1 }, "c2"),
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
