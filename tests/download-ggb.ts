/**
 * 下载 GeoGebra 库到本地 —— 版本化自托管打包脚本
 *
 * 原理：deployggb.js 内嵌 codebase 版本号（如 5.4.920.0），用它构造
 * `./ggb/apps/{version}/web3d/...` 的加载路径。本脚本：
 *   1. 下载 deployggb.js，解析其内嵌版本号
 *   2. 下载该版本配套的 web3d 主引擎（从 web3d.nocache.js 解析 hash）
 *   3. 探测并下载全部 deferred fragment（GWT 运行时按需加载）
 *   4. 下载 css / properties / fonts / icons
 *   5. 替换 deployggb.js 的 CDN 前缀为相对路径（./ggb/...）
 *
 * Usage: npx tsx tests/download-ggb.ts
 * 输出: public/ggb/apps/...（随 vite 构建打包，完全离线）
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, statSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(dirname(__dirname), "public", "ggb");
const APPS = "https://www.geogebra.org/apps/";

const curl = (url: string, dest?: string): string => {
  const args = ["-s", "--max-time", "60"];
  if (dest) { args.push("-o", dest); }
  else { args.push("--silent"); }
  args.push(url);
  return execFileSync("curl", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
};
const httpOk = (url: string): boolean => {
  try {
    const head = execFileSync("curl", ["-sI", "--max-time", "8", url], { encoding: "utf8", stdio: ["ignore","pipe","ignore"] });
    return /^HTTP\/\S+ 200/m.test(head);
  } catch { return false; }
};
const save = (rel: string, body: string | Buffer) => {
  const dest = join(OUT, "apps", rel);
  mkdirSync(join(OUT, "apps", dirname(rel)), { recursive: true });
  writeFileSync(dest, body);
  console.log(`  ✓ ${rel} (${(body.length / 1024).toFixed(0)}KB)`);
};

async function main() {
  console.log(`[Download GGB] 输出: ${OUT}\n`);

  // 1. deployggb.js + 解析版本
  const deployggb = curl(APPS + "deployggb.js");
  save("deployggb.js", deployggb);
  const verMatch = deployggb.match(/5\.\d+\.\d+\.\d+/);
  const version = verMatch ? verMatch[0] : "5.4.920.0";
  console.log(`  deployggb.js 内嵌版本: ${version}\n`);
  const BASE = `${APPS}${version}/`;
  const vOut = join(OUT, "apps", version);

  // 2. web3d 主引擎（从 nocache 解析 hash）
  const ncRel = "web3d/web3d.nocache.js";
  const ncPath = join(vOut, ncRel);
  mkdirSync(join(vOut, "web3d"), { recursive: true });
  execFileSync("curl", ["-s", "--max-time", "60", BASE + ncRel, "-o", ncPath]);
  const nc = readFileSync(ncPath, "utf8");
  const hashM = nc.match(/([0-9A-F]{32})\.cache\.js/);
  const hash = hashM ? hashM[1] : "";
  console.log(`  主引擎 hash: ${hash || "(未解析)"}`);
  if (hash) {
    save(`${version}/web3d/${hash}.cache.js`, curl(`${BASE}web3d/${hash}.cache.js`));
  }

  // 3. css / properties / fonts / icons
  const staticFiles = [
    "css/bundles/simple-bundle.css", "css/bundles/bundle.css",
    "css/keyboard-styles.css", "css/greek-font.css", "css/fonts.css",
    "web3d/js/properties_keys_zh-CN.js", "web3d/fonts/base/jlm_cmmi10.js"
  ];
  for (const f of staticFiles) save(`${version}/${f}`, curl(`${BASE}${f}`));

  // 4. 全部 deferred fragment（探测 n=0..24）
  if (hash) {
    let n = 0, found = 0;
    for (; n <= 24; n++) {
      const rel = `${version}/web3d/deferredjs/${hash}/${n}.cache.js`;
      if (httpOk(`${BASE}web3d/deferredjs/${hash}/${n}.cache.js`)) {
        const body = curl(`${BASE}web3d/deferredjs/${hash}/${n}.cache.js`);
        if (body.length > 100) { save(rel, body); found++; }
      }
    }
    console.log(`  deferred fragment: ${found} 个`);
  }

  // 5. images 图标 + 替换 deployggb CDN 前缀
  for (const icon of ["images/worksheet/icon-start-applet.png", "images/worksheet/icon-start-applet-hover.png"]) {
    save(icon, curl(`https://www.geogebra.org/${icon}`));
  }
  const dpPath = join(OUT, "apps", "deployggb.js");
  let s = readFileSync(dpPath, "utf8");
  s = s.split("https://www.geogebra.org/apps/").join("./ggb/apps/");
  s = s.split("https://www.geogebra.org/images/").join("./ggb/images/");
  writeFileSync(dpPath, s, "utf8");
  console.log("\n  deployggb.js CDN 前缀已替换为相对路径");

  // 6. 清理错配版本目录（保留 deployggb.js + 当前 version）
  const appsDir = join(OUT, "apps");
  if (existsSync(appsDir)) {
    const { readdirSync, rmSync } = await import("node:fs");
    for (const entry of readdirSync(appsDir)) {
      const full = join(appsDir, entry);
      if (entry === "deployggb.js") continue;
      if (entry === version) continue;
      if (existsSync(full)) rmSync(full, { recursive: true, force: true });
      console.log(`  清理错配版本: ${entry}`);
    }
  }

  const { execFileSync: du } = await import("node:child_process");
  const total = execFileSync("du", ["-sh", OUT], { encoding: "utf8" }).trim().split("\t")[0];
  console.log(`\n完成！本地 GGB 库大小: ${total}`);
}

main().catch(e => { console.error(e); process.exit(1); });
