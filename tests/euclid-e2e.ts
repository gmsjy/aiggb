/**
 * 临时 e2e 测试：真实 API 跑"欧几里得勾股定理证明"完整流程
 *   node --import tsx tests/euclid-e2e.ts
 *
 * 流程：Phase 1 精炼（真实 API）→ Phase 2 编译（真实 API）→ RAG 纠正 → MockGGB 执行
 * 目的：观察 AI 对复杂几何构造（风车图）的处理质量
 */
import "./load-env.ts";
import { chatRaw, chat } from "../src/lib/aiClient";
import { buildRefinePrompt } from "../src/lib/refinePrompt";
import { buildCompilePrompt } from "../src/lib/prompts";
import { batchCorrect } from "../src/lib/commandCorrect";
import { executeCommands, resetTmpIds } from "../src/lib/ggbBridge";
import { MockGGB } from "./mockGGB";
import type { Command } from "../src/lib/schema";
import type { AIConfig } from "../src/lib/aiClient";

const config: AIConfig = {
  provider: "deepseek",
  baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
};

const USER_INPUT = "绘制欧几里得勾股定理证明（直角三角形三边上的正方形，风车图）";

async function main(): Promise<void> {
  if (!config.apiKey) {
    console.error("✗ 无 DEEPSEEK_API_KEY，无法在线测试");
    process.exit(1);
  }
  console.log(`模型: ${config.model}\n需求: ${USER_INPUT}\n`);

  // ── Phase 1 精炼（含空响应重试，与生产 refineSpec 一致） ──
  console.log("═══ Phase 1 精炼 ═══");
  let rawSpec = await chatRaw(config, [
    { role: "system", content: buildRefinePrompt("general") },
    { role: "user", content: USER_INPUT },
  ], undefined, config.model, undefined, true);
  if (!rawSpec.trim()) {
    console.log("⚠ 空响应，重试 1 次");
    rawSpec = await chatRaw(config, [
      { role: "system", content: buildRefinePrompt("general") },
      { role: "user", content: USER_INPUT },
    ], undefined, config.model, undefined, true);
  }
  const spec = parseSpec(rawSpec);
  console.log(spec.slice(0, 1200));
  console.log("\n");

  // ── Phase 2 编译 ──
  console.log("═══ Phase 2 编译 ═══");
  let response;
  try {
    response = await chat(config, [
      { role: "system", content: buildCompilePrompt("general", "2d") },
      { role: "user", content: spec },
    ], AbortSignal.timeout(60000));
  } catch (e) {
    console.error("✗ Phase 2 失败:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
  console.log("explanation:", response.explanation);
  console.log(`commands: ${response.commands.length} 条`);
  response.commands.forEach((c, i) => {
    const s = c.op === "eval" ? (c as { cmd: string }).cmd : `${c.op}`;
    console.log(`  [${i}] ${s.slice(0, 90)}`);
  });

  // ── RAG 纠正 + MockGGB 执行 ──
  console.log("\n═══ 执行（MockGGB，首次）═══");
  resetTmpIds();
  const mock = new MockGGB();
  const corrected = batchCorrect(response.commands.filter(c => c.op === "eval").map(c => ({ cmd: (c as { cmd: string }).cmd })));
  if (corrected.anyChanged) console.log("RAG 纠正:", corrected.summary.slice(0, 200));

  let results = executeCommands(mock, response.commands, "2d");
  reportResults(results);

  // ── 模拟生产修复回路（最多 2 次） ──
  const { collectFailures } = await import("../src/lib/ggbBridge");
  const { buildCheckerPrompt } = await import("../src/lib/prompts");
  let repairedResponse = response;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const failures = collectFailures(results);
    if (failures.length === 0) break;
    console.log(`\n═══ 修复回路 ${attempt}（${failures.length} 个失败）═══`);
    failures.forEach(f => console.log(`  ✗ ${f.cmd.slice(0, 70)} → ${f.error.slice(0, 80)}`));

    const checkerSystem = buildCheckerPrompt(failures, mock.getAllObjectNames(), spec);
    repairedResponse = await chat(config, [
      { role: "system", content: checkerSystem },
      { role: "assistant", content: JSON.stringify(response) },
    ], AbortSignal.timeout(60000));
    console.log(`修复命令: ${repairedResponse.commands.length} 条`);
    repairedResponse.commands.slice(0, 8).forEach((c, i) => {
      const s = c.op === "eval" ? (c as { cmd: string }).cmd : `${c.op}`;
      console.log(`  [${i}] ${s.slice(0, 80)}`);
    });

    resetTmpIds();
    const mock2 = new MockGGB();
    results = executeCommands(mock2, repairedResponse.commands, "2d");
    reportResults(results);
  }
}

function reportResults(results: { ok: boolean; command: { op: string }; error?: string }[]): void {
  const ok = results.filter(r => r.ok).length;
  const fails = results.filter(r => !r.ok);
  console.log(`执行: ${ok}/${results.length} 成功`);
  if (fails.length > 0) {
    fails.slice(0, 6).forEach(f => console.log(`  ✗ ${f.command.op}: ${(f.error ?? "").slice(0, 90)}`));
  }
}

/** 容错解析 Phase 1 输出 */
function parseSpec(raw: string): string {
  const cleaned = raw.trim().replace(/^```json?\s*/, "").replace(/\s*```$/, "");
  try {
    const parsed = JSON.parse(cleaned);
    return typeof parsed.spec === "string" ? parsed.spec : cleaned;
  } catch {
    return cleaned;
  }
}

void main();
