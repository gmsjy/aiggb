/**
 * trajectory-replay L1 单测 —— 失败轨迹回放器
 *   npm run test:unit（已注册）
 *
 * 验证 replayTrajectory 的提取/对比逻辑：
 *   - 原始成功 + 现在成功 → stillOk（无退化）
 *   - 原始失败 + 现在仍失败 → stillFailed
 *   - 原始失败 + 现在成功 → repaired（执行层改进证据）
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { replayTrajectory, replayAll } from "./trajectory-replay";
import type { TrajectoryRecord } from "../src/lib/trajectoryStore";

function toolCallMsg(id: string, name: string, args: Record<string, unknown>) {
  return { id, type: "function" as const, function: { name, arguments: JSON.stringify(args) } };
}

function toolResp(id: string, success: boolean, error?: string) {
  return { role: "tool" as const, tool_call_id: id, content: JSON.stringify({ success, ...(error ? { error } : {}) }) };
}

/** 构造一条失败轨迹：tc1 原始成功、tc2 原始失败、tc3 原始失败但当前执行层能成功 */
function makeRec(): TrajectoryRecord {
  return {
    id: "t1",
    ts: 1,
    userText: "画圆",
    finalText: "部分失败",
    iterations: 3,
    success: false,
    deniedTools: [],
    messages: [
      { role: "user", content: "画圆" },
      // tc1: 原始成功（O 点）
      { role: "assistant", content: null, tool_calls: [toolCallMsg("tc1", "create_point", { name: "O", x: 0, y: 0 })] },
      toolResp("tc1", true),
      // tc2: 原始失败（引用未定义 X）→ 现在也应失败
      { role: "assistant", content: null, tool_calls: [toolCallMsg("tc2", "create_point", { name: "A", x: "MissingX", y: "MissingY" })] },
      toolResp("tc2", false, "创建点 A 失败"),
      // tc3: 原始失败（当时真实 GGB 崩）→ 现在 MockGGB 能成功
      { role: "assistant", content: null, tool_calls: [toolCallMsg("tc3", "create_point", { name: "P", x: 0, y: 0 })] },
      toolResp("tc3", false, "GGB 执行超时"),
    ],
  };
}

test("replayTrajectory 正确分类：stillOk / stillFailed / repaired", () => {
  const sum = replayTrajectory(makeRec());

  // tc1: 原始成功 → 现在成功
  assert.equal(sum.stillOk, 1, "tc1 应是无退化");
  // tc2: 原始失败 → 现在失败
  assert.equal(sum.stillFailed, 1, "tc2 应仍失败");
  // tc3: 原始失败 → 现在成功
  assert.equal(sum.repaired, 1, "tc3 应被修复");
  assert.equal(sum.regressed, 0, "不应有退化");
  assert.equal(sum.outcomes.length, 3);
});

test("replayAll 汇总多条轨迹", () => {
  const { totalRepaired, totalStillFailed, totalRegressed } = replayAll([makeRec(), makeRec()]);
  assert.equal(totalRepaired, 2, "两条轨迹各修复 1 个");
  assert.equal(totalStillFailed, 2);
  assert.equal(totalRegressed, 0);
});

test("失败轨迹才参与回放（成功轨迹被过滤）", () => {
  const successRec: TrajectoryRecord = {
    ...makeRec(),
    id: "ok",
    success: true,
    finalText: "完成",
  };
  const { summaries } = replayAll([makeRec(), successRec]);
  assert.equal(summaries.length, 1, "只回放失败轨迹");
});
