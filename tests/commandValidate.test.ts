/**
 * commandValidate L1 单测 —— Sequence（序列）静态语法预检
 *
 * 覆盖用户反馈的真实失败案例：
 *   Sequence(Cube((i,j,k),(i+1,j,k).e(i,j+1,k),i,0,1,0.1)
 *   → 引擎只回「Sequence 执行失败」；预检必须给出「少一个逗号 + 括号未闭合」的具体诊断。
 *
 * 运行：node --test --import tsx tests/commandValidate.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  validateGGBCommand,
  validateSequenceArgs,
  checkBracketBalance,
  splitTopLevelArgs,
} from "../src/lib/commandValidate";
import { executeCommands } from "../src/lib/ggbBridge";
import { MockGGB } from "./mockGGB";
import type { Command } from "../src/lib/schema";

// ── 1. 括号配对 ──

test("括号配对：合法嵌套命令通过", () => {
  const ok = [
    "pts = Sequence((i, i^2), i, 0, 10, 0.5)",
    "arrows=Sequence(Sequence(Vector((i,j),(i+gridStep*Ex(i,j)/Emag(i,j),j+gridStep*Ey(i,j)/Emag(i,j))),i,-4,4,1),j,-3,3,1)",
    "A = (0, 0)",
    "g = Sequence(Sequence(Cube((i,j,0),(i+1,j,0)), i, 0, 2, 1), j, 0, 2, 1)",
    "c = Circle(O, 1)",
    'T = Text("区域 (a,b)", (1,2))',
  ];
  for (const cmd of ok) {
    assert.equal(checkBracketBalance(cmd).ok, true, `应通过：${cmd}`);
  }
});

test("括号配对：未闭合的嵌套 Sequence 被拦截", () => {
  const bad = "cubes = Sequence(Cube((i,j,k),(i+1,j,k),(i,j+1,k), i, 0, 1, 1)";
  const r = checkBracketBalance(bad);
  assert.equal(r.ok, false);
  assert.match(r.detail, /未闭合/);
});

// ── 2. 用户反馈的真实案例 ──

test("截图案例：Sequence 内 Cube 漏逗号 + 括号未闭合 → 报出具体问题", () => {
  const cmd = "Sequence(Cube((i,j,k),(i+1,j,k).e(i,j+1,k),i,0,1,0.1)";
  const r = validateGGBCommand(cmd);
  assert.equal(r.ok, false, "必须被静态校验拦截");
  const kinds = r.issues.map(i => i.kind);
  assert.ok(kinds.includes("unbalanced"), `应报括号不匹配，实际：${JSON.stringify(kinds)}`);
  assert.ok(kinds.includes("stray-dot"), `应报句点误用，实际：${JSON.stringify(kinds)}`);
  // 报错必须可读且给出正确形态
  assert.match(r.message, /括号不匹配/);
  assert.match(r.message, /逗号/);
});

test("正确写法不被误杀", () => {
  const r = validateGGBCommand("cubes = Sequence(Cube((i,j,k),(i+1,j,k),(i,j+1,k)), i, 0, 1, 1)");
  assert.equal(r.ok, true, `不应拦截，实际 issues=${JSON.stringify(r.issues)}`);
});

// ── 3. 循环变量契约 ──

test("循环变量必须是单个字母", () => {
  const multi = validateGGBCommand("s = Sequence((n, n^2), idx, 0, 5, 1)");
  assert.equal(multi.ok, false);
  assert.ok(multi.issues.some(i => i.kind === "sequence-var"));
  assert.match(multi.message, /单个 ASCII 字母/);

  // 第 2 参是数字 → 不可能是表达式形态，不应误报 sequence-var
  const numeric = validateGGBCommand("s = Sequence((i, i^2), 1, 0, 5, 1)");
  assert.ok(!numeric.issues.some(i => i.kind === "sequence-var"));
});

test("循环变量合法时不报错", () => {
  for (const cmd of [
    "s = Sequence((i, i^2), i, 0, 5, 1)",
    "s = Sequence((2, k), k, 1, 5)",
    "s = Sequence(Sphere((cos(i*0.1),sin(i*0.1),i*0.1/3),0.05), i, 0, 59, 1)",
  ]) {
    assert.equal(validateGGBCommand(cmd).ok, true, `应通过：${cmd}`);
  }
});

// ── 4. 参数个数 / 区间压缩 / 官方 5 种重载 ──

test("官方数值列表形态（Sequence(4) / Sequence(7,13) / Sequence(7,13,2)）全部合法", () => {
  for (const cmd of ["ints = Sequence(4)", "ints = Sequence(7, 13)", "ints = Sequence(7, 13, 2)", "ints = Sequence(18, 14)"]) {
    const r = validateGGBCommand(cmd);
    assert.equal(r.ok, true, `应通过：${cmd}，实际 issues=${JSON.stringify(r.issues)}`);
  }
});

test("官方表达式形态 4 参 / 5 参均合法", () => {
  for (const cmd of [
    "s = Sequence((2, k), k, 1, 5)",
    "s = Sequence(x^k, k, 1, 10)",
    "s = Sequence((2, k), k, 1, 3, 0.5)",
    "s = Sequence(x^k, k, 1, 10, 2)",
  ]) {
    const r = validateGGBCommand(cmd);
    assert.equal(r.ok, true, `应通过：${cmd}，实际 issues=${JSON.stringify(r.issues)}`);
  }
});

test("数值形态增量为 0 被拦截", () => {
  const r = validateGGBCommand("ints = Sequence(7, 13, 0)");
  assert.equal(r.ok, false);
  assert.match(r.message, /增量不能为 0/);
});

test("Sequence 表达式形态参数个数不合法被拦截", () => {
  const r = validateGGBCommand("s = Sequence((i, i^2), i, 0)");
  assert.equal(r.ok, false);
  assert.ok(r.issues.some(i => i.kind === "sequence-arity"));
  // 提示必须点明缺的是「终点」而不是把 0 当步长
  assert.match(r.message, /4~5 个参数/);
  assert.match(r.message, /缺少终点参数/);
});

test("循环区间压缩成一个参数被拦截", () => {
  const r = validateGGBCommand('s = Sequence((i, i^2), i, "0,1,0.1")');
  assert.equal(r.ok, false);
  assert.ok(r.issues.some(i => i.kind === "sequence-arity"));
  assert.match(r.message, /三个独立参数/);
});

// ── 5. 表达式尾部残留 ──

test("表达式尾部多打字母（(i,j,k).e）被识别", () => {
  const r = validateGGBCommand("s = Sequence((i,j,k).e(i,j+1,k), i, 0, 2, 1)");
  assert.equal(r.ok, false);
  const kinds = r.issues.map(i => i.kind);
  // 句点误用与尾部残留都能定位这个错误，报出其一即可
  assert.ok(
    kinds.includes("sequence-trailing") || kinds.includes("stray-dot"),
    `应报句点误用或尾部残留，实际：${JSON.stringify(kinds)}`
  );
  assert.match(r.message, /逗号/);
});

test("表达式以运算符结尾被识别", () => {
  const r = validateGGBCommand("s = Sequence((i, i^2+), i, 0, 5, 1)");
  assert.equal(r.ok, false);
  assert.ok(r.issues.some(i => i.kind === "trailing-operator"));
});

// ── 6. eval_sequence 工具参数预检 ──

test("validateSequenceArgs：合法参数通过", () => {
  assert.equal(
    validateSequenceArgs({ name: "pts", expr: "(i, i^2)", var: "i", start: 0, end: 10, step: 0.5 }),
    null
  );
});

test("validateSequenceArgs：多字母变量 / 压缩区间 / 括号不配平被拦截", () => {
  const multi = validateSequenceArgs({ name: "pts", expr: "(i, i^2)", var: "idx", start: 0, end: 10, step: 1 });
  assert.ok(multi && /单个 ASCII 字母/.test(multi));

  const compressed = validateSequenceArgs({ name: "pts", expr: "(i, i^2)", var: "i", start: "0,1", end: 10, step: 1 });
  assert.ok(compressed && /单个数值/.test(compressed));

  const unbalanced = validateSequenceArgs({ name: "pts", expr: "Cube((i,j,k),(i+1,j,k)", var: "i", start: 0, end: 2, step: 1 });
  assert.ok(unbalanced && /括号不匹配/.test(unbalanced));
});

// ── 7. 与执行层集成：预检拦截的命令不进 GGB ──

test("executeCommands：语法错误的 eval 被静态拦截且不进引擎", () => {
  const mock = new MockGGB();
  let calls = 0;
  const orig = mock.evalCommand;
  mock.evalCommand = (cmd: string) => {
    calls++;
    return orig(cmd);
  };

  const cmds: Command[] = [
    { op: "eval", cmd: "bad = Sequence(Cube((i,j,k),(i+1,j,k).e(i,j+1,k),i,0,1,0.1)" } as Command,
  ];
  const results = executeCommands(mock, cmds, "2d");

  assert.equal(results[0].ok, false);
  assert.equal(calls, 0, "静态校验失败的命令不应触达 GGB 引擎");
  assert.match(results[0].error ?? "", /静态校验未通过/);
});

test("executeCommands：合法的 Sequence 正常执行", () => {
  const mock = new MockGGB();
  mock.seed([{ name: "i", type: "Number" }]);
  const cmds: Command[] = [
    { op: "eval", cmd: "pts = Sequence((i, i^2), i, 0, 5, 1)" } as Command,
  ];
  const results = executeCommands(mock, cmds, "2d");
  assert.equal(results[0].ok, true, `实际错误：${results[0].error}`);
});

// ── 8. 切分工具边界 ──

test("splitTopLevelArgs 尊重嵌套", () => {
  assert.deepEqual(splitTopLevelArgs("(i, i^2), i, 0, 10, 0.5"), ["(i, i^2)", "i", "0", "10", "0.5"]);
  assert.deepEqual(splitTopLevelArgs("Sequence(Vector((i,j),(i,j)),i,-4,4,1), j, -3, 3, 1").length, 5);
});

// ── 9. 属性命令专项：值域 / 色名 / 3D 禁令 / 参数个数 ──

test("SetColor 0~255 整数误用被拦截并给出 ÷255 换算", () => {
  const r = validateGGBCommand("SetColor(c, 230, 50, 50)");
  assert.equal(r.ok, false, "0~255 整数必须被拦截（引擎 ×255 钳成白色）");
  assert.match(r.message, /0~1/);
  assert.match(r.message, /0\.902/, "应给出 230→0.902 的换算提示");
});

test("SetColor 0~1 浮点合法通过（不误杀）", () => {
  for (const cmd of ["SetColor(c, 0.9, 0.2, 0.2)", "SetColor(c, 0, 0, 0)", "SetColor(c, 1, 1, 1)", "SetColor(c, 0.5, 0.5, 0.5)"]) {
    const r = validateGGBCommand(cmd);
    assert.equal(r.ok, true, `应通过：${cmd}，实际：${r.message}`);
  }
});

test("SetColor 负值被拦截", () => {
  const r = validateGGBCommand("SetColor(c, -0.1, 0.5, 0.5)");
  assert.equal(r.ok, false);
  assert.match(r.message, /0~1/);
});

test("SetColor 表达式参数不误杀（非字面量交给引擎）", () => {
  const r = validateGGBCommand("SetColor(c, 255*a, 128*b, 0)");
  assert.equal(r.ok, true, `表达式参数应放行，实际：${r.message}`);
});

test("SetColor 中文色名被拦截", () => {
  const r = validateGGBCommand('SetColor(c, "红色")');
  assert.equal(r.ok, false);
  assert.match(r.message, /英文/);
});

test("SetColor 裸标识符色名被拦截（未加引号 → 被当对象引用）", () => {
  const r = validateGGBCommand("SetColor(c, red)");
  assert.equal(r.ok, false);
  assert.match(r.message, /引号|字符串/);
});

test('SetColor 英文色名带引号合法通过', () => {
  const r = validateGGBCommand('SetColor(c, "red")');
  assert.equal(r.ok, true, `实际：${r.message}`);
});

test("SetLineOpacity / SetFilling 超出 0~1 被拦截", () => {
  for (const cmd of ["SetLineOpacity(c, 50)", "SetFilling(p, 30)"]) {
    const r = validateGGBCommand(cmd);
    assert.equal(r.ok, false, `${cmd} 应被拦截`);
    assert.match(r.message, /0~1/);
  }
  for (const cmd of ["SetLineOpacity(c, 0.5)", "SetFilling(p, 0.3)"]) {
    const r = validateGGBCommand(cmd);
    assert.equal(r.ok, true, `${cmd} 应通过，实际：${r.message}`);
  }
});

test("3D 模式：SetFilling 被拦截并提示 style opacity 替代", () => {
  const r = validateGGBCommand("SetFilling(cube, 0.3)", "3d");
  assert.equal(r.ok, false, "3D 下 SetFilling 必须被拦截");
  assert.match(r.message, /3D/);
  assert.match(r.message, /style|opacity/, "应给出替代方案");
});

test("3D 模式：禁用清单（SetPointSize/SetCaption/ShowLabel/ZoomIn/SetViewDirection）全被拦截", () => {
  for (const cmd of [
    "SetPointSize(P, 5)",
    'SetCaption(A, "小球")',
    "ShowLabel(A, true)",
    "ZoomIn(2)",
    "SetViewDirection(Vector((1,0,0)))",
  ]) {
    const r = validateGGBCommand(cmd, "3d");
    assert.equal(r.ok, false, `${cmd} 在 3D 下应被拦截，实际：${r.message}`);
    assert.match(r.message, /3D/);
  }
});

test("2D 模式：同一批命令合法通过（不误杀）", () => {
  for (const cmd of [
    "SetPointSize(P, 5)",
    'SetCaption(A, "小球")',
    "ShowLabel(A, true)",
    "ZoomIn(2)",
    "SetFilling(p, 0.3)",
  ]) {
    const r = validateGGBCommand(cmd, "2d");
    assert.equal(r.ok, true, `${cmd} 在 2D 下应通过，实际：${r.message}`);
  }
});

test("mode 缺省时不触发 3D 禁令（向后兼容）", () => {
  const r = validateGGBCommand("SetFilling(p, 0.3)");
  assert.equal(r.ok, true, `实际：${r.message}`);
});

test("3D 模式：SetColor（2d+3d 双模式命令）不被禁令误杀", () => {
  const r = validateGGBCommand("SetColor(ball, 0.9, 0.2, 0.2)", "3d");
  assert.equal(r.ok, true, `实际：${r.message}`);
});

test("SetColor 2 参形态收到数字被拦截（提示 4 参 RGB 形态）", () => {
  const r = validateGGBCommand("SetColor(c, 0.9)");
  assert.equal(r.ok, false);
  assert.match(r.message, /4 个参数/);
});

test("属性命令参数个数：SetLineStyle 缺参被拦截（回退 ggbKB paramCount）", () => {
  const r = validateGGBCommand("SetLineStyle(c)");
  assert.equal(r.ok, false);
  assert.match(r.message, /参数/);
});

test("SetAnimating（KB 补录条目）参数合法通过", () => {
  const r = validateGGBCommand("SetAnimating(t, false)");
  assert.equal(r.ok, true, `实际：${r.message}`);
});
