/**
 * 制图成本分析 —— 实测一轮完整两阶段流程的 token 消耗
 * Usage: npx tsx tests/analyze-cost.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = /^\s*(\w+)\s*=\s*(.+)/.exec(line);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey || apiKey.startsWith("sk-xxx")) {
  console.log("⚠ 无有效 API Key，运行估算模式");
  estimateOnly();
  process.exit(0);
}

async function realTest() {
  const { chatRaw, chat } = await import("../src/lib/aiClient");
  const { buildRefinePrompt } = await import("../src/lib/refinePrompt");
  const { buildCompilePrompt } = await import("../src/lib/prompts");

  const config = {
    provider: "deepseek",
    baseURL: (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, ""),
    apiKey: apiKey!,
    model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
    temperature: 0.1,
  };
  const flashModel = config.model;
  const proModel = flashModel.includes("pro") ? flashModel : "deepseek-v4-pro";

  const userInput = "画斜抛运动 v0=20 仰角 45°，留轨迹，标速度矢量";
  console.log("════ 制图成本实测 ════");
  console.log(`用户输入: "${userInput}"`);
  console.log(`flash模型: ${flashModel} | pro模型: ${proModel}\n`);

  const stages: Record<string, { prompt: number; completion: number }> = {};

  // ── Phase 1 精炼（flash）──
  const refinePrompt = buildRefinePrompt("physics");
  let usage1: { prompt: number; completion: number } | null = null;
  const spec = await chatRaw(config, [{ role: "system", content: refinePrompt }, { role: "user", content: userInput }], undefined, flashModel, undefined, true, u => { usage1 = u; });
  stages["Phase1 精炼(flash)"] = usage1 || { prompt: 0, completion: 0 };
  console.log(`[Phase1] 规格: ${spec.slice(0, 80)}…`);
  console.log(`  prompt=${stages["Phase1 精炼(flash)"].prompt} completion=${stages["Phase1 精炼(flash)"].completion}`);

  // ── Phase 2 编译（pro）──
  const compilePrompt = buildCompilePrompt("physics", "2d");
  let usage2: { prompt: number; completion: number } | null = null;
  const resp = await chat(config, [{ role: "system", content: compilePrompt }, { role: "user", content: spec }], undefined, proModel, u => { usage2 = u; });
  stages["Phase2 编译(pro)"] = usage2 || { prompt: 0, completion: 0 };
  console.log(`[Phase2] 命令数: ${resp.commands.length}`);
  console.log(`  prompt=${stages["Phase2 编译(pro)"].prompt} completion=${stages["Phase2 编译(pro)"].completion}`);

  // ── 汇总 ──
  console.log("\n════ 成本汇总 ════");
  let totalPrompt = 0, totalCompletion = 0;
  for (const [k, v] of Object.entries(stages)) {
    totalPrompt += v.prompt; totalCompletion += v.completion;
    console.log(`${k}: ${v.prompt} + ${v.completion} = ${v.prompt + v.completion} tokens`);
  }
  const total = totalPrompt + totalCompletion;
  console.log(`合计: ${totalPrompt} in + ${totalCompletion} out = ${total} tokens`);

  // DeepSeek 定价（参考价，单位 ¥/1M tokens）
  const price = { flashIn: 0.5, flashOut: 2.0, proIn: 2.0, proOut: 8.0 };
  const p1 = stages["Phase1 精炼(flash)"], p2 = stages["Phase2 编译(pro)"];
  const costPhase1 = (p1.prompt / 1e6) * price.flashIn + (p1.completion / 1e6) * price.flashOut;
  const costPhase2 = (p2.prompt / 1e6) * price.proIn + (p2.completion / 1e6) * price.proOut;
  console.log(`\n单次制图成本估算（一次 Phase1+Phase2，无修复）:`);
  console.log(`  Phase1(flash): ¥${costPhase1.toFixed(5)}`);
  console.log(`  Phase2(pro):   ¥${costPhase2.toFixed(5)}`);
  console.log(`  合计:          ¥${(costPhase1 + costPhase2).toFixed(5)} / 次`);
  console.log(`  ≈ ${((costPhase1 + costPhase2) * 10000).toFixed(1)} 元/万次`);
}

function estimateOnly() {
  // 基于 prompt 字符数估算 token（无 API）
  console.log("估算模式（无 API）：\n");
  const prompts = [
    ["Phase1 精炼 prompt", "buildRefinePrompt"],
    ["Phase2 编译 prompt", "buildCompilePrompt"],
  ];
  for (const [name] of prompts) console.log(`  ${name}: 需真实 API 实测`);
  console.log("\n⚠ 建议配置 .env 后运行获得精确数据");
}

realTest().catch(e => { console.error("ERR:", e.message); process.exit(1); });
