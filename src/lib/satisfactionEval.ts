/**
 * 满足度评估 —— Phase 3.1：画布快照 vs 精炼规格的逻辑审查
 *
 * 核心思路：纯文本模型无法"看"图形，但可以通过读取画布的结构化文本描述
 * （对象名/类型/定义/坐标/颜色/样式），与精炼规格逐项核对，判断是否满足需求。
 *
 * 设计约束：
 *   - 评估基准是【精炼规格】而非原始用户输入（规格已包含 AI 补充的默认值和参数）
 *   - 仅用于两阶段模式（代理模式每步都有工具反馈，不需要独立评估）
 *   - 使用 flash 模型（便宜 + 快速）
 *   - Prompt 控制在 ~300 tokens
 *   - 评估失败不阻断流程（默认通过并记录 warning）
 */

import { z } from "zod";
import { chatRaw as defaultChatRaw, type AIConfig, type ChatMessage, type ContentPart } from "./aiClient";
import { getTraceId } from "./runControl";

// ──── Schema ────

export const SatisfactionResult = z.object({
  satisfied: z.boolean(),
  issues: z.array(z.string().max(120)).max(5),
  summary: z.string().max(200),
});

export type SatisfactionResult = z.infer<typeof SatisfactionResult>;

// ──── 可注入的评估函数签名（供 PipelineDeps 使用） ────

export type EvalSatisfactionFn = (
  config: AIConfig,
  refinedSpec: string,
  snapshot: string,
  signal?: AbortSignal,
  lightModel?: string
) => Promise<SatisfactionResult>;

// ──── 评估 Prompt（~300 tokens） ────

const EVAL_SYSTEM_PROMPT = `你是 GeoGebra 图形逻辑审查员。对照【精炼绘图规格】检查【当前画布快照】，判断是否满足要求。

规则：
1. 规格明确要求的对象是否都存在？
2. 颜色/线型/透明度是否匹配规格？
3. 动画/轨迹是否正确启动？
4. 数学依赖关系是否正确（如对象 P 所依赖的滑块 t 是否存在）？
5. 只报告实际缺失或错误，不要吹毛求疵。

输出 JSON：
{"satisfied":true/false,"issues":["问题描述"],"summary":"一句话总结"}`;

function buildEvalUserMsg(refinedSpec: string, snapshot: string): string {
  return `【精炼绘图规格】\n${refinedSpec}\n\n【当前画布快照】\n${snapshot}`;
}

// ──── 默认实现 ────

/**
 * 调用 flash 模型评估画布是否满足精炼规格。
 *
 * @param chatRawImpl 测试可注入 mock chatRaw，返回纯文本
 */
export async function evaluateSatisfaction(
  config: AIConfig,
  refinedSpec: string,
  snapshot: string,
  signal?: AbortSignal,
  lightModel?: string,
  chatRawImpl?: typeof defaultChatRaw,
  onUsage?: (usage: { prompt: number; completion: number }) => void
): Promise<SatisfactionResult> {
  // 短规格跳过评估（如"画一个点 A 在 (1,2)" → 无需审查）
  const SPEC_MIN_LENGTH = 25;
  if (refinedSpec.trim().length < SPEC_MIN_LENGTH) {
    return { satisfied: true, issues: [], summary: "规格过短，跳过评估" };
  }

  const chatRawFn = chatRawImpl ?? defaultChatRaw;

  const messages: ChatMessage[] = [
    { role: "system", content: EVAL_SYSTEM_PROMPT },
    { role: "user", content: buildEvalUserMsg(refinedSpec, snapshot) }
  ];

  try {
    // ★ V4 json_object 模式有概率返回空 content → 重试 1 次
    //    否则空响应被 JSON.parse("") 当异常吞掉，错误图形被静默标记为 satisfied
    let raw = await chatRawFn(config, messages, signal, lightModel ?? config.model, undefined, true, onUsage);
    if (!raw.trim()) {
      console.warn(`[satisfactionEval] ${getTraceId()} 空响应，重试 1 次`);
      raw = await chatRawFn(config, messages, signal, lightModel ?? config.model, undefined, true, onUsage);
    }
    const cleaned = raw.trim()
      .replace(/^```json?\s*/, "").replace(/\s*```$/, "")
      .replace(/^\uFEFF/, "");

    const parsed = JSON.parse(cleaned);

    // 容错：AI 可能返回 { satisfied: "true" } 字符串
    if (typeof parsed.satisfied === "string") {
      parsed.satisfied = parsed.satisfied.toLowerCase() === "true";
    }

    const result = SatisfactionResult.safeParse(parsed);
    if (result.success) return result.data;

    // Zod 校验失败 → 宽松解析
    return {
      satisfied: Boolean(parsed.satisfied),
      issues: Array.isArray(parsed.issues) ? parsed.issues.slice(0, 5) : [],
      summary: typeof parsed.summary === "string"
        ? parsed.summary.slice(0, 200)
        : "评估解析异常"
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    // 评估本身出错不应阻断流程 → 默认通过，记 warning
    console.warn("[satisfactionEval] 评估调用失败，默认通过", err);
    return {
      satisfied: true,
      issues: [],
      summary: `评估调用失败：${err instanceof Error ? err.message.slice(0, 100) : "未知"}`
    };
  }
}

// ──── 修复 Prompt（评估不满足时使用） ────

export function buildSatisfactionRepairPrompt(
  refinedSpec: string,
  issues: string[],
  snapshot: string
): string {
  const issueLines = issues.map((s, i) => `${i + 1}. ${s}`).join("\n");
  return `你是 AiGGB 修复助手。上一轮生成的图形经审查存在以下问题，请修正。

【精炼绘图规格】
${refinedSpec}

【当前画布状态】
${snapshot}

【审查发现的问题】
${issueLines}

【修复要求】
1. 只输出修正后的 commands JSON（{ "explanation": "...", "commands": [...] }）
2. 保留画布上已正确的对象（不要删除或重建）
3. 针对每个问题逐一修正：缺失对象 → 创建；颜色/样式不符 → 用 style op 修正；依赖缺失 → 补充声明
4. 如果某个问题无法修复（如超出 GGB 能力），在 explanation 中说明`;
}

// ──── 视觉审查（画布截图 + 视觉模型） ────

const VISUAL_REVIEW_SYSTEM_PROMPT = `你是 GeoGebra 画布视觉审查员。对照【题目要求】检查【画布截图】，从"看图"角度判断绘制结果是否达标。

规则：
1. 题目要求的核心对象/轨迹是否真的画出来了（截图中可见）？
2. 位置与比例：轨迹是否明显超出视窗、对象是否过度拥挤或互相遮挡、标注是否可读？
3. 颜色/样式是否与要求一致（如"红色轨迹""蓝色小球"）？
4. 截图只是动画的某一瞬间：动画是否启动、滑块是否可调等动态要求不要从截图判断（由文本快照核对负责）。
5. 坐标轴、网格、GGB 界面元素本身不是问题。
6. 只报告截图中明确可见的问题，不要吹毛求疵；最多 5 条。

输出 JSON：
{"satisfied":true/false,"issues":["问题描述"],"summary":"一句话总结"}`;

/**
 * 视觉审查：画布截图 + 视觉模型，判断渲染效果是否满足题目要求。
 *
 * 与 evaluateSatisfaction（文本结构核对）并存：结构问题归文本快照，
 * 视觉问题（出框/遮挡/样式不符/标注不可读）归截图。失败不阻断（默认通过）。
 *
 * @param basis        确认后的序列化题目解读（serializeProblem 输出）
 * @param imageDataUrl 画布截图 data URL（exportPNG 产出）
 * @param visionModel  视觉模型名（缺省回退 config.model）
 * @param chatRawImpl  测试可注入 mock
 */
export async function evaluateVisual(
  config: AIConfig,
  basis: string,
  imageDataUrl: string,
  signal?: AbortSignal,
  visionModel?: string,
  chatRawImpl?: typeof defaultChatRaw,
  onUsage?: (usage: { prompt: number; completion: number }) => void
): Promise<SatisfactionResult> {
  if (!imageDataUrl.trim()) {
    return { satisfied: true, issues: [], summary: "无截图，跳过视觉核对" };
  }

  const chatRawFn = chatRawImpl ?? defaultChatRaw;
  // ★ 视觉审查同为感知任务：跳过 thinking（防 reasoning 挤占输出预算）+ 显式输出上限
  //   （同 extractProblem 的截断教训：多数视觉模型不支持 json_object，输出上限需显式给）
  const vConfig: AIConfig = { ...config, reasoningEffort: undefined };
  const messages: ChatMessage[] = [
    { role: "system", content: VISUAL_REVIEW_SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        { type: "text", text: `【题目要求】\n${basis}` },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ] as ContentPart[]
    }
  ];

  try {
    let raw = await chatRawFn(vConfig, messages, signal, visionModel ?? config.model, 4096, false, onUsage);
    if (!raw.trim()) {
      console.warn(`[satisfactionEval] ${getTraceId()} 视觉审查空响应，重试 1 次`);
      raw = await chatRawFn(vConfig, messages, signal, visionModel ?? config.model, 4096, false, onUsage);
    }
    if (!raw.trim()) {
      return { satisfied: true, issues: [], summary: "视觉审查空响应，跳过" };
    }

    const cleaned = raw.trim()
      .replace(/^```json?\s*/, "").replace(/\s*```$/, "")
      .replace(/^\uFEFF/, "");

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // 截断/夹带文字时尝试提取首个 {...} 块（仿 parseProblemAnalysis 容错）
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("视觉审查输出非 JSON");
      parsed = JSON.parse(m[0]);
    }

    // 容错：satisfied 可能是字符串
    if (typeof parsed.satisfied === "string") {
      parsed.satisfied = (parsed.satisfied as string).toLowerCase() === "true";
    }

    const result = SatisfactionResult.safeParse(parsed);
    if (result.success) return result.data;

    return {
      satisfied: Boolean(parsed.satisfied),
      issues: Array.isArray(parsed.issues) ? parsed.issues.slice(0, 5) : [],
      summary: typeof parsed.summary === "string" ? parsed.summary.slice(0, 200) : "视觉审查解析异常"
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    // 视觉审查失败不阻断（延续「失败不阻断」哲学）→ 默认通过
    console.warn(`[satisfactionEval] ${getTraceId()} 视觉审查调用失败，跳过`, err);
    return {
      satisfied: true,
      issues: [],
      summary: `视觉审查失败：${err instanceof Error ? err.message.slice(0, 100) : "未知"}`
    };
  }
}
