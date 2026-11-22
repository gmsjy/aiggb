/**
 * 训练数据闭环 L1 单测 —— trainingStore 纯函数 + pipeline 注入/捕获
 *   npm run test:unit（已注册）
 *
 * 覆盖：
 *   1. tokenize 中英混合
 *   2. jaccardSimilarity 相似度
 *   3. buildExamplePrompt 含"勿照搬"提示
 *   4. pipeline Phase 2 注入参考案例（mock trainingSearchImpl）
 *   5. pipeline executeAndRepair 首次全成功 → 存储（mock trainingStoreImpl）
 *   6. 满足度修复回路不存储（captureTraining=false）
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  tokenize,
  jaccardSimilarity,
  buildExamplePrompt,
  buildExecutionRecord,
  buildScenePrompt,
  findMergeTarget,
  type ExecutionRecord,
  type SceneRecord,
} from "../src/lib/trainingStore";
import { runPipeline, type PipelineDeps, type ReviewHandle } from "../src/lib/pipeline";
import { MockGGB } from "./mockGGB";
import type { AIResponse, Command } from "../src/lib/schema";
import type { ChatMessage } from "../src/lib/aiClient";
import type { GGBAppletApi } from "../src/types/ggb";
import type { ChatTurn } from "../src/store/useAppStore";

// ── 纯函数 ──

test("tokenize 提取中英文 + 数字", () => {
  const t = tokenize("斜抛运动 v0=20 m/s 仰角45°");
  assert.ok(t.has("斜抛"), "中文 bigram");
  assert.ok(t.has("运动"), "中文 bigram");
  assert.ok(t.has("v0"), "英文词");
  assert.ok(t.has("20"), "数字");
});

test("jaccard 相似度：完全相同 = 1，无交集 = 0", () => {
  assert.equal(jaccardSimilarity(tokenize("斜抛运动"), tokenize("斜抛运动")), 1);
  assert.equal(jaccardSimilarity(tokenize("圆"), tokenize("抛物线")), 0);
  // 部分重叠
  const score = jaccardSimilarity(tokenize("画一个圆"), tokenize("画个圆半径3"));
  assert.ok(score > 0, "应有一定相似度");
});

test("buildExamplePrompt 含命令 + 勿照搬提示", () => {
  const rec = buildExecutionRecord("斜抛运动", [
    { op: "eval", cmd: "v0 = Slider(1,50,1)" } as Command,
    { op: "eval", cmd: "P = (v0*cos(t), v0*sin(t))" } as Command,
    { op: "animate", target: "t", on: true } as Command,
  ]);
  const prompt = buildExamplePrompt(rec);
  assert.ok(prompt.includes("v0 = Slider(1,50,1)"), "应含成功命令");
  assert.ok(prompt.includes("勿照搬"), "应含勿照搬提示");
});

// ── L2 场景聚合（落地 B） ──

test("findMergeTarget：相似 spec 命中场景，不相似返回 null", () => {
  const scene: SceneRecord = {
    id: "s1", specSample: "斜抛运动 v0=20 θ=45°", heat: 3, lastSeen: 1,
    pattern: [{ op: "eval", cmd: "P = (v0*cos(t), v0*sin(t))" } as Command],
  };

  // 相似斜抛 → 命中并入
  const hit = findMergeTarget([scene], "斜抛运动 v0=15 θ=30°");
  assert.equal(hit?.id, "s1", "相似斜抛应命中场景");

  // 无关场景 → null（新建）
  const miss = findMergeTarget([scene], "画一个圆半径为3");
  assert.equal(miss, null, "无关 spec 不应命中");
});

test("buildScenePrompt 标注结构模式 + 勿复制数值", () => {
  const scene: SceneRecord = {
    id: "s1", specSample: "斜抛运动", heat: 5, lastSeen: 1,
    pattern: [
      { op: "eval", cmd: "v0 = Slider(1,50,1)" } as Command,
      { op: "eval", cmd: "P = (v0*cos(t), v0*sin(t))" } as Command,
      { op: "vector", name: "vArrow", from: "P", to: "P+(dx,dy)" } as Command,
    ],
  };

  const prompt = buildScenePrompt(scene);
  assert.ok(prompt.includes("5 次成功"), "应含成功次数");
  assert.ok(prompt.includes("结构模式"), "应标注结构模式");
  assert.ok(prompt.includes("禁止复制"), "应禁止复制数值");
  assert.ok(prompt.includes("v0 = Slider"), "应含命令骨架");
});

// ── pipeline 注入 ──

function makeHarness(overrides: Partial<PipelineDeps> = {}) {
  const mock = new MockGGB();
  const controller = new AbortController();
  const messages: ChatTurn[] = [];
  let uid = 0;
  const deps: PipelineDeps = {
    config: { provider: "test", baseURL: "http://localhost", apiKey: "k", model: "m" },
    domain: "general",
    appMode: "2d",
    signal: controller.signal,
    getApi: () => mock,
    getMessages: () => messages,
    getConstructionLog: () => [],
    appendMessage: t => void messages.push(t),
    appendAIResponse: (resp, results) => void messages.push({
      id: `m${uid++}`, role: "assistant", payload: { explanation: resp.explanation, commands: resp.commands, results }
    }),
    updateSpecReview: () => {},
    removeMessage: id => { messages.splice(messages.findIndex(m => m.id === id), 1); },
    setThinking: () => {},
    newMessageId: () => `m${uid++}`,
    lightModel: "light",
    heavyModel: "heavy",
    ...overrides,
  };
  return { mock, deps, messages };
}

/** 自动确认规格气泡的 driver */

