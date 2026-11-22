/** 探针5：改写后的 P7-AI——c1..c4 类型 + Polygon 手动重放 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:5173/tests/visual.html";
const p7ai = JSON.parse(readFileSync(join(here, "compiled/P7.json"), "utf-8"));

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${BASE}?cmds=${encodeURIComponent(JSON.stringify(p7ai.commands))}`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.title.startsWith("DONE:"), { timeout: 90000, polling: 500 });

const r = await page.evaluate(() => {
  const api = window.__ggbApplet__;
  const probe = {};
  for (const n of ["P", "u", "n", "c1", "c2", "c3", "c4", "ftip", "block", "fvec"]) {
    probe[n] = api.exists(n) ? `${api.getObjectType(n)}${!api.isDefined(n) ? " (UNDEFINED)" : ""}` : "MISSING";
  }
  // 手动重放
  probe.replayBlock = api.evalCommand("block2 = Polygon(c1, c2, c3, c4)");
  probe.block2 = api.exists("block2") ? api.getObjectType("block2") : "MISSING";
  // 最简对照：字面量元组点 Polygon
  api.evalCommand("t1 = (1,1)");
  api.evalCommand("t2 = (2,1)");
  api.evalCommand("t3 = (2,2)");
  api.evalCommand("t4 = (1,2)");
  probe.literalPoly4 = api.evalCommand("tq = Polygon(t1, t2, t3, t4)");
  probe.tqType = api.exists("tq") ? api.getObjectType("tq") : "MISSING";
  // x(vector) 求值检查
  probe.xu = api.getValueString("x(u)");
  probe.c1val = api.getValueString("c1");
  return probe;
});
console.log(JSON.stringify(r, null, 2));
await browser.close();
