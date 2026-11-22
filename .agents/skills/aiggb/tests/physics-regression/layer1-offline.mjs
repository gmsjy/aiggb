/**
 * 层①：离线护栏回归 —— aiggb check
 *   A. 误报回归：KB 修正前会误报的合法命令（修正后必须全通过）
 *   B. 拦截力保持：必须仍被拦截的非法命令（KB 修正不能放走它们）
 *   C. 场景全量预检：10 个物理场景的 eval 命令逐批 check
 * 输出：results-layer1.json
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CLI = join(here, "..", "..", "scripts", "aiggb.mjs");

function runCheck(cmds, mode = "2d") {
  try {
    const out = execFileSync(process.execPath, [CLI, "check", "--mode", mode], {
      input: cmds.join("\n"),
      encoding: "utf-8"
    });
    return JSON.parse(out);
  } catch (e) {
    // 退出码 1 = 校验未通过，stdout 仍是 JSON
    return JSON.parse(e.stdout);
  }
}

// ── A. 误报回归（修正前误报 → 现在必须通过）──
const falsePositiveProbes = [
  { cmd: "Zip(a^2, a, {1,2,3})", why: "Zip 单列表 3 参（官方合法，修正前 [5,5] 误报）" },
  { cmd: "Zip(a+b, a, {1,2}, b, {3,4})", why: "Zip 标准双列表 5 参" },
  { cmd: "Slider(0, 10)", why: "Slider 两参形态（官方 min/max 必选，修正前 [3,9] 误报）" },
  { cmd: "StartAnimation(t)", why: "StartAnimation 单滑块形态（修正前 [0,0] 误报）" },
  { cmd: "StartAnimation(false)", why: "StartAnimation 布尔暂停形态" },
  { cmd: "SolveODE(y = x^2)", why: "SolveODE 单参形态（修正前 [5,5] 误报）" },
  { cmd: "IntersectPath(l1, poly1)", why: "IntersectPath 2D 线与多边形形态（修正前标注仅 3D）" }
];

// ── B. 拦截力保持（必须仍失败 / 或被自动纠正）──
const mustFailProbes = [
  { cmd: "Zip(0)", why: "Zip 参数个数不符", mode: "2d", expect: "fail" },
  { cmd: "SetVisible(p, true)", why: "臆造命令（不存在且无法盲替换）", mode: "2d", expect: "fail" },
  { cmd: "El({1,2,3}, 2)", why: "臆造命令 El（应被自动纠正为 Element）", mode: "2d", expect: "autocorrect" },
  { cmd: "xAxis = Line((0,0),(1,0))", why: "保留对象名", mode: "2d", expect: "fail" },
  { cmd: "ell = x^2/9 = 1", why: "双等号", mode: "2d", expect: "fail" },
  { cmd: "Conic(1,2,3,4,5,6,7)", why: "Conic 7 系数空转型陷阱", mode: "2d", expect: "fail" },
  { cmd: "SetViewDirection((1,0,0))", why: "3D 禁令", mode: "3d", expect: "fail" },
  { cmd: "SetFilling(s1, 0.5)", why: "3D 禁令（3D 模式）", mode: "3d", expect: "fail" },
  { cmd: "Sequence(SetVisibleInView(Element({a,b},u),1,false),u,1,2)", why: "scripting 嵌套 Sequence", mode: "2d", expect: "fail" },
  { cmd: "rad = Segment((0,0),(1,1))", why: "rad 单位关键字保留名（静默改名断链）", mode: "2d", expect: "fail" },
  { cmd: "P = (1,2)\nxL = P_x - 0.4", why: "P_x 坐标访问形态（基名已定义、下标名未定义 → 必拒绝）", mode: "2d", expect: "fail" }
];

// ── C. 场景全量 ──
const { scenarios } = JSON.parse(readFileSync(join(here, "scenarios.json"), "utf-8"));

const report = { probes: { falsePositive: [], mustFail: [] }, scenarios: [] };

for (const p of falsePositiveProbes) {
  const r = runCheck([p.cmd]);
  const pass = r.ok && r.results[0].ok;
  report.probes.falsePositive.push({ ...p, pass, detail: r.results[0] });
}
for (const p of mustFailProbes) {
  const r = runCheck([p.cmd], p.mode);
  const first = r.results[0];
  const blocked =
    p.expect === "autocorrect"
      ? Boolean(first.corrected) && first.ok // 自动纠正为合法命令后通过 = 纠正层生效
      : !r.ok;
  report.probes.mustFail.push({ ...p, blocked, corrected: first.corrected, detail: first });
}

for (const sc of scenarios) {
  const evalCmds = sc.cmds.filter(c => c.op === "eval").map(c => c.cmd);
  const r = runCheck(evalCmds);
  report.scenarios.push({
    id: sc.id,
    name: sc.name,
    evalCount: evalCmds.length,
    ok: r.ok,
    issues: r.results.flatMap(x => x.issues.map(i => ({ cmd: x.input, ...i }))),
    warnings: r.results.flatMap(x => x.warnings.map(w => ({ cmd: x.input, warning: w })))
  });
}

const fpPass = report.probes.falsePositive.filter(p => p.pass).length;
const mfBlock = report.probes.mustFail.filter(p => p.blocked).length;
const scOk = report.scenarios.filter(s => s.ok).length;
console.log(`[Layer1] 误报回归: ${fpPass}/${report.probes.falsePositive.length} 通过（期望 7/7）`);
console.log(`[Layer1] 拦截保持: ${mfBlock}/${report.probes.mustFail.length} 拦截（期望 9/9）`);
console.log(`[Layer1] 场景预检: ${scOk}/${report.scenarios.length} 全过`);
for (const s of report.scenarios) {
  if (!s.ok) console.log(`  ✗ ${s.id} ${s.name}: ${s.issues.map(i => i.message).join(" | ")}`);
  for (const w of s.warnings) console.log(`  ⚠ ${s.id} ${w.cmd}: ${w.warning}`);
}
writeFileSync(join(here, "results-layer1.json"), JSON.stringify(report, null, 2));
