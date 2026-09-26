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

// ── 10. scripting 语句嵌套（Set*/Show* 嵌进 Sequence/Zip 表达式位置）──

test("scripting 语句嵌进 Sequence 被拦截（用户实例：批量显隐）", () => {
  const r = validateGGBCommand(
    "Sequence(SetVisibleInView(Element({a,b,c,d,e,f,f_1,g,g_1,h,h_1,i,i_1,j,j_1,k,l,m,n,p,q,r,s,t},u),1,false),u,1,24)"
  );
  assert.equal(r.ok, false, "Set* 嵌 Sequence 必须被拦截");
  assert.match(r.message, /语句/);
  assert.match(r.message, /逐条|换行/, "应给出批量替代方案");
});

test("scripting 语句嵌 Zip 被拦截；头部语句与表达式命令不受影响", () => {
  assert.equal(validateGGBCommand("Zip(SetVisibleInView(k, 1, false), k, {a, b})").ok, false);
  assert.equal(validateGGBCommand("SetVisibleInView(c, 1, false)").ok, true, "头部语句应放行");
  assert.equal(validateGGBCommand("L1 = Sequence(Circle((u, 5), 0.3), u, 1, 4)").ok, true, "表达式命令应放行");
  assert.equal(validateGGBCommand('T1 = Text("SetColor 不该被误伤")').ok, true, "字符串字面量不触发");
});

// ── 11. 函数名大小写（5.4.927 实测：大写 Sin/Cos 等一律失败）──

test("大写 Sin 函数定义被拦截并提示小写", () => {
  const r = validateGGBCommand("fsin(x) = Sin(x / 2) * 3 + 6");
  assert.equal(r.ok, false, "大写 Sin 必须被拦截");
  assert.match(r.message, /小写/);
  assert.match(r.message, /sin\(/, "应给出小写替换形式");
});

test("表达式/Sequence/Curve 中的大写函数被拦截；Min 列表命令不受影响", () => {
  assert.equal(validateGGBCommand("cur1 = Curve(Cos(t), Sin(t), t, 0, 6.28)").ok, false);
  assert.equal(validateGGBCommand("sA = Sequence((k, Sin(k)), k, 1, 3)").ok, false);
  assert.equal(validateGGBCommand("vA = Sqrt(2)").ok, false);
  assert.equal(validateGGBCommand("fsin(x) = sin(x / 2) * 3 + 6").ok, true, "小写合法");
  assert.equal(validateGGBCommand("Tm1 = Min({1, 2, 3})").ok, true, "Min 列表命令是大写，不得误伤");
  assert.equal(validateGGBCommand('T2 = Text("Sin 不该被误伤")').ok, true, "字符串字面量不触发");
});

test("eval_raw 多行脚本（表达式行 + 语句行混排）合法通过", () => {
  // 换行分隔是 scripting-nest 提示中推荐的合法形态，整串扫描不得误拦
  const r = validateGGBCommand(
    "L1 = Sequence(Circle((u, 1), 0.2), u, 1, 3)\nSetVisibleInView(a, 1, false)"
  );
  assert.equal(r.ok, true, `实际：${r.message}`);
  // 单行内嵌套仍拦截
  assert.equal(validateGGBCommand("Sequence(SetVisibleInView(a, 1, false))").ok, false);
});

// ── 12. 保留对象名（整机实测：If(x)=… 样式无法引用；xAxis=Line(…) 恒失败）──

test("If 作函数名被拦截（内置条件命令冲突）", () => {
  // 整机实测案例：正弦函数模板 Phase 2 生成 If(x)=A*sin(kw*x+phi)，
  // 引擎行为异常、后续 4 轮修复全部失败（style target f 不存在）
  const r = validateGGBCommand("If(x)=A*sin(kw*x+phi)");
  assert.equal(r.ok, false, "If 作函数名必须被拦截");
  assert.match(r.message, /保留名/);
  assert.match(r.message, /条件命令/, "应说明 If 是内置命令");
});

test("xAxis/yAxis 保留名赋值被拦截（画布自带坐标轴，无需创建）", () => {
  // 整机实测案例：满足度评估误报缺坐标轴 → 修复 AI 创建 xAxis=Line(...) 恒 false
  const r1 = validateGGBCommand("xAxis=Line((0,0),(1,0))");
  assert.equal(r1.ok, false, "xAxis 赋值必须被拦截");
  assert.match(r1.message, /坐标轴/);
  const r2 = validateGGBCommand("yAxis = Line((0,0),(0,1))");
  assert.equal(r2.ok, false, "yAxis 赋值必须被拦截");
});

test("e / x / y / z 赋值被拦截；普通名调用命令不受影响", () => {
  assert.equal(validateGGBCommand("e = 2.718").ok, false, "e 是欧拉数，赋值破坏科学计数法字面量");
  assert.equal(validateGGBCommand("x = 5").ok, false, "x 是坐标变量");
  assert.equal(validateGGBCommand("q = 1.6e-19").ok, true, "普通名 q 合法（e 在字面量内部不触发）");
  assert.equal(validateGGBCommand("c1 = Circle(O, r)").ok, true, "调用命令并把结果赋给普通名是正常形态");
  assert.equal(validateGGBCommand("f(x) = sin(x) + 0.001").ok, true, "f/g/h 函数名合法");
  assert.equal(validateGGBCommand("existX = 5").ok, true, "含 e/x 字母的完整名不误伤");
});

// ── ⑩ 赋值形态双等号（2026-09 二轮整机实测：椭圆场景首发命令）──

test("双等号赋值被拦截：ell = x^2/9 + y^2/4 = 1（提示冒号命名形态）", () => {
  // 实测引擎对 "name = 表达式 = 值" 直接报「创建函数/表达式 失败」
  const r = validateGGBCommand("ell = x^2/9 + y^2/4 = 1");
  assert.equal(r.ok, false, "双等号赋值必须在进引擎前拦截");
  assert.ok(r.issues.some(i => i.kind === "double-equals"), JSON.stringify(r.issues));
  assert.match(r.message, /冒号/);
});

test("双等号：合法形态不误伤（裸等式/冒号命名/普通赋值/函数定义/字符串内等号）", () => {
  const cases = [
    "x^2/9 + y^2/4 = 1",               // 裸等式（创建圆锥曲线的官方形态）
    "ell: x^2/9 + y^2/4 = 1",          // 冒号命名
    "a = 3",                            // 滑块赋值
    "f(x) = A*sin(kw*x+phi)",          // 函数定义
    'capt = Text("x = 1", (1, 2))',    // 等号在字符串字面量内
    "SetValue(n, If(a == b, 1, 2))",   // == 与括号内等号
  ];
  for (const cmd of cases) {
    const r = validateGGBCommand(cmd);
    assert.ok(!r.issues.some(i => i.kind === "double-equals"), `${cmd} 不应触发 double-equals → ${r.message}`);
  }
});

test("Conic 参数个数：7 系数被拦截；5 点 / 6 系数合法（6 系数=官方重载，此前 KB 缺失）", () => {
  // 实测：Conic 7 系数引擎返回 true 却产出 emptyset，导致 Agent 30 轮空转
  const bad = validateGGBCommand("ell = Conic(1/9, 0, 1/4, 0, 0, 0, -1)");
  assert.equal(bad.ok, false, "7 参数必须在预检拦截");
  assert.ok(bad.issues.some(i => i.kind === "arg-count"), JSON.stringify(bad.issues));
  const ok6 = validateGGBCommand("ell = Conic(1/9, 1/4, 0, 0, 0, -1)");
  assert.ok(!ok6.issues.some(i => i.kind === "arg-count"), ok6.message);
  const ok5 = validateGGBCommand("c = Conic(A, B, C, D, E)");
  assert.ok(!ok5.issues.some(i => i.kind === "arg-count"), ok5.message);
});
