/**
 * ggbBridge L1 单测 —— 命令排序 + 分层重试（方案 A + C）
 *
 * 核心验证：
 *   1. orderCommands：跨 op 静态优先级（constants→slider→eval→vector→animate→style）
 *   2. 分层重试：eval 内部乱序（Segment 在 A/B 定义之前）→ 第一轮失败、第二轮成功
 *   3. 返回结果对齐原始数组顺序（constructionLog 重放依赖）
 *   4. 非幂等 op（delete/reset）失败不进重试
 *
 * 运行：node --test --import tsx tests/ggbBridge.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { executeCommands, orderCommands, collectFailures } from "../src/lib/ggbBridge";
import { MockGGB } from "./mockGGB";
import type { Command } from "../src/lib/schema";

/** 构造 eval 命令 */
function ev(cmd: string): Command {
  return { op: "eval", cmd } as Command;
}

/** 构造 slider 命令 */
function sl(name: string): Command {
  return { op: "slider", name, min: 0, max: 1, step: 0.1, value: 0.5 } as Command;
}

/** 构造 animate 命令 */
function anim(target: string): Command {
  return { op: "animate", target, on: true } as Command;
}

// ── 1. orderCommands 静态排序 ──

test("orderCommands 按 op 依赖优先级重排", () => {
  // 原始顺序故意乱序：animate → eval(Segment) → slider → eval(A) → eval(B)
  const commands: Command[] = [
    anim("t"),
    ev("AB = Segment(A, B)"),
    sl("t"),
    ev("A = (0, 0)"),
    ev("B = (1, 1)"),
  ];

  const ordered = orderCommands(commands);

  // 优先级：slider(1) < eval(2) < animate(4)
  const ops = ordered.map(o => o.cmd.op);
  assert.equal(ops[0], "slider", "slider 应先于 eval");
  assert.equal(ops[1], "eval", "eval 应在 slider 之后");
  assert.equal(ops[ops.length - 1], "animate", "animate 应最后");

  // idx 保留原始下标，允许调用方映射回原始顺序
  const idxOf = (op: string) => ordered.find(o => o.cmd.op === op)!.idx;
  assert.equal(idxOf("animate"), 0, "animate 原始下标是 0");
  assert.equal(idxOf("eval"), 1, "Segment 原始下标是 1");
  assert.equal(idxOf("slider"), 2, "slider 原始下标是 2");
});

test("orderCommands 稳定保留同优先级相对顺序", () => {
  const commands: Command[] = [
    ev("A = (0, 0)"),
    ev("B = (1, 1)"),
  ];
  const ordered = orderCommands(commands);
  // eval 同级，应保留原始顺序 A 在前
  assert.equal(ordered[0].cmd.cmd, "A = (0, 0)");
  assert.equal(ordered[1].cmd.cmd, "B = (1, 1)");
});

// ── 2. 分层重试：eval 内部乱序 ──

test("executeCommands 分层重试：Segment 引用未定义点 → 第二轮成功", () => {
  const mock = new MockGGB();
  // 乱序：Segment(A,B) 在 A/B 定义之前
  const commands: Command[] = [
    ev("AB = Segment(A, B)"),
    ev("A = (0, 0)"),
    ev("B = (1, 1)"),
  ];

  const results = executeCommands(mock, commands, "2d");

  // 三条全部成功（Segment 第二轮重试成功）
  assert.deepEqual(
    results.map(r => r.ok),
    [true, true, true],
    `应有 3 条成功，实际: ${JSON.stringify(results.map(r => ({ ok: r.ok, err: r.error })))}`
  );

  // 结果对齐原始顺序：index 0 = Segment, 1 = A, 2 = B
  assert.equal(results[0].command.cmd, "AB = Segment(A, B)");
  assert.equal(results[1].command.cmd, "A = (0, 0)");
  assert.equal(results[2].command.cmd, "B = (1, 1)");
});

test("executeCommands 跨 op 乱序：animate 引用未定义滑块 → 排序后成功", () => {
  const mock = new MockGGB();
  const commands: Command[] = [
    anim("t"),            // 引用 t，但 t 滑块在后面
    ev("t = Slider(0, 1, 0.1)"),
  ];

  const results = executeCommands(mock, commands, "2d");

  // 静态排序已把 slider 移到 eval 前，animate 引用 t 时 t 已存在
  assert.deepEqual(
    results.map(r => r.ok),
    [true, true]
  );
});

// ── 3. 非幂等 op 不进重试 ──

test("executeCommands delete 目标不存在 → 失败且被预检拦截（不调用 deleteObject）", () => {
  const mock = new MockGGB();
  mock.seed([{ name: "A", type: "Point" }]);

  // 统计 deleteObject 调用次数：非幂等 op 失败不进重试 → 只对存在的 A 调一次
  let deleteCalls = 0;
  const origDelete = mock.deleteObject;
  mock.deleteObject = (label: string) => {
    deleteCalls++;
    origDelete(label);
  };

  const commands: Command[] = [
    { op: "delete", target: "A" } as Command,
    { op: "delete", target: "不存在对象XYZ" } as Command,
  ];

  const results = executeCommands(mock, commands, "2d");

  assert.equal(results[0].ok, true, "删除存在的对象应成功");
  assert.equal(results[1].ok, false, "删除不存在的对象应失败");
  // exists 预检挡住 → deleteObject 只对存在的 A 调用 1 次（不存在对象/重试都被拦截）
  assert.equal(deleteCalls, 1, "deleteObject 只调用 1 次");
});

// ── 4. 空数组边界 ──

test("executeCommands 空命令数组 → 返回空结果", () => {
  const mock = new MockGGB();
  const results = executeCommands(mock, [], "2d");
  assert.deepEqual(results, []);
});

// ── 5. style op 失败可见化（exists 预检 / dashed:false / opacity 双失败） ──

/** 仅实现 style op 所需 API 的最小 stub，可注入目标存在性与 Set* 命令失败 */
function styleStubApi(opts: { exists: boolean; failSetOpacity?: boolean }) {
  const calls: string[] = [];
  const api = {
    setRepaintingActive: () => {},
    exists: (name: string) => opts.exists,
    setColor: () => {},
    setLineThickness: () => {},
    setVisible: () => {},
    setLineStyle: (name: string, style: number) => calls.push(`setLineStyle:${name}:${style}`),
    setPointSize: () => {},
    setPointStyle: () => {},
    evalCommand: (cmd: string) => {
      calls.push(cmd);
      return !(opts.failSetOpacity && /^Set(LineOpacity|Filling)\s*\(/i.test(cmd));
    },
  } as unknown as Parameters<typeof executeCommands>[0];
  return { api, calls };
}

test("style op 目标不存在 → ok:false（不再静默 no-op）", () => {
  const { api } = styleStubApi({ exists: false });
  const results = executeCommands(api, [
    { op: "style", target: "幽灵对象", color: "#ff0000" } as Command,
  ], "2d");
  assert.equal(results[0].ok, false, "style 目标不存在必须报失败");
  assert.match(results[0].error ?? "", /不存在/);
});

test("style op dashed:false → setLineStyle(target, 0) 恢复实线", () => {
  const { api, calls } = styleStubApi({ exists: true });
  const results = executeCommands(api, [
    { op: "style", target: "c", dashed: false } as Command,
  ], "2d");
  assert.equal(results[0].ok, true);
  assert.ok(calls.includes("setLineStyle:c:0"), `应落地实线，实际调用：${calls.join("; ")}`);
});

test("style op opacity 两路都失败 → ok:false 并给放弃提示", () => {
  const { api, calls } = styleStubApi({ exists: true, failSetOpacity: true });
  const results = executeCommands(api, [
    { op: "style", target: "cube", opacity: 0.3 } as Command,
  ], "3d");
  assert.equal(results[0].ok, false, "SetLineOpacity 与 SetFilling 均失败时必须报失败");
  assert.match(results[0].error ?? "", /透明度/);
  // 两路命令都实际下发过
  assert.ok(calls.some(c => c.startsWith("SetLineOpacity")), "应先尝试 SetLineOpacity");
  assert.ok(calls.some(c => c.startsWith("SetFilling")), "失败后应回退 SetFilling");
});

test("style op 目标存在且常规设置 → ok:true", () => {
  const { api } = styleStubApi({ exists: true });
  const results = executeCommands(api, [
    { op: "style", target: "c", color: "#2196f3", thickness: 3, dashed: true } as Command,
  ], "2d");
  assert.equal(results[0].ok, true, `实际错误：${results[0].error}`);
});

// ── 6. scripting 命令「假 false」豁免（GGB evalCommand 对 Set* 成功也返回 false） ──

test("eval 路径 Set* scripting 命令：引擎返回 false 仍判 ok（GGB 特性豁免）", () => {
  const mock = new MockGGB();
  const origEval = mock.evalCommand.bind(mock);
  mock.evalCommand = (cmd: string) => (/^SetPointSize/i.test(cmd) ? false : origEval(cmd));
  const results = executeCommands(mock, [
    { op: "eval", cmd: "SetPointSize(c, 5)" } as Command,
  ], "2d");
  assert.equal(results[0].ok, true, "SetPointSize 实际已生效（scripting 命令恒返回 false），不应判失败");
  assert.equal(collectFailures(results).length, 0, "不应触发无谓的修复回路/分层重试");
});

test("eval 路径 Delete：不存在对象报具体诊断；存在对象删除成功（exists 前后对比）", () => {
  const mock = new MockGGB();
  mock.seed([{ name: "P", type: "Point" }]);
  const results = executeCommands(mock, [
    { op: "eval", cmd: "Delete(幽灵)" } as Command,
    { op: "eval", cmd: "Delete(P)" } as Command,
  ], "2d");
  assert.equal(results[0].ok, false, "删除不存在对象必须报失败（不再被 scripting 豁免吞掉）");
  assert.match(results[0].error ?? "", /不存在/);
  assert.equal(results[1].ok, true, "删除存在的对象应成功");
  assert.equal(mock.exists("P"), false, "mock 应真实移除对象（exists 前后对比的前提）");
});

test("非 scripting 命令引擎返回 false → 仍如实判失败", () => {
  const mock = new MockGGB();
  const origEval = mock.evalCommand.bind(mock);
  mock.evalCommand = (cmd: string) => (/^Segment/i.test(cmd) ? false : origEval(cmd));
  const results = executeCommands(mock, [
    { op: "eval", cmd: "AB = Segment(A, B)" } as Command,
  ], "2d");
  assert.equal(results[0].ok, false);
});

test("style op opacity：SetLineOpacity 生效（getXML 实读验证）→ 不回退 SetFilling", () => {
  const calls: string[] = [];
  const api = {
    setRepaintingActive: () => {},
    exists: () => true,
    // 模拟 GGB 特性：scripting 命令（含 SetLineOpacity）执行生效但恒返回 false
    evalCommand: (cmd: string) => { calls.push(cmd); return false; },
    setLineStyle: () => {},
    getXML: () => (calls.some(c => c.startsWith("SetLineOpacity")) ? '<element lineOpacity="50"/>' : ""),
  } as unknown as Parameters<typeof executeCommands>[0];
  const results = executeCommands(api, [
    { op: "style", target: "c", opacity: 0.5 } as Command,
  ], "2d");
  assert.equal(results[0].ok, true, `实际错误：${results[0].error}`);
  assert.ok(!calls.some(c => c.startsWith("SetFilling")), "线透明度已生效，不得回退 SetFilling（否则 2D 对象被无谓填充——历史灰盘 bug 根因）");
});

test("style op 自带诊断不被 diagnose 泛化文案覆盖（保留行为）", () => {
  const { api } = styleStubApi({ exists: false });
  const styleResults = executeCommands(api, [
    { op: "style", target: "幽灵", color: "#ff0000" } as Command,
  ], "2d");
  const styleFailures = collectFailures(styleResults);
  assert.match(styleFailures[0].error, /不存在，无法设置样式/);
});
