/**
 * 层③：真实 GGB 引擎执行验证 —— Playwright 驱动 tests/visual.html 宿主
 *   - 参考命令集（10 场景，scenarios.json）
 *   - 在线编译产物（5 场景，compiled/P*.json，期望对象从产物推导）
 * 每场景：加载 ?cmds=<JSON> → 等待 document.title=DONE:ok/total fail:idx →
 *         校验期望对象存在 → 截图存证
 * 输出：results-layer3.json + screenshots/*.png
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:5173/tests/visual.html";
mkdirSync(join(here, "screenshots"), { recursive: true });

const { scenarios } = JSON.parse(readFileSync(join(here, "scenarios.json"), "utf-8"));

// 在线编译产物：期望对象 = eval 里赋值名 + slider 名（尽力推导）
function expectFromCompiled(json) {
  const names = new Set();
  for (const c of json.commands ?? []) {
    if (c.op === "eval") {
      const m = /^\s*([A-Za-z_]\w*)\s*(?:\([^)]*\))?\s*=/.exec(c.cmd);
      if (m) names.add(m[1]);
    } else if (c.op === "slider") names.add(c.name);
    else if (c.op === "vector") names.add(c.name);
  }
  return [...names];
}

const only = process.argv[2]?.split(",").filter(Boolean);
const jobs = [];
for (const sc of scenarios) {
  if (only && !only.includes(sc.id)) continue;
  jobs.push({ id: sc.id, name: sc.name, cmds: sc.cmds, expect: sc.expect, source: "reference" });
}
for (const id of ["P1", "P4", "P6", "P7", "P10"]) {
  if (only && !only.includes(`${id}-AI`)) continue;
  try {
    const json = JSON.parse(readFileSync(join(here, `compiled/${id}.json`), "utf-8"));
    jobs.push({ id: `${id}-AI`, name: `${id} 在线编译产物`, cmds: json.commands, expect: expectFromCompiled(json), source: "compiled" });
  } catch { /* 该场景无产物 */ }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const results = [];

for (const job of jobs) {
  const url = `${BASE}?cmds=${encodeURIComponent(JSON.stringify(job.cmds))}`;
  const r = { id: job.id, name: job.name, source: job.source, total: job.cmds.length };
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    // 等待执行完成信号（applet 加载 + 全量执行）
    await page.waitForFunction(
      () => typeof document.title === "string" && document.title.startsWith("DONE:"),
      { timeout: 90000, polling: 500 }
    );
    const title = await page.title();
    const m = /DONE:(\d+)\/(\d+) fail:([\d,]*)/.exec(title);
    r.execOk = m ? Number(m[1]) : -1;
    r.execTotal = m ? Number(m[2]) : -1;
    r.failIdx = m ? (m[3] || "") : "?";

    // 期望对象校验
    const missing = await page.evaluate((names) => {
      const api = window.__ggbApplet__;
      if (!api) return ["<no api>"];
      return names.filter(n => !api.exists(n));
    }, job.expect);
    r.expectCount = job.expect.length;
    r.missing = missing;
    r.objectCount = await page.evaluate(() => window.__ggbApplet__?.getObjectNumber?.() ?? -1);

    // 等动画跑一小段让 trace/轨迹可见，再截图
    await page.waitForTimeout(2500);
    await page.screenshot({ path: join(here, "screenshots", `${job.id}.png`) });

    const execPass = r.execOk === r.execTotal && r.execTotal > 0;
    const expectPass = r.missing.length === 0;
    r.pass = execPass && expectPass;
    console.log(`[Layer3] ${job.id}: exec ${r.execOk}/${r.execTotal}${r.failIdx ? ` fail:[${r.failIdx}]` : ""} | 期望对象 ${r.expectCount - r.missing.length}/${r.expectCount} | 对象总数 ${r.objectCount} | ${r.pass ? "PASS" : "FAIL"}`);
  } catch (e) {
    r.pass = false;
    r.error = String(e).slice(0, 300);
    console.log(`[Layer3] ${job.id}: ERROR ${r.error}`);
  }
  results.push(r);
}

await browser.close();
writeFileSync(join(here, "results-layer3.json"), JSON.stringify(results, null, 2));
const passN = results.filter(r => r.pass).length;
console.log(`[Layer3] 引擎执行: ${passN}/${results.length} 通过`);
