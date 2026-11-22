/**
 * Agent 流水线 —— 从 ChatPanel 提取的纯 TS 状态机（无 React 依赖，可 node 单测）
 *
 * v2.0：两阶段流水线（Phase 1 精炼 → 规格确认 → Phase 2 编译）已移除。
 * 纯文字与带图统一走 Agent 模式（runAgentPipeline / runVisionPipeline）。
 *
 * 失败回滚策略（全失败时）：
 *   1. 优先恢复执行前 base64 快照；
 *   2. 快照缺失/超时 → newConstruction + 重放 constructionLog（store 维护的成功命令日志）。
 */
import {
  chatRaw as defaultChatRaw,
  resolveModel,
  getProviderCapabilities,
  type AIConfig,
  type ChatMessage,
  type ContentPart,
  type AgentMessage
} from "./aiClient";
import { getRichSnapshot, exportPNG, type ExecResult } from "./ggbBridge";
import type { Domain } from "./prompts";
import { parseProblemAnalysis, serializeProblem, type ProblemAnalysis } from "./problemSchema";
import { buildVisionExtractPrompt } from "./visionPrompt";
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
import { refreshTraps, buildTrapPrompt, backfillTrapsFromTrajectories } from "./trapStore";

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
  updateProblemReview?(id: string, problem: ProblemAnalysis, status: "pending" | "confirmed" | "rejected"): void;
  removeMessage(id: string): void;
  setThinking(b: boolean): void;
  newMessageId(): string;
  /** 测试可注入脚本网关，替换真实调用（题目识别用） */
  chatRawImpl?: typeof defaultChatRaw;
  /** 满足度评估注入（测试可 mock） */
  evalSatisfactionImpl?: typeof import("./satisfactionEval").evaluateSatisfaction;
  /** 视觉审查注入（画布截图 + 视觉模型；测试可 mock，缺省用真实实现） */
  evalVisualImpl?: typeof import("./satisfactionEval").evaluateVisual;
  /** 解析后的轻量模型名（满足度评估） */
  lightModel: string;
  /** 解析后的主力模型名（Agent 回退链） */
  heavyModel: string;
  /** 解析后的视觉模型名（用于题目图片识别） */
  visionModel?: string;
  /** 每次 AI 调用的 token 用量回传（累计到 UI 统计） */
  onTokenUsage?: (usage: { prompt: number; completion: number; reasoning?: number; cacheHit?: number }) => void;
  /** Agent 循环实现注入（单测 mock 用） */
  runAgentLoopImpl?: typeof runAgentLoop;
}

export interface PipelineCallbacks {
  /** Phase 1 产出规格后调用；UI 展示确认气泡并持有 handle 以回传决定（两阶段已移除，保留可选兼容） */
  onReview?(handle: ReviewHandle, reviewId: string): void;
  /** 工具调用代理模式：dangerous 工具需用户确认 */
  onConfirm?(requests: ConfirmationRequest[]): Promise<ConfirmationDecision[]>;
  /** Agent 模式实时思考步骤（观察/规划/执行工具），UI 展示减少等待焦虑 */
  onAgentStep?(message: string): void;
  /** 题目识别后调用；UI 展示确认气泡并持有 handle 以回传决定 */
  onProblemReview?(handle: ProblemHandle, reviewId: string): void;
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

// ── 题目确认等待（带图轮使用） ──

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

// ── 工具 ──

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
        break;
      }
      case "animate": {
        // animate schema 字段：target/on/speed/repeat（无 action；on 决定启停）
        animated.push(`${c.target}(${c.on ? "开" : "停"}${c.speed !== undefined ? `,速=${c.speed}` : ""})`);
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

// ──── 轮次耗尽续作缓存（模块级会话内存） ────
// 「画布保留 + 后续指令接力」的上下文侧：暂停轮的完整对话缓存下来，下一轮注入
// resumeMessages 续作（原始请求/已尝试工具序列/失败信息全保留，进入循环前压缩）。
// 清空画布/撤销未主动清理时靠 TTL + 画布指纹校验兜底失效。

interface AgentResumeCache {
  /** 暂停轮的完整对话（首元素为该轮 system prompt，恢复时被新 prompt 替换） */
  messages: AgentMessage[];
  /** 暂停时画布对象数（恢复时校验画布未被清空/撤销） */
  canvasObjCount: number;
  ts: number;
}

const RESUME_CACHE_TTL_MS = 10 * 60_000;
let agentResumeCache: AgentResumeCache | null = null;

/** 清空续作缓存（清空画布/撤销/切模式时可调用；不调也有 TTL + 画布校验兜底） */
export function clearAgentResumeCache(): void {
  agentResumeCache = null;
}

/** 读取续作缓存（校验 TTL 与画布指纹；读取不清空——完成/失败轮才清除） */
function peekAgentResumeCache(api: GGBAppletApi | null): AgentMessage[] | undefined {
  const c = agentResumeCache;
  if (!c) return undefined;
  if (Date.now() - c.ts > RESUME_CACHE_TTL_MS) {
    agentResumeCache = null;
    return undefined;
  }
  const currentCount = api ? api.getAllObjectNames().length : 0;
  if (c.canvasObjCount > 0 && currentCount === 0) {
    agentResumeCache = null; // 暂停时有对象、现在画布空了 → 被清空/撤销，缓存上下文失真
    return undefined;
  }
  return c.messages;
}

/** runAgentRound 可选参数（仅带图轮使用） */
interface AgentRoundOpts {
  stateCheck?: import("./agentLoop").StateCheckSpec;
  evalBasis?: string;
  /** 原题图片（data URL）。透传给 agent loop 附在首条 user 消息上，
   *  使构造过程中能回看原图核对几何关系；同时供视觉核对交叉验证 */
  images?: string[];
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
  //    失败时（熔断/空响应放弃/异常）恢复到本轮开始前，给用户一个干净起点。
  //    （轮次耗尽为 incomplete：画布保留、不回滚，见 AgentLoopResult.incomplete）
  const agentSnapshot = await takeSnapshot(api);

  // ★ 续作缓存：上一轮轮次耗尽暂停时缓存了完整对话 → 本轮注入接力（尽可能利用缓存，
  //    原始请求与已尝试的工具序列不丢；peek 内部做 TTL + 画布指纹校验）
  const resumeMessages = peekAgentResumeCache(api);

  // ★ 历史陷阱注入：让 agent 回路吃到「失败轨迹 → 陷阱 → 提示」闭环（此前只有两阶段修复回路有）
  const traps = await refreshTraps().catch(() => [] as Awaited<ReturnType<typeof refreshTraps>>);
  const trapPrompt = buildTrapPrompt(traps);

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
      // ★ 原题图片透传：让 Agent 构造时能"看得到图"，而不是只凭视觉模型的二手文字转写
      images: opts?.images,
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
      // ★ 轮次耗尽续作：注入上一轮暂停时的对话缓存
      resumeMessages,
      // ★ 历史高频陷阱提示（追加到 system prompt 尾部）
      trapPrompt,
    });

    // ★ 失败回滚：AgentLoopResult.failed（熔断/空响应放弃）→ 恢复本轮开始前快照
    //    （轮次耗尽 = incomplete，画布保留不回滚，对话入续作缓存）
    if (result.failed && !deps.signal.aborted && agentSnapshot !== null) {
      const restored = await restoreSnapshot(deps.getApi() ?? api, agentSnapshot);
      if (restored) {
        rollbackHappened = true;
        console.log(`[AiGGB:DIAG] ${getTraceId()} agent 失败回滚：恢复本轮开始前快照`);
      }
    }

    // ★ 续作缓存维护：轮次耗尽 → 缓存完整对话供下轮接力；完成/失败 → 失效
    if (result.incomplete) {
      const apiNow = deps.getApi();
      agentResumeCache = {
        messages: result.messages,
        canvasObjCount: apiNow ? apiNow.getAllObjectNames().length : 0,
        ts: Date.now(),
      };
    } else {
      agentResumeCache = null;
    }
  } catch (err) {
    if (deps.signal.aborted) throw err;

    // 非中止异常 → 本轮回滚，续作缓存一并失效（旧上下文已与回滚后的画布不符）
    agentResumeCache = null;

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
  //    ⚠ 回滚提示只在「真的执行过工具」时给出：0 次工具调用说明画布从未被改动，
  //      此时提示"已回滚"会误导用户（配合 buildAgentSummary 的轮数/次数区分）
  //    ⚠ incomplete 轮不再附加暂停提示：agentLoop 的 finalText 已含全部三要素
  //      （已达上限/画布保留对象数/发后续指令可续作），再附加会出现同气泡双份暂停文案
  const summary = rollbackHappened && countToolCalls(result.messages) > 0
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
  let evalIssues: string[] = [];
  try {
    evalIssues = await evaluateAgentResult(result, deps, opts?.evalBasis);
  } catch (err) {
    if (deps.signal.aborted) throw err;
    console.warn("[Pipeline] agent 满足度评估跳过", err);
  }

  // ★ 未完成项入续作缓存：incomplete 轮的评估 issues 追加为缓存尾部 user 消息——
  //   续作轮压缩后仍落在 recent 窗口内，模型第一轮就知道剩余工作，省去重新探索
  if (result.incomplete && agentResumeCache && evalIssues.length > 0) {
    agentResumeCache = {
      ...agentResumeCache,
      messages: [
        ...agentResumeCache.messages,
        {
          role: "user",
          content: `[上一轮未完成项]\n${evalIssues.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n（用户发送续作指令时，请针对以上问题继续调整）`,
        },
      ],
    };
  }
}

/** 统计对话流中真实发生的工具调用次数（iterations 是循环轮数，含空响应/重试空转轮） */
function countToolCalls(messages: AgentLoopResult["messages"]): number {
  let n = 0;
  for (const m of messages) {
    if (m.role === "assistant" && m.tool_calls) n += m.tool_calls.length;
  }
  return n;
}

/** 从 AgentLoopResult 构建人类可读摘要 */
function buildAgentSummary(result: AgentLoopResult): string {
  const parts: string[] = [result.finalText];
  const toolCalls = countToolCalls(result.messages);

  if (result.iterations > 1) {
    parts.push(toolCalls > 0
      ? `（共 ${result.iterations} 轮 · ${toolCalls} 次工具调用）`
      : `（共 ${result.iterations} 轮，未能调用工具）`);
  }
  if (result.deniedTools.length > 0) {
    parts.push(`已拒绝：${result.deniedTools.join("、")}`);
  }

  return parts.join("\n");
}

/** 对 agent 模式执行完的结果做满足度评估，返回 issues（空数组 = 通过或评估失败跳过）。
 *  incomplete 轮的 issues 会被写入续作缓存，作为「上一轮未完成项」提示续作轮 */
async function evaluateAgentResult(result: AgentLoopResult, deps: PipelineDeps, evalBasis?: string): Promise<string[]> {
  const api = deps.getApi();
  if (!api) return [];

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
    return [];
  }

  if (evalResult.satisfied) return [];

  deps.appendMessage({
    id: deps.newMessageId(),
    role: "error",
    content: `⚠ 审查发现 ${evalResult.issues.length} 个问题：\n${evalResult.issues.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n${evalResult.summary}`
  });

  // agent 模式不自动修复（AI 已经在循环中尝试了），仅报告
  return evalResult.issues;
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
  // ★ 多图加 [图N] 标注：视觉模型看到多张无标注图片时，容易当作「同一张图的多个视角」
  images.forEach((img, i) => {
    if (images.length > 1) {
      parts.push({ type: "text", text: `[图${i + 1}]` });
    }
    parts.push({ type: "image_url", image_url: { url: img } });
  });

  const msgs: ChatMessage[] = [
    { role: "system", content: buildVisionExtractPrompt(deps.domain) },
    { role: "user", content: parts },
  ];

  const chatRawFn = deps.chatRawImpl ?? defaultChatRaw;
  const visionModel = deps.visionModel ?? deps.heavyModel;

  // ★ 识别调用跳过 thinking：感知任务无需深思考，避免 reasoning tokens 挤占输出预算。
  //   显式传 "none"（不再依赖 undefined 的隐式语义），意图与参数一致。
  const visionConfig = { ...deps.config, reasoningEffort: "none" as const };

  // ★ JSON 模式：多数视觉模型不支持 response_format:json_object，但支持该特性的
  //   provider（DeepSeek/GLM/OpenAI）开启后非 JSON 输出率显著下降。
  const useJsonMode = getProviderCapabilities(visionConfig).jsonSchema;

  // ★ 输出预算：首轮 4096，空响应重试扩容到 8192（同 agentLoop 思路：同参数重试无效）
  let raw = await chatRawFn(
    visionConfig, msgs, deps.signal, visionModel, 4096, useJsonMode, u => deps.onTokenUsage?.(u)
  );

  // 空响应重试：扩容 + 更强约束（改变条件，而非原样重试）
  if (!raw.trim()) {
    console.warn("[Pipeline] 题目识别空响应，扩容预算重试 1 次");
    raw = await chatRawFn(
      visionConfig, msgs, deps.signal, visionModel, 8192, useJsonMode, u => deps.onTokenUsage?.(u)
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

  /**
   * 纯图识别失败时向用户反问（而不是只丢一条 error 就结束本轮）。
   */
  const askForTextFallback = (reason: string, hint: string): void => {
    deps.appendMessage({
      id: deps.newMessageId(),
      role: "error",
      content: `${reason}${hint ? ` ${hint}` : ""}`,
    });
    deps.appendAIResponse({
      explanation: "需要你的帮助才能继续",
      commands: [],
      ask: "我没能可靠地读出这张图里的题目。你可以：① 换一张更清晰/更正对拍摄的图片重试；" +
           "② 直接在输入框用文字描述题目（例如「画出斜抛运动，v₀=20 m/s，仰角 45°」），我就能开始绘制。",
    }, []);
  };

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
        // ★ 降级仍把原图带上：Agent 若能直接看图还有机会画对
        await runAgentRound(text, deps, cb, { images });
      } else {
        askForTextFallback(`识别失败：${reason}`, "请在 设置 → 高级 中确认已配置支持图片输入的视觉模型。");
      }
      return;
    }

    if (!problem) {
      const truncHint = truncated ? "（输出被截断，请尝试更清晰的图片或简化题目后重试）" : "";
      if (text.trim()) {
        deps.appendMessage({
          id: deps.newMessageId(),
          role: "error",
          content: `题目识别失败${truncHint || "（无法解析输出）"}，将直接按文字绘制`,
        });
        await runAgentRound(text, deps, cb, { images });
      } else {
        askForTextFallback(
          truncated ? "识别输出不完整（可能被截断）。" : "识别失败：请在 设置 → 高级 中配置支持图片的视觉模型。",
          ""
        );
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
      // ★ 同样透传原图：无 UI 时也保留"看图构造"的能力
      await runAgentRound(taskText, deps, cb, { images });
      return;
    }

    // 取消与异常统一向上抛：runRound 的 finally 统一释放锁，wasAborted() 静默吞 AbortError
    const decision = await waitProblemReview(problem, deps.signal, h => cb.onProblemReview!(h, reviewId));

    if (decision.action === "retry") {
      deps.removeMessage(reviewId);
      continue; // re-run recognition
    }

    // confirmed
    deps.updateProblemReview?.(reviewId, decision.problem, "confirmed");
    const basis = serializeProblem(decision.problem);
    const taskText = [text.trim(), basis].filter(Boolean).join("\n\n");

    // ★ Agent 构造 + 画布状态核对（文本结构核对 + 截图视觉核对，两路失败均不阻断）
    await runAgentRound(taskText, deps, cb, {
      images,
      stateCheck: {
        basis,
        check: async (snapshot, signal) => {
          const evalFn = deps.evalSatisfactionImpl ??
            ((await import("./satisfactionEval")).evaluateSatisfaction as typeof import("./satisfactionEval").evaluateSatisfaction);
          try {
            const textResult = await evalFn(deps.config, basis, snapshot, signal, deps.lightModel, undefined, u => deps.onTokenUsage?.(u));

            // ★ 视觉核对：画布截图（exportPNG）+ 视觉模型。截图能力缺失（Node 单测 mock /
            //    回调式构建返回空）→ 跳过，仅保留文本核对结果
            let visualIssues: string[] = [];
            let visualSummary = "";
            try {
              const api = deps.getApi();
              const pngDataUrl = api ? exportPNG(api) : null;
              const base64Body = pngDataUrl?.split(",")[1] ?? "";
              if (pngDataUrl && base64Body.length > 100) {
                const visualFn = deps.evalVisualImpl ??
                  ((await import("./satisfactionEval")).evaluateVisual as typeof import("./satisfactionEval").evaluateVisual);
                const visual = await visualFn(
                  deps.config, basis, pngDataUrl, signal,
                  deps.visionModel ?? deps.heavyModel, undefined, u => deps.onTokenUsage?.(u),
                  // ★ 交叉验证：原题图片 vs 画布截图
                  images
                );
                visualIssues = visual.satisfied ? [] : visual.issues.map(s => `[视觉] ${s}`);
                visualSummary = visual.summary;
              }
            } catch (err) {
              if (signal.aborted) throw err;
              console.warn("[Pipeline] 视觉核对跳过（无截图能力或调用失败）", err);
            }

            const issues = [...(textResult.satisfied ? [] : textResult.issues), ...visualIssues];
            return {
              satisfied: issues.length === 0,
              issues,
              summary: visualSummary ? `${textResult.summary}｜视觉：${visualSummary}` : textResult.summary,
            };
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
