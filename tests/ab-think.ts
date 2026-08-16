/**
 * AB 测试：reasoning_effort=high（开 thinking） vs baseline（不开）
 *
 * 用法：
 *   npm run test:ab            # 需要 DEEPSEEK_API_KEY（.env）
 *   DRIFT_N=5 npm run test:ab  # 每用例重复次数
 *
 * 跑两轮 drift-monitor 核心（同用例同次数），对比：
 *   端到端通过率 / Schema 通过率 / 执行成功率 / 延迟 / token 成本（thinking 的关键代价）
 *
 * 输出 tests/ab-report.json（baseline 与 thinking 两个完整报告 + 汇总对比）
 */

import "./load-env.js";

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { runDrift, type DriftReport } from "./drift-monitor";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AB_REPORT_FILE = join(__dirname, "ab-report.json");

const N_REPEAT = Number(process.env.DRIFT_N ?? "10");
const SAMPLE_SIZE = Number(process.env.DRIFT_SAMPLE ?? "6");

const EFFORT: "low" | "medium" | "high" = (process.env.AB_EFFORT as "low" | "medium" | "high") ?? "high";

// ============ 对比工具 ============

interface AbSummary {
  e2ePassRate: number;
  schemaPassRate: number;
  execSuccessRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  avgPromptTokens: number | null;
  avgCompletionTokens: number | null;
}

function summarize(report: DriftReport): AbSummary {
  return {
    e2ePassRate: report.summary.e2ePassRate,
    schemaPassRate: report.summary.schemaPassRate,
    execSuccessRate: report.summary.execSuccessRate,
    avgLatencyMs: report.summary.avgLatencyMs,
    p95LatencyMs: report.summary.p95LatencyMs,
    avgPromptTokens: report.summary.avgPromptTokens,
    avgCompletionTokens: report.summary.avgCompletionTokens,
  };
}

function fmtPct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

function fmtDelta(cur: number, base: number): string {
  const d = cur - base;
  return `${d >= 0 ? "+" : ""}${(d * 100).toFixed(1)}%`;
}

function fmtTok(cur: number | null, base: number | null): string {
  if (cur === null || base === null) return "—";
  const d = cur - base;
  const pct = base > 0 ? (d / base) * 100 : 0;
  return `${cur.toFixed(0)} (${d >= 0 ? "+" : ""}${(d / 1000).toFixed(1)}k, ${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%)`;
}

// ============ 主流程 ============

async function main() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("缺少 DEEPSEEK_API_KEY。AB 测试需要调真实 API。");
    console.error("用法: DEEPSEEK_API_KEY=sk-xxx npm run test:ab");
    process.exit(1);
  }

  const baseConfig = {
    provider: "deepseek",
    baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
    apiKey,
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
    temperature: 0.05,
  };

  const opts = { nRepeat: N_REPEAT, sampleSize: SAMPLE_SIZE };

  console.log(`\n═══ AB 测试：thinking(${EFFORT}) vs baseline ═══`);
  console.log(`用例数=${SAMPLE_SIZE}×N=${N_REPEAT}  模型=${baseConfig.model}\n`);

  console.log("── 第 1/2 轮：baseline（不开 thinking）──");
  const baseline = await runDrift({ ...baseConfig }, opts);

  console.log(`\n── 第 2/2 轮：thinking=${EFFORT} ──`);
  const thinking = await runDrift({ ...baseConfig, reasoningEffort: EFFORT }, opts);

  const b = summarize(baseline);
  const t = summarize(thinking);

  // ====== 对比输出 ======
  console.log(`\n${"=".repeat(72)}`);
  console.log(`AB 测试结果  thinking=${EFFORT}  N=${N_REPEAT}×${SAMPLE_SIZE}`);
  console.log(`${"=".repeat(72)}`);
  const pad = (s: string, w: number) => s.padEnd(w);
  console.log(pad("指标", 20) + pad("baseline", 18) + pad(`thinking(${EFFORT})`, 20) + "Δ");
  console.log("-".repeat(72));
  console.log(pad("端到端通过率", 20) + pad(fmtPct(b.e2ePassRate), 18) + pad(fmtPct(t.e2ePassRate), 20) + fmtDelta(t.e2ePassRate, b.e2ePassRate));
  console.log(pad("Schema 通过率", 20) + pad(fmtPct(b.schemaPassRate), 18) + pad(fmtPct(t.schemaPassRate), 20) + fmtDelta(t.schemaPassRate, b.schemaPassRate));
  console.log(pad("执行成功率", 20) + pad(fmtPct(b.execSuccessRate), 18) + pad(fmtPct(t.execSuccessRate), 20) + fmtDelta(t.execSuccessRate, b.execSuccessRate));
  console.log(pad("平均延迟", 20) + pad(`${b.avgLatencyMs.toFixed(0)}ms`, 18) + pad(`${t.avgLatencyMs.toFixed(0)}ms`, 20) + `${t.avgLatencyMs - b.avgLatencyMs >= 0 ? "+" : ""}${(t.avgLatencyMs - b.avgLatencyMs).toFixed(0)}ms`);
  console.log(pad("p95 延迟", 20) + pad(`${b.p95LatencyMs.toFixed(0)}ms`, 18) + pad(`${t.p95LatencyMs.toFixed(0)}ms`, 20) + `${t.p95LatencyMs - b.p95LatencyMs >= 0 ? "+" : ""}${(t.p95LatencyMs - b.p95LatencyMs).toFixed(0)}ms`);
  console.log(pad("prompt tokens", 20) + pad(b.avgPromptTokens?.toFixed(0) ?? "—", 18) + pad(t.avgPromptTokens?.toFixed(0) ?? "—", 20) + fmtTok(t.avgPromptTokens, b.avgPromptTokens));
  console.log(pad("completion tokens", 20) + pad(b.avgCompletionTokens?.toFixed(0) ?? "—", 18) + pad(t.avgCompletionTokens?.toFixed(0) ?? "—", 20) + fmtTok(t.avgCompletionTokens, b.avgCompletionTokens));

  // ====== 结论判定 ======
  console.log("\n" + "-".repeat(72));
  const qualityDelta = t.e2ePassRate - b.e2ePassRate;
  const costDelta = (t.avgCompletionTokens ?? 0) - (b.avgCompletionTokens ?? 0);
  if (qualityDelta >= 0.05) {
    console.log(`✅ 结论：thinking 端到端 +${(qualityDelta * 100).toFixed(1)}%，质量提升显著，值得开启。`);
  } else if (qualityDelta > 0) {
    console.log(`⚠ 结论：thinking 端到端 +${(qualityDelta * 100).toFixed(1)}%，提升有限，需结合成本判断。`);
  } else if (qualityDelta > -0.05) {
    console.log(`⚠ 结论：thinking 质量基本持平（${(qualityDelta * 100).toFixed(1)}%），token 成本 ${costDelta >= 0 ? "+" : ""}${(costDelta / 1000).toFixed(1)}k/次，建议保持关闭。`);
  } else {
    console.log(`❌ 结论：thinking 端到端 ${(qualityDelta * 100).toFixed(1)}%，质量下降，不建议开启。`);
  }
  console.log("-".repeat(72));

  // 写报告
  const abReport = {
    timestamp: Date.now(),
    effort: EFFORT,
    nRepeat: N_REPEAT,
    sampleCases: SAMPLE_SIZE,
    model: baseConfig.model,
    baseline: { summary: baseline.summary, cases: baseline.cases },
    thinking: { summary: thinking.summary, cases: thinking.cases },
  };
  writeFileSync(AB_REPORT_FILE, JSON.stringify(abReport, null, 2));
  console.log(`\nreport → ${AB_REPORT_FILE}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
