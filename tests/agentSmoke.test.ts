/**
 * C3 agent 冒烟测试（0 API）—— 用脚本化 agentChatImpl 驱动真实 Agent 构造流程
 *   node --test --import tsx tests/agentSmoke.test.ts
 *
 * 三个场景覆盖 Agent 模式的完整构造链路（常量→滑块→点→几何→矢量→动画）：
 *   1. 单摆（physics, 2d）—— 常量 + 3 滑块 + 函数 + 线段/圆 + 矢量 + 动画
 *   2. 电场矢量网格（physics, 2d）—— 滑块 + 电荷点 + Ex/Ey/Emag 函数 + Sequence 网格
 *   3. 3D 正方体截面（general, 3d）—— eval_raw(Cube/IntersectPath) + 危险工具确认
 *
 * 每个场景断言：
 *   - Agent 循环跑通（failed=false，无脚本耗尽异常）
 *   - 关键画布对象就绪（类型正确）
 *   - ★ 可重放性：从 messages 提取 tool_calls → toolCallToEvalCommands →
 *     新 Mock 重放 → 对象集与原始画布一致（undo/constructionLog 闭环）
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  runAgentLoop,
  registerConfirmationHandler,
  unregisterConfirmationHandler,
  type AgentLoopDeps,
} from "../src/lib/agentLoop";
import { toolCallToEvalCommands } from "../src/lib/toolExecutor";
import type { AgentMessage, AgentResponse, ToolCallDelta } from "../src/lib/aiClient";
import { MockGGB } from "./mockGGB";
import type { GGBAppletApi } from "../src/types/ggb";

// ──── 辅助 ────

let idSeq = 0;
function call(name: string, args: Record<string, unknown>): ToolCallDelta {
  return { id: `smoke${++idSeq}`, type: "function", function: { name, arguments: JSON.stringify(args) } };
}
function toolResp(...calls: ToolCallDelta[]): AgentResponse {
  return { content: null, toolCalls: calls, finishReason: "tool_calls" };
}
function textResp(content: string): AgentResponse {
  return { content, toolCalls: [], finishReason: "stop" };
}

function makeAgent(scripts: AgentResponse[], appMode: "2d" | "3d", domain: "general" | "physics") {
  const mock = new MockGGB();
  const controller = new AbortController();
  const deps: AgentLoopDeps = {
    config: { provider: "test", baseURL: "http://localhost", apiKey: "k", model: "m" },
    domain,
    appMode,
    signal: controller.signal,
    getApi: () => mock as unknown as GGBAppletApi,
    getMessages: () => [],
    agentModel: "m",
    onThinking: () => {},
    agentChatImpl: async (_cfg, _msgs) => {
      const next = scripts.shift();
      if (!next) throw new Error(`agentChatImpl 脚本耗尽（剩 ${scripts.length} 步）`);
      return next;
    },
  };
  return { deps, mock };
}

/** 从 agent 结果提取全部工具调用 → toolCallToEvalCommands → 新 Mock 重放，断言对象集一致 */
function assertReplayable(result: { messages: AgentMessage[] }, mock: MockGGB): void {
  const cmds: string[] = [];
  for (const m of result.messages) {
    if (m.role === "assistant" && m.tool_calls) {
      for (const t of m.tool_calls) {
        cmds.push(...toolCallToEvalCommands(t.function.name, t.function.arguments));
      }
    }
  }
  assert.ok(cmds.length > 0, "应产生可重放的 eval 命令");
  const replay = new MockGGB();
  for (const c of cmds) {
    assert.equal(replay.evalCommand(c), true, `重放失败：${c}`);
  }
  // 对象集一致（名字排序后比较；临时对象/纯 API 调用不产生对象故天然一致）
  const orig = mock.getAllObjectNames().sort();
  const repl = replay.getAllObjectNames().sort();
  assert.deepEqual(repl, orig, "重放对象集应与原始画布一致");
}

test.afterEach(() => unregisterConfirmationHandler());

// ═══════════════════════════════════════════════════
// 场景 1：单摆（physics, 2d）
// ═══════════════════════════════════════════════════

test("agent 冒烟：单摆 — 常量+滑块+函数+线段+矢量+动画 → 对象就绪且可重放", async () => {
  const scripts: AgentResponse[] = [
    toolResp(call("physics_constants", { names: ["g"] })),
    toolResp(
      call("create_slider", { name: "L", min: 0.5, max: 2, step: 0.01, value: 1 }),
      call("create_slider", { name: "theta0", min: 0, max: 1.57, step: 0.01, value: 0.5236 }),
      call("create_slider", { name: "t", min: 0, max: 10, step: 0.02, value: 0 }),
    ),
    toolResp(call("create_point", { name: "O", x: 0, y: 0 })),
    toolResp(
      call("create_function", { name: "omega0", expression: "sqrt(g/L)" }),
      call("create_function", { name: "theta", expression: "theta0*cos(omega0*t)" }),
    ),
    toolResp(
      call("create_function", { name: "dtheta", expression: "-theta0*omega0*sin(omega0*t)" }),
      call("create_point", { name: "P", x: "L*sin(theta)", y: "-L*cos(theta)" }),
    ),
    toolResp(
      call("create_segment", { name: "rod", start: "O", end: "P" }),
      call("create_circle", { name: "bob", center: "P", radius: 0.04 }),
      call("create_vector", {
        name: "velArrow", from: "P",
        to: "P+(0.2*L*dtheta*cos(theta),0.2*L*dtheta*sin(theta))", color: "#1e88e5",
      }),
    ),
    toolResp(
      call("create_trace", { target: "P", mode: "trail" }),
      call("set_unit_axes", { xUnit: "m", yUnit: "m" }),
    ),
    toolResp(
      call("set_view", { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 0.5 }),
      call("set_animation", { target: "t", action: "start", speed: 0.5, repeat: "increasing" }),
    ),
    textResp("单摆构造完成 ✓"),
  ];
  const { deps, mock } = makeAgent(scripts, "2d", "physics");
  const r = await runAgentLoop("单摆 L=1 θ0=30°", deps);

  assert.equal(r.failed, false);
  assert.ok(r.finalText.includes("单摆"));
  for (const obj of ["g", "L", "theta0", "t", "O", "omega0", "theta", "dtheta", "P", "rod", "bob", "velArrow"]) {
    assert.ok(mock.exists(obj), `对象 ${obj} 应存在`);
  }
  assert.equal(mock.getObjectType("rod"), "Segment");
  assertReplayable(r, mock);
});

// ═══════════════════════════════════════════════════
// 场景 2：电场矢量网格（physics, 2d）
// ═══════════════════════════════════════════════════

test("agent 冒烟：电场 — 电荷+Ex/Ey/Emag+Sequence 网格 → 对象就绪且可重放", async () => {
  const scripts: AgentResponse[] = [
    toolResp(
      call("create_slider", { name: "d", min: 1, max: 4, step: 0.1, value: 2 }),
      call("create_slider", { name: "qmag", min: 1, max: 5, step: 0.5, value: 1 }),
    ),
    toolResp(
      call("create_point", { name: "A", x: "d", y: 0 }),
      call("create_point", { name: "B", x: "-d", y: 0 }),
    ),
    toolResp(
      call("create_function", { name: "Ex", expression: "qmag*(x-d)/((x-d)^2+y^2+0.01)^1.5 - qmag*(x+d)/((x+d)^2+y^2+0.01)^1.5" }),
      call("create_function", { name: "Ey", expression: "qmag*y/((x-d)^2+y^2+0.01)^1.5 - qmag*y/((x+d)^2+y^2+0.01)^1.5" }),
      call("create_function", { name: "Emag", expression: "sqrt(Ex(x,y)^2+Ey(x,y)^2+0.001)" }),
    ),
    toolResp(
      call("create_function", { name: "gridStep", expression: "0.4" }),
      call("create_function", {
        name: "arrows",
        expression: "Sequence(Sequence(Vector((i,j),(i+gridStep*Ex(i,j)/Emag(i,j),j+gridStep*Ey(i,j)/Emag(i,j))),i,-4,4,1),j,-3,3,1)",
      }),
    ),
    toolResp(
      call("set_unit_axes", { xUnit: "m", yUnit: "m" }),
      call("set_view", { xmin: -5, xmax: 5, ymin: -4, ymax: 4 }),
    ),
    textResp("电场矢量网格构造完成 ✓"),
  ];
  const { deps, mock } = makeAgent(scripts, "2d", "physics");
  const r = await runAgentLoop("两个点电荷的电场示意图", deps);

  assert.equal(r.failed, false);
  for (const obj of ["d", "qmag", "A", "B", "Ex", "Ey", "Emag", "gridStep", "arrows"]) {
    assert.ok(mock.exists(obj), `对象 ${obj} 应存在`);
  }
  assert.equal(mock.getObjectType("arrows"), "List");
  assertReplayable(r, mock);
});

// ═══════════════════════════════════════════════════
// 场景 3：3D 正方体截面（general, 3d）—— eval_raw + 危险工具确认
// ═══════════════════════════════════════════════════

test("agent 冒烟：3D 正方体 — eval_raw(Cube/IntersectPath) + 确认 → 对象就绪且可重放", async () => {
  const scripts: AgentResponse[] = [
    toolResp(
      call("create_point", { name: "A", x: 0, y: 0, z: 0 }),
      call("create_point", { name: "B", x: 3, y: 0, z: 0 }),
      call("create_point", { name: "C", x: 3, y: 3, z: 0 }),
    ),
    toolResp(call("eval_raw", { command: "cube = Cube(A,B,C)" })),
    toolResp(call("eval_raw", { command: "section = IntersectPath(Plane(A,C,F), cube)" })),
    textResp("3D 正方体截面完成 ✓"),
  ];
  // eval_raw 是 dangerous → 注册确认 handler 放行（approve_all 同时验证信任会话）
  let confirmCalls = 0;
  registerConfirmationHandler(async () => { confirmCalls++; return [{ action: "approve_all" }]; });

  const { deps, mock } = makeAgent(scripts, "3d", "general");
  const r = await runAgentLoop("画边长 3 的正方体，平面 ACF 截面", deps);

  assert.equal(r.failed, false);
  for (const obj of ["A", "B", "C", "cube", "section", "F"]) {
    assert.ok(mock.exists(obj), `对象 ${obj} 应存在（F 由 Cube 派生）`);
  }
  assert.ok(confirmCalls >= 1, "eval_raw 应触发确认");
  assertReplayable(r, mock);
});

// ═══════════════════════════════════════════════════
// 场景 4（负例）：危险工具被拒 → agent 换安全路径或结束，不污染画布
// ═══════════════════════════════════════════════════

test("agent 冒烟：eval_raw 被拒 → 不执行、画布无污染", async () => {
  const scripts: AgentResponse[] = [
    toolResp(call("eval_raw", { command: "A = (0,0)" })),
    toolResp(call("create_point", { name: "A", x: 0, y: 0 })),
    textResp("改用安全工具完成"),
  ];
  registerConfirmationHandler(async () => [{ action: "deny", toolCallId: "smoke1" }]);

  const { deps, mock } = makeAgent(scripts, "2d", "general");
  const r = await runAgentLoop("画点 A", deps);

  assert.equal(r.failed, false);
  assert.deepEqual(r.deniedTools, ["eval_raw"]);
  assert.ok(mock.exists("A"), "改走 create_point 后对象应创建");
});
