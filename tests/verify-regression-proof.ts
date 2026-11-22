/**
 * 回归反证：证明 approve_all 覆盖显式 deny 的 bug 在旧实现中真实存在。
 * 把新旧两版循环逻辑并排跑，输入完全相同的决策，对比结果。
 */

const USER_DENIED_MSG = "用户拒绝了此操作";

type Decision = { action: "approve"; toolCallId: string } | { action: "deny"; toolCallId: string } | { action: "approve_all" };

interface Req { id: string; name: string }

/** 旧实现（改动前）—— 逐字复制自 HEAD 版本 */
function oldHandle(
  requests: Req[],
  decisions: Decision[],
  approveAll: boolean
): { executed: string[]; denied: string[] } {
  const decisionMap = new Map<string, Decision>();
  let approveAllRequested = false;
  for (const d of decisions) {
    if (d.action === "approve_all") approveAllRequested = true;
    else decisionMap.set(d.toolCallId, d);
  }

  const executed: string[] = [];
  const denied: string[] = [];
  let newApproveAll = approveAll;

  for (const req of requests) {
    if (newApproveAll) {
      executed.push(req.id);
      continue;
    }
    const decision = decisionMap.get(req.id);
    if (approveAllRequested && (!decision || decision.action !== "deny")) {
      newApproveAll = true;
      executed.push(req.id);
      continue;
    }
    if (!decision || decision.action === "deny") {
      denied.push(req.id);
      continue;
    }
    executed.push(req.id);
  }
  return { executed, denied };
}

/** 新实现（改动后）—— 两阶段判定 */
function newHandle(
  requests: Req[],
  decisions: Decision[],
  approveAll: boolean
): { executed: string[]; denied: string[] } {
  const decisionMap = new Map<string, Decision>();
  let approveAllRequested = false;
  for (const d of decisions) {
    if (d.action === "approve_all") approveAllRequested = true;
    else decisionMap.set(d.toolCallId, d);
  }

  const executed: string[] = [];
  const denied: string[] = [];
  let newApproveAll = approveAll;

  for (const req of requests) {
    const decision = decisionMap.get(req.id);
    const explicitDeny = decision?.action === "deny";
    const trustActive = newApproveAll || approveAllRequested;

    if (explicitDeny) { denied.push(req.id); continue; }
    if (trustActive) { newApproveAll = true; executed.push(req.id); continue; }
    if (!decision) { denied.push(req.id); continue; }
    executed.push(req.id);
  }
  return { executed, denied };
}

const reqs: Req[] = [
  { id: "tc-1", name: "eval_raw" },
  { id: "tc-2", name: "eval_raw" },
];

console.log("═══ 回归反证：approve_all 与显式 deny 共存 ═══\n");
console.log("场景：同批两个危险工具，用户点「信任此会话」，但明确拒绝了第 2 个\n");

const decisions: Decision[] = [
  { action: "approve_all" },
  { action: "deny", toolCallId: "tc-2" },
];

const o = oldHandle(reqs, decisions, false);
const n = newHandle(reqs, decisions, false);

console.log("【旧实现（改动前）】");
console.log("  执行了：", o.executed.join(", ") || "(无)");
console.log("  拒绝了：", o.denied.join(", ") || "(无)");
if (o.executed.includes("tc-2")) {
  console.log("  ❌ BUG 存在：tc-2 被用户明确拒绝，却仍被执行了！");
} else {
  console.log("  ✅ 无 bug");
}

console.log("\n【新实现（改动后）】");
console.log("  执行了：", n.executed.join(", ") || "(无)");
console.log("  拒绝了：", n.denied.join(", ") || "(无)");
if (!n.executed.includes("tc-2") && n.denied.includes("tc-2")) {
  console.log("  ✅ 修复有效：tc-2 被拒绝，未执行");
} else {
  console.log("  ❌ 修复无效");
}

console.log("\n═══ 结论 ═══");
if (o.executed.includes("tc-2") && !n.executed.includes("tc-2")) {
  console.log("改动前存在真实安全缺陷，改动后已修复 —— 这不是「代码整洁」，是行为修复。");
} else if (!o.executed.includes("tc-2")) {
  console.log("⚠️ 旧实现未复现 bug，说明我的修复理由需要重新核实。");
}
