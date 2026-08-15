/**
 * 共享 IndexedDB —— 统一管理 AiGGB 本地记忆库的 schema 与连接。
 *
 * 背景：trainingStore / trajectoryStore / trapStore 曾各自定义 openDb 且 DB_VERSION 相同，
 * 导致「谁先打开数据库、谁就决定 schema（store 集合）」的竞态——若 trainingStore 先建库，
 * traps / scenes / trajectories store 可能永远不会被创建，known_traps 等功能静默失效。
 * 修复：抽出唯一的 openDb，统一在此创建全部 4 个 store，所有模块共用同一套建表逻辑，
 *      db 版本进化只在此处管理。
 *
 * Node 环境（无 indexedDB）下 reject（带明确错误），调用方自行 catch 降级。
 */

export const DB_NAME = "aiggb";
// 共享 DB 版本：仅由本模块负责 bump。v2 = executions/scenes/trajectories；v3 = 统一建 traps（补全 schema）
export const DB_VERSION = 3;

/** 数据 store 清单：所有模块共用这张白名单 */
export const STORE_NAMES = ["executions", "scenes", "trajectories", "traps"] as const;

/** 事务内创建缺失的 store（onupgradeneeded 兜底幂等建表） */
function ensureStoreInUpgrade(db: IDBDatabase, name: string): void {
  if (!db.objectStoreNames.contains(name)) {
    const store = db.createObjectStore(name, { keyPath: "id" });
    store.createIndex("ts", "ts");
  }
}

/**
 * 打开共享库（全项目唯一入口）。onupgradeneeded 统一确保全部 store 存在。
 * 非浏览器环境 reject；调用方（各 store 模块）catch 后返回空/静默降级。
 */
export function openGGBDB(): Promise<{ db: IDBDatabase }> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB 不可用（非浏览器环境）"));
  }
  return new Promise<{ db: IDBDatabase }>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of STORE_NAMES) ensureStoreInUpgrade(db, name);
    };
    req.onsuccess = () => resolve({ db: req.result });
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open 失败"));
    req.onblocked = () => reject(new Error("IndexedDB 打开被阻塞（可能有旧连接未关闭）"));
  });
}
