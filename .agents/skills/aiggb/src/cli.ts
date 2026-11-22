/**
 * [aiggb skill] CLI 入口 —— 供任意 agent / 大模型在 shell 中调用
 *
 * 离线命令（无需 API Key，核心护栏）：
 *   check       校验/纠正原始 GGB 命令文本（静态预检 + 模糊纠正）
 *   validate    校验 14-op 协议 JSON（schema + 逐条预检 + 纠正）
 *   kb          查命令签名 / 臆造映射
 *   list        列出当前模式可用命令
 *   hallucinations  打印臆造命令黑名单与正确替代
 *   reference   打印完整命令参考（markdown）
 *   gen-docs    生成 references/ 下的命令参考文档
 *
 * 在线命令（需 AIGGB_API_KEY）：
 *   refine      自然语言 → 分节绘图规格（Phase 1）
 *   compile     规格 → 已校验的 GGB 命令 JSON（Phase 2）
 *   run         refine → compile 一键直通
 *
 * 退出码：0 成功；1 校验未通过（输出仍是合法 JSON，含 issues）；2 用法/配置错误。
 * 约定：机器可读 JSON 走 stdout，人类提示走 stderr。
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve as resolvePath } from "node:path";
import {
  findCommand,
  findHallucination,
  filterCommandsByMode,
  buildCommandReference,
  buildHallucinationWarnings,
  GGB_COMMAND_DEFS,
  HALLUCINATION_MAP
} from "./ggbKB";
import { AIResponse as AIResponseSchema, formatZodError } from "./schema";
import { buildAIConfig, MissingKeyError, DEFAULT_BASE_URL, DEFAULT_MODEL, type RuntimeFlags } from "./envConfig";
import { refineSpec, compileSpec, runOnce, guardResponse, evaluateRawCommand, type AppMode, type CompileOptions } from "./orchestrator";
import { renderCommands } from "./render";

// ── 参数解析 ──

interface ParsedArgs {
  command: string;
  positionals: string[];
  flags: Record<string, string | boolean>;
}

const FLAG_NAMES = new Set([
  "--mode", "--domain", "--file", "--spec", "--out", "--base-url", "--api-key",
  "--model", "--light-model", "--reasoning", "--max-tokens", "--temperature",
  "--json", "--no-repair", "--help", "-h",
  "--engine", "--width", "--height", "--channel", "--save-cmds", "--timeout",
  "--frames", "--fps", "--anim", "--gif-scale"
]);
const BOOLEAN_FLAGS = new Set(["--json", "--no-repair", "--help", "--animate", "--download", "--gif", "--ggb"]);

function parseArgs(argv: string[]): ParsedArgs {
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};
  let command = "";
  let sepSeen = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--" && !sepSeen) { sepSeen = true; continue; }
    if (!sepSeen && a.startsWith("--")) {
      const eq = a.indexOf("=");
      let name = eq > 0 ? a.slice(0, eq) : a;
      let value: string | boolean = eq > 0 ? a.slice(eq + 1) : true;
      if (eq < 0 && FLAG_NAMES.has(name) && !BOOLEAN_FLAGS.has(name) && i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        value = argv[++i]; // 空格分隔的 flag 值
      }
      flags[name] = value;
      continue;
    }
    if (!command) command = a;
    else positionals.push(a);
  }
  return { command, positionals, flags };
}

function usage(): string {
  return `aiggb — 自然语言 → GeoGebra 命令（护栏 CLI）

离线（无需 API Key）:
  check --mode 2d -- 'f(x)=x^2' 'Conic(1/9,1/4,0,0,0,-1)'
      校验/纠正原始 GGB 命令（也可从 stdin 逐行读入）
  validate --mode 2d --file response.json
      校验 14-op 协议 JSON（schema + 逐条静态预检 + 模糊纠正）
  kb Slider                    查命令签名/参数/示例
  kb El                        查臆造命令的正确替代
  list [pattern] [--mode 3d]   列出可用命令
  hallucinations [--mode 3d]   臆造命令黑名单与正确替代
  reference --mode 3d --domain physics [--out file.md]
  gen-docs <outdir>            生成命令参考 markdown（2d/3d）

在线（需 AIGGB_API_KEY，任何 OpenAI 兼容端点）:
  refine '画斜抛运动 v0=20 仰角45°' [--domain physics]
  compile --spec spec.json [--mode 2d] [--no-repair]
  run '画单摆小角度摆动' [--domain physics] [--mode 2d]

出图（真实 GGB 引擎渲染 → PNG/GIF/.ggb）:
  render --file commands.json --out figure.png [--engine <bundle目录>] [--mode 3d]
      执行 14-op 命令 JSON 并导出 PNG（--animate 保留动画，默认静态截图）
  render --file cmds.json --out demo.gif --gif [--frames 24] [--fps 15] [--anim t]
      导出 GIF 动图（确定性帧步进驱动动画滑块；--anim 显式指定目标滑块）
  render --file cmds.json --out demo.ggb
      导出 .ggb 构造文件（GeoGebra 直接打开，滑块/动画可继续交互编辑）
  draw '画斜抛运动演示' --out p1.png [--save-cmds cmds.json] [--gif] [--out *.ggb]
      自然语言 → 精炼 → 编译 → 出图 一条龙（需 AIGGB_API_KEY + 引擎）
  引擎: 自动探测 AiGGB 项目 public/GeoGebra；或 --engine <目录>；或 AIGGB_GGB_HOME；
        或 --download（官方 bundle ~50MB，需直连网络）
  浏览器: 需 npm i playwright-core（用系统 Edge/Chrome）；AIGGB_CHROME 可指定可执行文件

环境变量: AIGGB_API_KEY / AIGGB_BASE_URL / AIGGB_MODEL / AIGGB_LIGHT_MODEL /
          AIGGB_REASONING_EFFORT / AIGGB_MAX_OUTPUT_TOKENS / AIGGB_TEMPERATURE /
          AIGGB_GGB_HOME / AIGGB_CHROME / AIGGB_BROWSER_CHANNEL
退出码:   0 成功 | 1 校验未通过 | 2 用法或配置错误`;
}

function readInput(file: string | undefined, positional: string | undefined): string | undefined {
  if (file) return readFileSync(resolvePath(file), "utf-8");
  if (positional) return positional;
  if (!process.stdin.isTTY) {
    try { return readFileSync(0, "utf-8"); } catch { return undefined; }
  }
  return undefined;
}

function strFlag(flags: Record<string, string | boolean>, name: string): string | undefined {
  const v = flags[name];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function printJSON(obj: unknown): void {
  console.log(JSON.stringify(obj, null, 2));
}

function fail(obj: unknown, code: number): never {
  printJSON(obj);
  process.exit(code);
}

// ── 离线命令 ──

function cmdCheck(a: ParsedArgs): never {
  const mode = (strFlag(a.flags, "--mode") ?? "2d") as AppMode;
  if (mode !== "2d" && mode !== "3d") fail({ ok: false, error: `--mode 必须是 2d 或 3d，收到: ${mode}` }, 2);
  let cmds = a.positionals;
  if (cmds.length === 0) {
    const stdin = readInput(undefined, undefined);
    if (stdin) cmds = stdin.split("\n").map(l => l.trim()).filter(Boolean);
  }
  if (cmds.length === 0) fail({ ok: false, error: "check 需要至少一条命令（位置参数或 stdin）" }, 2);

  // 跨命令定义名单（供 P_x 级检测）
  const definedNames = new Set<string>();
  for (const line of cmds) {
    const m = /^\s*([A-Za-z_]\w*)\s*(?:\([^)]*\))?\s*=(?!=)/.exec(line);
    if (m) definedNames.add(m[1]);
  }

  const results = cmds.map(input => {
    const ev = evaluateRawCommand(input, mode, definedNames);
    return {
      input,
      corrected: ev.corrected,
      warnings: ev.warnings,
      ok: ev.ok,
      issues: ev.issues
    };
  });
  const ok = results.every(r => r.ok);
  fail({ ok, mode, results }, ok ? 0 : 1);
}

function cmdValidate(a: ParsedArgs): never {
  const mode = (strFlag(a.flags, "--mode") ?? "2d") as AppMode;
  if (mode !== "2d" && mode !== "3d") fail({ ok: false, error: `--mode 必须是 2d 或 3d，收到: ${mode}` }, 2);
  const text = readInput(strFlag(a.flags, "--file"), a.positionals[0]);
  if (!text?.trim()) fail({ ok: false, error: "validate 需要协议 JSON（--file、位置参数或 stdin）" }, 2);

  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch (e) {
    fail({ ok: false, error: `JSON 解析失败: ${(e as Error).message}` }, 1);
  }
  const result = AIResponseSchema.safeParse(parsed);
  if (!result.success) {
    fail({ ok: false, error: "schema 校验失败", detail: formatZodError(result.error) }, 1);
  }

  const g = guardResponse(result.data, mode);
  fail({
    ok: g.ok,
    mode,
    commands: g.commands,
    corrections: g.corrections,
    warnings: g.warnings,
    issues: g.issues,
    self_check: g.response.self_check,
    ask: g.response.ask
  }, g.ok ? 0 : 1);
}

function cmdKb(a: ParsedArgs): never {
  const name = a.positionals[0];
  if (!name) fail({ ok: false, error: "kb 需要命令名，如: kb Slider" }, 2);
  const halluc = findHallucination(name);
  if (halluc) {
    fail({
      ok: false,
      hallucination: true,
      input: name,
      correctName: halluc.correctName,
      reason: halluc.reason
    }, 1);
  }
  const def = findCommand(name);
  if (!def) fail({ ok: false, error: `未知命令: ${name}（不在知识库也不在臆造映射中）` }, 1);
  fail({ ok: true, ...def }, 0);
}

function cmdList(a: ParsedArgs): never {
  const mode = (strFlag(a.flags, "--mode") ?? "2d") as AppMode;
  if (mode !== "2d" && mode !== "3d") fail({ ok: false, error: `--mode 必须是 2d 或 3d` }, 2);
  const pattern = a.positionals[0]?.toLowerCase();
  let cmds = filterCommandsByMode(mode);
  if (pattern) {
    cmds = cmds.filter(c =>
      c.name.toLowerCase().includes(pattern) ||
      c.signature.toLowerCase().includes(pattern) ||
      (c.aliases ?? []).some(al => al.includes(pattern)) ||
      c.category.includes(pattern)
    );
  }
  fail({
    ok: true, mode, count: cmds.length,
    commands: cmds.map(c => ({
      name: c.name, signature: c.signature, category: c.category,
      paramCount: c.paramCount, note: c.note
    }))
  }, 0);
}

function cmdHallucinations(a: ParsedArgs): never {
  const mode = (strFlag(a.flags, "--mode") ?? "2d") as AppMode;
  if (mode !== "2d" && mode !== "3d") fail({ ok: false, error: `--mode 必须是 2d 或 3d` }, 2);
  if (a.flags["--json"]) {
    fail({ ok: true, count: HALLUCINATION_MAP.length, entries: HALLUCINATION_MAP }, 0);
  }
  process.stdout.write(buildHallucinationWarnings(mode) + "\n");
  process.exit(0);
}

function cmdReference(a: ParsedArgs): never {
  const mode = (strFlag(a.flags, "--mode") ?? "2d") as AppMode;
  const domain = (strFlag(a.flags, "--domain") ?? "general") as "general" | "physics";
  if (mode !== "2d" && mode !== "3d") fail({ ok: false, error: `--mode 必须是 2d 或 3d` }, 2);
  if (domain !== "general" && domain !== "physics") fail({ ok: false, error: `--domain 必须是 general 或 physics` }, 2);
  const md = buildCommandReference(mode, domain) + "\n\n" + buildHallucinationWarnings(mode) + "\n";
  const out = strFlag(a.flags, "--out");
  if (out) {
    writeFileSync(resolvePath(out), md, "utf-8");
    process.stderr.write(`已写入 ${resolvePath(out)}\n`);
    process.exit(0);
  }
  process.stdout.write(md);
  process.exit(0);
}

function cmdGenDocs(a: ParsedArgs): never {
  const outdir = a.positionals[0];
  if (!outdir) fail({ ok: false, error: "gen-docs 需要输出目录，如: gen-docs ../references" }, 2);
  const dir = resolvePath(outdir);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const files: [string, AppMode][] = [["commands-2d.md", "2d"], ["commands-3d.md", "3d"]];
  for (const [fname, mode] of files) {
    const md = [
      `# GeoGebra 命令参考（${mode.toUpperCase()} 模式）`,
      "",
      `> 由 aiggb 知识库自动生成（全库 ${GGB_COMMAND_DEFS.length} 条命令定义，本文件收录 ${filterCommandsByMode(mode).length} 条）。`,
      "> 命令签名/用法一律以本文件为准；不在本文件中的命令视为臆造，见文末臆造映射。",
      "",
      "## 总览（精简提示版）",
      "",
      buildCommandReference(mode, "physics"),
      "",
      "## 分命令详情",
      "",
      buildDetailedReference(mode),
      buildHallucinationWarnings(mode),
      ""
    ].join("\n");
    writeFileSync(join(dir, fname), md, "utf-8");
    process.stderr.write(`已写入 ${join(dir, fname)}\n`);
  }
  process.exit(0);
}

const CATEGORY_LABELS: Record<string, string> = {
  point: "点 / 向量",
  line: "线 / 线段",
  circle: "圆 / 圆锥曲线",
  equation: "方程 / 表达式",
  polygon: "多边形",
  function: "函数 / 曲线",
  logic: "逻辑 / 判定",
  slider: "滑块 / 动画",
  metric: "度量",
  measure3d: "3D 度量",
  transform: "几何变换",
  list: "列表 / 序列",
  text: "文本 / 标签",
  style: "样式 / 属性",
  view: "视图控制",
  solid3d: "3D 几何体",
  curve3d: "3D 曲线曲面",
  intersect3d: "3D 求交 / 截面",
  view3d: "3D 视图"
};

/** 分命令详情 markdown：按类别分组，含签名/示例/重载/注意事项（gen-docs 专用） */
function buildDetailedReference(mode: AppMode): string {
  const cmds = filterCommandsByMode(mode);
  const byCategory = new Map<string, typeof cmds>();
  for (const c of cmds) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category)!.push(c);
  }
  const parts: string[] = [];
  for (const [cat, list] of byCategory) {
    parts.push(`### ${CATEGORY_LABELS[cat] ?? cat}`);
    parts.push("");
    for (const c of list) {
      parts.push(`#### ${c.name}`);
      parts.push(`- 签名: \`${c.signature}\` ｜ 参数个数: ${c.paramCount[0]}${c.paramCount[1] === -1 ? "+" : `~${c.paramCount[1]}`} ｜ 适用: ${c.modes.join(", ")}`);
      if (c.overloads?.length) {
        parts.push("- 重载语义:");
        for (const o of c.overloads) parts.push(`  - (${o.args.join(", ")}): ${o.semantic}`);
      }
      if (c.examples?.length) {
        parts.push("- 示例:");
        for (const e of c.examples) parts.push(`  - \`${e}\``);
      }
      if (c.note) parts.push(`- ⚠ 注意: ${c.note}`);
      if (c.aliases?.length) parts.push(`- 别名: ${c.aliases.join("、")}`);
      parts.push("");
    }
  }
  return parts.join("\n");
}

// ── 在线命令 ──

function flagsToRuntime(a: ParsedArgs): RuntimeFlags {
  const f = a.flags;
  const rt: RuntimeFlags = {
    baseUrl: strFlag(f, "--base-url"),
    apiKey: strFlag(f, "--api-key"),
    model: strFlag(f, "--model"),
    lightModel: strFlag(f, "--light-model"),
    reasoningEffort: strFlag(f, "--reasoning"),
    maxOutputTokens: strFlag(f, "--max-tokens") ? Number(strFlag(f, "--max-tokens")) : undefined,
    temperature: strFlag(f, "--temperature") ? Number(strFlag(f, "--temperature")) : undefined
  };
  return rt;
}

function parseDomain(a: ParsedArgs): "general" | "physics" {
  const d = strFlag(a.flags, "--domain") ?? "general";
  if (d !== "general" && d !== "physics") {
    fail({ ok: false, error: `--domain 必须是 general 或 physics，收到: ${d}` }, 2);
  }
  return d;
}

function parseMode(a: ParsedArgs): AppMode {
  const m = strFlag(a.flags, "--mode") ?? "2d";
  if (m !== "2d" && m !== "3d") fail({ ok: false, error: `--mode 必须是 2d 或 3d，收到: ${m}` }, 2);
  return m;
}

async function cmdRefine(a: ParsedArgs): Promise<never> {
  const text = readInput(undefined, a.positionals[0])?.trim();
  if (!text) fail({ ok: false, error: "refine 需要需求文本（位置参数或 stdin）" }, 2);
  const config = buildAIConfig(flagsToRuntime(a));
  const domain = parseDomain(a);
  const result = await refineSpec(config, text, domain);
  const out = strFlag(a.flags, "--out");
  if (out) {
    // 落盘为 compile --spec 可直接消费的 JSON；stdout 输出同样内容便于 agent 阅读
    writeFileSync(resolvePath(out), JSON.stringify(result, null, 2), "utf-8");
    process.stderr.write(`[aiggb] 规格已写入 ${resolvePath(out)}\n`);
  }
  fail({ ok: Boolean(result.spec), domain, ...result }, result.spec ? 0 : 1);
}

async function cmdCompile(a: ParsedArgs): Promise<never> {
  const specText = readInput(strFlag(a.flags, "--spec"), a.positionals[0])?.trim();
  if (!specText) fail({ ok: false, error: "compile 需要 --spec <file>（或位置参数/stdin 传入规格文本）" }, 2);
  const config = buildAIConfig(flagsToRuntime(a));
  const opts: CompileOptions = {
    domain: parseDomain(a),
    mode: parseMode(a),
    repair: !a.flags["--no-repair"]
  };
  const result = await compileSpec(config, specText, opts);
  const { response: _raw, ...rest } = result;
  fail({ ok: rest.ok, spec: specText.slice(0, 200), ...rest }, rest.ok ? 0 : 1);
}

async function cmdRun(a: ParsedArgs): Promise<never> {
  const text = readInput(undefined, a.positionals[0])?.trim();
  if (!text) fail({ ok: false, error: "run 需要需求文本（位置参数或 stdin）" }, 2);
  const config = buildAIConfig(flagsToRuntime(a));
  const opts: CompileOptions = {
    domain: parseDomain(a),
    mode: parseMode(a),
    repair: !a.flags["--no-repair"]
  };
  const result = await runOnce(config, text, opts);
  if (result.asked) {
    fail({ ok: false, asked: true, refine: result.refine }, 1);
  }
  const compile = result.compile!;
  const { response: _raw, ...rest } = compile;
  fail({ ok: rest.ok, refine: result.refine, ...rest }, rest.ok ? 0 : 1);
}

// ── 出图命令（render / draw）──

interface RenderFlags {
  out: string;
  engineDir?: string;
  width?: number;
  height?: number;
  staticMode: boolean;
  download: boolean;
  timeoutMs?: number;
  gif?: {
    frames?: number;
    fps?: number;
    animTarget?: string;
    scale?: number;
  };
  ggb?: boolean;
}

function renderFlagsFrom(a: ParsedArgs): RenderFlags {
  return {
    out: strFlag(a.flags, "--out") ?? "aiggb-figure.png",
    engineDir: strFlag(a.flags, "--engine"),
    width: strFlag(a.flags, "--width") ? Number(strFlag(a.flags, "--width")) : undefined,
    height: strFlag(a.flags, "--height") ? Number(strFlag(a.flags, "--height")) : undefined,
    staticMode: !a.flags["--animate"],
    download: Boolean(a.flags["--download"]),
    timeoutMs: strFlag(a.flags, "--timeout") ? Number(strFlag(a.flags, "--timeout")) : undefined,
    gif: a.flags["--gif"] || /\.gif$/i.test(strFlag(a.flags, "--out") ?? "")
      ? {
          frames: strFlag(a.flags, "--frames") ? Number(strFlag(a.flags, "--frames")) : undefined,
          fps: strFlag(a.flags, "--fps") ? Number(strFlag(a.flags, "--fps")) : undefined,
          animTarget: strFlag(a.flags, "--anim"),
          scale: strFlag(a.flags, "--gif-scale") ? Number(strFlag(a.flags, "--gif-scale")) : undefined
        }
      : undefined,
    ggb: Boolean(a.flags["--ggb"]) || /\.ggb$/i.test(strFlag(a.flags, "--out") ?? "")
  };
}

async function cmdRender(a: ParsedArgs): Promise<never> {
  const text = readInput(strFlag(a.flags, "--file"), a.positionals[0])?.trim();
  if (!text) fail({ ok: false, error: "render 需要 --file <14-op JSON>（或位置参数/stdin）" }, 2);
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch (e) {
    fail({ ok: false, error: `JSON 解析失败: ${(e as Error).message}` }, 1);
  }
  const arr = Array.isArray(parsed) ? parsed : (parsed as { commands?: unknown })?.commands;
  if (!Array.isArray(arr) || arr.length === 0) {
    fail({ ok: false, error: "输入需为 14-op 命令数组或 {commands:[...]}" }, 1);
  }
  const rf = renderFlagsFrom(a);
  const r = await renderCommands({
    commands: arr, out: rf.out, engineDir: rf.engineDir,
    appMode: parseMode(a), width: rf.width, height: rf.height,
    staticMode: rf.staticMode, download: rf.download, timeoutMs: rf.timeoutMs,
    gif: rf.gif, ggb: rf.ggb
  });
  fail({ ...r }, r.ok ? 0 : 1);
}

async function cmdDraw(a: ParsedArgs): Promise<never> {
  const text = readInput(undefined, a.positionals[0])?.trim();
  if (!text) fail({ ok: false, error: "draw 需要自然语言需求（位置参数或 stdin）" }, 2);
  const config = buildAIConfig(flagsToRuntime(a));
  const domain = parseDomain(a);
  const mode = parseMode(a);
  const rf = renderFlagsFrom(a);

  const refine = await refineSpec(config, text, domain);
  if (refine.ask || !refine.spec) {
    fail({ ok: false, asked: Boolean(refine.ask), refine }, 1);
  }
  const compile = await compileSpec(config, refine.spec, { domain, mode, repair: !a.flags["--no-repair"] });
  if (strFlag(a.flags, "--save-cmds")) {
    writeFileSync(resolvePath(strFlag(a.flags, "--save-cmds")!), JSON.stringify({ commands: compile.commands }, null, 2), "utf-8");
  }
  const render = await renderCommands({
    commands: compile.commands, out: rf.out, engineDir: rf.engineDir,
    appMode: mode === "3d" ? "3d" : "2d", width: rf.width, height: rf.height,
    staticMode: rf.staticMode, download: rf.download, timeoutMs: rf.timeoutMs,
    gif: rf.gif, ggb: rf.ggb
  });
  const { response: _raw, ...compileRest } = compile;
  const ok = compileRest.ok && render.ok;
  fail({ ok, refine, compile: compileRest, render }, ok ? 0 : 1);
}

// ── main ──

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const a = parseArgs(argv);
  if (!a.command || a.command === "--help" || a.command === "-h" || a.flags["--help"]) {
    const explicit = Boolean(a.command || a.flags["--help"]);
    process.stderr.write(usage() + "\n");
    process.exit(explicit ? 0 : 2);
  }
  switch (a.command) {
    case "check": return cmdCheck(a);
    case "validate": return cmdValidate(a);
    case "kb": return cmdKb(a);
    case "list": return cmdList(a);
    case "hallucinations": return cmdHallucinations(a);
    case "reference": return cmdReference(a);
    case "gen-docs": return cmdGenDocs(a);
    case "refine": return await cmdRefine(a);
    case "compile": return await cmdCompile(a);
    case "run": return await cmdRun(a);
    case "render": return await cmdRender(a);
    case "draw": return await cmdDraw(a);
    default:
      process.stderr.write(`未知命令: ${a.command}\n\n` + usage() + "\n");
      process.exit(2);
  }
}

main().catch(err => {
  if (err instanceof MissingKeyError) {
    process.stderr.write(`[aiggb] ${err.message}\n`);
    process.exit(2);
  }
  process.stderr.write(`[aiggb] ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(2);
});
