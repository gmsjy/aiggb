/**
 * 测试运行器 —— 离线回放 + 在线录制
 *
 * 使用方式：
 *   npm run test:replay  # L1：从 fixtures 读取 AI 响应，0 API cost，每次 commit 跑
 *   npm run test:record  # L3：调真实 DeepSeek API，更新 fixtures（需要 DEEPSEEK_API_KEY）
 *   npm run test:smoke   # L2：只跑 category=static + clarify 的子集
 *
 * 测试模型固定为 DeepSeek：保证可复现性、统一基线、避免多 provider 漂移。
 * 可通过环境变量覆盖：
 *   DEEPSEEK_API_KEY    —— 必填（record/smoke 模式）
 *   DEEPSEEK_MODEL      —— 默认 deepseek-v4-flash（也可 deepseek-v4-pro）
 *   DEEPSEEK_BASE_URL   —— 默认 https://api.deepseek.com
 *
 * 输出 tests/report.json + 控制台彩色摘要
 */

import "./load-env.js";

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { AIResponse } from "../src/lib/schema";
import { chat, type AIConfig } from "../src/lib/aiClient";
import { buildSystemPrompt } from "../src/lib/prompts";
import { executeCommands } from "../src/lib/ggbBridge";
import { MockGGB } from "./mockGGB";
import { assertResponse, type CaseExpectation } from "./assertions";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, "fixtures");
const CASES_FILE = join(__dirname, "cases.json");
const REPORT_FILE = join(__dirname, "report.json");

/** 测试统一锁定 DeepSeek（baseURL/model 可被 env 覆盖） */
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";
const TEST_TEMPERATURE = Number(process.env.TEST_TEMPERATURE ?? "0.05");

interface TestCase {
  id: string;
  category: string;
  description: string;
  input: string;
  domain: "general" | "physics";
  context?: { existingObjects?: string[] };
  expected: CaseExpectation;
}

interface CaseResult {
  id: string;
  category: string;
  pass: boolean;
  failures: string[];
  latencyMs?: number;
  totalTokens?: number;
  raw?: unknown;
}

const MODE = (process.env.TEST_MODE ?? "replay") as "replay" | "record" | "smoke";
const CATEGORY_FILTER = process.env.TEST_CATEGORY;

async function main() {
  const cases: TestCase[] = JSON.parse(readFileSync(CASES_FILE, "utf8")).cases;
  const filtered = filterCases(cases);

  console.log(`\n[AiGGB tests] mode=${MODE}, ${filtered.length}/${cases.length} cases\n`);

  if (!existsSync(FIXTURES_DIR)) mkdirSync(FIXTURES_DIR, { recursive: true });

  const results: CaseResult[] = [];
  for (const tc of filtered) {
    const r = await runOne(tc);
    results.push(r);
    const flag = r.pass ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
    console.log(`${flag} [${tc.category}] ${tc.id} — ${tc.description}`);
    if (!r.pass) {
      r.failures.forEach(f => console.log(`    \x1b[31m·\x1b[0m ${f}`));
    }
  }

  const pass = results.filter(r => r.pass).length;
  const total = results.length;
  const rate = (pass / total) * 100;

  console.log(`\n${"=".repeat(50)}`);
  console.log(`通过 ${pass}/${total}  (${rate.toFixed(1)}%)`);
  // 分类统计
  const byCat = new Map<string, { pass: number; total: number }>();
  for (const r of results) {
    const s = byCat.get(r.category) ?? { pass: 0, total: 0 };
    s.total++;
    if (r.pass) s.pass++;
    byCat.set(r.category, s);
  }
  for (const [cat, s] of byCat) {
    console.log(`  ${cat.padEnd(12)} ${s.pass}/${s.total}`);
  }

  writeFileSync(REPORT_FILE, JSON.stringify({ mode: MODE, timestamp: Date.now(), pass, total, rate, results }, null, 2));
  console.log(`\nreport → ${REPORT_FILE}`);

  // 质量门禁
  if (rate < 85) {
    console.error("\n\x1b[31m通过率 < 85%，质量门禁阻塞\x1b[0m");
    process.exit(1);
  } else if (rate < 95) {
    console.warn("\n\x1b[33m通过率 < 95%，警告\x1b[0m");
  }
}

function filterCases(cases: TestCase[]): TestCase[] {
  if (MODE === "smoke") {
    return cases.filter(c => c.category === "static" || c.category === "clarify").slice(0, 5);
  }
  if (CATEGORY_FILTER) {
    return cases.filter(c => c.category === CATEGORY_FILTER);
  }
  return cases;
}

async function runOne(tc: TestCase): Promise<CaseResult> {
  const t0 = Date.now();
  let response;
  try {
    response = MODE === "record" ? await callAndRecord(tc) : await loadFixture(tc);
  } catch (e) {
    return {
      id: tc.id,
      category: tc.category,
      pass: false,
      failures: [`获取 AI 响应失败：${e instanceof Error ? e.message : e}`]
    };
  }
  const latencyMs = Date.now() - t0;

  // 执行：用 MockGGB 跑命令
  const mock = new MockGGB();
  if (tc.context?.existingObjects) {
    mock.seed(tc.context.existingObjects.map(name => ({ name })));
  }
  const results = executeCommands(mock as never, response.commands);

  const { pass, failures } = assertResponse(
    response,
    results,
    tc.expected,
    tc.context?.existingObjects ?? []
  );

  return {
    id: tc.id,
    category: tc.category,
    pass,
    failures,
    latencyMs,
    raw: MODE === "record" ? response : undefined
  };
}

async function callAndRecord(tc: TestCase) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("缺少 DEEPSEEK_API_KEY 环境变量");

  const config: AIConfig = {
    provider: "deepseek",
    baseURL: DEEPSEEK_BASE_URL,
    apiKey,
    model: DEEPSEEK_MODEL,
    temperature: TEST_TEMPERATURE
  };
  // ★ highschool 用例跑在 3D 画布：显式传 appMode="3d"，避免 2D prompt 禁用 3D 命令
  const appMode: "2d" | "3d" = tc.category === "highschool" ? "3d" : "2d";
  const systemPrompt = buildSystemPrompt(tc.domain, appMode);
  // 注入 context：已存在对象作为对话历史
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt }
  ];
  if (tc.context?.existingObjects?.length) {
    const objList = tc.context.existingObjects.join(", ");
    messages.push({
      role: "assistant",
      content: JSON.stringify({
        explanation: `已创建对象：${objList}`,
        commands: tc.context.existingObjects.map(name => ({ op: "eval" as const, cmd: `${name} = ...` }))
      })
    });
  }
  messages.push({ role: "user", content: tc.input });
  const response = await chat(config, messages);
  // ★ 质量门禁：先用 MockGGB + 断言校验，达标才覆盖 fixture——避免模型集体退化时
  //   坏输出覆盖离线基线（runOne 会再做一次断言计入 report 门禁）
  const mock = new MockGGB();
  if (tc.context?.existingObjects) {
    mock.seed(tc.context.existingObjects.map(name => ({ name })));
  }
  const checkResults = executeCommands(mock as never, response.commands);
  const check = assertResponse(response, checkResults, tc.expected, tc.context?.existingObjects ?? []);
  if (check.pass) {
    writeFileSync(join(FIXTURES_DIR, `${tc.id}.json`), JSON.stringify(response, null, 2));
  } else {
    console.warn(`  ⚠ [record] ${tc.id} 未通过断言，保留旧 fixture（本次输出不落盘）`);
  }
  return response;
}

async function loadFixture(tc: TestCase) {
  const path = join(FIXTURES_DIR, `${tc.id}.json`);
  if (!existsSync(path)) {
    throw new Error(`fixture 缺失：${path}（请先运行 TEST_MODE=record npm run test:prompts 录制）`);
  }
  const raw = JSON.parse(readFileSync(path, "utf8"));
  return AIResponse.parse(raw);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
