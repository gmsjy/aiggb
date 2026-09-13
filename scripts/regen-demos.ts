/**
 * README 效果图重生成 —— fixture 场景 → dev server 画布动画 → GIF
 *
 * Usage: npx tsx scripts/regen-demos.ts [id1,id2,...]
 *   不带参数: 重生成全部（P- 物理 / X- 复合 / D- 数学动态 / H- 3D）
 *   带参数:   只重生成指定 id（如 P-projectile）
 *
 * 前置: npm run dev 已在 5173 端口运行（提供 /GeoGebra 本地 bundle）。
 * 宿主: tests/visual.html（唯一 op 执行宿主，与视觉回归共用；3D 场景 ?app=3d）。
 * 流程: 每个场景加载 fixture 命令 → 等动画跑起来 → 连续抓 ~8s 帧 →
 *       ffmpeg 两段式调色板合成 640x448 GIF → 覆盖 docs/demos/<id>.gif
 */
import { chromium } from "playwright";
import { readFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FIXTURES_DIR = join(ROOT, "tests", "fixtures");
const FRAMES_DIR = join(ROOT, "scripts", ".demos-frames");
const OUT_DIR = join(ROOT, "docs", "demos");
const BASE_URL = "http://localhost:5173";

/** README 效果图清单（id → docs/demos/<id>.gif） */
const ALL_IDS = [
  "P-projectile", "P-pendulum", "P-spring", "P-wave", "P-incline",
  "X-field-particle",
  "D-cycloid", "D-rotation",
  "H-pyramid", "H-cylinder-net",
];
const TARGETS = process.argv[2] ? process.argv[2].split(",").map(s => s.trim()) : ALL_IDS;

/** 3D 场景：用 appName "3d" 注入（与生产应用 GGBCanvas 的 3D 模式一致） */
const APP_3D = new Set(["H-pyramid", "H-cylinder-net"]);

/**
 * 演示附加命令：fixture 本身无动画的静态场景补动画
 * （均使用项目自身的真实 op/命令，仅影响效果图观感，不改 fixture）
 */
const EXTRA_COMMANDS: Record<string, unknown[]> = {
  // 棱锥高 h 振荡 —— 滑块驱动几何体动态变化
  "H-pyramid": [{ op: "animate", target: "h", on: true, repeat: "oscillating", speed: 0.6 }],
  // 内接棱柱边数 n 往返扫描 —— 多边形逼近圆柱
  "H-cylinder-net": [{ op: "animate", target: "n", on: true, repeat: "oscillating", speed: 0.4 }],
};

/** 每个场景抓帧时长（ms）。振荡动画 8s 足够覆盖 1~2 个完整周期 */
const CAPTURE_MS = 8000;
/** 抓帧间隔（ms），约 8fps */
const FRAME_INTERVAL_MS = 125;
/** GIF 输出宽度（旧效果图 640x448） */
const GIF_WIDTH = 640;
/** GIF 帧率（与抓帧间隔一致的整数帧率，保证时长不失真） */
const GIF_FPS = 8;

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  if (existsSync(FRAMES_DIR)) rmSync(FRAMES_DIR, { recursive: true, force: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--no-sandbox"],
  }).catch(() => chromium.launch({ headless: true, args: ["--no-sandbox"] }));

  const failures: string[] = [];

  for (const id of TARGETS) {
    const fixturePath = join(FIXTURES_DIR, `${id}.json`);
    if (!existsSync(fixturePath)) {
      console.log(`  ⚠ ${id}: fixture 缺失，跳过`);
      failures.push(id);
      continue;
    }
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    const commands = [...fixture.commands, ...(EXTRA_COMMANDS[id] ?? [])];
    const cmdsJson = encodeURIComponent(JSON.stringify(commands));
    const appParam = APP_3D.has(id) ? "&app=3d" : "";
    const frameDir = join(FRAMES_DIR, id);
    mkdirSync(frameDir, { recursive: true });

    console.log(`[${id}] 加载场景…`);
    const page = await browser.newPage();
    try {
      await page.setViewportSize({ width: 1000, height: 700 });
      await page.goto(`${BASE_URL}/tests/visual.html?cmds=${cmdsJson}${appParam}`, {
        waitUntil: "networkidle",
        timeout: 45000,
      });
      await page.waitForFunction(() => document.title.startsWith("DONE:"), { timeout: 30000 });
      const title = await page.title();
      const m = /DONE:(\d+)\/(\d+) fail:([\d,]*)/.exec(title);
      const ok = m ? parseInt(m[1]) : 0;
      const total = m ? parseInt(m[2]) : 0;
      if (m && m[3]) console.log(`  ⚠ 失败命令索引: ${m[3]}`);
      console.log(`  命令执行 ${ok}/${total}`);

      // 等 GGB 完成首轮渲染 + 动画起跑
      await page.waitForTimeout(2000);

      // 连续抓帧（固定视口 = 1000x700 即画布区域）
      const deadline = Date.now() + CAPTURE_MS;
      let frame = 0;
      while (Date.now() < deadline) {
        const t0 = Date.now();
        await page.screenshot({
          path: join(frameDir, `f_${String(++frame).padStart(3, "0")}.png`),
          clip: { x: 0, y: 0, width: 1000, height: 700 },
          type: "png",
        });
        const spent = Date.now() - t0;
        if (spent < FRAME_INTERVAL_MS) await page.waitForTimeout(FRAME_INTERVAL_MS - spent);
      }
      console.log(`  抓帧 ${frame} 张`);

      // ffmpeg 两段式调色板合成 GIF（局部调色板对彩色线条更友好）
      const outPath = join(OUT_DIR, `${id}.gif`);
      const palette = join(frameDir, "palette.png");
      execFileSync("ffmpeg", [
        "-y", "-loglevel", "error",
        "-framerate", String(GIF_FPS),
        "-i", join(frameDir, "f_%03d.png"),
        "-vf", `scale=${GIF_WIDTH}:-1:flags=lanczos,palettegen=stats_mode=diff`,
        palette,
      ]);
      execFileSync("ffmpeg", [
        "-y", "-loglevel", "error",
        "-framerate", String(GIF_FPS),
        "-i", join(frameDir, "f_%03d.png"),
        "-i", palette,
        "-lavfi", `scale=${GIF_WIDTH}:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=3`,
        "-loop", "0",
        outPath,
      ]);
      const sizeKB = Math.round(readFileSync(outPath).length / 1024);
      console.log(`  ✅ ${outPath} (${sizeKB}KB)`);
    } catch (err) {
      console.log(`  ❌ ${id}: ${err instanceof Error ? err.message : String(err)}`);
      failures.push(id);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  if (existsSync(FRAMES_DIR)) rmSync(FRAMES_DIR, { recursive: true, force: true });

  const okIds = TARGETS.filter(id => !failures.includes(id));
  console.log(`\n完成：重生成 ${okIds.length}/${TARGETS.length} 个 → docs/demos/{${okIds.join(", ")}}` +
    (failures.length ? `；失败: ${failures.join(",")}` : ""));
  if (failures.length) process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
