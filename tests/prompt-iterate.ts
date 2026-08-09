/**
 * Prompt 迭代工作流 —— 测试 → 分析 → 建议 → 记录
 *
 * Usage:
 *   npm run prompt:iterate                        # 完整迭代：跑在线测试 → 分析 → 输出建议
 *   npm run prompt:analyze                        # 仅分析最后一次测试报告
 *   npm run prompt:golden                         # 查看当前 golden prompt 信息
 *   npm run prompt:rollback <hash>                # 提示如何回滚到指定版本
 */
import "./load-env.js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const VERSIONS_FILE = join(__dirname, "versions.json");
const ANALYSIS_FILE = join(__dirname, "drift-analysis.json");

const STEP = process.argv[2] ?? "full";

async function main() {
  switch (STEP) {
    case "full":
      await fullIterate();
      break;
    case "analyze":
      execSync("npx tsx tests/drift-analyze.ts", { cwd: ROOT, stdio: "inherit" });
      break;
    case "golden":
      showGolden();
      break;
    case "compare":
      compareVersions();
      break;
    default:
      console.log("Usage: npm run prompt:iterate [full|analyze|golden|compare]");
  }
}

async function fullIterate() {
  console.log("\n═══ Prompt 迭代工作流 ═══\n");

  // Step 1: 跑 L1 离线
  console.log("[1/4] L1 离线回归…");
  execSync("npx tsx tests/runner.ts", { cwd: ROOT, stdio: "inherit" });

  // Step 2: 分析
  console.log("\n[2/4] 分析失败 pattern…");
  execSync("npx tsx tests/drift-analyze.ts", { cwd: ROOT, stdio: "inherit" });

  // Step 3: 读取建议
  console.log("\n[3/4] 生成修复建议…");
  if (!existsSync(ANALYSIS_FILE)) {
    console.log("  无分析报告，跳过");
    return;
  }
  const analysis = JSON.parse(readFileSync(ANALYSIS_FILE, "utf8"));
  const easyFixes = analysis.recommendations.filter(r => r.difficulty === "easy");

  if (easyFixes.length === 0) {
    console.log("  无 easy 级别修复，需人工介入");
  } else {
    console.log(`  发现 ${easyFixes.length} 条 easy 修复，预计可修复 ${easyFixes.reduce((s, r) => s + r.expectedFix, 0)} 条失败:`);
    for (const f of easyFixes) {
      console.log(`    ✓ ${f.action.substring(0, 80)}…`);
    }
    console.log("\n  查看完整建议: cat tests/prompt-suggestions.md");
  }

  // Step 4: 更新版本
  console.log("\n[4/4] 当前版本状态…");
  showGolden();

  console.log("\n═══ 迭代完成 ═══");
  console.log("下一步:");
  console.log("  1. 阅读 tests/prompt-suggestions.md");
  console.log("  2. 按建议修改 src/lib/prompts.ts 或 src/lib/commands.ts");
  console.log("  3. npm run test:hash  # 确认 fingerprint 变化");
  console.log("  4. npm run test:replay # 离线回归");
  console.log("  5. npm run test:record # 在线重录 fixtures（需要 API Key）");
  console.log("  6. npm run prompt:iterate # 再次迭代，验证修复效果");
}

function showGolden() {
  if (!existsSync(VERSIONS_FILE)) {
    console.log("  版本记录不存在");
    return;
  }
  const versions = JSON.parse(readFileSync(VERSIONS_FILE, "utf8"));
  const golden = versions.find(v => v.golden);
  if (golden) {
    console.log(`  ⭐ Golden: ${golden.hash}  (e2e=${(golden.e2ePassRate * 100).toFixed(0)}%  drift=${(golden.formatDriftRate * 100).toFixed(1)}%  ${golden.generalTokens}t)`);
  }
  console.log(`  历史版本: ${versions.length} 条`);
  if (versions.length > 1) {
    const last2 = versions.slice(0, 2);
    for (const v of last2) {
      const flag = v.golden ? "⭐" : "  ";
      console.log(`  ${flag} ${v.hash}  e2e=${(v.e2ePassRate * 100).toFixed(0)}%  ${v.generalTokens}t  ${new Date(v.timestamp).toISOString().slice(0, 10)}`);
    }
  }
}

function compareVersions() {
  if (!existsSync(VERSIONS_FILE)) {
    console.log("版本记录不存在。先运行 npm run test:drift 建基线。");
    return;
  }
  const versions = JSON.parse(readFileSync(VERSIONS_FILE, "utf8"));
  if (versions.length < 2) {
    console.log("只有一个版本记录，无法对比。再跑一次测试产生第二个版本。");
    return;
  }
  const [latest, previous] = versions;
  console.log("\n═══ 版本对比 ═══");
  console.log(`${previous.hash} → ${latest.hash}`);
  console.log(`e2e 通过率: ${(previous.e2ePassRate * 100).toFixed(0)}% → ${(latest.e2ePassRate * 100).toFixed(0)}% (${sign(latest.e2ePassRate - previous.e2ePassRate)}${Math.abs((latest.e2ePassRate - previous.e2ePassRate) * 100).toFixed(1)}%)`);
  console.log(`格式漂移率: ${(previous.formatDriftRate * 100).toFixed(1)}% → ${(latest.formatDriftRate * 100).toFixed(1)}%`);
  console.log(`token 数:    ${previous.generalTokens} → ${latest.generalTokens}`);
  if (latest.golden && !previous.golden) console.log("⭐ 新版本已成为 golden");
  if (previous.golden && !latest.golden) console.log("⚠ 新版本未达到 golden 标准");
}

function sign(v: number) { return v >= 0 ? "+" : ""; }

main().catch(console.error);
