/**
 * 行为验证：直接跑改动后的代码路径，验证三个改进项的真实效果。
 * 零 API 调用，纯本地。
 *
 *   node --import tsx tests/verify-improvements.ts
 */
import { MockGGB } from "./mockGGB";
import { executeToolCall } from "../src/lib/toolExecutor";
import { getRichSnapshot } from "../src/lib/ggbBridge";
import { runAgentLoop, type AgentLoopDeps } from "../src/lib/agentLoop";
import { registerConfirmationHandler, unregisterConfirmationHandler } from "../src/lib/agentLoop";
import type { AgentChatOverrides, AgentMessage, AgentResponse, ToolCallDelta } from "../src/lib/aiClient";
import type { GGBAppletApi } from "../src/types/ggb";

const line = (s: string) => console.log(s);
const pass = (s: string) => console.log("  ✅ " + s);
const fail = (s: string) => console.log("  ❌ " + s);

// ═══════════════════════════════════════════════
// 验证 1：P0-A —— approve_all 不得覆盖显式 deny
// ═══════════════════════════════════════════════
async function verifyDenyPriority() {
  line("\n【验证 1】approve_all 与显式 deny 共存（安全 bug 修复）");
  const scripts: AgentResponse[] = [];
  const toolCall = (name: string, args: Record<string, unknown>, id: string): ToolCallDelta => ({
    id, type: "function", function: { name, arguments: JSON.stringify(args) },
  });
  scripts.push({ content: null, finishReason: "tool_calls", toolCalls: [
    toolCall("eval_raw", { command: 'SetCaption(A, "点A")' }, "tc-1"),
    toolCall("eval_raw", { command: "ZoomIn(2)" }, "tc-2"),
  ]});
  scripts.push({ content: "done", finishReason: "stop", toolCalls: [] });

  let idx = 0;
  const mock = new MockGGB();
  const deps: AgentLoopDeps = {
    config: { provider: "test", baseURL: "http://x", apiKey: "k", model: "m" },
    domain: "general", appMode: "2d",
    signal: new AbortController().signal,
    getApi: () => mock as unknown as GGBAppletApi,
    getMessages: () => [] as never,
    agentModel: "m",
    agentChatImpl: async () => scripts[idx++],
  };
  registerConfirmationHandler(async () => [
    { action: "approve_all" },
    { action: "deny", toolCallId: "tc-2" },
  ]);
  const r = await runAgentLoop("构造", deps);
  unregisterConfirmationHandler();

  if (r.deniedTools.length === 1) pass(`显式 deny 生效（deniedTools=${JSON.stringify(r.deniedTools)}）`);
  else fail(`deny 被忽略！deniedTools=${JSON.stringify(r.deniedTools)}`);
}

// ═══════════════════════════════════════════════
// 验证 2：P2-B —— 失败 kind 结构化，且不依赖文案
// ═══════════════════════════════════════════════
function verifyFailureKind() {
  line("\n【验证 2】工具失败结构化 kind（熔断判定不再依赖错误文案）");
  const mock = new MockGGB();

  const cases: Array<[string, string, Record<string, unknown>, string]> = [
    ["参数校验失败", "create_circle", { name: "c", center: "O" }, "args"],
    ["语义预检失败", "create_points", { points: [{ name: "pt", x: 0, y: 0 }] }, "preflight"],
    ["安全拦截", "eval_raw", { command: "Execute({})" }, "safety"],
  ];
  for (const [label, tool, args, expect] of cases) {
    const res = executeToolCall(mock as unknown as GGBAppletApi, {
      id: "t", name: tool, arguments: args,
    });
    const p = JSON.parse(res.content) as { kind?: string; error?: string };
    if (p.kind === expect) pass(`${label} → kind="${p.kind}"（error 文案：${(p.error ?? "").slice(0, 24)}…）`);
    else fail(`${label} → 期望 kind="${expect}"，实际 "${p.kind}"`);
  }

  // 关键：成功结果不应带 kind
  const ok = executeToolCall(mock as unknown as GGBAppletApi, {
    id: "t2", name: "create_points", arguments: { points: [{ name: "A", x: 0, y: 0 }] },
  });
  const pk = JSON.parse(ok.content) as { kind?: string; success: boolean };
  if (pk.success && pk.kind === undefined) pass("成功结果不带 kind（不污染正常返回）");
  else fail(`成功结果 kind=${pk.kind}`);
}

// ═══════════════════════════════════════════════
// 验证 3：P1-E —— 快照有界输出
// ═══════════════════════════════════════════════
function verifySnapshotBounds() {
  line("\n【验证 3】getRichSnapshot 有界输出");
  const mock = new MockGGB();

  const small = getRichSnapshot(mock as unknown as GGBAppletApi);
  if (small === "(空画布)") pass("空画布 → 固定文案");

  const objs = Array.from({ length: 80 }, (_, i) => ({ name: `P${i}`, type: "Point" }));
  // MockGGB 需要 seed
  (mock as unknown as { seed: (o: unknown[]) => void }).seed(objs);
  const big = getRichSnapshot(mock as unknown as GGBAppletApi);
  const listed = (big.match(/^P\d+ \(/gm) ?? []).length;

  if (big.includes("快照已截断")) pass(`超 60 对象 → 已截断（实际列出 ${listed} 个 / 共 80）`);
  else fail("超限未截断！");

  const m = big.match(/另有 (\d+) 个对象未列出/);
  if (m) pass(`明确告知剩余数量：另有 ${m[1]} 个对象未列出`);
  else fail("未告知剩余对象数（模型会把'没列出'当'不存在'）");

  if (big.includes("get_object_info")) pass("提供了继续查询的指引");
  else fail("缺少 get_object_info 指引");

  line(`     快照长度：${big.length} 字符（上限 12000）`);
}

// ═══════════════════════════════════════════════
// 验证 4：P0-A —— 空决策与用户拒绝要能区分
// ═══════════════════════════════════════════════
async function verifyEmptyDecision() {
  line("\n【验证 4】确认回调返回空 → 与「用户拒绝」区分");
  const scripts: AgentResponse[] = [
    { content: null, finishReason: "tool_calls", toolCalls: [
      { id: "tc-9", type: "function", function: { name: "eval_raw", arguments: JSON.stringify({ command: "ZoomIn(2)" }) } },
    ]},
    { content: "结束", finishReason: "stop", toolCalls: [] },
  ];
  let idx = 0;
  const mock = new MockGGB();
  const deps: AgentLoopDeps = {
    config: { provider: "test", baseURL: "http://x", apiKey: "k", model: "m" },
    domain: "general", appMode: "2d",
    signal: new AbortController().signal,
    getApi: () => mock as unknown as GGBAppletApi,
    getMessages: () => [] as never,
    agentModel: "m",
    agentChatImpl: async () => scripts[idx++],
  };
  registerConfirmationHandler(async () => []);  // 空决策
  const r = await runAgentLoop("缩放", deps);
  unregisterConfirmationHandler();

  const toolMsg = r.messages.find((m: AgentMessage) => m.role === "tool" && m.tool_call_id === "tc-9");
  const text = typeof toolMsg?.content === "string" ? toolMsg.content : "";
  if (text.includes("未收到确认决策")) pass("空决策 → 回喂「未收到确认决策」（与用户主动拒绝区分）");
  else fail(`空决策文案不符：${text}`);
  if (r.deniedTools.length === 1) pass("空决策也记入 deniedTools（不静默跳过）");
}

(async () => {
  line("═══ 改进项行为验证（零 API 调用）═══");
  await verifyDenyPriority();
  verifyFailureKind();
  verifySnapshotBounds();
  await verifyEmptyDecision();
  line("\n═══ 验证结束 ═══");
})();
