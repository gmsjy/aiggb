/**
 * pipeline L1 单测（0 API、纯离线）—— Agent 模式 + 多模态视觉管线
 *   npm run test:unit
 *
 * v2.0：两阶段流水线已移除，本文件只覆盖仍在使用的路径：
 *   - 视觉管线：题目识别 → 确认 → Agent 构造 + 状态核对（文本 + 视觉双路）
 *   - 原题图片贯通：透传给 agent loop + 视觉交叉验证
 *   - 识别失败 → ask 反问
 *   - Agent 轮次耗尽（incomplete）→ 不回滚、命令入 constructionLog、续作缓存
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { runVisionPipeline, runAgentPipeline, type PipelineDeps, type ProblemHandle } from "../src/lib/pipeline";
import type { StateCheckSpec } from "../src/lib/agentLoop";
import { MockGGB } from "./mockGGB";
import type { AIResponse, Command } from "../src/lib/schema";
import type { ChatMessage, AgentMessage } from "../src/lib/aiClient";
import type { GGBAppletApi } from "../src/types/ggb";
import type { ChatTurn } from "../src/store/useAppStore";

interface HarnessOpts {
  /** chatRaw 脚本：字符串（正常返回）或 Error（抛错） */
  raw?: string | Error;
  domain?: "general" | "physics";
  appMode?: "2d" | "3d";
}

function makeHarness(opts: HarnessOpts = {}) {
  const mock = new MockGGB();
  const controller = new AbortController();
  const messages: ChatTurn[] = [];
  let constructionLog: string[] = [];
  let uidCounter = 0;
  const chatCalls: ChatMessage[][] = [];
  let rawCalls = 0;

  const deps: PipelineDeps = {
    config: { provider: "test", baseURL: "http://localhost", apiKey: "k", model: "m" },
    domain: opts.domain ?? "general",
    appMode: opts.appMode ?? "2d",
    signal: controller.signal,
    getApi: () => mock as unknown as GGBAppletApi,
    getMessages: () => messages,
    getConstructionLog: () => constructionLog,
    appendMessage: t => void messages.push(t),
    appendAIResponse: (resp, results) => {
      if (resp.ask) {
        messages.push({ id: `m${uidCounter++}`, role: "ask", payload: { question: resp.ask } });
      } else {
        messages.push({
          id: `m${uidCounter++}`,
          role: "assistant",
          payload: { explanation: resp.explanation, commands: resp.commands, results }
        });
        constructionLog = [
          ...constructionLog,
          ...results.filter(r => r.ok).flatMap(r => r.expanded)
        ];
      }
    },
    removeMessage: id => {
      const i = messages.findIndex(x => x.id === id);
      if (i >= 0) messages.splice(i, 1);
    },
    setThinking: () => {},
    newMessageId: () => `m${uidCounter++}`,
    chatRawImpl: async () => {
      rawCalls++;
      if (opts.raw instanceof Error) throw opts.raw;
      if (opts.raw === undefined) throw new Error("未提供 chatRaw 脚本");
      return opts.raw;
    },
    lightModel: "m",
    heavyModel: "m",
  };

  return { deps, controller, messages, mock, chatCalls, get rawCalls() { return rawCalls; } };
}

async function waitUntil(cond: () => boolean, timeoutMs = 2000): Promise<void> {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > timeoutMs) throw new Error("waitUntil 超时");
    await new Promise(r => setTimeout(r, 5));
  }
}

function evalResp(cmds: string[]): AIResponse {
  return {
    explanation: "ok",
    commands: cmds.map((cmd): Command => ({ op: "eval", cmd }))
  };
}

// ──── 视觉核对（画布截图 + 视觉模型，与文本核对合并） ────

const VISION_PROBLEM_JSON = JSON.stringify({
  problem_text: "小球从高 20 m 的平台以 15 m/s 水平抛出，不计空气阻力，画出运动轨迹示意图并演示动画。",
  knowns: [{ name: "h", value: 20, unit: "m" }],
  animation_hints: [{ type: "animate", desc: "小球沿轨迹运动" }]
});

/** mock 截图 base64（>100 字符以通过 pipeline 的长度守卫） */
const MOCK_PNG_B64 = "VmlzdWFsUmV2aWV3UG5nQmFzZTY0".repeat(5);

test("视觉核对：文本通过 + 视觉不通过 → 合并 issues 且带 [视觉] 前缀", async () => {
  const h = makeHarness({ raw: VISION_PROBLEM_JSON });
  h.deps.visionModel = "vision-m";
  // mock 提供 getPNGBase64（exportPNG 依赖）
  (h.mock as unknown as Record<string, unknown>).getPNGBase64 = () => MOCK_PNG_B64;
  let capturedCheck: StateCheckSpec | null = null;
  h.deps.runAgentLoopImpl = async (_text, loopDeps) => {
    capturedCheck = loopDeps.stateCheck ?? null;
    return { finalText: "构造完成", messages: [], iterations: 1, deniedTools: [] };
  };
  h.deps.evalSatisfactionImpl = async () => ({ satisfied: true, issues: [], summary: "文本结构通过" });
  h.deps.evalVisualImpl = async () => ({ satisfied: false, issues: ["轨迹明显超出视窗"], summary: "视觉不达标" });

  let ph: ProblemHandle | null = null;
  const p = runVisionPipeline({ text: "", images: ["data:image/png;base64,Zm9v"] }, h.deps, {
    onProblemReview: hd => { ph = hd; },
  });
  await waitUntil(() => ph !== null);
  ph!.confirm(ph!.problem);
  await p;

  assert.ok(capturedCheck, "stateCheck 应注入 agent loop");
  const r = await capturedCheck!.check("P (point): P = (18.9, 12.1)", h.controller.signal);
  assert.ok(r, "check 应返回结果");
  assert.equal(r!.satisfied, false, "视觉不通过 → 整体不通过");
  assert.ok(r!.issues.some(i => i.startsWith("[视觉]") && i.includes("超出视窗")), "issues 应带 [视觉] 前缀");
  assert.ok(r!.summary.includes("视觉"), "summary 应包含视觉审查结论");
});

test("视觉核对：无截图能力（mock 无 getPNGBase64）→ 仅文本核对，视觉实现不被调用", async () => {
  const h = makeHarness({ raw: VISION_PROBLEM_JSON });
  h.deps.visionModel = "vision-m";
  let capturedCheck: StateCheckSpec | null = null;
  h.deps.runAgentLoopImpl = async (_text, loopDeps) => {
    capturedCheck = loopDeps.stateCheck ?? null;
    return { finalText: "ok", messages: [], iterations: 1, deniedTools: [] };
  };
  h.deps.evalSatisfactionImpl = async () => ({ satisfied: true, issues: [], summary: "文本通过" });
  h.deps.evalVisualImpl = async () => { throw new Error("无截图能力时不应调用视觉审查"); };

  let ph: ProblemHandle | null = null;
  const p = runVisionPipeline({ text: "", images: ["data:image/png;base64,Zm9v"] }, h.deps, {
    onProblemReview: hd => { ph = hd; },
  });
  await waitUntil(() => ph !== null);
  ph!.confirm(ph!.problem);
  await p;

  const r = await capturedCheck!.check("P (point): P = (1,2)", h.controller.signal);
  assert.ok(r?.satisfied, "无截图能力 → 仅文本核对，按通过结束");
  assert.equal(r!.issues.length, 0);
});

test("视觉核对：文本不通过 + 视觉通过 → issues 仅含文本项", async () => {
  const h = makeHarness({ raw: VISION_PROBLEM_JSON });
  h.deps.visionModel = "vision-m";
  (h.mock as unknown as Record<string, unknown>).getPNGBase64 = () => MOCK_PNG_B64;
  let capturedCheck: StateCheckSpec | null = null;
  h.deps.runAgentLoopImpl = async (_text, loopDeps) => {
    capturedCheck = loopDeps.stateCheck ?? null;
    return { finalText: "done", messages: [], iterations: 1, deniedTools: [] };
  };
  h.deps.evalSatisfactionImpl = async () => ({ satisfied: false, issues: ["缺少轨迹"], summary: "文本不通过" });
  h.deps.evalVisualImpl = async () => ({ satisfied: true, issues: [], summary: "视觉合格" });

  let ph: ProblemHandle | null = null;
  const p = runVisionPipeline({ text: "", images: ["data:image/png;base64,Zm9v"] }, h.deps, {
    onProblemReview: hd => { ph = hd; },
  });
  await waitUntil(() => ph !== null);
  ph!.confirm(ph!.problem);
  await p;

  const r = await capturedCheck!.check("P (point): P = (1,2)", h.controller.signal);
  assert.equal(r!.satisfied, false);
  assert.deepEqual(r!.issues, ["缺少轨迹"], "视觉通过时不应追加 [视觉] 项");
  assert.ok(r!.summary.includes("视觉合格"));
});

// ═══════════════════════════════════════════════════
// 9. 多模态贯通：原图透传到 Agent + 视觉核对交叉验证
// ═══════════════════════════════════════════════════

test("带图轮：原题图片透传到 agent loop（deps.images）", async () => {
  const h = makeHarness({ raw: VISION_PROBLEM_JSON });
  h.deps.visionModel = "vision-m";
  let capturedImages: string[] | undefined;
  h.deps.runAgentLoopImpl = async (_text, loopDeps) => {
    capturedImages = loopDeps.images;
    return { finalText: "完成", messages: [], iterations: 1, deniedTools: [] };
  };
  const imgs = ["data:image/png;base64,Zm9v", "data:image/png;base64,YmFy"];

  let ph: ProblemHandle | null = null;
  const p = runVisionPipeline({ text: "", images: imgs }, h.deps, {
    onProblemReview: hd => { ph = hd; },
  });
  await waitUntil(() => ph !== null);
  ph!.confirm(ph!.problem);
  await p;

  assert.deepEqual(capturedImages, imgs, "原图应原样透传给 agent loop");
});

test("带图轮：视觉核对拿到原图（交叉验证），而非只给文字解读", async () => {
  const h = makeHarness({ raw: VISION_PROBLEM_JSON });
  h.deps.visionModel = "vision-m";
  (h.mock as unknown as Record<string, unknown>).getPNGBase64 = () => MOCK_PNG_B64;
  let capturedCheck: StateCheckSpec | null = null;
  h.deps.runAgentLoopImpl = async (_text, loopDeps) => {
    capturedCheck = loopDeps.stateCheck ?? null;
    return { finalText: "完成", messages: [], iterations: 1, deniedTools: [] };
  };
  h.deps.evalSatisfactionImpl = async () => ({ satisfied: true, issues: [], summary: "文本通过" });

  let capturedSourceImages: string[] | undefined;
  h.deps.evalVisualImpl = async (...args: unknown[]) => {
    // 第 8 个参数 = sourceImages
    capturedSourceImages = args[7] as string[] | undefined;
    return { satisfied: true, issues: [], summary: "视觉合格" };
  };
  const imgs = ["data:image/png;base64,Zm9v"];

  let ph: ProblemHandle | null = null;
  const p = runVisionPipeline({ text: "", images: imgs }, h.deps, {
    onProblemReview: hd => { ph = hd; },
  });
  await waitUntil(() => ph !== null);
  ph!.confirm(ph!.problem);
  await p;

  await capturedCheck!.check("P (point): P = (1,2)", h.controller.signal);
  assert.deepEqual(capturedSourceImages, imgs, "视觉核对应收到原题图片做交叉验证");
});

test("纯图识别失败 → 反问用户（而非只丢 error 就结束）", async () => {
  const h = makeHarness({ raw: "这不是 JSON" });  // 解析必然失败
  let agentCalled = false;
  h.deps.runAgentLoopImpl = async () => {
    agentCalled = true;
    return { finalText: "x", messages: [], iterations: 1, deniedTools: [] };
  };

  await runVisionPipeline({ text: "", images: ["data:image/png;base64,Zm9v"] }, h.deps, {});

  assert.equal(agentCalled, false, "纯图识别失败不应启动构造");
  const askMsg = h.messages.find(m => m.role === "ask");
  assert.ok(askMsg, "应产出反问气泡");
  assert.ok(String(askMsg!.payload && (askMsg!.payload as { question: string }).question).includes("文字描述"),
    "反问应引导用户改用文字描述");
});

// ═══════════════════════════════════════════════════
// 8. agent 轮次耗尽（incomplete）→ 画布保留 + 续作缓存生命周期
// ═══════════════════════════════════════════════════

test("agent 轮次耗尽 → 不回滚、成功命令入 constructionLog、摘要引导续作、缓存随轮次接力", async () => {
  const h = makeHarness();
  const setBase64Calls: string[] = [];
  (h.mock as unknown as Record<string, unknown>).setBase64 = (s: string) => { setBase64Calls.push(s); };
  h.deps.evalSatisfactionImpl = async () => ({ satisfied: true, issues: [], summary: "通过" });

  const pausedMessages: AgentMessage[] = [
    { role: "system", content: "旧 system" },
    { role: "user", content: "原始请求：构造长任务" },
    { role: "assistant", content: null, tool_calls: [
      { id: "tc1", type: "function", function: { name: "create_point", arguments: '{"name":"A","x":0,"y":0}' } },
    ] },
    { role: "tool", tool_call_id: "tc1", content: JSON.stringify({ success: true, result: "点 A 已创建于 (0, 0)" }) },
  ];
  const capturedResume: (AgentMessage[] | undefined)[] = [];
  h.deps.runAgentLoopImpl = async (_text, loopDeps) => {
    capturedResume.push(loopDeps.resumeMessages);
    return {
      finalText: "已达到单轮最大迭代次数（30 轮），本轮到此暂停。画布已保留当前进度（现有 1 个对象）。",
      messages: pausedMessages,
      iterations: 30,
      deniedTools: [],
      incomplete: true,
    };
  };

  // 第 1 轮：轮次耗尽暂停
  await runAgentPipeline("构造长任务", h.deps, {});
  assert.equal(capturedResume[0], undefined, "首轮无续作缓存");
  assert.equal(setBase64Calls.length, 0, "incomplete 轮不应恢复快照（画布保留）");
  let lastAssistant = [...h.messages].reverse().find(m => m.role === "assistant");
  assert.ok(lastAssistant, "应追加 assistant 摘要消息");
  assert.match(lastAssistant!.payload.explanation, /已达到单轮最大迭代次数/);
  assert.doesNotMatch(lastAssistant!.payload.explanation, /已达单轮最大轮次/, "暂停文案不应重复出现两次（finalText 已含全部信息）");
  assert.match(lastAssistant!.payload.explanation, /共 30 轮/, "摘要应保留轮次统计");
  assert.ok(
    lastAssistant!.payload.commands.some(c => c.op === "eval" && c.cmd.includes("A = (0, 0)")),
    "成功命令应写入消息/constructionLog（undo 回放与画布一致）"
  );

  // 第 2 轮：续作指令 → 注入上一轮对话缓存；该轮正常完成 → 缓存清除
  h.deps.runAgentLoopImpl = async (_text, loopDeps) => {
    capturedResume.push(loopDeps.resumeMessages);
    return { finalText: "完成", messages: [], iterations: 2, deniedTools: [] };
  };
  await runAgentPipeline("继续完成剩余部分", h.deps, {});
  assert.equal(capturedResume[1], pausedMessages, "续作轮应收到暂停轮的完整对话缓存");

  // 第 3 轮：上一轮已完成（非 incomplete）→ 缓存失效
  await runAgentPipeline("再加个圆", h.deps, {});
  assert.equal(capturedResume[2], undefined, "完成轮之后缓存应失效");
});

test("incomplete 轮的满足度 issues 写入续作缓存", async () => {
  const h = makeHarness();
  h.deps.evalSatisfactionImpl = async () => ({ satisfied: false, issues: ["缺少轨迹标注", "P 点超出视窗"], summary: "不通过" });
  const captured: (AgentMessage[] | undefined)[] = [];
  h.deps.runAgentLoopImpl = async (_text, loopDeps) => {
    captured.push(loopDeps.resumeMessages);
    return {
      finalText: "已达到单轮最大迭代次数（30 轮），本轮到此暂停。画布已保留当前进度。",
      messages: [
        { role: "system", content: "旧 system" },
        { role: "user", content: "原始请求：构造长任务" },
      ] as AgentMessage[],
      iterations: 30,
      deniedTools: [],
      incomplete: true,
    };
  };

  await runAgentPipeline("构造长任务", h.deps, {});
  await runAgentPipeline("继续完成剩余部分", h.deps, {});

  const resume = captured[1];
  assert.ok(resume, "续作轮应收到缓存");
  const last = resume![resume!.length - 1];
  assert.equal(last.role, "user");
  assert.match(String(last.content), /上一轮未完成项/);
  assert.match(String(last.content), /缺少轨迹标注/);
  assert.match(String(last.content), /P 点超出视窗/);
});
