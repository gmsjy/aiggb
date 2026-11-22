/** 探针7（修正版）：draw-demo vector op 失败根因——用 skill 宿主 + 内联静态服务器 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SKILL = join(here, "..", "..");
const ENGINE = resolve(join(SKILL, "..", "..", "..", "public", "GeoGebra"));
const cmds = JSON.parse(readFileSync(join(here, "compiled/draw-demo.json"), "utf-8")).commands;
const hostHtml = readFileSync(join(SKILL, "scripts", "ggb-host.html"), "utf-8");

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".gif": "image/gif", ".svg": "image/svg+xml", ".woff": "font/woff", ".woff2": "font/woff2", ".eot": "application/vnd.ms-fontobject", ".ttf": "font/ttf" };
const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  if (url === "/") { res.writeHead(200, { "Content-Type": "text/html" }); res.end(hostHtml); return; }
  if (url.startsWith("/engine/")) {
    const file = resolve(ENGINE, url.slice(8));
    try { const data = readFileSync(file); res.writeHead(200, { "Content-Type": MIME[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" }); res.end(data); } catch { res.writeHead(404); res.end(); }
    return;
  }
  res.writeHead(204); res.end();
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${port}/?cmds=${encodeURIComponent(JSON.stringify(cmds))}`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.title.startsWith("DONE:"), { timeout: 90000, polling: 500 });

const r = await page.evaluate(() => {
  const api = window.__ggbApplet__;
  const probe = {};
  for (const n of ["O", "P", "dTip", "vTip", "aTip", "dArrow", "vArrow", "aArrow", "v", "acc"]) {
    probe[n] = api.exists(n) ? `${api.getObjectType(n)}${!api.isDefined(n) ? " (UNDEFINED)" : ""}` : "MISSING";
  }
  probe.replayV = api.evalCommand("vArrow2 = Vector(P, vTip)");
  probe.vArrow2 = api.exists("vArrow2") ? api.getObjectType("vArrow2") : "MISSING";
  probe.replayO = api.evalCommand("oArrow2 = Vector(O, P)");
  probe.oArrow2 = api.exists("oArrow2") ? api.getObjectType("oArrow2") : "MISSING";
  return probe;
});
console.log(JSON.stringify(r, null, 2));
await browser.close();
server.close();
