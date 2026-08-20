/**
 * ReAct Agent Loop —— 工具调用驱动的对话循环
 *
 * 模式：observe（AI 收到消息 + 画布状态）→ plan（AI 决定调用哪些工具）→
 *       act（执行工具并返回结果）→ observe → … → 最终文本回复
 *
 * 架构借鉴 Claude Code 的代理式设计：
 *   - 每轮 AI 可选择：回复文本（结束）或调用工具（继续）
 *   - 工具执行结果作为 observation 注入下一轮
 *   - dangerous 工具需用户确认
 *   - 最大迭代次数防止无限循环
 */

import {
  agentChat as defaultAgentChat,
  AIError,
  getProviderQuirks,
  type AIConfig,
  type AgentMessage,
  type AgentResponse,
  type ToolCallDelta
} from "./aiClient";
import { TOOL_DEFINITIONS, getToolSafety, isKnownTool, TOOL_SCHEMAS, buildToolCategoryOverview } from "./tools";
import {
  executeToolCall as defaultExecuteToolCall,
  executeToolCalls as defaultExecuteToolCalls,
  type ToolCallRequest,
  type ToolResult
} from "./toolExecutor";
import type { GGBAppletApi } from "../types/ggb";
import type { Domain } from "./prompts";
import type { ChatTurn } from "../store/useAppStore";
import { getTraceId } from "./runControl";
import { buildTrajectoryRecord, type TrajectoryRecord } from "./trajectoryStore";

// ──── 常量 ────

/** 最大工具调用迭代次数（防止无限循环） */
export const MAX_AGENT_ITERATIONS = 30;

/** 连续工具失败熔断阈值（连续 N 轮执行全失败即停止重试，避免无效轮转） */
export const MAX_CONSECUTIVE_FAILURES = 3;

/** 用户拒绝工具调用时返回给 AI 的错误文案（熔断统计据此排除"拒绝"场景） */
const USER_DENIED_MSG = "用户拒绝了此操作";

// ──── 类型 ────

/** 单次工具调用确认请求 */
export interface ConfirmationRequest {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  description: string; // 人类可读描述
}

/** 确认决策 */
export type ConfirmationDecision =
  | { action: "approve"; toolCallId: string }
  | { action: "deny"; toolCallId: string }
  | { action: "approve_all" }; // 信任此会话

/** agent loop 对宿主的依赖 */
export interface AgentLoopDeps {
  config: AIConfig;
  domain: Domain;
  appMode: "2d" | "3d";
  signal: AbortSignal;
  getApi(): GGBAppletApi | null;
  /** 获取历史消息（多轮对话上下文） */
  getMessages(): ChatTurn[];
  /** 流式展示 AI 的中间思考（可选） */
  onThinking?(message: string): void;
  /** 每次 AI 调用的 token 用量回传（累计到 UI 统计） */
  onTokenUsage?(usage: { prompt: number; completion: number }): void;
  /** Agent 模式专用模型名（已解析，含回退链） */
  agentModel: string;
  // ── 可注入依赖（测试用 mock 替换，生产环境使用默认实现） ──
  /** AI 流式调用（含 Function Calling）。注入以支持单测 mock。 */
  agentChatImpl?: typeof defaultAgentChat;
  /** 单工具执行器。注入以支持单测 mock。 */
  executeToolCallImpl?: typeof defaultExecuteToolCall;
  /** 批量工具执行器。注入以支持单测 mock。 */
  executeToolCallsImpl?: typeof defaultExecuteToolCalls;
  /** 记录 ReAct 轨迹（IndexedDB 持久化，供训练数据闭环 / 失败回放）。不注入则跳过。 */
  persistTrajectory?: (rec: TrajectoryRecord) => void;
}

/** agent loop 执行结果 */
export interface AgentLoopResult {
  /** AI 的最终文本回复 */
  finalText: string;
  /** 完整对话历史（含所有工具调用和结果） */
  messages: AgentMessage[];
  /** 执行了多少轮迭代 */
  iterations: number;
  /** 被拒绝的工具调用详情 */
  deniedTools: string[];
  /** 是否失败（熔断 / 超限 / 空响应放弃）。pipeline 据此决定快照回滚 */
  failed?: boolean;
}

// ──── 确认回调（由 UI 层注入） ────

let _confirmFn:
  | ((requests: ConfirmationRequest[]) => Promise<ConfirmationDecision[]>)
  | null = null;

/** 注册确认回调（ChatPanel 调用前注入） */
export function registerConfirmationHandler(
  fn: (requests: ConfirmationRequest[]) => Promise<ConfirmationDecision[]>
): void {
  _confirmFn = fn;
}

/** 取消注册确认回调（agent loop 结束后清理） */
export function unregisterConfirmationHandler(): void {
  _confirmFn = null;
}

// ──── System Prompt 构建 ────

function buildAgentSystemPrompt(domain: Domain, appMode: "2d" | "3d", canvasEmpty: boolean, maxToolsPerTurn?: number): string {
  const modeHeader = appMode === "3d"
    ? `【3D 三维模式】使用 (x,y,z) 坐标。Cube/Sphere/Tetrahedron/IntersectPath/Surface 等 3D 命令需走 eval_raw。SetViewDirection/SetCaption/SetFilling/SetPointSize/SetAxesRatio/ZoomIn 在纯 3D applet 中不可用。Cross(u,v) 返回自由 Vector → 用 end=O+wVec; Vector(O,end) 两步法。`
    : `【2D 平面模式】使用 (x,y) 坐标，禁止 z 轴和 3D 几何命令。`;

  const physicsSection = domain === "physics"
    ? `\n【物理域】默认值：g=9.8 m/s²、单摆 L=1 θ₀=π/6、斜抛 v₀=20 θ=π/4、圆周 r=2 ω=1。配色：位移#1e88e5、速度#43a047、加速度#fb8c00、力#e53935、电场#8e24aa、磁场#00897b。注入常量用 physics_constants 工具。`
    : "";

  // ★ 画布为空：完整示例引导；画布非空：增量修改模式，跳过示例省 token
  const canvasGuide = canvasEmpty
    ? `【完整 Walkthrough 示例 — 模仿此模式】
用户："斜抛运动 v0=20 m/s 仰角 45°"
→ 第 1 步：直接开始，注入物理常量
  调用：physics_constants({names: ["g"]})
  → 观察："物理常量已注入：g"
→ 第 2 步：创建 3 个滑块（一次调用 3 个安全工具）
  调用：create_slider({name:"v0",min:1,max:50,step:1,value:20,unit:"m/s",label:"初速"})
  调用：create_slider({name:"theta",min:0,max:1.5708,step:0.01,value:0.785,unit:"rad",label:"仰角"})
  调用：create_slider({name:"t",min:0,max:5,step:0.02,value:0,unit:"s",label:"时间"})
  → 观察：全部成功
→ 第 3 步：创建质点
  调用：create_function({name:"Px",expression:"v0*cos(theta)*t"})
  调用：create_function({name:"Py",expression:"v0*sin(theta)*t-0.5*g*t^2"})
  调用：create_point({name:"P",x:"Px(t)",y:"Py(t)"})
  → 观察：全部成功
→ 第 4 步：速度矢量 + 轨迹 + 坐标轴 + 动画
  调用：create_vector({name:"vArrow",from:"P",to:"P+(v0*cos(theta)/5,v0*sin(theta)-g*t)/5",color:"#43a047"})
  调用：create_trace({target:"P",mode:"trail"})
  调用：set_unit_axes({xUnit:"m",yUnit:"m"})
  → 观察：全部成功
→ 第 5 步：视窗 + 启动动画
  调用：set_view({xmin:-2,xmax:50,ymin:-2,ymax:20})
  调用：set_animation({target:"t",action:"start",speed:0.5,repeat:"increasing"})
  → 最终回复："斜抛运动构造完成 ✓ P 点自动运动 + 拖尾轨迹 + 速度矢量。拖动 v0/θ 滑块可实时调整参数。"`
    : `【增量修改模式】画布已有对象，请直接分析需求并修改。非必要不调用 list_objects/get_object_info——从用户消息中的 [当前画布已有对象] 即可知悉画布状态。优先在现有对象上修改（set_style/set_animation/delete_object），而非清空重建。`;

  return `你是 AiGGB 图形构造代理，通过逐步调用工具在 GeoGebra 画布上创建或修改交互式数学/物理图形。

${modeHeader}${physicsSection}

【核心原则】
- ★ 收到需求后立即调用工具，不要先输出大段分析。
- ★ 每轮只做 1~2 件事，用工具执行结果验证，而非文字推测。
- ★ 构造完成后用 1-2 句话简短总结。

${canvasGuide}

【关键规则】
- ★ 单次调用 1~${maxToolsPerTurn ?? 4} 个工具（${maxToolsPerTurn ?? 4} 个以内），不要一次大量调用。${maxToolsPerTurn ? ` 该 provider 单轮工具上限为 ${maxToolsPerTurn}，超出可能被丢弃。` : ""}
- ★${canvasEmpty ? " 创建对象前先确认依赖对象是否存在（list_objects 或 get_object_info）。" : " 画布已有对象可从用户消息中获取，不必额外探测。仅在不确定对象定义时才用 get_object_info。"}
- ★ 工具失败时读 error 字段，调整后重试（≤3 次）。连续失败 3 次以上的操作放弃并输出文本总结。
- ★ 动态构造用 create_function（如 "v0*cos(theta)*t"）而非 create_point 中写死数值。
- ★ 复杂操作（3D 几何体、IntersectPath、Surface）用 eval_raw（需用户确认）。
- ★ 完成后用 set_animation + set_view 启动动画和调整视窗。

【GGB 陷阱】
- Point+Point → ❌ 崩。位移量用 Vector((0,0),(dx,dy)) 或 create_vector 工具。
- 大写 A~Z = Point 类型，禁止用作数值。u/v/w = Vector 类型，禁止用作标量。
- 分母含距离平方必须 +0.001 防除零。
- 3D 禁止：SetViewDirection/SetFilling/SetPointSize/SetAxesRatio/SetCaption/ZoomIn。
- SetColor r/g/b 必须 0~255 整数。

【工具分组速览（按需选用，非全部必用）】
${buildToolCategoryOverview()}

【命名约定】
- 点：大写 A,B,C；滑块：小写 t,v0,theta；矢量：带 Vec/Arrow 后缀
- 标识符仅 ASCII 字母数字下划线，禁止中文变量名。`;
}

// ──── 主循环 ────

/**
 * 运行 ReAct agent loop：接收用户输入，通过工具调用逐步构造图形。
 * 返回 AI 的最终文本回复和完整对话历史。
 */
export async function runAgentLoop(
  userText: string,
  deps: AgentLoopDeps
): Promise<AgentLoopResult> {
  // ★ 画布就绪检查 + 初始状态（用 initialApi，循环内每轮再重新获取最新句柄）
  const initialApi = deps.getApi();
  if (!initialApi) {
    throw new AIError("GeoGebra 画布尚未就绪");
  }

  // 当前画布状态（需在 buildAgentSystemPrompt 之前声明——后者依赖画布是否为空调整 prompt）
  const initialObjs = initialApi.getAllObjectNames();

  // ★ DeepSeek 适配: user-role 指令遵从度显著高于 system-role
  //    在首条 user message 前拼接指令前缀，强制优先工具调用而非输出分析文本
  const quirks = getProviderQuirks(deps.config);
  // ★ 是否回传 reasoning_content：仅 provider 明确要求时（V4）。其他 provider 无该字段，回传即 no-op
  const roundtripReasoning = quirks.mustRoundtripReasoning === true;

  const systemPrompt = buildAgentSystemPrompt(deps.domain, deps.appMode, initialObjs.length === 0, quirks.maxToolsPerTurn);

  const userPrefix = quirks.agentForceUserPrefix
    ? "[指令] 本任务使用工具调用模式。每收到一条消息必须立即调用工具。禁止先输出分析/规划再调用工具——工具调用优先于文字分析。用工具执行结果验证，而非文字推测。\n\n"
    : "";

  // ★ 多轮对话上下文：将历史 ChatTurn 转为 AgentMessage
  const historyMsgs = convertHistory(deps.getMessages());
  deps.onThinking?.("正在分析需求…");

  // 当前画布状态（initialObjs 已在上面声明，此处复用）
  const canvasStatus = initialObjs.length > 0
    ? `\n[当前画布已有对象：${initialObjs.join(", ")}]`
    : "\n[当前画布为空]";

  let messages: AgentMessage[] = [
    { role: "system", content: systemPrompt },
    ...historyMsgs,
    { role: "user", content: userPrefix + userText + canvasStatus }
  ];

  const agentChatFn = deps.agentChatImpl ?? defaultAgentChat;
  const executeToolCallFn = deps.executeToolCallImpl ?? defaultExecuteToolCall;
  const executeToolCallsFn = deps.executeToolCallsImpl ?? defaultExecuteToolCalls;

  const deniedTools: string[] = [];
  let finalText = "";
  let iterations = 0;
  let failed = false;         // ★ 失败标记（熔断/超限/空响应放弃）——pipeline 据此回滚快照
  let approveAll = false; // ★ 信任会话标志，闭环内持久
  let consecutiveFailures = 0; // ★ 连续工具执行失败计数（熔断）
  let forceStop = false;      // ★ 熔断后禁止继续工具调用
  let emptyResponseRetried = false; // ★ 空响应重试标志（仅重试 1 次）

  while (iterations < MAX_AGENT_ITERATIONS) {
    // 检查中断
    if (deps.signal.aborted) {
      throw new DOMException("The operation was aborted.", "AbortError");
    }

    iterations++;

    deps.onThinking?.(`第 ${iterations} 步：正在规划…`);

    // ★ 每轮重新获取 api 句柄——长跑期间 DockGlassPane 心跳可能重建 applet，旧句柄失效
    const api = deps.getApi();
    if (!api) {
      throw new AIError("GeoGebra 画布已重建，本轮运行中止");
    }

    // ★ 智能压缩：定期将旧消息替换为画布状态摘要，防止长对话上下文爆炸
    //    （压缩阈值随 provider 上下文窗口缩放——V4 1M 下不频繁压缩）
    const compressParams = getCompressParams(quirks.contextWindow);
    messages = compressHistory(messages, api, iterations, compressParams);

    // 截断历史（保留 system + 最近 N 条，保证 tool_calls/tool 配对完整）
    const truncated = truncateHistory(messages, getHistoryWindow(quirks.contextWindow));

    // 调用 AI（流式：content 增量经 onThinking 实时展示；V4 reasoning 增量经 🧠 展示）
    let response: AgentResponse;
    try {
      // ★ V4 thinking 实时展示：累积推理增量（截尾 400 字符），经 onThinking 显示"🧠 思考中…"
      let reasoningPreview = "";
      response = await agentChatFn(
        deps.config, truncated, TOOL_DEFINITIONS, deps.signal, deps.agentModel,
        text => deps.onThinking?.(text),
        (delta) => {
          reasoningPreview = (reasoningPreview + delta).slice(-400);
          deps.onThinking?.(`🧠 ${reasoningPreview}`);
        }
      );
      // ★ token 统计：每轮 agent 调用累计到 UI
      if (response.usage) deps.onTokenUsage?.(response.usage);
    } catch (err) {
      if (err instanceof AIError) throw err;
      throw new AIError(`Agent 调用失败 (iter ${iterations})`, err);
    }

    // 熔断后 AI 若仍要调工具 → 直接中止
    if (forceStop && response.toolCalls.length > 0) {
      finalText = `连续 ${MAX_CONSECUTIVE_FAILURES} 轮工具调用失败，构造中止。`;
      failed = true;
      break;
    }

    // 情况 1：纯文本回复 → 结束
    if (!response.toolCalls.length && response.content) {
      finalText = response.content;
      messages.push({ role: "assistant", content: response.content, reasoning_content: roundtripReasoning ? response.reasoningContent : undefined });
      emptyResponseRetried = false; // 成功后复位
      break;
    }

    // 情况 2：无文本也无工具调用 → 诊断 + 重试 1 次
    if (!response.toolCalls.length) {
      console.warn(
        `[agentLoop] ${getTraceId()} 第${iterations}轮空响应: finishReason=${response.finishReason || "无"}, ` +
        `contentLen=${response.content?.length ?? 0}, msgCount=${messages.length}`
      );

      if (!emptyResponseRetried) {
        emptyResponseRetried = true;
        // ★ 仅当 provider 的 finish_reason 可靠时才信任 "length" 截断提示（DeepSeek 流式偶发缺失）
        const truncated = response.finishReason === "length" && quirks.streamsFinishReason === true;
        const reasonHint = truncated
          ? "[系统] 你的上一条回复因长度限制被截断（max_tokens 不足）。请缩短输出或分步执行。继续构造或输出文本总结。"
          : "[系统] 请继续：调用下一步工具完成构造，或输出文本总结当前画布状态。不要返回空响应。";
        messages.push({ role: "user", content: reasonHint });
        continue;
      }

      // 重试后仍空 → 放弃，输出诊断信息
      const truncated = response.finishReason === "length" && quirks.streamsFinishReason === true;
      const diag = truncated
        ? "（输出超长被截断，可尝试增加 max_tokens 或简化构造）"
        : response.finishReason === "content_filter"
        ? "（内容被安全过滤拦截）"
        : `（finish_reason=${response.finishReason || "无"}，模型未生成有效输出，请检查 Agent 模型是否支持 Function Calling）`;
      finalText = `AI 未返回有效响应${diag}`;
      failed = true;
      break;
    }

    // 情况 3：有工具调用 → 分类处理
    const toolCalls = response.toolCalls;

    // ★ 过滤未知工具（AI hallucinate 的不存在的工具名）：
    //    直接返回错误给 AI，不执行、不走用户确认
    const knownCalls = toolCalls.filter(tc => isKnownTool(tc.function.name));
    const unknownCalls = toolCalls.filter(tc => !isKnownTool(tc.function.name));

    const safeCalls: ToolCallDelta[] = [];
    const dangerousCalls: ToolCallDelta[] = [];

    for (const tc of knownCalls) {
      if (getToolSafety(tc.function.name) === "dangerous") {
        dangerousCalls.push(tc);
      } else {
        safeCalls.push(tc);
      }
    }

    // 添加 assistant 消息（含全部 tool_calls，保证 tool_call_id 配对完整）
    messages.push({
      role: "assistant",
      content: response.content,
      tool_calls: toolCalls,
      reasoning_content: roundtripReasoning ? response.reasoningContent : undefined
    });

    // 未知工具错误注入（在 assistant 之后，满足 API 消息顺序要求）
    for (const tc of unknownCalls) {
      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify({
          success: false,
          error: `未知工具 "${tc.function.name}"——此工具不存在。请使用已定义的工具。可用: ${Object.keys(TOOL_SCHEMAS).slice(0, 14).join(", ")}…`
        })
      });
    }

    // ★ 全是未知工具：错误已反馈给 AI，跳过执行直接下一轮
    if (knownCalls.length === 0) {
      consecutiveFailures = 0; // 未实际执行，不计入熔断
      continue;
    }

    // 先执行安全工具
    const toolNames = [...safeCalls, ...dangerousCalls].map(tc => tc.function.name);
    deps.onThinking?.(`执行工具：${toolNames.join(", ")}`);
    const safeResults = executeSafeTools(api, safeCalls, deps.appMode, executeToolCallsFn);
    for (const r of safeResults) {
      messages.push(r);
    }

    // 危险工具 → 确认（pass approveAll for session-level trust）
    let dangerousResults: ToolResult[] = [];
    const deniedBefore = deniedTools.length; // ★ 本轮被拒基线（全拒绝判定用）
    if (dangerousCalls.length > 0) {
      if (approveAll) {
        // 信任已激活，跳过确认直接执行
        dangerousResults = executeDangerousTools(api, dangerousCalls, executeToolCallFn);
      } else {
        deps.onThinking?.("等待确认…");
        const { results, newApproveAll } = await handleDangerousTools(
          api, dangerousCalls, deniedTools, approveAll, executeToolCallFn
        );
        approveAll = newApproveAll;
        dangerousResults = results;
      }
      for (const r of dangerousResults) messages.push(r);
    }
    const deniedThisRound = deniedTools.length - deniedBefore;

    // ★ 本轮有实质工具调用（非空响应），复位空响应重试标志
    //    否则跨轮残留：空响应→retry 成功→flag 仍为 true→下次空响应跳过 retry
    emptyResponseRetried = false;

    // ★ 本轮全是危险工具且全部被拒 → 引导 AI 换安全工具
    //    （用"本轮被拒数"而非累计 deniedTools.length，避免跨轮累积误触发）
    if (toolCalls.length > 0 &&
        dangerousCalls.length === toolCalls.length &&
        deniedThisRound >= dangerousCalls.length) {
      messages.push({
        role: "user",
        content: "以上工具调用均被用户拒绝。请尝试用其他安全工具完成构造，或直接回复说明无法继续。"
      });
    }

    // ★ 连续失败熔断：本轮所有实际执行全部失败（用户拒绝不计）→ 计数 +1，否则清零
    //    改造二：区分「参数问题」（Zod 校验失败 / Pre-flight 预检失败）与「执行失败」。
    //    参数问题是模型下一轮大概率修正的（如负半径、min>=max、引用不存在对象），
    //    不计入熔断——否则参数写错 3 次就熔断，浪费了模型自我修正的机会。
    const PARAM_ERROR_RE = /^参数校验失败：/;
    const PREFLIGHT_ERROR_RE = /^执行前检查失败：/;
    const allResults = [...safeResults, ...dangerousResults];
    const executed = allResults.map(r => {
      try {
        const p = JSON.parse(r.content) as { success?: boolean; error?: string };
        const error = p.error ?? "";
        return {
          denied: error === USER_DENIED_MSG,
          // 可修正：模型参数写错，下一轮大概率自行修正
          recoverable: PARAM_ERROR_RE.test(error) || PREFLIGHT_ERROR_RE.test(error),
          failed: p.success === false,
        };
      } catch {
        return { denied: false, recoverable: false, failed: true };
      }
    }).filter(s => !s.denied);

    if (executed.length > 0) {
      const hard = executed.filter(s => !s.recoverable); // 真正的执行失败
      if (hard.length === 0) {
        // 本轮失败全是参数问题 → 模型可修正，清零熔断
        consecutiveFailures = 0;
      } else {
        consecutiveFailures = hard.every(s => s.failed) ? consecutiveFailures + 1 : 0;
      }
    }
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      finalText = `连续 ${MAX_CONSECUTIVE_FAILURES} 轮工具调用失败，构造中止。`;
      messages.push({
        role: "user",
        content: `检测到连续 ${MAX_CONSECUTIVE_FAILURES} 轮工具调用失败。请立即停止调用工具，用文字总结当前画布状态和失败原因。`
      });
      forceStop = true;
    }
  }

  if (iterations >= MAX_AGENT_ITERATIONS) {
    finalText = `已达到最大迭代次数 (${MAX_AGENT_ITERATIONS})，构造可能不完整。`;
    failed = true;
  }

  // ★ 改造五：记录 ReAct 轨迹（成功/失败均记录，供训练数据闭环 + 失败回放）
  //    persistTrajectory 由 pipeline 注入默认实现（IndexedDB）；测试可 mock 断言
  const record = buildTrajectoryRecord(userText, { finalText, messages, iterations, deniedTools });
  deps.persistTrajectory?.(record);

  return { finalText, messages, iterations, deniedTools, failed };
}

// ──── 安全工具执行 ────

function executeSafeTools(
  api: GGBAppletApi,
  calls: ToolCallDelta[],
  appMode: "2d" | "3d" | undefined,
  executeToolCallsFn: typeof defaultExecuteToolCalls
): ToolResult[] {
  const requests: ToolCallRequest[] = calls.map(tc => ({
    id: tc.id,
    name: tc.function.name,
    arguments: safeParseJSON(tc.function.arguments, tc.function.name)
  }));
  return executeToolCallsFn(api, requests, appMode);
}

/** 信任激活后直接执行危险工具，无需确认 */
function executeDangerousTools(
  api: GGBAppletApi,
  calls: ToolCallDelta[],
  executeToolCallFn: typeof defaultExecuteToolCall
): ToolResult[] {
  const requests: ToolCallRequest[] = calls.map(tc => ({
    id: tc.id,
    name: tc.function.name,
    arguments: safeParseJSON(tc.function.arguments, tc.function.name)
  }));
  return requests.map(req => executeToolCallFn(api, req));
}

// ──── 危险工具处理 ────

async function handleDangerousTools(
  api: GGBAppletApi,
  calls: ToolCallDelta[],
  deniedTools: string[],
  approveAll: boolean,
  executeToolCallFn: typeof defaultExecuteToolCall
): Promise<{ results: ToolResult[]; newApproveAll: boolean }> {
  const requests: ToolCallRequest[] = calls.map(tc => ({
    id: tc.id,
    name: tc.function.name,
    arguments: safeParseJSON(tc.function.arguments, tc.function.name)
  }));

  // 构建确认请求
  const confirmRequests: ConfirmationRequest[] = requests.map(req => ({
    toolCallId: req.id,
    toolName: req.name,
    args: req.arguments,
    description: describeToolCall(req.name, req.arguments)
  }));

  // 调用确认处理器
  if (!_confirmFn) {
    for (const cr of confirmRequests) {
      deniedTools.push(cr.toolName);
    }
    return {
      results: confirmRequests.map(cr => ({
        tool_call_id: cr.toolCallId,
        role: "tool" as const,
        content: JSON.stringify({ success: false, error: "操作需要用户确认，但确认处理器未注册" })
      })),
      newApproveAll: approveAll
    };
  }

  const decisions = await _confirmFn(confirmRequests);

  // ★ 按 toolCallId 匹配决策，而非按下标索引——UI 返回的决策顺序/条数可能与请求不一致，
  //   按下标会导致 requests[i] 越界崩溃。
  const decisionMap = new Map<string, ConfirmationDecision>();
  let approveAllRequested = false;
  for (const d of decisions) {
    if (d.action === "approve_all") {
      approveAllRequested = true;
    } else {
      decisionMap.set(d.toolCallId, d);
    }
  }

  const results: ToolResult[] = [];
  let newApproveAll = approveAll;

  for (const req of requests) {
    if (newApproveAll) {
      results.push(executeToolCallFn(api, req));
      continue;
    }

    const decision = decisionMap.get(req.id);
    // 「信任此会话」：当前及后续请求全部放行（首个无显式决策的请求触发信任）
    if (approveAllRequested && (!decision || decision.action !== "deny")) {
      newApproveAll = true;
      results.push(executeToolCallFn(api, req));
      continue;
    }

    if (!decision || decision.action === "deny") {
      deniedTools.push(req.name);
      results.push({
        tool_call_id: req.id,
        role: "tool",
        content: JSON.stringify({
          success: false,
          error: decision ? USER_DENIED_MSG : "未收到确认决策"
        })
      });
      continue;
    }

    // decision.action === "approve"
    results.push(executeToolCallFn(api, req));
  }

  return { results, newApproveAll };
}

// ──── 工具 ────

/** 生成人类可读的工具调用描述 */
function describeToolCall(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case "eval_raw":
      return `执行原始命令：${args.command}`;
    case "eval_sequence":
      return `创建序列：${args.name || "?"}`;
    case "delete_object":
      return `删除对象：${args.target}`;
    case "clear_canvas":
      return "清空整个画布（不可撤销）";
    case "create_function":
      return `创建函数/表达式：${args.name} = ${String(args.expression).slice(0, 60)}`;
    case "create_parametric":
      return `创建参数曲线：${args.name}`;
    case "create_point":
      return `创建点：${args.name}(${args.x}, ${args.y})`;
    case "create_slider":
      return `创建滑块：${args.name} ${args.min}~${args.max}`;
    default:
      return `${name}(${JSON.stringify(args).slice(0, 100)})`;
  }
}

/** 安全解析 JSON 参数，失败时返回含错误信息的对象供 AI 自行修正 */
function safeParseJSON(json: string, toolName?: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  } catch (e) {
    // 解析失败时记录原始片段，toolExecutor 的 Zod 校验会给出具体错误
    const preview = json.length > 100 ? json.slice(0, 100) + "…" : json;
    console.warn(`[agentLoop] ${getTraceId()} ${toolName || "?"} JSON 解析失败: ${preview}`);
    return { _parse_error: true, _raw: preview };
  }
}

/** 将 ChatTurn[] 转换为 AgentMessage[] 作为多轮上下文 */
function convertHistory(turns: ChatTurn[]): AgentMessage[] {
  const msgs: AgentMessage[] = [];
  const WINDOW = 12; // 保留最近 N 条消息
  const recent = turns.slice(-WINDOW);

  for (const t of recent) {
    if (t.role === "user") {
      msgs.push({ role: "user", content: t.content });
    } else if (t.role === "assistant") {
      // agent 模式的 assistant 消息：包含 explanation + pseudo commands
      const explanation = t.payload.explanation || "";
      const cmdText = t.payload.commands
        .filter(c => c.op === "eval")
        .map(c => (c as { cmd: string }).cmd)
        .filter(c => !c.startsWith("// [")) // 跳过伪命令注释
        .map(c => c.replace(/^\p{Extended_Pictographic}\s*/u, "")) // 去掉 agent 摘要的 emoji 前缀（如 "📍 A(1,2)" → "A(1,2)"）
        .join("; ");
      const content = cmdText
        ? `${explanation}\n[已执行：${cmdText.slice(0, 200)}]`
        : explanation;
      if (content.trim()) {
        msgs.push({ role: "assistant", content });
      }
    } else if (t.role === "ask") {
      msgs.push({ role: "assistant", content: `[AI 反问] ${t.payload.question}` });
    }
    // error / spec-review 不进历史
  }
  return msgs;
}

// ──── 上下文压缩 ────

interface CompressParams {
  threshold: number;   // 消息数超过此值触发压缩
  interval: number;    // 每 N 轮压缩一次
  keepRecent: number;  // 压缩后保留最近 N 条消息
}

/**
 * 按 provider 上下文窗口缩放压缩参数。
 * V4 = 1M context → 保留更多消息（压缩不那么激进）；小上下文（Ollama 等）→ 收紧。
 */
function getCompressParams(contextWindow?: number): CompressParams {
  const scale = contextWindow && contextWindow >= 500_000 ? 5 : 1;
  return {
    threshold: 40 * scale,     // V4: 200 条才触发；默认: 40
    interval: 8 * scale,       // V4: 每 40 轮；默认: 每 8 轮
    keepRecent: 12 * scale,    // V4: 保留 60 条；默认: 12
  };
}

/** agent 模式历史窗口（截断兜底），同样按 context 缩放 */
function getHistoryWindow(contextWindow?: number): number {
  return contextWindow && contextWindow >= 500_000 ? 200 : 40;
}

/**
 * 智能压缩对话历史：当消息积累过多时，将旧消息替换为画布状态摘要。
 * 从实际 GGB API 获取当前画布对象列表（而非从消息历史重建），准确且便宜。
 *
 * 压缩策略：
 *   - 保留 system prompt + 原始用户请求 → 不丢任务意图
 *   - 插入画布状态快照（对象名/类型/定义）→ 保留"当前有什么"
 *   - 保留最近 N 条消息 → 保留最新操作上下文
 *   - 丢弃中间冗余的工具调用/结果对
 *
 * 返回压缩后的消息数组（原地不修改原数组）。
 */
function compressHistory(
  messages: AgentMessage[],
  api: GGBAppletApi,
  iterations: number,
  params: CompressParams
): AgentMessage[] {
  if (messages.length < params.threshold) return messages;
  if (iterations % params.interval !== 0) return messages;

  // ★ 从 GGB 获取真实画布状态（比从消息历史重建更准确）
  const allNames = api.getAllObjectNames();
  let summary: string;
  if (allNames.length === 0) {
    summary = "[画布状态] 当前画布为空（无对象）。";
  } else {
    const details = allNames.slice(0, 40).map(name => {
      try {
        const type = api.getObjectType(name);
        const cmd = api.getCommandString(name);
        return `${name}(${type}): ${cmd}`;
      } catch {
        return `${name}`;
      }
    });
    const suffix = allNames.length > 40
      ? `\n… 等共 ${allNames.length} 个对象`
      : `（共 ${allNames.length} 个）`;
    summary = `[画布状态快照 — 第 ${iterations} 轮]\n${details.join("\n")}${suffix}`;
  }

  // 保留：system(0)、原始用户消息(1 或 2)、摘要、最近 N 条
  const system = messages[0];
  const userRequest = messages[1]; // 含 userPrefix + userText + canvasStatus
  const recentStart = Math.max(2, messages.length - params.keepRecent);
  const recent = messages.slice(recentStart);

  // 修复可能的消息配对断裂（recent 开头可能是孤立的 tool 消息）
  const paired = fixPairingBoundary([...recent]);

  console.log(
    `[agentLoop] ${getTraceId()} 历史压缩: ${messages.length} → ${3 + paired.length} ` +
    `(画布 ${allNames.length} 个对象, iter=${iterations})`
  );

  return [system, userRequest, { role: "user", content: summary }, ...paired];
}

/**
 * 修复消息数组开头的配对问题：移除开头孤立的 tool 消息（缺少 assistant(tool_calls)），
 * 移除末尾悬空的 assistant(tool_calls)（缺少 tool 响应）。
 */
function fixPairingBoundary(msgs: AgentMessage[]): AgentMessage[] {
  // 收集所有 assistant(tool_calls) 的 tool_call_id
  const pending = new Set<string>();
  const resolved = new Set<string>();
  for (const m of msgs) {
    if (m.role === "assistant" && m.tool_calls) {
      for (const tc of m.tool_calls) pending.add(tc.id);
    }
    if (m.role === "tool" && m.tool_call_id) {
      resolved.add(m.tool_call_id);
    }
  }

  const clean = msgs.filter(m => {
    // 孤立的 tool 消息（无对应 assistant tool_calls）
    if (m.role === "tool" && m.tool_call_id && !pending.has(m.tool_call_id)) return false;
    // 孤立的 assistant(tool_calls)（无 tool 响应）
    if (m.role === "assistant" && m.tool_calls && m.tool_calls.length > 0) {
      return m.tool_calls.every(tc => resolved.has(tc.id));
    }
    return true;
  });

  // 收缩尾部悬空的 assistant(tool_calls)
  let end = clean.length - 1;
  while (end >= 0) {
    const m = clean[end];
    if (m.role === "assistant" && m.tool_calls && m.tool_calls.length > 0) {
      end--;
    } else {
      break;
    }
  }
  return clean.slice(0, end + 1);
}

/** 截断对话历史，保留 system 消息 + 最近 N 条，同时保证 tool_calls/tool 消息配对完整 */
export function truncateHistory(messages: AgentMessage[], windowSize: number): AgentMessage[] {
  if (messages.length <= windowSize) return [...messages];
  const systemMsgs = messages.filter(m => m.role === "system");
  const rest = messages.filter(m => m.role !== "system");
  const kept = rest.slice(-(windowSize - systemMsgs.length));

  // 修复截断边界导致的消息配对问题：
  //   1. 移除开头孤立的 tool 消息（其 assistant(tool_calls) 已被截掉）
  //   2. 移除末尾孤立的 assistant(tool_calls)（其 tool 响应已被截掉）
  //   3. 中间区域校验 tool_call_id 完整性
  const fixBoundaries = (msgs: AgentMessage[]): AgentMessage[] => {
    // —— 向前扫描：收集可用的 tool_call_id ——
    const pending = new Map<string, number>(); // tool_call_id → assistant 在 msgs 中的 index
    const resolved = new Set<string>();         // 已匹配到 tool 响应的 tool_call_id
    for (let i = 0; i < msgs.length; i++) {
      const m = msgs[i];
      if (m.role === "assistant" && m.tool_calls) {
        for (const tc of m.tool_calls) pending.set(tc.id, i);
      }
      if (m.role === "tool" && m.tool_call_id && pending.has(m.tool_call_id)) {
        resolved.add(m.tool_call_id);
      }
    }

    // —— 过滤 ——
    const clean = msgs.filter(m => {
      // 孤立的 tool 消息：无对应 assistant
      if (m.role === "tool" && !pending.has(m.tool_call_id!)) return false;
      // assistant 消息，其所有 tool_calls 都必须有响应
      if (m.role === "assistant" && m.tool_calls && m.tool_calls.length > 0) {
        return m.tool_calls.every(tc => resolved.has(tc.id));
      }
      return true;
    });

    // 过滤后可能仍有尾部残余：收缩到最后一个完整配对
    // 找到最后一个合法的 tool 或非 tool_calls 的 assistant/user 消息作为结尾
    let end = clean.length - 1;
    while (end >= 0) {
      const m = clean[end];
      if (m.role === "assistant" && m.tool_calls && m.tool_calls.length > 0) {
        end--; // 悬空的 assistant(tool_calls) → 去掉
      } else {
        break;
      }
    }
    return clean.slice(0, end + 1);
  };

  return [...systemMsgs, ...fixBoundaries(kept)];
}
