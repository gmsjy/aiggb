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
  agentChat,
  AIError,
  type AIConfig,
  type AgentMessage,
  type AgentResponse,
  type ToolCallDelta
} from "./aiClient";
import { TOOL_DEFINITIONS, getToolSafety } from "./tools";
import {
  executeToolCall,
  executeToolCalls,
  type ToolCallRequest,
  type ToolResult
} from "./toolExecutor";
import type { GGBAppletApi } from "../types/ggb";
import type { Domain } from "./prompts";
import type { ChatTurn } from "../store/useAppStore";

// ──── 常量 ────

/** 最大工具调用迭代次数（防止无限循环） */
export const MAX_AGENT_ITERATIONS = 30;

/** 对话历史保留窗口（消息条数） */
const HISTORY_WINDOW = 40;

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
  /** Agent 模式专用模型名（已解析，含回退链） */
  agentModel: string;
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

function buildAgentSystemPrompt(domain: Domain, appMode: "2d" | "3d"): string {
  const modeHeader = appMode === "3d"
    ? `【3D 三维模式】使用 (x,y,z) 坐标。Cube/Sphere/Tetrahedron/IntersectPath/Surface 等 3D 命令需走 eval_raw。SetViewDirection/SetCaption/SetFilling/SetPointSize/SetAxesRatio/ZoomIn 在纯 3D applet 中不可用。Cross(u,v) 返回自由 Vector → 用 end=O+wVec; Vector(O,end) 两步法。`
    : `【2D 平面模式】使用 (x,y) 坐标，禁止 z 轴和 3D 几何命令。`;

  const physicsSection = domain === "physics"
    ? `\n【物理域】默认值：g=9.8 m/s²、单摆 L=1 θ₀=π/6、斜抛 v₀=20 θ=π/4、圆周 r=2 ω=1。配色：位移#1e88e5、速度#43a047、加速度#fb8c00、力#e53935、电场#8e24aa、磁场#00897b。注入常量用 physics_constants 工具。`
    : "";

  return `你是 AiGGB 图形构造代理，通过逐步调用工具在 GeoGebra 画布上创建交互式数学/物理图形。

${modeHeader}${physicsSection}

【工作方式】
1. 分析用户需求，规划构造步骤（参数→点→几何体/曲线→动画→样式）
2. 逐步调用工具，每步观察结果，根据结果调整下一步
3. 完成所有构造后用文本总结

【关键规则】
- ★ 单次只调用 1~4 个必要的工具，不要一次调用大量工具。
- ★ 创建对象前先用 list_objects 或 get_object_info 确认依赖对象是否存在。
- ★ 不要重复创建已存在的对象。
- ★ 工具调用失败时读 error 字段，调整后重试（不超过 3 次）。
- ★ 动态构造用 create_function（如 "v0*cos(theta)*t"）而非在 create_point 中写死数值。
- ★ 复杂操作（3D 几何体、IntersectPath、Surface、SolveODE）用 eval_raw。
- ★ 构造完成后用 set_animation 启动动画，用 set_view 调整视窗。

【GGB 关键陷阱——必须遵守】
- Point+Point → ❌ 崩。Vector 只能用 create_vector 工具。
- (x,y) 赋值给变量 = Point（不是 Vector）。位移量必须用 Vector((0,0),(dx,dy))。
- 单大写字母 A~Z = Point 类型，禁止用作数值。
- u/v/w = Vector 类型，禁止用作标量。
- 分母含距离平方必须 +0.001 防除零。
- SetColor 的 r/g/b 必须是 0~255 整数。
- 3D 禁止：SetViewDirection SetFilling SetPointSize SetAxesRatio SetCaption ZoomIn。

【命名约定】
- 点：大写 A,B,C 或 Pt1,Center；滑块：小写 t,v0,theta；矢量：带 Vec/Arrow 后缀
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
  const api = deps.getApi();
  if (!api) {
    throw new AIError("GeoGebra 画布尚未就绪");
  }

  const systemPrompt = buildAgentSystemPrompt(deps.domain, deps.appMode);

  // ★ 多轮对话上下文：将历史 ChatTurn 转为 AgentMessage
  const historyMsgs = convertHistory(deps.getMessages());
  deps.onThinking?.("正在分析需求…");

  // 当前画布状态
  const initialObjs = api.getAllObjectNames();
  const canvasStatus = initialObjs.length > 0
    ? `\n[当前画布已有对象：${initialObjs.join(", ")}]`
    : "\n[当前画布为空]";

  const messages: AgentMessage[] = [
    { role: "system", content: systemPrompt },
    ...historyMsgs,
    { role: "user", content: userText + canvasStatus }
  ];

  const deniedTools: string[] = [];
  let finalText = "";
  let iterations = 0;
  let approveAll = false; // ★ 信任会话标志，闭环内持久

  while (iterations < MAX_AGENT_ITERATIONS) {
    // 检查中断
    if (deps.signal.aborted) {
      throw new DOMException("The operation was aborted.", "AbortError");
    }

    iterations++;

    deps.onThinking?.(`第 ${iterations} 步：正在规划…`);

    // 截断历史（保留 system + 最近 N 条）
    const truncated = truncateHistory(messages, HISTORY_WINDOW);

    // 调用 AI
    let response: AgentResponse;
    try {
      response = await agentChat(deps.config, truncated, TOOL_DEFINITIONS, deps.signal, deps.agentModel);
    } catch (err) {
      if (err instanceof AIError) throw err;
      throw new AIError(`Agent 调用失败 (iter ${iterations})`, err);
    }

    // 情况 1：纯文本回复 → 结束
    if (!response.toolCalls.length && response.content) {
      finalText = response.content;
      messages.push({ role: "assistant", content: response.content });
      break;
    }

    // 情况 2：无文本也无工具调用 → 异常
    if (!response.toolCalls.length) {
      finalText = "(AI 未返回有效响应)";
      break;
    }

    // 情况 3：有工具调用 → 分类处理
    const toolCalls = response.toolCalls;
    const safeCalls: ToolCallDelta[] = [];
    const dangerousCalls: ToolCallDelta[] = [];

    for (const tc of toolCalls) {
      if (getToolSafety(tc.function.name) === "dangerous") {
        dangerousCalls.push(tc);
      } else {
        safeCalls.push(tc);
      }
    }

    // 添加 assistant 消息（含 tool_calls）
    messages.push({
      role: "assistant",
      content: response.content,
      tool_calls: toolCalls
    });

    // 先执行安全工具
    const toolNames = [...safeCalls, ...dangerousCalls].map(tc => tc.function.name);
    deps.onThinking?.(`执行工具：${toolNames.join(", ")}`);
    const safeResults = executeSafeTools(api, safeCalls, deps.appMode);
    for (const r of safeResults) {
      messages.push(r);
    }

    // 危险工具 → 确认（pass approveAll for session-level trust）
    if (dangerousCalls.length > 0) {
      if (approveAll) {
        // 信任已激活，跳过确认直接执行
        const autoResults = executeDangerousTools(api, dangerousCalls);
        for (const r of autoResults) messages.push(r);
      } else {
        deps.onThinking?.("等待确认…");
        const { results, newApproveAll } = await handleDangerousTools(
          api, dangerousCalls, deniedTools, approveAll
        );
        approveAll = newApproveAll;
        for (const r of results) messages.push(r);
      }
    }

    // 检查是否所有工具都被拒绝 → 可能需要提前结束
    if (toolCalls.length > 0 &&
        dangerousCalls.length === toolCalls.length &&
        deniedTools.length >= dangerousCalls.length) {
      messages.push({
        role: "user",
        content: "以上工具调用均被用户拒绝。请尝试用其他安全工具完成构造，或直接回复说明无法继续。"
      });
    }
  }

  if (iterations >= MAX_AGENT_ITERATIONS) {
    finalText = `已达到最大迭代次数 (${MAX_AGENT_ITERATIONS})，构造可能不完整。`;
  }

  return { finalText, messages, iterations, deniedTools };
}

// ──── 安全工具执行 ────

function executeSafeTools(
  api: GGBAppletApi,
  calls: ToolCallDelta[],
  appMode?: "2d" | "3d"
): ToolResult[] {
  const requests: ToolCallRequest[] = calls.map(tc => ({
    id: tc.id,
    name: tc.function.name,
    arguments: safeParseJSON(tc.function.arguments, tc.function.name)
  }));
  return executeToolCalls(api, requests, appMode);
}

/** 信任激活后直接执行危险工具，无需确认 */
function executeDangerousTools(
  api: GGBAppletApi,
  calls: ToolCallDelta[]
): ToolResult[] {
  const requests: ToolCallRequest[] = calls.map(tc => ({
    id: tc.id,
    name: tc.function.name,
    arguments: safeParseJSON(tc.function.arguments, tc.function.name)
  }));
  return requests.map(req => executeToolCall(api, req));
}

// ──── 危险工具处理 ────

async function handleDangerousTools(
  api: GGBAppletApi,
  calls: ToolCallDelta[],
  deniedTools: string[],
  approveAll: boolean
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

  // 按决策分类执行
  const results: ToolResult[] = [];
  let newApproveAll = approveAll;

  for (const [i, decision] of decisions.entries()) {
    if (newApproveAll) {
      const r = executeToolCall(api, requests[i]);
      results.push(r);
      continue;
    }

    if (decision.action === "approve_all") {
      newApproveAll = true;
      const r = executeToolCall(api, requests[i]);
      results.push(r);
    } else if (decision.action === "approve") {
      const r = executeToolCall(api, requests[i]);
      results.push(r);
    } else {
      deniedTools.push(requests[i].name);
      results.push({
        tool_call_id: requests[i].id,
        role: "tool",
        content: JSON.stringify({ success: false, error: "用户拒绝了此操作" })
      });
    }
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
    console.warn(`[agentLoop] ${toolName || "?"} JSON 解析失败: ${preview}`);
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

/** 截断对话历史，保留 system 消息 + 最近 N 条，同时保证 tool_calls/tool 消息配对完整 */
function truncateHistory(messages: AgentMessage[], windowSize: number): AgentMessage[] {
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
