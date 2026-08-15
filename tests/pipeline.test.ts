/**
 * pipeline L1 单测（0 API、纯离线）—— 两阶段状态机五条关键路径
 *   npm run test:unit  （随 specCache.test.ts 一起跑需分别注册，见 package.json）
 *
 * 覆盖：
 *   1. Phase 1 输出 ask → 直接展示，不进确认/Phase 2
 *   2. 确认路径：spec → 确认气泡 → confirm → Phase 2 → 执行成功
 *   3. 重试路径：retry → Phase 1 重跑 → confirm → 完成
 *   4. Phase 1 API 失败 / 规格为空 → 降级单阶段
 *   5. 确认等待中被 abort → reject AbortError，不追加消息
 *   6. 执行失败 → checker 修复回路成功
 *   7. 模板缓存命中 → Phase 1 不发 chatRaw 请求
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { runPipeline, type PipelineDeps, type ReviewHandle } from "../src/lib/pipeline";
import { createMemoryStorage, type SpecStorage } from "../src/lib/specCache";
import { TEMPLATES } from "../src/lib/templates";
import { MockGGB } from "./mockGGB";
import type { AIResponse, Command } from "../src/lib/schema";
import type { ChatMessage } from "../src/lib/aiClient";
import type { GGBAppletApi } from "../src/types/ggb";
import type { ChatTurn } from "../src/store/useAppStore";

interface HarnessOpts {
  /** chatRaw 脚本：字符串（正常返回）或 Error（抛错） */
  raw?: string | Error;
  /** chat（Phase 2 / 修复 / 单阶段）按序返回的响应 */
  scripts?: AIResponse[];
  domain?: "general" | "physics";
  appMode?: "2d" | "3d";
  /** 规格缓存存储（默认无缓存；注入后可验证缓存命中 / retry 跳过缓存的逻辑） */
  specCacheStorage?: SpecStorage;
}

function makeHarness(opts: HarnessOpts = {}) {
  const mock = new MockGGB();
  const controller = new AbortController();
  const messages: ChatTurn[] = [];
  let constructionLog: string[] = [];
  let uidCounter = 0;
  const chatCalls: ChatMessage[][] = [];
  let chatIdx = 0;
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
    updateSpecReview: (id, spec, status) => {
      const m = messages.find(x => x.id === id);
      if (m && m.role === "spec-review") m.payload = { spec, status };
    },
    removeMessage: id => {
      const i = messages.findIndex(x => x.id === id);
      if (i >= 0) messages.splice(i, 1);
    },
    setThinking: () => {},
    newMessageId: () => `m${uidCounter++}`,
    chatImpl: async (_cfg, msgs) => {
      chatCalls.push(msgs);
      const next = opts.scripts?.[chatIdx++];
      if (!next) throw new Error(`chatImpl 脚本已耗尽（第 ${chatIdx} 次调用）`);
      return next;
    },
    chatRawImpl: async () => {
      rawCalls++;
      if (opts.raw instanceof Error) throw opts.raw;
      if (opts.raw === undefined) throw new Error("未提供 chatRaw 脚本");
      return opts.raw;
    },
    lightModel: "m",   // resolves to config.model
    heavyModel: "m",   // resolves to config.model
    specCacheStorage: opts.specCacheStorage,
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

test("Phase 1 输出 ask → 直接展示，不进 Phase 2", async () => {
  const h = makeHarness({ raw: JSON.stringify({ ask: "请指定圆的半径？" }) });
  await runPipeline("画个圆", h.deps, {
    onReview: () => assert.fail("ask 不应进入规格确认")
  });
  assert.equal(h.messages.length, 1);
  assert.equal(h.messages[0].role, "ask");
  assert.equal(h.chatCalls.length, 0, "ask 路径不应调用 Phase 2");
});

test("确认路径：spec → 气泡 → confirm → Phase 2 → 执行成功", async () => {
  const h = makeHarness({
    raw: JSON.stringify({ spec: "绘制三角形 ABC 的外接圆，标注圆心 O 与半径，视窗自动适配场景。" }),
    scripts: [evalResp(["A = (0,0)", "B = (3,0)", "C = (1,2)"])]
  });
  let handle: ReviewHandle | null = null;
  const p = runPipeline("画外接圆", h.deps, { onReview: hd => (handle = hd) });
  await waitUntil(() => handle !== null);
  assert.ok(handle!.spec.includes("外接圆"));
  handle!.confirm(handle!.spec);
  await p;

  const roles = h.messages.map(m => m.role);
  assert.deepEqual(roles, ["spec-review", "assistant"]);
  assert.equal(h.messages[0].role === "spec-review" && h.messages[0].payload.status, "confirmed");
  const assistant = h.messages[1];
  assert.equal(assistant.role, "assistant");
  assert.ok(assistant.payload.results.every(r => r.ok));
  assert.ok(h.mock.exists("A") && h.mock.exists("B") && h.mock.exists("C"));
});

test("重试路径：retry → Phase 1 重跑 → confirm → 完成", async () => {
  const h = makeHarness({
    raw: JSON.stringify({ spec: "绘制一个单位圆并标注圆心，展示半径随参数变化的效果。" }),
    scripts: [evalResp(["O = (0,0)", "c = Circle(O, 1)"])]
  });
  const handles: ReviewHandle[] = [];
  const p = runPipeline("画圆 v2", h.deps, { onReview: hd => handles.push(hd) });
  await waitUntil(() => handles.length === 1);
  handles[0].retry(); // 放弃第一份规格
  await waitUntil(() => handles.length === 2);
  handles[1].confirm(handles[1].spec);
  await p;

  assert.equal(h.rawCalls, 2, "retry 应重跑 Phase 1");
  // 旧气泡被移除，只剩 confirmed 气泡 + assistant
  assert.deepEqual(h.messages.map(m => m.role), ["spec-review", "assistant"]);
  assert.equal(h.messages[0].role === "spec-review" && h.messages[0].payload.status, "confirmed");
});

test("★ retry 必须绕过 specCache：即使缓存命中也重新调用 Phase 1（回归：缓存永远同一规格）", async () => {
  // 预置一个「第二次点击重新生成时返回不同内容」的可变脚本：
  //   - 注入内存缓存存储，使 storeCachedSpec/lookupCachedSpec 在单测里真实生效
  //   - 第一次 Phase 1 输出 specA 并落缓存；retry 后若不跳过缓存会直接命中 specA——
  //     「重新生成」形同虚设。修复后 retry 应重新调用 chatRaw 拿到 specB。
  const cacheStore = createMemoryStorage();
  let rawIdx = 0;
  const rawResponses = [
    JSON.stringify({ spec: "绘制三角形 ABC 的外接圆，标注圆心 O 与半径。" }),
    JSON.stringify({ spec: "重新生成的规格：绘制正方形的内切圆。" }),
  ];
  const h = makeHarness({ specCacheStorage: cacheStore });
  // 用自定义 chatRaw 脚本（按序返回两份不同规格）
  h.deps.chatRawImpl = async () => rawResponses[Math.min(rawIdx++, rawResponses.length - 1)]!;
  h.deps.chatImpl = async () => {
    // 每次 Phase 2 命令不同，便于断言命中哪份规格
    const useNew = rawIdx >= 2; // retry 后为 true
    return evalResp(useNew
      ? ["O = (0,0)", "sq = Polygon((1,1),(-1,1),(-1,-1),(1,-1))"]
      : ["A = (0,0)", "B = (3,0)", "C = (1,2)"]);
  };
  h.deps.sceneSearchImpl = async () => null;
  h.deps.trainingSearchImpl = async () => null;

  const handles: ReviewHandle[] = [];
  const p = runPipeline("画圆", h.deps, { onReview: hd => handles.push(hd) });
  await waitUntil(() => handles.length === 1);
  assert.ok(handles[0].spec.includes("外接圆"), "第一次 Phase 1 返回 specA");
  handles[0].retry();
  await waitUntil(() => handles.length === 2);
  assert.ok(handles[1].spec.includes("正方形"), "retry 应绕过缓存返回新规格 specB，而非缓存里的 specA");
  assert.equal(rawIdx, 2, "retry 应重新调用 chatRaw（跳过缓存）");
  handles[1].confirm(handles[1].spec);
  await p;
  assert.equal(h.messages.filter(m => m.role === "assistant").length, 1);
});

test("Phase 1 API 失败 → 降级单阶段", async () => {
  const h = makeHarness({
    raw: new Error("网络错误：connection reset"),
    scripts: [evalResp(["f(x) = x^2"])]
  });
  await runPipeline("画抛物线", h.deps, { onReview: () => assert.fail("降级路径不应出现确认气泡") });
  assert.equal(h.rawCalls, 1);
  assert.equal(h.chatCalls.length, 1, "降级路径走一次单阶段 chat");
  assert.equal(h.messages.length, 1);
  assert.equal(h.messages[0].role, "assistant");
});

test("Phase 1 规格为空 → 降级单阶段", async () => {
  const h = makeHarness({ raw: JSON.stringify({ spec: "" }), scripts: [evalResp(["g(x) = x"])] });
  await runPipeline("随便画点啥", h.deps, { onReview: () => assert.fail("空规格不应进入确认") });
  assert.equal(h.chatCalls.length, 1);
  assert.equal(h.messages[0].role, "assistant");
});

test("确认等待中被 abort → reject AbortError，无多余消息", async () => {
  const h = makeHarness({
    raw: JSON.stringify({ spec: "绘制一个正方形并标注边长参数，支持滑块调节大小。" })
  });
  let handle: ReviewHandle | null = null;
  const p = runPipeline("画正方形", h.deps, { onReview: hd => (handle = hd) });
  await waitUntil(() => handle !== null);
  h.controller.abort();
  await assert.rejects(p, (err: unknown) => err instanceof Error && err.name === "AbortError");
  // 气泡已追加，但 Phase 2 未执行
  assert.deepEqual(h.messages.map(m => m.role), ["spec-review"]);
  assert.equal(h.chatCalls.length, 0);
});

test("执行失败 → checker 修复回路 → 成功", async () => {
  const h = makeHarness({
    raw: JSON.stringify({ spec: "绘制依赖于参数 foo 的点 P，并展示其轨迹与坐标标注。" }),
    scripts: [
      evalResp(["P = (foo, 0)"]), // 第一轮：foo 未定义 → 执行失败
      evalResp(["foo = 1", "P = (foo, 0)"]) // checker 修复：先定义 foo
    ]
  });
  let handle: ReviewHandle | null = null;
  const p = runPipeline("画点 P", h.deps, { onReview: hd => (handle = hd) });
  await waitUntil(() => handle !== null);
  handle!.confirm(handle!.spec);
  await p;

  const assistantTurns = h.messages.filter(m => m.role === "assistant");
  assert.equal(assistantTurns.length, 2, "应有首轮失败 + 修复成功两条 assistant 记录");
  assert.ok(assistantTurns[0].payload.results.some(r => !r.ok));
  assert.ok(assistantTurns[1].payload.results.every(r => r.ok));
  assert.ok(h.mock.exists("P"));
});

test("模板缓存命中 → Phase 1 不发 chatRaw 请求", async () => {
  const tpl = TEMPLATES[0];
  const h = makeHarness({
    raw: new Error("模板命中时不应调用 chatRaw"),
    scripts: [evalResp(["O = (0,0)"])],
    domain: tpl.domain,
    appMode: tpl.mode
  });
  let handle: ReviewHandle | null = null;
  const p = runPipeline(tpl.prompt, h.deps, { onReview: hd => (handle = hd) });
  await waitUntil(() => handle !== null);
  assert.equal(h.rawCalls, 0);
  assert.equal(handle!.spec, tpl.prompt);
  handle!.confirm(handle!.spec);
  await p;
});

// ── 满足度评估相关测试 ──

test("无 lightModel — 评估仍运行（回退到 model）", async () => {
  const h = makeHarness({
    raw: JSON.stringify({ spec: "绘制一个边长 2 的正方形 ABCD，标注顶点，开启 B 点轨迹。" }),
    scripts: [evalResp(["A = (0,0)", "B = (2,0)", "C = (2,2)", "D = (0,2)", "poly = Polygon(A,B,C,D)"])]
  });
  // lightModel 为 "m"（回退到 model），评估应正常调用并返回 satisfied
  h.deps.evalSatisfactionImpl = async () => ({ satisfied: true, issues: [], summary: "正常" });
  let handle: ReviewHandle | null = null;
  const p = runPipeline("画正方形", h.deps, { onReview: hd => (handle = hd) });
  await waitUntil(() => handle !== null);
  handle!.confirm(handle!.spec);
  await p;
  // 正常完成，无非 assistant 以外的消息
  assert.equal(h.messages.length, 2, "只有 spec-review + assistant");
  assert.equal(h.messages[1].role, "assistant");
});

test("评估 satisfied=true → 不追加错误消息", async () => {
  const h = makeHarness({
    raw: JSON.stringify({ spec: "绘制圆心在原点、半径可调 r 的圆，设置红色样式，开轨迹。" }),
    scripts: [evalResp(["O = (0,0)", "c = Circle(O, 3)"])]
  });
  // 注入 lightModel 触发评估，mock 返回 satisfied
  h.deps.config.lightModel = "flash-m";
  let evalCalled = false;
  h.deps.evalSatisfactionImpl = async () => {
    evalCalled = true;
    return { satisfied: true, issues: [], summary: "完全符合" };
  };

  let handle: ReviewHandle | null = null;
  const p = runPipeline("画圆", h.deps, { onReview: hd => (handle = hd) });
  await waitUntil(() => handle !== null);
  handle!.confirm(handle!.spec);
  await p;

  assert.equal(evalCalled, true, "评估应被调用");
  assert.equal(h.messages.length, 2, "只有 spec-review + assistant，无 error");
  assert.equal(h.messages[1].role, "assistant");
});

test("评估 unsatisfied → 追加 error + 触发修复", async () => {
  const h = makeHarness({
    raw: JSON.stringify({ spec: "绘制红色虚线圆 c，圆心 O(0,0)，半径 3，开启轨迹。" }),
    scripts: [
      evalResp(["O = (0,0)", "c = Circle(O, 3)"]),                           // Phase 2 初版
      evalResp(["SetLineStyle(c, 1)", "SetColor(c, 255, 0, 0)", "SetTrace(c, true)"]) // 修复
    ]
  });
  h.deps.lightModel = "flash-m";
  h.deps.evalSatisfactionImpl = async () => ({
    satisfied: false,
    issues: ["颜色不是红色", "缺少虚线样式", "轨迹未开启"],
    summary: "样式与规格不符"
  });

  let handle: ReviewHandle | null = null;
  const p = runPipeline("画红色虚线圆", h.deps, { onReview: hd => (handle = hd) });
  await waitUntil(() => handle !== null);
  handle!.confirm(handle!.spec);
  await p;

  // 应有 spec-review + assistant(初版) + error(评估) + assistant(修复)
  const roles = h.messages.map(m => m.role);
  assert.equal(roles.length, 4);
  assert.equal(roles[0], "spec-review");
  assert.equal(roles[1], "assistant");
  assert.equal(roles[2], "error", "评估不满足应追加 error 消息");
  assert.equal(roles[3], "assistant", "修复成功应追加 assistant");
  assert.ok(h.messages[2].role === "error" && h.messages[2].content.includes("颜色不是红色"));
});

test("评估 API 异常 → 不阻断流程", async () => {
  const h = makeHarness({
    raw: JSON.stringify({ spec: "画一个单位圆。需要超过二十五个字符才能进入评估，所以多写一点描述。" }),
    scripts: [evalResp(["O = (0,0)", "c = Circle(O, 1)"])]
  });
  h.deps.lightModel = "flash-m";
  h.deps.evalSatisfactionImpl = async () => { throw new Error("评估网络超时"); };

  let handle: ReviewHandle | null = null;
  const p = runPipeline("画单位圆", h.deps, { onReview: hd => (handle = hd) });
  await waitUntil(() => handle !== null);
  handle!.confirm(handle!.spec);
  await p;

  // 评估失败但流程正常完成，只有 spec-review + assistant
  assert.equal(h.messages.length, 2);
  assert.equal(h.messages[1].role, "assistant");
});
