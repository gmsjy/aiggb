/**
 * 题目识别输出 Schema —— 视觉模型 ProblemAnalysis 校验
 *
 * 仿 specSchema.ts：剥 code fence + Zod 容错 + 确定性序列化。
 */

import { z } from "zod";

export interface ProblemKnown {
  name: string;
  value?: number | string;
  unit?: string;
}

export interface AnimationHint {
  type: "slider" | "animate" | "trace" | "other";
  desc: string;
}

export interface ProblemAnalysis {
  problem_text: string;
  knowns: ProblemKnown[];
  goal?: string;
  figure?: string;
  animation_hints: AnimationHint[];
  ask?: string;
}

const VALID_HINT_TYPES = new Set(["slider", "animate", "trace", "other"]);

const ProblemKnownSchema = z.object({
  name: z.string(),
  value: z.union([z.number(), z.string()]).optional(),
  unit: z.string().optional(),
});

const AnimationHintSchema = z.object({
  type: z.string(),
  desc: z.string(),
});

const ProblemAnalysisSchema = z.object({
  problem_text: z.string().max(1500).default(""),
  knowns: z.preprocess(
    v => Array.isArray(v) ? v : [],
    z.array(ProblemKnownSchema).default([])
  ),
  goal: z.string().max(200).optional(),
  figure: z.string().max(300).optional(),
  animation_hints: z.preprocess(
    v => Array.isArray(v) ? v : [],
    z.array(AnimationHintSchema).default([])
  ),
  ask: z.string().max(200).optional(),
});

function stripFence(s: string): string {
  const t = s.replace(/^\uFEFF/, "").trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return m ? m[1].trim() : t;
}

export function parseProblemAnalysis(raw: string): ProblemAnalysis | null {
  const cleaned = stripFence(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // retry with format hint
    try {
      const retryMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!retryMatch) return null;
      parsed = JSON.parse(retryMatch[0]);
    } catch {
      return null;
    }
  }

  const result = ProblemAnalysisSchema.safeParse(parsed);
  if (!result.success) return null;

  const data = result.data;

  // problem_text empty and no ask → recognition failure
  if (!data.problem_text.trim() && !data.ask) return null;

  // normalize hint types
  const hints: AnimationHint[] = data.animation_hints.map(h => ({
    type: VALID_HINT_TYPES.has(h.type) ? (h.type as AnimationHint["type"]) : "other",
    desc: h.desc,
  }));

  return {
    problem_text: data.problem_text,
    knowns: data.knowns,
    goal: data.goal || undefined,
    figure: data.figure || undefined,
    animation_hints: hints,
    ask: data.ask || undefined,
  };
}

export function serializeProblem(p: ProblemAnalysis): string {
  const sections: string[] = [];

  if (p.problem_text.trim()) {
    sections.push(`【题干】\n${p.problem_text.trim()}`);
  }

  if (p.knowns.length > 0) {
    const lines = p.knowns.map(k => {
      const val = k.value !== undefined ? ` = ${k.value}` : "";
      const unit = k.unit ? ` ${k.unit}` : "";
      return `${k.name}${val}${unit}`;
    });
    sections.push(`【已知量】\n${lines.join("\n")}`);
  }

  if (p.goal?.trim()) {
    sections.push(`【目标】\n${p.goal.trim()}`);
  }

  if (p.figure?.trim()) {
    sections.push(`【图示信息】\n${p.figure.trim()}`);
  }

  if (p.animation_hints.length > 0) {
    const lines = p.animation_hints.map(h => `[${h.type}] ${h.desc}`);
    sections.push(`【动画要素建议】\n${lines.join("\n")}`);
  }

  return sections.join("\n\n");
}
