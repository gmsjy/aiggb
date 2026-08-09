/**
 * Phase 1 Refined Spec Schema —— 精炼规格输出校验
 *
 * 轻量 Zod schema，校验 Phase 1 AI 输出的自然语言规格。
 * 与 buildRefinePrompt 约定的输出格式严格对应。
 */

import { z } from "zod";

export const RefinedSpec = z
  .object({
    title: z.string().max(60).optional(),
    spec: z.string().max(3000).optional(),
    ask: z.string().max(300).optional()
  })
  .refine(
    o => {
      // ask 与 spec 互斥
      if (o.ask && o.spec) return false;
      // 至少要有一个
      if (!o.ask && !o.spec) return false;
      return true;
    },
    "必须提供 spec 或 ask 之一，且二者不能同时存在"
  );

export type RefinedSpec = z.infer<typeof RefinedSpec>;

/** 精简的 Zod 错误消息 */
export function formatSpecError(err: z.ZodError): string {
  return err.issues
    .map(i => `${i.path.join(".")}: ${i.message}`)
    .slice(0, 5)
    .join("; ");
}
