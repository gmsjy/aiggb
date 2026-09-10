/**
 * repaintGate L1 单测（0 API、纯离线）—— 批处理策略 + 重绘静默期
 *
 * 背景：3D 绘图区闪烁的三条路径（逐条重绘 / 恢复重绘整屏重建 / 心跳误判硬重建）。
 *   - shouldBatch：2D 一律合并为一次重绘；3D 阈值更高且可关闭
 *   - 静默期：批处理恢复后心跳必须挂起，否则会误触 applet 硬重建
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  shouldBatch,
  withRepaintBatch,
  isBatch3DEnabled,
  setBatch3DEnabled,
  markRepaintBusy,
  clearRepaintBusy,
  isRepaintBusy,
  BATCH_MIN_COMMANDS,
  REPAINT_GRACE_MS,
} from "../src/lib/repaintGate";

// ★ Node 环境没有 localStorage：装一个内存桩，验证开关的读写与持久化语义
const storage = new Map<string, string>();
(globalThis as unknown as { localStorage: unknown }).localStorage = {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => void storage.set(k, v),
  removeItem: (k: string) => void storage.delete(k),
};

test.afterEach(() => {
  clearRepaintBusy();
  storage.clear();       // 同时复位 3D 批处理开关（默认 = 启用）
});

// ── shouldBatch ──

test("shouldBatch：空批次不处理，单条命令也批处理", () => {
  assert.equal(shouldBatch(0, "2d"), false);
  assert.equal(shouldBatch(0, "3d"), false);
  assert.equal(BATCH_MIN_COMMANDS, 1);
  // ★ 单条命令内部常展开为多条 evalCommand（create + SetCaption + SetColor…），
  //   批处理同样能把代数区逐行重建合并成一次 —— 实测闪烁就发生在「每轮 1~2 个工具调用」
  assert.equal(shouldBatch(1, "2d"), true);
  assert.equal(shouldBatch(1, "3d"), true);
});

test("shouldBatch：2D 一律批处理（避免代数区逐条重建闪烁）", () => {
  assert.equal(shouldBatch(2, "2d"), true);
  assert.equal(shouldBatch(3, "2d"), true);
  assert.equal(shouldBatch(20, "2d"), true);
});

test("shouldBatch：3D 默认批处理，可由 localStorage 关闭", () => {
  assert.equal(shouldBatch(1, "3d"), true);
  assert.equal(shouldBatch(4, "3d"), true);

  setBatch3DEnabled(false);
  assert.equal(isBatch3DEnabled(), false);
  assert.equal(shouldBatch(10, "3d"), false, "关闭后 3D 不批处理（换取 3D 视图不整屏重绘）");
  assert.equal(shouldBatch(10, "2d"), true, "2D 不受 3D 开关影响");

  setBatch3DEnabled(true);
  assert.equal(isBatch3DEnabled(), true);
  assert.equal(shouldBatch(10, "3d"), true);
});

test("shouldBatch：appMode 缺省按 2D 处理", () => {
  assert.equal(shouldBatch(2, undefined), true);
});

// ── withRepaintBatch：批处理执行包装 ──

function toggleSpy() {
  const calls: boolean[] = [];
  return {
    api: { setRepaintingActive: (f: boolean) => void calls.push(f) },
    calls,
  };
}

test("withRepaintBatch：非空批次 → 暂停 → 执行 → 恢复 + 进入静默期", () => {
  const { api, calls } = toggleSpy();
  clearRepaintBusy();
  const out = withRepaintBatch(api, 2, "2d", () => {
    assert.deepEqual(calls, [false], "执行期间应处于暂停重绘状态");
    return "done";
  });
  assert.equal(out, "done");
  assert.deepEqual(calls, [false, true], "执行结束必须恢复重绘");
  assert.equal(isRepaintBusy(), true, "恢复后进入静默期（心跳挂起）");
});

test("withRepaintBatch：空批次不触碰重绘开关", () => {
  const { api, calls } = toggleSpy();
  const out = withRepaintBatch(api, 0, "2d", () => 42);
  assert.equal(out, 42);
  assert.deepEqual(calls, []);
});

test("withRepaintBatch：执行抛错也要恢复重绘（画布不会永久停更）", () => {
  const { api, calls } = toggleSpy();
  assert.throws(() => {
    withRepaintBatch(api, 3, "3d", () => {
      throw new Error("boom");
    });
  }, /boom/);
  assert.deepEqual(calls, [false, true]);
});

test("withRepaintBatch：3D 关闭批处理后直接执行", () => {
  setBatch3DEnabled(false);
  const { api, calls } = toggleSpy();
  assert.equal(withRepaintBatch(api, 5, "3d", () => 7), 7);
  assert.deepEqual(calls, []);
  setBatch3DEnabled(true);
});

// ── 重绘静默期 ──

test("静默期：markRepaintBusy 后 isRepaintBusy 为真，clear 后为假", () => {
  clearRepaintBusy();
  assert.equal(isRepaintBusy(), false);
  markRepaintBusy();
  assert.equal(isRepaintBusy(), true, "批处理恢复重绘后必须挂起心跳判定");
  clearRepaintBusy();
  assert.equal(isRepaintBusy(), false);
});

test("静默期：过期后自动失效（不阻塞心跳）", () => {
  markRepaintBusy(1);
  const until = Date.now() + REPAINT_GRACE_MS;
  assert.ok(until > Date.now(), "默认静默期覆盖 3D 整屏重建窗口");
  return new Promise<void>(resolve => {
    setTimeout(() => {
      assert.equal(isRepaintBusy(), false, "1ms 静默期结束后心跳应恢复工作");
      resolve();
    }, 15);
  });
});
