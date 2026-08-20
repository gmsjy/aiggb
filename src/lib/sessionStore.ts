/**
 * 会话历史存储 —— 浏览器内保存用户的会话记录
 *
 * 每个会话保存完整状态：消息 + 构造日志 + 画布 base64 快照 + domain/agentMode/2D/3D，
 * 刷新/重启后可恢复，切换会话可回到任意历史场景继续编辑。
 *
 * 存储分层：
 *   - IndexedDB（aiggb v3 `sessions` store）：完整 Session 记录（含 messages + base64 快照）
 *   - localStorage：会话索引 + 当前会话 id（轻量，见 useAppStore 的 aiggb_sessions persist）
 *
 * 设计约束：
 *   - 纯浏览器 IndexedDB，Node 测试环境（无 indexedDB）下静默 no-op
 *   - 保存为 fire-and-forget（上层 `void` 调用），不阻塞 UI
 *   - 容量上限 MAX_SESSIONS，超出删最旧
 *   - 与 config（含 API Key）分离存储，不含任何敏感凭据
 */
import type { ChatTurn } from "../store/useAppStore";
import type { Domain } from "./prompts";

// ──── 会话类型 ────

export type GGBMode = "classic" | "3d";

export interface Session {
  /** 唯一 id（`s-ts-rand`） */
  id: string;
  /** 会话标题（自动：首条消息前 24 字；或用户重命名） */
  title: string;
  /** 创建时间戳 */
  createdAt: number;
  /** 最近更新时间戳（ts 索引，用于列表排序与容量淘汰） */
  updatedAt: number;
  domain: Domain;
  agentMode: boolean;
  ggbAppName: GGBMode;
  /** 完整消息历史 */
  messages: ChatTurn[];
  /** 成功命令日志（快照恢复失败时兜底重建画布） */
  constructionLog: string[];
  /** 画布 base64 快照（可能较大，存 IndexedDB 而非 localStorage） */
  canvasSnapshot: string | null;
}

/** 会话列表轻量元数据（列表 UI 用，避免加载完整快照） */
export interface SessionMeta {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  ggbAppName: GGBMode;
}

export function createSessionId(): string {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** 从消息生成默认标题（首条 user 消息前 24 字） */
export function titleFromMessages(messages: ChatTurn[], fallback = "新会话"): string {
  const first = messages.find(m => m.role === "user");
  if (!first) return fallback;
  const text = first.content.trim().replace(/\s+/g, " ");
  return text.length > 24 ? text.slice(0, 24) + "…" : text;
}

// ──── IndexedDB 封装（共享 aiggb DB，v3 新增 sessions store） ────

const DB_NAME = "aiggb";
const DB_VERSION = 3; // v2：executions/scenes/trajectories；v3：+sessions
const STORE_NAME = "sessions";
const MAX_SESSIONS = 30; // 最多 30 个会话，超出删最旧

let _dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB 不可用（非浏览器环境）"));
  }
  if (_dbPromise) return _dbPromise;

  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      // 共享 DB：升级时确保全部 store 存在（幂等，v2→v3 只补 sessions）
      const db = req.result;
      for (const name of ["executions", "scenes", "trajectories", "sessions"]) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: "id" });
          store.createIndex("ts", "ts");
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open 失败"));
  });
  return _dbPromise;
}

/**
 * 保存一个会话。容量超出 MAX_SESSIONS 时按 updatedAt 删最旧。
 * Node 环境 / 数据库异常时静默失败（不阻断主流程）。
 */
export async function saveSession(session: Session): Promise<void> {
  try {
    const db = await openDb();
    return await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(session);

      // 容量控制：超出 MAX_SESSIONS 时删最旧（按 updatedAt 升序）
      const countReq = store.count();
      countReq.onsuccess = () => {
        const count = countReq.result;
        if (count > MAX_SESSIONS) {
          const excess = count - MAX_SESSIONS;
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
      tx.onerror = () => reject(tx.error ?? new Error("保存会话失败"));
    });
  } catch {
    // 静默失败
  }
}

/** 读取单个会话（含完整 messages + 快照） */
export async function loadSession(id: string): Promise<Session | null> {
  try {
    const db = await openDb();
    return await new Promise<Session | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () => resolve((req.result as Session) ?? null);
      req.onerror = () => reject(req.error ?? new Error("读取会话失败"));
    });
  } catch {
    return null;
  }
}

/** 列出全部会话（轻量元数据，不含 messages/快照） */
export async function listSessions(): Promise<SessionMeta[]> {
  try {
    const db = await openDb();
    const all = await new Promise<Session[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result as Session[]);
      req.onerror = () => reject(req.error ?? new Error("列出会话失败"));
    });
    return all
      .map(s => ({
        id: s.id,
        title: s.title,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        messageCount: s.messages?.length ?? 0,
        ggbAppName: s.ggbAppName,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt); // 最近更新在前
  } catch {
    return [];
  }
}

/** 读取全部完整会话（供备份/导入） */
export async function getAllSessions(): Promise<Session[]> {
  try {
    const db = await openDb();
    return await new Promise<Session[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result as Session[]);
      req.onerror = () => reject(req.error ?? new Error("读取全部会话失败"));
    });
  } catch {
    return [];
  }
}

/** 删除单个会话 */
export async function deleteSession(id: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("删除会话失败"));
    });
  } catch {
    // 静默
  }
}

/** 清空全部会话 */
export async function clearAllSessions(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("清空会话失败"));
    });
  } catch {
    // 静默
  }
}

/** 备份会话数据为 JSON 字符串（下载/导出） */
export function serializeSessions(sessions: Session[]): string {
  return JSON.stringify({ version: 1, exportedAt: Date.now(), sessions }, null, 2);
}