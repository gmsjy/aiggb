#!/usr/bin/env node
/**
 * 部署重试脚本 —— GitHub 间歇性断网时自动重试 gh-pages 部署直到成功。
 *
 * 为什么需要：国内直连 github.com 经常间歇性 443 超时（网络抖动），
 * `npm run deploy` 一次失败就中止。本脚本构建一次、推送反复重试，
 * 网络一恢复即自动上线，无需盯着。
 *
 * 用法：
 *   npm run deploy:retry            # 默认：最多 30 次，间隔 20s（约 10 分钟窗口）
 *   DEPLOY_RETRIES=60 DEPLOY_INTERVAL=30 npm run deploy:retry   # 自定义
 *
 * 流程：
 *   1. npm run build（失败即中止）
 *   2. git push origin master（一次，同步代码；失败仅警告，不阻塞 gh-pages）
 *   3. 循环 npx gh-pages -d dist，检测输出含 "Published" 即成功；否则按间隔重试
 */
import { spawnSync } from "node:child_process";

const RETRIES = parseInt(process.env.DEPLOY_RETRIES ?? "30", 10);
const INTERVAL_SEC = parseInt(process.env.DEPLOY_INTERVAL ?? "20", 10);

/** 执行一条 shell 命令，返回 { ok, out }（ok=退出码 0 或匹配 successRe） */
function run(cmd, { capture = false, successRe } = {}) {
  const r = spawnSync(cmd, {
    shell: true,
    stdio: capture ? "pipe" : "inherit",
    encoding: "utf8",
  });
  const out = (r.stdout ?? "") + (r.stderr ?? "");
  const ok = r.status === 0 || (successRe ? successRe.test(out) : false);
  return { ok, out, error: r.error };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** 从命令输出中提取最友好的失败原因（优先 fatal:/ProcessError/error 行，跳过堆栈） */
function extractReason({ out, error }) {
  if (error) return error.message;
  const lines = String(out).split(/\r?\n/);
  const hit = lines.find(l => /fatal:|ProcessError|error:|Could not|Failed to/i.test(l));
  return (hit ?? lines.filter(Boolean).pop() ?? "推送失败").trim();
}

console.log(`[deploy] 部署重试开始：最多 ${RETRIES} 次，间隔 ${INTERVAL_SEC}s`);

// ── 第 1 步：构建 ──
console.log("[deploy] ① 构建（npm run build）…");
if (!run("npm run build").ok) {
  console.error("[deploy] ❌ 构建失败，中止。");
  process.exit(1);
}
console.log("[deploy] ✅ 构建完成。");

// ── 第 2 步：同步 master（可选，失败不阻塞 gh-pages）──
console.log("[deploy] ② 同步 master（git push origin master）…");
const pushMaster = run("git push origin master", { capture: true });
if (pushMaster.ok || /Everything up-to-date|up to date/i.test(pushMaster.out)) {
  console.log("[deploy] ✅ master 已同步。");
} else {
  console.warn(`[deploy] ⚠ master 推送失败（${extractReason(pushMaster)}）。继续尝试 gh-pages 部署…`);
}

// ── 第 3 步：gh-pages 推送（重试直到 Published）──
console.log(`[deploy] ③ 推送 gh-pages（重试循环）…`);
for (let i = 1; i <= RETRIES; i++) {
  console.log(`[deploy]   尝试 ${i}/${RETRIES}…`);
  const r = run("npx gh-pages -d dist", { capture: true, successRe: /Published/i });
  if (r.ok) {
    console.log("[deploy] ✅ Published — 部署成功，已上线。");
    process.exit(0);
  }
  console.log(`[deploy]   ✗ ${extractReason(r)}`);
  if (i < RETRIES) {
    console.log(`[deploy]   网络不可达，${INTERVAL_SEC}s 后重试…`);
    await sleep(INTERVAL_SEC * 1000);
  }
}

console.error(`[deploy] ❌ 重试 ${RETRIES} 次仍失败，请检查网络后重跑。`);
process.exit(1);
