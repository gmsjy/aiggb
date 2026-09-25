/**
 * 改造三 + 改造五 L1 单测
 *   - ggbKB aliases 速查表注入 buildCommandReference
 *   - trajectoryStore.buildTrajectoryRecord 成功/失败判定
 *
 * 运行：node --test --import tsx tests/ggbKB.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildCommandReference, findCommand, findHallucination } from "../src/lib/ggbKB";
import { correctCommand } from "../src/lib/commandCorrect";
import { buildTrajectoryRecord } from "../src/lib/trajectoryStore";
import { TOOL_CATEGORIES, TOOL_SCHEMAS, buildToolCategoryOverview } from "../src/lib/tools";
import type { AgentMessage } from "../src/lib/aiClient";

// ── 改造三：aliases 速查表 ──

test("buildCommandReference 包含中文意图速查表", () => {
  const ref = buildCommandReference("2d", "general");

  assert.ok(ref.includes("中文意图→命令速查"), "应包含速查表标题");
  assert.ok(ref.includes("圆心→Center"), "圆心(取圆心) 应映射到 Center");
  assert.ok(ref.includes("画圆→Circle"), "画圆 应映射到 Circle");
  assert.ok(ref.includes("中垂线→PerpendicularBisector"), "中垂线 应映射到 PerpendicularBisector");
  assert.ok(ref.includes("角平分线→AngleBisector"), "角平分线 应映射到 AngleBisector");
});

test("3D 模式速查表含通用命令（Circle/Center 同时适用）", () => {
  const ref3d = buildCommandReference("3d", "general");
  assert.ok(ref3d.includes("圆心→Center"), "Center 是 2d/3d 通用，3D 模式也应出现");
  assert.ok(ref3d.includes("画圆→Circle"), "Circle 是 2d/3d 通用");
});

// ── 列表函数大小写结论（自托管 bundle 5.4.927 实测，docs/列表函数实测/）──

test("HALLUCINATION_MAP 收录 El→Element / Round→round", () => {
  assert.equal(findHallucination("El")?.correct, "Element", "El 从无此命令，应映射 Element");
  assert.equal(findHallucination("Round")?.correct, "round", "大写 Round 在 5.4.927 不存在，应映射小写函数 round");
});

test("显隐命令家族：SetVisible 臆造映射 + 查询命令无替代 + KB 收录（5.4.927 实测）", () => {
  // SetVisible 不存在（静默 no-op），映射到补视图号的 SetVisibleInView；
  // correct 非单一词 → 只给建议不自动替换（避免 2 参→3 参的参数错位）
  const sv = findHallucination("SetVisible");
  assert.ok(sv?.correct.includes("SetVisibleInView"), "SetVisible 应映射 SetVisibleInView 指引");
  assert.equal(findHallucination("GetVisibleInView")?.correct.includes("get_object_info"), true, "查询命令应指向 get_object_info");
  assert.equal(findHallucination("IsVisibleInView")?.correct.includes("get_object_info"), true, "查询命令应指向 get_object_info");
  assert.ok(findCommand("SetVisibleInView"), "KB 应收录 SetVisibleInView");
  assert.ok(findCommand("SetConditionToShowObject"), "KB 应收录 SetConditionToShowObject");
});

test("correctCommand 自动纠正 El 与大写 Round，小写 round 豁免不受影响", () => {
  const el = correctCommand("E2 = El(L0, 2)");
  assert.ok(el.changed, "El 应被自动替换");
  assert.ok(el.corrected.includes("Element(L0, 2)"), `实际: ${el.corrected}`);

  const rd = correctCommand("R1 = Round(2.5)");
  assert.ok(rd.changed, "大写 Round 应被自动替换");
  assert.ok(rd.corrected.includes("round(2.5)"), `实际: ${rd.corrected}`);

  // 小写 round 是有效函数形态：提取器大小写敏感豁免，不做任何纠正
  const lower = correctCommand('T1 = Text("v=" + (round(2.345, 2)))');
  assert.equal(lower.changed, false, "小写 round 不应被纠正");
  assert.ok(!el.corrected.includes("El("), "纠正后不应残留 El(");
});

test("函数定义形态不参与命令名纠正（回归：f(x)=x^2 曾被误改成 If(x)=x^2）", () => {
  // 整机实测根因：f 与 If 编辑距离 1，模糊纠正把 AI 正确生成的 f(x)=A*sin(kw*x+phi)
  // 改写为 If(x)=…，引擎行为异常、样式命令连环失败、4 轮修复无法收敛
  const fn = correctCommand("f(x) = x^2");
  assert.equal(fn.changed, false, "函数定义不得被纠正");
  assert.ok(fn.corrected.startsWith("f(x)"), `实际: ${fn.corrected}`);
  assert.ok(!fn.corrected.includes("If"), "不得残留 If");

  const fnIf = correctCommand("f(x) = If(x > 0, x^2, 0)");
  assert.equal(fnIf.changed, false, "函数定义内嵌 If 是合法形态，不得改动");

  const g = correctCommand("g(t) = Curve(cos(t), sin(t), t, 0, 6.28)");
  assert.equal(g.changed, false, "g(t) 函数定义同样放行");

  // 赋值形态的命令纠正不受影响（Circl→Circle 编辑距离 1，自动纠正）
  const assign = correctCommand("c1 = Circl(O, r)");
  assert.ok(assign.corrected.includes("Circle"), "赋值形态命令笔误仍应纠正");
});

// ── 改造四：工具分类元数据 ──

test("TOOL_CATEGORIES 覆盖所有已注册工具（防新增工具漏分类）", () => {
  for (const name of Object.keys(TOOL_SCHEMAS)) {
    assert.ok(TOOL_CATEGORIES[name], `工具 ${name} 缺少 category 分类`);
  }
  assert.equal(Object.keys(TOOL_CATEGORIES).length, Object.keys(TOOL_SCHEMAS).length, "无多余分类");
});

test("buildToolCategoryOverview 生成按分类分组的工具速览", () => {
  const overview = buildToolCategoryOverview();
  assert.ok(overview.includes("创建对象"), "应含创建分组");
  assert.ok(overview.includes("create_point"), "创建分组应含 create_point");
  assert.ok(overview.includes("查询画布状态"), "应含查询分组");
  assert.ok(overview.includes("list_objects"), "查询分组应含 list_objects");
});

// ── 改造五：轨迹记录判定 ──

test("buildTrajectoryRecord 正常完成 → success=true", () => {
  const rec = buildTrajectoryRecord("画个圆", {
    finalText: "圆已创建",
    iterations: 5,
    deniedTools: [],
    messages: [{ role: "user", content: "画个圆" }] as AgentMessage[],
  });

  assert.equal(rec.success, true);
  assert.equal(rec.userText, "画个圆");
  assert.equal(rec.iterations, 5);
  assert.equal(rec.messages.length, 1);
});

test("buildTrajectoryRecord 达到最大迭代（30）→ success=false", () => {
  const rec = buildTrajectoryRecord("复杂场景", {
    finalText: "已达到最大迭代次数 (30)",
    iterations: 30,
    deniedTools: [],
    messages: [],
  });

  assert.equal(rec.success, false, "30 轮超限应视为不完整");
});

test("buildTrajectoryRecord 空最终文本 → success=false", () => {
  const rec = buildTrajectoryRecord("失败场景", {
    finalText: "",
    iterations: 3,
    deniedTools: ["eval_raw"],
    messages: [],
  });

  assert.equal(rec.success, false, "无最终文本视为未完成");
  assert.deepEqual(rec.deniedTools, ["eval_raw"]);
});
