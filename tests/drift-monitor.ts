/**
 * 漂移监控器 —— N=10 重复 + 分层指标 + 版本对比
 *
 * 使用方式：
 *   npm run test:drift           # N=10 漂移抽样（需要 DEEPSEEK_API_KEY）
 *   npm run test:drift-baseline  # 建立/更新基线
 *
 * 输出 tests/drift-report.json + 更新 tests/versions.json
 *
 * 密钥配置：复制 .env.example → .env 填入 DEEPSEEK_API_KEY（.gitignore 已排除 .env）
 *
 * 监控维度：
 *   L1 清洗层: 格式漂移率（需要 code fence 剥离 / JSON 容错的响应比例）
 *   L2 校验层: Schema 首轮通过率（Zod safeParse 成功的比例）
 *   L3 执行层: MockGGB 执行成功率（不含自修复的原始成功率）
 *   L4 整体:   端到端首轮完全成功率（无需修复的比例）
 *
 * 漂移类型细分：
 *   格式漂移: 含 ``` 包裹 / 问候语 / 解释性前缀
 *   语法漂移: 非法 JSON / schema 不匹配
 *   语义漂移: 假命令 / 白名单外命令 / 执行失败
 *   类型漂移: Point+Point / 变量命名冲突
 */

import "./load-env.js";

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { chat, AISchemaError, type AIConfig } from "../src/lib/aiClient";
import { buildSystemPrompt } from "../src/lib/prompts";
import { executeCommands } from "../src/lib/ggbBridge";
import { MockGGB } from "./mockGGB";
import { promptVersion } from "./prompt-hash";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CASES_FILE = join(__dirname, "cases.json");
const DRIFT_REPORT_FILE = join(__dirname, "drift-report.json");
const VERSIONS_FILE = join(__dirname, "versions.json");

const N_REPEAT = Number(process.env.DRIFT_N ?? "10");
const DRIFT_CATEGORIES = new Set(["regression", "clarify", "physics"]);
const SAMPLE_SIZE = Number(process.env.DRIFT_SAMPLE ?? "6");

// ============ 类型定义 ============

interface DriftCaseResult {
  id: string;
  description: string;
  runs: DriftRun[];
  /** 该用例 10 次中的漂移统计 */
  stats: DriftStats;
}

interface DriftRun {
  pass: boolean; // 端到端首轮成功
  latencyMs: number;
  tokens?: { prompt: number; completion: number };
  layers: {
    cleaning: { needed: boolean; pattern?: string }; // false=纯净输出
    validation: { passed: boolean; error?: string }; // schema 首轮通过
    execution: { okCount: number; total: number; failures: string[] }; // 执行层
  };
  raw?: string;
}

interface DriftStats {
  formatDriftRate: number;
  schemaPassRate: number;
  execSuccessRate: number;
  e2ePassRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
}

interface DriftReport {
  timestamp: number;
  promptVersion: ReturnType<typeof promptVersion>;
  nRepeat: number;
  sampleCases: number;
  summary: DriftStats & {
    /** 按漂移类型细分 */
    breakdown: {
      formatDriftCount: number;
      schemaFailCount: number;
      semanticFailCount: number;
      typeConflictCount: number;
    };
  };
  cases: DriftCaseResult[];
}

// ============ 主流程 ============

async function main() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("缺少 DEEPSEEK_API_KEY 环境变量。漂移监控需要调真实 API。");
    console.error("用法: DEEPSEEK_API_KEY=sk-xxx npm run test:drift");
    process.exit(1);
  }

  const config: AIConfig = {
    provider: "deepseek",
    baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
    apiKey,
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
    temperature: 0.05
  };

  const pv = promptVersion();
  console.log(`\n[Drift Monitor] prompt=${pv.hash} N=${N_REPEAT}`);
  console.log(`  通用: ${pv.generalTokens}t  物理: ${pv.physicsTokens}t`);
  console.log(`  模型: ${config.model}\n`);

  // 选取漂移敏感用例
  const allCases = JSON.parse(readFileSync(CASES_FILE, "utf8")).cases as Array<{
    id: string; description: string; category: string; domain: string; input: string;
    context?: { existingObjects?: string[] };
  }>;
  const sample = allCases
    .filter((c: { category: string }) => DRIFT_CATEGORIES.has(c.category))
    .slice(0, SAMPLE_SIZE);

  // 检查 baseline
  const isBaseline = process.env.DRIFT_BASELINE === "1";
  let baseline: DriftReport | null = null;
  if (!isBaseline && existsSync(DRIFT_REPORT_FILE)) {
    baseline = JSON.parse(readFileSync(DRIFT_REPORT_FILE, "utf8"));
    if (baseline!.promptVersion.hash === pv.hash) {
      console.log(`⚠ prompt 未变更 (hash=${pv.hash})，本次结果将覆盖旧报告`);
    } else {
      console.log(`prompt 已变更: ${baseline!.promptVersion.hash} → ${pv.hash}`);
    }
  }

  const cases: DriftCaseResult[] = [];

  for (let ci = 0; ci < sample.length; ci++) {
    const tc = sample[ci];
    console.log(`[${ci + 1}/${sample.length}] ${tc.id}…`);
    const runs: DriftRun[] = [];

    for (let r = 0; r < N_REPEAT; r++) {
      const t0 = Date.now();
      const run: DriftRun = {
        pass: false,
        latencyMs: 0,
        layers: {
          cleaning: { needed: false },
          validation: { passed: false },
          execution: { okCount: 0, total: 0, failures: [] }
        }
      };

      try {
        // ★ highschool 用例跑在 3D 画布：显式传 appMode="3d"
        const appMode: "2d" | "3d" = tc.category === "highschool" ? "3d" : "2d";
        const systemPrompt = buildSystemPrompt(tc.domain as "general" | "physics", appMode);
        const response = await chat(config, [
          { role: "system", content: systemPrompt },
          { role: "user", content: tc.input }
        ]);

        run.latencyMs = Date.now() - t0;

        // L1 清洗层: 检测是否需要 code fence 剥离
        // chat() 内部已做 stripCodeFence，这里检查原始输出是否有漂移迹象
        // 我们通过 AIResponse 是否成功解析间接判断（格式漂移会触发 AISchemaError）

        // L2 校验层: 此时已成功返回 = schema 通过
        run.layers.validation.passed = true;

        // L3 执行层
        const mock = new MockGGB();
        if (tc.context?.existingObjects) {
          mock.seed(tc.context.existingObjects.map(name => ({ name })));
        }
        const results = executeCommands(mock as never, response.commands);
        run.layers.execution.okCount = results.filter(r => r.ok).length;
        run.layers.execution.total = results.length;
        run.layers.execution.failures = results
          .filter(r => !r.ok)
          .map(r => `${r.command.op}: ${r.error ?? "?"}`);

        // L4 端到端
        run.pass = results.every(r => r.ok);

      } catch (err) {
        run.latencyMs = Date.now() - t0;
        if (err instanceof AISchemaError) {
          // L1 或 L2 失败
          run.layers.validation.passed = false;
          run.layers.validation.error = err.detail;
          // 尝试检测 L1 清洗层迹象
          if (/```|code.?block|markdown/i.test(err.raw)) {
            run.layers.cleaning.needed = true;
            run.layers.cleaning.pattern = "code-fence";
          }
        }
        run.pass = false;
        process.stdout.write("✗");
        continue;
      }
      process.stdout.write(run.pass ? "." : "✗");
    }

    const stats = computeStats(runs);
    cases.push({ id: tc.id, description: tc.description, runs, stats });
    console.log(`  ${(stats.e2ePassRate * 100).toFixed(0)}% | 格式 ${(stats.formatDriftRate * 100).toFixed(0)}% | Schema ${(stats.schemaPassRate * 100).toFixed(0)}% | 执行 ${(stats.execSuccessRate * 100).toFixed(0)}% | p95 ${stats.p95LatencyMs}ms`);
  }

  // 汇总
  const allRuns = cases.flatMap(c => c.runs);
  const summaryStats = computeStats(allRuns);
  const breakdown = {
    formatDriftCount: allRuns.filter(r => r.layers.cleaning.needed).length,
    schemaFailCount: allRuns.filter(r => !r.layers.validation.passed).length,
    semanticFailCount: allRuns.filter(r => !r.pass && r.layers.validation.passed).length,
    typeConflictCount: allRuns.filter(r =>
      r.layers.execution.failures.some(f => /Point.*Point|Vector.*type/i.test(f))
    ).length
  };

  const report: DriftReport = {
    timestamp: Date.now(),
    promptVersion: pv,
    nRepeat: N_REPEAT,
    sampleCases: cases.length,
    summary: { ...summaryStats, breakdown },
    cases
  };

  writeFileSync(DRIFT_REPORT_FILE, JSON.stringify(report, null, 2));

  // 更新版本记录
  appendVersion(pv, summaryStats, cases.length);

  // ====== 控制台摘要 ======
  console.log(`\n${"=".repeat(56)}`);
  console.log(`漂移监控报告  prompt=${pv.hash.slice(0, 8)}  N=${N_REPEAT}×${cases.length}`);
  console.log(`${"=".repeat(56)}`);
  console.log(`端到端首轮通过率:  ${pct(summaryStats.e2ePassRate)}`);
  console.log(`格式漂移率:        ${pct(summaryStats.formatDriftRate)}  (目标 < 1%)`);
  console.log(`Schema 通过率:     ${pct(summaryStats.schemaPassRate)}`);
  console.log(`执行成功率:        ${pct(summaryStats.execSuccessRate)}  (目标 ≥ 95%)`);
  console.log(`平均延迟:          ${summaryStats.avgLatencyMs.toFixed(0)}ms  p95: ${summaryStats.p95LatencyMs.toFixed(0)}ms`);
  console.log(`\n漂移细分:`);
  console.log(`  格式漂移: ${breakdown.formatDriftCount}/${allRuns.length}`);
  console.log(`  Schema 失败: ${breakdown.schemaFailCount}/${allRuns.length}`);
  console.log(`  语义失败: ${breakdown.semanticFailCount}/${allRuns.length}`);
  console.log(`  类型冲突: ${breakdown.typeConflictCount}/${allRuns.length}`);

  // 与基线对比
  if (baseline && baseline.promptVersion.hash !== pv.hash) {
    const d = {
      e2e: summaryStats.e2ePassRate - baseline.summary.e2ePassRate,
      format: summaryStats.formatDriftRate - baseline.summary.formatDriftRate,
      latency: summaryStats.avgLatencyMs - baseline.summary.avgLatencyMs
    };
    console.log(`\nvs 基线 (${baseline.promptVersion.hash.slice(0, 8)}):`);
    console.log(`  端到端: ${sign(d.e2e * 100)}${Math.abs(d.e2e * 100).toFixed(1)}%`);
    console.log(`  格式漂移: ${sign(d.format * 100)}${Math.abs(d.format * 100).toFixed(1)}%`);
    console.log(`  延迟: ${sign(d.latency)}${Math.abs(d.latency).toFixed(0)}ms`);
  }

  console.log(`\nreport → ${DRIFT_REPORT_FILE}`);
  console.log(`versions → ${VERSIONS_FILE}`);

  // 门禁
  if (summaryStats.formatDriftRate > 0.05) {
    console.error("\n🚫 格式漂移率 > 5%，阻塞");
    process.exit(1);
  }
  if (summaryStats.e2ePassRate < 0.85) {
    console.error("\n🚫 端到端通过率 < 85%，阻塞");
    process.exit(1);
  }
  console.log("\n✅ 漂移基线合格");
}

// ============ 工具 ============

function computeStats(runs: DriftRun[]): DriftStats {
  const n = runs.length;
  if (n === 0) return { formatDriftRate: 0, schemaPassRate: 0, execSuccessRate: 0, e2ePassRate: 0, avgLatencyMs: 0, p95LatencyMs: 0 };

  const p = runs.filter(r => r.pass).length;
  const f = runs.filter(r => r.layers.cleaning.needed).length;
  const s = runs.filter(r => r.layers.validation.passed).length;
  const lats = runs.map(r => r.latencyMs).sort((a, b) => a - b);
  const exec = runs
    .filter(r => r.layers.execution.total > 0)
    .map(r => r.layers.execution.okCount / r.layers.execution.total);

  return {
    formatDriftRate: f / n,
    schemaPassRate: s / n,
    execSuccessRate: exec.length > 0 ? exec.reduce((a, b) => a + b, 0) / exec.length : 0,
    e2ePassRate: p / n,
    avgLatencyMs: lats.reduce((a, b) => a + b, 0) / n,
    p95LatencyMs: lats[Math.ceil(n * 0.95) - 1] ?? lats[n - 1]
  };
}

function pct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

function sign(v: number): string {
  return v >= 0 ? "+" : "";
}

// ============ 版本管理 ============

function appendVersion(
  pv: ReturnType<typeof promptVersion>,
  stats: DriftStats,
  sampleSize: number
) {
  let ledger: Array<{
    hash: string;
    timestamp: number;
    generalTokens: number;
    physicsTokens: number;
    e2ePassRate: number;
    formatDriftRate: number;
    sampleCases: number;
    nRepeat: number;
    note?: string;
    golden?: boolean;
  }> = [];

  if (existsSync(VERSIONS_FILE)) {
    ledger = JSON.parse(readFileSync(VERSIONS_FILE, "utf8"));
  }

  // 如果同 hash 已有记录，更新（覆盖旧结果）
  const existing = ledger.findIndex(v => v.hash === pv.hash);
  const entry = {
    hash: pv.hash,
    timestamp: pv.timestamp,
    generalTokens: pv.generalTokens,
    physicsTokens: pv.physicsTokens,
    e2ePassRate: stats.e2ePassRate,
    formatDriftRate: stats.formatDriftRate,
    sampleCases: sampleSize,
    nRepeat: N_REPEAT
  };

  if (existing >= 0) {
    ledger[existing] = { ...ledger[existing], ...entry };
  } else {
    ledger.push(entry);
  }

  // 按端到端通过率排序，最优的自动标 golden
  ledger.sort((a, b) => b.e2ePassRate - a.e2ePassRate || a.formatDriftRate - b.formatDriftRate);
  ledger.forEach(v => (v.golden = false));
  if (ledger.length > 0 && ledger[0].e2ePassRate >= 0.85) {
    ledger[0].golden = true;
  }

  writeFileSync(VERSIONS_FILE, JSON.stringify(ledger, null, 2));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
