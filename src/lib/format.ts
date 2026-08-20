/**
 * 数字格式化工具（token 用量统计用）
 */

/** 数字格式化为 k/M 缩写 */
export function fmtTokens(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1_000_000).toFixed(2)}M`;
}
