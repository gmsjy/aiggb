/**
 * 可视化测试 —— 加载 fixture 命令到 GeoGebra 并截图
 *
 * Usage: npx tsx tests/visual-screenshots.ts [category]
 *   不带参数: 跑所有 physics + dynamic 用例
 *   带参数:   只跑指定 category（如 physics）
 *
 * 输出: tests/screenshots/{id}.png + tests/screenshots/index.html
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, "fixtures");
const SCREENSHOTS_DIR = join(__dirname, "screenshots");
const VISUAL_HTML = join(__dirname, "visual.html");
const CASES_FILE = join(__dirname, "cases.json");

const TARGET_CATEGORY = process.argv[2] ?? "physics,dynamic,composite";
const TARGETS = TARGET_CATEGORY.split(",").map(s => s.trim());

interface ScreenshotResult {
  id: string;
  title: string;
  category: string;
  screenshot: string;
  okCommands: number;
  failCommands: number;
  ok: boolean;
}

async function main() {
  if (!existsSync(SCREENSHOTS_DIR)) mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const allCases = JSON.parse(readFileSync(CASES_FILE, "utf8")).cases as Array<{
    id: string; category: string; description: string;
  }>;
  const targets = allCases.filter(c => TARGETS.includes(c.category));
  console.log(`\n[Visual Tests] ${targets.length} cases (${TARGETS.join(", ")})\n`);

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--no-sandbox"]
  }).catch(() =>
    chromium.launch({ headless: true, args: ["--no-sandbox"] })
  );
  const results: ScreenshotResult[] = [];

  for (let i = 0; i < targets.length; i++) {
    const tc = targets[i];
    const fixturePath = join(FIXTURES_DIR, `${tc.id}.json`);
    if (!existsSync(fixturePath)) {
      console.log(`  ⚠ ${tc.id}: fixture 缺失，跳过`);
      continue;
    }

    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    const cmdsJson = encodeURIComponent(JSON.stringify(fixture.commands));
    const pageUrl = `file:///${VISUAL_HTML.replace(/\\/g, "/")}?cmds=${cmdsJson}`;

    console.log(`[${i + 1}/${targets.length}] ${tc.id}: ${tc.description}`);

    try {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 30000 });

      // 等待 GGB 加载 + 命令执行完成（document.title 以 DONE: 开头）
      await page.waitForFunction(
        () => document.title.startsWith("DONE:"),
        { timeout: 25000 }
      );

      // 再等 1s 让 GGB 完成渲染
      await page.waitForTimeout(1500);

      const title = await page.title();
      const match = /DONE:(\d+)\/(\d+)/.exec(title);
      const ok = match ? parseInt(match[1]) : 0;
      const fail = match ? parseInt(match[2]) - ok : 0;

      // 截图
      const screenshotFile = `${tc.id}.png`;
      const screenshotPath = join(SCREENSHOTS_DIR, screenshotFile);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      results.push({
        id: tc.id,
        title: tc.description,
        category: tc.category,
        screenshot: screenshotFile,
        okCommands: ok,
        failCommands: fail,
        ok: fail === 0
      });

      const flag = fail === 0 ? "✅" : "⚠️";
      console.log(`  ${flag} ${ok} ok / ${fail} fail → ${screenshotFile}`);

      await page.close();
    } catch (err) {
      console.log(`  ❌ ${err instanceof Error ? err.message : err}`);
      results.push({
        id: tc.id, title: tc.description, category: tc.category,
        screenshot: "", okCommands: 0, failCommands: 1, ok: false
      });
    }
  }

  await browser.close();

  // 生成 HTML 报告
  const html = generateReport(results);
  writeFileSync(join(SCREENSHOTS_DIR, "index.html"), html);

  // 汇总
  const pass = results.filter(r => r.ok).length;
  console.log(`\n${"=".repeat(50)}`);
  console.log(`通过 ${pass}/${results.length}  (${(pass / results.length * 100).toFixed(0)}%)`);
  console.log(`截图: ${SCREENSHOTS_DIR}/`);
  console.log(`报告: ${SCREENSHOTS_DIR}/index.html\n`);
}

function generateReport(results: ScreenshotResult[]): string {
  const rows = results.map(r => `
    <div class="card ${r.ok ? 'ok' : 'fail'}">
      <h3>${r.id} <span class="cat">${r.category}</span></h3>
      <p>${r.title}</p>
      ${r.screenshot ? `<img src="${r.screenshot}" loading="lazy" />` : '<p class="err">截图失败</p>'}
      <div class="stats">${r.okCommands} ok / ${r.failCommands} fail</div>
    </div>
  `).join("\n");

  return `<!doctype html><html lang="zh"><head><meta charset="UTF-8"><title>AiGGB Visual Test Report</title>
<style>
  body{font-family:-apple-system,Segoe UI,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px}
  h1{color:#1e88e5} .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(480px,1fr));gap:16px}
  .card{background:#1e293b;border-radius:10px;padding:12px;border:1px solid #2c3a52}
  .card.ok{border-color:#43a047} .card.fail{border-color:#e53935}
  .card h3{margin:0;font-size:16px} .cat{font-size:11px;color:#64748b;margin-left:8px}
  .card p{margin:4px 0;font-size:13px;color:#94a3b8}
  .card img{width:100%;border-radius:6px;margin-top:8px}
  .stats{font-size:12px;color:#64748b;margin-top:4px}
  .err{color:#e53935}
</style></head><body>
<h1>AiGGB 可视化测试报告</h1>
<p>${results.length} cases | ${results.filter(r=>r.ok).length} pass | ${new Date().toISOString().slice(0,10)}</p>
<div class="grid">${rows}</div>
</body></html>`;
}

main().catch(e => { console.error(e); process.exit(1); });
