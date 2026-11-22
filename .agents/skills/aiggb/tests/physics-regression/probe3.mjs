/** 探针3：rad 对象名冲突 + P-(表达式元组) 类型歧义 */
import { chromium } from "playwright";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:5173/tests/visual.html";
const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(`${BASE}?cmds=${encodeURIComponent(JSON.stringify([{ op: "eval", cmd: "zz0 = 1" }]))}`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.title.startsWith("DONE:"), { timeout: 90000, polling: 500 });

const r = await page.evaluate(() => {
  const api = window.__ggbApplet__;
  const out = {};
  // ① rad 作为对象名
  out.radSeg = api.evalCommand("rad = Segment((0,0),(1,1))");
  out.radExists = api.exists("rad");
  out.namesAfterRad = api.getAllObjectNames();
  // ② 控制组：非关键字名
  out.ctlSeg = api.evalCommand("segx = Segment((0,0),(1,1))");
  out.ctlExists = api.exists("segx");
  // ③ P-(表达式元组) 类型
  api.evalCommand("Qa = (3,3)");
  api.evalCommand("kk = 1");
  api.evalCommand("Qminus = Qa - (kk, 0)");
  out.qminusType = api.exists("Qminus") ? api.getObjectType("Qminus") : "MISSING";
  // ④ P+(-dx,-dy) 等价形态（推荐写法）
  api.evalCommand("Qplus = Qa + (-kk, 0)");
  out.qplusType = api.exists("Qplus") ? api.getObjectType("Qplus") : "MISSING";
  return out;
});
console.log(JSON.stringify(r, null, 2));
await browser.close();
