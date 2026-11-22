/**
 * [aiggb skill] 无画布编排器 —— 两阶段流水线的 headless 版
 *
 * 从主应用 pipeline.ts 抽取的核心控制流，去掉了所有画布依赖：
 *   - Phase 1 精炼：buildRefinePrompt + chatRaw(jsonMode) → parseRefinedSpec
 *     （与 pipeline.ts refine 逻辑一致：空响应重试 1 次；parseRefinedSpec 原样复制）
 *   - Phase 2 编译：buildCompilePrompt(system) + 规格(user) → chat（schema 校验）
 *     → chatWithFormatRetry（≤2 次，AISchemaError.raw/.detail 回喂，与 pipeline 一致）
 *   - 离线护栏（无画布版的修复回路）：batchCorrect（模糊纠正）+ validateGGBCommand
 *     （静态预检）→ 若有问题，把具体 issue 回喂 AI 修复 1 轮，再验一次
 *
 * 与主应用的差异（画布不在场时的必然取舍）：
 *   - 不执行命令（无 GGB applet）：产出的是**已校验的命令**，执行交给 GeoGebra 本体
 *   - 无快照/构造日志回滚、无满足度评估、无训练数据闭环
 *   - 不注入对话历史与场景缓存（headless 单轮语义）
 */

import { chat, chatRaw, AIError, AISchemaError, resolveModel, type AIConfig, type ChatMessage } from "./aiClient";
import { buildCompilePrompt, buildFormatRepairMessage, type Domain } from "./prompts";
import { buildRefinePrompt } from "./refinePrompt";
import { type AIResponse } from "./schema";
import { correctCommand } from "./commandCorrect";
import { validateGGBCommand } from "./commandValidate";
import { findHallucination } from "./ggbKB";
import { RefinedSpec, type RefinedSpec as RefinedSpecT } from "./specSchema";

const MAX_FORMAT_RETRY = 2;

export type AppMode = "2d" | "3d";

/** 解析 Phase 1 的纯文本输出为 RefinedSpec（code fence 剥离 + JSON 容错）——复制自 pipeline.ts */
export function parseRefinedSpec(raw: string): RefinedSpecT | null {
  const cleaned = raw.trim()
    .replace(/^```json?\s*/, "").replace(/\s*```$/, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { spec: cleaned.slice(0, 3000) };
  }
  const result = RefinedSpec.safeParse(parsed);
  if (result.success) return result.data;
  // AI 显式输出了结构化空 spec（如 {"spec":""}）→ 视为空规格走降级，
  // 而非把原始 JSON 文本包成 spec 进入确认气泡
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const o = parsed as Record<string, unknown>;
    if (typeof o.spec === "string" && o.spec.trim().length === 0 && !o.ask) {
      return { spec: "" };
    }
  }
  return { spec: cleaned.slice(0, 3000) };
}

// ── Phase 1：精炼 ──

export interface RefineResult {
  title?: string;
  spec?: string;
  ask?: string;
}

export async function refineSpec(
  config: AIConfig,
  userText: string,
  domain: Domain,
  signal?: AbortSignal
): Promise<RefineResult> {
  const phase1Messages: ChatMessage[] = [
    { role: "system", content: buildRefinePrompt(domain) },
    { role: "user", content: userText }
  ];
  // ★ jsonMode 按 provider 能力开启（与 pipeline 一致）；空响应重试 1 次
  const light = resolveModel(config, "light");
  let raw = await chatRaw(config, phase1Messages, signal, light, undefined, true);
  if (!raw.trim()) {
    raw = await chatRaw(config, phase1Messages, signal, light, undefined, true);
  }
  const spec = parseRefinedSpec(raw);
  if (!spec) throw new AIError("Phase 1 精炼失败：输出无法解析为规格");
  return spec;
}

// ── 离线护栏：纠正 + 静态预检 ──

export interface GuardIssue {
  cmd: string;
  kind: string;
  message: string;
}

export interface RawEvaluation {
  input: string;
  /** correctCommand 自动纠正后的命令（changed 时才有） */
  corrected?: string;
  changed: boolean;
  /** 未升格为 issue 的纠正提示（未知命令警告等），供人审阅 */
  warnings: string[];
  ok: boolean;
  issues: GuardIssue[];
}

/**
 * 提取命令首标识符（直接调用形态 / 赋值形态），用于臆造命令判定。
 * 与 commandCorrect.extractCommandName 同思路的简化版（后者未导出）。
 */
function leadingCommandName(cmd: string): string | null {
  const t = cmd.trim();
  const direct = /^([A-Za-z_]\w*)\s*[([]/.exec(t);
  if (direct) return direct[1];
  const assigned = /=\s*([A-Za-z_]\w*)\s*[([]/.exec(t);
  return assigned ? assigned[1] : null;
}

/**
 * 单条命令的完整离线评估：模糊/臆造纠正 → 静态预检 → 臆造升格。
 *
 * ★ 与主应用的差异：主应用里「臆造但无法盲替换」的命令（如 SetVisible，correct
 *   形态带参数描述）交给引擎失败 + 修复回路兜底；headless 没有引擎，这类命令
 *   （引擎静默 no-op / 恒 false）直接升格为硬 issue，否则护栏漏网。
 */
export function evaluateRawCommand(cmd: string, mode: AppMode, definedNames?: Set<string>): RawEvaluation {
  const correction = correctCommand(cmd);
  const candidate = correction.changed ? correction.corrected : cmd;
  const v = validateGGBCommand(candidate, mode);
  const issues: GuardIssue[] = v.issues.map(i => ({ cmd, kind: i.kind, message: i.message }));

  const name = leadingCommandName(cmd);
  const halluc = name ? findHallucination(name) : undefined;
  const warnings: string[] = [];
  if (halluc && !correction.changed) {
    issues.push({
      cmd,
      kind: "hallucination",
      message: `${name} 不存在（引擎静默 no-op / 恒 false）。正确用法：${halluc.correct}（${halluc.reason}）`
    });
  } else {
    for (const s of correction.suggestions) warnings.push(s);
  }

  // ★ 小写名点表达式警告（2026-11 出图实测两轮佐证）：元组赋值类型由名字首字母大小写
  //   决定——首字母小写（含驼峰 dTip）→ Vector，多边形/箭头端点用它会静默失败。
  //   只查赋值形态；豁免：函数定义（LHS 带参）、显式几何命令 RHS（类型优先）、
  //   u/v/w 单字母（向量命名惯例，本意就是 Vector）。
  const assignFull = /^([A-Za-z_]\w*)(\([^)]*\))?\s*=(?!=)\s*(.+)$/.exec(cmd.trim());
  if (assignFull && /^[a-z_]/.test(assignFull[1]) && !assignFull[1].includes("_")
    && !assignFull[2] // 函数定义 f(x)=… 豁免
    && !/^(u|v|w)$/.test(assignFull[1]) // 向量命名惯例豁免
  ) {
    const rhsExpr = assignFull[3].replace(/"[^"]*"/g, '""');
    const isExplicitGeomCmd = /^\s*[A-Z][A-Za-z]*\s*[([]/.test(rhsExpr); // 显式命令类型优先
    const isTupleLiteral = /^\(.*,[^)]*\)\s*$/.test(rhsExpr);
    const isPointArith = /[A-Za-z]\w*\s*[+-]\s*\([^)]*,[^)]*\)/.test(rhsExpr) || /\([^)]*,[^)]*\)\s*[+-]/.test(rhsExpr);
    if (!isExplicitGeomCmd && (isTupleLiteral || isPointArith)) {
      warnings.push(
        `「${assignFull[1]}」首字母小写——GGB 会把点表达式赋给小写名的结果推断为 Vector（多边形顶点/箭头端点将静默失败）。` +
        `若用作点，请改用首字母大写的名字（如 ${assignFull[1][0].toUpperCase()}${assignFull[1].slice(1)}）`
      );
    }
  }

  // ★ P_x 式坐标访问臆造检测（2026-11 draw 端到端实测：AI 输出 xL=P_x-0.4 引擎拒绝）：
  //   GGB 经典输入取坐标只能用 x(P)/y(P)，`P_x` 形态不存在。只查 RHS 与参数位，
  //   排除赋值左侧（F_x = 5 这类下标名合法）；字符串字面量清空避免文本误报。
  //   跨命令状态：基名（P）已定义且下标名（P_x）未定义 → 升格为硬 issue（引擎必拒绝，
  //   修复轮回喂）；无定义名单可查时仅警告。
  const assignM = /^([A-Za-z_]\w*)\s*(?:\([^)]*\))?\s*=(?!=)/.exec(cmd.trim());
  const rhs = (assignM ? cmd.trim().slice(assignM[0].length) : cmd).replace(/"[^"]*"/g, '""');
  for (const m of rhs.matchAll(/(?<![A-Za-z0-9_])[A-Za-z]\w*_[xy](?![\w])/g)) {
    const full = m[0];
    const base = full.replace(/_[xy]$/, "");
    if (definedNames) {
      if (!definedNames.has(full) && definedNames.has(base)) {
        issues.push({
          cmd,
          kind: "bad-coord-access",
          message: `「${full}」不是已定义对象——GGB 经典输入无 P_x 坐标访问形态（引擎必拒绝）。请用 x(${base}) / y(${base}) 取分量`
        });
        continue;
      }
      if (!definedNames.has(full)) {
        warnings.push(`「${full}」疑似想取坐标——GGB 经典输入无 P_x 形态，请用 x(${base}) / y(${base}) 访问分量`);
      }
    } else {
      warnings.push(`「${full}」疑似想取坐标——GGB 经典输入无 P_x 形态，请用 x(${base}) / y(${base}) 访问分量`);
    }
  }

  return {
    input: cmd,
    corrected: correction.changed ? correction.corrected : undefined,
    changed: correction.changed,
    warnings,
    ok: issues.length === 0,
    issues
  };
}

export interface GuardedResponse {
  ok: boolean;
  response: AIResponse;
  /** eval 命令经 correctCommand 纠正后的最终命令列表（原样保留其他 op） */
  commands: AIResponse["commands"];
  /** 纠正报告（已自动替换项，来自 commandCorrect） */
  corrections: string[];
  /** 静态预检/臆造未通过项（可直接回喂修复） */
  issues: GuardIssue[];
  /** 非致命提示（未知命令警告等） */
  warnings: string[];
  issuesMessage: string;
}

export function guardResponse(response: AIResponse, mode: AppMode): GuardedResponse {
  const corrections: string[] = [];
  const issues: GuardIssue[] = [];
  const warnings: string[] = [];
  const correctedByCmd = new Map<string, string>();

  // 跨命令定义名单：eval 左侧名 + slider/vector 名（供 P_x 级检测判定）
  const definedNames = new Set<string>();
  for (const c of response.commands) {
    if (c.op === "eval") {
      const m = /^\s*([A-Za-z_]\w*)\s*(?:\([^)]*\))?\s*=(?!=)/.exec(c.cmd);
      if (m) definedNames.add(m[1]);
    } else if (c.op === "slider" || c.op === "vector") {
      definedNames.add(c.name);
    }
  }

  for (const c of response.commands) {
    if (c.op !== "eval") continue;
    const ev = evaluateRawCommand(c.cmd, mode, definedNames);
    if (ev.changed && ev.corrected) {
      correctedByCmd.set(c.cmd, ev.corrected);
      corrections.push(`${c.cmd} → ${ev.corrected}`);
    }
    issues.push(...ev.issues);
    warnings.push(...ev.warnings);
  }
  const commands = response.commands.map(c => {
    if (c.op === "eval" && correctedByCmd.has(c.cmd)) {
      return { ...c, cmd: correctedByCmd.get(c.cmd)! };
    }
    return c;
  });

  // ★ 小写名点表达式被当作点消费 → 升格硬 issue（2026-11 出图实测三轮复发，跨命令分析）：
  //   首字母小写的点表达式赋值会被推断为 Vector，一旦被 Polygon(...) 参数或 vector op
  //   的 from/to 引用，引擎必拒绝其中之一——静态预检在消费端拦截，修复轮可自动改名。
  const isLowerPointAssign = (cmdText: string): string | null => {
    const m = /^([a-z_]\w*)\s*=(?!=)\s*(.+)$/.exec(cmdText.trim());
    if (!m || /^(u|v|w)$/.test(m[1]) || m[1].includes("_")) return null;
    const rhs = m[2].replace(/"[^"]*"/g, '""');
    if (/^\s*[A-Z][A-Za-z]*\s*[([]/.test(rhs)) return null; // 显式命令类型优先
    const isTupleLiteral = /^\(.*,[^)]*\)\s*$/.test(rhs);
    const isPointArith = /[A-Za-z]\w*\s*[+-]\s*\([^)]*,[^)]*\)/.test(rhs) || /\([^)]*,[^)]*\)\s*[+-]/.test(rhs);
    return isTupleLiteral || isPointArith ? m[1] : null;
  };
  const lowerPointNames = new Map<string, string>();
  for (const c of response.commands) {
    if (c.op !== "eval") continue;
    const nm = isLowerPointAssign(c.cmd);
    if (nm) lowerPointNames.set(nm, c.cmd);
  }
  if (lowerPointNames.size > 0) {
    const note = (nm: string, consumer: string) =>
      `「${nm}」首字母小写，GGB 会把该点表达式推断为 Vector，${consumer} 引用必失败。请把定义与引用都改为首字母大写的名字（如 ${nm[0].toUpperCase()}${nm.slice(1)}）`;
    for (const c of response.commands) {
      if (c.op === "eval") {
        const pm = /\bPolygon\s*\(([^)]*)\)/.exec(c.cmd);
        if (pm) {
          for (const arg of pm[1].split(",")) {
            const nm = arg.trim();
            if (lowerPointNames.has(nm)) {
              issues.push({ cmd: c.cmd, kind: "lowercase-point", message: note(nm, "Polygon 顶点") });
            }
          }
        }
      } else if (c.op === "vector") {
        for (const ep of [c.from, c.to]) {
          if (lowerPointNames.has(ep)) {
            issues.push({ cmd: c.cmd, kind: "lowercase-point", message: note(ep, "vector op 端点") });
          }
        }
      }
    }
  }

  return {
    ok: issues.length === 0,
    response,
    commands,
    corrections,
    issues,
    warnings,
    issuesMessage: issues.map(i => `- ${i.cmd} → [${i.kind}] ${i.message}`).join("\n")
  };
}

// ── 格式重试（与 pipeline.ts chatWithFormatRetry 同构）──

async function chatWithFormatRetry(
  config: AIConfig,
  msgs: ChatMessage[],
  signal?: AbortSignal
): Promise<AIResponse> {
  let conv = msgs;
  for (let i = 0; i <= MAX_FORMAT_RETRY; i++) {
    try {
      return await chat(config, conv, signal, resolveModel(config, "heavy"));
    } catch (err) {
      if (err instanceof AISchemaError && i < MAX_FORMAT_RETRY) {
        conv = [
          ...conv,
          { role: "assistant", content: err.raw },
          { role: "user", content: buildFormatRepairMessage(err.raw, err.detail) }
        ];
        continue;
      }
      throw err;
    }
  }
  throw new AIError("AI 多次返回格式错误，已放弃");
}

// ── Phase 2：编译 + 护栏 + 修复 1 轮 ──

export interface CompileOptions {
  domain: Domain;
  mode: AppMode;
  /** 护栏发现问题时是否回喂 AI 修复（默认开，1 轮） */
  repair?: boolean;
  signal?: AbortSignal;
}

export interface CompileResult extends GuardedResponse {
  /** 实际使用的编译轮数（1 = 一次通过；2 = 经历 1 次修复） */
  rounds: number;
  self_check?: AIResponse["self_check"];
}

export async function compileSpec(
  config: AIConfig,
  specText: string,
  opts: CompileOptions
): Promise<CompileResult> {
  const { domain, mode, signal } = opts;
  const repair = opts.repair !== false;

  const phase2Messages: ChatMessage[] = [
    { role: "system", content: buildCompilePrompt(domain, mode) },
    { role: "user", content: specText }
  ];
  const response = await chatWithFormatRetry(config, phase2Messages, signal);
  let guarded = guardResponse(response, mode);
  let rounds = 1;

  if (!guarded.ok && repair) {
    // 修复 1 轮：把具体 issue + 已纠正项回喂（对应主应用 buildCheckerPrompt 修复回路的 headless 版）
    const feedback = [
      "你上一轮输出的以下命令未通过离线护栏，请修正后重新输出完整 JSON（同样的命令协议，不要解释）：",
      guarded.issuesMessage,
      guarded.corrections.length > 0
        ? "\n以下命令已被自动纠正，请直接采用纠正后的形态：\n" + guarded.corrections.map(c => `- ${c}`).join("\n")
        : ""
    ].filter(Boolean).join("\n");
    const repairMessages: ChatMessage[] = [
      ...phase2Messages,
      { role: "assistant", content: JSON.stringify(response) },
      { role: "user", content: feedback }
    ];
    const repaired = await chatWithFormatRetry(config, repairMessages, signal);
    const guarded2 = guardResponse(repaired, mode);
    rounds = 2;
    if (guarded2.ok || guarded2.issues.length < guarded.issues.length) {
      guarded = guarded2;
    }
  }

  return {
    ...guarded,
    rounds,
    self_check: guarded.response.self_check
  };
}

// ── 一键：refine → compile（无确认环节）──

export interface RunResult {
  refine: RefineResult;
  compile: CompileResult | null;
  /** refine 返回 ask（反问用户）时 compile 为 null */
  asked?: boolean;
}

export async function runOnce(
  config: AIConfig,
  userText: string,
  opts: CompileOptions & { refineSignal?: AbortSignal }
): Promise<RunResult> {
  const refine = await refineSpec(config, userText, opts.domain, opts.refineSignal);
  if (refine.ask || !refine.spec) {
    return { refine, compile: null, asked: Boolean(refine.ask) };
  }
  const { refineSignal: _ignored, ...compileOpts } = opts;
  const compile = await compileSpec(config, refine.spec, compileOpts);
  return { refine, compile };
}
