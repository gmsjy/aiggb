/**
 * Spec Cache —— Phase 1 精炼规格的意图缓存
 *
 * MVP 策略：精确键匹配（归一化 prompt + 领域 + 模式 + 画布对象指纹）
 * 避免：同一 prompt 在不同画布状态下返回不同 spec（多轮场景）
 *
 * 存储：localStorage，TTL 30 天，LRU ≤ 50 条
 */

import type { RefinedSpec } from "./specSchema";
import { TEMPLATES } from "./templates";
import type { Domain } from "./prompts";

const STORAGE_KEY = "aiggb_spec_cache_v1";
const TTL_MS = 30 * 24 * 3600 * 1000; // 30 天
const MAX_ENTRIES = 50;

interface CachePayload {
  entries: Record<string, CacheEntry>;
}

interface CacheEntry {
  spec: Omit<RefinedSpec, "source">;
  ts: number; // 写入时间戳
}

function loadCache(): CachePayload {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { entries: {} };
  } catch {
    return { entries: {} };
  }
}

function saveCache(payload: CachePayload): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage 满 → 淘汰最旧的 10 条
    const sorted = Object.entries(payload.entries).sort(([, a], [, b]) => a.ts - b.ts);
    for (const [k] of sorted.slice(0, 10)) {
      delete payload.entries[k];
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch { /* 放弃 */ }
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

/** 缓存键：领域 | 模式 | 画布指纹 | 归一化输入 */
function cacheKey(
  domain: Domain,
  mode: "2d" | "3d",
  existingObjects: string[],
  text: string
): string {
  return `${domain}|${mode}|${objectFingerprint(existingObjects)}|${norm(text)}`;
}

// ── 对外接口 ──

/** 查找缓存的精炼规格。返回 null 表示未命中。 */
export function lookupCachedSpec(
  userText: string,
  domain: Domain,
  mode: "2d" | "3d",
  existingObjects: string[]
): RefinedSpec | null {
  // ① 模板精确匹配（模板 prompt 本身就是精炼规格，直接命中）
  const normInput = norm(userText);
  const tpl = TEMPLATES.find(
    t => norm(t.prompt) === normInput && t.domain === domain && t.mode === mode
  );
  if (tpl) {
    return { title: tpl.title, spec: tpl.prompt };
  }

  // ② localStorage 精确键匹配
  const key = cacheKey(domain, mode, existingObjects, userText);
  const payload = loadCache();
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
  spec: RefinedSpec
): void {
  // 反问规格不缓存
  if (spec.ask) return;
  if (!spec.spec || spec.spec.length < 20) return; // 空/太短的规格不缓存

  const key = cacheKey(domain, mode, existingObjects, userText);
  const payload = loadCache();
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

  saveCache(payload);
}
