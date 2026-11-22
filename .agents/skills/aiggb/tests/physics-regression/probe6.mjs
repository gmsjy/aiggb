/** 探针6：全新 applet 对照矩阵——Polygon 点数/命名/内联 + 向量链式类型翻转 */
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
  const o = {};
  const t = (label, fn) => { try { o[label] = fn(); } catch (e) { o[label] = "THROW:" + e.message; } };

  // A. 内联字面量 4 点 Polygon
  t("A_inline4", () => { const ok = api.evalCommand("polyA = Polygon((1,1),(2,1),(2,2),(1,2))"); return ok + "/" + (api.exists("polyA") ? api.getObjectType("polyA") : "MISSING"); });
  // B. 命名点 4 点 Polygon
  t("B_named4_setup", () => api.evalCommand("p1 = (5,1)") + "," + api.evalCommand("p2 = (6,1)") + "," + api.evalCommand("p3 = (6,2)") + "," + api.evalCommand("p4 = (5,2)"));
  t("B_named4_poly", () => { const ok = api.evalCommand("polyB = Polygon(p1,p2,p3,p4)"); return ok + "/" + (api.exists("polyB") ? api.getObjectType("polyB") : "MISSING"); });
  // C. 向量链式类型（静态）
  t("C_u_type", () => { api.evalCommand("u1 = (1,0)"); return api.getObjectType("u1"); });
  t("C_qa_plus_u", () => { api.evalCommand("qa = (0,0)"); api.evalCommand("qb = qa + u1"); return api.getObjectType("qb"); });
  t("C_qb_plus_u_chain", () => { api.evalCommand("qc = qb + u1"); return api.getObjectType("qc"); });
  t("C_qa_minus_u", () => { api.evalCommand("qd = qa - u1"); return api.getObjectType("qd"); });
  t("C_qa_plus_literal", () => { api.evalCommand("qe = qa + (0.5, 0.5)"); return api.getObjectType("qe"); });
  // D. 向量链式类型（动态/滑块）
  t("D_slider", () => api.evalCommand("th = Slider(0, 1, 0.01)"));
  t("D_ud_type", () => { api.evalCommand("ud = (cos(th), sin(th))"); return api.getObjectType("ud"); });
  t("D_qf_plus_ud", () => { api.evalCommand("qf = qa + ud"); return api.getObjectType("qf"); });
  t("D_qf_chain", () => { api.evalCommand("qg = qf + ud"); return api.getObjectType("qg"); });
  t("D_x_of_vector", () => { api.evalCommand("xn = x(ud)"); return api.exists("xn") ? api.getValueString("xn") : "MISSING"; });
  // E. Polygon(vector,...) 应失败对照
  t("E_poly_of_vectors", () => { const ok = api.evalCommand("polyC = Polygon(qb, qc, qd)"); return ok + "/" + (api.exists("polyC") ? api.getObjectType("polyC") : "MISSING"); });
  // F. 汇总全部对象名与类型
  o.F_all = api.getAllObjectNames().map(n => `${n}:${api.getObjectType(n)}`);
  return o;
});
console.log(JSON.stringify(r, null, 2));
await browser.close();
