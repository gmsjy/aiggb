/**
 * 两阶段流水线 —— 从 ChatPanel 提取的纯 TS 状态机（无 React 依赖，可 node 单测）
 *
 * 主流程：Phase 1（flash 精炼）→ 规格确认（等待用户）→ Phase 2（编译）→ 执行 + 修复回路
 * 降级：Phase 1 API 异常 / 规格为空 → 单阶段一步到位
 *
 * 失败回滚策略（全失败时）：
 *   1. 优先恢复执行前 base64 快照；
 *   2. 快照缺失/超时 → newConstruction + 重放 constructionLog（store 维护的成功命令日志）。
 */
import {
  chat as defaultChat,
  chatRaw as defaultChatRaw,
  AIError,
  AISchemaError,
  resolveModel,
  type AIConfig,
  type ChatMessage,
  type ContentPart
} from "./aiClient";
import { collectFailures, executeCommands, resetTmpIds, getRichSnapshot, type ExecResult } from "./ggbBridge";
import {
  buildSystemPrompt,
  buildCompilePrompt,
  buildCheckerPrompt,
  buildFormatRepairMessage,
  type Domain
} from "./prompts";
import { buildRefinePrompt } from "./refinePrompt";
import { parseProblemAnalysis, serializeProblem, type ProblemAnalysis } from "./problemSchema";
import { buildVisionExtractPrompt } from "./visionPrompt";
import { batchCorrect, correctionsToRepairContext } from "./commandCorrect";
import { RefinedSpec, type RefinedSpec as RefinedSpecT } from "./specSchema";
import { lookupCachedSpec, storeCachedSpec, type SpecStorage } from "./specCache";
import type { AIResponse } from "./schema";
import type { GGBAppletApi } from "../types/ggb";
import type { ChatTurn } from "../store/useAppStore";
import { getTraceId } from "./runControl";
import {
  runAgentLoop,
  registerConfirmationHandler,
  unregisterConfirmationHandler,
  type AgentLoopResult,
  type ConfirmationRequest,
  type ConfirmationDecision
} from "./agentLoop";
import { toolCallToEvalCommands } from "./toolExecutor";
import { saveTrajectory } from "./trajectoryStore";
import { recordFailure, refreshTraps, buildTrapPrompt, backfillTrapsFromTrajectories } from "./trapStore";
import {
  searchExecution,
  searchScene,
  storeExecution,
  buildExecutionRecord,
  buildExamplePrompt,
  buildScenePrompt,
  type ExecutionRecord,
  type SceneRecord,
} from "./trainingStore";

export const MAX_REPAIR = 2;
export const MAX_FORMAT_RETRY = 2;
export const HISTORY_WINDOW = 6; // 最近 N 轮发给 AI

/** 用户对规格确认气泡的决定 */
export type ReviewDecision =
  | { action: "confirm"; spec: string }
  | { action: "retry" };

/** 规格确认句柄——pipeline 创建，UI 通过 confirm/retry 回传决定 */
export interface ReviewHandle {
  readonly spec: string;
  /** 用户确认绘制；finalSpec 可为用户编辑后的规格 */
  confirm(finalSpec: string): void;
  /** 用户要求重新生成 Phase 1 */
  retry(): void;
}

/** 用户对题目确认气泡的决定 */
export type ProblemDecision =
  | { action: "confirm"; problem: ProblemAnalysis }
  | { action: "retry" };

/** 题目确认句柄——pipeline 创建，UI 通过 confirm/retry 回传决定 */
export interface ProblemHandle {
  readonly problem: ProblemAnalysis;
  /** 用户确认题目解读；final 可含用户编辑后的 problem_text */
  confirm(final: ProblemAnalysis): void;
  /** 用户要求重新识别 */
  retry(): void;
}

/** pipeline 对宿主的全部依赖（组件侧用 store 实现，测试侧用内存实现） */
export interface PipelineDeps {
  config: AIConfig;
  domain: Domain;
  appMode: "2d" | "3d";
  signal: AbortSignal;
  /** 实时取最新 applet（3D 切换后旧闭包失效） */
  getApi(): GGBAppletApi | null;
  getMessages(): ChatTurn[];
  getConstructionLog(): string[];
  appendMessage(t: ChatTurn): void;
  appendAIResponse(resp: AIResponse, results: ExecResult[]): void;
  updateSpecReview(id: string, spec: string, status: "pending" | "confirmed" | "rejected"): void;
  updateProblemReview?(id: string, problem: ProblemAnalysis, status: "pending" | "confirmed" | "rejected"): void;
  removeMessage(id: string): void;
  setThinking(b: boolean): void;
  newMessageId(): string;
  /** 测试可注入脚本网关，替换真实调用 */
  chatImpl?: typeof defaultChat;
  chatRawImpl?: typeof defaultChatRaw;
  /** 满足度评估注入（测试可 mock） */
  evalSatisfactionImpl?: typeof import("./satisfactionEval").evaluateSatisfaction;
  /** 训练库检索（Phase 2 注入参考案例）。注入以支持单测 mock */
  trainingSearchImpl?: (spec: string) => Promise<ExecutionRecord | null>;
  /** L2 场景检索（Phase 2 注入场景模式，优先于单案例）。注入以支持单测 mock */
  sceneSearchImpl?: (spec: string) => Promise<SceneRecord | null>;
  /** 训练库存储（成功命令）。注入以支持单测 mock */
  trainingStoreImpl?: (rec: ExecutionRecord) => void;
  /** 规格缓存的底层存储（测试可注入内存实现，验证缓存命中/跳过的逻辑）。默认 localStorage */
  specCacheStorage?: SpecStorage;
  /** 解析后的轻量模型名（用于精炼/评估） */
  lightModel: string;
  /** 解析后的主力模型名（用于编译/修复/降级） */
  heavyModel: string;
  /** 解析后的视觉模型名（用于题目图片识别） */
  visionModel?: string;
  /** 每次 AI 调用的 token 用量回传（累计到 UI 统计） */
  onTokenUsage?: (usage: { prompt: number; completion: number }) => void;
  /** Agent 循环实现注入（单测 mock 用） */
  runAgentLoopImpl?: typeof runAgentLoop;
}

export interface PipelineCallbacks {
  /** Phase 1 产出规格后调用；UI 展示确认气泡并持有 handle 以回传决定 */
  onReview(handle: ReviewHandle, reviewId: string): void;
  /** 工具调用代理模式：dangerous 工具需用户确认 */
  onConfirm?(requests: ConfirmationRequest[]): Promise<ConfirmationDecision[]>;
  /** Agent 模式实时思考步骤（观察/规划/执行工具），UI 展示减少等待焦虑 */
  onAgentStep?(message: string): void;
  /** 题目识别后调用；UI 展示确认气泡并持有 handle 以回传决定 */
  onProblemReview?(handle: ProblemHandle, reviewId: string): void;
}

/**
 * 跑完一整轮：Phase 1 → 确认 → Phase 2 → 修复。
 * 全程结束（含等待用户确认）前不 resolve；被 abort 时 reject（AbortError）。
 */
export async function runPipeline(
  userText: string,
  deps: PipelineDeps,
  cb: PipelineCallbacks
): Promise<void> {
  let phase1Pass = true;
  for (;;) {
    // ── Phase 1：意图 → 精炼规格（缓存优先）──
    // ★ retry（重新生成）时跳过 specCache：否则命中缓存返回同一份规格，「重新生成」形同虚设
    let spec: RefinedSpecT | null;
    try {
      spec = await refineSpec(userText, deps, !phase1Pass);
    } catch (err) {
      if (deps.signal.aborted) throw err;
      console.warn(`[Pipeline] ${getTraceId()} Phase 1 failed, falling back to single-phase`, err);
      await runSinglePhase(userText, deps);
      return;
    }

    // ── 反问：直接展示，本轮结束 ──
    // ★ ask 优先于空规格判断：RefinedSpec 中 ask 是一等输出，不应被误当空规格降级
    if (spec?.ask) {
      deps.appendAIResponse({ explanation: "需要确认", commands: [], ask: spec.ask }, []);
      return;
    }

    if (!spec?.spec) {
      if (deps.signal.aborted) return;
      console.warn("[Pipeline] empty spec, falling back to single-phase");
      await runSinglePhase(userText, deps);
      return;
    }

    // ── 规格确认气泡：等待用户决定 ──
    const reviewId = deps.newMessageId();
    deps.setThinking(false);
    deps.appendMessage({
      id: reviewId,
      role: "spec-review",
      payload: { spec: spec.spec, status: "pending" }
    });

    const decision = await waitReview(spec.spec, deps.signal, handle =>
      cb.onReview(handle, reviewId)
    );

    if (decision.action === "retry") {
      deps.removeMessage(reviewId);
      deps.setThinking(true);
      phase1Pass = false; // ★ 下次 Phase 1 跳过缓存，真正重新生成
      continue; // 重新走 Phase 1
    }

    // ── Phase 2：编译 + 执行 + 修复 ──
    deps.updateSpecReview(reviewId, decision.spec, "confirmed");
    await runPhase2(decision.spec, deps);
    return;
  }
}

// ── Phase 1 ──

async function refineSpec(userText: string, deps: PipelineDeps, skipCache = false): Promise<RefinedSpecT | null> {
  const existingObjs = deps.getApi()?.getAllObjectNames() ?? [];
  const storage = deps.specCacheStorage;
  if (!skipCache) {
    const cached = lookupCachedSpec(userText, deps.domain, deps.appMode, existingObjs, storage);
    if (cached) return cached;
  }

  const chatRawFn = deps.chatRawImpl ?? defaultChatRaw;
  const phase1Messages: ChatMessage[] = [
    { role: "system", content: buildRefinePrompt(deps.domain) },
    { role: "user", content: userText }
  ];
  let rawSpec = await chatRawFn(deps.config, phase1Messages, deps.signal, deps.lightModel, undefined, true, u => deps.onTokenUsage?.(u));

  // ★ V4 json_object 模式有概率返回空 content（官方已知问题）→ 重试 1 次
  //    避免空规格直接降级 single-phase（浪费 heavy model 重新做整轮）
  if (!rawSpec.trim()) {
    console.warn(`[Pipeline] ${getTraceId()} Phase 1 空响应，重试 1 次`);
    rawSpec = await chatRawFn(deps.config, phase1Messages, deps.signal, deps.lightModel, undefined, true, u => deps.onTokenUsage?.(u));
  }

  const spec = parseRefinedSpec(rawSpec);
  if (spec && !spec.ask) {
    storeCachedSpec(userText, deps.domain, deps.appMode, existingObjs, spec, storage);
  }
  return spec;
}

/** 等待用户确认/重试；abort 时 reject AbortError */
function waitReview(
  spec: string,
  signal: AbortSignal,
  onHandle: (h: ReviewHandle) => void
): Promise<ReviewDecision> {
  return new Promise<ReviewDecision>((resolve, reject) => {
    let settled = false;
    const onAbort = () => {
      if (settled) return;
      settled = true;
      signal.removeEventListener("abort", onAbort);
      reject(new DOMException("The operation was aborted.", "AbortError"));
    };
    const handle: ReviewHandle = {
      spec,
      confirm(finalSpec) {
        if (settled) return;
        settled = true;
        signal.removeEventListener("abort", onAbort);
        resolve({ action: "confirm", spec: finalSpec });
      },
      retry() {
        if (settled) return;
        settled = true;
        signal.removeEventListener("abort", onAbort);
        resolve({ action: "retry" });
      }
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
    onHandle(handle);
  });
}

function waitProblemReview(
  problem: ProblemAnalysis,
  signal: AbortSignal,
  onHandle: (h: ProblemHandle) => void
): Promise<ProblemDecision> {
  return new Promise<ProblemDecision>((resolve, reject) => {
    let settled = false;
    const onAbort = () => {
      if (settled) return;
      settled = true;
      signal.removeEventListener("abort", onAbort);
      reject(new DOMException("The operation was aborted.", "AbortError"));
    };
    const handle: ProblemHandle = {
      problem,
      confirm(final) {
        if (settled) return;
        settled = true;
        signal.removeEventListener("abort", onAbort);
        resolve({ action: "confirm", problem: final });
      },
      retry() {
        if (settled) return;
        settled = true;
        signal.removeEventListener("abort", onAbort);
        resolve({ action: "retry" });
      }
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
    onHandle(handle);
  });
}

// ── Phase 2 ──

async function runPhase2(finalSpec: string, deps: PipelineDeps): Promise<void> {
  deps.setThinking(true);
  try {
    // ★ 分层记忆注入（L2 场景优先，L1 案例兜底）——DeepSeek recency bias 放 user message 末尾
    //    - 场景模式（≥2 次成功的结构骨架）→ 解决单案例硬套参数
    //    - 单案例 → 兜底，仅当命令数 ≥ 3 时注入（避免误导）
    const sceneSearchFn = deps.sceneSearchImpl ?? searchScene;
    let scene: SceneRecord | null = null;
    try {
      scene = await sceneSearchFn(finalSpec);
    } catch {
      scene = null;
    }

    // ★ 画布状态注入（多轮连贯性：AI 知道已建对象，增量修改不重建）
    const objs = deps.getApi()?.getAllObjectNames() ?? [];
    const canvasStatus = objs.length > 0
      ? `\n[当前画布已有对象：${objs.slice(0, 30).join(", ")}${objs.length > 30 ? "…" : ""}]`
      : "\n[当前画布为空]";

    let userContent = `${finalSpec}${canvasStatus}`;
    if (scene && scene.heat >= 2 && scene.pattern.length >= 3) {
      userContent = `${finalSpec}${canvasStatus}\n\n${buildScenePrompt(scene)}`;
    } else {
      const searchFn = deps.trainingSearchImpl ?? searchExecution;
      let example: ExecutionRecord | null = null;
      try {
        example = await searchFn(finalSpec);
      } catch {
        example = null;
      }
      if (example && example.commands.length >= 3) {
        userContent = `${finalSpec}${canvasStatus}\n\n${buildExamplePrompt(example)}`;
      }
    }

    const phase2Messages: ChatMessage[] = [
      { role: "system", content: buildCompilePrompt(deps.domain, deps.appMode) },
      ...collectHistory(deps.getMessages(), Math.ceil(HISTORY_WINDOW / 2)),
      { role: "user", content: userContent }
    ];
    const chatFn = deps.chatImpl ?? defaultChat;
    const response = await chatWithFormatRetry(chatFn, deps, phase2Messages);
    await executeAndRepair(response, finalSpec, deps);

    // ★ 满足度评估：对精炼规格 + 画布快照做逻辑审查
    await evaluateAndRepair(finalSpec, deps);
  } finally {
    deps.setThinking(false);
  }
}

/** 满足度评估 + 不满足时修复（最多 1 次） */
async function evaluateAndRepair(finalSpec: string, deps: PipelineDeps): Promise<void> {
  const api = deps.getApi();
  if (!api) {
    console.log(`[AiGGB:DIAG] ${getTraceId()} evaluateAndRepair: api is null, skip`);
    return;
  }

  console.log(`[AiGGB:DIAG] ${getTraceId()} evaluateAndRepair: 开始满足度评估`);
  // ★ 等待浏览器下一帧，确保 3D 渲染管线空闲（避免刚恢复重绘时立即大量 API 读取导致 WebGL 压力）
  if (typeof requestAnimationFrame !== "undefined") {
    await new Promise<void>(r => requestAnimationFrame(() => r()));
  }
  const snapshot = getRichSnapshot(api);

  const evalFn = deps.evalSatisfactionImpl ??
    ((await import("./satisfactionEval")).evaluateSatisfaction as typeof import("./satisfactionEval").evaluateSatisfaction);

  let evalResult;
  try {
    evalResult = await evalFn(deps.config, finalSpec, snapshot, deps.signal, deps.lightModel, undefined, u => deps.onTokenUsage?.(u));
  } catch (err) {
    if (deps.signal.aborted) throw err;
    console.warn("[Pipeline] 满足度评估失败，跳过", err);
    return;
  }

  // 满足 → 完成；不满足 → 追加 issues 消息 + 1 次修复
  if (evalResult.satisfied) return;

  // 追加评估失败消息
  deps.appendMessage({
    id: deps.newMessageId(),
    role: "error",
    content: `⚠ 审查发现 ${evalResult.issues.length} 个问题：\n${evalResult.issues.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n${evalResult.summary}`
  });

  // 1 次修复尝试：将 issues + 精炼规格 + 画布快照发给 AI 修正
  try {
    const { buildSatisfactionRepairPrompt } = await import("./satisfactionEval");
    const repairMsg = buildSatisfactionRepairPrompt(finalSpec, evalResult.issues, snapshot);

    const chatFn = deps.chatImpl ?? defaultChat;
    const repairResponse = await chatWithFormatRetry(chatFn, deps, [
      { role: "user", content: repairMsg }
    ]);

    // 执行修正命令（不做递归评估，避免无限循环；captureTraining=false 避免增量污染训练库）
    await executeAndRepair(repairResponse, finalSpec, deps, false);
  } catch (err) {
    if (deps.signal.aborted) throw err;
    deps.appendMessage({
      id: deps.newMessageId(),
      role: "error",
      content: `自动修复失败：${err instanceof Error ? err.message : String(err)}`
    });
  }
}

// ── 单阶段降级路径 ──

async function runSinglePhase(userText: string, deps: PipelineDeps): Promise<void> {
  deps.setThinking(true);
  const baseMessages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(deps.domain, deps.appMode) },
    ...collectHistory(deps.getMessages(), HISTORY_WINDOW),
    { role: "user", content: userText }
  ];
  const chatFn = deps.chatImpl ?? defaultChat;
  const response = await chatWithFormatRetry(chatFn, deps, baseMessages);
  await executeAndRepair(response, userText, deps);
}

// ── 执行 + 修复回路 ──

async function executeAndRepair(
  response: AIResponse,
  originalRequest: string,
  deps: PipelineDeps,
  /** 是否捕获训练样本（主执行 true；满足度修复回路 false，避免增量命令污染训练库） */
  captureTraining = true
): Promise<void> {
  // [ASK] 反问：不执行命令
  if (response.ask) {
    deps.appendAIResponse(response, []);
    return;
  }

  const api = deps.getApi();
  if (!api) {
    deps.appendMessage({
      id: deps.newMessageId(),
      role: "error",
      content: "GeoGebra 画布尚未就绪，请稍候"
    });
    return;
  }

  let ragRepairNote = applyRagCorrection(response);
  const snapshot = await takeSnapshot(api);

  console.log(`[AiGGB:DIAG] ${getTraceId()} executeAndRepair: 执行`, response.commands.length, "条命令");
  let results = executeCommands(api, response.commands, deps.appMode);
  deps.appendAIResponse(response, results);

  let attempts = 0;
  while (attempts < MAX_REPAIR) {
    const failures = collectFailures(results);
    console.log(`[AiGGB:DIAG] ${getTraceId()} executeAndRepair: 第${attempts}次执行 — ${results.length - failures.length}成功 / ${failures.length}失败`);
    if (failures.length === 0) break;
    attempts++;

    // 全部失败 → 回滚：快照优先，快照不可用则 newConstruction + 重放构造日志
    if (attempts === 1 && failures.length === results.length) {
      console.warn(`[AiGGB:DIAG] ${getTraceId()} executeAndRepair: ★ 全部命令失败，尝试回滚...`);
      const restored = snapshot !== null && (await restoreSnapshot(api, snapshot));
      if (!restored) {
        console.warn(`[AiGGB:DIAG] ${getTraceId()} executeAndRepair: ★ 快照不可用 → newConstruction() + 重放日志`);
        api.newConstruction();
        resetTmpIds();
        replayConstructionLog(api, deps.getConstructionLog());
      } else {
        console.log(`[AiGGB:DIAG] ${getTraceId()} executeAndRepair: 快照恢复成功`);
      }
    }

    const curApi = deps.getApi() ?? api;
    const existingObjs = curApi.getAllObjectNames() ?? [];

    // ★ known_traps 动态升级：记录本次失败（两阶段模式），并从 Agent 失败轨迹回填
    for (const f of failures) {
      void recordFailure(extractCmdName(f.cmd), f.error).catch(() => {});
    }
    const traps = await refreshTraps().catch(() => []);

    const checkerSystem = buildCheckerPrompt(failures, existingObjs, originalRequest);
    let repairUserMsg = JSON.stringify(response);
    const trapNote = buildTrapPrompt(traps);
    if (trapNote) repairUserMsg = trapNote + "\n\n" + repairUserMsg;
    if (ragRepairNote) repairUserMsg = ragRepairNote + "\n\n" + repairUserMsg;

    const chatFn = deps.chatImpl ?? defaultChat;
    response = await chatWithFormatRetry(chatFn, deps, [
      { role: "system", content: checkerSystem },
      { role: "assistant", content: repairUserMsg }
    ]);
    if (response.ask) {
      deps.appendAIResponse(response, []);
      return;
    }

    const repairNote = applyRagCorrection(response);
    if (repairNote) ragRepairNote = repairNote;

    results = executeCommands(deps.getApi() ?? api, response.commands, deps.appMode);
    deps.appendAIResponse(response, results);
  }

  // ★ 训练数据闭环：首次执行即全成功 → 存训练库（供后续相似意图检索注入）
  //    attempts === 0 表示未进入修复循环；仅主执行捕获（captureTraining 控制）
  if (captureTraining && attempts === 0 && collectFailures(results).length === 0) {
    const storeFn = deps.trainingStoreImpl ?? storeExecution;
    try {
      void storeFn(buildExecutionRecord(originalRequest, response.commands));
    } catch {
      // 静默：训练库失败不影响主流程
    }
  }
}

/** 从失败命令提取首命令名（"obj = Cmd(...)" → "Cmd"；无法提取返回 "eval"） */
function extractCmdName(cmd: string): string {
  const m = /^(?:\w+\s*=\s*)?(\w+)\s*\(/.exec(cmd.trim());
  return m ? m[1] : "eval";
}

/** RAG 模糊纠正：就地修正 eval 命令；返回可注入修复上下文的说明（无纠正/无建议时为 null） */
function applyRagCorrection(response: AIResponse): string | null {
  const correction = batchCorrect(
    response.commands.filter(c => c.op === "eval").map(c => ({ cmd: (c as { cmd: string }).cmd }))
  );
  if (correction.anyChanged) {
    let idx = 0;
    for (const c of response.commands) {
      if (c.op === "eval") {
        const r = correction.results[idx++];
        if (r?.changed) (c as { cmd: string }).cmd = r.corrected;
      }
    }
    return correctionsToRepairContext(correction);
  }
  return correction.results.some(r => r.suggestions.length > 0)
    ? correctionsToRepairContext(correction)
    : null;
}

/** 格式重试：AISchemaError 时把原始输出与诊断回喂模型，最多 MAX_FORMAT_RETRY 次 */
async function chatWithFormatRetry(
  chatFn: typeof defaultChat,
  deps: PipelineDeps,
  msgs: ChatMessage[]
): Promise<AIResponse> {
  let conv = msgs;
  for (let i = 0; i <= MAX_FORMAT_RETRY; i++) {
    try {
      return await chatFn(deps.config, conv, deps.signal, deps.heavyModel, u => deps.onTokenUsage?.(u));
    } catch (err) {
      if (err instanceof AISchemaError && i < MAX_FORMAT_RETRY) {
        deps.appendMessage({
          id: deps.newMessageId(),
          role: "error",
          content: `AI 返回格式异常（${err.message}：${err.detail}），正在自动重试 ${i + 1}/${MAX_FORMAT_RETRY}…`
        });
        conv = [
          ...conv,
          { role: "assistant", content: err.raw },
          { role: "user", content: buildFormatRepairMessage(err.raw, err.detail) }
        ];
        continue;
      }
      throw err;
    }
  }
  throw new AIError("AI 多次返回格式错误，已放弃");
}

// ── 快照与回滚 ──

/** 保存画布 base64 快照（超时 3s 返回 null，防止挂死）。会话历史/心跳恢复共用 */
export function takeSnapshot(api: GGBAppletApi | null): Promise<string | null> {
  return new Promise(resolve => {
    if (!api) return resolve(null);
    let settled = false;
    const done = (v: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(v);
    };
    const timer = setTimeout(() => done(null), 3000);
    try {
      // getBase64 可能同步返回字符串或异步回调，兼容两种
      const sync = api.getBase64(d => done(d ?? null));
      if (typeof sync === "string" && sync.length > 0) done(sync);
    } catch {
      done(null);
    }
  });
}

/** 恢复快照；回调在超时前触发返回 true，超时/异常返回 false。会话历史/心跳恢复共用 */
export function restoreSnapshot(api: GGBAppletApi | null, snapshot: string): Promise<boolean> {
  return new Promise(resolve => {
    if (!api) return resolve(false);
    let settled = false;
    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(ok);
    };
    const timer = setTimeout(() => done(false), 3000);
    try {
      api.setBase64(snapshot, () => done(true));
    } catch {
      done(false);
    }
  });
}

/** 构造类命令（赋值 / 函数定义）匹配——回滚兜底重放只重放这类 */
const CONSTRUCTION_RE = /^[\w]+\s*(?:\([^)]*\))?\s*=/;

/** 快照不可用时的兜底重建：重放历史成功命令中的构造类。会话恢复共用 */
export function replayConstructionLog(api: GGBAppletApi, log: string[]): void {
  for (const cmd of log) {
    if (CONSTRUCTION_RE.test(cmd)) api.evalCommand(cmd);
  }
}

// ── 工具 ──

/** 解析 Phase 1 的纯文本输出为 RefinedSpec（code fence 剥离 + JSON 容错） */
export function parseRefinedSpec(raw: string): RefinedSpecT | null {
  const cleaned = raw.trim()
    .replace(/^```json?\s*/, "").replace(/\s*```$/, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { spec: cleaned.slice(0, 3000) };
  }
  const result = RefinedSpec.safeParse(parsed);
  if (result.success) return result.data;
  // AI 显式输出了结构化空 spec（如 {"spec":""}）→ 视为空规格走降级，
  // 而非把原始 JSON 文本包成 spec 进入确认气泡
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const o = parsed as Record<string, unknown>;
    if (typeof o.spec === "string" && o.spec.trim().length === 0 && !o.ask) {
      return { spec: "" };
    }
  }
  return { spec: cleaned.slice(0, 3000) };
}

/** 把消息历史折叠为 user/assistant 对话（含 ask 反问），仅保留最近 windowSize 轮 */
export function collectHistory(messages: ChatTurn[], windowSize: number): ChatMessage[] {
  const collapsed: ChatMessage[] = [];
  for (const m of messages) {
    if (m.role === "user") {
      let content = m.content;
      if (m.attachments && m.attachments.length > 0) {
        content += `\n[附件:图片×${m.attachments.length}]`;
      }
      collapsed.push({ role: "user", content });
    }
    else if (m.role === "assistant") {
      const payload: Record<string, unknown> = {
        explanation: m.payload.explanation,
        summary: summarizeCommandsForHistory(m.payload.commands),
      };
      if (m.payload.self_check) payload.self_check = m.payload.self_check;
      collapsed.push({ role: "assistant", content: JSON.stringify(payload) });
    } else if (m.role === "ask") {
      // AI 的反问也要进历史——否则用户对反问的回答缺少上下文，AI 断链
      collapsed.push({ role: "assistant", content: JSON.stringify({ ask: m.payload.question }) });
    }
  }
  return collapsed.slice(-windowSize * 2);
}

/**
 * 将命令数组压缩为紧凑摘要，替代完整 JSON 序列化（省 ~70% token）。
 * 只保留 AI 下一轮需要知道的：创建了什么对象、改了什么样式/视窗、删了什么。
 */
function summarizeCommandsForHistory(commands: Array<{ op: string; [k: string]: unknown }>): string {
  const created: string[] = [];
  const styled: string[] = [];
  const views: string[] = [];
  const animated: string[] = [];
  const other: string[] = [];
  let evalCount = 0;

  for (const c of commands) {
    switch (c.op) {
      case "eval": {
        evalCount++;
        const cmd = String(c.cmd ?? "");
        // 提取对象名（赋值左值）
        const m = cmd.match(/^(\w[\w]*)\s*[:=]/);
        if (m) created.push(m[1]);
        else other.push(cmd.slice(0, 60));
        break;
      }
      case "slider": {
        created.push(`${c.name}(Slider)`);
        break;
      }
      case "vector":
      case "forceDiagram": {
        created.push(`${c.name}(Vector)`);
        break;
      }
      case "style": {
        const target = String(c.target ?? "?");
        const parts: string[] = [target];
        if (c.color) parts.push(`color=${c.color}`);
        if (c.thickness !== undefined) parts.push(`w=${c.thickness}`);
        styled.push(parts.join(":"));
        break;
      }
      case "view": {
        if (c.xmin !== undefined) views.push(`range[${c.xmin},${c.xmax}]×[${c.ymin},${c.ymax}]`);
        if (c.perspective) views.push(`persp=${c.perspective}`);
        if (c.showGrid !== undefined) views.push(`grid=${c.showGrid}`);
        break;
      }
      case "animate": {
        animated.push(`${c.target}:${c.action}`);
        break;
      }
      case "constants": {
        const names = c.names as string[] | undefined;
        created.push(`consts(${(names ?? []).join(",")})`);
        break;
      }
      case "delete":
        other.push(`del:${c.target}`);
        break;
      case "reset":
        other.push("reset");
        break;
      default:
        other.push(c.op);
    }
  }

  const parts: string[] = [];
  if (created.length) parts.push(`创建[${created.join(", ")}]`);
  if (styled.length) parts.push(`样式[${styled.join("; ")}]`);
  if (views.length) parts.push(`视窗[${views.join(", ")}]`);
  if (animated.length) parts.push(`动画[${animated.join(", ")}]`);
  if (evalCount > created.length) parts.push(`+${evalCount - created.length}条eval`);
  if (other.length) parts.push(`其他[${other.join(", ")}]`);
  return parts.length ? parts.join(" ") : "(无操作)";
}

// ──── Agent Mode（工具调用代理） ────

/**
 * 工具调用代理模式入口 —— 替代两阶段流水线。
 * 通过 Function Calling + ReAct 循环逐步构造图形。
 *
 * 与 runPipeline 的区别：
 *   - 无 Phase 1/2 分阶段，AI 在单次对话中完成全流程
 *   - AI 主动调用工具（create_point/list_objects/eval_raw...）
 *   - 每步工具调用结果实时反馈，AI 即时调整
 *   - dangerous 工具需用户确认（通过 onConfirm 回调）
 */
export async function runAgentPipeline(
  userText: string,
  deps: PipelineDeps,
  cb: PipelineCallbacks
): Promise<void> {
  return runAgentRound(userText, deps, cb);
}

/** runAgentRound 可选参数（仅带图轮使用） */
interface AgentRoundOpts {
  stateCheck?: import("./agentLoop").StateCheckSpec;
  evalBasis?: string;
}

async function runAgentRound(
  userText: string,
  deps: PipelineDeps,
  cb: PipelineCallbacks,
  opts?: AgentRoundOpts
): Promise<void> {
  // 注册确认处理器
  if (cb.onConfirm) {
    registerConfirmationHandler(cb.onConfirm);
  }

  const api = deps.getApi();
  if (!api) {
    deps.appendMessage({
      id: deps.newMessageId(),
      role: "error",
      content: "GeoGebra 画布尚未就绪，请稍候"
    });
    return;
  }

  // ★ 高风险操作快照：整轮 agent 模式开始前保存 base64 快照。
  //    Agent 逐步执行可能部分成功部分失败 → 画布停在"半成品"。
  //    失败时（熔断/超限/空响应放弃/异常）恢复到本轮开始前，给用户一个干净起点。
  const agentSnapshot = await takeSnapshot(api);

  let result: AgentLoopResult | null = null;
  // ★ 是否已回滚：true 时本轮命令未生效，不写入 constructionLog（否则 undo 重放出错）
  let rollbackHappened = false;
  // ★ 轨迹已持久化的标记（供 finally 回填 known_traps 前等待写入完成）
  let trajectorySaved = false;
  try {
    const agentLoopFn = deps.runAgentLoopImpl ?? runAgentLoop;
    result = await agentLoopFn(userText, {
      config: deps.config,
      domain: deps.domain,
      appMode: deps.appMode,
      signal: deps.signal,
      getApi: deps.getApi,
      getMessages: deps.getMessages,
      agentModel: resolveModel(deps.config, "agent"),
      // ★ 改造五：ReAct 轨迹持久化（IndexedDB；非浏览器环境静默跳过）
      persistTrajectory: rec => {
        void saveTrajectory(rec).then(() => { trajectorySaved = true; }).catch(() => {});
      },
      // ★ 透传思考步骤到 UI（减少等待焦虑）
      onThinking: msg => cb.onAgentStep?.(msg),
      // ★ token 统计
      onTokenUsage: u => deps.onTokenUsage?.(u),
      // ★ 状态核对（仅带图轮注入）
      stateCheck: opts?.stateCheck,
    });

    // ★ 失败回滚：AgentLoopResult.failed（熔断/超限/空响应放弃）→ 恢复本轮开始前快照
    if (result.failed && !deps.signal.aborted && agentSnapshot !== null) {
      const restored = await restoreSnapshot(deps.getApi() ?? api, agentSnapshot);
      if (restored) {
        rollbackHappened = true;
        console.log(`[AiGGB:DIAG] ${getTraceId()} agent 失败回滚：恢复本轮开始前快照`);
      }
    }
  } catch (err) {
    if (deps.signal.aborted) throw err;

    // ★ 异常时也尝试回滚（若有部分执行），避免半成品画布
    if (agentSnapshot !== null && !deps.signal.aborted) {
      const restored = await restoreSnapshot(deps.getApi() ?? api, agentSnapshot);
      rollbackHappened = restored;
    }

    // ★ 部分结果：即使异常也有已执行的操作摘要
    const partialMsg = result
      ? `代理模式部分完成（${result.iterations} 步），但遇到错误`
      : "代理模式执行失败";
    deps.appendMessage({
      id: deps.newMessageId(),
      role: "error",
      content: err instanceof Error
        ? `${partialMsg}：${err.message}`
        : partialMsg
    });
    return;
  } finally {
    unregisterConfirmationHandler();
    // ★ known_traps 回填：Agent 失败轨迹 → 陷阱（等轨迹写入完成，避免读不到刚保存的记录）
    //    若在 catch 中已 return，此处仍在 finally 执行（catch return 后 finally 照样跑）
    void (async () => {
      // 等待本轮轨迹落库（最多 ~1s），随后回填陷阱（幂等、静默失败）
      for (let i = 0; i < 20 && !trajectorySaved; i++) {
        await new Promise<void>(r => setTimeout(r, 50));
      }
      await backfillTrapsFromTrajectories().catch(() => {});
    })();
  }

  // ★ 构建 agent 结果摘要消息
  const summary = rollbackHappened
    ? `${buildAgentSummary(result)}\n\n⚠ 本轮构造失败，画布已回滚到开始前状态。`
    : buildAgentSummary(result);

  // ★ 从工具调用历史提取可重放的 eval 命令（供 undo 回放 + constructionLog 兜底）
  //    回滚后本轮命令未生效 → 不提取（constructionLog 保持一致）
  //    同时记录每个 tool_call 的真实成败，供 pseudoResults 标记（不再一律 ok:true，
  //    避免把"实际失败的工具导致的可重放命令"当作成功写入 constructionLog）
  const agentEvalCommands: Array<{ op: "eval"; cmd: string; toolCallId?: string }> = [];
  if (!rollbackHappened) {
    for (const m of result.messages) {
      if (m.role === "assistant" && m.tool_calls) {
        for (const tc of m.tool_calls) {
          const cmds = toolCallToEvalCommands(tc.function.name, tc.function.arguments);
          for (const cmd of cmds) {
            agentEvalCommands.push({ op: "eval", cmd, toolCallId: tc.id });
          }
        }
      }
    }
  }

  // ★ 各 tool_call 的真实结果：tool_call_id → { success, error? }（从对话流中的 tool 响应解析）
  const toolResults = new Map<string, { success: boolean; error?: string }>();
  for (const m of result.messages) {
    if (m.role === "tool" && m.tool_call_id && typeof m.content === "string") {
      try {
        const p = JSON.parse(m.content) as { success?: boolean; error?: string };
        toolResults.set(m.tool_call_id, {
          success: p.success !== false,
          error: p.error,
        });
      } catch { /* 无法解析的 tool 响应按成功计（保守） */ }
    }
  }

  // ★ 追加 assistant 消息（用 appendAIResponse 写入 constructionLog，使 undo 能回滚）
  const pseudoResults: ExecResult[] = agentEvalCommands.map(c => {
    const tr = c.toolCallId ? toolResults.get(c.toolCallId) : undefined;
    const ok = tr ? tr.success : true;
    return {
      ok,
      command: { op: "eval", cmd: c.cmd },
      expanded: [c.cmd],
      error: tr && !tr.success ? tr.error : undefined,
    };
  });
  // 仅把可重放命令中"真正成功"的写入 constructionLog（undo 回放才会一致）
  const successfulEvalCommands = agentEvalCommands
    .filter(c => (c.toolCallId ? (toolResults.get(c.toolCallId)?.success ?? true) : true))
    .map(c => ({ op: "eval" as const, cmd: c.cmd }));
  deps.appendAIResponse(
    { explanation: summary, commands: successfulEvalCommands },
    pseudoResults
  );

  deps.setThinking(false);

  // ★ 满足度评估（Phase 3.1）：审查画布。已回滚则跳过（画布非本轮产物）
  if (rollbackHappened) return;
  try {
    await evaluateAgentResult(result, deps, opts?.evalBasis);
  } catch (err) {
    if (deps.signal.aborted) throw err;
    console.warn("[Pipeline] agent 满足度评估跳过", err);
  }
}

/** 从 AgentLoopResult 构建人类可读摘要 */
function buildAgentSummary(result: AgentLoopResult): string {
  const parts: string[] = [result.finalText];

  if (result.iterations > 1) {
    parts.push(`（共 ${result.iterations} 步工具调用）`);
  }
  if (result.deniedTools.length > 0) {
    parts.push(`已拒绝：${result.deniedTools.join("、")}`);
  }

  return parts.join("\n");
}

/** 对 agent 模式执行完的结果做满足度评估（复用 evaluateAndRepair 的核心逻辑） */
async function evaluateAgentResult(result: AgentLoopResult, deps: PipelineDeps, evalBasis?: string): Promise<void> {
  const api = deps.getApi();
  if (!api) return;

  // ★ 等待浏览器下一帧，确保 3D 渲染管线空闲
  if (typeof requestAnimationFrame !== "undefined") {
    await new Promise<void>(r => requestAnimationFrame(() => r()));
  }
  const snapshot = getRichSnapshot(api);

  const evalFn = deps.evalSatisfactionImpl ??
    ((await import("./satisfactionEval")).evaluateSatisfaction as typeof import("./satisfactionEval").evaluateSatisfaction);

  // agent 模式没有精炼规格，用 finalText 作为审查基准；带图轮用确认后的题目解读
  const specForEval = evalBasis || result.finalText || "用户原始需求";

  let evalResult;
  try {
    evalResult = await evalFn(deps.config, specForEval, snapshot, deps.signal, deps.lightModel, undefined, u => deps.onTokenUsage?.(u));
  } catch (err) {
    if (deps.signal.aborted) throw err;
    console.warn("[Pipeline] agent 满足度评估失败，跳过", err);
    return;
  }

  if (evalResult.satisfied) return;

  deps.appendMessage({
    id: deps.newMessageId(),
    role: "error",
    content: `⚠ 审查发现 ${evalResult.issues.length} 个问题：\n${evalResult.issues.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n${evalResult.summary}`
  });

  // agent 模式不自动修复（AI 已经在循环中尝试了），仅报告
}

// ── 多模态题目识别 ──

async function extractProblem(
  text: string,
  images: string[],
  deps: PipelineDeps
): Promise<{ problem: ProblemAnalysis | null; truncated?: boolean }> {
  const parts: ContentPart[] = [];
  if (text.trim()) {
    parts.push({ type: "text", text: text.trim() });
  }
  for (const img of images) {
    parts.push({ type: "image_url", image_url: { url: img } });
  }

  const msgs: ChatMessage[] = [
    { role: "system", content: buildVisionExtractPrompt(deps.domain) },
    { role: "user", content: parts },
  ];

  const chatRawFn = deps.chatRawImpl ?? defaultChatRaw;
  const visionModel = deps.visionModel ?? deps.heavyModel;

  // ★ 识别调用跳过 thinking：感知任务无需深思考，避免 reasoning tokens 挤占输出预算
  const visionConfig = { ...deps.config, reasoningEffort: undefined };

  // first attempt (jsonMode=false: vision models often don't support response_format:json_object)
  // ★ maxTokens=4096: 视觉模型默认输出上限可能很低，显式设防截断（B+A 联动）
  let raw = await chatRawFn(
    visionConfig, msgs, deps.signal, visionModel, 4096, false, u => deps.onTokenUsage?.(u)
  );

  // empty response retry once
  if (!raw.trim()) {
    raw = await chatRawFn(
      visionConfig, msgs, deps.signal, visionModel, 4096, false, u => deps.onTokenUsage?.(u)
    );
  }

  if (!raw.trim()) return { problem: null };
  const problem = parseProblemAnalysis(raw);
  // ★ D-min: 非空响应但解析失败 → 大概率截断（JSON 未闭合），标记供上层区分错误文案
  if (!problem && raw.trim().length > 100) {
    return { problem: null, truncated: true };
  }
  return { problem };
}

export async function runVisionPipeline(
  input: { text: string; images: string[] },
  deps: PipelineDeps,
  cb: PipelineCallbacks
): Promise<void> {
  const { text, images } = input;

  for (;;) {
    // ── 识别段 ──
    let problem: ProblemAnalysis | null;
    let truncated = false;
    try {
      const result = await extractProblem(text, images, deps);
      problem = result.problem;
      truncated = result.truncated ?? false;
    } catch (err) {
      if (deps.signal.aborted) throw err;
      const reason = err instanceof Error ? err.message : String(err);
      if (text.trim()) {
        deps.appendMessage({
          id: deps.newMessageId(),
          role: "error",
          content: `题目识别失败（${reason}），将直接按文字绘制`,
        });
        await runAgentPipeline(text, deps, cb);
      } else {
        deps.appendMessage({
          id: deps.newMessageId(),
          role: "error",
          content: `识别失败：请在 设置 → 高级 中配置支持图片的视觉模型（${reason}）`,
        });
      }
      return;
    }

    if (!problem) {
      // ★ D-min: 区分截断 vs 真失败，给用户可操作的提示
      const truncHint = truncated ? "（输出被截断，请尝试更清晰的图片或简化题目后重试）" : "";
      if (text.trim()) {
        deps.appendMessage({
          id: deps.newMessageId(),
          role: "error",
          content: `题目识别失败${truncHint || "（无法解析输出）"}，将直接按文字绘制`,
        });
        await runAgentPipeline(text, deps, cb);
      } else {
        deps.appendMessage({
          id: deps.newMessageId(),
          role: "error",
          content: truncated
            ? "识别输出不完整（可能被截断），请尝试更清晰的图片或简化题目后重试"
            : "识别失败：请在 设置 → 高级 中配置支持图片的视觉模型",
        });
      }
      return;
    }

    // ask → 展示反问，本轮结束
    if (problem.ask) {
      deps.appendAIResponse({ explanation: "需要确认", commands: [], ask: problem.ask }, []);
      return;
    }

    // ── 题目确认气泡 ──
    const reviewId = deps.newMessageId();
    deps.appendMessage({
      id: reviewId,
      role: "problem-review",
      payload: { problem, status: "pending" },
    });

    if (!cb.onProblemReview) {
      // no UI handler — treat as confirmed with original analysis
      const basis = serializeProblem(problem);
      const taskText = [text.trim(), basis].filter(Boolean).join("\n\n");
      await runAgentPipeline(taskText, deps, cb);
      return;
    }

    let decision: ProblemDecision;
    try {
      decision = await waitProblemReview(problem, deps.signal, h => cb.onProblemReview!(h, reviewId));
    } catch (err) {
      if (deps.signal.aborted) throw err;
      throw err;
    }

    if (decision.action === "retry") {
      deps.removeMessage(reviewId);
      continue; // re-run recognition
    }

    // confirmed
    deps.updateProblemReview?.(reviewId, decision.problem, "confirmed");
    const basis = serializeProblem(decision.problem);
    const taskText = [text.trim(), basis].filter(Boolean).join("\n\n");

    // ★ Agent 构造 + 画布状态核对
    await runAgentRound(taskText, deps, cb, {
      stateCheck: {
        basis,
        check: async (snapshot, signal) => {
          const evalFn = deps.evalSatisfactionImpl ??
            ((await import("./satisfactionEval")).evaluateSatisfaction as typeof import("./satisfactionEval").evaluateSatisfaction);
          try {
            return await evalFn(deps.config, basis, snapshot, signal, deps.lightModel, undefined, u => deps.onTokenUsage?.(u));
          } catch (err) {
            if (signal.aborted) throw err;
            console.warn("[Pipeline] stateCheck eval failed, treating as pass", err);
            return null;
          }
        },
      },
      evalBasis: basis,
    });
    return;
  }
}
