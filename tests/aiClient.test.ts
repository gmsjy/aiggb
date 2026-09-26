/**
 * aiClient L1 单测（0 API、纯离线）—— 智谱 GLM 适配
 *   - isZhipuProvider 检测（provider / baseURL / 模型名）
 *   - getProviderQuirks zhipu 分支
 *   - buildThinkingParam 按 provider 翻译（GLM thinking.type / DeepSeek reasoning_effort / 其他不发）
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildThinkingParam,
  getProviderQuirks,
  isZhipuProvider,
  resolveMaxOutputTokens,
  DEFAULT_OUTPUT_TOKENS,
  THINKING_OUTPUT_TOKENS,
  type AIConfig,
} from "../src/lib/aiClient";

const cfg = (over: Partial<AIConfig> = {}): AIConfig => ({
  provider: "test",
  baseURL: "https://example.com/v1",
  apiKey: "k",
  model: "m",
  ...over,
});

// ── isZhipuProvider ──

test("isZhipuProvider：provider=zhipu 命中", () => {
  assert.equal(isZhipuProvider(cfg({ provider: "zhipu", model: "whatever" })), true);
});

test("isZhipuProvider：baseURL bigmodel.cn 命中（自定义 provider）", () => {
  assert.equal(isZhipuProvider(cfg({ provider: "custom", baseURL: "https://open.bigmodel.cn/api/paas/v4" })), true);
});

test("isZhipuProvider：模型名 glm-* 命中", () => {
  assert.equal(isZhipuProvider(cfg({ provider: "custom", model: "glm-4.6" })), true);
});

test("isZhipuProvider：deepseek / openai 不命中", () => {
  assert.equal(isZhipuProvider(cfg({ provider: "deepseek", model: "deepseek-v4-flash" })), false);
  assert.equal(isZhipuProvider(cfg({ provider: "openai", model: "gpt-4o" })), false);
});

// ── getProviderQuirks zhipu 分支 ──

test("getProviderQuirks：zhipu → supportsThinking + 不回传 reasoning_content", () => {
  const q = getProviderQuirks(cfg({ provider: "zhipu", model: "glm-4.6" }));
  assert.equal(q.supportsThinking, true);
  assert.equal(q.mustRoundtripReasoning, false);
  assert.equal(q.streamsFinishReason, true);
});

test("getProviderQuirks：deepseek 仍回传 reasoning_content（回归）", () => {
  const q = getProviderQuirks(cfg({ provider: "deepseek", model: "deepseek-v4-flash" }));
  assert.equal(q.mustRoundtripReasoning, true);
  assert.equal(q.supportsThinking, true);
});

// ── buildThinkingParam ──

test("buildThinkingParam：zhipu 未设置 effort → thinking disabled（对齐 baseline）", () => {
  const p = buildThinkingParam(cfg({ provider: "zhipu", model: "glm-4.6" }));
  assert.deepEqual(p, { thinking: { type: "disabled" } });
});

test("buildThinkingParam：zhipu 设置 effort → thinking enabled（无档位）", () => {
  const p = buildThinkingParam(cfg({ provider: "zhipu", model: "glm-4.6", reasoningEffort: "high" }));
  assert.deepEqual(p, { thinking: { type: "enabled" } });
});

test("buildThinkingParam：deepseek 设置 effort → reasoning_effort", () => {
  const p = buildThinkingParam(cfg({ provider: "deepseek", model: "deepseek-v4-flash", reasoningEffort: "high" }));
  assert.deepEqual(p, { reasoning_effort: "high" });
});

test("buildThinkingParam：deepseek 未设置 → null（不发）", () => {
  assert.equal(buildThinkingParam(cfg({ provider: "deepseek", model: "deepseek-v4-flash" })), null);
});

test("buildThinkingParam：其他 provider（openai）→ 恒 null", () => {
  assert.equal(buildThinkingParam(cfg({ provider: "openai", model: "gpt-4o" })), null);
  assert.equal(buildThinkingParam(cfg({ provider: "openai", model: "gpt-4o", reasoningEffort: "low" })), null);
});

// ── resolveMaxOutputTokens（输出预算）──
// 背景：V4.1 Flash 默认思考，reasoning 与正文共享 max_tokens；budget 太小 →
//      正文/工具调用被截断为空（finish_reason="length"）。

test("resolveMaxOutputTokens：未配置 → 非 thinking 16384 / thinking 32768", () => {
  assert.equal(resolveMaxOutputTokens(cfg(), false), DEFAULT_OUTPUT_TOKENS);
  assert.equal(resolveMaxOutputTokens(cfg(), true), THINKING_OUTPUT_TOKENS);
  assert.ok(DEFAULT_OUTPUT_TOKENS >= 16384, "baseline 预算须给思考留足空间（原值 8192 实测被吃满 95%）");
});

test("resolveMaxOutputTokens：配置优先于默认值", () => {
  assert.equal(resolveMaxOutputTokens(cfg({ maxOutputTokens: 4096 }), false), 4096);
  assert.equal(resolveMaxOutputTokens(cfg({ maxOutputTokens: 4096 }), true), 4096);
});

test("resolveMaxOutputTokens：非法/零值回退默认", () => {
  assert.equal(resolveMaxOutputTokens(cfg({ maxOutputTokens: 0 }), false), DEFAULT_OUTPUT_TOKENS);
  assert.equal(resolveMaxOutputTokens(cfg({ maxOutputTokens: -5 }), true), THINKING_OUTPUT_TOKENS);
});

// ── withCallTimeout（非流式调用兜底超时）──

test("withCallTimeout：超时触发 abort，reason 为 TimeoutError", async () => {
  const { withCallTimeout } = await import("../src/lib/aiClient");
  const t = withCallTimeout(undefined, 30);
  const result = await new Promise<{ name: string }>(resolve => {
    t.signal.addEventListener("abort", () => resolve({ name: (t.signal.reason as Error).name }));
  });
  t.done();
  assert.equal(result.name, "TimeoutError", "超时应以 TimeoutError 中止");
});

test("withCallTimeout：外部 signal 中止立即透传，done() 清理不误触发", async () => {
  const { withCallTimeout } = await import("../src/lib/aiClient");
  const outer = new AbortController();
  const t = withCallTimeout(outer.signal, 60_000);
  const result = await new Promise<{ aborted: boolean }>(resolve => {
    t.signal.addEventListener("abort", () => resolve({ aborted: true }));
    outer.abort(new Error("用户取消"));
  });
  t.done();
  assert.equal(result.aborted, true, "外部中止应立即透传");
  assert.equal(t.signal.aborted, true);
  // done() 之后定时器已清理：无法再等 60s 验证，这里仅确保调用不抛错
});

test("withCallTimeout：done() 后超时不再触发（信号保持未中止）", async () => {
  const { withCallTimeout } = await import("../src/lib/aiClient");
  const t = withCallTimeout(undefined, 20);
  t.done();
  await new Promise(r => setTimeout(r, 60));
  assert.equal(t.signal.aborted, false, "done() 清理定时器后不应再中止");
});

test("withCallTimeout：外部 signal 已中止时直接返回已中止信号", async () => {
  const { withCallTimeout } = await import("../src/lib/aiClient");
  const outer = new AbortController();
  outer.abort();
  const t = withCallTimeout(outer.signal, 60_000);
  assert.equal(t.signal.aborted, true, "已中止的外部 signal 应立即同步中止");
  t.done();
});

// ── config.timeoutMs（评估链路短超时，2026-09 二轮整机实测）──

test("chatRaw：config.timeoutMs 收紧兜底超时（挂起 fetch 按信号 reason 中断）", async () => {
  const { chatRaw } = await import("../src/lib/aiClient");
  const realFetch = globalThis.fetch;
  let aborted = false;
  // 永不 resolve 的挂起连接；abort 时以 signal.reason 拒绝（对齐真实 fetch 行为）
  globalThis.fetch = ((_url: unknown, init?: { signal?: AbortSignal }) =>
    new Promise<never>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        aborted = true;
        reject(init.signal?.reason ?? new DOMException("aborted", "AbortError"));
      });
    })) as typeof fetch;
  try {
    await assert.rejects(
      chatRaw(cfg({ timeoutMs: 40 }), [{ role: "user", content: "hi" }]),
      (err: Error) => err.name === "TimeoutError" || /超时/.test(err.message)
    );
    assert.equal(aborted, true, "挂起连接应在 timeoutMs 后被中止");
  } finally {
    globalThis.fetch = realFetch;
  }
});
