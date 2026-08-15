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
import { openGGBDB } from "./ggbDB";
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

/** L2 场景记录：多个相似 L1 案例聚合的模式（结构可复用，参数可变） */
export interface SceneRecord {
  id: string;
  /** 代表规格（最热案例的 spec） */
  specSample: string;
  /** 模式命令（最热案例的 commands，slider 值视为可变） */
  pattern: Command[];
  /** 并入次数（≥2 才有注入价值） */
  heat: number;
  lastSeen: number;
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

// ──── IndexedDB 封装（共享库，schema 由 ggbDB 统一管理） ────

const STORE_NAME = "executions";
const SCENES_STORE = "scenes";
const MAX_RECORDS = 300; // 上限 300 条，超出删最旧

/** 场景聚合阈值：Jaccard ≥ 0.6 视为同场景并入 */
const SCENE_MERGE_THRESHOLD = 0.6;

function openDb(): Promise<IDBDatabase> {
  return openGGBDB().then(({ db }) => db);
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

/** 存储一条成功执行记录（静默失败，不阻断主流程），并聚合到 L2 场景 */
export async function storeExecution(record: ExecutionRecord): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
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

    // ★ L2 场景聚合：与现有场景聚类，并入或新建
    await upsertScene(record).catch(() => {});
  } catch {
    // 静默失败：训练库是锦上添花
  }
}

// ──── L2 场景聚合 ────

async function getAllScenes(): Promise<SceneRecord[]> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(SCENES_STORE, "readonly");
      const req = tx.objectStore(SCENES_STORE).getAll();
      req.onsuccess = () => resolve(req.result as SceneRecord[]);
      req.onerror = () => reject(req.error ?? new Error("读取场景失败"));
    });
  } catch {
    return [];
  }
}

async function putScene(scene: SceneRecord): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(SCENES_STORE, "readwrite");
      tx.objectStore(SCENES_STORE).put(scene);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("保存场景失败"));
    });
  } catch {
    // 静默
  }
}

/**
 * 纯函数：给定现有场景 + 新案例 spec，返回应并入的场景（Jaccard ≥ 阈值），
 * 无匹配返回 null（表示应新建场景）。抽成纯函数便于单测。
 */
export function findMergeTarget(scenes: SceneRecord[], spec: string): SceneRecord | null {
  const tokens = tokenize(spec);
  let best: SceneRecord | null = null;
  let bestScore = 0;
  for (const s of scenes) {
    const score = jaccardSimilarity(tokens, tokenize(s.specSample));
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return bestScore >= SCENE_MERGE_THRESHOLD ? best : null;
}

/**
 * L2 场景聚合：新成功案例与现有场景聚类（Jaccard ≥ SCENE_MERGE_THRESHOLD → 并入并 heat++），
 * 否则新建场景。并入时 pattern 更新为最新成功命令（最近最准）。
 */
async function upsertScene(record: ExecutionRecord): Promise<void> {
  const scenes = await getAllScenes();
  const target = findMergeTarget(scenes, record.spec);
  if (target) {
    await putScene({
      ...target,
      heat: target.heat + 1,
      lastSeen: Date.now(),
      pattern: record.commands,
    });
  } else {
    await putScene({
      id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      specSample: record.spec,
      pattern: record.commands,
      heat: 1,
      lastSeen: Date.now(),
    });
  }
}

/** 检索最相似场景（L2，优先于单案例注入） */
export async function searchScene(
  spec: string,
  threshold = 0.5
): Promise<SceneRecord | null> {
  const scenes = await getAllScenes();
  if (scenes.length === 0) return null;
  const tokens = tokenize(spec);
  let best: SceneRecord | null = null;
  let bestScore = 0;
  for (const s of scenes) {
    const score = jaccardSimilarity(tokens, tokenize(s.specSample));
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return bestScore >= threshold ? best : null;
}

/** 清空场景（供 clearAllData / UI） */
export async function clearScenes(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(SCENES_STORE, "readwrite");
      tx.objectStore(SCENES_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("清空场景失败"));
    });
  } catch {
    // 静默
  }
}

/**
 * 把场景模式构建为可注入 compile prompt 的参考文本。
 * 与单案例（buildExamplePrompt）的区别：场景标注"结构可复用、参数可变"，
 * 解决多案例硬套参数问题——AI 看到结构骨架，按当前规格填参数。
 */
export function buildScenePrompt(scene: SceneRecord): string {
  const cmdLines = scene.pattern.map(c => {
    if (c.op === "eval") return `- eval: ${(c as { cmd: string }).cmd}`;
    if (c.op === "slider") {
      const s = c as { name: string; min: number | string; max: number | string; value: number | string; unit?: string };
      return `- slider: ${s.name} (范围/初值可变${s.unit ? ", 单位 " + s.unit : ""})`;
    }
    if (c.op === "vector") return `- vector: ${(c as { name: string }).name} (from/to 可变)`;
    return `- ${c.op}`;
  });

  return `【已验证场景模式 — ${scene.heat} 次成功，命令结构可复用】
示例需求 "${scene.specSample.slice(0, 40)}" 的命令骨架：
${cmdLines.join("\n")}

★ 这是【结构模式】不是具体案例：slider 范围/初值、矢量坐标等参数必须根据【当前规格】的精确值重新计算，禁止复制场景中的数值。`;
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
  scenes: SceneRecord[];
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

/** 导出全部训练数据（执行样本 + 场景 + 轨迹）为备份对象 */
export async function exportAllData(): Promise<TrainingBackup> {
  const [executions, scenes, trajectories] = await Promise.all([
    getAllExecutions(),
    getAllScenes(),
    getAllTrajectories(),
  ]);
  return {
    version: 1,
    exportedAt: Date.now(),
    executions,
    scenes,
    trajectories,
  };
}

/** 导入训练数据备份，返回 (成功执行导入数, 场景数, 轨迹数) */
export async function importData(
  backup: Partial<TrainingBackup>
): Promise<{ executions: number; scenes: number; trajectories: number }> {
  const execCount = await importExecutions(backup.executions ?? []);
  const sceneCount = await importScenes(backup.scenes ?? []);
  const trajCount = await importTrajectories(backup.trajectories ?? []);
  return { executions: execCount, scenes: sceneCount, trajectories: trajCount };
}

/** 批量导入场景 */
async function importScenes(scenes: SceneRecord[]): Promise<number> {
  if (scenes.length === 0) return 0;
  try {
    const db = await openDb();
    return await new Promise<number>((resolve, reject) => {
      const tx = db.transaction(SCENES_STORE, "readwrite");
      const store = tx.objectStore(SCENES_STORE);
      for (const s of scenes) store.put(s);
      tx.oncomplete = () => resolve(scenes.length);
      tx.onerror = () => reject(tx.error ?? new Error("导入场景失败"));
    });
  } catch {
    return 0;
  }
}

/** 清空全部训练数据（执行样本 + 场景 + 轨迹） */
export async function clearAllData(): Promise<void> {
  await Promise.all([clearExecutions(), clearScenes(), clearTrajectories()]);
}

/** 训练数据统计（供 UI 展示） */
export async function getTrainingStats(): Promise<{
  executions: number;
  scenes: number;
  successTrajectories: number;
  failedTrajectories: number;
}> {
  const [executions, scenes, trajectories] = await Promise.all([
    getAllExecutions(),
    getAllScenes(),
    getAllTrajectories(),
  ]);
  return {
    executions: executions.length,
    scenes: scenes.length,
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
