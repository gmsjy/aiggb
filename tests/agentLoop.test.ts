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
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  runAgentLoop,
  truncateHistory,
  registerConfirmationHandler,
  unregisterConfirmationHandler,
  type AgentLoopDeps,
} from "../src/lib/agentLoop";
import type { AgentMessage, AgentResponse, ToolCallDelta } from "../src/lib/aiClient";
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
    agentChatImpl: async (_cfg, msgs) => {
      chatLog.push(msgs);
      const next = scripts[idx++];
      if (!next) throw new Error(`agentChatImpl 脚本耗尽（第 ${idx} 次调用）`);
      return next;
    },
    persistTrajectory: rec => void persisted.push(rec),
  };

  return {
    deps, controller, mock, chatLog, persisted,
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
    toolResp(toolCall("create_point", { name: "A", x: 0, y: 0 })),
    toolResp(toolCall("create_slider", { name: "r", min: 1, max: 5, step: 0.1, value: 2 })),
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
    toolResp(toolCall("create_point", { name: "A", x: 0, y: 0 })),
    toolResp(toolCall("create_point", { name: "B", x: 0, y: 0 })),
    toolResp(toolCall("create_point", { name: "C", x: 0, y: 0 })),
    toolResp(toolCall("create_point", { name: "D", x: 0, y: 0 })),
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

// ═══════════════════════════════════════════════════
// 6. 危险工具全部被拒
// ═══════════════════════════════════════════════════

test("危险工具全部被拒 → 引导换安全工具", async () => {
  const h = makeHarness([
    toolResp(toolCall("eval_raw", { command: "A = (0,0)" }, "tc-d1")),
    textResp("无法完成"),
  ]);
  registerConfirmationHandler(async () => [{ action: "deny", toolCallId: "tc-d1" }]);
  const r = await runAgentLoop("清空画布", h.deps);
  assert.deepEqual(r.deniedTools, ["eval_raw"]);
  // 全拒绝 → 注入换安全工具提示
  assert.ok(contents(r.messages, "user").some(t => t.includes("均被用户拒绝")));
  assert.equal(h.mock.exists("A"), false, "被拒工具不应执行");
});

// ═══════════════════════════════════════════════════
// 7. approve_all 信任会话
// ═══════════════════════════════════════════════════

test("危险工具 approve_all → 信任激活，后续跳过确认", async () => {
  const h = makeHarness([
    toolResp(toolCall("eval_raw", { command: "A = (0,0)" }, "tc-a1")),
    toolResp(toolCall("eval_raw", { command: "B = (1,1)" }, "tc-a2")),
    textResp("完成"),
  ]);
  let confirmCalls = 0;
  registerConfirmationHandler(async () => { confirmCalls++; return [{ action: "approve_all" }]; });
  const r = await runAgentLoop("构造", h.deps);
  assert.equal(confirmCalls, 1, "信任后第二轮不再请求确认");
  assert.equal(r.deniedTools.length, 0);
  assert.ok(h.mock.exists("A") && h.mock.exists("B"));
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
    toolResp(toolCall("create_point", { name: "A", x: 0, y: 0 })),
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
