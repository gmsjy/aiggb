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
  type ChatMessage
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
import { batchCorrect, correctionsToRepairContext } from "./commandCorrect";
import { RefinedSpec, type RefinedSpec as RefinedSpecT } from "./specSchema";
import { lookupCachedSpec, storeCachedSpec } from "./specCache";
import type { AIResponse } from "./schema";
import type { GGBAppletApi } from "../types/ggb";
import type { ChatTurn } from "../store/useAppStore";
import {
  runAgentLoop,
  registerConfirmationHandler,
  unregisterConfirmationHandler,
  type AgentLoopResult,
  type ConfirmationRequest,
  type ConfirmationDecision
} from "./agentLoop";
import { toolCallToEvalCommands } from "./toolExecutor";

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
  removeMessage(id: string): void;
  setThinking(b: boolean): void;
  newMessageId(): string;
  /** 测试可注入脚本网关，替换真实调用 */
  chatImpl?: typeof defaultChat;
  chatRawImpl?: typeof defaultChatRaw;
  /** 满足度评估注入（测试可 mock） */
  evalSatisfactionImpl?: typeof import("./satisfactionEval").evaluateSatisfaction;
  /** 解析后的轻量模型名（用于精炼/评估） */
  lightModel: string;
  /** 解析后的主力模型名（用于编译/修复/降级） */
  heavyModel: string;
}

export interface PipelineCallbacks {
  /** Phase 1 产出规格后调用；UI 展示确认气泡并持有 handle 以回传决定 */
  onReview(handle: ReviewHandle, reviewId: string): void;
  /** 工具调用代理模式：dangerous 工具需用户确认 */
  onConfirm?(requests: ConfirmationRequest[]): Promise<ConfirmationDecision[]>;
  /** Agent 模式实时思考步骤（观察/规划/执行工具），UI 展示减少等待焦虑 */
  onAgentStep?(message: string): void;
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
  for (;;) {
    // ── Phase 1：意图 → 精炼规格（缓存优先）──
    let spec: RefinedSpecT | null;
    try {
      spec = await refineSpec(userText, deps);
    } catch (err) {
      if (deps.signal.aborted) throw err;
      console.warn("[Pipeline] Phase 1 failed, falling back to single-phase", err);
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
      continue; // 重新走 Phase 1
    }

    // ── Phase 2：编译 + 执行 + 修复 ──
    deps.updateSpecReview(reviewId, decision.spec, "confirmed");
    await runPhase2(decision.spec, deps);
    return;
  }
}

// ── Phase 1 ──

async function refineSpec(userText: string, deps: PipelineDeps): Promise<RefinedSpecT | null> {
  const existingObjs = deps.getApi()?.getAllObjectNames() ?? [];
  const cached = lookupCachedSpec(userText, deps.domain, deps.appMode, existingObjs);
  if (cached) return cached;

  const chatRawFn = deps.chatRawImpl ?? defaultChatRaw;
  const phase1Messages: ChatMessage[] = [
    { role: "system", content: buildRefinePrompt(deps.domain) },
    { role: "user", content: userText }
  ];
  const rawSpec = await chatRawFn(deps.config, phase1Messages, deps.signal, deps.lightModel);
  const spec = parseRefinedSpec(rawSpec);
  if (spec && !spec.ask) {
    storeCachedSpec(userText, deps.domain, deps.appMode, existingObjs, spec);
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

// ── Phase 2 ──

async function runPhase2(finalSpec: string, deps: PipelineDeps): Promise<void> {
  deps.setThinking(true);
  try {
    const phase2Messages: ChatMessage[] = [
      { role: "system", content: buildCompilePrompt(deps.domain, deps.appMode) },
      ...collectHistory(deps.getMessages(), Math.ceil(HISTORY_WINDOW / 2)),
      { role: "user", content: finalSpec }
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
    console.log("[AiGGB:DIAG] evaluateAndRepair: api is null, skip");
    return;
  }

  console.log("[AiGGB:DIAG] evaluateAndRepair: 开始满足度评估");
  // ★ 等待浏览器下一帧，确保 3D 渲染管线空闲（避免刚恢复重绘时立即大量 API 读取导致 WebGL 压力）
  if (typeof requestAnimationFrame !== "undefined") {
    await new Promise<void>(r => requestAnimationFrame(() => r()));
  }
  const snapshot = getRichSnapshot(api);

  const evalFn = deps.evalSatisfactionImpl ??
    ((await import("./satisfactionEval")).evaluateSatisfaction as typeof import("./satisfactionEval").evaluateSatisfaction);

  let evalResult;
  try {
    evalResult = await evalFn(deps.config, finalSpec, snapshot, deps.signal, deps.lightModel);
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

    // 执行修正命令（不做递归评估，避免无限循环）
    await executeAndRepair(repairResponse, finalSpec, deps);
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
  deps: PipelineDeps
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

  console.log("[AiGGB:DIAG] executeAndRepair: 执行", response.commands.length, "条命令");
  let results = executeCommands(api, response.commands, deps.appMode);
  deps.appendAIResponse(response, results);

  let attempts = 0;
  while (attempts < MAX_REPAIR) {
    const failures = collectFailures(results);
    console.log(`[AiGGB:DIAG] executeAndRepair: 第${attempts}次执行 — ${results.length - failures.length}成功 / ${failures.length}失败`);
    if (failures.length === 0) break;
    attempts++;

    // 全部失败 → 回滚：快照优先，快照不可用则 newConstruction + 重放构造日志
    if (attempts === 1 && failures.length === results.length) {
      console.warn("[AiGGB:DIAG] executeAndRepair: ★ 全部命令失败，尝试回滚...");
      const restored = snapshot !== null && (await restoreSnapshot(api, snapshot));
      if (!restored) {
        console.warn("[AiGGB:DIAG] executeAndRepair: ★ 快照不可用 → newConstruction() + 重放日志");
        api.newConstruction();
        resetTmpIds();
        replayConstructionLog(api, deps.getConstructionLog());
      } else {
        console.log("[AiGGB:DIAG] executeAndRepair: 快照恢复成功");
      }
    }

    const curApi = deps.getApi() ?? api;
    const existingObjs = curApi.getAllObjectNames() ?? [];
    const checkerSystem = buildCheckerPrompt(failures, existingObjs, originalRequest);
    let repairUserMsg = JSON.stringify(response);
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
      return await chatFn(deps.config, conv, deps.signal, deps.heavyModel);
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

/** 保存画布 base64 快照（超时 3s 返回 null，防止挂死） */
function takeSnapshot(api: GGBAppletApi | null): Promise<string | null> {
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

/** 恢复快照；回调在超时前触发返回 true，超时/异常返回 false */
function restoreSnapshot(api: GGBAppletApi | null, snapshot: string): Promise<boolean> {
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

/** 快照不可用时的兜底重建：重放历史成功命令中的构造类 */
function replayConstructionLog(api: GGBAppletApi, log: string[]): void {
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
    if (m.role === "user") collapsed.push({ role: "user", content: m.content });
    else if (m.role === "assistant") {
      const payload: Record<string, unknown> = {
        explanation: m.payload.explanation,
        commands: m.payload.commands
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

  let result: AgentLoopResult | null = null;
  try {
    result = await runAgentLoop(userText, {
      config: deps.config,
      domain: deps.domain,
      appMode: deps.appMode,
      signal: deps.signal,
      getApi: deps.getApi,
      getMessages: deps.getMessages,
      agentModel: resolveModel(deps.config, "agent"),
      // ★ 透传思考步骤到 UI（减少等待焦虑）
      onThinking: msg => cb.onAgentStep?.(msg),
    });
  } catch (err) {
    if (deps.signal.aborted) throw err;

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
  }

  // ★ 构建 agent 结果摘要消息
  const summary = buildAgentSummary(result);

  // ★ 从工具调用历史提取可重放的 eval 命令（供 undo 回放 + constructionLog 兜底）
  const agentEvalCommands: Array<{ op: "eval"; cmd: string }> = [];
  for (const m of result.messages) {
    if (m.role === "assistant" && m.tool_calls) {
      for (const tc of m.tool_calls) {
        const cmds = toolCallToEvalCommands(tc.function.name, tc.function.arguments);
        for (const cmd of cmds) {
          agentEvalCommands.push({ op: "eval", cmd });
        }
      }
    }
  }

  // ★ 追加 assistant 消息（用 appendAIResponse 写入 constructionLog，使 undo 能回滚）
  //    将可重放命令映射为 ExecResult[] 以便 appendAIResponse 写入日志
  const pseudoResults: ExecResult[] = agentEvalCommands.map(c => ({
    ok: true,
    command: c,
    expanded: [c.cmd],
  }));
  deps.appendAIResponse(
    { explanation: summary, commands: agentEvalCommands },
    pseudoResults
  );

  deps.setThinking(false);

  // ★ 满足度评估（Phase 3.1）：审查画布
  try {
    await evaluateAgentResult(result, deps);
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
async function evaluateAgentResult(result: AgentLoopResult, deps: PipelineDeps): Promise<void> {
  const api = deps.getApi();
  if (!api) return;

  // ★ 等待浏览器下一帧，确保 3D 渲染管线空闲
  if (typeof requestAnimationFrame !== "undefined") {
    await new Promise<void>(r => requestAnimationFrame(() => r()));
  }
  const snapshot = getRichSnapshot(api);

  const evalFn = deps.evalSatisfactionImpl ??
    ((await import("./satisfactionEval")).evaluateSatisfaction as typeof import("./satisfactionEval").evaluateSatisfaction);

  // agent 模式没有精炼规格，用 finalText 作为审查基准
  const specForEval = result.finalText || "用户原始需求";

  let evalResult;
  try {
    evalResult = await evalFn(deps.config, specForEval, snapshot, deps.signal, deps.lightModel);
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
