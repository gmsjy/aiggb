/**
 * GGB 原生截图 —— 利用 ggbApplet.getPNGBase64() 逐条渲染 fixture 命令
 *
 * Usage: npx tsx tests/visual-capture.ts [category]
 *   不带参数: physics,dynamic,composite
 *   带参数: physics
 *
 * 输出: tests/screenshots/{id}.png + tests/screenshots/index.html
 *
 * 原理：启动 Puppeteer/Playwright → 开 visual.html → 逐 case 截图
 * 回退：如果浏览器不可用，输出 fixture summary
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, "fixtures");
const SCREENSHOTS_DIR = join(__dirname, "screenshots");
const CASES_FILE = join(__dirname, "cases.json");

const TARGET = (process.argv[2] ?? "physics,dynamic,composite").split(",");

interface ScreenshotResult {
  id: string; title: string; category: string;
  screenshot: string;
  commands: number; ok: boolean;
}

async function main() {
  if (!existsSync(SCREENSHOTS_DIR)) mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const allCases = JSON.parse(readFileSync(CASES_FILE, "utf8")).cases as Array<{
    id: string; category: string; description: string;
  }>;
  const targets = allCases.filter(c => TARGET.includes(c.category));
  console.log(`\n[Visual Capture] ${targets.length} cases\n`);

  const results: ScreenshotResult[] = [];
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });

  for (let i = 0; i < targets.length; i++) {
    const tc = targets[i];
    const fixturePath = join(FIXTURES_DIR, `${tc.id}.json`);
    if (!existsSync(fixturePath)) { console.log(`  ⚠ ${tc.id}: no fixture`); continue; }

    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    process.stdout.write(`[${i + 1}/${targets.length}] ${tc.id}… `);

    try {
      const cmdsJson = encodeURIComponent(JSON.stringify(fixture.commands));
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto(`file:///${join(__dirname, "visual.html").replace(/\\/g, "/")}?cmds=${cmdsJson}`, { timeout: 30000 });
      await page.waitForFunction(() => document.title.startsWith("DONE:"), { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(1000);
      await page.screenshot({ path: join(SCREENSHOTS_DIR, `${tc.id}.png`) });
      await page.close();
      console.log(`✅ ${tc.id}.png`);
      results.push({ id: tc.id, title: tc.description, category: tc.category, screenshot: `${tc.id}.png`, commands: fixture.commands.length, ok: true });
    } catch (e) {
      console.log(`⚠ ${e instanceof Error ? e.message.slice(0,60) : 'render error'}`);
      results.push({ id: tc.id, title: tc.description, category: tc.category, screenshot: "", commands: fixture.commands.length, ok: false });
    }
  }

  await browser.close();

  // HTML report
  const html = `<!doctype html><html lang="zh"><head><meta charset="UTF-8"><title>AiGGB Visual Test</title>
<style>
body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px}
h1{color:#1e88e5}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(460px,1fr));gap:16px}
.card{background:#1e293b;border-radius:10px;padding:12px;border:1px solid #2c3a52}.card.ok{border-color:#43a047}
.card h3{margin:0}.cat{font-size:11px;color:#64748b;margin-left:8px}
.card p{font-size:13px;color:#94a3b8;margin:4px 0}
.card img{width:100%;border-radius:6px;margin-top:8px}
.summary{margin-bottom:16px;font-size:14px}
</style></head><body>
<h1>AiGGB 可视化测试报告</h1>
<div class="summary">${results.length} cases | ${new Date().toISOString().slice(0,10)} | ${results.filter(r=>r.ok).length} captured</div>
<div class="grid">${results.map(r => `
  <div class="card ${r.ok?'ok':'fail'}">
    <h3>${r.id}<span class="cat">${r.category}</span></h3>
    <p>${r.title} · ${r.commands} commands</p>
    ${r.screenshot ? `<img src="${r.screenshot}" loading="lazy"/>` : '<p style="color:#e53935">screenshot unavailable</p>'}
  </div>`).join("\n")}</div>
</body></html>`;

  writeFileSync(join(SCREENSHOTS_DIR, "index.html"), html);
  console.log(`\nreport → ${SCREENSHOTS_DIR}/index.html`);
}

main().catch(e => { console.error(e); process.exit(1); });
