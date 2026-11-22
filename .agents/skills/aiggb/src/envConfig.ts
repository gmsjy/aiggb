/**
 * [aiggb skill] 配置装配 —— 环境变量 / 命令行 flag → AIConfig
 *
 * 与主应用（useAppStore / SettingsDialog）完全解耦：任何 OpenAI 兼容端点均可。
 * 优先级：命令行 flag > 环境变量 > 默认值。
 *
 * 环境变量：
 *   AIGGB_BASE_URL            默认 https://api.deepseek.com
 *   AIGGB_API_KEY             必填（在线命令）
 *   AIGGB_MODEL               默认 deepseek-chat
 *   AIGGB_LIGHT_MODEL         可选，精炼/评估用轻量模型（回退 model）
 *   AIGGB_REASONING_EFFORT    none|low|high|max，默认 none（实测关闭最优）
 *   AIGGB_MAX_OUTPUT_TOKENS   默认 16384
 *   AIGGB_TEMPERATURE         可选
 */

import type { AIConfig } from "./aiClient";

export const DEFAULT_BASE_URL = "https://api.deepseek.com";
export const DEFAULT_MODEL = "deepseek-chat";
const REASONING_LEVELS = ["none", "low", "medium", "high", "max"] as const;
type ReasoningEffort = (typeof REASONING_LEVELS)[number];

export interface RuntimeFlags {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  lightModel?: string;
  reasoningEffort?: string;
  maxOutputTokens?: number;
  temperature?: number;
}

/** 缺少 API Key 等配置性错误——退出码 2，输出如何配置的指引 */
export class MissingKeyError extends Error {
  constructor() {
    super(
      "缺少 API Key。请设置环境变量 AIGGB_API_KEY（或用 --api-key 传入）。\n" +
        "其他可选环境变量：AIGGB_BASE_URL（默认 https://api.deepseek.com）、AIGGB_MODEL（默认 deepseek-chat）、\n" +
        "AIGGB_LIGHT_MODEL、AIGGB_REASONING_EFFORT（none|low|high|max，默认 none）、AIGGB_MAX_OUTPUT_TOKENS、AIGGB_TEMPERATURE。"
    );
    this.name = "MissingKeyError";
  }
}

function normalizeEffort(v: string | undefined): ReasoningEffort | undefined {
  if (!v) return undefined;
  const s = v.trim().toLowerCase();
  return (REASONING_LEVELS as readonly string[]).includes(s) ? (s as ReasoningEffort) : undefined;
}

function num(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function buildAIConfig(flags: RuntimeFlags): AIConfig {
  const env = process.env;
  const apiKey = flags.apiKey ?? env.AIGGB_API_KEY;
  if (!apiKey) throw new MissingKeyError();
  return {
    provider: "custom",
    baseURL: flags.baseUrl ?? env.AIGGB_BASE_URL ?? DEFAULT_BASE_URL,
    apiKey,
    model: flags.model ?? env.AIGGB_MODEL ?? DEFAULT_MODEL,
    lightModel: flags.lightModel ?? env.AIGGB_LIGHT_MODEL,
    reasoningEffort: normalizeEffort(flags.reasoningEffort ?? env.AIGGB_REASONING_EFFORT) ?? "none",
    maxOutputTokens: flags.maxOutputTokens ?? num(env.AIGGB_MAX_OUTPUT_TOKENS),
    temperature: flags.temperature ?? num(env.AIGGB_TEMPERATURE)
  };
}
