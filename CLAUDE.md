# AiGGB — 项目知识库（CLAUDE.md）

> 本文档是给 AI agent 使用的项目梳理，描述了当前代码实现的功能与架构。
> 详细规格见 [SPEC.md](SPEC.md)，使用说明见 [README.md](README.md)。

## 项目一句话

**纯前端** Web 应用：用户用自然语言描述数学/物理/几何场景，AI 生成 GeoGebra 命令，在内嵌 GeoGebra 画布中渲染为可交互动态图像。React 19 + Vite 8 + PWA，零后端。

## 核心架构：两阶段流水线

```
用户输入 → [Phase 1 精炼] → 规格确认气泡 → [Phase 2 编译+自检] → GGB 命令 → 执行
              (flash)         (用户审阅)         (pro)
```

### 交互流程（用户视角）

1. 用户输入需求（如"画斜抛运动 v0=20 仰角 45°"）
2. **Phase 1**：`chatRaw` + `buildRefinePrompt` 调用轻量模型 → 生成详细分节绘图规格（JSON `{"spec":"..."}`）
3. **规格确认气泡**（`spec-review` 消息类型）：用户可 **编辑** / **重新生成** / **确认绘制**
4. **Phase 2**：确认后 `chat` + `buildCompilePrompt` 调用主力模型 → 精炼规格编译为 GGB 命令 JSON（含 `self_check` 自检字段）
5. `batchCorrect`（RAG 纠正器）修正臆造命令 → `executeCommands` 逐条执行 → 失败走修复回路

### 关键控制流

- **编排核心已抽取**：ChatPanel 的两阶段逻辑整体移入 `src/lib/pipeline.ts`（纯 TS 状态机，零 React 依赖，支持依赖注入可 node 单测）。ChatPanel 只负责输入 UI、消息渲染、store 依赖注入、规格确认事件桥接。
- **并发锁**：`runningRef`（useRef）只在 `runRound` 一处获取/释放。`runPipeline` 返回的 Promise 在整个流程（含确认等待 / 降级 / 重试 / 取消）结束前不 resolve，锁在 finally 统一释放。
- **取消机制**：`runControl.ts` 的 `beginRun()` 提供本轮 AbortSignal；Toolbar「清空/切 2D↔3D/撤销」调用 `abortCurrentRun()` 取消请求。spec-review 等待气泡订阅 `onRunCancelled`，取消时同步释放锁，避免锁悬挂；catch 里用 `wasAborted()` 静默吞掉 AbortError。
- **Phase 2 防双击**：`phase2Guard` 标志防止快速双击"确认绘制"触发并发 Phase 2。
- **Phase 1 降级**：规格为空/解析失败/API 异常 → 回退 `runSinglePhase`（旧的一步到位逻辑保留在 pipeline.ts 中）。
- **事件通信**：确认/重试通过 `window.dispatchEvent(new CustomEvent("aiggb:spec-confirm" / "aiggb:spec-retry"))` 从气泡传回 ChatPanel，`reviewHandleRef` 路由到当前轮的 `ReviewHandle`。
- **失败回滚（全失败时）**：优先恢复执行前 base64 快照（3s 超时兜底）；快照缺失/超时 → `newConstruction` + 重放 `constructionLog`（store 维护的成功命令日志，`resetTmpIds` 复位临时对象计数）。

## 目录结构与职责

### src/lib/（核心逻辑，纯 TS，无 React 依赖）

| 文件 | 职责 | 关键导出 |
|---|---|---|
| `aiClient.ts` | OpenAI 兼容调用 | `chat(config, msgs, signal?, modelOverride?, onUsage?)` 返回 schema 校验后的 `AIResponse`（`reasoningEffort` 设置时对支持 thinking 的 provider 发送 `reasoning_effort`；`onUsage` 回传 token 用量供 AB 统计）；`chatRaw(...)` 返回纯文本（Phase 1 用）；`agentChat(...)` Agent **流式**工具调用（SSE 增量解析 tool_calls + `onContent` 内容回调 + `onReasoning` 思考增量回调 + JSON 兼容回退 + `max_tokens`）；`ping()` 连接测试；`AIConfig`（**3-role 模型**：`model` 主力 / `lightModel?` 轻量 / `agentModel?` Agent，`flashModel?` 已 deprecated；`reasoningEffort?` 思考深度 low/medium/high）；`resolveLightModel`/`resolveAgentModel` 解析回退链；`ChatMessage`、`AIError`、`AISchemaError` |
| `pipeline.ts` | **两阶段流水线状态机**（从 ChatPanel 抽取） | `runPipeline(userText, deps, cb)`（Phase 1→确认→Phase 2→修复→**满足度评估**）、`ReviewHandle`/`ReviewDecision`、`PipelineDeps`（依赖注入接口，含 3-role 模型解析 + `appMode`）、`PipelineCallbacks`、`MAX_REPAIR=2`、`MAX_FORMAT_RETRY=2`、`HISTORY_WINDOW=6`、`parseRefinedSpec`、`collectHistory`；内部 `runSinglePhase`/`runPhase2`/`executeAndRepair`/`applyRagCorrection`/`chatWithFormatRetry`；Phase 2 调用 `executeCommands(api, cmds, deps.appMode)`；`requestAnimationFrame` 用 `typeof` 守卫兼容 Node.js 单测 |
| `runControl.ts` | 单轮运行生命周期 | `beginRun()`（返回本轮 AbortSignal）、`abortCurrentRun()`（清空/切模式/撤销时取消请求）、`onRunCancelled(cb)`（spec-review 等待气泡订阅取消）、`wasAborted()`、`endRun()` |
| `prompts.ts` | System Prompt 构建 | `buildSystemPrompt(domain, appMode, phase="full"\|"compile")`、`buildCompilePrompt`、`buildCheckerPrompt`（修复角色）、`buildRepairMessage`、`buildFormatRepairMessage`；compile 模式含 **self_check 自检指令**；`Domain = "general"\|"physics"` |
| `refinePrompt.ts` | Phase 1 精炼 prompt | `buildRefinePrompt(domain)` — 输出 JSON `{"spec":"<分节规格>"}`，含物理默认值 |
| `schema.ts` | AI 输出 Zod 校验 | `Command`（discriminatedUnion，14 op）、`AIResponse`（含 `ask`、`self_check`）、`NumLike`/`BoolLike`/`IntLike` 容错、`SafeCmd`（臆造命令硬黑名单 + XSS 过滤）、`CoordExpr`（vector/forceDiagram 坐标表达式注入防护）、`withTextSafety`（caption/label/unit 文本安全）；`superRefine` 做 slider/view 语义 + ask 互斥校验 |
| `ggbKB.ts` | **RAG 命令知识库** | `GGB_COMMAND_DEFS`（~126 条命令：签名/参数/2D3D 适用）、`HALLUCINATION_MAP`（25 条臆造→正确映射）、`buildCommandReference(mode, domain)`、`buildHallucinationWarnings(mode)`、`findCommand`、`findHallucination` |
| `commandCorrect.ts` | 后置命令纠正器 | `correctCommand(cmd)`（Levenshtein ≤2 模糊纠正 + 臆造查表 + 参数个数校验）、`batchCorrect()`、`correctionsToRepairContext()` |
| `specSchema.ts` | Phase 1 输出校验 | `RefinedSpec`（`{title?, spec?, ask?}`，spec/ask 互斥）、`formatSpecError` |
| `specCache.ts` | 意图→规格缓存 | `lookupCachedSpec`/`storeCachedSpec`（模板精确匹配优先 + 存储精确键）、**`SpecStorage` 注入接口 + `createMemoryStorage()`（供单测）**；LRU ≤50 条、TTL 30 天、键含画布对象指纹（排除 `_` 前缀临时对象与物理常量，保证同场景稳定命中） |
| `commands.ts` | 命令白名单/黑名单/流程 | `GGB_COMMANDS`、`GGB_FORBIDDEN_COMMANDS`（硬黑名单，被 schema 引用）、`GGB_5STAGE_FLOW`（参数→点→图形→动画→属性） |
| `physics.ts` | 物理常量 + 配色 | `PHYSICS_CONSTANTS`（g/c/e/eps0/mu0/k_e/Grav/h/k_B）、`PHYSICS_COLORS`（位移蓝/速度绿/加速度橙/力红/电场紫/磁场青） |
| `templates.ts` | 12 个一键模板（物理 2D 4 + 数学 2D 4 + 3D 4） | `Template {id, icon, title, subtitle, prompt, domain, mode}`；prompt 即精炼规格，天然命中 specCache |
| `ggbBridge.ts` | op → GGB API 执行器 | `executeCommands(api, commands, appMode?)` — **2D/3D 统一启用 `setRepaintingActive` 批量渲染**（升级官方 5.4.927.1 后 DockGlassPane 已不复发，禁用会导致代数区闪烁）；`collectFailures`、**`resetTmpIds`**（vector 容错重试时复位临时对象计数）、`exportGGB`/`exportPNG`、`registerAppNameSetter`/`switchAppletMode`（2D↔3D）|
| `agentLoop.ts` | **ReAct Agent 工具调用循环** | `runAgentLoop(userText, deps)` — observe→plan→act 循环，最大 30 次迭代，**每轮刷新 api 句柄**（防 applet 重建失效）、**连续 3 轮工具失败熔断**（`MAX_CONSECUTIVE_FAILURES`，参数/预检错误不计入）、全拒绝判定按**本轮**被拒数（避免跨轮累积误触发）、危险工具确认按 `toolCallId` 匹配；**`onThinking` 回调**（分析/规划/执行工具/等待确认 4 个节点 + **V4 thinking 实时展示** `🧠` 推理增量）实时上报思考步骤，经 pipeline 透传 UI 减少等待焦虑；`reasoning_content` 回传受 `mustRoundtripReasoning` quirk 门控、空响应诊断按 `streamsFinishReason` 判断截断提示；`registerConfirmationHandler`/`unregisterConfirmationHandler` 危险工具确认注入；`AgentLoopDeps`（含 `agentModel`）、`AgentLoopResult` |
| `toolExecutor.ts` | Agent 工具 → GGB API 分发 | `executeToolCall(api, call)`/`executeToolCalls(api, calls, appMode?)` — 批量执行 2D/3D 统一启用；`setPerspective("3d")` 通过 `getPerspectiveXML()` 检测已 3D 则跳过（防 DockGlassPane）；~20 个工具 case（create_point/slider/vector/style/animation…）|
| `tools.ts` | 工具 Function Calling 定义 | `TOOL_DEFINITIONS`（OpenAI tool schemas）、`TOOL_SCHEMAS`（Zod 校验）、`getToolSafety(name)` → `"safe"\|"dangerous"`；dangerous 工具（eval_raw/delete/clear）需用户确认 |
| `satisfactionEval.ts` | Phase 3.1 满足度评估 | `evaluateSatisfaction(config, spec, snapshot, signal?, modelOverride?)` — 轻量模型对比画布快照与精炼规格，输出 `SatisfactionResult{satisfied, issues[], summary}`；失败不阻断流程 |
| `providers.ts` | 6 预置 provider + 自定义 | `PROVIDER_PRESETS`（DeepSeek/Moonshot/GLM/SiliconFlow/OpenAI/Ollama） |
| `format.ts` | 数字格式化工具 | `fmtTokens(n)` — token 用量 k/M 缩写（顶栏 + 统计图共用） |

### src/components/（React UI）

| 文件 | 职责 |
|---|---|
| `ChatPanel.tsx` | 编排已提取至 pipeline.ts，本组件只负责：输入 UI、消息渲染、**store 依赖注入成 `PipelineDeps`**、spec 确认事件桥接（`reviewHandleRef`）、**Agent 思考步骤实时显示**（`agentStep` state + `onAgentStep` → thinking 区域）|
| `MessageBubble.tsx` | 消息气泡：user/assistant/error/ask/**spec-review**（规格确认 UI：编辑/重新生成/确认绘制）+ **assistant 渲染 self_check 报告** |
| `GGBCanvas.tsx` | GeoGebra applet 注入，监听 `ggbAppName` 重建（2D↔3D）；**心跳监控**（2s 间隔 canvas 计数 + DockGlassPane 检测）+ **自动恢复**（保存 base64 快照 → `inject(force=true)` 强制重建 → 恢复快照）；MutationObserver DOM 监控 + WebGL context loss 监听；诊断日志前缀 `[AiGGB:DIAG]` |
| `Toolbar.tsx` | 顶栏：domain 切换/模板/撤销/清空/导出/截图/复制/安装 + **token-stat 会话累计用量胶囊**；清空/切模式/撤销时调用 `abortCurrentRun()` |
| `SettingsDialog.tsx` | API 配置（Provider/Key/**3-role 模型**：主力/轻量/Agent/**思考深度**/温度/测试连接）+ **「用量统计」区**（累计输入/输出/合计 + TokenUsageChart）|
| `TokenUsageChart.tsx` | token 用量统计图（SVG 手绘：堆叠柱状图 prompt/completion 分色 + 累计折线，两个小图单一 Y 轴 + 原生 hover tooltip）|
| `ScriptPanel.tsx` | 右侧实时 GGB 脚本展示（可折叠/复制/下载）|
| `TemplateGallery.tsx` | 模板卡片，点击发 `aiggb:send` 事件 |
| `PWAUpdatePrompt.tsx` | SW 更新提示 |

### src/store/useAppStore.ts

- Zustand + persist **version 3**，存储键 `aiggb_config`
- 持久化：`config`（含 3-role 模型 `model`/`lightModel`/`agentModel`）、`domain`、`privacyAcknowledged`
- 迁移 v2→v3：`flashModel` → `lightModel` 自动迁移
- 运行期：`ggbApi`、`ggbAppName`（"classic"\|"3d"）、`messages`、**`constructionLog`**（成功命令日志，供回滚兜底重建）、`isThinking`
- **token 用量统计**：`tokenUsage`（会话累计，顶栏显示）、`roundTokenUsage`（本轮累计）、`tokenHistory`（每轮对话一条，持久化 localStorage `aiggb_token_usage`，最多 100 轮）；`addTokenUsage`/`startRound`/`finishRound`/`loadTokenHistory`；轮次边界由 ChatPanel `runRound` 开始/结束驱动
- `ChatTurn` 五类：`user` / `assistant`（含 `self_check?`）/ `ask` / `error` / **`spec-review`**
- `appendAIResponse` 维护 constructionLog（成功命令追加）；`clearMessages`/`undoLastTurn` 同步清空/重建日志（`logFromMessages`）

## AI ↔ GGB 协议（14 个 op）

| op | 用途 |
|---|---|
| `eval` | 任意合法 GGB 命令 |
| `slider` | 创建滑块（含 unit/label 物理量标注）|
| `animate` | 开/关动画（speed、repeat: oscillating/increasing/once）|
| `trace` / `physicsTrace` | 轨迹（trail/stroboscopic）|
| `style` | 颜色/粗细/可见/透明/虚线 |
| `view` | 视窗范围 + 轴单位 |
| `caption` / `delete` / `reset` | 标注/删除/清空 |
| `vector` / `forceDiagram` | 物理矢量箭头 / 力图基元 |
| `unitAxes` | 带单位坐标轴 |
| `constants` | 物理常量注入（白名单）|

Schema 校验失败 → `chatWithFormatRetry`（≤2 次格式重试，raw + detail 反馈 AI）；执行失败 → `buildCheckerPrompt` 修复回路（≤2 次，快照/日志回滚 + 符号表注入 + RAG 纠正注入）。Phase 2 输出含 `self_check` 自检报告，assistant 气泡渲染。

## 防漂移六层

1. **提示层**：`prompts.ts` + RAG 过滤的命令参考/臆造警告 + 5 阶段流程 + Point/Vector 类型铁律
2. **自检层**：compile prompt 强制 AI 输出 `self_check`（逐项核对白名单/3D 禁用/Point+Vector/除零/参数个数）
3. **清洗层**：`aiClient` stripCodeFence（BOM 剥离 + 去 code fence）
4. **校验层**：`schema.ts`（臆造命令硬黑名单、slider/view 语义、ask 互斥、forceDiagram.vec 形态、CoordExpr 注入防护、withTextSafety 文本安全）
5. **纠正层**：`commandCorrect`（Levenshtein 模糊纠正 + 臆造映射 + 参数校验）
6. **执行层**：`ggbBridge`（animate/trace 目标存在预检、vector Point+Point 自动重写）+ 修复回路

## Agent 模式（ReAct 工具调用回路）

除两阶段流水线外，系统还支持 **Agent 模式**：AI 通过 OpenAI Function Calling 逐步调用工具在画布上构造图形。

```
用户输入 → runAgentLoop → observe（画布状态）→ plan（选择工具）→ act（执行工具）
                                ↑                                  ↓
                                └──────── 观察结果 ←────────────────┘
```

### 关键文件

| 文件 | 职责 |
|---|---|
| `agentLoop.ts` | ReAct 循环主控：`runAgentLoop()` 最多 30 次迭代，`executeSafeTools`/`handleDangerousTools` 分发，`truncateHistory` 截断 + 修复消息配对 |
| `toolExecutor.ts` | 工具分发：~18 个 case（create_point/slider/vector/circle/polygon/segment/function/parametric/text/trace/set_style/animation/view/delete/eval_raw/eval_sequence/physics_constants/set_unit_axes/clear）；Zod 校验 + 安全拦截 + RAG 纠正 |
| `tools.ts` | 工具定义：`TOOL_DEFINITIONS`（OpenAI tool schemas）+ `TOOL_SCHEMAS`（Zod）+ `getToolSafety()` |

### 工具安全分级

- **safe**：create_*/set_*/list_*/get_* — 无需确认直接执行
- **dangerous**：`eval_raw`、`eval_sequence`、`delete_object`、`clear_canvas` — 需用户确认（或信任会话后自动通过）

### Agent 模式 vs 流水线模式

| | 流水线模式 | Agent 模式 |
|---|---|---|
| 入口 | `runPipeline()` | `runAgentLoop()` |
| AI 调用 | `chat()` 单次返回 commands JSON | `agentChat()` 多次流式返回 tool_calls |
| 执行方式 | 批量 `executeCommands` | 逐步 `executeToolCall` |
| 错误恢复 | 批量失败 → checker prompt 修复 | 单步失败 → AI 观察 error 自行调整 |
| 适用场景 | 已知需求的快速生成 | 复杂多步构造、探索性绘图 |

### Agent 模型配置

`AgentLoopDeps.agentModel` 由 `resolveAgentModel(config)` 解析（`agentModel` → `model` 回退链），支持独立于主力/轻量模型的第三角色。

## 3D 画布稳定性（DockGlassPane 修复与恢复系统）

### 根因

GeoGebra web3d 内部使用 `DockGlassPane`（一个 DIV 遮罩层）处理视图切换动画。以下操作会触发 `DockGlassPane` 接管 3D 视图 iframe，且动画有时不完成 → iframe 永久消失 → 所有 canvas 归零：

- `api.setPerspective("3d")` 在已有 3D 透视时重复调用
- `api.setRepaintingActive(true)` 在 3D 模式下触发内部布局重组

### 三层防御

| 层 | 位置 | 机制 |
|---|---|---|
| **预防 #1** | `toolExecutor.ts:set_view` | `api.getPerspectiveXML()?.includes("3D")` 检测已是 3D → 跳过 `setPerspective("3d")` 调用 |
| **预防 #2** | `ggbBridge.ts:executeCommands` | `setRepaintingActive` 批量包裹 **2D/3D 统一启用**（升级 5.4.927.1 后 DockGlassPane 已不复发，禁用会导致代数区闪烁）|
| **预防 #3** | `toolExecutor.ts:executeToolCalls` | Agent 模式同样统一启用 batch；`setPerspective("3d")` 保留已 3D 则跳过的守卫 |
| **恢复** | `GGBCanvas.tsx:heartbeat` | 2s 间隔心跳监控 canvas 数量 + DockGlassPane DOM 检测 → 自动硬重建 |

### 心跳恢复流程

```
心跳 (2s) → 检测 objCount>0 && canvas===0 && DockGlassPane 存在
  → containerEl.style.visibility = "hidden"  (抑制闪烁)
  → api.getBase64(cb)  保存快照（3s 超时兜底）
  → inject(w, h, force=true)  强制销毁 + 重建 applet
  → setBase64(snapshot)  恢复画布内容
  → containerEl.style.visibility = ""  恢复可见
```

- **`force` 参数**：`inject(w, h, force)` — `force=true` 时跳过 `getObjectNumber()>0` 的保留检查，直接销毁重建
- **闪烁抑制**：重建期间容器 `visibility:hidden`，快照恢复后恢复可见
- **DockGlassPane 专用路径**：检测到 DockGlassPane 直接走硬重建，不尝试软恢复（`refreshViews`/`setPerspective` 无效且自身也可能触发新 DockGlassPane）

### 诊断日志规范

所有画布相关的诊断日志使用 `[AiGGB:DIAG]` 前缀，便于过滤：

```
[AiGGB:DIAG] 心跳: canvas 9→0 ⚠DockGlassPane!
[AiGGB:DIAG] GGB 容器 DOM 变化: +1 -0
[AiGGB:DIAG] inject() — getObjectNumber()=33 mode=3d
[AiGGB:DIAG] executeCommands: 开始执行 5 条命令, batch=false canvas=9
```

### MutationObserver

`GGBCanvas.tsx` 在 `ggb-container` 上注册 `MutationObserver`（`childList + subtree + attributes`），记录：
- 子元素增删（+N -N），含节点 tagName/id/className
- canvas 元素数量变化
- 属性变化（style/class/hidden/width/height）

用于事后诊断画布 DOM 被谁操作。

## 测试（tests/）

| 命令 | 层 | 说明 |
|---|---|---|
| `npm run test:replay` | L1 | 离线回放 63 用例（14 类别，含 highschool 3D），0 API 调用 |
| `npm run test:smoke` | L2 | 在线冒烟 5 用例 |
| `npm run test:record` | L3 | 在线全量 63 用例 + 覆盖 fixtures |
| `npm run test:drift` | — | 漂移监控 N=10（需 .env 真实 Key）；`DRIFT_THINKING=high` 开 thinking 跑（A/B 用）；核心 `runDrift()` 已导出供 AB 复用，统计含 token 用量 |
| `npm run test:ab` | — | **A/B 测试**：`reasoning_effort=high` vs baseline 同用例对比（端到端/延迟/token 成本），输出 `tests/ab-report.json` |
| `npm run test:visual` | — | Playwright 截图（physics,dynamic,composite）|
| `npm run prompt:iterate` | — | Prompt 迭代工作流 |
| **单测** | — | `tests/pipeline.test.ts`、`tests/specCache.test.ts`、`tests/satisfactionEval.test.ts`、`tests/agentLoop.test.ts`（ReAct 状态机，注入 mock）、`tests/ggbBridge.test.ts`、`tests/toolExecutor.test.ts`、`tests/ggbKB.test.ts`、`tests/trainingStore.test.ts`、`tests/trapStore.test.ts` 等（0 API）|

关键文件：`tests/runner.ts`（运行器）、`tests/mockGGB.ts`（轻量 GGB mock）、`tests/cases.json`（用例）、`tests/assertions.ts`（12 维断言）、`tests/fixtures/`（回放数据）。

**注意**：`test:record` 会覆盖 `tests/fixtures/`。基准 `tests/report.json` 当前 ~59/63（highschool 3D 是主要拉分项）。

## 环境

- `.env` 放测试密钥：`DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL`（默认 v4-flash）、`DEEPSEEK_BASE_URL`
- 模型：日常 flash（快）、复杂/3D 场景 pro；两阶段 Phase 1 用 flash，Phase 2 用主模型

## GeoGebra 库本地化（自托管，官方 bundle）

- **GeoGebra Math Apps Bundle 随构建打包**（`public/GeoGebra/`，~116MB），**完全离线，不依赖 CDN**：
  - 结构遵循官方：`GeoGebra/deployggb.js` + `GeoGebra/HTML5/5.0/{web,web3d,webSimple,css}`（官方 bundle zip 解压后整体放入 `public/`）
  - `index.html` 引 `./GeoGebra/deployggb.js`（非 CDN）
  - `GGBCanvas.tsx` 对 2D/3D **恒用 `web3d` 模块**（超集含 2D 渲染），`setHTML5Codebase` 传完整 URL 指向 `./GeoGebra/HTML5/5.0/web3d/`。codebase 恒定避免 deployggb 模块切换时复用旧 codebase 的坑
  - **deployggb 限制**：单页单 codebase，`setHTML5Codebase` 对相对路径不生效（`indexOf("//")` 判断），须传完整 URL；同版本 codebase 切模块（web→web3d）不会重载
- **更新 GGB 版本**：从 GeoGebra 官方下载新版 Math Apps Bundle zip，解压覆盖 `public/GeoGebra/`，再 `npm run build`
- PWA：workbox `globIgnores: ["**/GeoGebra/**"]` 排除 GGB 引擎（116MB 不进 precache），改走 `runtimeCaching` CacheFirst（`ggb-local` 缓存，首次访问后离线可用）；`runtimeCaching` 仅保留 AI 请求 NetworkOnly

## 开发约定

- `npm run dev` 开发（端口 5173），`npm run build` 生产（PWA 预缓存）
- 修改 `prompts.ts`/`commands.ts` 后跑 `test:replay` 确认无退化
- **重构编排时优先改 `pipeline.ts` 而非 ChatPanel**：pipeline 是纯 TS 可单测，ChatPanel 只做依赖注入
- 新增 pipeline 逻辑需配 `tests/pipeline.test.ts`（依赖注入 mock）；新增缓存逻辑配 `tests/specCache.test.ts`（注入 `createMemoryStorage`）
- GGB 命名陷阱：`u/v/w`=Vector、`A~Z` 单大写=Point、`f/g/h`=Function；`(x,y)` 赋变量=Point；`Point+Point` 崩；分母加 `+0.001` 防除零
- 3D 模式：`Cube(A,B)` 两点式优先；`SetViewDirection/SetFilling/SetPointSize/SetCaption` 等 3D 禁用
- **诊断日志**：画布/执行相关日志使用 `[AiGGB:DIAG]` 前缀，心跳/MutationObserver/DockGlassPane 检测均遵循此约定
- **`requestAnimationFrame`**：在 lib 层使用须加 `typeof requestAnimationFrame !== "undefined"` 守卫以兼容 Node.js 单测环境
- **3D batch 启用**：`executeCommands` 和 `executeToolCalls` 在 2D/3D 统一使用 `setRepaintingActive` 批量包裹（升级官方 5.4.927.1 后 DockGlassPane 不再因 batch 复发）
- **思考深度（thinking）**：`AIConfig.reasoningEffort`（SettingsDialog 设置）对支持 thinking 的 provider（DeepSeek V4）在 `chat`/`chatRaw`/`agentChat` 均发送 `reasoning_effort`，默认关闭 = baseline。Agent 模式 V4 的 `reasoning_content` 增量经 `onReasoning` → `onThinking` 实时展示（`🧠`），回传受 `mustRoundtripReasoning` quirk 门控。A/B 验证：`npm run test:ab`（`DRIFT_N`/`DRIFT_SAMPLE` 调规模）
- **`setPerspective("3d")` 守卫**：Agent 模式需先 `getPerspectiveXML()?.includes("3D")` 检查，已是 3D 则跳过调用
