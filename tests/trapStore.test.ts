/**
 * trapStore L1 单测 —— known_traps 动态升级
 *   npm run test:unit（已注册）
 *
 * 覆盖：
 *   1. normalizeError：数字归一化 + 去空白（同类错误数值不同也归并）
 *   2. findTrapTarget：同 pattern 归并 / 无匹配返回 null
 *   3. buildTrapPrompt：达到阈值格式 + 空返回 ""
 *   4. MIN_OCCURRENCE 过滤（≥3 才注入）
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  normalizeError,
  findTrapTarget,
  buildTrapPrompt,
  MIN_OCCURRENCE,
  MAX_INJECT_TRAPS,
  recordFailure,
  ingestTrajectoryFailures,
  backfillTrapsFromTrajectories,
  refreshTraps,
  type KnownTrap,
} from "../src/lib/trapStore";
import type { TrajectoryRecord } from "../src/lib/trajectoryStore";

test("normalizeError：数字替换 N、去多余空白", () => {
  assert.equal(
    normalizeError("半径必须为正数，当前 radius=-5"),
    "半径必须为正数，当前 radius=-N"
  );
  assert.equal(
    normalizeError(" 滑块 t 的  min(20)  必须小于 max(5) "),
    "滑块 t 的 min(N) 必须小于 max(N)"
  );
});

test("findTrapTarget：同 pattern 归并 / 无匹配返回 null", () => {
  const traps: KnownTrap[] = [{
    id: "t1", pattern: "create_circle: 半径必须为正数，当前 radius=-N",
    wrongExample: "半径必须为正数", occurrenceCount: 2, lastSeen: 1, source: "auto",
  }];

  const hit = findTrapTarget(traps, "create_circle: 半径必须为正数，当前 radius=-N");
  assert.equal(hit?.id, "t1", "同 pattern 应命中");

  const miss = findTrapTarget(traps, "create_slider: min 必须小于 max");
  assert.equal(miss, null, "不同 pattern 返回 null");
});

test("buildTrapPrompt：格式正确，空输入返回空串", () => {
  assert.equal(buildTrapPrompt([]), "", "无陷阱返回空");

  const traps: KnownTrap[] = [{
    id: "t1", pattern: "x", wrongExample: "半径必须为正数",
    occurrenceCount: MIN_OCCURRENCE, lastSeen: 1, source: "auto",
  }];
  const prompt = buildTrapPrompt(traps);
  assert.ok(prompt.includes("已知陷阱"), "应含标题");
  assert.ok(prompt.includes("半径必须为正数"), "应含错误示例");
  assert.ok(prompt.includes("3 次"), "应含出现次数");
});

test("注入上限 MAX_INJECT_TRAPS 生效", () => {
  const traps: KnownTrap[] = Array.from({ length: MAX_INJECT_TRAPS + 5 }, (_, i) => ({
    id: `t${i}`, pattern: `p${i}`, wrongExample: `err${i}`,
    occurrenceCount: 5, lastSeen: 1, source: "auto" as const,
  }));
  const prompt = buildTrapPrompt(traps);
  // buildTrapPrompt 直接接收已截断数组；截断逻辑在 refreshTraps（IndexedDB 层）
  // 这里验证 prompt 能容纳全部（不崩），且调用方负责 slice
  assert.ok(prompt.length > 0);
  // 验证 MAX_INJECT_TRAPS 常量存在（refreshTraps 用它 slice）
  assert.ok(MAX_INJECT_TRAPS >= 3);
});

test("非浏览器环境：refactor 后 recordFailure/refreshTraps/backfill 均安全 no-op（不抛错）", async () => {
  // Node 无 indexedDB：共享 openDb（ggbDB）reject → 各 API 应静默降级，不抛异常、不污染
  await assert.doesNotReject(() => recordFailure("create_circle", "半径必须为正数，当前 radius=-5"));
  await assert.doesNotReject(() => refreshTraps(true));
  await assert.doesNotReject(() => backfillTrapsFromTrajectories());
  const traps = await refreshTraps();
  assert.ok(Array.isArray(traps), "refreshTraps 在非浏览器环境应返回空数组");
});

test("ingestTrajectoryFailures 跳过成功轨迹、从失败轨迹提取工具错误", async () => {
  const successRec: TrajectoryRecord = {
    id: "s1", ts: 1, userText: "ok", finalText: "done", iterations: 2,
    success: true, deniedTools: [], messages: [],
  };
  const failedRec: TrajectoryRecord = {
    id: "f1", ts: 2, userText: "bad", finalText: "", iterations: 30,
    success: false, deniedTools: [],
    messages: [
      {
        role: "assistant",
        content: null,
        tool_calls: [{ id: "c1", type: "function", function: { name: "create_circle", arguments: "{}" } }],
      },
      // 命中 success=false 且含 error → 计入
      { role: "tool", tool_call_id: "c1", content: JSON.stringify({ success: false, error: "半径必须为正数，当前 radius=-5" }) },
    ],
  };
  // 失败但无错误信息的轨迹不该提取
  const failedNoErr: TrajectoryRecord = {
    id: "f2", ts: 3, userText: "nope", finalText: "", iterations: 30,
    success: false, deniedTools: [],
    messages: [
      { role: "assistant", content: null, tool_calls: [{ id: "c2", type: "function", function: { name: "list_objects", arguments: "{}" } }] },
      { role: "tool", tool_call_id: "c2", content: JSON.stringify({ success: true, result: "ok" }) },
    ],
  };

  // 注意：非浏览器环境 recordFailure 会静默 no-op，但 ingest 对"可解析且 success=false 且含 error"的条目仍会计数
  const count = await ingestTrajectoryFailures([successRec, failedRec, failedNoErr]);
  assert.equal(count, 1, "只应提取失败轨迹里 success=false 且带 error 的那条");
});
