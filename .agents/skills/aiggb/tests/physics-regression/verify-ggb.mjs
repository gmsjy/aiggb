/** .ggb 回读验证：导出文件 → setBase64 载入全新 applet → 对象恢复核对 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SKILL = join(here, "..", "..");
const ENGINE = resolve(join(SKILL, "..", "..", "..", "public", "GeoGebra"));
const hostHtml = readFileSync(join(SKILL, "scripts", "ggb-host.html"), "utf-8");
const ggbB64 = readFileSync(join(here, process.argv[2] ?? "figures/P1.ggb")).toString("base64");

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".gif": "image/gif", ".svg": "image/svg+xml", ".woff": "font/woff", ".woff2": "font/woff2", ".eot": "application/vnd.ms-fontobject", ".ttf": "font/ttf" };
const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  if (url === "/") { res.writeHead(200, { "Content-Type": "text/html" }); res.end(hostHtml); return; }
  if (url.startsWith("/engine/")) {
    const file = resolve(ENGINE, url.slice(8));
    try { res.writeHead(200, { "Content-Type": MIME[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" }); res.end(readFileSync(file)); } catch { res.writeHead(404); res.end(); }
    return;
  }
  res.writeHead(204); res.end();
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${port}/?cmds=${encodeURIComponent(JSON.stringify([{ op: "eval", cmd: "zz0 = 1" }]))}`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.title.startsWith("DONE:"), { timeout: 90000, polling: 500 });

const r = await page.evaluate(async (b64) => {
  const api = window.__ggbApplet__;
  const before = api.getObjectNumber();
  const okLoad = await new Promise(res => {
    const sync = api.setBase64(b64, () => res(true));
    if (typeof sync === "boolean") res(sync); // 部分版本同步返回
  });
  await new Promise(r => setTimeout(r, 800));
  return {
    before, okLoad,
    after: api.getObjectNumber(),
    names: api.getAllObjectNames(),
    // 抽查：滑块 v0 的值应恢复为 20
    v0: api.exists("v0") ? api.getValueString("v0") : "MISSING"
  };
}, ggbB64).catch(e => ({ error: String(e) }));

console.log(JSON.stringify(r, null, 2));
await browser.close();
server.close();
