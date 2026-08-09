/**
 * Command Corrector —— RAG 增强核心（后置纠正层）
 *
 * 在 schema 校验通过后、ggbBridge 执行前，对每条 eval 命令做：
 *   1. 提取命令名
 *   2. 精确匹配 → 通过
 *   3. 模糊匹配（Levenshtein 编辑距离 ≤ 2）→ 自动纠正
 *   4. 臆造映射 → 提示正确替代
 *   5. 参数个数粗略校验 → 标记潜在问题
 *
 * 返回 { corrected, warnings, suggestions }，供 ChatPanel 在失败修复回路中注入 AI prompt。
 */

import {
  GGB_COMMAND_DEFS,
  findCommand,
  findHallucination,
  type GGBCommandDef,
} from "./ggbKB";

// ── 接口 ──

export interface CorrectionResult {
  /** 原始命令字符串 */
  original: string;
  /** 纠正后命令（如无需纠正则 === original） */
  corrected: string;
  /** 纠正建议（中文明细，供修复 prompt 使用） */
  suggestions: string[];
  /** 是否做了修改 */
  changed: boolean;
  /** 匹配到的命令定义（未匹配则为 undefined） */
  matchedDef?: GGBCommandDef;
}

export interface BatchCorrectionResult {
  /** 对所有 eval 命令的纠正结果 */
  results: CorrectionResult[];
  /** 是否有任何纠正 */
  anyChanged: boolean;
  /** 汇总纠正文本（可注入 AI 修复 prompt） */
  summary: string;
}

// ── Levenshtein 编辑距离（DP，零依赖） ──

function levenshtein(a: string, b: string): number {
  const alen = a.length;
  const blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;

  // 单行 DP（交替两行）
  let prev = Array.from({ length: blen + 1 }, (_, j) => j);
  let curr = new Array<number>(blen + 1);

  for (let i = 1; i <= alen; i++) {
    curr[0] = i;
    for (let j = 1; j <= blen; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
    }
    // 交换指针（prev ← curr, curr ← 旧 prev 的复用数组）
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }

  return prev[blen];
}

// ── 命令名提取 ──

/** 从 eval cmd 字符串提取首命令名。支持 Func(...)、obj=Func(...)、Func[obj,...]、func(var)=... 等形式。 */
function extractCommandName(cmd: string): string | null {
  const trimmed = cmd.trim();

  // 匹配赋值形式：标识符 = 命令(...) 或 标识符 = 命令[...] 或 f(var) = 命令(..)
  const assignRe = /^(?:\w+\s*=\s*)?(\w[\w]*)\s*[([]/;
  const assignM = assignRe.exec(trimmed);
  if (assignM) {
    const name = assignM[1];
    // 排除数学函数（sin/cos 等）和常见不匹配项
    if (/^(sin|cos|tan|abs|sqrt|exp|ln|log|floor|ceil|round|random|pi|e|true|false)$/i.test(name)) {
      return null;
    }
    return name;
  }

  // 匹配非赋值形式：命令(...)
  const directRe = /^(\w[\w]*)\s*[([]/.exec(trimmed);
  if (directRe) {
    const name = directRe[1];
    if (/^(sin|cos|tan|abs|sqrt|exp|ln|log|floor|ceil|round|random|pi|e|true|false)$/i.test(name)) {
      return null;
    }
    return name;
  }

  return null;
}

/** 粗略提取命令参数字符串 */
function extractArgs(cmd: string): string {
  const m = /\(([\s\S]*)\)\s*$/.exec(cmd.trim());
  return m ? m[1].trim() : "";
}

/** 估算参数个数（按顶级逗号计数; 过度简化但能满足大多数情况） */
function countArgs(argsStr: string): number {
  if (!argsStr) return 0;
  let depth = 0;
  let count = 1;
  for (const ch of argsStr) {
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (ch === "," && depth === 0) count++;
  }
  return count;
}

// ── 模糊匹配纠正 ──

const FUZZY_THRESHOLD = 2; // 编辑距离 ≤ 2 视为可纠正

/** 在知识库中模糊搜索 */
function fuzzySearch(name: string): { def: GGBCommandDef; distance: number } | null {
  let best: { def: GGBCommandDef; distance: number } | null = null;
  const target = name.toLowerCase();

  for (const def of GGB_COMMAND_DEFS) {
    const dist = levenshtein(target, def.name.toLowerCase());
    if (dist <= FUZZY_THRESHOLD) {
      if (!best || dist < best.distance) {
        best = { def, distance: dist };
      }
    }
  }

  return best;
}

// ── 主纠正函数 ──

export function correctCommand(cmd: string): CorrectionResult {
  const suggestions: string[] = [];
  let corrected = cmd;
  let changed = false;
  let matchedDef: GGBCommandDef | undefined;

  const cmdName = extractCommandName(cmd);
  if (!cmdName) {
    return { original: cmd, corrected, suggestions: ["未识别命令名"], changed: false, matchedDef: undefined };
  }

  // Step 1: 精确匹配
  const exact = findCommand(cmdName);
  if (exact) {
    matchedDef = exact;
    // 参数个数粗略校验
    const argsStr = extractArgs(cmd);
    const given = countArgs(argsStr);
    const [pmin, pmax] = exact.paramCount;
    if (pmax === -1) {
      if (given < pmin) {
        suggestions.push(`命令 ${cmdName} 最少需要 ${pmin} 个参数，但只给了 ${given} 个`);
      }
    } else {
      if (given < pmin) {
        suggestions.push(`命令 ${cmdName} 需要 ${pmin}~${pmax} 个参数，但只给了 ${given} 个`);
      } else if (given > pmax) {
        suggestions.push(`命令 ${cmdName} 最多接受 ${pmax} 个参数，但给了 ${given} 个`);
      }
    }
    return { original: cmd, corrected, suggestions, changed: false, matchedDef };
  }

  // Step 2: 臆造映射（确定性纠正）
  const halluc = findHallucination(cmdName);
  if (halluc) {
    suggestions.push(`${cmdName} 不存在。推荐：${halluc.correct}（${halluc.reason}）`);
    // 如果纠正方案是单一命令名（而非描述），尝试替换
    const replacementCmd = halluc.correct.match(/^(\w[\w]*)$/);
    if (replacementCmd) {
      const replacementName = replacementCmd[1];
      const newCmd = cmd.replace(new RegExp("\\b" + cmdName + "\\b"), replacementName);
      if (newCmd !== cmd) {
        corrected = newCmd;
        changed = true;
        matchedDef = findCommand(replacementName);
        suggestions.push(`已自动替换：${cmdName} → ${replacementName}`);
      }
    }
    return { original: cmd, corrected, suggestions, changed, matchedDef };
  }

  // Step 3: 模糊匹配（编辑距离 ≤ 2）
  const fuzzy = fuzzySearch(cmdName);
  if (fuzzy) {
    matchedDef = fuzzy.def;
    if (fuzzy.distance === 1) {
      const newCmd = cmd.replace(new RegExp("\\b" + cmdName + "\\b"), fuzzy.def.name);
      corrected = newCmd;
      changed = true;
      suggestions.push(`疑似笔误：${cmdName} → ${fuzzy.def.name}（编辑距离 ${fuzzy.distance}）`);
    } else {
      suggestions.push(`未知命令 ${cmdName}。也许你想用 ${fuzzy.def.name}？（编辑距离 ${fuzzy.distance}）`);
    }
    return { original: cmd, corrected, suggestions, changed, matchedDef };
  }

  // Step 4: 完全未知——可能是有效但不在 KB 中的 GGB 命令，也可能是臆造
  suggestions.push(`警告：${cmdName} 不在已验证命令库中。请确认这是有效的 GGB 命令`);
  return { original: cmd, corrected, suggestions, changed: false, matchedDef: undefined };
}

/** 对整组 Command 对象中所有 eval 命令做批量纠正 */
export function batchCorrect(evalCommands: { cmd: string }[]): BatchCorrectionResult {
  const results = evalCommands.map(c => correctCommand(c.cmd));
  const anyChanged = results.some(r => r.changed);

  const lines: string[] = [];
  for (const r of results) {
    if (r.suggestions.length > 0) {
      const status = r.changed ? "[已纠正]" : "[未纠正]";
      lines.push(`${status} ${r.original} → ${r.corrected}`);
      for (const s of r.suggestions) {
        lines.push(`  └ ${s}`);
      }
    }
  }

  return {
    results,
    anyChanged,
    summary: lines.length > 0
      ? "命令纠正报告（如有误纠正请自动忽略并告知用户）：\n" + lines.join("\n")
      : ""
  };
}

/** 将所有纠正结果汇总为可注入 AI 修复 prompt 的文本 */
export function correctionsToRepairContext(batch: BatchCorrectionResult): string {
  if (!batch.anyChanged && batch.results.every(r => r.suggestions.length === 0)) {
    return "";
  }

  const changedLines: string[] = [];
  const warnLines: string[] = [];

  for (const r of batch.results) {
    if (r.changed) {
      changedLines.push(`  ${r.original} → 已纠正为 ${r.corrected}`);
    }
    if (r.suggestions.length > 0 && !r.changed) {
      warnLines.push(`  ${r.original}: ${r.suggestions.join("; ")}`);
    }
  }

  const parts: string[] = [];
  if (changedLines.length > 0) {
    parts.push("【已自动纠正的命令（请沿用这些纠正后的形式）】\n" + changedLines.join("\n"));
  }
  if (warnLines.length > 0) {
    parts.push("【命令警告（下轮请避免以下用法）】\n" + warnLines.join("\n"));
  }

  return parts.join("\n\n");
}
