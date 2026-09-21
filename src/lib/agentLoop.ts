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
  type AgentChatOverrides,
  type AgentMessage,
  type AgentResponse,
  type ToolCallDelta
} from "./aiClient";
import { TOOL_DEFINITIONS, getToolSafety, isKnownTool, TOOL_SCHEMAS, buildToolCategoryOverview } from "./tools";
import {
  executeToolCall as defaultExecuteToolCall,
  executeToolCalls as defaultExecuteToolCalls,
  isEvalAutoSafe,
  type ToolCallRequest,
  type ToolResult
} from "./toolExecutor";
import type { GGBAppletApi } from "../types/ggb";
import type { Domain } from "./prompts";
import type { ChatTurn } from "../store/useAppStore";
import { getTraceId } from "./runControl";
import { withRepaintBatch } from "./repaintGate";
import { buildTrajectoryRecord, type TrajectoryRecord } from "./trajectoryStore";
import { getRichSnapshot } from "./ggbBridge";

// ──── 常量 ────

/** 最大工具调用迭代次数（防止无限循环） */
export const MAX_AGENT_ITERATIONS = 30;

/** 连续工具失败熔断阈值（连续 N 轮执行全失败即停止重试，避免无效轮转） */
export const MAX_CONSECUTIVE_FAILURES = 3;

/** 画布状态核对最大反馈次数（共享 30 迭代预算） */
export const MAX_STATE_CHECK_ROUNDS = 2;

/** 用户拒绝工具调用时返回给 AI 的错误文案（熔断统计据此排除"拒绝"场景） */
const USER_DENIED_MSG = "用户拒绝了此操作";

/**
 * 截断重试的输出预算倍数。
 * ★ 为什么必须扩容：thinking 的 reasoning 与正文共享 max_tokens。被截断时空响应重试
 *   若不改预算/思考档位，第二次必然以同样方式截断（实测 deepseek-flash 单次推理可达
 *   2.4 万字符，占满 8192 预算的 95%）。
 */
const TRUNCATION_RETRY_BUDGET_SCALE = 2;

/** 截断重试时降到的思考档位（腾出正文/工具调用空间）。
 *  ★ GLM 注意：thinking.type 是二元开关，"low" 经 buildThinkingParam 仍落为 enabled——
 *    GLM 侧只有扩容生效；GLM-5.2+ 支持 reasoning_effort 后降档才真正起作用。 */
const TRUNCATION_RETRY_REASONING = "low" as const;

/** 截断类空响应的最大重试次数。长任务中截断易复发（预算随历史膨胀更易吃满），
 *  全 loop 只给一次机会会让第二次截断直接失败回滚；非截断空响应仍限 1 次 */
const TRUNCATION_RETRY_MAX = 2;

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

/** 画布状态核对规格（由 pipeline 注入；缺省 = 无终止核对，行为与现状完全一致） */
export interface StateCheckSpec {
  /** 核对基准（确认后的序列化题目解读） */
  basis: string;
  /** 最大核对反馈次数，缺省 MAX_STATE_CHECK_ROUNDS */
  maxRounds?: number;
  /** 返回 null = 跳过本次核对（如 signal 已 abort / 评估异常），按通过结束 */
  check(canvasState: string, signal: AbortSignal):
    Promise<{ satisfied: boolean; issues: string[]; summary: string } | null>;
}

/** 核对反馈消息文案（导出供单测断言） */
export function buildStateCheckFeedback(basis: string, issues: string[], snapshot: string): string {
  const issueList = issues.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const basisSummary = basis.length > 500 ? basis.slice(0, 500) + "…" : basis;
  return `[状态核对] 画布与题目要求核对后发现 ${issues.length} 个问题：\n${issueList}\n\n【题目要求】\n${basisSummary}\n\n【当前画布状态】\n${snapshot}\n\n请用工具逐项修正，完成后重新总结。`;
}

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
  /** 每次 AI 调用的 token 用量回传（累计到 UI 统计）。reasoning = 其中的思考 token；
   *  cacheHit = 命中服务端前缀缓存（DeepSeek KV Cache）的输入 token */
  onTokenUsage?(usage: { prompt: number; completion: number; reasoning?: number; cacheHit?: number }): void;
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
  /** 画布状态核对规格（带图轮注入；缺省 = 无终止核对） */
  stateCheck?: StateCheckSpec;
  /** 历史高频陷阱提示（pipeline 注入 buildTrapPrompt 产物；追加到 system prompt 尾部） */
  trapPrompt?: string;
  /** 轮次耗尽续作：上一轮暂停时的完整对话缓存（pipeline 注入；缺省 = 全新轮）。
   *  缓存含原始请求与已尝试的工具序列，恢复时换新 system prompt 并立即压缩 */
  resumeMessages?: AgentMessage[];
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
  /** 是否失败（熔断 / 空响应放弃）。pipeline 据此决定快照回滚。
   *  ★ 轮次耗尽不在此列——那标记为 incomplete（画布保留、可续作） */
  failed?: boolean;
  /** 轮次耗尽的可续作暂停：画布保留当前进度、不回滚，成功命令照常写入 constructionLog；
   *  本轮对话由 pipeline 缓存，用户发送后续指令即注入 resumeMessages 增量续作 */
  incomplete?: boolean;
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

function buildAgentSystemPrompt(domain: Domain, appMode: "2d" | "3d", canvasEmpty: boolean, maxToolsPerTurn?: number, trapPrompt?: string): string {
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
→ 第 2 步：创建 3 个滑块（单次批量调用）
  调用：create_sliders({sliders:[{name:"v0",min:1,max:50,step:1,value:20,unit:"m/s",label:"初速"},{name:"theta",min:0,max:1.5708,step:0.01,value:0.785,unit:"rad",label:"仰角"},{name:"t",min:0,max:5,step:0.02,value:0,unit:"s",label:"时间"}]})
  → 观察：全部成功
→ 第 3 步：创建质点
  调用：create_function({name:"Px",expression:"v0*cos(theta)*t"})
  调用：create_function({name:"Py",expression:"v0*sin(theta)*t-0.5*g*t^2"})
  调用：create_point({name:"P",x:"Px(t)",y:"Py(t)"})
  → 观察：全部成功
→ 第 4 步：速度矢量（随动）+ 实时读数 + 轨迹
  调用：attach_vector({name:"vArrow",anchor:"P",exprX:"v0*cos(theta)",exprY:"v0*sin(theta)-g*t",color:"#43a047",label:"v"})
  调用：create_readout({name:"hud",at:"P",items:[{label:"t",expr:"t",unit:"s",decimals:1},{label:"y",expr:"v0*sin(theta)*t-0.5*g*t^2",unit:"m",decimals:1}]})
  调用：create_trace({target:"P",mode:"trail"})
  → 观察：全部成功
→ 第 5 步：视窗（含轴单位） + 启动动画
  调用：set_view({xmin:-2,xmax:50,ymin:-2,ymax:20,xUnit:"m",yUnit:"m"})
  调用：set_animation({target:"t",action:"start",speed:0.5,repeat:"increasing"})
  → 最终回复："斜抛运动构造完成 ✓ P 点自动运动 + 拖尾轨迹 + 速度矢量。拖动 v0/θ 滑块可实时调整参数。"`
    : `【增量修改模式】画布已有对象，请直接分析需求并修改。非必要不调用 list_objects/get_object_info——从用户消息中的 [当前画布已有对象] 即可知悉画布状态。优先在现有对象上修改（set_style/set_animation/delete_object），而非清空重建。`;

  // ★ 历史陷阱节追加在 prompt 尾部：内容随陷阱库变化，放尾部使主体保持字节稳定（KV Cache 前缀命中）
  const trapSection = trapPrompt && trapPrompt.trim()
    ? `\n\n【历史高频陷阱——此前运行中反复出现的错误，严禁重蹈】\n${trapPrompt}`
    : "";

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
- SetColor r/g/b 用 0~1 浮点（引擎按 ×255 解析；0~255 整数会渲染成白色）。
- 对象显隐：SetVisibleInView(obj, 1, true/false)（无 SetVisible 命令）；条件显隐 SetConditionToShowObject(obj, 条件)；查询显隐状态无命令形态，用 get_object_info 工具。Set* 是语句，不能嵌套进 Sequence/Zip——批量显隐逐条发命令或 eval_raw 换行分隔（分号无效）。
- Min(a,b)/Max(a,b) 双参数形式执行失败 → 用 If(c, a, b)。
- 命令名大小写敏感：If（不是 IF）、Curve、Segment。
- ★ 坐标字面量赋给小写名会被 GGB 隐式推断为 Vector（实测 contact/c2 等），后续 Segment(C, xxx) 引用即失败——坐标点一律用大写开头名字（A、B、Contact）。
- ★ Angle(P1, 顶点, P2) 三参必须全部是已声明的大写 Point：先建底角顶点与两边端点再取角；滑块 t 的大写 T 是不存在的名字。斜面倾角：ang = Angle(Hx, O, Ps)（Hx 水平参考点、O 底角、Ps 斜面上点）。
- 角度标注直接 a1 = Angle(A, O, B)（自带弧线与度数显示，无需自造 Arc）。
- 摆锤/质点用小圆表示：半径取特征长度的 4%~6%（如 L=1 → Circle(P, 0.05)）。
- 切线扫描（导数几何意义）：P = Point(f) 让点落在曲线上，t = Tangent(P, f) 作切线——均为赋值形态免确认。

【工具分组速览（按需选用，非全部必用）】
${buildToolCategoryOverview()}

【命名约定】
- 点：大写 A,B,C；滑块：小写 t,v0,theta；矢量：带 Vec/Arrow 后缀
- 标识符仅 ASCII 字母数字下划线，禁止中文变量名。` + trapSection;
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

  const systemPrompt = buildAgentSystemPrompt(deps.domain, deps.appMode, initialObjs.length === 0, quirks.maxToolsPerTurn, deps.trapPrompt);

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

  // ★ 轮次耗尽续作：优先复用上一轮暂停时的对话缓存（尽可能利用缓存——原始请求、
  //    已尝试的工具序列与失败信息全保留），而非仅从 ChatTurn 重建。缓存首元素是旧
  //    system prompt → 丢弃换新（模式/画布可能已变）；缓存的 index 1 恰是原始用户请求，
  //    与 compressHistory 的保留位约定天然对齐；跳过 convertHistory（避免与缓存重复）
  const resumedMsgs = deps.resumeMessages && deps.resumeMessages.length > 1
    ? deps.resumeMessages.slice(1)
    : null;
  const resumed = resumedMsgs !== null;

  let messages: AgentMessage[] = [
    { role: "system", content: systemPrompt },
    ...(resumedMsgs ?? historyMsgs),
    { role: "user", content: (resumed ? "[续作] " : "") + userPrefix + userText + canvasStatus }
  ];

  // ★ 当前用户请求的下标（压缩时必须保留）。多轮对话时不是 messages[1]——那里是历史消息，
  //    写死 messages[1] 会让压缩丢掉当前任务指令（模型只剩画布快照 + 最近操作，目标漂移）。
  //    续作轮的原始请求位于 index 1（缓存布局不变式），新指令在尾部随 recent 窗口保留
  let currentUserIndex = resumed ? 1 : 1 + historyMsgs.length;

  // ★ 续作轮立即压缩一次：缓存常超压缩阈值，若不先压缩，首轮 truncateHistory 只保
  //    system + 尾部 40 条，会把原始请求截掉。传 params.interval 强制满足压缩轮次条件
  if (resumedMsgs) {
    const params = getCompressParams(quirks.contextWindow);
    messages = compressHistory(messages, deps.getApi() ?? initialApi, params.interval, params, currentUserIndex);
  }

  const agentChatFn = deps.agentChatImpl ?? defaultAgentChat;
  const executeToolCallFn = deps.executeToolCallImpl ?? defaultExecuteToolCall;
  const executeToolCallsFn = deps.executeToolCallsImpl ?? defaultExecuteToolCalls;

  const deniedTools: string[] = [];
  let finalText = "";
  let iterations = 0;
  let failed = false;         // ★ 失败标记（熔断/空响应放弃）——pipeline 据此回滚快照
  let incomplete = false;     // ★ 轮次耗尽的可续作暂停——画布保留、不回滚，对话入缓存供接力
  let approveAll = false; // ★ 信任会话标志，闭环内持久
  let consecutiveFailures = 0; // ★ 连续工具执行失败计数（熔断）
  let forceStop = false;      // ★ 熔断后禁止继续工具调用
  let emptyResponseRetried = false; // ★ 非截断空响应重试标志（仅重试 1 次）
  let truncationRetries = 0;        // ★ 截断类空响应已重试次数（独立预算 ≤TRUNCATION_RETRY_MAX，不随成功轮复位）
  let parseFailRounds = 0;          // ★ 参数 JSON 解析失败的连续轮数（第 2 轮起注入指引）
  let brokeOut = false;             // ★ 循环是否经 break 退出（区分自然耗尽——break 时 iterations 也可能 === MAX）
  let retryOverrides: AgentChatOverrides | undefined; // ★ 截断重试的参数覆盖（扩容预算 + 降思考档）
  let checkRounds = 0; // ★ 状态核对反馈计数
  // ★ 同一对象反复报「不存在」的计数（按对象名）。这类失败被归为「可修正」不进熔断，
  //    模型可能无限换写法重试同一个拼错的名字——第 2 次起注入明确指引
  const missingObjCounts = new Map<string, number>();

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
    const compressed = compressHistory(messages, api, iterations, compressParams, currentUserIndex);
    if (compressed !== messages) currentUserIndex = 1; // 压缩后当前请求固定位于 index 1
    messages = compressed;

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
        },
        retryOverrides
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
      brokeOut = true;
      break;
    }

    // 情况 1：纯文本回复 → 结束（或触发状态核对）
    if (!response.toolCalls.length && response.content) {
      messages.push({ role: "assistant", content: response.content, reasoning_content: roundtripReasoning ? response.reasoningContent : undefined });
      emptyResponseRetried = false; // 成功后复位
      retryOverrides = undefined;   // 成功后复位（截断重试的扩容参数不粘到后续轮次）

      // ★ 状态核对钩子：AI 宣称完成时，校验画布是否满足题目要求
      const maxCheck = deps.stateCheck?.maxRounds ?? MAX_STATE_CHECK_ROUNDS;
      if (deps.stateCheck && checkRounds < maxCheck && !deps.signal.aborted && !forceStop) {
        checkRounds++;
        deps.onThinking?.("正在核对画布状态…");
        const api = deps.getApi();
        if (api) {
          try {
            const snapshot = getRichSnapshot(api);
            const r = await deps.stateCheck.check(snapshot, deps.signal);
            if (r && !r.satisfied && r.issues.length) {
              deps.onThinking?.(`状态核对发现 ${r.issues.length} 个问题，继续修正…`);
              messages.push({
                role: "user",
                content: buildStateCheckFeedback(deps.stateCheck.basis, r.issues, snapshot),
              });
              continue; // 回到循环顶部，AI 带着问题清单继续调用工具
            }
          } catch (err) {
            // 核对失败 → 按通过结束（延续「失败不阻断」哲学）
            if (deps.signal.aborted) throw err;
            console.warn("[agentLoop] stateCheck failed, treating as pass", err);
          }
        }
      }

      finalText = response.content;
      brokeOut = true;
      break;
    }

    // 情况 2：无文本也无工具调用 → 诊断 + 重试 1 次
    if (!response.toolCalls.length) {
      const reasoningChars = response.reasoningContent?.length ?? 0;
      const completionTokens = response.usage?.completion;
      const reasoningTokens = response.usage?.reasoning;
      console.warn(
        `[agentLoop] ${getTraceId()} 第${iterations}轮空响应: finishReason=${response.finishReason || "无"}, ` +
        `contentLen=${response.content?.length ?? 0}, reasoningChars=${reasoningChars}, ` +
        `completionTokens=${completionTokens ?? "?"}（推理 ${reasoningTokens ?? "?"}）, msgCount=${messages.length}`
      );

      // ★ 截断与非截断空响应的重试预算分开计：截断易复发，给 TRUNCATION_RETRY_MAX 次；
      //   普通空响应仍限 1 次（截断的重试机会不因用过普通重试而消失，反之亦然）
      const isTruncation = response.finishReason === "length";
      const usedRetries = isTruncation ? truncationRetries : (emptyResponseRetried ? 1 : 0);
      const retryBudget = isTruncation ? TRUNCATION_RETRY_MAX : 1;
      if (usedRetries < retryBudget) {
        if (isTruncation) truncationRetries++;
        else emptyResponseRetried = true;
        // ★ finish_reason="length" 是明确的截断信号，即使 streamsFinishReason=false 也应信任
        //   （该 flag 仅表示 provider 可能省略 finish_reason，不代表返回的值不可信）
        const truncated = isTruncation;
        // ★ 截断的根因是输出预算被 thinking 吃光：重试必须改变条件（扩容 + 降思考档），
        //   否则同样的参数只会得到同样的截断（这是「空响应重试」此前失效的原因）
        retryOverrides = truncated
          ? { maxTokensScale: TRUNCATION_RETRY_BUDGET_SCALE, reasoningEffort: TRUNCATION_RETRY_REASONING }
          : undefined;
        const reasonHint = truncated
          ? "[系统] 你的上一条回复因长度限制被截断（推理占满了输出预算）。本次已提高输出预算并降低思考深度：请直接调用下一步工具，或用 1-2 句话简短总结，不要长篇推理。"
          : "[系统] 请继续：调用下一步工具完成构造，或输出文本总结当前画布状态。不要返回空响应。";
        messages.push({ role: "user", content: reasonHint });
        continue;
      }

      // 重试后仍空 → 放弃，输出诊断信息
      const truncated = response.finishReason === "length";
      const budgetHint = reasoningChars > 0
        ? `，本轮推理 ${reasoningTokens ? `${reasoningTokens} tok` : `${reasoningChars} 字符`}` +
          `${completionTokens ? ` / 输出合计 ${completionTokens} tok` : ""}`
        : "";
      const diag = truncated
        ? `（输出超长被截断：预算已被思考吃光${budgetHint}。已自动扩容并降档重试仍失败，请把「思考深度」调低、调高「输出预算」或拆分任务）`
        : response.finishReason === "content_filter"
        ? "（内容被安全过滤拦截）"
        : `（finish_reason=${response.finishReason || "无"}，模型未生成有效输出，请检查 Agent 模型是否支持 Function Calling）`;
      finalText = `AI 未返回有效响应${diag}`;
      failed = true;
      brokeOut = true;
      break;
    }

    // 情况 3：有工具调用 → 分类处理
    const toolCalls = response.toolCalls;

    // ★ 参数 JSON 解析失败计数（tool_calls 流式被截断的典型症状）：Zod 会归为「参数校验失败」
    //    → recoverable → 永不熔断，可能无限轮转烧满迭代预算 → 单独跟踪（见下方熔断与指引）
    let parseFailCount = 0;
    for (const tc of toolCalls) {
      try { JSON.parse(tc.function.arguments); } catch { parseFailCount++; }
    }

    // ★ 过滤未知工具（AI hallucinate 的不存在的工具名）：
    //    直接返回错误给 AI，不执行、不走用户确认
    const knownCalls = toolCalls.filter(tc => isKnownTool(tc.function.name));
    const unknownCalls = toolCalls.filter(tc => !isKnownTool(tc.function.name));

    const safeCalls: ToolCallDelta[] = [];
    const dangerousCalls: ToolCallDelta[] = [];

    for (const tc of knownCalls) {
      // ★ eval_raw 自动降档：赋值形态 + 安全拦截 + 静态预检全通过 → 免确认
      //   （3D 构造 Cube/Sphere/Surface 全是赋值形态；Delete / 非赋值 scripting 仍走确认）
      const rawArgs = safeParseJSON(tc.function.arguments, tc.function.name);
      if (tc.function.name === "eval_raw" &&
          isEvalAutoSafe(tc.function.name, rawArgs, deps.appMode)) {
        safeCalls.push(tc);
      } else if (getToolSafety(tc.function.name) === "dangerous") {
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
        dangerousResults = executeDangerousTools(api, dangerousCalls, executeToolCallFn, deps.appMode);
      } else {
        deps.onThinking?.("等待确认…");
        const { results, newApproveAll } = await handleDangerousTools(
          api, dangerousCalls, deniedTools, approveAll, executeToolCallFn, deps.appMode, deps.signal
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
    retryOverrides = undefined;

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
      if (hard.length === 0 && parseFailCount === 0) {
        // 本轮失败全是参数问题 → 模型可修正，清零熔断
        consecutiveFailures = 0;
      } else if (hard.length === 0) {
        // 仅参数 JSON 解析失败：不属于可自愈的参数错误（多为流式截断）→ 计入熔断防无限轮转
        consecutiveFailures++;
      } else {
        consecutiveFailures = hard.every(s => s.failed) ? consecutiveFailures + 1 : 0;
      }
    }

    // ★ 同名对象重复「不存在」→ 注入停止重试的指引（每个对象名只注入一次）
    //    典型场景：样式/动画工具反复引用同一个拼错/大小写不符的对象名
    const MISSING_OBJ_RE = /对象\s*([A-Za-z_]\w{0,39})\s*不存在/;
    for (const r of allResults) {
      try {
        const p = JSON.parse(r.content) as { success?: boolean; error?: string };
        if (p.success !== false) continue;
        const m = MISSING_OBJ_RE.exec(p.error ?? "");
        if (!m) continue;
        const name = m[1];
        const seen = (missingObjCounts.get(name) ?? 0) + 1;
        missingObjCounts.set(name, seen);
        if (seen === 2) {
          messages.push({
            role: "user",
            content:
              `对象 ${name} 已多次报「不存在」。请停止对 ${name} 的原样重试：` +
              `先调用 list_objects 核对画布上的真实对象名（区分大小写）；` +
              `若画布上确实没有，先用创建类工具声明它再设置属性；` +
              `若只是样式/动画设置，放弃该项不影响构造正确性。`
          });
        }
      } catch { /* 非 JSON 结果忽略 */ }
    }

    // ★ 解析失败指引：连续 ≥2 轮时点明根因（单轮调用过多 → 参数被截断）并给出出路
    if (parseFailCount > 0) {
      parseFailRounds++;
      if (parseFailRounds >= 2) {
        messages.push({
          role: "user",
          content: `参数 JSON 已连续 ${parseFailRounds} 轮解析失败（本轮 ${parseFailCount} 个调用）。` +
            `常见原因是单轮工具调用过多导致参数被截断：请减少单轮调用个数、把复杂调用拆成多次，` +
            `或直接用文字总结当前进度。`
        });
      }
    } else {
      parseFailRounds = 0;
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

  // ★ 轮次自然耗尽 → 可续作暂停（不清空画布、不回滚）：finalText 三要素——已达上限 /
  //   画布保留进度（对象数）/ 发后续指令即可继续。该文本随摘要进入对话历史，成为下一轮
  //   模型可见的衔接上下文；本轮完整对话由 pipeline 缓存供续作注入。
  //   仅熔断 / 空响应放弃才保持 failed=true（触发 pipeline 快照回滚）
  if (!brokeOut && iterations >= MAX_AGENT_ITERATIONS) {
    const objCount = deps.getApi()?.getAllObjectNames().length ?? 0;
    finalText = `已达到单轮最大迭代次数（${MAX_AGENT_ITERATIONS} 轮），本轮到此暂停。` +
      (objCount > 0
        ? `画布已保留当前进度（现有 ${objCount} 个对象）`
        : "画布暂无新增对象") +
      `。请直接发送后续指令（如「继续完成剩余部分」「把 X 改成 Y」），我会基于当前画布继续调整。`;
    incomplete = true;
  }

  // ★ 改造五：记录 ReAct 轨迹（成功/失败均记录，供训练数据闭环 + 失败回放）
  //    persistTrajectory 由 pipeline 注入默认实现（IndexedDB）；测试可 mock 断言
  const record = buildTrajectoryRecord(userText, { finalText, messages, iterations, deniedTools });
  deps.persistTrajectory?.(record);

  return { finalText, messages, iterations, deniedTools, failed, incomplete };
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
  executeToolCallFn: typeof defaultExecuteToolCall,
  appMode?: "2d" | "3d"
): ToolResult[] {
  const requests: ToolCallRequest[] = calls.map(tc => ({
    id: tc.id,
    name: tc.function.name,
    arguments: safeParseJSON(tc.function.arguments, tc.function.name)
  }));
  // ★ 同样批处理：危险工具（eval_raw 非赋值形态）可能一次写多条命令，
  //   不批处理会让代数区逐行重建闪烁（见 repaintGate.ts 说明）
  return withRepaintBatch(api, requests.length, appMode, () =>
    requests.map(req => executeToolCallFn(api, req))
  );
}

// ──── 危险工具处理 ────

async function handleDangerousTools(
  api: GGBAppletApi,
  calls: ToolCallDelta[],
  deniedTools: string[],
  approveAll: boolean,
  executeToolCallFn: typeof defaultExecuteToolCall,
  appMode?: "2d" | "3d",
  signal?: AbortSignal
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

  // ★ 确认等待可被中止：用户在对话框打开期间点「清空/撤销」（abortCurrentRun）时，
  //   运行锁不再悬挂到用户回答对话框为止
  let onAbort: () => void = () => {};
  const decisions = signal
    ? await Promise.race([
        _confirmFn(confirmRequests),
        new Promise<never>((_, reject) => {
          onAbort = () => reject(new DOMException("The operation was aborted.", "AbortError"));
          if (signal.aborted) {
            onAbort();
            return;
          }
          signal.addEventListener("abort", onAbort, { once: true });
        })
      ]).finally(() => signal.removeEventListener("abort", onAbort))
    : await _confirmFn(confirmRequests);

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

  // ★ 批处理：用户确认已在上方 await 完成（等待不在批处理窗口内），
  //   执行阶段合并为一次重绘，避免代数区逐行重建闪烁
  withRepaintBatch(api, requests.length, appMode, () => {
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
  });

  return { results, newApproveAll };
}

// ──── 工具 ────

/** 生成人类可读的工具调用描述 */
function describeToolCall(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case "eval_raw":
      return `执行原始命令：${args.command}`;
    case "delete_object":
      return `删除对象：${args.target}`;
    case "clear_canvas":
      return "清空整个画布（不可撤销）";
    case "create_function":
      return `创建函数/表达式：${args.name} = ${String(args.expression).slice(0, 60)}`;
    case "create_parametric":
      return `创建参数曲线：${args.name}`;
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
      let content = t.content;
      if (t.attachments && t.attachments.length > 0) {
        content += `\n[附件:图片×${t.attachments.length}]`;
      }
      msgs.push({ role: "user", content });
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
 *   - 保留 system prompt + 当前用户请求 → 不丢任务意图（★ 多轮对话时当前请求不在
 *     messages[1]，必须由调用方传入下标，写死 messages[1] 会保留成历史消息）
 *   - 插入画布状态快照（对象名/类型/定义）→ 保留"当前有什么"
 *   - 保留最近 N 条消息 → 保留最新操作上下文
 *   - 丢弃中间冗余的工具调用/结果对
 *
 * 返回压缩后的消息数组（原地不修改原数组；未触发压缩时原样返回同一引用）。
 * 导出供单测。
 */
export function compressHistory(
  messages: AgentMessage[],
  api: GGBAppletApi,
  iterations: number,
  params: CompressParams,
  currentUserIndex = 1
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

  // 保留：system(0)、当前用户请求（currentUserIndex）、摘要、最近 N 条
  const system = messages[0];
  const userRequest = messages[currentUserIndex] ?? messages[1]; // 含 userPrefix + userText + canvasStatus
  const recentStart = Math.max(currentUserIndex + 1, messages.length - params.keepRecent);
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
 * 删除配对断裂的消息，迭代到不动点：
 *   - assistant(tool_calls) 有任一 tool_call 缺响应 → 整条删除
 *   - tool 消息无 assistant 父消息（父被删或本就孤立）→ 删除
 * ★ 必须迭代：单遍过滤在「同一 assistant 的部分 tool 响应缺失」时会泄漏——
 *   assistant 因未全 resolved 被删，其已保留的 tool 响应变成孤儿，OpenAI 兼容端点直接 400
 */
function dropBrokenToolPairs(msgs: AgentMessage[]): AgentMessage[] {
  let cur = msgs;
  for (;;) {
    const pending = new Set<string>();
    const resolved = new Set<string>();
    for (const m of cur) {
      if (m.role === "assistant" && m.tool_calls) {
        for (const tc of m.tool_calls) pending.add(tc.id);
      }
      if (m.role === "tool" && m.tool_call_id && pending.has(m.tool_call_id)) {
        resolved.add(m.tool_call_id);
      }
    }
    let changed = false;
    cur = cur.filter(m => {
      if (m.role === "tool") {
        const orphan = !m.tool_call_id || !pending.has(m.tool_call_id);
        if (orphan) changed = true;
        return !orphan;
      }
      if (m.role === "assistant" && m.tool_calls && m.tool_calls.length > 0) {
        const complete = m.tool_calls.every(tc => resolved.has(tc.id));
        if (!complete) changed = true;
        return complete;
      }
      return true;
    });
    if (!changed) return cur;
  }
}

/** 收缩尾部悬空的 assistant(tool_calls)（其 tool 响应缺失） */
function shrinkDanglingTail(msgs: AgentMessage[]): AgentMessage[] {
  let end = msgs.length - 1;
  while (end >= 0) {
    const m = msgs[end];
    if (m.role === "assistant" && m.tool_calls && m.tool_calls.length > 0) {
      end--;
    } else {
      break;
    }
  }
  return msgs.slice(0, end + 1);
}

/**
 * 修复消息数组开头的配对问题：移除开头孤立的 tool 消息（缺少 assistant(tool_calls)），
 * 移除末尾悬空的 assistant(tool_calls)（缺少 tool 响应）。
 */
function fixPairingBoundary(msgs: AgentMessage[]): AgentMessage[] {
  return shrinkDanglingTail(dropBrokenToolPairs(msgs));
}

/** 截断对话历史，保留 system 消息 + 最近 N 条，同时保证 tool_calls/tool 消息配对完整 */
export function truncateHistory(messages: AgentMessage[], windowSize: number): AgentMessage[] {
  if (messages.length <= windowSize) return [...messages];
  const systemMsgs = messages.filter(m => m.role === "system");
  const rest = messages.filter(m => m.role !== "system");
  const kept = rest.slice(-(windowSize - systemMsgs.length));

  // 修复截断边界导致的消息配对断裂（迭代到不动点，杜绝孤儿 tool / 悬空 assistant）
  return [...systemMsgs, ...shrinkDanglingTail(dropBrokenToolPairs(kept))];
}
