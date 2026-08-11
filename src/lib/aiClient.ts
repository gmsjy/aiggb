/**
 * OpenAI 兼容的 AI 客户端 —— 见 SPEC.md §3.2 / §12.2
 *
 * 支持两种模式：
 *   1. chat() —— 传统 JSON 模式（Phase 1/2 用，response_format: json_object）
 *   2. agentChat() —— Function Calling 模式（工具调用代理用，不含 response_format）
 */

import { AIResponse, formatZodError, type AIResponse as AIResponseT } from "./schema";
import type { ToolDefinition } from "./tools";

// ──── 配置与消息类型 ────

export interface AIConfig {
  provider: string;
  baseURL: string;
  apiKey: string;
  /** 主力模型（编译/修复/降级）—— 也是所有角色未配置时的回退模型 */
  model: string;
  /** 轻量模型（精炼/评估）。不设置时回退到 flashModel → model */
  lightModel?: string;
  /** Agent 模式模型。不设置时回退到 heavyModel → model */
  agentModel?: string;
  /** 主力任务的独立模型。不设置时回退到 model */
  heavyModel?: string;
  /** @deprecated 使用 lightModel 代替；迁移后保留用于向前兼容 */
  flashModel?: string;
  temperature?: number;
}

/** 解析实际使用的模型（含回退链） */
export function resolveModel(config: AIConfig, role: "light" | "heavy" | "agent"): string {
  switch (role) {
    case "light":
      return config.lightModel ?? config.flashModel ?? config.model;
    case "heavy":
      return config.heavyModel ?? config.model;
    case "agent":
      return config.agentModel ?? config.heavyModel ?? config.model;
  }
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

// ──── 传统 JSON 模式 ────

/**
 * 调用 OpenAI 兼容的 chat completions 接口（JSON 模式）。
 * 网络 / 鉴权问题抛 AIError；JSON / schema 问题抛 AISchemaError（可重试）。
 */
export async function chat(
  config: AIConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
  modelOverride?: string
): Promise<AIResponseT> {
  const body = {
    model: modelOverride ?? config.model,
    messages,
    response_format: { type: "json_object" },
    temperature: config.temperature ?? 0.2,
    stream: false
  };

  const data = await callAPI(config, body, signal);

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
  const body = {
    model: modelOverride ?? config.model,
    messages,
    tools,
    temperature: config.temperature ?? 0.2,
    stream: true,
    // 工具 JSON 参数可能较长（create_parametric / eval_raw / eval_sequence），给足空间防截断
    max_tokens: 8192
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
    return { content, toolCalls, finishReason };
  }

  if (!resp.body) {
    throw new AIError("响应无流（当前环境不支持流式读取）");
  }

  // ★ SSE 流式解析：累积 content + 按 index 合并 tool_calls
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
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
      `[agentChat] 空响应: finishReason=${finishReason || "无"}, ` +
      `rawToolCalls=${toolCalls.length}, msgCount=${messages.length}, ` +
      `model=${modelOverride ?? config.model}`
    );
  }

  return { content: content || null, toolCalls: finalToolCalls, finishReason };
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
  maxTokens?: number
): Promise<string> {
  const body: Record<string, unknown> = {
    model: modelOverride ?? config.model,
    messages,
    temperature: config.temperature ?? 0.2,
    stream: false
  };
  if (maxTokens) body.max_tokens = maxTokens;

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
  const t = s.replace(/^﻿/, "").trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return m ? m[1].trim() : t;
}
