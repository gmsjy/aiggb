/** 探针4：P7-AI(重编译版) c1..c4 / u / n / ftip 类型与 defined 状态 */
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
  for (const n of ["u", "n", "P", "c1", "c2", "c3", "c4", "ftip", "Gtip", "Ntip", "block", "fvec"]) {
    probe[n] = api.exists(n) ? `${api.getObjectType(n)}${api.isDefined && !api.isDefined(n) ? " (UNDEFINED)" : ""}` : "MISSING";
  }
  return { title: document.title, probe };
});
console.log(JSON.stringify(r, null, 2));
await browser.close();
