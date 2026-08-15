/**
 * known_traps 动态升级 —— 从失败记录提炼高频错误模式（语义知识记忆的动态层）
 *
 * 静态 `HALLUCINATION_MAP`（ggbKB）覆盖已知臆造命令；本模块覆盖**运行时新发现的错误**：
 * 执行失败时记录 (工具名 + 归一化错误)，同类错误出现 ≥ MIN_OCCURRENCE 次自动提升为"已知陷阱"，
 * 注入 checker prompt 防止 AI 再犯。
 *
 * 与 TencentDB 分层记忆对齐：known_traps 是"语义知识记忆"的动态部分（静态 KB + 运行时自增）。
 *
 * 存储：IndexedDB（与 trainingStore/trajectoryStore 共享 aiggb 库）。Node 环境静默 no-op。
 */

import { getAllTrajectories, type TrajectoryRecord } from "./trajectoryStore";
import { openGGBDB } from "./ggbDB";

// ── 类型 ──

export interface KnownTrap {
  id: string;
  /** 归一化错误模式（如 "create_circle: 半径必须为正数，当前 radius=-N"） */
  pattern: string;
  /** 原始错误示例（第一条） */
  wrongExample: string;
  /** 出现次数 */
  occurrenceCount: number;
  lastSeen: number;
  /** 来源：手动 / 自动提升 */
  source: "manual" | "auto";
}

// ── 常量 ──

const STORE_NAME = "traps";
/** 出现 ≥ 此次数自动提升为"已知陷阱"（注入 prompt） */
export const MIN_OCCURRENCE = 3;
/** 注入上限（防 prompt 膨胀） */
export const MAX_INJECT_TRAPS = 8;

/** 归一化错误：数字替换为 N，去首尾空白（同类错误数值不同也归并） */
export function normalizeError(error: string): string {
  return error
    .replace(/\d+(?:\.\d+)?/g, "N")
    .replace(/\s+/g, " ")
    .trim();
}

// ── IndexedDB（共享库，schema 在 ggbDB 统一管理） ──

let _trapsCache: KnownTrap[] | null = null; // 会话内缓存，防重复读库

async function openDb(): Promise<IDBDatabase> {
  const { db } = await openGGBDB();
  return db;
}

async function readAllTraps(): Promise<KnownTrap[]> {
  if (_trapsCache) return _trapsCache;
  try {
    const db = await openDb();
    if (!db.objectStoreNames.contains(STORE_NAME)) return [];
    const traps = await new Promise<KnownTrap[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result as KnownTrap[]);
      req.onerror = () => reject(req.error ?? new Error("读取 traps 失败"));
    });
    _trapsCache = traps;
    return traps;
  } catch {
    return [];
  }
}

async function upsertTrap(trap: KnownTrap): Promise<boolean> {
  try {
    const db = await openDb();
    return await new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(trap);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error ?? new Error("保存 trap 失败"));
    });
  } catch {
    // 静默；返回 false 供调用方判断是否同步会话缓存
    return false;
  }
}

// ── 记录 / 聚类 ──

/** 纯函数：给定现有 traps + 一条失败，返回应更新的 trap（同 pattern 归并）或 null（新建） */
export function findTrapTarget(traps: KnownTrap[], pattern: string): KnownTrap | null {
  return traps.find(t => t.pattern === pattern) ?? null;
}

/**
 * 记录一次失败（执行层失败时调用）：同 pattern 归并 occurrenceCount++，否则新建。
 * 同步更新会话内缓存 _trapsCache（否则本会话内 refreshTraps 读到的仍是旧缓存，已知陷阱不生效）。
 */
export async function recordFailure(toolName: string, error: string): Promise<void> {
  const pattern = `${toolName}: ${normalizeError(error)}`;
  if (!error.trim()) return;
  const traps = await readAllTraps();
  const existing = findTrapTarget(traps, pattern);
  let next: KnownTrap;
  if (existing) {
    next = {
      ...existing,
      occurrenceCount: existing.occurrenceCount + 1,
      lastSeen: Date.now(),
    };
  } else {
    next = {
      id: `trap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      pattern,
      wrongExample: error.slice(0, 120),
      occurrenceCount: 1,
      lastSeen: Date.now(),
      source: "auto",
    };
  }
  const saved = await upsertTrap(next);
  if (!saved) return; // DB 不可用/写入失败：不同步会话缓存，避免幽灵记录
  // ★ 仅当 DB 写入成功才同步会话缓存 _trapsCache（让后续 refreshTraps() 立即读到新记录）
  const idx = traps.findIndex(t => t.pattern === pattern);
  if (idx >= 0) traps[idx] = next;
  else traps.push(next);
  _trapsCache = traps;
}

/**
 * 从失败轨迹批量回填 traps（Agent 模式失败轨迹已在 trajectoryStore）。
 * 提取 messages 中所有 tool 响应（success=false 且含 error）→ recordFailure。
 */
export async function ingestTrajectoryFailures(records: TrajectoryRecord[]): Promise<number> {
  let count = 0;
  for (const rec of records) {
    if (rec.success) continue;
    const msgs = rec.messages;
    for (let i = 0; i < msgs.length; i++) {
      const m = msgs[i];
      if (m.role === "assistant" && m.tool_calls) {
        for (const tc of m.tool_calls) {
          const resp = msgs.slice(i + 1).find(x => x.role === "tool" && x.tool_call_id === tc.id);
          if (!resp?.content) continue;
          try {
            const p = JSON.parse(resp.content) as { success?: boolean; error?: string };
            if (p.success === false && p.error) {
              await recordFailure(tc.function.name, p.error);
              count++;
            }
          } catch { /* 忽略解析失败 */ }
        }
      }
    }
  }
  return count;
}

/**
 * 从 Agent 失败轨迹回填陷阱（Agent 模式一轮结束后调用）。
 * 仅回填"非成功"轨迹中的工具失败；成功后复位缓存让后续注入读取到新鲜数据。
 */
export async function backfillTrapsFromTrajectories(): Promise<void> {
  try {
    const records = await getAllTrajectories();
    const failed = records.filter(r => !r.success);
    if (failed.length === 0) return;
    await ingestTrajectoryFailures(failed);
    // ingestTrajectoryFailures 内部通过 recordFailure 已同步 _trapsCache
  } catch {
    // 锦上添花，失败不影响主流程
  }
}

// ── 读取（注入用） ──

/**
 * 获取达到提升阈值的已知陷阱（供 checker prompt 注入）。
 * 会话内缓存（防重复读库）。force=true 时清缓存后回填轨迹再读取（供会话开始 / 测试）。
 */
export async function refreshTraps(force = false): Promise<KnownTrap[]> {
  if (force) {
    _trapsCache = null;
    await ingestTrajectoryFailures(await getAllTrajectories());
  }
  const traps = await readAllTraps();
  return traps
    .filter(t => t.occurrenceCount >= MIN_OCCURRENCE)
    .sort((a, b) => b.occurrenceCount - a.occurrenceCount)
    .slice(0, MAX_INJECT_TRAPS);
}

/** 构建可注入 checker prompt 的已知陷阱文本 */
export function buildTrapPrompt(traps: KnownTrap[]): string {
  if (traps.length === 0) return "";
  const lines = traps.map(t =>
    `- ❌ ${t.wrongExample}（出现 ${t.occurrenceCount} 次）→ 请避免此错误模式`
  );
  return `【已知陷阱 — 以下错误模式已多次出现，禁止再次触发】\n${lines.join("\n")}`;
}

/** 清空全部 traps（供 UI 重置） */
export async function clearTraps(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("清空 traps 失败"));
    });
  } catch {
    // 静默
  }
  _trapsCache = null;
}
