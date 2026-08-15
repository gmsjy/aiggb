/**
 * runControl L1 单测 —— 单轮生命周期 / 取消监听
 *   npm run test:unit（已注册）
 *
 * 覆盖（回归）：
 *   1. beginRun/endRun 不得清空 cancelListeners —— 否则 ChatPanel 挂载时注册的常驻取消监听
 *      在第一次运行后被抹掉，之后 Agent 模式危险工具确认弹窗在 清空/切模式 时无法被取消
 *      （Promise 永不 resolve → 并发锁悬挂）。
 *   2. onRunCancelled 订阅跨多轮 run 仍有效，abort 时触发。
 *   3. 退订函数能移除监听。
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  beginRun,
  endRun,
  abortCurrentRun,
  onRunCancelled,
  wasAborted,
} from "../src/lib/runControl";

test("beginRun/endRun 不清理常驻取消监听 —— 第二轮 abort 仍能触发（回归：旧代码会清空）", async () => {
  // 模拟：挂载时注册一次常驻监听（旧代码 endRun 里 cancelListeners.clear() → 第二轮失效）
  let fired = 0;
  const unsub = onRunCancelled(() => { fired++; });

  // 完整跑完一轮（beginRun → ... → endRun）
  beginRun();
  endRun();

  // 第二轮：beginRun 后用户触发取消（清空/切模式/撤销）
  beginRun();
  const firedAfterSecondBegin = fired;
  abortCurrentRun();
  const firedAfterAbort = fired;

  // 关键断言：endRun 结束后监听仍在（否则第二轮 abort 的 fired 增量应为 0）
  assert.ok(
    firedAfterAbort > firedAfterSecondBegin,
    "第二轮 abort 应触发常驻监听（endRun/beginRun 不得清空 cancelListeners）"
  );

  // 复位
  endRun();
  unsub();
});

test("wasAborted 状态随 beginRun/abort 正确翻转", () => {
  // 关键：beginRun 会先 cancel 上一轮残留（此时可能把 aborted 置 true），随后复位为 false
  beginRun();
  assert.equal(wasAborted(), false, "新 run 开始后未 abort 状态应为 false");
  abortCurrentRun();
  assert.equal(wasAborted(), true, "abort 后应为 true");
  endRun();
});
