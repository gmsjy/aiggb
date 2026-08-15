/**
 * OpenAI 兼容的 AI 客户端 —— 见 SPEC.md §3.2 / §12.2
 *
 * 支持两种模式：
 *   1. chat() —— 传统 JSON 模式（Phase 1/2 用，response_format: json_object）
 *   2. agentChat() —— Function Calling 模式（工具调用代理用，不含 response_format）
 */

import { AIResponse, formatZodError, type AIResponse as AIResponseT } from "./schema";
import type { ToolDefinition } from "./tools";
import { getTraceId } from "./runControl";

// ──── 配置与消息类型 ────

export interface AIConfig {
  provider: string;
  baseURL: string;
  apiKey: string;
  /** 主力模型（编译/修复/降级）—— 也是所有角色未配置时的回退模型 */
  model: string;
  /** 轻量模型（精炼/评估）。不设置时回退到 flashModel → model */
  lightModel?: string;
  /** Agent 模式模型。不设置时回退到 model */
  agentModel?: string;
  /** @deprecated 使用 lightModel 代替；迁移后保留用于向前兼容 */
  flashModel?: string;
  temperature?: number;
}

/** 解析实际使用的模型（含回退链） */
export function resolveModel(config: AIConfig, role: "light" | "heavy" | "agent"): string {
  switch (role) {
    case "light":
      return config.lightModel ?? config.flashModel ?? config.model;
    case "heavy": // 编译/修复/降级 → 主力模型
      return config.model;
    case "agent":
      return config.agentModel ?? config.model;
  }
}

// ──── Provider quirks 适配 ────

export interface ProviderQuirks {
  /** Agent 模式的 temperature 覆盖（DeepSeek 对温度敏感，低 temp 减少 tool name 幻觉） */
  agentTemperature?: number;
  /** Agent 模式首条 user message 是否需要强指令前缀（DeepSeek 对 user-role 遵从度 > system-role） */
  agentForceUserPrefix?: boolean;
  /** 单轮最大工具调用数（超出阈值时 system prompt 收紧限制，避免 provider 丢弃后半 tool_calls） */
  maxToolsPerTurn?: number;
  /** stream 模式下是否可靠返回 finish_reason（DeepSeek/SiliconFlow 有时缺） */
  streamsFinishReason?: boolean;
  /** max tokens 参数字段名（OpenAI o-series 用 max_completion_tokens，其他用 max_tokens） */
  maxTokensField?: "max_tokens" | "max_completion_tokens";
  // ── V4+ 扩展 ──
  /** 是否支持原生 thinking 模式（DeepSeek V4 = true，内嵌非独立 reasoner） */
  supportsThinking?: boolean;
  /** thinking 深度（V4 通过 reasoning_effort 控制） */
  reasoningEffort?: "low" | "medium" | "high";
  /** 多轮对话中是否必须把 reasoning_content 原样回传 API（V4 = true，否则 400） */
  mustRoundtripReasoning?: boolean;
  /** 是否支持 tool_choice: "required"（V4 拒绝，只能 auto） */
  supportsToolChoiceRequired?: boolean;
  /** 上下文窗口 token 数（V4 = 1M，用于压缩策略调参） */
  contextWindow?: number;
}

/**
 * 根据 provider / model 名称返回特定 provider 的行为矫正参数。
 * 各 LLM 在 Function Calling 上的行为差异较大，这里集中适配。
 */
export function getProviderQuirks(config: AIConfig): ProviderQuirks {
  const fingerprint = [
    (config.provider ?? "").toLowerCase(),
    (config.model ?? "").toLowerCase(),
    (config.agentModel ?? "").toLowerCase(),
  ].join(" ");

  // DeepSeek V4 全系：thinking 内嵌 + reasoning_content 需回传 + 拒绝 tool_choice=required
  if (/deepseek/.test(fingerprint)) {
    return {
      agentTemperature: 0.05,
      agentForceUserPrefix: true,
      maxToolsPerTurn: 4,      // DeepSeek 单轮 >4 个 tool 时后半易丢失
      streamsFinishReason: false,
      supportsThinking: true,          // V4 原生 thinking
      reasoningEffort: "medium",
      mustRoundtripReasoning: true,    // ★ 多轮必须回传 reasoning_content
      supportsToolChoiceRequired: false, // ★ V4 拒绝 tool_choice: required
      contextWindow: 1_000_000,        // V4 百万上下文
    };
  }

  // 默认：标准 OpenAI 行为
  return { streamsFinishReason: true };
}

/** 传统纯文本消息（Phase 1/2 使用） */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * 支持 Function Calling 的扩展消息类型。
 * assistant 可携带 tool_calls；tool 角色携带 tool_call_id。
 */
export interface AgentMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCallDelta[];
  tool_call_id?: string;
  name?: string;
  /** V4 thinking 模式的推理过程。多轮对话中必须原样回传（mustRoundtripReasoning） */
  reasoning_content?: string;
}

export interface ToolCallDelta {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON 字符串
  };
}

/** agentChat 的返回：可能是纯文本，也可能是一组工具调用 */
export interface AgentResponse {
  /** 纯文本回复（无工具调用时） */
  content: string | null;
  /** 工具调用列表（AI 要求执行的操作） */
  toolCalls: ToolCallDelta[];
  /** SSE 流的 finish_reason："stop" | "length" | "tool_calls" | "content_filter" | null */
  finishReason: string | null;
  /** V4 thinking 模式的推理过程（多轮回传用） */
  reasoningContent?: string;
}

// ──── 错误类型 ────

/** 网络 / HTTP / 鉴权类错误。重试无意义，应直接展示。 */
export class AIError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "AIError";
  }
}

/**
 * AI 返回了内容，但 JSON 解析或 schema 校验失败。
 * 携带原始 raw 与诊断信息，调用方可把这些反馈给模型让它重发。
 */
export class AISchemaError extends Error {
  constructor(
    /** 给用户/模型看的简短描述 */
    message: string,
    /** AI 这一轮的原始输出（已去 code fence） */
    public readonly raw: string,
    /** 具体校验失败原因（JSON 解析报错 / zod issues 摘要） */
    public readonly detail: string
  ) {
    super(message);
    this.name = "AISchemaError";
  }
}

// ──── 通用 HTTP 调用 ────

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
      reasoning_content?: string | null; // V4 thinking 推理过程
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    };
    finish_reason?: string;
  }>;
}

/** 发起 chat/completions POST 请求，统一处理网络 / HTTP 错误，返回 Response（兼容流式） */
async function fetchCompletion(
  config: AIConfig,
  body: Record<string, unknown>,
  signal?: AbortSignal
): Promise<Response> {
  const baseURL = config.baseURL.replace(/\/+$/, "");
  const url = `${baseURL}/chat/completions`;

  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(body),
      signal
    });
  } catch (err) {
    throw new AIError(
      err instanceof Error ? `网络错误：${err.message}` : "网络错误",
      err
    );
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new AIError(`HTTP ${resp.status} ${resp.statusText} ${text.slice(0, 300)}`);
  }
  return resp;
}

async function callAPI(
  config: AIConfig,
  body: Record<string, unknown>,
  signal?: AbortSignal
): Promise<ChatCompletionResponse> {
  const resp = await fetchCompletion(config, body, signal);
  try {
    return (await resp.json()) as ChatCompletionResponse;
  } catch (err) {
    throw new AIError("响应不是合法 JSON", err);
  }
}

// ──── Provider 能力检测 ────

export interface ProviderCapabilities {
  /** 是否支持 response_format json_schema（优于 json_object，约束更强） */
  jsonSchema: boolean;
}

/**
 * 检测 provider 是否支持结构化输出（json_schema）。
 * OpenAI / DeepSeek / GLM / Moonshot / SiliconFlow / Zhipu 系均已支持，
 * Ollama 等本地模型不支持。
 */
export function getProviderCapabilities(config: AIConfig): ProviderCapabilities {
  const fp = [
    (config.provider ?? "").toLowerCase(),
    (config.baseURL ?? "").toLowerCase(),
  ].join(" ");
  // 已知支持 json_schema 的 provider 名单
  // ★ DeepSeek 实测：v4-flash 端点返回 400 "response_format type unavailable"（只支持 json_object）
  //    → DeepSeek 保守降级 json_object（运行时若 json_schema 400 会自动回退，见 chat()）
  if (/openai|glm|moonshot|zhipu|siliconflow|api\.together|fireworks/.test(fp)) {
    return { jsonSchema: true };
  }
  return { jsonSchema: false };
}

// ──── Structured Output JSON Schema（Phase 2 编译输出） ────

/**
 * AIResponse 的简化 JSON Schema，用于 response_format json_schema 约束。
 * 只描述结构骨架——详细校验（slider min<max、数值合理性、命令黑名单等）仍由 Zod 负责。
 * 目的：大幅减少 JSON 格式错误（缺括号、key 拼写、类型漂移），降低 AISchemaError 重试率。
 */
const AI_RESPONSE_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    explanation: { type: "string", description: "操作说明，≤500 字" },
    commands: {
      type: "array",
      description: "GGB 命令列表，≤64 条",
      items: {
        type: "object",
        properties: {
          op: {
            type: "string",
            enum: ["eval", "slider", "animate", "trace", "style", "view",
                   "caption", "delete", "reset", "vector", "forceDiagram",
                   "physicsTrace", "unitAxes", "constants"]
          }
        },
        required: ["op"]
      }
    },
    ask: { type: "string", description: "反问用户的内容（与 commands 互斥，有此字段时 commands 为空数组）" },
    self_check: { type: "string", description: "AI 自检报告，≤400 字" }
  },
  required: ["explanation", "commands"],
  additionalProperties: false
};

// ──── 传统 JSON 模式 ────

/**
 * 调用 OpenAI 兼容的 chat completions 接口（优先 json_schema 结构化输出，降级 json_object）。
 * 网络 / 鉴权问题抛 AIError；JSON / schema 问题抛 AISchemaError（可重试）。
 */
export async function chat(
  config: AIConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
  modelOverride?: string
): Promise<AIResponseT> {
  const caps = getProviderCapabilities(config);
  const body: Record<string, unknown> = {
    model: modelOverride ?? config.model,
    messages,
    temperature: config.temperature ?? 0.2,
    stream: false
  };

  // ★ 优先 json_schema（结构化约束更强），降级 json_object
  const usedJsonSchema = caps.jsonSchema;
  if (usedJsonSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: "ai_response",
        strict: false,   // false 以兼容 optional 字段 + discriminatedUnion
        schema: AI_RESPONSE_JSON_SCHEMA
      }
    };
  } else {
    body.response_format = { type: "json_object" };
  }

  // ★ 运行时降级：部分 provider（如 DeepSeek v4-flash）声明支持但端点实际返回 400
  //    "response_format type unavailable" → 回退 json_object 重试一次
  let data: ChatCompletionResponse;
  try {
    data = await callAPI(config, body, signal);
  } catch (err) {
    if (usedJsonSchema && err instanceof AIError && /400/.test(err.message)) {
      console.warn("[aiClient] json_schema 请求被拒（400），回退 json_object 重试");
      body.response_format = { type: "json_object" };
      data = await callAPI(config, body, signal);
    } else {
      throw err;
    }
  }

  const raw = data.choices?.[0]?.message?.content ?? "";
  if (!raw) {
    throw new AISchemaError("AI 响应为空", raw, "choices[0].message.content 为空");
  }

  // 模型偶尔仍会用 ```json 包裹，做一次容错剥离
  const cleaned = stripCodeFence(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new AISchemaError(
      "AI 返回的不是合法 JSON",
      cleaned,
      e instanceof Error ? e.message : "JSON.parse 失败"
    );
  }

  const result = AIResponse.safeParse(parsed);
  if (!result.success) {
    throw new AISchemaError(
      "AI 输出不符合 schema",
      cleaned,
      formatZodError(result.error)
    );
  }
  return result.data;
}

// ──── Function Calling（工具调用）模式 ────

/** SSE 流式分块的最小结构（用于增量解析 tool_calls） */
interface StreamChunk {
  choices?: Array<{
    delta?: {
      content?: string | null;
      reasoning_content?: string | null; // V4 thinking 推理过程（流式增量）
      tool_calls?: Array<{
        index?: number;
        id?: string;
        type?: string;
        function?: { name?: string; arguments?: string };
      }>;
    };
    finish_reason?: string | null;
  }>;
}

/**
 * 发送带工具定义的【流式】对话请求，返回 AI 的文本回复或工具调用请求。
 * - stream:true + SSE 增量解析，content 经 onContent 实时回调（UI 展示减少等待）
 * - tool_calls 按 delta.index 累积合并为完整 JSON 字符串
 * - 不使用 response_format: json_object（与 tools 不兼容）
 * - 兼容回退：部分 provider 忽略 stream:true 返回普通 JSON → 自动按 JSON 解析
 */
export async function agentChat(
  config: AIConfig,
  messages: AgentMessage[],
  tools: ToolDefinition[],
  signal?: AbortSignal,
  modelOverride?: string,
  onContent?: (text: string) => void
): Promise<AgentResponse> {
  const quirks = getProviderQuirks(config);
  const maxTokField = quirks.maxTokensField ?? "max_tokens";
  const body = {
    model: modelOverride ?? config.model,
    messages,
    tools,
    // ★ DeepSeek 对温度敏感，低 temp 减少 tool name 拼写幻觉，同时不抑制多样性
    temperature: quirks.agentTemperature ?? config.temperature ?? 0.2,
    stream: true,
    // 工具 JSON 参数可能较长（create_parametric / eval_raw / eval_sequence），给足空间防截断
    [maxTokField]: 8192
  };

  const resp = await fetchCompletion(config, body, signal);

  // ★ 兼容回退：provider 忽略 stream:true 时返回 application/json
  const contentType = resp.headers.get("content-type") ?? "";
  if (contentType.includes("application/json") && !contentType.includes("text/event-stream")) {
    const data = (await resp.json()) as ChatCompletionResponse;
    const msg = data.choices?.[0]?.message;
    const content = msg?.content ?? null;
    const finishReason = data.choices?.[0]?.finish_reason ?? null;
    const toolCalls: ToolCallDelta[] = (msg?.tool_calls ?? []).map(tc => ({
      id: tc.id,
      type: "function",
      function: { name: tc.function.name, arguments: tc.function.arguments }
    }));
    if (onContent && content) onContent(content);
    return { content, toolCalls, finishReason, reasoningContent: msg?.reasoning_content ?? undefined };
  }

  if (!resp.body) {
    throw new AIError("响应无流（当前环境不支持流式读取）");
  }

  // ★ SSE 流式解析：累积 content + 按 index 合并 tool_calls
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  let reasoningContent = "";
  const toolCalls: ToolCallDelta[] = [];
  let finishReason: string | null = null;

  const handleLine = (line: string): void => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return;
    const data = trimmed.slice(5).trim();
    if (!data || data === "[DONE]") return;

    let chunk: StreamChunk;
    try {
      chunk = JSON.parse(data) as StreamChunk;
    } catch {
      return; // 跳过无法解析的分块
    }

    // ★ 捕获 finish_reason（通常在最后一块的 choice 级别）
    const choiceFinish = chunk.choices?.[0]?.finish_reason;
    if (choiceFinish) finishReason = choiceFinish;

    const delta = chunk.choices?.[0]?.delta;
    if (!delta) return;

    if (typeof delta.content === "string" && delta.content.length > 0) {
      content += delta.content;
      onContent?.(delta.content);
    }

    // ★ V4 thinking：累积 reasoning_content（多轮需回传，不入 UI 流式展示）
    if (typeof delta.reasoning_content === "string" && delta.reasoning_content.length > 0) {
      reasoningContent += delta.reasoning_content;
    }

    if (Array.isArray(delta.tool_calls)) {
      for (const tc of delta.tool_calls) {
        const idx = typeof tc.index === "number" ? tc.index : 0;
        let cur = toolCalls[idx];
        if (!cur) {
          cur = { id: tc.id ?? `call_${idx}`, type: "function", function: { name: "", arguments: "" } };
          toolCalls[idx] = cur;
        }
        if (tc.id) cur.id = tc.id;
        if (tc.function?.name) cur.function.name += tc.function.name;
        if (tc.function?.arguments) cur.function.arguments += tc.function.arguments;
      }
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // 末尾可能是不完整行，留到下一块
      for (const line of lines) handleLine(line);
    }
    if (buffer) {
      buffer += decoder.decode(); // flush 解码器残留
      for (const line of buffer.split("\n")) handleLine(line);
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new AIError("流式响应中断", err);
  }

  const finalToolCalls = toolCalls.filter(tc => tc.function.name.trim().length > 0);

  // ★ 诊断：空响应时记录详细信息便于排查
  if (!content && finalToolCalls.length === 0) {
    console.warn(
      `[agentChat] ${getTraceId()} 空响应: finishReason=${finishReason || "无"}, ` +
      `rawToolCalls=${toolCalls.length}, msgCount=${messages.length}, ` +
      `model=${modelOverride ?? config.model}`
    );
  }

  return { content: content || null, toolCalls: finalToolCalls, finishReason, reasoningContent: reasoningContent || undefined };
}

// ──── Phase 1 精炼（纯文本） ────

/**
 * Phase 1 精炼调用——无 schema 校验，返回纯文本。
 * 用于意图 → 精炼规格阶段（输出自然语言，不是命令 JSON）。
 */
export async function chatRaw(
  config: AIConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
  modelOverride?: string,
  maxTokens?: number,
  /** 约束 AI 输出为 JSON（用于 Phase 1 精炼和满足度评估，降低非 JSON 输出率） */
  jsonMode?: boolean
): Promise<string> {
  const body: Record<string, unknown> = {
    model: modelOverride ?? config.model,
    messages,
    temperature: config.temperature ?? 0.2,
    stream: false
  };
  if (maxTokens) body.max_tokens = maxTokens;
  if (jsonMode) {
    body.response_format = { type: "json_object" };
    // ★ V4 文档明确要求：json_object 模式需合理设置 max_tokens 防 JSON 被截断
    //    未显式传入时给 4K 默认（Phase 1 规格 / 满足度评估输出均远小于此）
    if (!maxTokens) body.max_tokens = 4096;
  }

  const data = await callAPI(config, body, signal);

  return data.choices?.[0]?.message?.content ?? "";
}

// ──── 连接测试 ────

/**
 * 简单的连接测试：让模型返回 {"ok": true}。
 * 不强制 schema，只要 200 + 非空内容即视作通过。
 */
export async function ping(config: AIConfig, signal?: AbortSignal): Promise<void> {
  const baseURL = config.baseURL.replace(/\/+$/, "");
  const resp = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: "Reply with the JSON {\"ok\":true} only." },
        { role: "user", content: "ping" }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 20
    }),
    signal
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new AIError(`HTTP ${resp.status} ${text.slice(0, 200)}`);
  }
}

// ──── 工具 ────

function stripCodeFence(s: string): string {
  // 先剥离 BOM 与首尾空白，再尝试去除 ```json 代码块
  const t = s.replace(/^\uFEFF/, "").trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return m ? m[1].trim() : t;
}
