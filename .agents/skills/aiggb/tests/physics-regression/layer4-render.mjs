/**
 * 层④：出图能力验证 —— aiggb render 批量渲染 10 个物理场景 → PNG
 * 输出：figures/*.png + results-layer4.json
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CLI = join(here, "..", "..", "scripts", "aiggb.mjs");
const { scenarios } = JSON.parse(readFileSync(join(here, "scenarios.json"), "utf-8"));

mkdirSync(join(here, "figures"), { recursive: true });
const results = [];

const jobs = scenarios.map(sc => ({ id: sc.id, name: sc.name, cmds: sc.cmds, source: "reference" }));
for (const id of ["P1", "P4", "P6", "P7", "P10"]) {
  try {
    const json = JSON.parse(readFileSync(join(here, `compiled/${id}.json`), "utf-8"));
    jobs.push({ id: `${id}-AI`, name: `${id} 在线编译产物`, cmds: json.commands, source: "compiled" });
  } catch { /* 无产物跳过 */ }
}

for (const job of jobs) {
  const out = join(here, "figures", `${job.id}.png`);
  const entry = { id: job.id, name: job.name, source: job.source, out };
  try {
    const t0 = Date.now();
    const stdout = execFileSync(process.execPath, [CLI, "render", "--out", out], {
      input: JSON.stringify(job.cmds), // 命令 JSON 经 stdin 传入（readInput 的 stdin 分支）
      encoding: "utf-8",
      timeout: 180000
    });
    const r = JSON.parse(stdout);
    entry.ok = r.ok;
    entry.execOk = r.execOk;
    entry.execTotal = r.execTotal;
    entry.failedIdx = r.failedIdx;
    entry.objects = r.objects;
    entry.exportSource = r.exportSource;
    entry.ms = r.ms;
    entry.pngBytes = statSync(out).size;
  } catch (e) {
    entry.error = ((e.stderr ?? "") + (e.stdout ?? "")).trim().slice(0, 300) || String(e).slice(0, 300);
    try { const r = JSON.parse(e.stdout); Object.assign(entry, { ok: r.ok, execOk: r.execOk, execTotal: r.execTotal, failedIdx: r.failedIdx, objects: r.objects, exportSource: r.exportSource, ms: r.ms }); if (statSync(out, { throwIfNoEntry: false })) entry.pngBytes = statSync(out).size; } catch {}
  }
  console.log(`[Layer4] ${job.id}: ok=${entry.ok ?? "ERR"} exec=${entry.execOk}/${entry.execTotal} objects=${entry.objects} png=${entry.pngBytes ?? "-"}B ${entry.exportSource ?? ""} ${entry.ms ?? ""}ms`);
  results.push(entry);
}

writeFileSync(join(here, "results-layer4.json"), JSON.stringify(results, null, 2));
const okN = results.filter(r => r.ok).length;
console.log(`[Layer4] 出图: ${okN}/${results.length} 成功`);
