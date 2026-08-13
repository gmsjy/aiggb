/**
 * 训练数据闭环 —— 意图 → 成功命令学习库
 *
 * 两阶段模式执行全成功时，把「精炼规格 → 成功命令」存入 IndexedDB；
 * 下次相似规格编译时，检索 top-1 案例注入 compile prompt，形成"越用越准"的正向循环。
 *
 * 检索：Jaccard 相似度（中英混合 tokenize）。纯前端零依赖，比向量检索简单直接。
 * 注入策略（DeepSeek 特化）：仅注入 1 条、相似度阈值高（0.4）、明确标注"勿照搬数值"。
 *
 * Node 测试环境（无 indexedDB）静默 no-op；tokenize/jaccard/buildExamplePrompt 为纯函数可单测。
 */

import type { Command } from "./schema";
import {
  getAllTrajectories,
  importTrajectories,
  clearTrajectories,
  type TrajectoryRecord,
} from "./trajectoryStore";

// ──── 记录类型 ────

export interface ExecutionRecord {
  id: string;
  ts: number;
  /** 精炼规格（作为检索意图） */
  spec: string;
  /** 首次执行即全成功的命令序列 */
  commands: Command[];
}

// ──── 纯函数：tokenize / 相似度 ────

/** 中英混合 tokenize：英文/数字词 + 中文 bigram（对中文短意图效果好） */
export function tokenize(text: string): Set<string> {
  const tokens = new Set<string>();
  // 英文单词 / 数字 / 常见符号序列
  for (const m of text.matchAll(/[A-Za-z][A-Za-z0-9_]*|\d+(?:\.\d+)?|v\d|theta|alpha|omega/g)) {
    tokens.add(m[0].toLowerCase());
  }
  // 中文 bigram
  const han = text.replace(/[^一-鿿]/g, "");
  for (let i = 0; i < han.length - 1; i++) {
    tokens.add(han.slice(i, i + 2));
  }
  // 单字也加入（短意图如"圆"）
  for (const ch of han) tokens.add(ch);
  return tokens;
}

/** Jaccard 相似度 = |A∩B| / |A∪B| */
export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** 检索相似记录（读取全库，Jaccard 计算，返回 top-1 且超过阈值者） */
export async function searchExecution(
  spec: string,
  threshold = 0.4
): Promise<ExecutionRecord | null> {
  const records = await getAllRecords();
  if (records.length === 0) return null;
  const queryTokens = tokenize(spec);
  let best: ExecutionRecord | null = null;
  let bestScore = 0;
  for (const rec of records) {
    const score = jaccardSimilarity(queryTokens, tokenize(rec.spec));
    if (score > bestScore) {
      bestScore = score;
      best = rec;
    }
  }
  return bestScore >= threshold ? best : null;
}

// ──── IndexedDB 封装 ────

const DB_NAME = "aiggb";
const DB_VERSION = 1;
const STORE_NAME = "executions";
const MAX_RECORDS = 300; // 上限 300 条，超出删最旧

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

async function getAllRecords(): Promise<ExecutionRecord[]> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result as ExecutionRecord[]);
      req.onerror = () => reject(req.error ?? new Error("读取失败"));
    });
  } catch {
    return []; // 非浏览器 / 异常 → 空库
  }
}

/** 存储一条成功执行记录（静默失败，不阻断主流程） */
export async function storeExecution(record: ExecutionRecord): Promise<void> {
  try {
    const db = await openDb();
    return await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(record);

      // 容量控制：超出 MAX_RECORDS 删最旧
      const countReq = store.count();
      countReq.onsuccess = () => {
        const count = countReq.result;
        if (count > MAX_RECORDS) {
          const idx = store.index("ts");
          const cursorReq = idx.openCursor();
          let deleted = 0;
          const excess = count - MAX_RECORDS;
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
      tx.onerror = () => reject(tx.error ?? new Error("保存失败"));
    });
  } catch {
    // 静默失败：训练库是锦上添花
  }
}

/** 构造 ExecutionRecord */
export function buildExecutionRecord(spec: string, commands: Command[]): ExecutionRecord {
  return {
    id: `exec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ts: Date.now(),
    spec,
    commands,
  };
}

// ──── 导出 / 导入 / 统计（供训练数据管理 UI） ────

/** 训练数据备份格式（导出/导入的 JSON 结构） */
export interface TrainingBackup {
  version: 1;
  exportedAt: number;
  executions: ExecutionRecord[];
  trajectories: TrajectoryRecord[];
}

/** 读取全部成功执行记录 */
export async function getAllExecutions(): Promise<ExecutionRecord[]> {
  return getAllRecords();
}

/** 批量导入成功执行记录 */
export async function importExecutions(records: ExecutionRecord[]): Promise<number> {
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

/** 清空全部成功执行记录 */
export async function clearExecutions(): Promise<void> {
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

/** 导出全部训练数据（执行样本 + 轨迹）为备份对象 */
export async function exportAllData(): Promise<TrainingBackup> {
  const [executions, trajectories] = await Promise.all([
    getAllExecutions(),
    getAllTrajectories(),
  ]);
  return {
    version: 1,
    exportedAt: Date.now(),
    executions,
    trajectories,
  };
}

/** 导入训练数据备份，返回 (成功执行导入数, 轨迹导入数) */
export async function importData(
  backup: Partial<TrainingBackup>
): Promise<{ executions: number; trajectories: number }> {
  const execCount = await importExecutions(backup.executions ?? []);
  const trajCount = await importTrajectories(backup.trajectories ?? []);
  return { executions: execCount, trajectories: trajCount };
}

/** 清空全部训练数据（执行样本 + 轨迹） */
export async function clearAllData(): Promise<void> {
  await Promise.all([clearExecutions(), clearTrajectories()]);
}

/** 训练数据统计（供 UI 展示） */
export async function getTrainingStats(): Promise<{
  executions: number;
  successTrajectories: number;
  failedTrajectories: number;
}> {
  const [executions, trajectories] = await Promise.all([
    getAllExecutions(),
    getAllTrajectories(),
  ]);
  return {
    executions: executions.length,
    successTrajectories: trajectories.filter(t => t.success).length,
    failedTrajectories: trajectories.filter(t => !t.success).length,
  };
}

// ──── 注入 prompt 构建 ────

/**
 * 把检索到的案例构建为可注入 compile prompt 的参考文本。
 * DeepSeek 特化：
 *   - 只注入命令模式，不注入规格全文（省 token）
 *   - 明确"勿照搬数值"，避免低 temperature 下硬套参数
 */
export function buildExamplePrompt(record: ExecutionRecord): string {
  const cmdLines = record.commands.map(c => {
    if (c.op === "eval") return `- eval: ${(c as { cmd: string }).cmd}`;
    if (c.op === "slider") {
      const s = c as { name: string; min: number | string; max: number | string; value: number | string; unit?: string };
      return `- slider: ${s.name} (${s.min}~${s.max} 初值 ${s.value}${s.unit ? " " + s.unit : ""})`;
    }
    if (c.op === "vector") return `- vector: ${(c as { name: string }).name}`;
    return `- ${c.op}`;
  });

  return `【参考案例（仅参考命令模式，勿照搬其中的具体数值）】
上次类似需求 "${record.spec.slice(0, 40)}" 的成功命令：
${cmdLines.join("\n")}

现在需求与案例相似但参数可能不同。请根据【当前规格】的精确参数生成新命令，不要复制案例中的数值。`;
}
