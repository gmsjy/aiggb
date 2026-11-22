/**
 * aiggb skill 构建脚本
 *
 * 1. 用 esbuild 把 src/cli.ts 及其依赖（含复制进来的主应用纯 TS 模块 + zod）
 *    打包为自包含的 scripts/aiggb.mjs（单文件、零运行时依赖、node >=18）
 * 2. 调用打包产物的 gen-docs 命令，从 ggbKB 知识库生成 references/ 下的
 *    命令参考文档（2d/3d），保证文档与代码同源
 *
 * 用法：npm install（skill 目录内）后 `node build.mjs`
 * 当前包内已含构建产物，无需重新构建即可使用。
 */

import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [join(here, "src/cli.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  outfile: join(here, "scripts/aiggb.mjs"),
  banner: { js: "#!/usr/bin/env node" },
  // 浏览器驱动运行时动态解析（skill 目录 npm i playwright-core 即可），不打包
  external: ["playwright-core", "playwright"],
  minify: false,
  sourcemap: false,
  logLevel: "info"
});

// 命令参考文档与代码同源生成
execFileSync(process.execPath, [join(here, "scripts/aiggb.mjs"), "gen-docs", join(here, "references")], {
  stdio: "inherit"
});
console.log("[aiggb-skill] build 完成：scripts/aiggb.mjs + references/commands-{2d,3d}.md");
