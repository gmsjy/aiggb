/**
 * 测试断言库 —— 对 AI 响应 + Mock 执行结果做行为级校验
 */
import type { AIResponse, Command } from "../src/lib/schema";
import type { ExecResult } from "../src/lib/ggbBridge";

export interface CaseExpectation {
  /** AI 输出的命令必须包含这些 GGB 命令名（如 "Slider"） */
  mustContainCommands?: string[];
  /** AI 输出禁止出现这些命令名 */
  mustNotContainCommands?: string[];
  /** AI 输出必须使用这些 op */
  mustHaveOps?: string[];
  /** 命令数量范围 */
  commandCount?: { min?: number; max?: number };
  /** 必须通过 constants op 引入的物理常量 */
  mustContainConstants?: string[];
  /** 必须命中的正则模式 */
  mustContainPatterns?: string[];
  /** 禁止命中的正则模式 */
  mustNotPatterns?: string[];
  /** ggbBridge 执行成功率下限（0~1） */
  executeSuccessRate?: number;
  /** 是否应触发反问 ask */
  containsAsk?: boolean;
  /** schema 校验是否必须通过 */
  schemaValid?: boolean;
  /** 必须引用 context 中已存在对象 */
  mustReferenceExisting?: boolean;
}

export interface AssertResult {
  pass: boolean;
  failures: string[];
}

export function assertResponse(
  resp: AIResponse,
  results: ExecResult[],
  exp: CaseExpectation,
  existingObjects: string[] = []
): AssertResult {
  const failures: string[] = [];

  // containsAsk
  if (exp.containsAsk !== undefined) {
    const hasAsk = !!resp.ask;
    if (hasAsk !== exp.containsAsk) {
      failures.push(`containsAsk=${hasAsk}，期望 ${exp.containsAsk}`);
    }
  }

  // schemaValid 默认为 true（能解析就算通过）
  if (exp.schemaValid === false) {
    failures.push("意外通过 schema 校验");
  }

  // 命令数量
  if (exp.commandCount) {
    const n = resp.commands.length;
    if (exp.commandCount.min !== undefined && n < exp.commandCount.min) {
      failures.push(`命令数 ${n} < min ${exp.commandCount.min}`);
    }
    if (exp.commandCount.max !== undefined && n > exp.commandCount.max) {
      failures.push(`命令数 ${n} > max ${exp.commandCount.max}`);
    }
  }

  // 收集所有 eval 命令的原始字符串 + slider op 隐含的 Slider(...) 调用
  const allEvalCmds = resp.commands
    .filter(c => c.op === "eval")
    .map(c => (c as { cmd: string }).cmd)
    .concat(
      // slider op 在 ggbBridge 中展开为 name = Slider(...)
      resp.commands
        .filter(c => c.op === "slider")
        .map(c => `${(c as { name: string }).name} = Slider(...)`)
    )
    .concat(
      // vector op 展开为 name = Vector(from, to)
      resp.commands
        .filter(c => c.op === "vector")
        .map(c => `${(c as { name: string }).name} = Vector(...)`)
    )
    .concat(
      // forceDiagram 展开为多个 Vector
      resp.commands
        .filter(c => c.op === "forceDiagram")
        .flatMap(c => (c as { forces: { name: string }[] }).forces.map(f => `${f.name} = Vector(...)`))
    )
    .join("\n");

  // 收集所有 op
  const allOps = new Set(resp.commands.map(c => c.op));

  // mustHaveOps
  if (exp.mustHaveOps) {
    for (const op of exp.mustHaveOps) {
      if (!allOps.has(op as Command["op"])) {
        failures.push(`缺少 op: ${op}`);
      }
    }
  }

  // mustContainCommands —— 检查 eval cmd 字符串中是否出现该 GGB 命令名
  if (exp.mustContainCommands) {
    for (const cmdName of exp.mustContainCommands) {
      const re = new RegExp(`\\b${cmdName}\\s*\\(`);
      if (!re.test(allEvalCmds)) {
        failures.push(`缺少 GGB 命令: ${cmdName}`);
      }
    }
  }

  // mustNotContainCommands
  if (exp.mustNotContainCommands) {
    for (const cmdName of exp.mustNotContainCommands) {
      const re = new RegExp(`\\b${cmdName}\\s*\\(`);
      if (re.test(allEvalCmds)) {
        failures.push(`不应出现的命令: ${cmdName}`);
      }
    }
  }

  // mustContainPatterns — 检查 eval 命令 + op 名称
  if (exp.mustContainPatterns) {
    for (const pat of exp.mustContainPatterns) {
      const re = new RegExp(pat);
      const opNames = [...allOps].join(" ");
      if (!re.test(allEvalCmds) && !re.test(opNames)) {
        failures.push(`缺少正则模式: ${pat}`);
      }
    }
  }

  // mustNotPatterns
  if (exp.mustNotPatterns) {
    for (const pat of exp.mustNotPatterns) {
      const re = new RegExp(pat);
      if (re.test(allEvalCmds)) {
        failures.push(`匹配到禁用模式: ${pat}`);
      }
    }
  }

  // mustContainConstants
  if (exp.mustContainConstants) {
    const constantOps = resp.commands.filter(c => c.op === "constants") as Array<{ names: string[] }>;
    const introduced = new Set(constantOps.flatMap(c => c.names));
    for (const name of exp.mustContainConstants) {
      if (!introduced.has(name)) {
        failures.push(`未通过 constants op 引入: ${name}`);
      }
    }
  }

  // executeSuccessRate
  if (exp.executeSuccessRate !== undefined && results.length > 0) {
    const ok = results.filter(r => r.ok).length;
    const rate = ok / results.length;
    if (rate < exp.executeSuccessRate) {
      const failed = results.filter(r => !r.ok).map(r => `${r.command.op}: ${r.error}`);
      failures.push(
        `执行成功率 ${(rate * 100).toFixed(0)}% < ${(exp.executeSuccessRate * 100).toFixed(0)}%; 失败: ${failed.join("; ")}`
      );
    }
  }

  // mustReferenceExisting —— 至少一条命令引用 context 中对象
  if (exp.mustReferenceExisting && existingObjects.length > 0) {
    const allText = JSON.stringify(resp.commands);
    const refed = existingObjects.some(name =>
      new RegExp(`\\b${name}\\b`).test(allText)
    );
    if (!refed) {
      failures.push(`未引用 context 已存在对象 ${existingObjects.join(", ")}`);
    }
  }

  return { pass: failures.length === 0, failures };
}
