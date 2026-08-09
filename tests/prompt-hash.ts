/**
 * Prompt 版本指纹 —— 每次修改 prompts/commands 后 hash 会变
 *
 * 不依赖 crypto 模块（浏览器兼容），使用简单 djb2 + 长度混合。
 * 精度足够区分 prompt 变更，不是安全级 hash。
 */
import { buildSystemPrompt } from "../src/lib/prompts";

/** 计算当前所有提示词组合的指纹 */
export function hashPrompt(): string {
  const general = buildSystemPrompt("general");
  const physics = buildSystemPrompt("physics");
  return djb2(general + physics);
}

/** 返回详细版本信息供记录 */
export function promptVersion() {
  const general = buildSystemPrompt("general");
  const physics = buildSystemPrompt("physics");

  return {
    hash: hashPrompt(),
    generalChars: general.length,
    physicsChars: physics.length,
    generalTokens: Math.round(general.length / 1.3),
    physicsTokens: Math.round(physics.length / 1.3),
    timestamp: Date.now()
  };
}

function djb2(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) & 0xffffffff;
  }
  return (h >>> 0).toString(16).padStart(8, "0") + "_" + s.length.toString(36);
}
