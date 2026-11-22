/** 失败根因探针：P7(参考) 对象名单 + P7-AI cmds[26] 手动重放 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:5173/tests/visual.html";
const { scenarios } = JSON.parse(readFileSync(join(here, "scenarios.json"), "utf-8"));
const p7ref = scenarios.find(s => s.id === "P7");
const p7ai = JSON.parse(readFileSync(join(here, "compiled/P7.json"), "utf-8"));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

async function loadAndProbe(cmds, label, extraProbe) {
  await page.goto(`${BASE}?cmds=${encodeURIComponent(JSON.stringify(cmds))}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.title.startsWith("DONE:"), { timeout: 90000, polling: 500 });
  const info = await page.evaluate(extraProbe);
  console.log(`\n===== ${label} =====`);
  console.log(JSON.stringify(info, null, 2));
}

await loadAndProbe(p7ref.cmds, "P7 参考（期望 incline/surf/M/G/N/f）", () => {
  const api = window.__ggbApplet__;
  const names = api.getAllObjectNames();
  const detail = {};
  for (const n of ["incline", "surf", "M", "G", "N", "f"]) {
    detail[n] = api.exists(n) ? api.getObjectType(n) : "MISSING";
  }
  return { allNames: names, expectDetail: detail, title: document.title };
});

await loadAndProbe(p7ai.commands, "P7-AI（cmds[26]=fvec Vector(P,ftip)）", () => {
  const api = window.__ggbApplet__;
  const replay = api.evalCommand("fvec2 = Vector(P, ftip)");
  return {
    title: document.title,
    ftipExists: api.exists("ftip"),
    ftipType: api.exists("ftip") ? api.getObjectType("ftip") : "MISSING",
    fvecExists: api.exists("fvec"),
    fvecReplay: replay,
    fvec2Exists: api.exists("fvec2"),
    names: api.getAllObjectNames()
  };
});

await browser.close();
