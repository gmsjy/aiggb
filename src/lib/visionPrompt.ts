/**
 * Vision Extract Prompt —— 题目图片识别（Phase 0）
 *
 * 指示视觉模型从图片中提取结构化题目解读（ProblemAnalysis JSON）。
 */

import type { Domain } from "./prompts";

export function buildVisionExtractPrompt(domain: Domain): string {
  const domainHint =
    domain === "physics"
      ? "本题大概率为高中物理题（力学/电磁学/光学等），注意提取物理量、单位、矢量方向。"
      : "本题大概率为高中数学题（几何/函数/概率等），注意提取几何关系、坐标、公式。";

  return `你是 AiGGB 题目识别助手。从用户上传的图片中提取题目信息，输出结构化 JSON。★ 输出务必精简，只保留绘图所需的核心信息 ★

${domainHint}

【输出格式】★ 只输出一个 JSON 对象，不要输出任何其他文字 ★
{
  "problem_text": "题干转写（公式用 LaTeX $...$），≤1500字，精简保留核心条件",
  "knowns": [{"name":"已知量名","value":数值或字符串,"unit":"单位"}],
  "goal": "求解/绘制目标，≤200字",
  "figure": "图示关键信息（几何关系/矢量方向等），≤300字",
  "animation_hints": [{"type":"slider|animate|trace|other","desc":"建议描述"}],
  "ask": "图片不清或题意存疑时的反问（与 problem_text 互斥，≤200字）"
}

【规则】
- knowns 和 animation_hints 可为空数组 []，不可省略字段
- 多张图片为同一题的多个部分，合并解读
- value 优先用数字，无法确定时用字符串
- animation_hints.type 只能是 slider / animate / trace / other
- 如果图片完全无法辨认，设 ask 说明原因，problem_text 留空
- 不要猜测图中未出现的信息`;
}
