/**
 * OpenAI 兼容的 AI 客户端 —— 见 SPEC.md §3.2 / §12.2
 */
import { AIResponse, formatZodError, type AIResponse as AIResponseT } from "./schema";

export interface AIConfig {
  provider: string;
  baseURL: string;
  apiKey: string;
  model: string;
  /** Phase 1 精炼用模型（可选，默认复用 model） */
  flashModel?: string;
  temperature?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

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

/**
 * 调用 OpenAI 兼容的 chat completions 接口。
 * 网络 / 鉴权问题抛 AIError；JSON / schema 问题抛 AISchemaError（可重试）。
 */
export async function chat(
  config: AIConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
  modelOverride?: string
): Promise<AIResponseT> {
  const baseURL = config.baseURL.replace(/\/+$/, "");
  const url = `${baseURL}/chat/completions`;

  const body = {
    model: modelOverride ?? config.model,
    messages,
    response_format: { type: "json_object" },
    temperature: config.temperature ?? 0.2,
    stream: false
  };

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

  type ChatCompletionResponse = {
    choices?: Array<{ message?: { content?: string } }>;
  };
  let data: ChatCompletionResponse;
  try {
    data = (await resp.json()) as ChatCompletionResponse;
  } catch (err) {
    throw new AIError("响应不是合法 JSON", err);
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
  const baseURL = config.baseURL.replace(/\/+$/, "");
  const url = `${baseURL}/chat/completions`;

  const body: Record<string, unknown> = {
    model: modelOverride ?? config.model,
    messages,
    temperature: config.temperature ?? 0.2,
    stream: false
  };
  if (maxTokens) body.max_tokens = maxTokens;

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
    throw new AIError(`HTTP ${resp.status} ${text.slice(0, 300)}`);
  }

  type ChatCompletionResponse = {
    choices?: Array<{ message?: { content?: string } }>;
  };
  let data: ChatCompletionResponse;
  try {
    data = (await resp.json()) as ChatCompletionResponse;
  } catch (err) {
    throw new AIError("响应不是合法 JSON", err);
  }

  return data.choices?.[0]?.message?.content ?? "";
}

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

function stripCodeFence(s: string): string {
  // 先剥离 BOM 与首尾空白，再尝试去除 ```json 代码块
  const t = s.replace(/^\uFEFF/, "").trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return m ? m[1].trim() : t;
}
