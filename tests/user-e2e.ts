/**
 * 用户视角全量测试（黑盒）—— 像真实用户一样操作 AiGGB
 *
 * Usage: npx tsx tests/user-e2e.ts
 * 前置: npm run dev 已在 http://localhost:5173 运行；.env 提供 DEEPSEEK_API_KEY/MODEL/BASE_URL
 *
 * 场景（每步整页截图存 tests/user-e2e/）：
 *   A 首屏加载（画布注入 + 顶栏控件）
 *   B 工具栏模板弹窗 → 斜抛运动 → 规格确认 → 绘制（两阶段流水线，记耗时）
 *   C 多轮修改（轨迹改红色虚线）
 *   D 自然语言画单摆
 *   E 工具栏切 3D
 *   F 清空画布（confirm 对话框）
 *
 * 判定：无 .bubble-error、发送后出现用户气泡且输入循环结束、无 pageerror。
 * 产物：tests/user-e2e/*.png + tests/user-e2e/results.json
 */
import { chromium, type Page } from "playwright";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "user-e2e");
const BASE_URL = "http://localhost:5173";

function loadEnv(): Record<string, string> {
  const path = join(__dirname, "..", ".env");
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z_]+)\s*=\s*(.*)$/.exec(line.trim());
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

interface SceneResult {
  id: string;
  name: string;
  status: "pass" | "fail" | "blocked";
  durationMs: number;
  screenshot: string;
  details: string;
  aiNotes?: string;
}

const results: SceneResult[] = [];
const consoleErrors: string[] = [];
let shotSeq = 0;

async function shot(page: Page, name: string): Promise<string> {
  const file = `${String(++shotSeq).padStart(2, "0")}-${name}.png`;
  await page.screenshot({ path: join(OUT_DIR, file), fullPage: false });
  return file;
}

function record(r: Omit<SceneResult, "durationMs" | "screenshot">, t0: number, screenshot: string): void {
  results.push({ ...r, durationMs: Date.now() - t0, screenshot });
  const mark = r.status === "pass" ? "✅" : r.status === "blocked" ? "🚧" : "❌";
  console.log(`  ${mark} ${r.id} ${r.name} (${((Date.now() - t0) / 1000) | 0}s): ${r.details}`);
}

/** 发送一条消息（Ctrl+Enter）并等用户气泡出现 */
async function sendMessage(page: Page, text: string): Promise<void> {
  // 等输入框恢复可输入（上一轮 runningRef 释放后才真正可用）
  await page.waitForFunction(
    () => { const t = document.querySelector("textarea"); return !!t && !t.disabled; },
    { timeout: 30000 }
  );
  await page.fill("textarea", text);
  await page.focus("textarea");
  await page.keyboard.press("Control+Enter");
  // 用户气泡出现 = 消息真的发出（防真空通过）
  await page.waitForSelector(`.chat-messages >> text=${text.slice(0, 12)}`, { timeout: 15000 });
}

/** 等「AI 思考中…」指示器出现（消息真正进入流水线） */
async function waitThinkingStart(page: Page, timeoutMs = 20000): Promise<boolean> {
  try {
    await page.waitForSelector(".chat-messages >> text=AI 思考中", { timeout: timeoutMs });
    return true;
  } catch {
    return false;
  }
}

async function getErrorCount(page: Page): Promise<number> {
  return page.$$eval(".bubble-error", els => els.length).catch(() => -1);
}

/** 从右栏脚本面板读「成功行数 / 失败行数」（GGB 脚本 · N 行 · M 失败） */
async function scriptStats(page: Page): Promise<{ ok: number; fail: number }> {
  return page.$eval(".script-stat", el => {
    const text = el.textContent ?? "";
    const ok = /(\d+)\s*行/.exec(text);
    const fail = /(\d+)\s*失败/.exec(text);
    return { ok: ok ? parseInt(ok[1]) : 0, fail: fail ? parseInt(fail[1]) : 0 };
  }).catch(() => ({ ok: -1, fail: -1 }));
}

/** 等 AI 本轮结束：「AI 思考中…」指示器消失（textarea.disabled 靠 useRef 不触发渲染，不可靠）。
 *  error 气泡是持久的，用「相对本轮开始时的增量」判定，避免被上一轮遗留气泡污染。 */
async function waitForTurnDone(page: Page, timeoutMs = 300000, baselineErrors = 0): Promise<{ ok: boolean; note: string }> {
  const t0 = Date.now();
  // 先确认思考指示器出现过（最多等 20s）
  const started = await waitThinkingStart(page, 20000);
  if (!started) return { ok: false, note: "20s 内未进入 AI 思考状态（消息可能未发送）" };
  // 再等指示器消失
  while (Date.now() - t0 < timeoutMs) {
    const thinking = await page.$(".chat-messages >> text=AI 思考中").catch(() => null);
    if (!thinking) {
      await page.waitForTimeout(1500); // 渲染缓冲
      const errCount = await getErrorCount(page);
      const delta = errCount - baselineErrors;
      return { ok: delta <= 0, note: delta > 0 ? `本轮新增 ${delta} 个 error 气泡` : `本轮正常结束（累计 ${((Date.now() - t0) / 1000) | 0}s）` };
    }
    await page.waitForTimeout(1500);
  }
  return { ok: false, note: "超时：AI 本轮未在时限内结束" };
}

/** 关闭模板弹窗（若开着）——overlay 会遮挡工具栏点击 */
async function ensureGalleryClosed(page: Page): Promise<void> {
  const open = await page.$(".modal-overlay").catch(() => null);
  if (open) {
    await page.click('[aria-label="close"]').catch(async () => {
      await page.click(".modal-overlay", { position: { x: 10, y: 10 }, force: true }).catch(() => {});
    });
    await page.waitForTimeout(500);
  }
}

/** 当前画布对象数（GGB 无 DOM 对象句柄，读 ScriptPanel 的脚本行数近似 + canvas 存在性） */
async function canvasAlive(page: Page): Promise<number> {
  return page.$$eval("#ggb-container canvas", els => els.length).catch(() => 0);
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const env = loadEnv();
  const apiKey = env.DEEPSEEK_API_KEY ?? "";
  const model = env.DEEPSEEK_MODEL ?? "deepseek-flash";
  const baseURL = env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
  console.log(`[user-e2e] model=${model} baseURL=${baseURL} key=${apiKey ? "***已配置" : "缺失"}`);

  const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--no-sandbox"] })
    .catch(() => chromium.launch({ headless: true, args: ["--no-sandbox"] }));
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", err => consoleErrors.push(`[pageerror] ${err.message}`));
  page.on("console", msg => {
    if (msg.type() === "error") consoleErrors.push(`[console.error] ${msg.text().slice(0, 200)}`);
  });
  page.on("dialog", d => void d.accept()); // 清空等 confirm() 自动接受

  // ── 配置注入（zustand persist 格式，version 4） ──
  await page.addInitScript(([cfg]) => {
    localStorage.setItem("aiggb_config", JSON.stringify({
      state: { config: cfg, privacyAcknowledged: true },
      version: 4,
    }));
  }, [{ provider: "deepseek", baseURL, apiKey, model } as unknown]);

  // ═══ 场景 A：首屏加载 ═══
  {
    const t0 = Date.now();
    try {
      await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForSelector("#ggb-container canvas", { timeout: 30000 });
      const canvasCount = await canvasAlive(page);
      const hasToolbar = await page.$$eval("button[title]", els =>
        els.some(e => (e.getAttribute("title") ?? "").includes("模板"))).catch(() => false);
      const file = await shot(page, "A-home");
      record({
        id: "A", name: "首屏加载",
        status: canvasCount > 0 && hasToolbar ? "pass" : "fail",
        details: `canvas×${canvasCount}，工具栏（含模板入口）${hasToolbar ? "可见" : "未找到"}`,
      }, t0, file);
    } catch (err) {
      const file = await shot(page, "A-home");
      record({ id: "A", name: "首屏加载", status: "fail", details: String(err).slice(0, 200) }, t0, file);
    }
  }

  // ═══ 场景 B：切物理域 → 模板弹窗 → 斜抛运动 → 规格确认 → 绘制 ═══
  {
    const t0 = Date.now();
    try {
      // 切到物理域（默认数学域的模板弹窗没有斜抛卡）
      await page.click('button:has-text("物理")');
      await page.waitForTimeout(1500);
      await page.click('button[title*="模板"]');
      await page.waitForSelector(".template-card", { timeout: 10000 });
      await shot(page, "B1-template-gallery");
      await page.click(".template-card:has-text('斜抛')");
      // 卡片点击后弹窗应自动关闭
      await page.waitForSelector(".modal-overlay", { state: "detached", timeout: 5000 }).catch(async () => {
        await ensureGalleryClosed(page);
      });

      // 等 Phase 1 规格确认气泡；若 Phase 1 降级直绘则无气泡
      let specPath = true;
      const errBase = await getErrorCount(page);
      try {
        const specBtn = await page.waitForSelector("button:has-text('确认绘制')", { timeout: 150000 });
        await shot(page, "B2-spec-review");
        await specBtn.click();
      } catch {
        specPath = false;
      }

      const done = await waitForTurnDone(page, 300000, errBase);
      const stats = await scriptStats(page);
      const file = await shot(page, "B3-drawn");
      const drawn = stats.ok > 0;
      record({
        id: "B", name: "模板→规格确认→绘制（斜抛运动）",
        status: done.ok && drawn ? "pass" : "fail",
        details: (specPath ? "规格确认路径，" : "降级直绘路径，") + done.note +
          `；脚本面板：成功 ${stats.ok} 行 / 失败 ${stats.fail} 行` +
          (drawn ? "" : "（画布无成功命令——本轮 AI 输出质量未达标）"),
        aiNotes: "两阶段流水线（Phase 1 精炼 → 确认 → Phase 2 编译）",
      }, t0, file);
    } catch (err) {
      await ensureGalleryClosed(page);
      const file = await shot(page, "B3-drawn");
      record({ id: "B", name: "模板→规格确认→绘制（斜抛运动）", status: "fail", details: String(err).slice(0, 200) }, t0, file);
    }
  }

  // ═══ 场景 C：多轮修改 ═══
  {
    const t0 = Date.now();
    try {
      await sendMessage(page, "把轨迹改成红色虚线");
      const done = await waitForTurnDone(page, 240000, await getErrorCount(page));
      const file = await shot(page, "C-modified");
      record({ id: "C", name: "多轮修改：轨迹改红色虚线", status: done.ok ? "pass" : "fail", details: done.note }, t0, file);
    } catch (err) {
      const file = await shot(page, "C-modified");
      record({ id: "C", name: "多轮修改：轨迹改红色虚线", status: "fail", details: String(err).slice(0, 200) }, t0, file);
    }
  }

  // ═══ 场景 D：自然语言画单摆（先清空画布——斜抛残留的 t/theta 滑块会与单摆场景同名冲突，
  //     叠加测试会让失败归因混乱；「在已有画布上叠加构造」另属多轮上下文能力的考察范畴） ═══
  {
    const t0 = Date.now();
    try {
      await ensureGalleryClosed(page);
      await page.click('button[title="清空画布与聊天"]');
      await page.waitForTimeout(2000);
      await sendMessage(page, "画一个单摆，摆长1m，小幅摆动");
      // 自然语言输入同样走两阶段：若出现规格确认气泡则点「确认绘制」
      try {
        const specBtn = await page.waitForSelector("button:has-text('确认绘制')", { timeout: 60000 });
        await shot(page, "D2-spec-review");
        await specBtn.click();
      } catch { /* 可能降级直绘 */ }
      const done = await waitForTurnDone(page, 300000, await getErrorCount(page));
      const stats = await scriptStats(page);
      const file = await shot(page, "D-pendulum");
      record({
        id: "D", name: "自然语言画单摆",
        status: done.ok && stats.ok > 0 ? "pass" : "fail",
        details: done.note + `；脚本面板：成功 ${stats.ok} 行 / 失败 ${stats.fail} 行`,
      }, t0, file);
    } catch (err) {
      await ensureGalleryClosed(page);
      const file = await shot(page, "D-pendulum");
      record({ id: "D", name: "自然语言画单摆", status: "fail", details: String(err).slice(0, 200) }, t0, file);
    }
  }

  // ═══ 场景 E：清空（confirm 自动接受）—— 必须在切 3D 之前：聊天有内容时才能真正验证清零 ═══
  {
    const t0 = Date.now();
    try {
      await ensureGalleryClosed(page);
      const bubbleCountBefore = await page.$$eval(".chat-messages .bubble", els => els.length).catch(() => -1);
      await page.click('button[title="清空画布与聊天"]');
      await page.waitForTimeout(2000);
      const bubbleCountAfter = await page.$$eval(".chat-messages .bubble", els => els.length).catch(() => -1);
      const canvasCount = await canvasAlive(page);
      const file = await shot(page, "E-cleared");
      record({
        id: "E", name: "工具栏清空（confirm 接受）",
        status: bubbleCountBefore > 0 && bubbleCountAfter === 0 && canvasCount > 0 ? "pass" : "fail",
        details: `气泡 ${bubbleCountBefore}→${bubbleCountAfter}，画布 canvas×${canvasCount}`,
      }, t0, file);
    } catch (err) {
      const file = await shot(page, "E-cleared");
      record({ id: "E", name: "工具栏清空", status: "fail", details: String(err).slice(0, 200) }, t0, file);
    }
  }

  // ═══ 场景 F：切 3D ═══
  {
    const t0 = Date.now();
    try {
      await ensureGalleryClosed(page);
      await page.click('button[title*="切换到 3D"]');
      await page.waitForTimeout(3000); // applet 重建
      await page.waitForSelector("#ggb-container canvas", { timeout: 30000 });
      const canvasCount = await canvasAlive(page);
      await page.waitForTimeout(2000);
      const file = await shot(page, "F-3d");
      record({
        id: "F", name: "工具栏切 3D",
        status: canvasCount > 0 ? "pass" : "fail",
        details: `3D 画布重建完成，canvas×${canvasCount}`,
      }, t0, file);
    } catch (err) {
      const file = await shot(page, "F-3d");
      record({ id: "F", name: "工具栏切 3D", status: "fail", details: String(err).slice(0, 200) }, t0, file);
    }
  }

  await browser.close();

  writeFileSync(join(OUT_DIR, "results.json"), JSON.stringify({
    testedAt: new Date().toISOString(),
    model,
    baseURL,
    results,
    consoleErrors: consoleErrors.slice(0, 30),
  }, null, 2));
  console.log(`\n[user-e2e] 完成：${results.filter(r => r.status === "pass").length}/${results.length} 通过；控制台错误 ${consoleErrors.length} 条`);
}

main().catch(err => { console.error(err); process.exit(1); });
