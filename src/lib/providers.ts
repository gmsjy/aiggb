/**
 * 预置 OpenAI 兼容的 AI Provider —— SPEC.md §6.2
 *
 * 各 provider 的 baseURL 与模型清单经官方文档核对（2026-10）：
 *   DeepSeek      https://api.deepseek.com         （不带 /v1；2026-10-17 发布 V4.1-Flash-1017）
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
      "deepseek-flash",              // V4.1-Flash-1017（2026-10-17）：原生多模态，1M 上下文
      "deepseek-v4-pro",             // V4-Pro-0813：仍在服务（价格约 flash 4 倍，不支持图片）
      "deepseek-v4-flash",           // 旧模型名：已下线，服务端路由到 V4.1-Flash-1017（兼容保留）
      "deepseek-v4-flash-vision-exp" // 旧视觉实验版：已下线，同样路由到 V4.1-Flash-1017
    ],
    visionModels: ["deepseek-flash"],
    note:
      "deepseek-flash = V4.1-Flash-1017（2026-10-17）：原生多模态、1M 上下文、max_tokens 上限 384K，已取代全部旧 flash 系列。" +
      "deepseek-v4-pro 仍在服务，价格约为 flash 的 4 倍且不支持图片输入；旧模型名仅作路由兼容，新配置请用 deepseek-flash",
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
      "glm-5.3-flash",    // GLM 5.3 闪速版（需资源包）
      "glm-4.6",          // 最新旗舰
      "glm-4.6-flash",    // 轻量
      "glm-4.5-flash",    // 免费档
      "glm-4.5",
      "glm-4-plus",       // 老旗舰
      "glm-4-flash"
    ],
    note: "glm-5.3-flash 最新闪速版；glm-4.6 旗舰；glm-4.5-flash 免费。thinking 参数由应用自动适配（默认关闭思考）",
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

/**
 * 判断某个模型是否支持图片输入（多模态）。
 *
 * 数据源：preset.visionModels（各 provider 的视觉候选清单）+ 常见命名启发式。
 * ★ 用途：带图轮会把原题图片一路传给 Agent 模型（见 pipeline.ts 的 images 贯通），
 *   若 Agent/主力模型不支持图片，image_url 会被服务端忽略 → 静默退化为纯文字构造。
 *   这里用于在设置面板给出明确提示，而不是让用户事后困惑「为什么它没看我的图」。
 *
 * 注意：这是「已知清单」判断，不是权威能力探测。未知模型返回 false（保守），
 * 但 settings 侧仅用于「提示」，不会阻止保存。
 */
export function modelSupportsVision(
  providerId: string,
  model: string | undefined,
  baseURL?: string
): boolean {
  const m = (model ?? "").trim().toLowerCase();
  if (!m) return false;

  // 1) 已知视觉候选清单（provider 预设，或按 baseURL 反查——用户可能用了自定义 provider）
  const presets = [findProvider(providerId)];
  if (baseURL) {
    const b = baseURL.toLowerCase();
    const byUrl = PROVIDER_PRESETS.find(p => p.baseURL && b.includes(p.baseURL.toLowerCase().replace(/^https?:\/\//, "")));
    if (byUrl) presets.push(byUrl);
  }
  for (const p of presets) {
    if (p && (p.visionModels ?? []).some(v => v.toLowerCase() === m)) return true;
  }

  // 2) 命名启发式（官方命名较稳定，覆盖清单外的常见多模态模型）
  //    视觉/VL/vision/omni/4o 系列；排除 -pro 等明确不带视觉的 DeepSeek 型号
  if (/^deepseek-v4-pro$/.test(m)) return false;
  if (/(vision|vl|omni|gpt-4o|gpt-4\.1|gemini|claude-3|claude-4|qwen.*vl)/.test(m)) return true;
  if (/^deepseek-flash$/.test(m) || /^deepseek-v4-flash-vision-exp$/.test(m)) return true;

  return false;
}
