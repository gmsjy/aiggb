/**
 * ReAct 轨迹记录器 —— 改造五：可观测性 + 训练数据闭环基础
 *
 * 在 agentLoop 每轮结束时把完整 (Plan, Action, Observation) 轨迹写入 IndexedDB：
 *   - 成功轨迹 → 正样本（后续可做训练数据闭环 / few-shot 注入）
 *   - 失败轨迹 → 负样本（后续可做离线回放 / 自愈数据集）
 *
 * 设计约束：
 *   - 纯浏览器 IndexedDB，Node 测试环境（无 indexedDB）下静默 no-op
 *   - agentLoop 不直接 import 本模块——通过 AgentLoopDeps.persistTrajectory 注入，
 *     保持 agentLoop 纯 TS 可单测；pipeline.ts 在组装 deps 时传入默认实现
 */

import type { AgentMessage } from "./aiClient";

// ──── 轨迹记录类型 ────

export interface TrajectoryRecord {
  /** 唯一 id（ts + 随机后缀） */
  id: string;
  /** 记录时间戳 */
  ts: number;
  /** 用户本轮输入 */
  userText: string;
  /** Agent 最终文本回复 */
  finalText: string;
  /** 工具调用迭代轮数 */
  iterations: number;
  /** 是否正常完成（有最终文本，未熔断/超限） */
  success: boolean;
  /** 被拒绝的工具名列表 */
  deniedTools: string[];
  /** 完整 ReAct 对话轨迹（assistant tool_calls + tool results） */
  messages: AgentMessage[];
}

// ──── IndexedDB 封装 ────

const DB_NAME = "aiggb";
const DB_VERSION = 1;
const STORE_NAME = "trajectories";
const MAX_RECORDS = 500; // 上限 500 条，超出删最旧

let _dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB 不可用（非浏览器环境）"));
  }
  if (_dbPromise) return _dbPromise;

  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("ts", "ts");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open 失败"));
  });
  return _dbPromise;
}

/**
 * 保存一条 ReAct 轨迹。Node 环境 / 数据库异常时静默失败（不阻断 agent loop）。
 */
export async function saveTrajectory(record: TrajectoryRecord): Promise<void> {
  try {
    const db = await openDb();
    return await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(record);

      // 容量控制：超出 MAX_RECORDS 时删最旧
      const countReq = store.count();
      countReq.onsuccess = () => {
        const count = countReq.result;
        if (count > MAX_RECORDS) {
          const excess = count - MAX_RECORDS;
          const idx = store.index("ts");
          const cursorReq = idx.openCursor();
          let deleted = 0;
          cursorReq.onsuccess = () => {
            const cursor = cursorReq.result;
            if (cursor && deleted < excess) {
              store.delete(cursor.primaryKey);
              deleted++;
              cursor.continue();
            }
          };
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("保存轨迹失败"));
    });
  } catch {
    // 静默失败：轨迹记录是锦上添花，不应影响主流程
  }
}

/** 从 AgentLoopResult 构造 TrajectoryRecord */
export function buildTrajectoryRecord(
  userText: string,
  result: { finalText: string; iterations: number; deniedTools: string[]; messages: AgentMessage[] }
): TrajectoryRecord {
  const hasFinalText = result.finalText.trim().length > 0;
  return {
    id: `traj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ts: Date.now(),
    userText,
    finalText: result.finalText,
    iterations: result.iterations,
    // 正常完成 = 有最终文本 且 未达到最大迭代（30 轮超限视为不完整）
    success: hasFinalText && result.iterations < 30,
    deniedTools: result.deniedTools,
    messages: result.messages,
  };
}

// ──── 导出 / 导入 / 统计（供训练数据管理 UI） ────

/** 读取全部轨迹记录 */
export async function getAllTrajectories(): Promise<TrajectoryRecord[]> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result as TrajectoryRecord[]);
      req.onerror = () => reject(req.error ?? new Error("读取失败"));
    });
  } catch {
    return [];
  }
}

/** 批量导入轨迹（用于训练数据导入） */
export async function importTrajectories(records: TrajectoryRecord[]): Promise<number> {
  if (records.length === 0) return 0;
  try {
    const db = await openDb();
    return await new Promise<number>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      for (const rec of records) store.put(rec);
      tx.oncomplete = () => resolve(records.length);
      tx.onerror = () => reject(tx.error ?? new Error("导入失败"));
    });
  } catch {
    return 0;
  }
}

/** 清空全部轨迹 */
export async function clearTrajectories(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("清空失败"));
    });
  } catch {
    // 静默
  }
}