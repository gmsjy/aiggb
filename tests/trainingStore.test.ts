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
  type ExecutionRecord,
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
function autoConfirm(h: ReviewHandle) { h.confirm(h.spec); }

test("Phase 2 命中训练库 → 参考案例注入 user message", async () => {
  const record: ExecutionRecord = {
    id: "x1", ts: 1, spec: "斜抛运动",
    commands: [
      { op: "eval", cmd: "v0 = Slider(1,50,1)" } as Command,
      { op: "eval", cmd: "theta = Slider(0,1.57,0.01)" } as Command,
      { op: "eval", cmd: "P = (v0*cos(theta), v0*sin(theta))" } as Command,
    ],
  };

  const captured: ChatMessage[][] = [];
  const { deps } = makeHarness({
    chatRawImpl: async () => JSON.stringify({ spec: "斜抛运动 v0=20" }),
    trainingSearchImpl: async () => record,
    chatImpl: (async (_c, msgs) => {
      captured.push(msgs as ChatMessage[]);
      return { explanation: "完成", commands: [{ op: "eval", cmd: "A = (0,0)" } as Command] } as AIResponse;
    }) as PipelineDeps["chatImpl"],
  });

  await runPipeline("画斜抛", deps, { onReview: autoConfirm });

  // Phase 2 的最后一个 user 消息应包含参考案例
  const phase2Msgs = captured.find(msgs => msgs[0].role === "system")!;
  const lastUser = [...phase2Msgs].reverse().find(m => m.role === "user")!;
  assert.ok(lastUser.content.includes("参考案例"), "应注入参考案例");
  assert.ok(lastUser.content.includes("v0 = Slider(1,50,1)"), "案例应含命令");
});

test("训练库未命中 → 不注入，user message 是纯规格", async () => {
  const captured: ChatMessage[][] = [];
  const { deps } = makeHarness({
    chatRawImpl: async () => JSON.stringify({ spec: "画个圆" }),
    trainingSearchImpl: async () => null,
    chatImpl: (async (_c, msgs) => {
      captured.push(msgs as ChatMessage[]);
      return { explanation: "完成", commands: [] } as AIResponse;
    }) as PipelineDeps["chatImpl"],
  });

  await runPipeline("画圆", deps, { onReview: autoConfirm });

  const phase2Msgs = captured.find(msgs => msgs[0].role === "system")!;
  const lastUser = [...phase2Msgs].reverse().find(m => m.role === "user")!;
  assert.ok(!lastUser.content.includes("参考案例"), "未命中不应注入");
});

test("首次全成功 → 存储训练样本", async () => {
  let stored: ExecutionRecord | null = null;
  const { deps } = makeHarness({
    chatRawImpl: async () => JSON.stringify({ spec: "画个圆" }),
    trainingStoreImpl: rec => { stored = rec; },
    chatImpl: (async () => {
      return { explanation: "完成", commands: [
        { op: "eval", cmd: "c = Circle((0,0), 2)" } as Command,
      ] } as AIResponse;
    }) as PipelineDeps["chatImpl"],
  });

  await runPipeline("画圆", deps, { onReview: autoConfirm });

  assert.ok(stored, "应存储训练样本");
  assert.equal(stored!.commands.length, 1);
  assert.equal(stored!.spec, "画个圆");
});

test("执行失败进入修复 → 不存储训练样本（attempts>0）", async () => {
  let stored: ExecutionRecord | null = null;
  let call = 0;
  const { deps } = makeHarness({
    chatRawImpl: async () => JSON.stringify({ spec: "画个圆" }),
    trainingStoreImpl: rec => { stored = rec; },
    chatImpl: (async () => {
      call++;
      if (call === 1) {
        // 首次：Circle 引用不存在的点 MissingP → 执行失败（MockGGB 引用检查拦截）
        return { explanation: "", commands: [{ op: "eval", cmd: "c = Circle(MissingP, 2)" } as Command] } as AIResponse;
      }
      // 修复：改为合法命令
      return { explanation: "", commands: [{ op: "eval", cmd: "c = Circle((0,0), 2)" } as Command] } as AIResponse;
    }) as PipelineDeps["chatImpl"],
  });

  await runPipeline("画圆", deps, { onReview: autoConfirm });

  assert.equal(stored, null, "进入修复回路不应存储（attempts>0）");
});
