/**
 * satisfactionEval L1 单测（0 API、纯离线）
 *   - AI 返回 satisfied=true → 正确解析
 *   - AI 返回 satisfied=false + issues → 正确解析
 *   - 短规格跳过评估
 *   - 非 JSON 输出 → 默认通过
 *   - API 异常 → 默认通过不阻断
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { evaluateSatisfaction, evaluateVisual, SatisfactionResult } from "../src/lib/satisfactionEval";
import type { AIConfig, ChatMessage, ContentPart } from "../src/lib/aiClient";

const config: AIConfig = {
  provider: "test",
  baseURL: "http://localhost",
  apiKey: "k",
  model: "m",
  flashModel: "flash-m"
};

test("AI 返回 satisfied=true → 正确解析", async () => {
  const mockChatRaw = async () => JSON.stringify({ satisfied: true, issues: [], summary: "一切正常" });
  const result = await evaluateSatisfaction(
    config,
    "绘制圆心在原点、半径 3 的红色虚线圆，开轨迹",
    "O (point): O = (0,0)\nc (circle): c = Circle(O, 3)",
    undefined,
    "flash-m",
    mockChatRaw
  );
  assert.equal(result.satisfied, true);
  assert.equal(result.issues.length, 0);
});

test("AI 返回 satisfied=false + issues → 正确解析", async () => {
  const mockChatRaw = async () => JSON.stringify({
    satisfied: false,
    issues: ["缺少虚线样式", "轨迹未开启"],
    summary: "样式不符"
  });
  const result = await evaluateSatisfaction(
    config,
    "绘制有轨迹的红色虚线圆，圆心在 A(2,3)，半径 5 可拖拽调节，需要满足二十五个字符以上",
    "A (point): A = (2,3)\nc (circle): c = Circle(A, 5)\n  style: color=#000000",
    undefined,
    "flash-m",
    mockChatRaw
  );
  assert.equal(result.satisfied, false);
  assert.equal(result.issues.length, 2);
  assert.ok(result.issues.some(i => i.includes("虚线")));
});

test("AI 返回字符串 satisfied → 容错解析", async () => {
  const mockChatRaw = async () => `{"satisfied": "true", "issues": [], "summary": "ok"}`;
  const result = await evaluateSatisfaction(
    config,
    "规格: 画一个蓝色三角形 ABC，边长标注",
    "A (point): A = (-2,0)\nB (point): B = (2,0)\nC (point): C = (0,3)",
    undefined,
    "flash-m",
    mockChatRaw
  );
  assert.equal(result.satisfied, true);
});

test("短规格跳过评估", async () => {
  let called = false;
  const mockChatRaw = async () => { called = true; return "{}"; };
  const result = await evaluateSatisfaction(
    config,
    "画点 A(1,2)",  // < 25 chars
    "A (point): A = (1,2)",
    undefined,
    "flash-m",
    mockChatRaw
  );
  assert.equal(result.satisfied, true);
  assert.equal(result.issues.length, 0);
  assert.equal(result.summary, "规格过短，跳过评估");
  assert.equal(called, false, "短规格不应调用 AI");
});

test("非 JSON 输出 → 默认通过", async () => {
  const mockChatRaw = async () => "这个问题我判断不了，请人工审查";
  const result = await evaluateSatisfaction(
    config,
    "复杂规格：绘制正方体截面、标注顶点、设旋转动画与视窗自适应。",
    "A (point): A = (0,0,0)\nB (point): B = (3,0,0)",
    undefined,
    "flash-m",
    mockChatRaw
  );
  assert.equal(result.satisfied, true, "非 JSON 输出应默认通过");
  // JSON.parse 失败走外层 catch → summary 包含错误信息
  assert.ok(result.summary.includes("评估"), "summary 应包含评估相关描述");
});

test("API 异常 → 默认通过不阻断", async () => {
  const mockChatRaw = async () => { throw new Error("网络超时"); };
  const result = await evaluateSatisfaction(
    config,
    "中等长度规格用于测试异常降级处理逻辑，可能需要二十五个字符以上。",
    "P (point): P = (1,0)",
    undefined,
    "flash-m",
    mockChatRaw
  );
  assert.equal(result.satisfied, true, "API 异常应默认通过");
  assert.ok(result.summary.includes("评估调用失败"));
});

test("Zod 校验失败 → 宽松解析", async () => {
  // 缺少 satisfied 字段，但有 issues
  const mockChatRaw = async () => JSON.stringify({ issues: ["问题A"], extra: 123 });
  const result = await evaluateSatisfaction(
    config,
    "大致居中的椭圆并标注焦点距离，颜色柔和适合教学演示使用。",
    "F1 (point): F1 = (-2,0)\nF2 (point): F2 = (2,0)",
    undefined,
    "flash-m",
    mockChatRaw
  );
  // satisfied 缺失 → Boolean(undefined) = false
  assert.equal(result.satisfied, false);
  assert.equal(result.issues.length, 1);
});

test("JSON 在 code fence 内 → 正常解析", async () => {
  const mockChatRaw = async () => '```json\n{"satisfied":true,"issues":[],"summary":"合格"}\n```';
  const result = await evaluateSatisfaction(
    config,
    "画一个干净的直角坐标系并标出单位长度刻度。",
    "grid (list): grid = Sequence(Sequence(...",
    undefined,
    "flash-m",
    mockChatRaw
  );
  assert.equal(result.satisfied, true);
});

test("SatisfactionResult Zod schema 拒绝超长 issues", async () => {
  const tooLong = { satisfied: false, issues: ["a".repeat(200)], summary: "x" };
  const r = SatisfactionResult.safeParse(tooLong);
  assert.equal(r.success, false);
});

test("SatisfactionResult Zod schema 通过合法数据", async () => {
  const ok = { satisfied: true, issues: [], summary: "完全符合" };
  const r = SatisfactionResult.safeParse(ok);
  assert.equal(r.success, true);
});

// ──── evaluateVisual（画布截图 + 视觉模型审查） ────

const IMG = "data:image/png;base64," + "Zm9v".repeat(40); // 合法形态的 data URL

test("视觉审查 satisfied=false + issues → 正确解析", async () => {
  const mockChatRaw = async () =>
    JSON.stringify({ satisfied: false, issues: ["轨迹明显超出视窗"], summary: "轨迹出框" });
  const result = await evaluateVisual(
    config, "【题干】平抛运动，画出轨迹示意", IMG, undefined, "vision-m", mockChatRaw
  );
  assert.equal(result.satisfied, false);
  assert.ok(result.issues[0].includes("视窗"));
});

test("视觉审查消息 = 文本(题目要求) + 截图(image_url) 两段", async () => {
  let captured: ChatMessage[] | null = null;
  const mockChatRaw = async (_cfg: AIConfig, msgs: ChatMessage[]) => {
    captured = msgs;
    return JSON.stringify({ satisfied: true, issues: [], summary: "ok" });
  };
  await evaluateVisual(config, "题目要求全文在此", IMG, undefined, "vision-m", mockChatRaw);
  assert.ok(captured);
  assert.equal(captured!.length, 2);
  const parts = captured![1].content as ContentPart[];
  assert.ok(Array.isArray(parts), "user content 应为多模态 parts");
  assert.equal(parts.filter(p => p.type === "image_url").length, 1, "应包含一张截图");
  assert.equal(parts.filter(p => p.type === "text").length, 1, "应包含题目要求文本");
  assert.ok((parts[0] as { text: string }).text.includes("题目要求全文在此"));
});

test("视觉审查跳过 thinking：reasoningEffort 不下发", async () => {
  let capturedCfg: AIConfig | null = null;
  const mockChatRaw = async (cfg: AIConfig) => {
    capturedCfg = cfg;
    return JSON.stringify({ satisfied: true, issues: [], summary: "ok" });
  };
  const cfgWithThinking: AIConfig = { ...config, reasoningEffort: "high" };
  await evaluateVisual(cfgWithThinking, "题目要求文本，超过最短长度限制以正常执行审查。", IMG, undefined, "vision-m", mockChatRaw);
  assert.equal(capturedCfg!.reasoningEffort, undefined, "视觉审查不应携带 reasoning_effort");
});

test("视觉审查空截图 → 跳过且不调 AI", async () => {
  let called = false;
  const mockChatRaw = async () => { called = true; return "{}"; };
  const result = await evaluateVisual(config, "题目要求", "", undefined, "vision-m", mockChatRaw);
  assert.equal(result.satisfied, true);
  assert.equal(result.summary, "无截图，跳过视觉核对");
  assert.equal(called, false);
});

test("视觉审查 fence 包裹 / 截断 JSON 提取 / 非 JSON → 容错或默认通过", async () => {
  const fenced = async () => '```json\n{"satisfied":true,"issues":[],"summary":"合格"}\n```';
  assert.equal(
    (await evaluateVisual(config, "题目要求", IMG, undefined, "vision-m", fenced)).satisfied, true);

  // 截断但可提取 {...}：宽松解析
  const truncatedLike = async () => '前缀说明 {"satisfied":false,"issues":["颜色不符"],"summary":"样式"} 后缀';
  assert.ok(
    (await evaluateVisual(config, "题目要求", IMG, undefined, "vision-m", truncatedLike)).issues.length === 1);

  // 完全非 JSON → fail-open 默认通过
  const garbage = async () => "我看不清这张图";
  const r = await evaluateVisual(config, "题目要求", IMG, undefined, "vision-m", garbage);
  assert.equal(r.satisfied, true, "非 JSON 输出应默认通过");
});

test("视觉审查 API 异常 → 默认通过不阻断", async () => {
  const mockChatRaw = async () => { throw new Error("网络超时"); };
  const result = await evaluateVisual(config, "题目要求", IMG, undefined, "vision-m", mockChatRaw);
  assert.equal(result.satisfied, true, "视觉审查异常应默认通过");
  assert.ok(result.summary.includes("视觉审查失败"));
});
