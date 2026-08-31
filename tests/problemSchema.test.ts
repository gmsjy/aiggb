/**
 * problemSchema L1 单测（0 API、纯离线）
 *   npm run test:unit
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { parseProblemAnalysis, serializeProblem } from "../src/lib/problemSchema";

// ── parseProblemAnalysis 容错矩阵 ──

test("正常 JSON → 解析成功", () => {
  const raw = JSON.stringify({
    problem_text: "斜抛 v0=20 仰角45°",
    knowns: [{ name: "v0", value: 20, unit: "m/s" }],
    goal: "演示抛体运动",
    animation_hints: [{ type: "slider", desc: "v0 滑块" }],
  });
  const result = parseProblemAnalysis(raw);
  assert.ok(result);
  assert.equal(result.problem_text, "斜抛 v0=20 仰角45°");
  assert.equal(result.knowns.length, 1);
  assert.equal(result.knowns[0].value, 20);
  assert.equal(result.animation_hints[0].type, "slider");
});

test("```json fence 剥离", () => {
  const raw = '```json\n{"problem_text":"测试","knowns":[],"animation_hints":[]}\n```';
  const result = parseProblemAnalysis(raw);
  assert.ok(result);
  assert.equal(result.problem_text, "测试");
});

test("knowns 缺省 → 空数组", () => {
  const raw = JSON.stringify({ problem_text: "测试", animation_hints: [] });
  const result = parseProblemAnalysis(raw);
  assert.ok(result);
  assert.deepEqual(result.knowns, []);
});

test("animation_hints 缺省 → 空数组", () => {
  const raw = JSON.stringify({ problem_text: "测试", knowns: [] });
  const result = parseProblemAnalysis(raw);
  assert.ok(result);
  assert.deepEqual(result.animation_hints, []);
});

test("knowns 非数组 → 归一为空数组", () => {
  const raw = JSON.stringify({ problem_text: "测试", knowns: "invalid", animation_hints: [] });
  const result = parseProblemAnalysis(raw);
  assert.ok(result);
  assert.deepEqual(result.knowns, []);
});

test("value 字符串数字 → 保留原类型", () => {
  const raw = JSON.stringify({
    problem_text: "测试",
    knowns: [{ name: "x", value: "20" }],
    animation_hints: [],
  });
  const result = parseProblemAnalysis(raw);
  assert.ok(result);
  assert.equal(result.knowns[0].value, "20");
});

test("hint type 非法 → 降级为 other", () => {
  const raw = JSON.stringify({
    problem_text: "测试",
    knowns: [],
    animation_hints: [{ type: "invalid_type", desc: "某建议" }],
  });
  const result = parseProblemAnalysis(raw);
  assert.ok(result);
  assert.equal(result.animation_hints[0].type, "other");
  assert.equal(result.animation_hints[0].desc, "某建议");
});

test("空 problem_text 且无 ask → null", () => {
  const raw = JSON.stringify({ problem_text: "", knowns: [], animation_hints: [] });
  const result = parseProblemAnalysis(raw);
  assert.equal(result, null);
});

test("有 ask 无 problem_text → 成功", () => {
  const raw = JSON.stringify({ problem_text: "", ask: "图片不清楚", knowns: [], animation_hints: [] });
  const result = parseProblemAnalysis(raw);
  assert.ok(result);
  assert.equal(result.ask, "图片不清楚");
});

test("JSON.parse 失败 → null", () => {
  const result = parseProblemAnalysis("not json at all");
  assert.equal(result, null);
});

test("嵌套 JSON 提取（外层有额外文字）", () => {
  const raw = 'some text before {"problem_text":"ok","knowns":[],"animation_hints":[]} some text after';
  const result = parseProblemAnalysis(raw);
  assert.ok(result);
  assert.equal(result.problem_text, "ok");
});

test("problem_text 超 1500 字 → Zod 拒绝 → null", () => {
  const longText = "a".repeat(1501);
  const raw = JSON.stringify({ problem_text: longText, knowns: [], animation_hints: [] });
  const result = parseProblemAnalysis(raw);
  assert.equal(result, null);
});

test("problem_text 恰好 1500 字 → 通过", () => {
  const exactText = "a".repeat(1500);
  const raw = JSON.stringify({ problem_text: exactText, knowns: [], animation_hints: [] });
  const result = parseProblemAnalysis(raw);
  assert.ok(result);
  assert.equal(result.problem_text.length, 1500);
});

test("截断 JSON（未闭合括号）→ null", () => {
  const raw = '{"problem_text":"斜抛运动 v0=20 m/s，仰角45°，不计空气阻力。求：(1)最大高度；(2)射程","knowns":[{"name":"v0","value":20,"unit":"m/s"}],"goal":"演示抛体运';
  const result = parseProblemAnalysis(raw);
  assert.equal(result, null);
});

// ── serializeProblem 确定性 ──

test("serializeProblem 同输入两次相等", () => {
  const p = {
    problem_text: "斜抛 v0=20",
    knowns: [{ name: "v0", value: 20, unit: "m/s" }],
    goal: "演示运动",
    figure: "地面水平线",
    animation_hints: [{ type: "slider" as const, desc: "v0 滑块" }],
  };
  const a = serializeProblem(p);
  const b = serializeProblem(p);
  assert.equal(a, b);
});

test("serializeProblem 分节齐全", () => {
  const p = {
    problem_text: "题干内容",
    knowns: [{ name: "g", value: 9.8, unit: "m/s²" }],
    goal: "目标内容",
    figure: "图示内容",
    animation_hints: [{ type: "animate" as const, desc: "t 动画" }],
  };
  const s = serializeProblem(p);
  assert.ok(s.includes("【题干】"));
  assert.ok(s.includes("【已知量】"));
  assert.ok(s.includes("【目标】"));
  assert.ok(s.includes("【图示信息】"));
  assert.ok(s.includes("【动画要素建议】"));
});

test("serializeProblem 空节省略", () => {
  const p = {
    problem_text: "只有题干",
    knowns: [],
    animation_hints: [],
  };
  const s = serializeProblem(p);
  assert.ok(s.includes("【题干】"));
  assert.ok(!s.includes("【已知量】"));
  assert.ok(!s.includes("【目标】"));
  assert.ok(!s.includes("【图示信息】"));
  assert.ok(!s.includes("【动画要素建议】"));
});
