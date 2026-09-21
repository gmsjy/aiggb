/**
 * Command Validate —— GGB 命令静态语法预检（执行前最后一道确定性防线）
 *
 * 背景：AI 生成的 `Sequence`（序列）类命令失败率长期偏高，根因不是"命令名写错"，
 * 而是**参数结构错误**——GGB 引擎只会回一句「Sequence 执行失败」，模型看不到
 * 具体哪错了，于是下一轮继续犯同样的错（见用户反馈截图：
 * `Sequence(Cube((i,j,k),(i+1,j,k).e(i,j+1,k),i,0,1,0.1)` —— 少一个逗号 +
 * 圆括号未闭合 + 循环区间被挤进单个参数）。
 *
 * 本模块在与 GGB 引擎交互**之前**做纯文本静态检查，返回可直接回喂模型的
 * 「具体错在哪 + 正确形态」提示，把模糊的引擎失败变成可自愈的确定性错误。
 *
 * 检查项：
 *   1. 括号/方括号/花括号配对（含字符串字面量、|…| 绝对值豁免）
 *   2. 句点误用为参数分隔符 / 圆括号后跟裸标识符（`.` 与 `,` 手误）
 *   3. Sequence 参数契约（循环变量必须是单个 ASCII 字母；区间不能压进一个参数）
 *   4. Sequence 表达式尾部残留字符（`(i,j,k).e` 这类多打一个字母）
 *   5. 命令参数个数（对照 ggbKB 的 paramCount）
 *   6. 表达式以运算符结尾
 *   7. 属性命令专项（SetColor/SetFilling/SetLineOpacity…）：
 *      3D 模式禁令（传入 mode 时）、RGB 值域 0~1、透明度 0~1、颜色名形态
 *   8. scripting 语句嵌套：Set＊、Show＊、ZoomIn 等语句不产出值，只能作整条命令头部，
 *      嵌进 Sequence/Zip/If 等表达式位置引擎必拒（5.4.927 实测）
 */

import { findCommand } from "./ggbKB";

// ── 类型 ──

export type CommandIssueKind =
  | "unbalanced"
  | "stray-dot"
  | "sequence-var"
  | "sequence-arity"
  | "sequence-trailing"
  | "sequence-var-only"
  | "arg-count"
  | "trailing-operator"
  | "mode-forbidden"
  | "value-range"
  | "color-name"
  | "scripting-nest";

export interface CommandIssue {
  kind: CommandIssueKind;
  /** 人类可读的具体说明（含期望形态），直接进修复 prompt */
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: CommandIssue[];
  /** 汇总文本（多条 issue 用换行连接），便于直接抛错/回喂 */
  message: string;
}

// ── 引号/括号扫描工具 ──

/** 去掉字符串字面量内容（保留定界符位置，避免下标错位），供括号计数使用 */
function stripStrings(s: string): string {
  let out = "";
  let quote: string | null = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
        out += ch;
      } else {
        out += " "; // 内容挖空，保持长度
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      continue;
    }
    out += ch;
  }
  return out;
}

interface BracketScan {
  ok: boolean;
  /** 出错位置（1-based） */
  position: number;
  detail: string;
}

/**
 * 括号配对 + 正确嵌套检查。
 *
 * 坐标 (x,y) 与函数调用共用圆括号，因此这里用**统一嵌套规则**扫描：
 * `Vector((0,0),(dx,dy))`、`Sequence(Cube((i,j,k),…), i, 0, 1, 1)` 都能正确配平。
 *
 * ★ 不做"坐标豁免"是有意为之：正是那类豁免会把
 *   `Sequence(Cube((i,j,k),(i+1,j,k).e(i,j+1,k),i,0,1,0.1)` 误判为配平
 *   （少一个逗号产生的多余 `)` 被当坐标收尾吞掉），从而漏掉用户最常踩的坑。
 */
export function checkBracketBalance(cmd: string): BracketScan {
  const s = stripStrings(cmd);
  const stack: Array<{ ch: string; pos: number }> = [];
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const closers = new Set([")", "]", "}"]);
  let absoluteBarOpen = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (ch === "|") {
      // `||`（逻辑或）不参与绝对值配对
      if (s[i + 1] === "|") {
        i++;
        continue;
      }
      absoluteBarOpen = !absoluteBarOpen;
      continue;
    }

    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push({ ch, pos: i + 1 });
      continue;
    }

    if (closers.has(ch)) {
      const want = pairs[ch];
      if (stack.length === 0) {
        return {
          ok: false,
          position: i + 1,
          detail: `第 ${i + 1} 个字符处出现多余的 '${ch}'（前面没有与之配对的 '${want}'）—— 常见于漏写逗号/多打括号`,
        };
      }
      const top = stack[stack.length - 1];
      if (top.ch !== want) {
        return {
          ok: false,
          position: i + 1,
          detail: `第 ${i + 1} 个字符 '${ch}' 与第 ${top.pos} 个字符未闭合的 '${top.ch}' 不匹配`,
        };
      }
      stack.pop();
      continue;
    }
  }

  if (absoluteBarOpen) {
    return { ok: false, position: s.length, detail: "绝对值符号 '|' 未闭合（每个 '|' 都需要成对出现）" };
  }
  if (stack.length > 0) {
    const last = stack[stack.length - 1];
    return {
      ok: false,
      position: s.length,
      detail:
        `命令结束时仍有 ${stack.length} 个左括号未闭合（最早的 '${last.ch}' 在第 ${last.pos} 个字符处）。` +
        `注意嵌套调用（Sequence 套 Cube/Vector 等）必须逐个闭合`,
    };
  }
  return { ok: true, position: -1, detail: "" };
}

// ── 参数切分 ──

/** 按顶层逗号切分参数（尊重 () [] {} 嵌套与字符串字面量） */
export function splitTopLevelArgs(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quote) {
      cur += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim() !== "") out.push(cur.trim());
  return out;
}

/** 从命令串提取主命令名（`obj = Seq(...)` / `f(x)=...` / `Seq(...)`） */
function extractCmdName(cmd: string): string | null {
  const trimmed = cmd.trim();
  const m = /^(?:\w+\s*=\s*)?([A-Za-z_]\w*)\s*[([]/.exec(trimmed);
  return m ? m[1] : null;
}

/**
 * 提取首个函数调用的参数串（尊重嵌套字符串与方括号）。
 *
 * ★ 必须用捕获组拿到函数名后的那个 `(` 的准确位置：
 *   早期写法 `indexOf("(", m.index + m[0].length - 1)` 会因 `\w*` 贪婪匹配把
 *   `s = Sequence((n, n^2), …` 的 `(` 定位到内层坐标括号上，导致参数切分整体错位。
 */
function extractFirstCallArgs(cmd: string): string | null {
  const s = cmd.trim();
  const m = /^(?:\w+\s*=\s*)?[A-Za-z_]\w*\s*(\(|\[)/.exec(s);
  if (!m) return null;
  const open = m.index + m[0].length - 1;
  let depth = 0;
  let quote: string | null = null;
  for (let i = open; i < s.length; i++) {
    const ch = s[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
      if (depth === 0) return s.slice(open + 1, i);
    }
  }
  return null;
}

/** 是否是单个 ASCII 字母（GGB 合法循环变量形态） */
const SINGLE_LETTER = /^[A-Za-z]$/;
/** 纯数字字面量（可带包裹引号，容错 AI 把数字写成字符串） */
const NUMBER_LITERAL = /^["']?\s*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?\s*["']?$/;

/** 去掉包裹的成对引号（AI 偶尔把数字/变量写成 "0.5" 这类字符串形态） */
function unquote(s: string): string {
  const t = s.trim();
  if (t.length >= 2 && (t[0] === '"' || t[0] === "'") && t[t.length - 1] === t[0]) {
    return t.slice(1, -1).trim();
  }
  return t;
}

/** 数字字面量（含引号容错） */
function isNumberArg(s: string | undefined): boolean {
  return s !== undefined && NUMBER_LITERAL.test(unquote(s));
}

// ── 通用检查 ──

/** 句点手误：`)` 紧跟 `.` 再跟 `(`/标识符 —— 通常是 `,` 被误写成 `.` */
const STRAY_DOT_RE = /([)\]}])[ \t]*\.[ \t]*([(\w])/;

/** 表达式以运算符/逗号结尾（允许其后跟若干右括号，如 `(i, i^2+)` 中的 `+`） */
const TRAILING_OP_RE = /[+\-*/^,]\s*[)\]}]*\s*$/;

/**
 * 检查表达式/调用是否以运算符或逗号结尾。
 * 递归下探函数调用（如 `Sequence((i, i^2+,), …)` 的坐标参数），
 * 否则多参调用的合法逗号会被误判、而参数内部的真错误又会被漏掉。
 */
function trailingOperatorIssue(fragment: string, depth = 0): CommandIssue | null {
  const expr = fragment.trim();
  if (!expr || depth > 4) return null;
  if (TRAILING_OP_RE.test(expr)) {
    return {
      kind: "trailing-operator",
      message:
        `表达式以运算符 ${JSON.stringify(expr.slice(-1))} 结尾，缺少右操作数：${expr}` +
        `（注意：参数之间只需一个逗号，不要写成 ",," 或让表达式以运算符收尾）`,
    };
  }
  const argsStr = extractFirstCallArgs(expr);
  if (argsStr === null) return null;
  for (const arg of splitTopLevelArgs(argsStr)) {
    const inner = trailingOperatorIssue(arg, depth + 1);
    if (inner) return inner;
  }
  return null;
}

// ── Sequence 专项（用户高频失败点） ──

/**
 * Sequence 的五种官方重载（https://geogebra.github.io/docs/manual/en/commands/Sequence/）：
 *   ① Sequence(<终点 n>)                         → 整数表 {1..n}
 *   ② Sequence(<起点 k>, <终点 n>)                → 整数表 {k..n}（可递减）
 *   ③ Sequence(<起点 k>, <终点 n>, <增量>)         → 整数表 {k, k+inc, …}
 *   ④ Sequence(<表达式>, <变量 k>, <起点 a>, <终点 b>)        → 表达式按 k 迭代（步长默认 1）
 *   ⑤ Sequence(<表达式>, <变量 k>, <起点 a>, <终点 b>, <步长>)  → 完整形态
 *
 * ①②③ 无循环变量（纯整数表）→「数值分支」；④⑤ 有循环变量 →「表达式分支」。
 * 分支判定只看第 2 个参数是不是**循环变量标识符**：
 *   - 是 → 表达式分支（无论参数个数多少，缺参也要按表达式形态报错，才能给出正确提示）；
 *   - 否 → 数值分支（Sequence(4) / Sequence(7,13) / Sequence(7,13,2)）。
 * 数值分支只做轻量健全性检查，避免误杀合法整数表写法。
 */
function validateSequence(
  argsStr: string,
  issues: CommandIssue[],
  balanced: boolean
): void {
  const args = splitTopLevelArgs(argsStr);

  // ★ 括号不配平时 splitTopLevelArgs 会失去切分能力，此时一切"参数个数/分支"判断都不可信
  if (!balanced) return;

  // 顺序扫描，收集所有能判定的问题（不提前 return，保证一次给全诊断）
  const second = unquote(args[1] ?? "");
  const isVarLike = /^[A-Za-z_]\w*$/.test(second);
  // 只有 ≥3 个参数时第 2 个参数才可能承担"循环变量"角色
  const isExpressionForm = args.length >= 3 && isVarLike;

  // 循环区间被挤进单个参数：Sequence(expr, i, 0, 1, 0.1) 写成 Sequence(expr, i, "0,1,0.1")
  const third = unquote(args[2] ?? "");
  if (
    isExpressionForm &&
    args[2] !== undefined &&
    !isNumberArg(args[2]) &&
    /^[\s\d.,]+$/.test(third) &&
    third.includes(",")
  ) {
    issues.push({
      kind: "sequence-arity",
      message:
        `Sequence 循环区间被合成了一个参数 ${JSON.stringify(args[2])}。` +
        `起点/终点/步长必须是**三个独立参数**（逗号分隔），不能写成 "0,1,0.1" 或 "0..1"。` +
        `正确形态：Sequence(<表达式>, i, 0, 1, 0.1)`,
    });
  }

  if (!isExpressionForm) {
    // 数值分支：Sequence(4) / Sequence(7,13) / Sequence(起点, 终点, 增量)
    if (args.length === 3 && isNumberArg(args[2]) && Number(unquote(args[2])) === 0) {
      issues.push({
        kind: "sequence-arity",
        message: `Sequence 的增量不能为 0（Sequence(${args.join(", ")})）—— 无法收敛`,
      });
    }
    if (args.length === 0 || args.length > 3) {
      issues.push({
        kind: "sequence-arity",
        message:
          `Sequence 参数无法对应任何官方形态。可用：Sequence(终点)｜Sequence(起点, 终点)｜` +
          `Sequence(起点, 终点, 增量)〔整数表〕或 Sequence(表达式, 循环变量, 起点, 终点[, 步长])〔迭代表达式〕。` +
          `当前 ${args.length} 个参数：${JSON.stringify(args.join(", "))}`,
      });
    }
    return;
  }

  // ── 表达式分支（④⑤）──
  if (args.length < 4 || args.length > 5) {
    issues.push({
      kind: "sequence-arity",
      message:
        `Sequence 表达式形态需要 4~5 个参数：Sequence(<表达式>, <循环变量>, <起点>, <终点>[, <步长>])，` +
        `当前有 ${args.length} 个：${JSON.stringify(args.join(", "))}。` +
        `注意：第 3 个参数是**起点**、第 4 个是**终点**、第 5 个才是**步长** —— ` +
        `Sequence(<表达式>, i, 0) 缺少终点参数，须写成 Sequence(<表达式>, i, 0, 1, 0.1)。`,
    });
  }

  // ② 循环变量校验（GGB 要求单个字母）
  if (!SINGLE_LETTER.test(second)) {
    issues.push({
      kind: "sequence-var",
      message:
        `Sequence 的循环变量必须是**单个 ASCII 字母**（i / j / k / t / n 等），` +
        `但收到 ${JSON.stringify(second)}。` +
        `多字母/中文变量名会被 GGB 判为对象引用而报「Sequence 执行失败」。`,
    });
  }

  // ③ 表达式尾部残留字符：Sequence((i,j,k).e(i,j+1,k), i, ...) → "(i,j,k).e" 中的 ".e" 是多余输入
  const expr = args[0] ?? "";
  const trailing = /[)\]}]\s*\.\s*[A-Za-z_]\w*\s*$/.exec(expr);
  if (trailing) {
    issues.push({
      kind: "sequence-trailing",
      message:
        `Sequence 的表达式尾部出现多余字符 ${JSON.stringify(trailing[0].trim())}。` +
        `疑似多打了字母或漏了逗号（,）—— 例如把 "Cube((i,j,k),(i+1,j,k),(i,j+1,k))" ` +
        `写成了 "Cube((i,j,k),(i+1,j,k).e(i,j+1,k)"。`,
    });
  }

  // ④ 各参数不能以运算符/逗号结尾（如 Sequence((i, i^2+,), i, 0, 5, 1)）
  for (const [idx, a] of args.entries()) {
    if (TRAILING_OP_RE.test(a)) {
      issues.push({
        kind: "trailing-operator",
        message:
          `Sequence 第 ${idx + 1} 个参数 ${JSON.stringify(a)} 以运算符/逗号结尾，缺少右操作数 —— ` +
          `注意参数之间只需一个逗号分隔，不要写成 ",," 或在末尾多留逗号`,
      });
      break;
    }
  }
}

// ── 属性命令专项（Set*/Show*/Rename：值域 + 3D 模式禁令） ──

/**
 * 3D 模式下必失败的命令清单（与 prompts.ts MODE_3D_ADDON、ggbKB modes:["2d"] 三方一致）。
 * 值为 KB 无 note 时的兜底替代建议；有 note 时优先用 ggbKB 的 note。
 */
const MODE_3D_FORBIDDEN: Record<string, string> = {
  setviewdirection: "依靠鼠标旋转视角，不要用命令",
  setfilling: "透明度改用 style op 的 opacity 字段",
  setpointsize: "标记点改用 Sphere(P, 0.2)",
  setpointstyle: "删除该样式设置",
  setaxesratio: "等比例交给 view op 或用户手动",
  setcaption: "标注改用 Text(\"<文字>\", 点)",
  showlabel: "删除该命令",
  setlabelmode: "删除该命令",
  rename: "创建对象时直接用目标名字命名",
  zoomin: "视窗改用 view op",
};

/** 参数个数回退范围：style 类属性命令（签名固定，无多重重载，静态个数校验不易误杀） */
const STYLE_CMD_RE = /^(?:Set|Show)[A-Z]|^Rename/;
/** 豁免：SetCoords 在 3D 有官方四参重载 SetCoords(obj, x, y, z)，KB 只录了 2D 三参形态 */
const STYLE_ARG_COUNT_EXEMPT = new Set(["setcoords"]);

/**
 * 属性命令专项检查（第 7 项）。
 * 只对 ggbKB 已收录的 Set*、Show*、Rename 命令生效，检查：
 *   - 3D 模式禁令（mode 传入且命令 KB 标注仅 2D）
 *   - SetColor 值域（r/g/b 0~1 浮点，引擎按 ×255 解析；字符串色名形态）
 *   - SetLineOpacity / SetFilling 透明度值域 0~1
 * 仅检查数字/字符串字面量，表达式（如 `255*v`）交由引擎与修复回路。
 */
function validateSetProperty(
  cmdName: string,
  args: string[],
  mode: "2d" | "3d" | undefined,
  issues: CommandIssue[]
): void {
  const def = findCommand(cmdName);

  // ① 3D 模式禁令：与 prompt 层禁令清单一致，把「引擎一句 false」提前变成可自愈诊断
  if (mode === "3d") {
    const key = (def?.name ?? cmdName).toLowerCase();
    const fallback = MODE_3D_FORBIDDEN[key];
    // 只拦「KB 明确标注仅 2D」的命令，避免误杀 KB 未收录但 3D 可用的写法
    if (fallback && def && !def.modes.includes("3d")) {
      issues.push({
        kind: "mode-forbidden",
        message:
          `${def.name} 在 3D 模式下不可用（执行必失败）。${def.note || fallback}。` +
          `请删除该命令并改用替代方案。`,
      });
    }
  }

  // ② SetColor 值域 / 色名形态
  if (def?.name.toLowerCase() === "setcolor") {
    if (args.length === 4) {
      // SetColor(obj, r, g, b)：r/g/b 是 0~1 浮点（引擎按 ×255 解析，官方手册同）。
      // 5.4.927 实测：(0.9,0.2,0.2)→rgb(229,51,51) 正确；(230,50,50)→rgb(255,255,255) 全白。
      for (const [i, arg] of args.slice(1).entries()) {
        if (!isNumberArg(arg)) continue;
        const n = Number(unquote(arg));
        if (n < 0 || n > 1) {
          issues.push({
            kind: "value-range",
            message:
              `SetColor 第 ${i + 2} 个参数（r/g/b）超出 0~1：${arg}。` +
              `r/g/b 是 **0~1 浮点**（引擎按 ×255 解析），${arg} 应改为 ${(n / 255).toFixed(3)}。` +
              `例如 (230, 50, 50) → (0.902, 0.196, 0.196)；写 0~255 整数会被钳成白色。`,
          });
        }
      }
    } else if (args.length === 2) {
      // SetColor(obj, "颜色名")：只查几种必失败形态 —— 数字色参 / 中文色名 / 未加引号的裸标识符
      const arg = args[1] ?? "";
      const quoted = /^["']/.test(arg.trim());
      if (!quoted && isNumberArg(arg)) {
        issues.push({
          kind: "value-range",
          message:
            `SetColor(${args.join(", ")}) 是「颜色名」形态 —— 第二个参数必须是颜色名字符串。` +
            `要设置 RGB 应写 **4 个参数**：SetColor(obj, r, g, b)（r/g/b 是 0~1 浮点）。`,
        });
      } else if (quoted && /\P{ASCII}/u.test(unquote(arg))) {
        issues.push({
          kind: "color-name",
          message:
            `SetColor 的颜色名必须是**英文**（如 "red"），收到中文 ${arg} —— GGB 不识别中文色名。` +
            `改用英文色名字符串，或 SetColor(obj, r, g, b)（0~1 浮点）。`,
        });
      } else if (!quoted && !isNumberArg(arg) && /^[A-Za-z_]\w*$/.test(arg.trim())) {
        issues.push({
          kind: "color-name",
          message:
            `SetColor 的颜色参数 ${arg} 未加引号 —— 裸标识符会被 GGB 当作对象引用而失败。` +
            `颜色名需写成字符串 ${JSON.stringify(`"${arg.trim().toLowerCase()}"`)}，` +
            `或改用 SetColor(obj, r, g, b)（0~1 浮点）。`,
        });
      }
    }
    return;
  }

  // ③ 透明度值域：SetLineOpacity / SetFilling 第二个参数必须是 0~1
  if (def && ["setlineopacity", "setfilling"].includes(def.name.toLowerCase()) && args.length === 2) {
    const arg = args[1] ?? "";
    if (isNumberArg(arg)) {
      const n = Number(unquote(arg));
      if (n < 0 || n > 1) {
        issues.push({
          kind: "value-range",
          message: `${def.name} 的透明度必须是 0~1 之间的小数，收到 ${arg}。` +
            `（SetColor 的 r/g/b 与透明度同为 0~1 浮点）`,
        });
      }
    }
  }
}

// ── scripting 语句嵌套检查 ──

/** scripting 命令调用形态（与 ggbBridge.isScriptingCommand 同语义：Set＊ / Show＊ 前缀 + 动画/视窗语句）。
 *  要求前缀后跟大写字母，避免误伤 Setting 等普通标识符。 */
const SCRIPTING_CALL_RE =
  /\b(Set[A-Z]\w*|Show[A-Z]\w*|ZoomIn|ZoomOut|CenterView|Pan|StartAnimation|StopAnimation)\s*\(/;

/** scripting 语句（Set＊、Show＊ 等）不产出值，GGB 只允许其作整条命令头部；
 *  嵌进 Sequence/Zip/If 等表达式位置引擎必拒（5.4.927 实测，含用户实例：
 *  Sequence(SetVisibleInView(Element({…},u),1,false),u,1,24)）。 */
function scriptingNestIssue(cmd: string): CommandIssue | null {
  // 字符串字面量内容清空，避免 "SetColor" 之类文本误触发
  const body = stripStrings(cmd).replace(/^\s*[A-Za-z_]\w*(?:\([^)]*\))?\s*=\s*/, "");
  const headM = /^([A-Za-z_]\w*)\s*\(/.exec(body);
  if (headM && SCRIPTING_CALL_RE.test(`${headM[1]}(`)) return null; // 头部语句本身合法
  const m = SCRIPTING_CALL_RE.exec(body);
  if (!m) return null;
  return {
    kind: "scripting-nest",
    message:
      `检测到 scripting 语句 ${m[1]}(...) 嵌套在表达式中 —— Set*/Show* 等**只产生副作用、不返回值**，` +
      `GGB 只允许它们作整条命令的头部，嵌进 Sequence/Zip/If 等表达式位置必失败（5.4.927 实测）。` +
      `批量操作请**逐条输出命令**（每条一个 eval），或用 eval_raw 以换行符分隔多条命令（实测可行；分号分隔无效）。`,
  };
}

// ── 主校验入口 ──

/** 命令参数个数表（与 ggbKB 的 paramCount 保持一致的最小集合，避免循环依赖）
 *  ⚠ 只收录「签名确定、无额外重载」的命令：
 *     - Sequence 由 validateSequence 按 5 种官方重载分支校验，故不在此列；
 *     - Curve/If/Polygon/Slider/Translate/Rotate/Reflect/Cube 等存在多种官方重载，
 *       静态个数校验极易误杀合法写法，一律交给引擎与修复回路处理。
 */
const ARG_COUNT_HINTS: Record<string, [number, number]> = {
  IterationList: [3, 3],
  Element: [2, 3],
  Zip: [5, 5],
  Segment: [2, 2],
  Vector: [2, 2],
  Sphere: [2, 2],
  Circle: [2, 3],
};

/**
 * 校验一条 GGB 命令串（eval / eval_raw / eval_sequence 展开后的形态）。
 * `mode` 传入当前画布模式（"2d" | "3d"）时启用 3D 禁令检查；缺省不查模式。
 * 返回 issues 为空即通过。
 */
export function validateGGBCommand(cmd: string, mode?: "2d" | "3d"): ValidationResult {
  const issues: CommandIssue[] = [];
  const raw = cmd.trim();

  if (!raw) {
    return { ok: false, issues: [{ kind: "unbalanced", message: "命令为空" }], message: "命令为空" };
  }

  // ① 括号配对（最高优先级：不配平时后续的"参数个数"解析会失真，故后续检查降级进行）
  const balance = checkBracketBalance(raw);
  if (!balance.ok) {
    issues.push({
      kind: "unbalanced",
      message:
        `括号不匹配：${balance.detail}。` +
        `请逐个数清每个函数调用的左右括号（嵌套 Sequence/Cube/Vector 时最容易漏掉最外层 ")"）。`,
    });
  }

  // ② 句点误用
  const strayDot = STRAY_DOT_RE.exec(raw);
  if (strayDot) {
    issues.push({
      kind: "stray-dot",
      message:
        `检测到 ${JSON.stringify(strayDot[0])} —— 参数之间必须用**逗号**分隔，不能用句点 "."。` +
        `典型错误：Cube((i,j,k),(i+1,j,k).e(i,j+1,k) 应为 Cube((i,j,k),(i+1,j,k),(i,j+1,k))`,
    });
  }

  const cmdName = extractCmdName(raw);
  const argsStr = extractFirstCallArgs(raw);

  // ③ Sequence 专项
  if (cmdName && /^sequence$/i.test(cmdName) && argsStr !== null) {
    validateSequence(argsStr, issues, balance.ok);
  }

  // ④ 参数个数（括号不配平时切分失真，跳过）
  //    ARG_COUNT_HINTS 未命中时，对 style 类属性命令（Set*/Show*/Rename）回退到
  //    ggbKB 的 paramCount —— 这些命令签名固定、无多重重载，静态校验不易误杀
  const args =
    balance.ok && cmdName && argsStr !== null ? splitTopLevelArgs(argsStr) : null;
  if (args && cmdName) {
    const hint = ARG_COUNT_HINTS[capitalize(cmdName)];
    const def = hint ? undefined : findCommand(cmdName);
    const styleHint =
      !hint &&
      def &&
      STYLE_CMD_RE.test(def.name) &&
      !STYLE_ARG_COUNT_EXEMPT.has(def.name.toLowerCase())
        ? def.paramCount
        : undefined;
    const effective = hint ?? styleHint;
    if (effective) {
      const given = args.length;
      const [pmin, pmax] = effective;
      if (given < pmin || (pmax !== -1 && given > pmax)) {
        const range = pmax === -1 ? `至少 ${pmin}` : `${pmin}~${pmax}`;
        issues.push({
          kind: "arg-count",
          message: `${cmdName} 需要 ${range} 个参数，但收到 ${given} 个：${JSON.stringify(argsStr)}`,
        });
      }
    }
  }

  // ⑤ 表达式以运算符结尾
  const trailing = trailingOperatorIssue(raw);
  if (trailing) issues.push(trailing);

  // ⑥ 属性命令专项（3D 禁令 / 值域 / 色名形态）
  if (cmdName && args) {
    validateSetProperty(cmdName, args, mode, issues);
  }

  // ⑦ scripting 语句嵌套（Set*/Show* 嵌进 Sequence/Zip 等表达式位置）
  const scriptingNest = scriptingNestIssue(raw);
  if (scriptingNest) issues.push(scriptingNest);

  return { ok: issues.length === 0, issues, message: formatIssues(raw, issues) };
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

function formatIssues(cmd: string, issues: CommandIssue[]): string {
  if (issues.length === 0) return "";
  const lines = issues.map((it, i) => `  ${i + 1}. ${it.message}`);
  return `命令静态校验未通过（无需执行即可判定必失败）：\n${cmd}\n${lines.join("\n")}`;
}

// ── eval_sequence 工具参数的静态校验 ──

export interface SequenceArgsLike {
  name?: string;
  expr: string;
  var: string;
  start: number | string;
  end: number | string;
  step: number | string;
}

/**
 * 校验 eval_sequence 工具参数（在执行前调用）。
 * 与 validateGGBCommand 互补：这里能看到结构化字段，能给出更精确的字段级提示。
 * 返回 null 表示通过。
 */
export function validateSequenceArgs(args: SequenceArgsLike): string | null {
  const problems: string[] = [];
  const loopVar = (args.var ?? "").trim();

  if (!SINGLE_LETTER.test(loopVar)) {
    problems.push(
      `var 必须是**单个 ASCII 字母**的循环变量名（推荐 i / j / k / t / n），当前是 ${JSON.stringify(args.var)}`
    );
  }
  for (const [field, value] of [["start", args.start], ["end", args.end], ["step", args.step]] as const) {
    const s = String(value ?? "").trim();
    if (s.includes(",")) {
      problems.push(`${field} 只能是**单个数值**，不能是区间列表 ${JSON.stringify(s)}`);
    }
  }
  if (String(args.step ?? "").trim() !== "" && Number(String(args.step).trim()) === 0) {
    problems.push("step 不能为 0（步长为 0 会导致 Sequence 无限展开）");
  }

  const expr = (args.expr ?? "").trim();
  if (expr) {
    const balance = checkBracketBalance(expr);
    if (!balance.ok) problems.push(`expr 括号不匹配：${balance.detail}`);
    const trailing = /[)\]}]\s*\.\s*[A-Za-z_]\w*\s*$/.exec(expr);
    if (trailing) {
      problems.push(`expr 尾部有多余字符 ${JSON.stringify(trailing[0].trim())}（疑似漏写逗号或多打字母）`);
    }
  }

  if (problems.length === 0) return null;
  const name = args.name ?? "seq";
  const example = `Sequence((i, i^2), i, 0, 10, 0.5)`;
  return (
    `eval_sequence 参数不合法：\n` +
    problems.map(p => `  · ${p}`).join("\n") +
    `\n正确形态：${name} = Sequence(<expr 含循环变量 ${SINGLE_LETTER.test(loopVar) ? loopVar : "i"}>, ` +
    `${SINGLE_LETTER.test(loopVar) ? loopVar : "i"}, <start>, <end>, <step>)` +
    `\n示例：${example}`
  );
}
