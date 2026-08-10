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

async function callAPI(
  config: AIConfig,
  body: Record<string, unknown>,
  signal?: AbortSignal
): Promise<ChatCompletionResponse> {
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

/**
 * 发送带工具定义的对话请求，返回 AI 的文本回复或工具调用请求。
 * 不使用 response_format: json_object（与 tools 不兼容）。
 */
export async function agentChat(
  config: AIConfig,
  messages: AgentMessage[],
  tools: ToolDefinition[],
  signal?: AbortSignal,
  modelOverride?: string
): Promise<AgentResponse> {
  const body = {
    model: modelOverride ?? config.model,
    messages,
    tools,
    temperature: config.temperature ?? 0.2,
    stream: false
  };

  const data = await callAPI(config, body, signal);

  const choice = data.choices?.[0];
  const msg = choice?.message;
  const content = msg?.content ?? null;
  const toolCalls = msg?.tool_calls ?? [];

  return { content, toolCalls };
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
