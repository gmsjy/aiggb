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
    }
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
