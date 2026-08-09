/**
 * specCache L1 单测（0 API、纯离线，内存存储注入）
 *   npm run test:unit
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  lookupCachedSpec,
  storeCachedSpec,
  createMemoryStorage,
  STORAGE_KEY,
  TTL_MS,
  MAX_ENTRIES
} from "../src/lib/specCache";
import { TEMPLATES } from "../src/lib/templates";

const SPEC = "## 目标\n绘制一个以 A、B、C 为顶点的外接圆，标注圆心与半径，视窗自动适配。";

test("store → lookup 同键命中", () => {
  const storage = createMemoryStorage();
  storeCachedSpec("画外接圆", "general", "2d", ["A", "B", "C"], { spec: SPEC }, storage);
  const hit = lookupCachedSpec("画外接圆", "general", "2d", ["A", "B", "C"], storage);
  assert.ok(hit);
  assert.equal(hit.spec, SPEC);
});

test("画布对象指纹变化 → 未命中", () => {
  const storage = createMemoryStorage();
  storeCachedSpec("画外接圆", "general", "2d", ["A", "B", "C"], { spec: SPEC }, storage);
  const hit = lookupCachedSpec("画外接圆", "general", "2d", ["A", "B", "C", "D"], storage);
  assert.equal(hit, null);
});

test("临时对象与物理常量不计入指纹 → 仍命中", () => {
  const storage = createMemoryStorage();
  storeCachedSpec("画外接圆", "general", "2d", ["A", "B"], { spec: SPEC }, storage);
  const hit = lookupCachedSpec("画外接圆", "general", "2d", ["A", "B", "_vv3", "_fv7", "g", "eps0"], storage);
  assert.ok(hit);
});

test("domain / mode 变化 → 未命中", () => {
  const storage = createMemoryStorage();
  storeCachedSpec("画外接圆", "general", "2d", [], { spec: SPEC }, storage);
  assert.equal(lookupCachedSpec("画外接圆", "physics", "2d", [], storage), null);
  assert.equal(lookupCachedSpec("画外接圆", "general", "3d", [], storage), null);
});

test("归一化：全角标点与空白差异视为同键", () => {
  const storage = createMemoryStorage();
  storeCachedSpec("画一个圆！", "general", "2d", [], { spec: SPEC }, storage);
  const hit = lookupCachedSpec("画一个圆", "general", "2d", [], storage);
  assert.ok(hit);
});

test("TTL 过期 → 未命中", () => {
  const storage = createMemoryStorage();
  storeCachedSpec("画外接圆", "general", "2d", [], { spec: SPEC }, storage);
  // 手工把 ts 改成过期时间
  const raw = JSON.parse(storage.getItem(STORAGE_KEY)!);
  for (const key of Object.keys(raw.entries)) raw.entries[key].ts = Date.now() - TTL_MS - 1000;
  storage.setItem(STORAGE_KEY, JSON.stringify(raw));
  assert.equal(lookupCachedSpec("画外接圆", "general", "2d", [], storage), null);
});

test("ask 规格不缓存", () => {
  const storage = createMemoryStorage();
  storeCachedSpec("画个圆", "general", "2d", [], { ask: "请指定半径？" }, storage);
  assert.equal(lookupCachedSpec("画个圆", "general", "2d", [], storage), null);
});

test("过短规格不缓存", () => {
  const storage = createMemoryStorage();
  storeCachedSpec("画外接圆", "general", "2d", [], { spec: "太短" }, storage);
  assert.equal(lookupCachedSpec("画外接圆", "general", "2d", [], storage), null);
});

test("LRU 淘汰最旧条目", async () => {
  const storage = createMemoryStorage();
  for (let i = 0; i <= MAX_ENTRIES; i++) {
    storeCachedSpec(`场景 ${i} 的详细描述`, "general", "2d", [], { spec: `${SPEC} #${i}` }, storage);
    await new Promise(r => setTimeout(r, 2)); // 保证 ts 单调递增
  }
  assert.equal(lookupCachedSpec("场景 0 的详细描述", "general", "2d", [], storage), null, "最旧条目应被淘汰");
  assert.ok(lookupCachedSpec(`场景 ${MAX_ENTRIES} 的详细描述`, "general", "2d", [], storage));
  const raw = JSON.parse(storage.getItem(STORAGE_KEY)!);
  assert.ok(Object.keys(raw.entries).length <= MAX_ENTRIES);
});

test("模板 prompt 精确匹配优先于存储", () => {
  const tpl = TEMPLATES[0];
  const storage = createMemoryStorage();
  const hit = lookupCachedSpec(tpl.prompt, tpl.domain, tpl.mode, ["X", "Y"], storage);
  assert.ok(hit);
  assert.equal(hit.title, tpl.title);
  assert.equal(hit.spec, tpl.prompt);
});

test("模板 prompt 在错误 domain 下不走模板分支", () => {
  const tpl = TEMPLATES[0];
  const storage = createMemoryStorage();
  const wrongDomain = tpl.domain === "physics" ? "general" : "physics";
  assert.equal(lookupCachedSpec(tpl.prompt, wrongDomain, tpl.mode, [], storage), null);
});
