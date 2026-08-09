/**
 * 漂移分析器 —— 从测试报告自动诊断失败根因并建议 prompt 修复
 *
 * Usage: npx tsx tests/drift-analyze.ts [report.json]
 *
 * 输出:
 *   1. 失败 pattern 聚类
 *   2. 受影响的 prompt 规则
 *   3. 建议的 prompt 修改
 *   4. 修复优先级排序
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_FILE = join(__dirname, "report.json");
const ANALYSIS_FILE = join(__dirname, "drift-analysis.json");
const SUGGESTION_FILE = join(__dirname, "prompt-suggestions.md");

// ===== 失败 pattern 分类器 =====

interface FailurePattern {
  id: string;
  pattern: RegExp;
  category: string;
  severity: "high" | "medium" | "low";
  affectedRule?: string;
  suggestion: string;
}

const FAILURE_PATTERNS: FailurePattern[] = [
  {
    id: "missing-physicsTrace",
    pattern: /缺少 op: physicsTrace/,
    category: "op-naming",
    severity: "medium",
    affectedRule: "physics P3 轨迹规则 + op 清单",
    suggestion: "在 op 清单中标注 physicsTrace 为物理域推荐 op；通用域允许 SetTrace 作为降级"
  },
  {
    id: "missing-Locus",
    pattern: /缺少 GGB 命令: Locus/,
    category: "command-selection",
    severity: "medium",
    affectedRule: "GGB 命令白名单 — Locus 命令使用频率低，AI 倾向用 Curve 替代",
    suggestion: "在 dynamic 模板 prompt 中显式写 '使用 Locus 命令'，或在白名单 Locus 行加 ⚠ 标注"
  },
  {
    id: "missing-Polygon",
    pattern: /缺少 GGB 命令: Polygon/,
    category: "command-selection",
    severity: "low",
    affectedRule: "多边形场景 AI 倾向用 Segment 逐边而非 Polygon",
    suggestion: "static 规则加一条：三点以上围成封闭图形优先用 Polygon 而非多条 Segment"
  },
  {
    id: "missing-Circle",
    pattern: /缺少 GGB 命令: Circle/,
    category: "command-selection",
    severity: "low",
    affectedRule: "极小参数下 AI 误判 Circle 不可见改用 Point",
    suggestion: "规则加 '无论参数多小，圆始终用 Circle 命令，视窗自动缩放'"
  },
  {
    id: "schema-failure-json",
    pattern: /AI 输出不符合 schema|AI 返回的不是合法 JSON/,
    category: "format-drift",
    severity: "high",
    affectedRule: "JSON 输出格式铁律",
    suggestion: "在 system prompt 开头和结尾各加一行 '只输出纯 JSON，不要任何额外字符'；加固 stripCodeFence 处理 'Here is...' 前缀"
  },
  {
    id: "missing-slider-op",
    pattern: /缺少 op: slider/,
    category: "op-selection",
    severity: "medium",
    affectedRule: "slider op vs eval Slider() 命令选择",
    suggestion: "op 清单强调 'slider op 比 eval Slider() 更受推荐，因为 slider op 含 unit/label 元数据'"
  },
  {
    id: "missing-animate-op",
    pattern: /缺少 op: animate/,
    category: "op-selection",
    severity: "medium",
    affectedRule: "animate op 在 context 场景中未使用",
    suggestion: "context 注入修复后自然解决；额外在规则加 '修改动画参数必须用 animate op'"
  },
  {
    id: "ask-not-triggered",
    pattern: /containsAsk=false.*期望 true/,
    category: "clarify-fail",
    severity: "medium",
    affectedRule: "[ASK] 反问规则触发阈值过高",
    suggestion: "将 ask 触发条件从 '缺少参数' 扩大到 '任何没有明确数值/形状/范围的输入都反问'"
  },
  {
    id: "command-count-too-low",
    pattern: /命令数 \d+ < min \d+/,
    category: "assertion-strict",
    severity: "low",
    affectedRule: "测试断言 commandCount.min 过严",
    suggestion: "降低对应用例的 commandCount.min，或标记为 '允许 AI 精简' "
  },
  {
    id: "execution-failure-mock",
    pattern: /GGB evalCommand 返回 false/,
    category: "execution",
    severity: "medium",
    affectedRule: "Mock 无法验证的命令（如 Complex 表达式、Undefined 引用）",
    suggestion: "检查具体失败命令，区分 'AI 写错' vs 'Mock 能力不足'"
  },
  {
    id: "context-not-referenced",
    pattern: /未引用 context 已存在对象/,
    category: "test-framework",
    severity: "high",
    affectedRule: "测试框架未注入 context 到对话",
    suggestion: "修复 runner.ts runOne 将 context.existingObjects 注入为对话历史的 assistant 轮"
  },
  {
    id: "missing-style-op",
    pattern: /缺少 op: style/,
    category: "op-selection",
    severity: "low",
    affectedRule: "修改场景应使用 style op",
    suggestion: "context 注入修复后自然解决"
  }
];

// ===== 主分析 =====

interface CaseResult {
  id: string;
  category: string;
  pass: boolean;
  failures: string[];
  latencyMs?: number;
}

interface AnalysisResult {
  timestamp: number;
  totalFailures: number;
  patternMatches: Array<{
    patternId: string;
    category: string;
    severity: string;
    count: number;
    cases: string[];
    suggestion: string;
  }>;
  recommendations: Array<{
    priority: number;
    action: string;
    expectedFix: number;
    difficulty: "easy" | "medium" | "hard";
  }>;
}

function analyze() {
  if (!existsSync(REPORT_FILE)) {
    console.error("report.json not found. Run npm run test:replay or test:record first.");
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(REPORT_FILE, "utf8"));
  const cases: CaseResult[] = report.results;
  const failed = cases.filter(c => !c.pass);

  console.log(`\n[Drift Analyzer] ${failed.length}/${cases.length} failures\n`);

  // 分类匹配
  const matches: AnalysisResult["patternMatches"] = [];
  const unmatchedFailureTexts: string[] = [];

  for (const pattern of FAILURE_PATTERNS) {
    const matched = failed.filter(c =>
      c.failures.some(f => pattern.pattern.test(f))
    );
    if (matched.length > 0) {
      matches.push({
        patternId: pattern.id,
        category: pattern.category,
        severity: pattern.severity,
        count: matched.length,
        cases: matched.map(c => c.id),
        suggestion: pattern.suggestion
      });
    }
  }

  // 未匹配的失败收集
  const allMatchedIds = new Set(matches.flatMap(m => m.cases));
  for (const c of failed) {
    if (!allMatchedIds.has(c.id)) {
      unmatchedFailureTexts.push(`${c.id}: ${c.failures.join("; ")}`);
    }
  }

  // 生成建议
  const recommendations: AnalysisResult["recommendations"] = [];

  // 高优先级：test-framework 修复
  const contextIssue = matches.find(m => m.patternId === "context-not-referenced");
  if (contextIssue) {
    recommendations.push({
      priority: 1,
      action: "修复测试框架：runOne 注入 context.existingObjects 到对话历史",
      expectedFix: contextIssue.count,
      difficulty: "easy"
    });
  }

  // 高优先级：格式漂移
  const formatIssue = matches.find(m => m.patternId === "schema-failure-json");
  if (formatIssue) {
    recommendations.push({
      priority: 2,
      action: formatIssue.suggestion,
      expectedFix: formatIssue.count,
      difficulty: "easy"
    });
  }

  // 中优先级：op 选择
  for (const m of matches.filter(m => m.category === "op-naming" || m.category === "op-selection")) {
    recommendations.push({
      priority: 3,
      action: m.suggestion,
      expectedFix: m.count,
      difficulty: "easy"
    });
  }

  // 中优先级：ask 触发
  const askIssue = matches.find(m => m.patternId === "ask-not-triggered");
  if (askIssue) {
    recommendations.push({
      priority: 4,
      action: askIssue.suggestion,
      expectedFix: askIssue.count,
      difficulty: "medium"
    });
  }

  // 低优先级：命令选择
  for (const m of matches.filter(m => m.category === "command-selection")) {
    recommendations.push({
      priority: 5,
      action: m.suggestion,
      expectedFix: m.count,
      difficulty: "medium"
    });
  }

  // 低优先级：断言放宽
  for (const m of matches.filter(m => m.category === "assertion-strict")) {
    recommendations.push({
      priority: 6,
      action: m.suggestion,
      expectedFix: m.count,
      difficulty: "easy"
    });
  }

  // 执行失败需人工审查
  const execIssue = matches.find(m => m.patternId === "execution-failure-mock");
  if (execIssue) {
    recommendations.push({
      priority: 7,
      action: `人工审查 ${execIssue.cases.join(", ")} 的执行失败是 AI 写错还是 Mock 能力不足`,
      expectedFix: 0,
      difficulty: "hard"
    });
  }

  const analysis: AnalysisResult = {
    timestamp: Date.now(),
    totalFailures: failed.length,
    patternMatches: matches,
    recommendations: recommendations.sort((a, b) => a.priority - b.priority)
  };

  // 写入 JSON 分析
  writeFileSync(ANALYSIS_FILE, JSON.stringify(analysis, null, 2));

  // 写入可读建议
  let md = "# Prompt 迭代建议\n\n";
  md += `> 自动生成 · ${new Date().toISOString().slice(0, 10)} · ${failed.length} 条失败 · ${matches.length} 类 pattern\n\n`;
  md += "## 按优先级排序\n\n";
  for (const r of recommendations) {
    const stars = r.difficulty === "easy" ? "🟢" : r.difficulty === "medium" ? "🟡" : "🔴";
    md += `### ${r.priority}. ${stars} ${r.action}\n`;
    md += `- 预计修复: ${r.expectedFix} 条\n`;
    md += `- 难度: ${r.difficulty}\n\n`;
  }
  if (unmatchedFailureTexts.length > 0) {
    md += "## 未匹配的失败\n\n";
    for (const t of unmatchedFailureTexts) {
      md += `- ${t}\n`;
    }
    md += "\n> 这些失败需要人工审查，可能是新的漂移 pattern\n";
  }
  writeFileSync(SUGGESTION_FILE, md);

  // 控制台输出
  console.log("Pattern 分布:");
  for (const m of matches.sort((a, b) => b.count - a.count)) {
    const bar = "█".repeat(Math.min(m.count, 20));
    console.log(`  ${m.patternId.padEnd(28)} ${bar} ${m.count}x [${m.severity}]`);
  }
  console.log(`\n${matches.length} 类 pattern 匹配, ${recommendations.length} 条建议`);
  console.log(`分析报告: ${ANALYSIS_FILE}`);
  console.log(`可读建议: ${SUGGESTION_FILE}`);

  if (unmatchedFailureTexts.length > 0) {
    console.log(`\n⚠ ${unmatchedFailureTexts.length} 条失败未匹配，需人工审查`);
  }
}

analyze();
