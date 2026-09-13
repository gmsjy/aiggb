/**
 * schema L1 单测 —— SafeCmd 危险片段过滤（安全边界）
 *
 * 背景：on\w+= 正则无左边界时，会把驼峰变量名（tOnAxis=、posOnGround=）
 * 误判为 HTML 事件注入——用户视角 E2E 实测导致 3 连格式重试全失败。
 * 修复：on\w+= 前必须是非字母字符（行首/引号/空格等）。
 *
 * 运行：node --test --import tsx tests/schema.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { Command } from "../src/lib/schema";

function evalOk(cmd: string): boolean {
  return Command.safeParse({ op: "eval", cmd }).success;
}

test("SafeCmd：真实攻击片段仍被拦截", () => {
  assert.equal(evalOk("<script>alert(1)</script>"), false, "<script 必须拦截");
  assert.equal(evalOk("javascript:alert(1)"), false, "javascript: 必须拦截");
  assert.equal(evalOk('txt=Text("x onclick=alert(1)", (0,0))'), false, "onclick= 必须拦截");
  assert.equal(evalOk('cap="onLoad=1"'), false, "引号内 onLoad= 仍拦截（左边界为引号）");
});

test("SafeCmd：驼峰变量名/普通文本不再被 on\\w+= 误杀（E2E 实测回归）", () => {
  assert.equal(evalOk('tOnAxis=Text("x", (0,0))'), true, "tOnAxis= 是合法变量赋值");
  assert.equal(evalOk("posOnGround=1"), true);
  assert.equal(evalOk("P=(min(a,b),max(0,c))"), true);
  assert.equal(evalOk('txtT=Text("T=2.01",(0,-1))'), true);
});
