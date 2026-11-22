/**
 * [aiggb skill] 渲染器 —— 14-op 命令 → 真实 GGB 引擎执行 → PNG 出图
 *
 * 原理：内置静态服务器托管「渲染宿主 scripts/ggb-host.html + GGB 引擎目录」，
 * 用本机浏览器（Playwright 驱动，优先系统 Edge/Chrome，无需下载浏览器）无头加载，
 * 执行全部命令后经 applet getBase64 导出 PNG。
 *
 * 引擎解析顺序：--engine 参数 > AIGGB_GGB_HOME > 向上探测 public/GeoGebra
 *   （AiGGB 项目自托管 bundle）> --download 从官方下载（需直连网络）。
 * 浏览器解析顺序：AIGGB_CHROME 可执行文件 > chromium(完整版 playwright) >
 *   msedge(系统 Edge) > chrome(系统 Chrome)。需 `npm i playwright-core` 或
 *   `npm i playwright`（skill 目录内）。
 */

import { createServer, type Server } from "node:http";
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, resolve as resolvePath, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { encodeGIF } from "./gif";

const SKILL_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOST_HTML = join(SKILL_ROOT, "scripts", "ggb-host.html");

// ── 引擎目录解析 ──

export function resolveEngineDir(explicit?: string): string {
  const candidates: string[] = [];
  if (explicit) candidates.push(resolvePath(explicit));
  if (process.env.AIGGB_GGB_HOME) candidates.push(resolvePath(process.env.AIGGB_GGB_HOME));
  // 向上探测 AiGGB 项目自托管 bundle（skill 目录的 5 级父目录内）
  let dir = SKILL_ROOT;
  for (let i = 0; i < 6; i++) {
    candidates.push(join(dir, "public", "GeoGebra"));
    dir = dirname(dir);
  }
  for (const c of candidates) {
    if (existsSync(join(c, "deployggb.js"))) return c;
  }
  return "";
}

/** 从官方下载 Math Apps Bundle 并解压到 <skill>/engine/（需直连网络）。 */
export function downloadEngine(): string {
  const dest = join(SKILL_ROOT, "engine");
  if (existsSync(join(dest, "deployggb.js"))) return dest;
  mkdirSync(dest, { recursive: true });
  const zip = join(tmpdir(), `aiggb-ggb-bundle-${Date.now()}.zip`);
  console.error("[render] 正在从官方下载 GeoGebra Math Apps Bundle（~50MB，需直连网络）…");
  execFileSync(process.execPath, ["-e", `
    const { get } = require("https");
    const fs = require("fs");
    get("https://download.geogebra.org/package/geogebra-math-apps-bundle", res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        get(res.headers.location, r2 => pipe(r2));
        return;
      }
      pipe(res);
      function pipe(r) {
        if (r.statusCode !== 200) { console.error("HTTP", r.statusCode); process.exit(1); }
        const f = fs.createWriteStream(${JSON.stringify(zip)});
        r.pipe(f);
        f.on("finish", () => f.close(() => process.exit(0)));
      }
    });
  `], { stdio: "inherit" });
  // 解压：Windows 10+ 自带 bsdtar 可解 zip；Linux/macOS 优先 unzip
  console.error("[render] 解压到", dest);
  try {
    execFileSync("unzip", ["-o", zip, "-d", dest], { stdio: "pipe" });
  } catch {
    if (process.platform === "win32") {
      execFileSync("powershell", ["-NoProfile", "-Command",
        `Expand-Archive -Force -Path '${zip}' -DestinationPath '${dest}'`], { stdio: "pipe" });
    } else {
      execFileSync("tar", ["-xf", zip, "-C", dest], { stdio: "pipe" });
    }
  }
  // bundle 解压后可能是 <dest>/GeoGebra/... 嵌套
  if (!existsSync(join(dest, "deployggb.js")) && existsSync(join(dest, "GeoGebra", "deployggb.js"))) {
    return join(dest, "GeoGebra");
  }
  if (!existsSync(join(dest, "deployggb.js"))) {
    throw new Error("解压后未找到 deployggb.js——请检查 engine/ 目录结构");
  }
  return dest;
}

// ── 内置静态服务器 ──

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".png": "image/png", ".gif": "image/gif", ".svg": "image/svg+xml", ".jpg": "image/jpeg",
  ".json": "application/json", ".woff": "font/woff", ".woff2": "font/woff2",
  ".eot": "application/vnd.ms-fontobject", ".ttf": "font/ttf", ".ico": "image/x-icon"
};

export interface LocalServer { port: number; close: () => void; }

export function startHostServer(engineDir: string): Promise<LocalServer> {
  const hostHtml = readFileSync(HOST_HTML, "utf-8");
  return new Promise((resolvePromise, reject) => {
    const server: Server = createServer((req, res) => {
      try {
        const url = (req.url ?? "/").split("?")[0];
        if (url === "/" || url === "/host.html") {
          res.writeHead(200, { "Content-Type": MIME[".html"] });
          res.end(hostHtml);
          return;
        }
        if (url.startsWith("/engine/")) {
          const rel = url.slice("/engine/".length).split("/").map(decodeURIComponent).join("/");
          const file = resolvePath(engineDir, rel);
          if (!file.startsWith(resolvePath(engineDir)) || !existsSync(file) || !statSync(file).isFile()) {
            res.writeHead(404); res.end("not found"); return;
          }
          const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
          res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream", "Cache-Control": "no-store" });
          res.end(readFileSync(file));
          return;
        }
        res.writeHead(204); res.end();
      } catch (e) {
        res.writeHead(500); res.end(String(e));
      }
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      resolvePromise({ port, close: () => server.close() });
    });
  });
}

// ── 浏览器启动（playwright-core 优先，运行时动态解析，不打包）──

async function launchBrowserHeadless() {
  const executablePath = process.env.AIGGB_CHROME || undefined;
  const channel = process.env.AIGGB_BROWSER_CHANNEL;
  const errors: string[] = [];
  const importPkg = async (name: string) => {
    try { return await import(/* @vite-ignore */ name); } catch { errors.push(`${name}: 未安装`); return null; }
  };
  let pw = await importPkg("playwright-core") ?? await importPkg("playwright");
  if (!pw) {
    throw new Error(
      "渲染需要浏览器驱动：请在 skill 目录执行 `npm i playwright-core`（推荐，用系统 Edge/Chrome，无需下载浏览器），" +
      "或 `npm i playwright && npx playwright install chromium`。也可用 AIGGB_CHROME 指定浏览器可执行文件。" +
      (errors.length ? `（尝试失败：${errors.join("；")}）` : "")
    );
  }
  const attempts: Array<Record<string, unknown>> = [];
  if (executablePath) attempts.push({ executablePath, headless: true });
  if (channel) attempts.push({ channel, headless: true });
  attempts.push({ headless: true });                 // 完整版 playwright 自带 chromium
  attempts.push({ channel: "msedge", headless: true }); // Windows 系统自带 Edge
  attempts.push({ channel: "chrome", headless: true });
  for (const opt of attempts) {
    try {
      const browser = await pw.chromium.launch(opt);
      return browser;
    } catch (e) {
      errors.push(`${JSON.stringify(opt)}: ${(e as Error).message.split("\n")[0]}`);
    }
  }
  throw new Error("无法启动浏览器。尝试记录：\n" + errors.join("\n"));
}

// ── 渲染主流程 ──

export interface GifOptions {
  /** GIF 帧数（默认 24） */
  frames?: number;
  /** 帧率（默认 15 fps） */
  fps?: number;
  /** 动画驱动目标（滑块名）；缺省取第一个 animate op 的 on:true 目标 */
  animTarget?: string;
  /** 强制指定动画区间（缺省取对应 slider op 的 min/max） */
  animFrom?: number;
  animTo?: number;
  /** 输出缩放（相对视口，默认 0.5 → 640×400） */
  scale?: number;
}

export interface RenderOptions {
  commands: unknown[];
  out: string;
  engineDir?: string;
  appMode?: "2d" | "3d";
  width?: number;
  height?: number;
  /** 导出前停止动画（默认 true，保证截图确定性） */
  staticMode?: boolean;
  /** 是否自动下载引擎（找不到本地引擎时） */
  download?: boolean;
  timeoutMs?: number;
  /** 提供时输出 GIF 动图（out 建议用 .gif 后缀） */
  gif?: GifOptions;
  /** 导出 .ggb 构造文件（GeoGebra 可直接打开继续编辑的交互源文件） */
  ggb?: boolean;
}

export interface RenderResult {
  ok: boolean;
  out: string;
  execOk: number;
  execTotal: number;
  failedIdx: string;
  objects: number;
  exportSource: "getBase64" | "screenshot" | "none" | "gif" | "ggb";
  ms: number;
  engineDir: string;
  error?: string;
}

/** 从 14-op 命令里推导 GIF 动画参数（目标滑块/区间/是否往复）。
 *  同时识别 animate op 与 eval 形态（StartAnimation(t) / t = Slider(0,8,0.01)）。 */
export function inferAnimParams(commands: unknown[], override?: Partial<GifOptions>): Required<Pick<GifOptions, "animTarget" | "animFrom" | "animTo">> & { pingpong: boolean; frames: number; fps: number; scale: number } {
  const cmds = commands as Array<Record<string, unknown>>;
  let target = override?.animTarget ?? "";
  let from = override?.animFrom;
  let to = override?.animTo;
  let pingpong = false;
  // 滑块定义登记（slider op + eval Slider(...) 两种形态）
  const sliders = new Map<string, { min: number; max: number }>();
  const num = (v: unknown): number | undefined =>
    typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : undefined;
  for (const c of cmds) {
    if (c.op === "slider") {
      const s = c as { name?: string; min?: unknown; max?: unknown };
      const mn = num(s.min), mx = num(s.max);
      if (s.name && mn !== undefined && mx !== undefined) sliders.set(s.name, { min: mn, max: mx });
    } else if (c.op === "eval") {
      const cmdStr = String((c as { cmd?: string }).cmd ?? "");
      const sm = /^\s*([A-Za-z_]\w*)\s*=\s*Slider\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)/.exec(cmdStr);
      if (sm) sliders.set(sm[1], { min: Number(sm[2]), max: Number(sm[3]) });
    }
  }
  for (const c of cmds) {
    if (c.op === "animate" && (c as { on?: unknown }).on === true) {
      const t = (c as { target?: string }).target ?? "";
      if (!target) { target = t; pingpong = (c as { repeat?: string }).repeat === "oscillating"; }
    } else if (c.op === "eval" && !target) {
      const sm = /StartAnimation\(\s*([A-Za-z_]\w*)\s*[,)]/.exec(String((c as { cmd?: string }).cmd ?? ""));
      if (sm) target = sm[1];
    }
    if (c.op === "slider" && (c as { name?: string }).name === target) {
      const s = c as { min?: unknown; max?: unknown };
      from ??= num(s.min);
      to ??= num(s.max);
    }
  }
  // eval 形态滑块区间回填
  if (target && sliders.has(target)) {
    from ??= sliders.get(target)!.min;
    to ??= sliders.get(target)!.max;
  }
  // 兜底：没有 animate 意图时用第一个滑块
  if (!target && sliders.size > 0) {
    target = [...sliders.keys()][0];
    from ??= sliders.get(target)!.min;
    to ??= sliders.get(target)!.max;
  }
  return {
    animTarget: target,
    animFrom: from ?? 0,
    animTo: to ?? 1,
    pingpong,
    frames: override?.frames ?? 24,
    fps: override?.fps ?? 15,
    scale: override?.scale ?? 0.5
  };
}

export async function renderCommands(opts: RenderOptions): Promise<RenderResult> {
  const t0 = Date.now();
  const timeoutMs = opts.timeoutMs ?? 120000;
  const result: RenderResult = {
    ok: false, out: opts.out, execOk: 0, execTotal: opts.commands.length, failedIdx: "",
    objects: 0, exportSource: "none", ms: 0, engineDir: ""
  };
  let engineDir = resolveEngineDir(opts.engineDir);
  if (!engineDir && opts.download) engineDir = downloadEngine();
  if (!engineDir) {
    result.error =
      "未找到 GeoGebra 引擎。三选一：① --engine <Math Apps Bundle 目录>（含 deployggb.js）；" +
      "② 环境变量 AIGGB_GGB_HOME；③ --download 从官方下载到 skill/engine/（需直连网络）。" +
      "AiGGB 项目的 public/GeoGebra 会被自动探测。";
    result.ms = Date.now() - t0;
    return result;
  }
  result.engineDir = engineDir;

  const server = await startHostServer(engineDir);
  let browser = null;
  try {
    browser = await launchBrowserHeadless();
    const page = await browser.newPage({ viewport: { width: opts.width ?? 1280, height: opts.height ?? 800 } });
    const isGif = Boolean(opts.gif);
    const isGgb = Boolean(opts.ggb) && !isGif;
    const anim = isGif ? inferAnimParams(opts.commands, opts.gif) : null;
    if (isGif && anim && !anim.animTarget) {
      result.error = "GIF 模式未找到动画目标：命令中无 on:true 的 animate op，可用 --anim <滑块名> 显式指定";
      result.ms = Date.now() - t0;
      return result;
    }
    const qs = new URLSearchParams({
      cmds: JSON.stringify(opts.commands),
      app: opts.appMode === "3d" ? "3d" : "classic",
      w: String(opts.width ?? 1280),
      h: String(opts.height ?? 800),
      static: opts.staticMode === false ? "0" : "1",
      export: "1"
    });
    if (isGgb) qs.set("ggb", "1");
    if (isGif && anim) {
      qs.set("gif", "1");
      qs.set("frames", String(anim.frames));
      qs.set("anim", anim.animTarget);
      qs.set("animFrom", String(anim.animFrom));
      qs.set("animTo", String(anim.animTo));
      qs.set("gifScale", String(anim.scale));
      if (anim.pingpong) qs.set("pingpong", "1");
    }
    await page.goto(`http://127.0.0.1:${server.port}/?${qs.toString()}`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // 等 DONE 信号
    await page.waitForFunction(() => typeof document.title === "string" && (document.title.startsWith("DONE:") || document.title.startsWith("ERR:")), { timeout: timeoutMs, polling: 400 });
    const title = await page.title();
    if (title.startsWith("ERR:")) throw new Error("宿主错误: " + title);

    const m = /DONE:(\d+)\/(\d+) fail:([\d,]*)/.exec(title);
    result.execOk = m ? Number(m[1]) : -1;
    result.execTotal = m ? Number(m[2]) : -1;
    result.failedIdx = m ? (m[3] || "") : "?";
    result.objects = await page.evaluate(() => window.__execReport?.objects ?? -1);

    if (isGgb) {
      // .ggb 构造文件：等 GGBF 信号 → 拉取 base64 → 校验 ZIP 魔数 → 落盘
      await page.waitForFunction(() => typeof document.title === "string" && (document.title.startsWith("GGBF:") || document.title.startsWith("ERR:")), { timeout: 15000, polling: 300 });
      const b64 = await page.evaluate(() => (window as unknown as { __GGBFILE?: string | null }).__GGBFILE ?? null);
      if (typeof b64 === "string" && Buffer.from(b64.slice(0, 8), "base64").subarray(0, 2).toString("latin1") === "PK") {
        mkdirSync(dirname(resolvePath(opts.out)), { recursive: true });
        writeFileSync(resolvePath(opts.out), Buffer.from(b64, "base64"));
        result.exportSource = "ggb";
      } else {
        result.error = "getBase64 未返回有效的 .ggb ZIP 容器";
      }
    } else if (isGif && anim) {
      // 等 GIF 帧步进完成
      await page.waitForFunction(() => typeof document.title === "string" && (document.title.startsWith("GIF:") || document.title.startsWith("ERR:")), { timeout: timeoutMs, polling: 500 });
      const gifTitle = await page.title();
      const gifErr = await page.evaluate(() => (window as unknown as { __GIFERR?: string }).__GIFERR ?? null);
      const count = Number(/GIF:(\d+)/.exec(gifTitle)?.[1] ?? 0);
      if (gifErr || count === 0) throw new Error("GIF 帧采集失败: " + (gifErr ?? "0 帧"));
      // 逐帧拉取 base64 → RGBA
      const frames: Uint8Array[] = [];
      for (let k = 0; k < count; k++) {
        const b64 = await page.evaluate((i) => {
          const arr = (window as unknown as { __FRAMES?: string[] }).__FRAMES ?? [];
          return arr[i] ?? null;
        }, k);
        if (!b64) throw new Error(`GIF 第 ${k} 帧数据缺失`);
        frames.push(Buffer.from(b64, "base64"));
      }
      const fw = Math.round((opts.width ?? 1280) * anim.scale);
      const fh = Math.round((opts.height ?? 800) * anim.scale);
      const delayMs = Math.round(1000 / anim.fps);
      const gifBuf = encodeGIF(frames, fw, fh, delayMs);
      mkdirSync(dirname(resolvePath(opts.out)), { recursive: true });
      writeFileSync(resolvePath(opts.out), gifBuf);
      result.exportSource = "gif";
    } else {
      // 等 PNG 导出（DONE 后 10s 内）；非 PNG 魔数（如 .ggs zip）→ 视口截图兜底
      const isPngB64 = (b64: string | null | undefined) =>
        typeof b64 === "string" && Buffer.from(b64.slice(0, 20), "base64").subarray(0, 4).toString("hex") === "89504e47";
      try {
        await page.waitForFunction(() => typeof document.title === "string" && document.title.startsWith("PNG:"), { timeout: 10000, polling: 300 });
        const b64 = await page.evaluate(() => window.__PNG ?? null);
        if (isPngB64(b64)) {
          mkdirSync(dirname(resolvePath(opts.out)), { recursive: true });
          writeFileSync(resolvePath(opts.out), Buffer.from(b64!, "base64"));
          result.exportSource = "getBase64";
        }
      } catch { /* 落到截图兜底 */ }
      if (result.exportSource === "none") {
        mkdirSync(dirname(resolvePath(opts.out)), { recursive: true });
        await page.screenshot({ path: resolvePath(opts.out) });
        result.exportSource = "screenshot";
      }
    }

    result.ok = result.exportSource !== "none" && result.execOk === result.execTotal && result.execTotal > 0;
    if (result.exportSource === "none") {
      result.error = "导出失败（未产出有效文件）";
    } else if (result.execOk !== result.execTotal) {
      result.error = `部分命令执行失败（failIdx: ${result.failedIdx}）——文件已生成，可人工检查`;
    }
  } finally {
    try { await browser?.close(); } catch { /* noop */ }
    server.close();
  }
  result.ms = Date.now() - t0;
  return result;
}

// 宿主 window 类型扩展（仅类型层）
declare global {
  interface Window { __PNG?: string | null; __execReport?: { ok: number; total: number; failedIdx: number[]; objects: number } | null }
}
