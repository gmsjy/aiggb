/**
 * 生成演示 GIF —— 加载 fixture 命令到 GeoGebra，播放动画逐帧截图，ffmpeg 合成 GIF
 *
 * Usage: npx tsx tests/generate-gifs.ts [id1,id2,...]
 *   不带参数: 生成全部 6 个默认演示场景（斜抛/单摆/弹簧/横波/摆线/旋转）
 *   带参数:   只生成指定 fixture（如 projectile,pendulum）
 *
 * 输出: docs/demos/{id}.gif（README 引用路径）
 */
import { chromium } from "playwright";
import { readFileSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, "fixtures");
const VISUAL_HTML = join(__dirname, "visual.html");
const FRAMES_DIR = join(__dirname, "gifs-frames"); // 临时帧目录
const OUT_DIR = join(dirname(__dirname), "docs", "demos"); // docs/demos

// 默认演示场景（fixture id → README 标题）
const DEFAULT_SCENES: Record<string, string> = {
  "P-projectile": "斜抛运动",
  "P-pendulum": "单摆",
  "P-spring": "弹簧振子",
  "P-wave": "横波传播",
  "D-cycloid": "摆线",
  "D-rotation": "旋转变换"
};

// ── GIF 参数 ──
const FRAME_COUNT = 16;      // 帧数
const FRAME_INTERVAL = 120;  // 帧间隔 ms（总时长 ~1.9s）
const GIF_WIDTH = 640;       // 输出宽（等比缩放）
const GIF_FPS = 8;           // 回放帧率

async function generateGif(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  id: string,
  title: string
): Promise<boolean> {
  const fixturePath = join(FIXTURES_DIR, `${id}.json`);
  if (!existsSync(fixturePath)) {
    console.log(`  ⚠ ${id}: fixture 缺失，跳过`);
    return false;
  }

  const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
  const cmdsJson = encodeURIComponent(JSON.stringify(fixture.commands));
  const pageUrl = `file:///${VISUAL_HTML.replace(/\\/g, "/")}?cmds=${cmdsJson}`;

  const frameDir = join(FRAMES_DIR, id);
  mkdirSync(frameDir, { recursive: true });

  console.log(`[${id}] ${title} — 加载 fixture (${fixture.commands.length} 条命令)`);

  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1200 } });
    // ⚠ 不能用 networkidle：file:// 页面加载远程 GGB SDK，网络永不空闲
    //    改用 load，GGB 就绪由下方 waitForFunction(DONE:) 保证
    await page.goto(pageUrl, { waitUntil: "load", timeout: 45000 });

    // 等待 GGB 加载 + 命令执行完成
    await page.waitForFunction(() => document.title.startsWith("DONE:"), { timeout: 30000 });

    // 等动画就位（动画从 t=0 开始推进）
    await page.waitForTimeout(800);

    const ggb = page.locator("#ggb");

    // 逐帧截图
    for (let f = 0; f < FRAME_COUNT; f++) {
      await ggb.screenshot({ path: join(frameDir, `${String(f).padStart(4, "0")}.png`) });
      if (f < FRAME_COUNT - 1) await page.waitForTimeout(FRAME_INTERVAL);
    }

    await page.close();

    // ffmpeg 合成 GIF（palette 优化提升质量）
    const outGif = join(OUT_DIR, `${id}.gif`);
    const palette = join(frameDir, "palette.png");
    const inputPattern = join(frameDir, "%04d.png").replace(/\\/g, "/");

    // Step 1: palettegen
    await execFileAsync("ffmpeg", [
      "-y", "-framerate", String(GIF_FPS), "-i", inputPattern,
      "-vf", `scale=${GIF_WIDTH}:-1:flags=lanczos,palettegen`,
      palette
    ], { windowsHide: true });

    // Step 2: paletteuse → GIF
    await execFileAsync("ffmpeg", [
      "-y", "-framerate", String(GIF_FPS), "-i", inputPattern,
      "-i", palette,
      "-filter_complex", "scale=640:-1:flags=lanczos[x];[x][1:v]paletteuse",
      outGif
    ], { windowsHide: true });

    const sizeKB = Math.round(existsSync(outGif) ? statSync(outGif).size / 1024 : 0);
    console.log(`  ✅ ${id}.gif 生成 (${sizeKB} KB)`);
    return true;
  } catch (err) {
    console.log(`  ❌ ${id}: ${err instanceof Error ? err.message : err}`);
    return false;
  } finally {
    rmSync(frameDir, { recursive: true, force: true }); // 清理临时帧
  }
}

async function main() {
  const arg = process.argv[2];
  let targets: { id: string; title: string }[];

  if (arg) {
    targets = arg.split(",").map(s => s.trim()).filter(Boolean)
      .map(id => ({ id, title: id }));
  } else {
    targets = Object.entries(DEFAULT_SCENES).map(([id, title]) => ({ id, title }));
  }

  console.log(`\n[GIF Generation] ${targets.length} 个演示场景 → ${OUT_DIR}\n`);
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--no-sandbox"]
  }).catch(() => chromium.launch({ headless: true, args: ["--no-sandbox"] }));

  let ok = 0;
  for (const t of targets) {
    if (await generateGif(browser, t.id, t.title)) ok++;
  }

  await browser.close();
  rmSync(FRAMES_DIR, { recursive: true, force: true });

  console.log(`\n${"=".repeat(50)}`);
  console.log(`完成 ${ok}/${targets.length}`);
  console.log(`GIF 目录: ${OUT_DIR}/\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
