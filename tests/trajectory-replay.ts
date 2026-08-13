/**
 * Trajectory Replay —— 用当前执行层重放历史轨迹（离线回归）
 *
 * 目的：验证「越用越强」—— 读取失败轨迹（IndexedDB 或导出 JSON），
 * 用【当前】执行层（executeToolCall + Pre-flight + 排序改进）逐个重放
 * assistant tool_calls，对比原始结果，统计"现在被修复"的比例。
 *
 * 用途：
 *   1. CLI：tsx tests/trajectory-replay.ts <backup.json>   ← 对导出文件跑回归
 *   2. 函数：replayTrajectory(rec)   ← 可被 UI / 测试复用
 *
 * 零 API 调用，纯离线（MockGGB + 真实 toolExecutor）。
 */
import { executeToolCall } from "../src/lib/toolExecutor";
import { MockGGB } from "./mockGGB";
import type { TrajectoryRecord } from "../src/lib/trajectoryStore";
import type { AgentMessage } from "../src/lib/aiClient";
import type { TrainingBackup } from "../src/lib/trainingStore";
import { pathToFileURL } from "node:url";

// ── 回放结果 ──

export interface ToolOutcome {
  toolName: string;
  /** 原始轨迹中该工具是否成功 */
  wasOk: boolean;
  /** 当前执行层重放是否成功 */
  nowOk: boolean;
  /** 重放失败时的错误文案 */
  error: string;
}

export interface ReplaySummary {
  userText: string;
  /** 全部工具调用结果 */
  outcomes: ToolOutcome[];
  /** 原始失败、现在成功（执行层改进的直接证据） */
  repaired: number;
  /** 原始失败、现在仍失败 */
  stillFailed: number;
  /** 原始成功、现在也成功（未退化） */
  stillOk: number;
  /** 原始成功、现在失败（退化！） */
  regressed: number;
}

/** 从轨迹 messages 提取全部 (tool_call, 原始结果) 对 */
function extractCalls(rec: TrajectoryRecord): Array<{
  tc: { id: string; name: string; arguments: string };
  wasOk: boolean;
}> {
  const calls: Array<{ tc: { id: string; name: string; arguments: string }; wasOk: boolean }> = [];
  const msgs = rec.messages as AgentMessage[];
  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i];
    if (m.role === "assistant" && m.tool_calls) {
      for (const tc of m.tool_calls) {
        // 找对应的 tool 响应（后续消息中 tool_call_id 匹配）
        const resp = msgs.slice(i + 1).find(x => x.role === "tool" && x.tool_call_id === tc.id);
        let wasOk = false;
        if (resp?.content) {
          try { wasOk = (JSON.parse(resp.content) as { success?: boolean }).success === true; } catch { wasOk = false; }
        }
        calls.push({ tc: { id: tc.id, name: tc.function.name, arguments: tc.function.arguments }, wasOk });
      }
    }
  }
  return calls;
}

/**
 * 用当前执行层重放一条轨迹。
 * 对每个 assistant tool_call 调用真实 executeToolCall（MockGGB 画布），
 * 对比原始结果与现在结果。
 */
export function replayTrajectory(rec: TrajectoryRecord): ReplaySummary {
  const mock = new MockGGB();
  const calls = extractCalls(rec);

  const outcomes: ToolOutcome[] = calls.map(({ tc, wasOk }) => {
    let nowOk = false;
    let error = "";
    try {
      const args = JSON.parse(tc.arguments) as Record<string, unknown>;
      const r = executeToolCall(mock, { id: tc.id, name: tc.name, arguments: args });
      nowOk = r.content.includes('"success":true');
      if (!nowOk) {
        try { error = (JSON.parse(r.content) as { error?: string }).error ?? ""; } catch { error = r.content.slice(0, 80); }
      }
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
    return { toolName: tc.name, wasOk, nowOk, error };
  });

  const repaired = outcomes.filter(o => !o.wasOk && o.nowOk).length;
  const stillFailed = outcomes.filter(o => !o.wasOk && !o.nowOk).length;
  const stillOk = outcomes.filter(o => o.wasOk && o.nowOk).length;
  const regressed = outcomes.filter(o => o.wasOk && !o.nowOk).length;

  return { userText: rec.userText, outcomes, repaired, stillFailed, stillOk, regressed };
}

/** 重放一组轨迹（全部失败轨迹），汇总修复统计 */
export function replayAll(records: TrajectoryRecord[]): {
  summaries: ReplaySummary[];
  totalRepaired: number;
  totalStillFailed: number;
  totalRegressed: number;
} {
  const summaries = records.filter(r => !r.success).map(replayTrajectory);
  return {
    summaries,
    totalRepaired: summaries.reduce((s, x) => s + x.repaired, 0),
    totalStillFailed: summaries.reduce((s, x) => s + x.stillFailed, 0),
    totalRegressed: summaries.reduce((s, x) => s + x.regressed, 0),
  };
}

// ── CLI 入口 ──

/**
 * 用法：tsx tests/trajectory-replay.ts <backup.json>
 * 从训练数据备份 JSON 读取全部失败轨迹，重放并输出报告。
 */
async function main(): Promise<void> {
  const file = process.argv[2];
  if (!file) {
    console.error("用法: tsx tests/trajectory-replay.ts <backup.json>");
    process.exit(1);
  }
  const backup = JSON.parse(await import("node:fs/promises").then(fs => fs.readFile(file, "utf8"))) as Partial<TrainingBackup>;
  const trajs = backup.trajectories ?? [];
  if (trajs.length === 0) {
    console.log("备份中无轨迹记录。");
    return;
  }

  const { summaries, totalRepaired, totalStillFailed, totalRegressed } = replayAll(trajs);
  console.log(`\n════ 失败轨迹回归（共 ${summaries.length} 条失败轨迹） ════\n`);
  for (const s of summaries) {
    const status = s.repaired > 0 ? "🛠 部分修复" : s.stillFailed === 0 ? "✅ 已修复" : "❌ 仍失败";
    console.log(`${status}「${s.userText.slice(0, 30)}」 修复${s.repaired} 仍败${s.stillFailed} 退化${s.regressed}`);
    for (const o of s.outcomes) {
      if (!o.wasOk) {
        const marker = o.nowOk ? "🛠" : "✗";
        console.log(`   ${marker} ${o.toolName}: ${o.wasOk ? "原成功" : "原失败"} → ${o.nowOk ? "现成功" : `现失败 ${o.error.slice(0, 60)}`}`);
      }
    }
  }
  console.log(`\n总计：修复 ${totalRepaired} | 仍失败 ${totalStillFailed} | 退化 ${totalRegressed}`);
}

// Node 直接运行时执行 CLI（精确主模块判断，避免被测试 import 时误触发）
const isMain =
  typeof process !== "undefined" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) void main();
