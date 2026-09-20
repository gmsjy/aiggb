/**
 * agentLoop L1 单测（0 API）—— ReAct Agent 循环状态机
 *   node --test --import tsx tests/agentLoop.test.ts
 *
 * 通过 AgentLoopDeps 注入 mock agentChatImpl / executeToolCallsImpl，
 * 覆盖：
 *   1. 纯文本回复 → 直接结束
 *   2. happy path：工具调用成功 → 文本总结 → 画布对象就绪
 *   3. 空响应重试（注入提示后成功）
 *   4. 空响应重试后仍空 → failed
 *   5. 连续失败熔断（3 连败 → forceStop）
 *   6. 危险工具全部被拒 → 引导换安全工具
 *   7. 危险工具 approve_all → 信任会话跳过后续确认
 *   8. 未知工具（hallucinate 的工具名）→ 错误回喂不执行
 *   9. persistTrajectory 被调用（成功路径）
 *  10. truncateHistory 截断后 tool_calls/tool 配对完整
 *  11. 截断重试独立预算（第二次截断仍重试；与普通空响应互不挤占）
 *  12. 参数 JSON 解析失败 → 计入熔断（防截断参数无限轮转）
 *  13. compressHistory 多轮对话时保留当前用户请求（而非 messages[1] 的历史消息）
 *  14. 轮次耗尽 → incomplete 可续作暂停（不回滚、画布保留、文案引导续作）
 *  15. 续作轮 resumeMessages 注入（换新 system、原始请求 index 1、立即压缩、[续作] 前缀）
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  runAgentLoop,
  truncateHistory,
  compressHistory,
  registerConfirmationHandler,
  unregisterConfirmationHandler,
  type AgentLoopDeps,
} from "../src/lib/agentLoop";
import type { AgentChatOverrides, AgentMessage, AgentResponse, ToolCallDelta } from "../src/lib/aiClient";
import type { TrajectoryRecord } from "../src/lib/trajectoryStore";
import { MockGGB } from "./mockGGB";
import type { GGBAppletApi } from "../src/types/ggb";

// ──── 响应构造辅助 ────

let idSeq = 0;
function tcId(): string {
  return `tc${++idSeq}`;
}

function textResp(content: string): AgentResponse {
  return { content, toolCalls: [], finishReason: "stop" };
}

function emptyResp(finishReason: string | null = "stop"): AgentResponse {
  return { content: null, toolCalls: [], finishReason };
}

function toolResp(...calls: ToolCallDelta[]): AgentResponse {
  return { content: null, toolCalls: calls, finishReason: "tool_calls" };
}

function toolCall(name: string, args: Record<string, unknown>, id?: string): ToolCallDelta {
  return { id: id ?? tcId(), type: "function", function: { name, arguments: JSON.stringify(args) } };
}

// ──── Harness ────

function makeHarness(scripts: AgentResponse[]) {
  const mock = new MockGGB();
  const controller = new AbortController();
  const chatLog: AgentMessage[][] = [];
  const overridesLog: (AgentChatOverrides | undefined)[] = [];
  const persisted: TrajectoryRecord[] = [];
  let idx = 0;

  const deps: AgentLoopDeps = {
    config: { provider: "test", baseURL: "http://localhost", apiKey: "k", model: "m" },
    domain: "general",
    appMode: "2d",
    signal: controller.signal,
    getApi: () => mock as unknown as GGBAppletApi,
    getMessages: () => [],
    agentModel: "m",
    onThinking: () => {},
    agentChatImpl: async (_cfg, msgs, _tools, _signal, _model, _onContent, _onReasoning, overrides) => {
      chatLog.push(msgs);
      overridesLog.push(overrides);
      const next = scripts[idx++];
      if (!next) throw new Error(`agentChatImpl 脚本耗尽（第 ${idx} 次调用）`);
      return next;
    },
    persistTrajectory: rec => void persisted.push(rec),
  };

  return {
    deps, controller, mock, chatLog, overrides: overridesLog, persisted,
    get calls() { return idx; },
  };
}

/** 从 messages 中提取某 role 的所有 content 文本 */
function contents(msgs: AgentMessage[], role: "user" | "assistant" | "tool"): string[] {
  return msgs.filter(m => m.role === role && m.content).map(m => m.content as string);
}

test.afterEach(() => unregisterConfirmationHandler());

// ═══════════════════════════════════════════════════
// 1. 纯文本回复 → 结束
// ═══════════════════════════════════════════════════

test("纯文本回复 → 直接结束，无工具调用", async () => {
  const h = makeHarness([textResp("画布已就绪")]);
  const r = await runAgentLoop("看下画布", h.deps);
  assert.equal(r.finalText, "画布已就绪");
  assert.equal(r.iterations, 1);
  assert.equal(r.failed, false);
  assert.equal(h.mock.exists("A"), false, "纯文本不应创建对象");
});

// ═══════════════════════════════════════════════════
// 2. happy path：工具 → 总结
// ═══════════════════════════════════════════════════

test("happy path：工具调用成功 → 文本总结 → 对象就绪", async () => {
  const h = makeHarness([
    toolResp(toolCall("create_points", { points: [{ name: "A", x: 0, y: 0 }] })),
    toolResp(toolCall("create_sliders", { sliders: [{ name: "r", min: 1, max: 5, step: 0.1, value: 2 }] })),
    textResp("构造完成 ✓"),
  ]);
  const r = await runAgentLoop("画点 A 和滑块 r", h.deps);
  assert.equal(r.finalText, "构造完成 ✓");
  assert.equal(h.calls, 3);
  assert.ok(h.mock.exists("A"));
  assert.ok(h.mock.exists("r"));
  assert.equal(r.messages.some(m => m.role === "tool" && m.content?.includes("success")), true);
});

// ═══════════════════════════════════════════════════
// 3. 空响应重试 → 成功
// ═══════════════════════════════════════════════════

test("空响应 → 注入提示重试 1 次 → 成功", async () => {
  const h = makeHarness([
    emptyResp(),
    textResp("完成"),
  ]);
  const r = await runAgentLoop("画个圆", h.deps);
  assert.equal(h.calls, 2, "空响应后应重试一次");
  assert.equal(r.finalText, "完成");
  assert.equal(r.failed, false, "重试成功不应标记失败");
  // 重试提示已注入 user 消息
  assert.ok(contents(r.messages, "user").some(t => t.includes("不要返回空响应")));
});

test("finish_reason=length 的空响应 → 提示截断而非空响应", async () => {
  const h = makeHarness([emptyResp("length"), textResp("ok")]);
  const r = await runAgentLoop("复杂构造", h.deps);
  assert.ok(contents(r.messages, "user").some(t => t.includes("长度限制被截断")));
  assert.equal(r.finalText, "ok");
});

test("截断重试 → 自动扩容预算 + 降思考档；成功后恢复默认参数", async () => {
  const h = makeHarness([
    emptyResp("length"),
    toolResp(toolCall("create_points", { points: [{ name: "A", x: 0, y: 0 }] })),
    textResp("ok"),
  ]);
  const r = await runAgentLoop("复杂构造", h.deps);
  assert.equal(h.calls, 3);
  assert.equal(h.overrides[0], undefined, "首次调用不覆盖参数");
  assert.deepEqual(
    h.overrides[1],
    { maxTokensScale: 2, reasoningEffort: "low" },
    "截断重试必须扩容预算并降思考档（否则同样参数必然再次截断）"
  );
  assert.equal(h.overrides[2], undefined, "重试成功后应恢复默认参数");
  assert.equal(r.failed, false);
});

test("普通空响应重试 → 不改动输出预算 / 思考档", async () => {
  const h = makeHarness([emptyResp(), textResp("完成")]);
  await runAgentLoop("画个圆", h.deps);
  assert.equal(h.calls, 2);
  assert.equal(h.overrides[1], undefined, "非截断空响应不扩容");
  assert.equal(h.overrides[0], undefined);
});

test("截断重试预算 2 次：两次截断都重试，第三次仍截断 → failed", async () => {
  const h = makeHarness([emptyResp("length"), emptyResp("length"), emptyResp("length")]);
  const r = await runAgentLoop("复杂构造", h.deps);
  assert.equal(h.calls, 3, "截断类独立预算 ≤2 次：前两次都应重试");
  assert.equal(r.failed, true);
  assert.match(r.finalText, /AI 未返回有效响应/);
  assert.match(r.finalText, /预算已被思考吃光/);
  // 后两次重试都带扩容 + 降档覆盖
  assert.deepEqual(h.overrides[1], { maxTokensScale: 2, reasoningEffort: "low" });
  assert.deepEqual(h.overrides[2], { maxTokensScale: 2, reasoningEffort: "low" });
});

test("第二次截断仍有重试机会（截断预算不因首次用掉而耗尽）", async () => {
  const h = makeHarness([
    emptyResp("length"),
    emptyResp("length"),
    toolResp(toolCall("create_points", { points: [{ name: "A", x: 0, y: 0 }] })),
    textResp("ok"),
  ]);
  const r = await runAgentLoop("复杂构造", h.deps);
  assert.equal(h.calls, 4);
  assert.equal(r.failed, false);
  assert.equal(r.finalText, "ok");
});

test("截断与普通空响应的重试预算互不挤占", async () => {
  // 旧实现共用一个 flag：先截断（用掉唯一重试）→ 后续普通空响应直接放弃
  const h = makeHarness([emptyResp("length"), emptyResp("stop"), textResp("ok")]);
  const r = await runAgentLoop("复杂构造", h.deps);
  assert.equal(h.calls, 3, "普通空响应应有自己的一次重试");
  assert.equal(r.failed, false);
  assert.equal(r.finalText, "ok");
  assert.deepEqual(h.overrides[1], { maxTokensScale: 2, reasoningEffort: "low" }, "第 2 次调用是截断重试，带扩容");
  assert.equal(h.overrides[2], undefined, "第 3 次调用是普通空响应重试，不扩容");
});

// ═══════════════════════════════════════════════════
// 4. 空响应重试后仍空 → failed
// ═══════════════════════════════════════════════════

test("空响应重试后仍空 → 放弃并标记 failed", async () => {
  const h = makeHarness([emptyResp(), emptyResp()]);
  const r = await runAgentLoop("画个圆", h.deps);
  assert.equal(h.calls, 2, "只允许重试一次");
  assert.match(r.finalText, /AI 未返回有效响应/);
  assert.equal(r.failed, true);
});

// ═══════════════════════════════════════════════════
// 5. 连续失败熔断
// ═══════════════════════════════════════════════════

test("连续 3 轮工具执行失败 → 熔断中止", async () => {
  const h = makeHarness([
    toolResp(toolCall("create_points", { points: [{ name: "A", x: 0, y: 0 }] })),
    toolResp(toolCall("create_points", { points: [{ name: "B", x: 0, y: 0 }] })),
    toolResp(toolCall("create_points", { points: [{ name: "C", x: 0, y: 0 }] })),
    toolResp(toolCall("create_points", { points: [{ name: "D", x: 0, y: 0 }] })),
  ]);
  // 注入恒失败执行器（错误不含 参数/预检 前缀 → 不可恢复 → 计熔断）
  h.deps.executeToolCallsImpl = (_api, calls) => calls.map(c => ({
    tool_call_id: c.id,
    role: "tool" as const,
    content: JSON.stringify({ success: false, error: "GGB 执行超时" }),
  }));
  const r = await runAgentLoop("构造", h.deps);
  assert.match(r.finalText, /连续 3 轮工具调用失败/);
  assert.equal(r.failed, true);
  assert.equal(h.mock.exists("A"), false, "熔断后不应有对象落地");
});

test("参数类失败不计入熔断（模型可自行修正）", async () => {
  const h = makeHarness([
    // 负半径 → preFlight 拦截（recoverable，清零熔断）
    toolResp(toolCall("create_circle", { name: "c", center: "O", radius: -3 })),
    toolResp(toolCall("create_circle", { name: "c", center: "O", radius: -5 })),
    toolResp(toolCall("create_circle", { name: "c", center: "O", radius: -7 })),
    textResp("改对了"),
  ]);
  const r = await runAgentLoop("画圆", h.deps);
  // 3 轮参数错误但未熔断，第 4 轮正常结束
  assert.equal(r.failed, false);
  assert.equal(r.finalText, "改对了");
});

test("同名对象重复「不存在」→ 第 2 次注入停止重试指引", async () => {
  const h = makeHarness([
    // set_style 引用不存在的对象 → preflight 报「依赖对象 Appel 不存在」（recoverable，不进熔断）
    toolResp(toolCall("set_style", { target: "Appel", color: "#ff0000" })),
    toolResp(toolCall("set_style", { target: "Appel", color: "#00ff00" })),
    textResp("已放弃该样式"),
  ]);
  const r = await runAgentLoop("把 Appel 改成红色", h.deps);
  assert.equal(r.failed, false, "可修正失败不应熔断");
  const hint = contents(r.messages, "user").find(t => t.includes("多次报「不存在」"));
  assert.ok(hint, "第 2 次同名失败后应注入指引");
  assert.ok(hint!.includes("Appel"));
  assert.ok(hint!.includes("list_objects"), "指引应指向 list_objects 核对对象名");
});

// ═══════════════════════════════════════════════════
// 6. 危险工具全部被拒
// ═══════════════════════════════════════════════════

test("危险工具全部被拒 → 引导换安全工具", async () => {
  const h = makeHarness([
    // 非赋值 scripting 命令 → 仍是 dangerous 走确认（赋值形态 eval_raw 已自动降档免确认）
    toolResp(toolCall("eval_raw", { command: "ZoomIn(2)" }, "tc-d1")),
    textResp("无法完成"),
  ]);
  registerConfirmationHandler(async () => [{ action: "deny", toolCallId: "tc-d1" }]);
  const r = await runAgentLoop("清空画布", h.deps);
  assert.deepEqual(r.deniedTools, ["eval_raw"]);
  // 全拒绝 → 注入换安全工具提示
  assert.ok(contents(r.messages, "user").some(t => t.includes("均被用户拒绝")));
});

// ═══════════════════════════════════════════════════
// 7. approve_all 信任会话
// ═══════════════════════════════════════════════════

test("危险工具 approve_all → 信任激活，后续跳过确认", async () => {
  const h = makeHarness([
    // 混合批次：safe 工具直接执行 + 非赋值 eval_raw 走确认（approve_all 信任后放行）
    toolResp(
      toolCall("create_points", { points: [{ name: "A", x: 0, y: 0 }] }, "tc-a"),
      toolCall("eval_raw", { command: 'SetCaption(A, "点A")' }, "tc-d1"),
    ),
    toolResp(toolCall("eval_raw", { command: 'SetCaption(A, "点B")' }, "tc-d2")),
    textResp("完成"),
  ]);
  let confirmCalls = 0;
  registerConfirmationHandler(async () => { confirmCalls++; return [{ action: "approve_all" }]; });
  const r = await runAgentLoop("构造", h.deps);
  assert.equal(confirmCalls, 1, "信任后第二轮不再请求确认");
  assert.equal(r.deniedTools.length, 0);
  assert.ok(h.mock.exists("A"));
});

// ═══════════════════════════════════════════════════
// 8. 未知工具过滤
// ═══════════════════════════════════════════════════

test("未知工具（hallucinate）→ 错误回喂，不执行", async () => {
  const h = makeHarness([
    toolResp({ id: "tc-unk", type: "function", function: { name: "nonexistent_tool", arguments: "{}" } }),
    textResp("完成"),
  ]);
  const r = await runAgentLoop("构造", h.deps);
  assert.ok(contents(r.messages, "tool").some(t => t.includes("未知工具")));
  assert.equal(r.finalText, "完成");
  assert.equal(r.failed, false, "未知工具不计入失败");
});

// ═══════════════════════════════════════════════════
// 9. persistTrajectory
// ═══════════════════════════════════════════════════

test("persistTrajectory 在成功路径被调用", async () => {
  const h = makeHarness([
    toolResp(toolCall("create_points", { points: [{ name: "A", x: 0, y: 0 }] })),
    textResp("完成"),
  ]);
  await runAgentLoop("画点 A", h.deps);
  assert.equal(h.persisted.length, 1);
  assert.ok(h.persisted[0].finalText === "完成");
});

// ═══════════════════════════════════════════════════
// 10. truncateHistory 配对完整性
// ═══════════════════════════════════════════════════

function mkTc(id: string): ToolCallDelta {
  return { id, type: "function", function: { name: "create_point", arguments: "{}" } };
}

test("truncateHistory：截断后 tool_calls/tool 配对完整，无孤立消息", () => {
  const messages: AgentMessage[] = [
    { role: "system", content: "sys" },
    { role: "user", content: "u0" },
    // 前一轮完整配对（窗口外被截掉）
    { role: "assistant", content: null, tool_calls: [mkTc("tc-old")] },
    { role: "tool", tool_call_id: "tc-old", content: "old" },
    { role: "user", content: "u1" },
    // 悬空 assistant(tool_calls)：其 tool 响应已被截掉
    { role: "assistant", content: null, tool_calls: [mkTc("tc-orphan")] },
    { role: "user", content: "u2" },
    // 孤立 tool：无对应 assistant
    { role: "tool", tool_call_id: "tc-lost", content: "lost" },
    // 完整配对（保留）
    { role: "assistant", content: null, tool_calls: [mkTc("tc-full")] },
    { role: "tool", tool_call_id: "tc-full", content: "full" },
  ];
  const truncated = truncateHistory(messages, 8);

  const toolIds = truncated.filter(m => m.role === "tool").map(m => m.tool_call_id);
  const assistantIds = truncated
    .filter(m => m.role === "assistant" && m.tool_calls)
    .flatMap(m => m.tool_calls!.map(t => t.id));
  // 双射：每个 tool 有对应 assistant，反之亦然
  for (const id of toolIds) assert.ok(assistantIds.includes(id), `tool ${id} 无配对`);
  for (const id of assistantIds) assert.ok(toolIds.includes(id), `assistant ${id} 无配对`);
  // 孤立 tool 与悬空 assistant 均被移除
  assert.ok(!truncated.some(m => m.role === "tool" && m.tool_call_id === "tc-lost"));
  assert.ok(!truncated.some(m => m.role === "assistant" && m.tool_calls?.some(t => t.id === "tc-orphan")));
  // 完整配对保留
  assert.ok(truncated.some(m => m.role === "tool" && m.tool_call_id === "tc-full"));
});

test("truncateHistory：窗口未超 → 原样返回", () => {
  const messages: AgentMessage[] = [
    { role: "system", content: "sys" },
    { role: "user", content: "u" },
  ];
  const truncated = truncateHistory(messages, 10);
  assert.deepEqual(truncated, messages);
});

test("truncateHistory：同一 assistant 的部分 tool 响应被截 → assistant 与残留响应一并清除", () => {
  const messages: AgentMessage[] = [
    { role: "system", content: "sys" },
    { role: "user", content: "u0" },
    // 3 个并行调用，只有第 1 个响应在（p2/p3 响应缺失——部分配对场景）
    { role: "assistant", content: null, tool_calls: [mkTc("p1"), mkTc("p2"), mkTc("p3")] },
    { role: "tool", tool_call_id: "p1", content: "r1" },
    { role: "user", content: "u1" },
    // 完整配对（保留）
    { role: "assistant", content: null, tool_calls: [mkTc("q1")] },
    { role: "tool", tool_call_id: "q1", content: "r2" },
  ];
  // 窗口 6 < 长度 7：kept = [A(p1-3), T(p1), u1, A(q1), T(q1)]，触发配对修复
  const truncated = truncateHistory(messages, 6);

  const toolIds = truncated.filter(m => m.role === "tool").map(m => m.tool_call_id);
  const assistantIds = truncated
    .filter(m => m.role === "assistant" && m.tool_calls)
    .flatMap(m => m.tool_calls!.map(t => t.id));
  // 双射不变量：不残留孤儿 tool，也不残留悬空 assistant
  for (const id of toolIds) assert.ok(assistantIds.includes(id), `tool ${id} 无配对`);
  for (const id of assistantIds) assert.ok(toolIds.includes(id), `assistant ${id} 无配对`);
  // 部分配对的 assistant 与其残留响应都不应出现
  assert.ok(!truncated.some(m => m.role === "assistant" && m.tool_calls?.some(t => t.id === "p1")));
  assert.ok(!truncated.some(m => m.role === "tool" && m.tool_call_id === "p1"));
  // 完整配对保留
  assert.ok(truncated.some(m => m.role === "tool" && m.tool_call_id === "q1"));
});

// ═══════════════════════════════════════════════════
// 12. 参数 JSON 解析失败 → 计入熔断
// ═══════════════════════════════════════════════════

test("参数 JSON 解析失败连续 3 轮 → 计入熔断（不无限轮转）", async () => {
  // 参数被流式截断：JSON 不完整 → safeParseJSON 失败 → Zod「参数校验失败」
  // 旧实现归为 recoverable 永不熔断，会烧满 30 轮迭代
  const badCall: ToolCallDelta = {
    id: "tc-bad", type: "function",
    function: { name: "create_points", arguments: '{"points": [{"name": "A", "x": 0, "y"' },
  };
  const h = makeHarness([toolResp(badCall), toolResp(badCall), toolResp(badCall), toolResp(badCall)]);
  const r = await runAgentLoop("构造", h.deps);
  assert.equal(r.failed, true, "连续解析失败应触发熔断而非烧满迭代");
  assert.match(r.finalText, /连续 3 轮工具调用失败/);
  // 第 2 轮起注入解析失败指引
  const hint = contents(r.messages, "user").find(t => t.includes("解析失败"));
  assert.ok(hint, "应注入解析失败根因指引");
  assert.ok(hint!.includes("单轮调用个数"), "指引应指向减少单轮调用规模");
});

// ═══════════════════════════════════════════════════
// 13. compressHistory 保留当前用户请求
// ═══════════════════════════════════════════════════

test("compressHistory：多轮对话时保留当前用户请求（而非 messages[1] 的历史消息）", () => {
  const mock = new MockGGB();
  const messages: AgentMessage[] = [
    { role: "system", content: "sys" },
    { role: "user", content: "历史消息A" },       // index 1：旧实现会错误保留这条
    { role: "assistant", content: "历史回复" },
    { role: "user", content: "当前请求：画斜抛运动" }, // index 3 = currentUserIndex
  ];
  // 补足到压缩阈值（40 条），配对完整
  for (let i = 0; i < 40; i++) {
    messages.push({ role: "assistant", content: null, tool_calls: [mkTc(`t${i}`)] });
    messages.push({ role: "tool", tool_call_id: `t${i}`, content: "ok" });
  }
  const out = compressHistory(messages, mock as unknown as GGBAppletApi, 8, { threshold: 40, interval: 8, keepRecent: 12 }, 3);
  assert.notEqual(out, messages, "达到阈值 + 轮次应触发压缩");
  assert.equal(out[1].content, "当前请求：画斜抛运动", "压缩后 index 1 必须是当前请求");
  assert.ok(String(out[2].content).includes("画布状态"), "index 2 应是画布状态摘要");
});

// ═══════════════════════════════════════════════════
// 14. 轮次耗尽 → incomplete 可续作暂停
// ═══════════════════════════════════════════════════

test("轮次耗尽 → incomplete 暂停：不回滚、画布保留、文案引导续作", async () => {
  // 第 1 轮创建对象 A，之后 29 轮无害查询撑满 30 轮预算
  const scripts = [
    toolResp(toolCall("create_points", { points: [{ name: "A", x: 0, y: 0 }] })),
    ...Array.from({ length: 29 }, () => toolResp(toolCall("list_objects", {}))),
  ];
  const h = makeHarness(scripts);
  const r = await runAgentLoop("长任务", h.deps);
  assert.equal(r.iterations, 30);
  assert.equal(r.incomplete, true, "轮次耗尽应标记 incomplete（可续作）");
  assert.notEqual(r.failed, true, "轮次耗尽不标记 failed（不触发快照回滚）");
  assert.ok(h.mock.exists("A"), "画布应保留已创建对象");
  assert.match(r.finalText, /暂停/);
  assert.match(r.finalText, /后续指令/);
  assert.match(r.finalText, /1 个对象/, "应报告画布保留的对象数");
});

// ═══════════════════════════════════════════════════
// 15. 续作轮 resumeMessages 注入
// ═══════════════════════════════════════════════════

test("续作轮：复用缓存上下文（换新 system、原始请求 index 1、立即压缩、[续作] 前缀）", async () => {
  const h = makeHarness([textResp("已继续完成")]);
  // 超压缩阈值（40 条）的暂停缓存：旧 system + 原始请求 + 20 对完整工具消息
  const cached: AgentMessage[] = [
    { role: "system", content: "旧 system prompt" },
    { role: "user", content: "原始请求：画斜抛运动" },
  ];
  for (let i = 0; i < 20; i++) {
    cached.push({ role: "assistant", content: null, tool_calls: [mkTc(`c${i}`)] });
    cached.push({ role: "tool", tool_call_id: `c${i}`, content: "ok" });
  }
  h.deps.resumeMessages = cached;
  h.mock.evalCommand("A = (0,0)"); // 画布已有进度 → 新指令应注入对象清单

  const r = await runAgentLoop("继续完成剩余部分", h.deps);
  assert.equal(r.finalText, "已继续完成");
  assert.equal(r.failed, false);

  const first = h.chatLog[0];
  assert.equal(first[0].role, "system");
  assert.notEqual(first[0].content, "旧 system prompt", "应换用本轮新生成的 system prompt");
  assert.equal(first[1].content, "原始请求：画斜抛运动", "原始请求应保留在 index 1（压缩保留位）");
  assert.ok(
    first.some(m => m.role === "user" && String(m.content).includes("[画布状态")),
    "超阈值缓存应在进入循环前立即压缩出画布摘要"
  );
  const lastUser = [...first].reverse().find(m => m.role === "user");
  assert.ok(lastUser, "应存在新指令消息");
  assert.ok(String(lastUser!.content).includes("[续作]"), "新指令应带续作标记");
  assert.ok(String(lastUser!.content).includes("当前画布已有对象"), "动态内容（画布清单）应后置到末尾");
});

// ═══════════════════════════════════════════════════
// 16. trapPrompt 注入 + eval_raw 自动降档
// ═══════════════════════════════════════════════════

test("trapPrompt 注入 system prompt 尾部", async () => {
  const h = makeHarness([textResp("ok")]);
  h.deps.trapPrompt = "· eval_raw 中 Sequence 括号漏闭合（出现 3 次）";
  await runAgentLoop("构造", h.deps);
  const sys = h.chatLog[0].find(m => m.role === "system");
  assert.ok(sys, "应有 system prompt");
  assert.ok(String(sys!.content).includes("历史高频陷阱"), "陷阱节应注入");
  assert.ok(String(sys!.content).includes("Sequence 括号漏闭合"), "陷阱内容应原样保留");
});

test("无 trapPrompt → system prompt 不含陷阱节", async () => {
  const h = makeHarness([textResp("ok")]);
  await runAgentLoop("构造", h.deps);
  const sys = h.chatLog[0].find(m => m.role === "system");
  assert.ok(!String(sys?.content).includes("历史高频陷阱"));
});

test("eval_raw 赋值形态（3D 构造）→ 免确认直接执行；Delete → 仍走确认", async () => {
  const h = makeHarness([
    toolResp(toolCall("eval_raw", { command: "c1 = Cube(A, 2)" }, "tc-cube")),
    toolResp(toolCall("eval_raw", { command: "Delete(A)" }, "tc-del")),
    textResp("完成"),
  ]);
  let confirmCalls = 0;
  registerConfirmationHandler(async (requests) => {
    confirmCalls++;
    // 只应收到 Delete 的确认请求
    assert.equal(requests.length, 1);
    assert.equal(requests[0].toolCallId, "tc-del");
    return [{ action: "deny", toolCallId: "tc-del" }];
  });
  h.deps.appMode = "3d";
  const r = await runAgentLoop("3D 构造", h.deps);
  assert.equal(confirmCalls, 1, "Cube 赋值形态应免确认，仅 Delete 弹确认");
  assert.deepEqual(r.deniedTools, ["eval_raw"]);
});
