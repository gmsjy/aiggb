/**
 * 层②：在线端到端 —— refine → compile（5 个场景）
 * 每个：refine 生成规格 → compile 编译+护栏修复 → 保存结果
 * 输出：results-layer2.json + compiled/P*.json（compile 命令 JSON，供层③执行）
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CLI = join(here, "..", "..", "scripts", "aiggb.mjs");

// 从主项目 .env 注入测试密钥（不回显）：DEEPSEEK_* → AIGGB_* 映射
function loadEnv() {
  const env = readFileSync(join(here, "..", "..", "..", "..", "..", ".env"), "utf-8");
  for (const m of env.matchAll(/^([A-Z_]+)=(.*)$/gm)) {
    if (!process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
  if (process.env.DEEPSEEK_API_KEY) {
    process.env.AIGGB_API_KEY ??= process.env.DEEPSEEK_API_KEY;
    process.env.AIGGB_BASE_URL ??= process.env.DEEPSEEK_BASE_URL;
    process.env.AIGGB_MODEL ??= process.env.DEEPSEEK_MODEL;
  }
}
loadEnv();

const PROMPTS = {
  P1: "画斜抛运动：初速度 v0 和仰角 θ 用滑块可调，显示理论轨迹曲线、运动点及其速度矢量，运动点留下轨迹痕迹，播放动画",
  P4: "画单摆小角度摆动：摆长 L 和最大摆角用滑块可调，摆球绕悬点往复摆动，留下摆球轨迹，播放动画",
  P6: "画匀速圆周运动：半径 r 和周期 T 用滑块可调，质点沿圆周运动，画出圆轨迹、半径、切向速度矢量和指向圆心的向心加速度矢量，播放动画",
  P7: "画斜面上的物体受力分析：物体沿斜面滑动，画出重力、支持力、摩擦力三个矢量跟随物体移动，并标注 G=mg",
  P10: "画机械波传播演示：振幅和波长用滑块可调，正弦波形随时间向右推进，其中一个介质质点只在平衡位置附近上下振动并留下振动轨迹"
};

const IDS = Object.keys(PROMPTS);
mkdirSync(join(here, "compiled"), { recursive: true });
const report = [];

for (const id of IDS) {
  const entry = { id, prompt: PROMPTS[id] };
  try {
    let t0 = Date.now();
    execFileSync(process.execPath, [CLI, "refine", PROMPTS[id], "--domain", "physics", "--out", join(here, `compiled/${id}.spec.json`)], { stdio: "pipe", encoding: "utf-8" });
    entry.refineMs = Date.now() - t0;
    const spec = JSON.parse(readFileSync(join(here, `compiled/${id}.spec.json`), "utf-8"));
    entry.specTitle = spec.title;
    entry.specLen = (spec.spec ?? "").length;

    t0 = Date.now();
    const out = execFileSync(process.execPath, [CLI, "compile", "--spec", join(here, `compiled/${id}.spec.json`), "--mode", "2d", "--domain", "physics"], { stdio: "pipe", encoding: "utf-8" });
    entry.compileMs = Date.now() - t0;
    const compiled = JSON.parse(out);
    entry.ok = compiled.ok;
    entry.rounds = compiled.rounds;
    entry.cmdCount = (compiled.commands ?? []).length;
    entry.corrections = compiled.corrections;
    entry.warnings = compiled.warnings;
    entry.issues = compiled.issues;
    entry.hasSelfCheck = Boolean(compiled.self_check);
    writeFileSync(join(here, `compiled/${id}.json`), JSON.stringify({ commands: compiled.commands }, null, 2));
  } catch (e) {
    entry.error = ((e.stderr ?? "") + "\n" + (e.stdout ?? "")).trim().slice(0, 600);
    try { JSON.parse(e.stdout); } catch { /* 非 JSON 输出 */ }
    if (e.stdout) {
      try {
        const compiled = JSON.parse(e.stdout);
        entry.ok = compiled.ok;
        entry.rounds = compiled.rounds;
        entry.issues = compiled.issues;
        entry.cmdCount = (compiled.commands ?? []).length;
        writeFileSync(join(here, `compiled/${id}.json`), JSON.stringify({ commands: compiled.commands }, null, 2));
      } catch { /* ignore */ }
    }
  }
  console.log(`[Layer2] ${id}: ok=${entry.ok ?? "ERR"} rounds=${entry.rounds ?? "-"} cmds=${entry.cmdCount ?? "-"} refine=${entry.refineMs ?? "-"}ms compile=${entry.compileMs ?? "-"}ms`);
  report.push(entry);
}

writeFileSync(join(here, "results-layer2.json"), JSON.stringify(report, null, 2));
const okN = report.filter(r => r.ok).length;
console.log(`[Layer2] 端到端: ${okN}/${report.length} 编译通过`);
