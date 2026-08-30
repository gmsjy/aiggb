/**
 * 预置 OpenAI 兼容的 AI Provider —— SPEC.md §6.2
 *
 * 各 provider 的 baseURL 与模型清单经官方文档核对（2026-06）：
 *   DeepSeek      https://api.deepseek.com         （不带 /v1）
 *   Moonshot      https://api.moonshot.cn/v1
 *   智谱 GLM      https://open.bigmodel.cn/api/paas/v4
 *   SiliconFlow   https://api.siliconflow.cn/v1
 *   OpenAI        https://api.openai.com/v1
 *   Ollama 本地   http://localhost:11434/v1
 *
 * 所有 provider 均走 OpenAI 兼容 Chat Completions 协议：
 *   POST {baseURL}/chat/completions
 *   Authorization: Bearer <apiKey>
 *   { model, messages, response_format: { type: "json_object" }, temperature, stream: false }
 */

export interface ProviderPreset {
  id: string;
  name: string;
  baseURL: string;
  models: string[];
  /** 默认推荐模型（写到第一个位置） */
  note?: string;
  /** 注册 / 获取 Key 的官方入口 */
  apiKeyUrl?: string;
  /** 支持图片输入的视觉模型候选（题目识别用；实现时按官方文档核对） */
  visionModels?: string[];
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    baseURL: "https://api.deepseek.com",
    models: [
      "deepseek-v4-pro",              // 旗舰，含 thinking 支持
      "deepseek-v4-flash",            // 轻量快速（非思考模式默认）
      "deepseek-v4-flash-vision-exp"  // 视觉模型（图片理解）
    ],
    visionModels: ["deepseek-v4-flash-vision-exp"],
    note: "v4-pro 旗舰、v4-flash 轻量、v4-flash-vision-exp 视觉。Anthropic 端点 (api.deepseek.com/anthropic) 需配合 Anthropic SDK，本工具暂仅支持 OpenAI 兼容端点",
    apiKeyUrl: "https://platform.deepseek.com/api_keys"
  },
  {
    id: "moonshot",
    name: "Moonshot · Kimi",
    baseURL: "https://api.moonshot.cn/v1",
    models: [
      "kimi-k2-0905-preview",   // K2 最新预览
      "kimi-latest",            // 自动最新版（生产推荐）
      "moonshot-v1-128k",       // 长上下文
      "moonshot-v1-32k",
      "moonshot-v1-8k"
    ],
    note: "kimi-latest 始终最新；K2 旗舰；moonshot-v1 系列按上下文长度区分",
    apiKeyUrl: "https://platform.moonshot.cn/console/api-keys"
  },
  {
    id: "zhipu",
    name: "智谱 GLM",
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    models: [
      "glm-4.6",          // 最新旗舰
      "glm-4.6-flash",    // 轻量
      "glm-4.5",
      "glm-4.5-flash",
      "glm-4-plus",       // 老旗舰
      "glm-4-flash"
    ],
    note: "glm-4.6 最新；flash 系列免费",
    apiKeyUrl: "https://open.bigmodel.cn/usercenter/apikeys",
    visionModels: ["glm-4.5v"]
  },
  {
    id: "siliconflow",
    name: "SiliconFlow",
    baseURL: "https://api.siliconflow.cn/v1",
    models: [
      "deepseek-ai/DeepSeek-V3",
      "deepseek-ai/DeepSeek-R1",
      "Qwen/Qwen2.5-72B-Instruct",
      "Qwen/Qwen2.5-Coder-32B-Instruct",
      "moonshotai/Kimi-K2-Instruct"
    ],
    note: "聚合多家开源模型；DeepSeek-V3 / Qwen2.5-72B 性价比高",
    apiKeyUrl: "https://cloud.siliconflow.cn/account/ak",
    visionModels: ["Qwen/Qwen2.5-VL-72B-Instruct"]
  },
  {
    id: "openai",
    name: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    models: [
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4.1",
      "gpt-4.1-mini",
      "o1-mini"
    ],
    note: "境外节点，需自备网络",
    apiKeyUrl: "https://platform.openai.com/api-keys",
    visionModels: ["gpt-4o", "gpt-4.1"]
  },
  {
    id: "ollama",
    name: "Ollama 本地",
    baseURL: "http://localhost:11434/v1",
    models: [
      "qwen2.5:7b",
      "qwen2.5:14b",
      "llama3.1:8b",
      "deepseek-coder-v2:16b"
    ],
    note: "本地推理，需先 ollama serve；不需要 Key",
    apiKeyUrl: "https://ollama.com/library",
    visionModels: ["qwen2.5vl:7b", "llama3.2-vision"]
  },
  {
    id: "custom",
    name: "自定义",
    baseURL: "",
    models: []
  }
];

export function findProvider(id: string): ProviderPreset | undefined {
  return PROVIDER_PRESETS.find(p => p.id === id);
}
