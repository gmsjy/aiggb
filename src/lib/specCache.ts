/**
 * Spec Cache —— Phase 1 精炼规格的意图缓存
 *
 * MVP 策略：精确键匹配（归一化 prompt + 领域 + 模式 + 画布对象指纹）
 * 避免：同一 prompt 在不同画布状态下返回不同 spec（多轮场景）
 *
 * 存储：默认 localStorage（惰性绑定，保证 node 环境可 import），TTL 30 天，LRU ≤ 50 条。
 * 通过 SpecStorage 参数可注入内存实现（见 createMemoryStorage），供 L1 单测使用。
 */

import type { RefinedSpec } from "./specSchema";
import { TEMPLATES } from "./templates";
import type { Domain } from "./prompts";
import { refinePromptHash } from "./refinePrompt";

const STORAGE_KEY = "aiggb_spec_cache_v2"; // v2: 键含 prompt_hash，refinePrompt 更新后旧缓存自动失效
const TTL_MS = 30 * 24 * 3600 * 1000; // 30 天
const MAX_ENTRIES = 50;

/** Phase 1 prompt 版本指纹（模块加载时计算一次）——prompt 变化即缓存键变化 */
const PROMPT_HASH = refinePromptHash();

/** 最小键值存储接口（浏览器 localStorage 的鸭子类型子集） */
export interface SpecStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** 默认存储：惰性包装 localStorage，避免模块加载期/非浏览器环境报错 */
const defaultStorage: SpecStorage = {
  getItem: key => (typeof localStorage !== "undefined" ? localStorage.getItem(key) : null),
  setItem: (key, value) => {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  }
};

/** 内存存储工厂——供单元测试使用 */
export function createMemoryStorage(): SpecStorage {
  const map = new Map<string, string>();
  return {
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value)
  };
}

export { STORAGE_KEY, TTL_MS, MAX_ENTRIES };

interface CachePayload {
  entries: Record<string, CacheEntry>;
}

interface CacheEntry {
  spec: Omit<RefinedSpec, "source">;
  ts: number; // 写入时间戳
}

function loadCache(storage: SpecStorage): CachePayload {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { entries: {} };
  } catch {
    return { entries: {} };
  }
}

function saveCache(payload: CachePayload, storage: SpecStorage): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // 存储满 → 淘汰最旧的 10 条
    const sorted = Object.entries(payload.entries).sort(([, a], [, b]) => a.ts - b.ts);
    for (const [k] of sorted.slice(0, 10)) {
      delete payload.entries[k];
    }
    try { storage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch { /* 放弃 */ }
  }
}

/** 归一化输入文本（去标点、去多余空白、全小写） */
function norm(s: string): string {
  return s.trim().toLowerCase().replace(/[\s，。！？、""''（）]+/g, " ").replace(/\s+/g, " ").trim();
}

/** 物理常量对象名（hidden，恒存在于首个 constants op 之后，不代表场景语义，不计入指纹） */
const CONSTANT_OBJECTS = new Set(["g", "c", "e", "eps0", "mu0", "k_e", "Grav", "h", "k_B"]);

/**
 * 画布对象指纹：仅取「有语义」的对象。
 * 排除 ggbBridge 的临时辅助对象（_vv/_fv 前缀，全局自增、同名场景每次结果不同）
 * 与物理常量，否则同一场景两次运行的指纹不同，缓存永远打不中。
 */
function objectFingerprint(existingObjects: string[]): string {
  const meaningful = existingObjects
    .filter(n => !n.startsWith("_") && !CONSTANT_OBJECTS.has(n))
    .sort();
  return meaningful.length > 0 ? meaningful.join(",") : "_fresh";
}

/** 缓存键：prompt_hash | 领域 | 模式 | 画布指纹 | 归一化输入 */
function cacheKey(
  domain: Domain,
  mode: "2d" | "3d",
  existingObjects: string[],
  text: string
): string {
  return `${PROMPT_HASH}|${domain}|${mode}|${objectFingerprint(existingObjects)}|${norm(text)}`;
}

// ── 对外接口 ──

/** 查找缓存的精炼规格。返回 null 表示未命中。 */
export function lookupCachedSpec(
  userText: string,
  domain: Domain,
  mode: "2d" | "3d",
  existingObjects: string[],
  storage: SpecStorage = defaultStorage
): RefinedSpec | null {
  // ① 模板精确匹配（模板 prompt 本身就是精炼规格，直接命中）
  const normInput = norm(userText);
  const tpl = TEMPLATES.find(
    t => norm(t.prompt) === normInput && t.domain === domain && t.mode === mode
  );
  if (tpl) {
    return { title: tpl.title, spec: tpl.prompt };
  }

  // ② 存储精确键匹配
  const key = cacheKey(domain, mode, existingObjects, userText);
  const payload = loadCache(storage);
  const hit = payload.entries[key];
  if (hit && Date.now() - hit.ts < TTL_MS) {
    return { ...hit.spec };
  }

  return null;
}

/** 保存精炼规格到缓存（含 ask 的 spec 不缓存，仅缓存有效规格） */
export function storeCachedSpec(
  userText: string,
  domain: Domain,
  mode: "2d" | "3d",
  existingObjects: string[],
  spec: RefinedSpec,
  storage: SpecStorage = defaultStorage
): void {
  // 反问规格不缓存
  if (spec.ask) return;
  if (!spec.spec || spec.spec.length < 20) return; // 空/太短的规格不缓存

  const key = cacheKey(domain, mode, existingObjects, userText);
  const payload = loadCache(storage);
  payload.entries[key] = {
    spec: { title: spec.title, spec: spec.spec },
    ts: Date.now()
  };

  // LRU 淘汰
  const keys = Object.keys(payload.entries);
  if (keys.length > MAX_ENTRIES) {
    const sorted = keys.sort((a, b) => payload.entries[a].ts - payload.entries[b].ts);
    for (const k of sorted.slice(0, keys.length - MAX_ENTRIES)) {
      delete payload.entries[k];
    }
  }

  saveCache(payload, storage);
}
