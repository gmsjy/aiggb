# 借鉴 DeepSeek Harness 工具调用机制 —— 改进计划书

> **执行状态（2026-11-21）**：P0-C ✅、P0-A ✅（含查出的安全 bug 修复）、P1-E ✅、P2-B ✅ 已完成；P1-D 暂缓（需回放对比，风险中）。
> 测试基线：**323 单测全绿**（开工前 312），**回放 63/63 全绿**（优于文档记录的 ~59/63）。

> 依据：DSH `@deepseek-ai/dsh 0.2.2-rc.5`（Desktop / app.asar）官方文档
> 文档位置：`dsh/docs/{tool-execution-pipeline,tool-catalog,subsystems/tools,cookbook/adding-a-tool,cookbook/extension-cookbook}.zh.md`
> 审查对象：AiGGB `src/lib/{agentLoop,toolExecutor,tools,commandValidate,ggbBridge,prompts}.ts`
> 审查日期：2026-11-21

---

## 0. 执行摘要

上一轮口头建议中有 **2 处判断需要修正**，另有 **1 个新发现的真实缺陷**。修正后，真正值得落地的是 4 项，其中 2 项为高价值。

| 编号 | 项目 | 上一轮判断 | 审查后结论 | 优先级 |
|---|---|---|---|---|
| A | 统一工具决策类型 | 建议做 | ✅ 成立，且收益比预估更高 | **P0** |
| B | 失败分类 | 建议做 | ⚠️ **两次下调**：纠正通道已存在；失败分类也已存在（正则前缀匹配）。真实价值降为「消除静默失效风险」的重构 | P2 |
| C | SetColor 双路径值域矛盾 | 未提及 | 🆕 **新发现**：文档与代码矛盾，会误导维护者 | **P0** |
| D | 工具/prompt 体积精简 | 建议做 | ✅ 成立，已有实测数据支撑 | P1 |
| E | 有界输出（getRichSnapshot） | 建议做 | ✅ 成立，确认为无上限 | P1 |
| F | 单调 guard / 条件准入 / PTC / jobs | 部分建议 | ❌ **不采纳** | — |

---

## 1. DSH 机制摘要（作为设计参照）

DSH 把一次工具调用拆为一条分层流水线：

```
tools/pre-execute (瀑布)          可扩展策略：allow / deny / cancel / ask
  → guard (单调拒绝)              拒绝后后续监听器无法撤销
  → ctx.approval (ask 一次性应答)  无审批通道 → deny
  → tools/execute (环绕)          超时 / 重试 / 指标，仅可替换 exec.signal
  → 工具 execute()
  → tools/post-execute (瀑布)     accept / block(纠正反馈) / 加 context
  → tools/result (不可变观测)
  → 模型
```

三个关键设计取向：

1. **决策是类型化的，不是布尔值**。`PreToolDecision` 是四分支联合类型，`PostToolDecision` 区分 `accept`（替换内容或值，不可同时）与 `block`（转成带纠正反馈的 error）。
2. **参数不可改写**。历史、审计、UI、执行必须看到同一份参数——这排除了"策略层悄悄修正参数"的诱惑。
3. **身份不可变**。`callId`/`name`/`arguments`/`agent`/`token` 全程冻结，只有 `signal` 允许被环绕层替换。

配套的写作规范（`tool-design.md`）：每个事实只说一次；描述行为而非实现；参数规则写在参数上；改工具定义后测量首轮 token 变化。

---

## 2. 修正说明（上一轮的偏差）

### 2.1 修正 B：纠正反馈通道**已经存在**，不需要新建

上一轮说「post-execute 的纠正反馈通道，AiGGB 现在没有，建议新建」。**这是错的**。

实际代码里，`toolExecutor` 第 66–69 行的 preFlight 与第 712–715 行的 `correctCommand` + `validateGGBCommand` 已经在做这件事，且错误文本质量相当高，例如 `commandValidate.ts:483`：

```
r/g/b 是 **0~1 浮点**（引擎按 ×255 解析），230 应改为 0.902。
例如 (230, 50, 50) → (0.902, 0.196, 0.196)；写 0~255 整数会被钳成白色。
```

这已经比 DSH 的 `block { feedback }` 更贴合本领域（带换算后的具体值）。

**真正的缺口不是「有没有纠正反馈」，而是「失败没有被分类」。** 现在所有失败都走同一个 `formatResult(id, false, undefined, msg)`，返回 `{success:false, error:"..."}`。但 `agentLoop` 第 653 行只能靠 `error === USER_DENIED_MSG` 字符串比对来判断"用户拒绝"，其余一律算"工具失败"，直接进熔断计数。

具体后果：
- 参数校验失败（模型可自愈）与执行真失败（可能环境问题）计入同一个 `consecutiveFailures`。
- 工具名拼错、参数类型错这类"模型可自行修正"的错误，本该不计入熔断（给模型修正机会），现在会计入。
- 无法做统计（哪类错误最高频）。

**修正后的方案**：不做"新建纠正通道"，而是**给 `ToolResult` 加结构化失败类别**，让熔断判定与统计有依据。

### 2.2 修正 F：三项原建议不再采纳

| 原建议 | 不采纳原因 |
|---|---|
| 单调 guard | AiGGB 没有多插件竞争同一工具的场景；`checkSafety` 是单一来源，不需要"不可撤销"语义。引入反而增加一层间接。 |
| 条件准入 `when` | AiGGB 工具集是静态的，不存在"按 provider/model 动态裁剪"的需求；强行引入是为不存在的场景付复杂度。 |
| PTC / run_code / jobs | GGB 操作全部同步且在主线程，涉及画布一致性，后台化会破坏 `repaintGate` 的批处理语义。 |

---

## 3. 新发现（审查中查出的真实缺陷）

### 3.1 C：`SetColor` 有两条值域完全相反的路径，文档未区分

这是本次审查最重要的发现。

| 路径 | 值域 | 证据 |
|---|---|---|
| **GGB 脚本** `SetColor(obj, r, g, b)` | **0~1 浮点** | `commandValidate.ts:473` 注释：「5.4.927 实测：(0.9,0.2,0.2)→rgb(229,51,51) 正确；(230,50,50)→rgb(255,255,255) 全白」 |
| **JS API** `api.setColor(name, r, g, b)` | **0~255 整数** | `ggbBridge.ts:806` `hexToRgb` 用 `parseInt(hex,16)` 返回 0~255；`toolExecutor.ts:443` 直接传给 `api.setColor`；`tests/mockGGB.ts:322` 也是按 0~255 拼 hex |

两条路径**各自正确**，但项目文档只记了一条：

- `AGENTS.md` / `CLAUDE.md` 写「`SetColor` r/g/b 必须 **0~255 整数**（0~1 浮点是最高频误用，0.9→230）」——**这条是错的**，与代码实测注释完全相反。
- 同一份文档的下一句「透明度/填充率才是 0~1 小数」是对的。

**风险**：维护者按文档去"修" `commandValidate.ts`，会把正确逻辑改坏。

**修正**：重写文档表述，明确区分「脚本命令 0~1」与「JS API 0~255」，并说明这是 GeoGebra 的两套接口约定，不是笔误。

### 3.2 实测数据（用于支撑体积与预算决策）

用项目自身模块实测（`buildSystemPrompt` / `TOOL_DEFINITIONS`）：

```
Agent system prompt : 10,999 字符
Compile prompt      : 11,180 字符
TOOL_DEFINITIONS    : 11,217 字符（26 个工具）
```

**结论**：工具定义 JSON 已与整个 system prompt 等量。任何"给工具加长描述"的改动，成本与"重写整个 system prompt"同级。这为 P1 的体积精简提供了量化依据。

### 3.3 E：`getRichSnapshot` 确认为无界输出

`ggbBridge.ts:738-796` 遍历**全部**对象，逐对象输出名字/类型/定义/坐标/样式/标注/可见性，无条数上限、无截断标记。

**实际调用点共 3 处**：
- `agentLoop.ts:458` — `stateCheck` 每轮核对（最多 2 轮）
- `pipeline.ts:387` — 两阶段满足度评估
- `pipeline.ts:1101` — Agent 轮后评估

复杂场景（数十个对象）下单次快照可达数 KB。与 DSH「有界输出 + 显式截断标记」原则相悖。

---

## 4. 改进项详细计划

### P0-A｜统一工具决策类型

**目标**：把散在 `agentLoop` 的确认/拒绝逻辑收敛为类型化决策。

**现状**（`agentLoop.ts`）：
- `safeCalls` / `dangerousCalls` 二分（565 行附近）
- `approveAll` 会话级信任标志（376 行）
- `_confirmFn` 全局可变回调（183 行）
- 用户拒绝靠 `error === USER_DENIED_MSG` 字符串比对（653 行）
- `handleDangerousTools` 789–880 行约 90 行专门处理确认流程与悬挂 Promise

**目标形态**：

```ts
/** 工具调用前置决策（对齐 DSH PreToolDecision，裁掉不适用的分支） */
export type ToolDecision =
  | { kind: "allow" }
  | { kind: "deny"; reason: string; code: string }
  | { kind: "ask"; reason: string };
```

**实施步骤**：
1. 在 `tools.ts` 新增 `ToolDecision` 类型与 `resolveToolDecision(call, approveAll)`：由 `getToolSafety` + 安全拦截结果产出决策。
2. `agentLoop` 改为：先收集 `ToolDecision[]`，把 `ask` 批量送确认回调，其余直接执行——替代现有 safe/dangerous 双列表。
3. 保留 `approveAll` 语义（映射为对后续 `ask` 直接返回 `allow`）。
4. 取消/卸载路径用 `deny(code:"USER_CANCELLED")` 统一，替代现有手动 `resolve` 悬挂 Promise 的写法。

**风险**：确认对话框 UI 需同步（`ChatPanel.tsx` 的 `confirmDialog`）。改动集中在 `agentLoop` + `tools.ts` + `ChatPanel` 三处。

**验收**：现有 `agentLoop.test.ts` 的 6 条危险工具用例全部通过；新增「取消时无悬挂 Promise」用例。

---

### P0-C｜修正 SetColor 双路径文档矛盾

**目标**：消除会误导维护者的文档错误。

**实施**：
1. `AGENTS.md` / `CLAUDE.md` 的「属性命令」条目重写：

```
SetColor 有两条路径，值域相反，勿混：
- GGB 脚本 SetColor(obj,r,g,b) → 0~1 浮点（引擎 ×255 解析；写 230 会钳成白色）
- JS API api.setColor(name,r,g,b) → 0~255 整数（hexToRgb 产出，勿再 ÷255）
透明度/填充率（SetLineOpacity/SetFilling、api.setFilling）统一 0~1 小数。
```

2. `commandValidate.ts:443` 与 `ggbKB.ts:550` 的注释补一句「≠ api.setColor 的 0~255」。
3. 在 `docs/属性命令报错分析.md` 追加一节说明双路径。

**验收**：`test:replay` 与 `commandValidate.test.ts` 全通过（仅改注释与文档，不改判定逻辑）。

---

### P1-B（二次修正）｜把"字符串前缀判失败类型"换成结构化字段

**⚠️ 本节在审查中被两次下调优先级，最终定位为「健壮性重构」而非「新功能」。**

**审查实际发现**（`agentLoop.ts:645-672`）：参数类失败**已经**不计入熔断，用的是正则前缀匹配：

```ts
const PARAM_ERROR_RE = /^参数校验失败：/;
const PREFLIGHT_ERROR_RE = /^执行前检查失败：/;
// ...
recoverable: PARAM_ERROR_RE.test(error) || PREFLIGHT_ERROR_RE.test(error),
// 664-672：只有 hard（非 recoverable）失败才累加 consecutiveFailures
```

所以「模型拼错参数不会触发熔断」这个收益**已经实现了**，不是本项要新增的。

**真实缺口**：这套判定依赖**错误文案的字面前缀**。只要有人在 `toolExecutor` 里把
`参数校验失败：` 改成 `参数错误：`，熔断判定就会静默失效——而且不会有任何测试报错
（因为测试断言的是 `consecutiveFailures` 行为，不是字符串本身）。同理
`USER_DENIED_MSG` 也是靠 `error === "用户拒绝了此操作"` 全等比对。

**修正后的方案**（规模远比原计划小）：

```ts
export type ToolFailureKind = "args" | "safety" | "preflight" | "engine" | "denied" | "unknown";
```

1. `formatResult` 增加可选 `kind` 字段（保持向后兼容，`error` 文案不变）。
2. `agentLoop` 改成 `recoverable: parsed.kind === "args" || parsed.kind === "preflight"`，
   拒绝判定改成 `parsed.kind === "denied"`，删掉三个正则/字符串常量。
3. 错误文案可以自由改写，不再影响控制流。

**收益（如实修正）**：不是"提升成功率"，而是**消除一类静默失效风险**，并让失败统计成为可能。

**风险**：低。`formatResult` 调用点约 8 处，都是机械加字段；判定语义不变，现有测试应全绿。

---

### P1-D｜工具定义与 prompt 体积

**依据**：实测 `TOOL_DEFINITIONS` 11,217 字符 / 26 工具 ≈ 431 字符/工具。

**实施**：
1. 按 DSH `tool-design.md` 逐条审：删「模型从调用结果就能学到」的约束（如"文件不存在会失败"类），描述行为不描述实现。
2. 每个工具描述控制在 ~200 字符，参数描述 ≤40 字符。
3. 加测量脚本：对比改动前后 `JSON.stringify(TOOL_DEFINITIONS).length` 与实测首轮 prompt token。
4. **注意**：GGB 陷阱（Point+Point / SetColor / Min(a,b)）在 `agentLoop` system prompt、`prompts.ts`、`ggbKB.ts`、`commandValidate.ts` 四处出现。**其中 `commandValidate` 是运行时兜底（必须保留）**，`ggbKB` 是 RAG 参考（保留），可合并的是 `agentLoop` 与 `prompts.ts` 两处面向模型的提示。

**风险**：删提示可能降低首次成功率。**必须配套**跑 `test:replay`（63 用例）对比通过率，通过率下降则回滚该条。

---

### P2-E｜getRichSnapshot 有界输出

**实施**：
1. 加阈值（如 60 个对象 / 12KB 上限）。
2. 超限时输出：前 N 个对象 + `… 另有 M 个对象未列出（用 get_object_info 查询具体对象）`。
3. 显式标注截断，避免模型把"没列出"当成"不存在"。

**风险**：低。`stateCheck` 已容忍快照不完整。

---

## 5. 待确认项（实施前需先查证）

| # | 待确认 | 状态 |
|---|---|---|
| 1 | 参数类失败是否已不计入熔断？ | ✅ **已查证**：已实现，靠 `PARAM_ERROR_RE` / `PREFLIGHT_ERROR_RE` 正则前缀匹配（`agentLoop.ts:645-672`）。P1-B 因此从「新功能」降级为「健壮性重构」，见 §4 P1-B。 |
| 2 | `handleDangerousTools` 的 `approveAll` 与会话信任边界条件是否都有测试覆盖？ | ⬜ 未查证（P0-A 实施前需确认） |
| 3 | 63 回放用例当前基线（`tests/report.json` ~59/63）是否为最新？ | ⬜ 未查证（P1-D 对比前需重跑 baseline） |

---

## 6. 实施顺序与预估

| 阶段 | 内容 | 风险 | 预估 |
|---|---|---|---|
| 1 | P0-C 文档修正 | 极低（仅文档+注释） | 0.5h |
| 2 | P0-A 决策类型统一 | 中（触及确认流程） | 3h |
| 3 | P1-D 体积精简 | 中（需回放对比） | 3h |
| 4 | P1-E 有界输出 | 低 | 1h |
| 5 | P2-B 失败分类重构 | 低（纯重构，语义不变） | 1.5h |

**建议先做阶段 1**：零风险，且能立即消除一个会误导后续所有维护者的错误。

**不建议先做 P0-A**：它是唯一触及确认流程的改动，而 §5 第 2 项（`approveAll` 边界测试覆盖）尚未查证。建议先补测试再加重构。

---

## 7. 执行记录（2026-11-21 已完成）

### 已落地

| 项 | 实际改动 | 验证 |
|---|---|---|
| **P0-C** 文档修正 | `CLAUDE.md` 属性命令条目改为「0~1 浮点」（原文是错的「0~255」）；两份 agent 文档新增「SetColor 两条路径值域相反」专条；`commandValidate.ts` / `ggbKB.ts` 注释标注双路径 | 仅文档+注释，回放与单测全绿 |
| **P0-A** 决策语义修正 | **查出并修复安全 bug**：`approve_all` 会覆盖同批显式 `deny`（用户点拒绝仍被执行）。改为两阶段判定：显式 deny 最优先 → 信任与否决分离 → 无决策单独提示 | 新增 3 条边界测试（空决策 / 部分拒绝 / approve_all+deny 共存） |
| **P1-E** 有界输出 | `getRichSnapshot` 加 60 对象 / 12000 字符上限，截断时显式写「另有 N 个对象未列出，用 get_object_info 查询」 | 新增 4 条测试（该函数此前**零测试覆盖**） |
| **P2-B** 失败分类 | 新增 `ToolFailureKind`（args/safety/preflight/denied/engine/unknown）；`agentLoop` 熔断判定**只看 kind**，删除 `PARAM_ERROR_RE` / `PREFLIGHT_ERROR_RE` 两个正则 | 新增 4 条 kind 断言；文案改写不再影响控制流 |

### 执行中发现的问题（原计划未预见）

**P0-A 的执行暴露了一个真实安全缺陷**，这比原计划的"统一类型"更重要：

```ts
// 旧实现
for (const req of requests) {
  if (newApproveAll) { execute(req); continue; }   // ← 无条件放行
  ...
  if (approveAllRequested && ...) { newApproveAll = true; ... }  // ← 首个请求就置 true
}
```

处理第一个请求时 `approve_all` 即把 `newApproveAll` 置 true，后续请求的显式 `deny` 被循环顶部直接跳过。**用户明确点了"拒绝"的操作被执行了**。

这是 P0-A 从"代码整洁"升级为"必修"的原因，也印证了计划书 §5 的判断：先补测试再重构是对的。

### 未执行

**P1-D（工具/prompt 体积精简）暂缓**，原因：
- 它是唯一需要「改提示 → 跑 63 回放 → 对比通过率」的项，风险中；
- 当前回放 63/63 全绿，是很好的基线，但也意味着**任何提示精简都可能首次暴露退化**；
- 建议单独一轮做，且逐条改、逐条验，不要批量改。

## 8. 不采纳清单（明确记录，避免重复讨论）

| DSH 机制 | 不采纳理由 |
|---|---|
| 单调 `guard` | 无多插件竞争场景 |
| 条件准入 `when` | 工具集静态，无动态裁剪需求 |
| PTC mode / `run_code` | 无代码执行需求，GGB 操作为同步 API |
| `ctx.jobs` 后台任务 | 破坏主线程画布一致性与 `repaintGate` 批处理 |
| `presentCall/presentResult` 卡片联合类型 | UI 形态不同（确认对话框 ≠ 工具调用卡片），引入为过度设计 |
| `defineTool` 参数推导 | AiGGB 的 OpenAI schema + Zod 双份维护确有成本，但重构收益低于风险，暂不动 |
