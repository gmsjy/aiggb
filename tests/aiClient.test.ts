/**
 * aiClient L1 单测（0 API、纯离线）—— 智谱 GLM 适配
 *   - isZhipuProvider 检测（provider / baseURL / 模型名）
 *   - getProviderQuirks zhipu 分支
 *   - buildThinkingParam 按 provider 翻译（GLM thinking.type / DeepSeek reasoning_effort / 其他不发）
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildThinkingParam, getProviderQuirks, isZhipuProvider, type AIConfig } from "../src/lib/aiClient";

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
