/**
 * sessionStore L1 单测 —— 会话历史数据层
 *
 * 用轻量 fake IndexedDB 覆盖真实 CRUD 逻辑（Node 无原生 indexedDB）：
 *   - saveSession / loadSession 往返
 *   - listSessions 轻量元数据 + 按 updatedAt 倒序
 *   - deleteSession / clearAllSessions
 * 纯函数：titleFromMessages / createSessionId / serializeSessions
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  saveSession,
  loadSession,
  listSessions,
  getAllSessions,
  deleteSession,
  clearAllSessions,
  createSessionId,
  titleFromMessages,
  serializeSessions,
  type Session,
} from "../src/lib/sessionStore";

// ──── 简易 fake IndexedDB（覆盖 openDb 用到的 API 子集） ────

/** 构造一个异步 req：queueMicrotask 后触发 onsuccess */
function makeReq<T>(resultGetter: () => T): Record<string, unknown> {
  const req: Record<string, unknown> = { result: undefined, onsuccess: null, onerror: null, error: null };
  queueMicrotask(() => {
    req.result = resultGetter();
    (req.onsuccess as (() => void) | null)?.();
  });
  return req;
}

class FakeObjectStore {
  map = new Map<string, unknown>();
  keyPath = "id";
  createIndex = () => {}; // ts 索引简化（容量淘汰 openCursor 返回 null，不测）
  index = () => ({ openCursor: () => makeReq(() => null) });
  getAll = () => makeReq(() => [...this.map.values()]);
  get = (k: string) => makeReq(() => this.map.get(k) ?? undefined);
  put = (v: Record<string, unknown>) => { this.map.set(v[this.keyPath] as string, v); return makeReq(() => undefined); };
  delete = (k: string) => { this.map.delete(k); return makeReq(() => undefined); };
  clear = () => { this.map.clear(); return makeReq(() => undefined); };
  count = () => makeReq(() => this.map.size);
}

class FakeDB {
  stores = new Map<string, FakeObjectStore>();
  /** 真实 IndexedDB 的 objectStoreNames 是 DOMStringList（含 contains 方法） */
  get objectStoreNames(): { contains: (n: string) => boolean } {
    return { contains: (n: string) => this.stores.has(n) };
  }
  createObjectStore(name: string, _opts: { keyPath: string }): FakeObjectStore {
    const store = new FakeObjectStore();
    store.keyPath = _opts.keyPath;
    this.stores.set(name, store);
    return store;
  }
  transaction(name: string): { oncomplete: (() => void) | null; objectStore: () => FakeObjectStore } {
    const tx: { oncomplete: (() => void) | null; objectStore: () => FakeObjectStore } = {
      oncomplete: null,
      objectStore: () => this.stores.get(name)!,
    };
    // 事务提交：queueMicrotask 触发 oncomplete（让 put/delete 同步操作先完成）
    queueMicrotask(() => tx.oncomplete?.());
    return tx;
  }
}

/** 注入 fake：open 通过 queueMicrotask 异步触发回调（对齐 openDb 设置 handler 的时序） */
function installFakeIndexedDB(): void {
  (globalThis as Record<string, unknown>).indexedDB = {
    open: (_name: string, _version: number) => {
      const req: Record<string, unknown> = {};
      queueMicrotask(() => {
        const db = new FakeDB();
        req.result = db;
        (req.onupgradeneeded as (() => void) | null)?.();
        (req.onsuccess as (() => void) | null)?.();
      });
      return req;
    },
  };
}

// 模块级 _dbPromise 缓存：整个测试文件共享一个 DB（save 后 load 可读回）
installFakeIndexedDB();

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: createSessionId(),
    title: "测试会话",
    createdAt: 1000,
    updatedAt: 1000,
    domain: "general",
    agentMode: false,
    ggbAppName: "classic",
    messages: [{ id: "m1", role: "user", content: "画一个单位圆" }],
    constructionLog: ["O = (0,0)", "c = Circle(O, 1)"],
    canvasSnapshot: "base64mockdata",
    ...overrides,
  };
}

test.afterEach(async () => {
  await clearAllSessions();
});

// ═══════════════════════════════════════════════════
// 纯函数
// ═══════════════════════════════════════════════════

test("titleFromMessages：取首条 user 消息前 24 字", () => {
  const title = titleFromMessages([{ id: "u", role: "user", content: "画斜抛运动 v0=20 仰角 45°，留轨迹并显示速度矢量" }]);
  assert.ok(title.length <= 25);
  assert.ok(title.startsWith("画斜抛运动"));
  assert.ok(title.includes("…"));
});

test("titleFromMessages：无 user 消息 → fallback", () => {
  assert.equal(titleFromMessages([]), "新会话");
  assert.equal(titleFromMessages([{ id: "a", role: "ask", payload: { question: "?" } }]), "新会话");
});

test("createSessionId：唯一且带 s- 前缀", () => {
  const a = createSessionId();
  const b = createSessionId();
  assert.ok(a.startsWith("s-"));
  assert.notEqual(a, b);
});

test("serializeSessions：JSON 序列化往返", () => {
  const s = makeSession();
  const raw = serializeSessions([s]);
  const parsed = JSON.parse(raw) as { version: number; sessions: Session[] };
  assert.equal(parsed.version, 1);
  assert.equal(parsed.sessions.length, 1);
  assert.equal(parsed.sessions[0].messages[0].role, "user");
});

// ═══════════════════════════════════════════════════
// CRUD（fake IndexedDB）
// ═══════════════════════════════════════════════════

test("saveSession + loadSession 往返：完整字段保留", async () => {
  const s = makeSession();
  await saveSession(s);
  const loaded = await loadSession(s.id);
  assert.ok(loaded);
  assert.equal(loaded!.id, s.id);
  assert.equal(loaded!.title, "测试会话");
  assert.equal(loaded!.domain, "general");
  assert.equal(loaded!.ggbAppName, "classic");
  assert.deepEqual(loaded!.messages, s.messages);
  assert.deepEqual(loaded!.constructionLog, s.constructionLog);
  assert.equal(loaded!.canvasSnapshot, "base64mockdata");
});

test("saveSession 覆盖：同 id 再保存更新内容", async () => {
  const s = makeSession();
  await saveSession(s);
  await saveSession({ ...s, title: "已更新", messages: [] });
  const loaded = await loadSession(s.id);
  assert.equal(loaded!.title, "已更新");
  assert.equal(loaded!.messages.length, 0);
});

test("listSessions：返回轻量 meta 且按 updatedAt 倒序", async () => {
  await saveSession(makeSession({ id: "s1", title: "旧", updatedAt: 100 }));
  await saveSession(makeSession({ id: "s2", title: "新", updatedAt: 200 }));
  const metas = await listSessions();
  assert.equal(metas.length, 2);
  assert.equal(metas[0].id, "s2"); // 最近更新在前
  assert.equal(metas[0].messageCount, 1);
  assert.equal(metas[0].ggbAppName, "classic");
  // meta 不含完整消息/快照
  assert.equal("messages" in metas[0], false);
});

test("deleteSession：删除后 load 返回 null", async () => {
  const s = makeSession();
  await saveSession(s);
  await deleteSession(s.id);
  assert.equal(await loadSession(s.id), null);
});

test("clearAllSessions：清空后 list 为空", async () => {
  await saveSession(makeSession());
  await saveSession(makeSession());
  await clearAllSessions();
  assert.equal((await listSessions()).length, 0);
});

test("getAllSessions：返回完整记录（含快照）", async () => {
  const s = makeSession();
  await saveSession(s);
  const all = await getAllSessions();
  assert.equal(all.length, 1);
  assert.equal(all[0].canvasSnapshot, "base64mockdata");
});

test("loadSession 不存在的 id → null（不抛错）", async () => {
  assert.equal(await loadSession("s-nonexistent"), null);
});
