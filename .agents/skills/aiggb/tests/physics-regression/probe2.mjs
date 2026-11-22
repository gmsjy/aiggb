/** 探针2：Polygon 字面量 vs 变量点对照 + Vector(Point,Vector) 重载 + P6-AI 名单 diff */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:5173/tests/visual.html";
const p6ai = JSON.parse(readFileSync(join(here, "compiled/P6.json"), "utf-8"));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// 空画布宿主：只发一个无操作命令
await page.goto(`${BASE}?cmds=${encodeURIComponent(JSON.stringify([{ op: "eval", cmd: "zz0 = 1" }]))}`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.title.startsWith("DONE:"), { timeout: 90000, polling: 500 });

const r = await page.evaluate(() => {
  const api = window.__ggbApplet__;
  const out = {};
  // ① 纯字面量 Polygon
  out.literalPoly = api.evalCommand("pl1 = Polygon((0,0),(6,0),(0,3))");
  out.literalPolyNames = api.getAllObjectNames().filter(n => /^pl1|^[A-Z]$|^poly/.test(n));
  out.pl1Exists = api.exists("pl1");
  // ② 先 Point 再 Polygon
  api.evalCommand("A9 = (0,0)");
  api.evalCommand("B9 = (6,0)");
  api.evalCommand("C9 = (0,3)");
  out.varPoly = api.evalCommand("pl2 = Polygon(A9, B9, C9)");
  out.pl2Exists = api.exists("pl2");
  // ③ Vector(Point, Vector) 重载
  api.evalCommand("W1 = Vector((0,0), (1,1))");
  out.pvOverload = api.evalCommand("W2 = Vector(A9, W1)");
  out.w2Exists = api.exists("W2");
  // ④ P-(dx,dy) 类型
  api.evalCommand("Q9 = (3,3)");
  api.evalCommand("Qd = Q9 - (1,0)");
  out.qdType = api.exists("Qd") ? api.getObjectType("Qd") : "MISSING";
  out.allNames = api.getAllObjectNames();
  return out;
});
console.log(JSON.stringify(r, null, 2));

// P6-AI 名单 diff
await page.goto(`${BASE}?cmds=${encodeURIComponent(JSON.stringify(p6ai.commands))}`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.title.startsWith("DONE:"), { timeout: 90000, polling: 500 });
const names = await page.evaluate(() => window.__ggbApplet__.getAllObjectNames());
const expect = new Set((() => {
  const s = [];
  for (const c of p6ai.commands) {
    if (c.op === "eval") { const m = /^\s*([A-Za-z_]\w*)\s*(?:\([^)]*\))?\s*=/.exec(c.cmd); if (m) s.push(m[1]); }
    else if (c.op === "slider" || c.op === "vector") s.push(c.name);
  }
  return s;
})());
console.log("P6-AI 期望:", [...expect].join(","));
console.log("P6-AI 实际:", names.join(","));
console.log("缺失:", [...expect].filter(n => !names.includes(n)).join(",") || "(无)");
await browser.close();
