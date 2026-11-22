/**
 * providers L1 单测（0 API、纯离线）—— 模型清单与多模态能力判定
 *
 *   modelSupportsVision 用于在设置面板提示「带图轮图片会不会被忽略」：
 *   带图轮把原题图片一路传给 Agent 模型，不支持图片的模型会静默丢弃 image_url。
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { findProvider, modelSupportsVision, PROVIDER_PRESETS } from "../src/lib/providers";

// ── 预设清单完整性 ──

test("DeepSeek 预设：第一条是 deepseek-flash（默认推荐）", () => {
  const p = findProvider("deepseek");
  assert.ok(p);
  assert.equal(p!.models[0], "deepseek-flash", "默认模型应为多模态的 deepseek-flash");
});

test("每个 provider 的 visionModels 必须包含在模型候选或明确为独立视觉档", () => {
  for (const p of PROVIDER_PRESETS) {
    for (const v of p.visionModels ?? []) {
      assert.equal(typeof v, "string");
      assert.ok(v.length > 0, `${p.id} 的视觉候选不应为空字符串`);
    }
  }
});

// ── modelSupportsVision：已知清单命中 ──

test("modelSupportsVision：deepseek-flash 支持图片", () => {
  assert.equal(modelSupportsVision("deepseek", "deepseek-flash"), true);
});

test("modelSupportsVision：deepseek-v4-pro 不支持图片（官方明确）", () => {
  assert.equal(modelSupportsVision("deepseek", "deepseek-v4-pro"), false);
});

test("modelSupportsVision：GLM 视觉候选 glm-4.5v 命中", () => {
  assert.equal(modelSupportsVision("zhipu", "glm-4.5v"), true);
});

test("modelSupportsVision：OpenAI gpt-4o / gpt-4.1 命中", () => {
  assert.equal(modelSupportsVision("openai", "gpt-4o"), true);
  assert.equal(modelSupportsVision("openai", "gpt-4.1"), true);
});

// ── 命名启发式 ──

test("modelSupportsVision：命名含 vision/vl/omni 视为多模态", () => {
  assert.equal(modelSupportsVision("custom", "my-company-vl-72b"), true);
  assert.equal(modelSupportsVision("custom", "some-vision-model"), true);
  assert.equal(modelSupportsVision("custom", "qwen2.5-vl-7b"), true);
});

test("modelSupportsVision：纯文本模型不误判", () => {
  assert.equal(modelSupportsVision("moonshot", "moonshot-v1-8k"), false);
  assert.equal(modelSupportsVision("ollama", "llama3.1:8b"), false);
  assert.equal(modelSupportsVision("custom", "some-text-model", "https://example.com/v1"), false);
});

test("modelSupportsVision：空模型名返回 false（保守）", () => {
  assert.equal(modelSupportsVision("deepseek", ""), false);
  assert.equal(modelSupportsVision("deepseek", undefined), false);
  assert.equal(modelSupportsVision("deepseek", "   "), false);
});

test("modelSupportsVision：大小写不敏感", () => {
  assert.equal(modelSupportsVision("deepseek", "DeepSeek-Flash"), true);
  assert.equal(modelSupportsVision("openai", "GPT-4O"), true);
});

// ── baseURL 反查（自定义 provider 也能识别）──

test("modelSupportsVision：自定义 provider + DeepSeek baseURL 仍能识别 flash", () => {
  assert.equal(
    modelSupportsVision("custom", "deepseek-flash", "https://api.deepseek.com"),
    true
  );
});

test("modelSupportsVision：baseURL 反查不影响未知模型判定", () => {
  assert.equal(
    modelSupportsVision("custom", "my-private-model", "https://api.deepseek.com"),
    false
  );
});
