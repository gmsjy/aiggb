# AiGGB — 项目知识库（AGENTS.md）

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
| `aiClient.ts` | OpenAI 兼容调用 | `chat(config, msgs, signal?, modelOverride?)` 返回 schema 校验后的 `AIResponse`；`chatRaw(...)` 返回纯文本（Phase 1 / 视觉识别用）；`agentChat(...)` Agent **流式**工具调用（SSE 增量解析 tool_calls + `onContent` 实时回调 + JSON 兼容回退 + 输出预算 `resolveMaxOutputTokens()`：可配 `AIConfig.maxOutputTokens`，默认 16384 / thinking 32768；第 8 参 `AgentChatOverrides` 支持截断重试扩容+降思考档；`usage.reasoning` 单列思考 token）；`ping(config, signal?, modelOverride?)` 连接测试（设置面板传 visionModel 顺带测视觉模型）；`AIConfig`（**4-role 模型**：`model` 主力 / `lightModel?` 轻量 / `agentModel?` Agent / `visionModel?` 视觉，`flashModel?` 已 deprecated；`reasoningEffort` 含 `"none"` = 关闭思考；`maxOutputTokens?` 输出预算）；`resolveModel(config, role)` 统一解析回退链（vision → model）；`ChatMessage`（content 支持 `string \| ContentPart[]` 多模态）、`ContentPart`（text/image_url）、`AIError`、`AISchemaError` |
| `pipeline.ts` | **两阶段流水线状态机**（从 ChatPanel 抽取）+ **多模态视觉管线** | `runPipeline(userText, deps, cb)`（Phase 1→确认→Phase 2→修复→**满足度评估**）、**`runVisionPipeline({text, images}, deps, cb)`**（带图轮入口：识别→题目确认→Agent 构造+状态核对）、`runAgentPipeline`/内部 `runAgentRound(userText, deps, cb, {stateCheck?, evalBasis?})`、`ReviewHandle`/`ProblemHandle`/对应 Decision、`PipelineDeps`（依赖注入接口，含 4-role 模型解析 + `runAgentLoopImpl?` + `updateProblemReview?` + `appMode`）、`PipelineCallbacks`（含 `onProblemReview?`）、`MAX_REPAIR=2`、`MAX_FORMAT_RETRY=2`、`HISTORY_WINDOW=6`、`parseRefinedSpec`、`collectHistory`（user 带 attachments 时追加 `[附件:图片×N]` 占位）；内部 `runSinglePhase`/`runPhase2`/`executeAndRepair`/`applyRagCorrection`/`chatWithFormatRetry`/`extractProblem`/`waitProblemReview`；Phase 2 调用 `executeCommands(api, cmds, deps.appMode)`；`requestAnimationFrame` 用 `typeof` 守卫兼容 Node.js 单测 |
| `runControl.ts` | 单轮运行生命周期 | `beginRun()`（返回本轮 AbortSignal）、`abortCurrentRun()`（清空/切模式/撤销时取消请求）、`onRunCancelled(cb)`（spec-review 等待气泡订阅取消）、`wasAborted()`、`endRun()` |
| `prompts.ts` | System Prompt 构建 | `buildSystemPrompt(domain, appMode, phase="full"\|"compile")`、`buildCompilePrompt`、`buildCheckerPrompt`（修复角色）、`buildRepairMessage`、`buildFormatRepairMessage`；compile 模式含 **self_check 自检指令**；`Domain = "general"\|"physics"` |
| `refinePrompt.ts` | Phase 1 精炼 prompt | `buildRefinePrompt(domain)` — 输出 JSON `{"spec":"<分节规格>"}`，含物理默认值 |
| `schema.ts` | AI 输出 Zod 校验 | `Command`（discriminatedUnion，14 op）、`AIResponse`（含 `ask`、`self_check`）、`NumLike`/`BoolLike`/`IntLike` 容错、`SafeCmd`（臆造命令硬黑名单 + XSS 过滤）、`CoordExpr`（vector/forceDiagram 坐标表达式注入防护）、`withTextSafety`（caption/label/unit 文本安全）；`superRefine` 做 slider/view 语义 + ask 互斥校验 |
| `ggbKB.ts` | **RAG 命令知识库** | `GGB_COMMAND_DEFS`（~126 条命令：签名/参数/2D3D 适用）、`HALLUCINATION_MAP`（27 条臆造→正确映射，含 El→Element / Round→round）、`buildCommandReference(mode, domain)`、`buildHallucinationWarnings(mode)`、`findCommand`、`findHallucination` |
| `commandCorrect.ts` | 后置命令纠正器 | `correctCommand(cmd)`（Levenshtein ≤2 模糊纠正 + 臆造查表 + 参数个数校验）、`batchCorrect()`、`correctionsToRepairContext()` |
| `commandValidate.ts` | **执行前静态语法预检**（纯 TS） | `validateGGBCommand(cmd, mode?)` → `{ok, issues[], message}`：括号配对（含坐标括号与嵌套调用）、`).` 句点误用（逗号手误）、Sequence 参数契约（官方 5 种重载分支判定 / 循环变量单字母 / 区间压缩 / 尾部残留）、参数个数（ARG_COUNT_HINTS + 属性命令回退 ggbKB paramCount）、运算符结尾、**属性命令专项**（3D 模式禁令 `mode-forbidden` / SetColor 值域与色名 `value-range`/`color-name` / 透明度 0~1，mode 经 ggbBridge/toolExecutor 透传）；`validateSequenceArgs(args)` → Sequence 契约/循环变量参数级校验（供 eval_raw 路径与 KB 自查复用）；被 `ggbBridge.executeOne`（eval）与 `toolExecutor`（eval_raw）统一调用，把无语义的引擎 false 变成可自愈的具体诊断 |
| `specSchema.ts` | Phase 1 输出校验 | `RefinedSpec`（`{title?, spec?, ask?}`，spec/ask 互斥） |
| `specCache.ts` | 意图→规格缓存 | `lookupCachedSpec`/`storeCachedSpec`（模板精确匹配优先 + 存储精确键）、**`SpecStorage` 注入接口 + `createMemoryStorage()`（供单测）**；LRU ≤50 条、TTL 30 天、键含画布对象指纹（排除 `_` 前缀临时对象与物理常量，保证同场景稳定命中） |
| `commands.ts` | 命令黑名单/流程 | `GGB_FORBIDDEN_COMMANDS`（硬黑名单，被 schema 引用）、`GGB_5STAGE_FLOW`（参数→点→图形→动画→属性）；命令签名/模式数据的权威来源是 ggbKB.ts |
| `physics.ts` | 物理常量 | `PHYSICS_CONSTANTS`（g/c/e/eps0/mu0/k_e/Grav/h/k_B） |
| `templates.ts` | 12 个一键模板（物理 2D 4 + 数学 2D 4 + 3D 4） | `Template {id, icon, title, subtitle, prompt, domain, mode}`；prompt 即精炼规格，天然命中 specCache |
| `repaintGate.ts` | **画布重绘门控**（闪烁防治，纯 TS） | `shouldBatch(count, appMode)`（**任何非空批次都批处理**，3D 可关闭）；`withRepaintBatch(api, count, appMode, fn)`（暂停重绘 → 执行 → 恢复 + 静默期，抛错也恢复）；`isBatch3DEnabled`/`setBatch3DEnabled`（`localStorage: aiggb_batch_3d`）；`isDiagVerbose`（`aiggb_diag` 逐节点日志开关，手改 localStorage）；`markRepaintBusy`/`isRepaintBusy`（`REPAINT_GRACE_MS=2000`，busyUntil 到时自动失效）|
| `ggbBridge.ts` | op → GGB API 执行器 | `executeCommands(api, commands, appMode?)` — 批量渲染走 `repaintGate.shouldBatch`（暂停重绘 → 整批执行 → 恢复 + `markRepaintBusy` 静默期）；`collectFailures`、**`resetTmpIds`**（vector 容错重试时复位临时对象计数）、`exportGGB`/`exportPNG`（画布导出，Toolbar 消费）|
| `agentLoop.ts` | **ReAct Agent 工具调用循环** | `runAgentLoop(userText, deps)` — observe→plan→act 循环，最大 30 次迭代，**每轮刷新 api 句柄**（防 applet 重建失效）、**连续 3 轮工具失败熔断**（`MAX_CONSECUTIVE_FAILURES`，参数/预检类错误不计入，给模型自我修正机会）、全拒绝判定按**本轮**被拒数（避免跨轮累积误触发）、危险工具确认按 `toolCallId` 匹配；**`onThinking` 回调**（分析/规划/执行工具/等待确认 4 个节点 + V4 `reasoning_content` 增量 🧠 实时展示）经 pipeline 透传 UI 减少等待焦虑；`reasoning_content` 回传受 `mustRoundtripReasoning` quirk 门控；空响应重试的截断判定**直接信任 `finish_reason="length"`**（不再依赖 `streamsFinishReason` 门控）；**`StateCheckSpec` 终止核对钩子**：AI 输出纯文本视为完成时用 `getRichSnapshot` 快照调 `check()`，未通过把 issues 反馈注入循环继续修正（`MAX_STATE_CHECK_ROUNDS=2`，共享 30 迭代预算；核对异常按通过结束——失败不阻断）；`buildStateCheckFeedback` 组装反馈消息；`convertHistory` 对 user turn attachments 折叠 `[附件:图片×N]` 占位；`registerConfirmationHandler`/`unregisterConfirmationHandler` 危险工具确认注入；**轮次耗尽 → `AgentLoopResult.incomplete`**（画布保留不回滚、对话入 pipeline 续作缓存 `agentResumeCache`，下轮 `resumeMessages` 注入接力，TTL 10min + 画布指纹校验兜底）；`AgentLoopDeps`（含 `agentModel` + `stateCheck?` + `resumeMessages?`）、`AgentLoopResult` |
| `toolExecutor.ts` | Agent 工具 → GGB API 分发 | `executeToolCall(api, call)`/`executeToolCalls(api, calls, appMode?)` — 批处理走 `repaintGate.shouldBatch`（任何非空批次）+ 恢复后静默期；运行时**不再切透视**（v1.8：classic 下 `setPerspective` 会触发 DockGlassPane → 画布消失 → 硬重建）；~20 个工具 case（create_point/slider/vector/style/animation…）|
| `tools.ts` | 工具 Function Calling 定义 | `TOOL_DEFINITIONS`（OpenAI tool schemas）、`TOOL_SCHEMAS`（Zod 校验）、`getToolSafety(name)` → `"safe"\|"dangerous"`；dangerous 工具（eval_raw/delete/clear）需用户确认 |
| `satisfactionEval.ts` | Phase 3.1 满足度评估 | `evaluateSatisfaction(config, spec, snapshot, signal?, modelOverride?)` — 轻量模型对比画布快照与精炼规格，输出 `SatisfactionResult{satisfied, issues[], summary}`；失败不阻断流程；**`evaluateVisual(config, basis, imageDataUrl, signal?, visionModel?, ...)`** — 画布截图（exportPNG）+ 视觉模型审查渲染效果（出框/遮挡/样式/可读性），跳过 thinking + 显式 4096、解析容错、失败不阻断；带图轮 stateCheck 双路合并（视觉 issues 带 `[视觉]` 前缀） |
| `problemSchema.ts` | 题目识别输出校验 | `ProblemAnalysis` 接口 + Zod 容错 + `parseProblemAnalysis` + `serializeProblem`（确定性序列化） |
| `visionPrompt.ts` | 视觉模型系统提示 | `buildVisionExtractPrompt(domain)` — 指示输出 ProblemAnalysis JSON |
| `imageInput.ts` | 图片输入预处理 | `validateImageFile`（纯校验）+ `fileToDataUrl`（浏览器缩放+白底+JPEG）；`MAX_IMAGES=3`、`MAX_FILE_MB=10` |
| `providers.ts` | 6 预置 provider + 自定义 | `PROVIDER_PRESETS`（DeepSeek/Moonshot/GLM/SiliconFlow/OpenAI/Ollama）；含 `visionModels?` 候选列表（DeepSeek `deepseek-flash`（V4.1 原生多模态）、GLM `glm-4.5v`、SiliconFlow Qwen2.5-VL、OpenAI gpt-4o、Ollama qwen2.5vl 等）；GLM thinking 参数适配（`buildThinkingParam`：GLM=thinking.type / DeepSeek=reasoning_effort） |
| `format.ts` | 数字格式化工具 | `fmtTokens(n)` — token 用量 k/M 缩写（顶栏 + 统计图共用） |

### src/components/（React UI）

| 文件 | 职责 |
|---|---|
| `ChatPanel.tsx` | 编排已提取至 pipeline.ts，本组件只负责：输入 UI（含**图片输入**：📎 上传 + textarea 粘贴 + 输入区拖拽，`MAX_IMAGES=3`，预览条增删）、消息渲染、**store 依赖注入成 `PipelineDeps`**（注入 `visionModel` + `updateProblemReview`）、spec / problem 确认事件桥接（`reviewHandleRef` + `problemHandleRef`）、**发送路由**（带图 → `runVisionPipeline`；纯文字按 agentMode 分流）、**Agent 思考步骤实时显示**（`agentStep` state + `onAgentStep` → thinking 区域）|
| `MessageBubble.tsx` | 消息气泡：user（含 attachments 缩略图 + **Lightbox 灯箱**，Esc 关闭）/assistant/error/ask/**spec-review**（规格确认 UI：编辑/重新生成/确认绘制）/**problem-review**（题目确认 UI：编辑题干/重新识别/确认并绘制，复用 spec-review 样式）+ **assistant 渲染 self_check 报告** |
| `GGBCanvas.tsx` | GeoGebra applet 注入，监听 `ggbAppName` 重建（2D↔3D）；**心跳监控**（2s 间隔 canvas 计数 + DockGlassPane 检测）+ **自动恢复**（保存 base64 快照 → `inject(force=true)` 强制重建 → 恢复快照）；MutationObserver DOM 监控 + WebGL context loss 监听；诊断日志前缀 `[AiGGB:DIAG]` |
| `Toolbar.tsx` | 顶栏：domain 切换/模板/撤销/清空/导出/截图/复制/安装；清空/切模式/撤销时调用 `abortCurrentRun()` |
| `SettingsDialog.tsx` | API 配置（Provider/Key/**4-role 模型**：主力/轻量/Agent/视觉 + 思考深度（含「关闭」= `reasoning_effort:"none"`）/输出预算 max_tokens/温度/测试连接——测试时顺带 `ping(cfg, undefined, visionModel)` 验证视觉模型可用性）|
| `ScriptPanel.tsx` | 右侧实时 GGB 脚本展示（可折叠/复制/下载）|
| `TemplateGallery.tsx` | 模板卡片，点击发 `aiggb:send` 事件 |
| `PWAUpdatePrompt.tsx` | SW 更新提示 |

### src/store/useAppStore.ts

- Zustand + persist **version 4**，存储键 `aiggb_config`
- 持久化：`config`（含 4-role 模型 `model`/`lightModel`/`agentModel`/`visionModel`）、`domain`、`privacyAcknowledged`
- 迁移 v2→v3：`flashModel` → `lightModel`；v3→v4：no-op（`visionModel` 可选）
- 运行期：`ggbApi`、`ggbAppName`（"classic"\|"3d"）、`messages`、**`constructionLog`**（成功命令日志，供回滚兜底重建）、`isThinking`
- **token 用量统计**：`tokenUsage`（会话累计，顶栏显示）、`roundTokenUsage`（本轮累计）、`tokenHistory`（每轮一条，持久化 localStorage `aiggb_token_usage`，最多 100 轮）；`addTokenUsage`/`startRound`/`finishRound`/`loadTokenHistory`，轮次边界由 ChatPanel `runRound` 驱动；多模态视觉调用 usage 经同一链路自动计入
- `ChatTurn` 六类：`user`（含 `attachments?`）/ `assistant`（含 `self_check?`）/ `ask` / `error` / `spec-review` / **`problem-review`**
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

## 防漂移七层

1. **提示层**：`prompts.ts` + RAG 过滤的命令参考/臆造警告 + 5 阶段流程 + Point/Vector 类型铁律 + **Sequence 契约专节**（5 种官方重载/循环变量单字母/区间独立成参/逗号与括号铁律）
2. **自检层**：compile prompt 强制 AI 输出 `self_check`（逐项核对白名单/3D 禁用/Point+Vector/除零/参数个数/Sequence 契约）
3. **清洗层**：`aiClient` stripCodeFence（BOM 剥离 + 去 code fence）
4. **校验层**：`schema.ts`（臆造命令硬黑名单、slider/view 语义、ask 互斥、forceDiagram.vec 形态、CoordExpr 注入防护、withTextSafety 文本安全）
5. **语法预检层**：`commandValidate.ts`（**执行前**纯文本静态检查：括号配对、逗号误写成句点、Sequence 参数契约、参数个数、运算符结尾、**属性命令专项**——3D 模式禁令 / SetColor 值域 0~255 与色名形态 / 透明度 0~1）——把引擎那句无语义的「执行失败」换成「具体错在哪 + 正确形态」，供修复回路精准自愈；`eval`/`eval_raw` 两条入口统一生效
6. **纠正层**：`commandCorrect`（Levenshtein 模糊纠正 + 臆造映射 + 参数校验）
7. **执行层**：`ggbBridge`（animate/trace/style 目标存在预检、vector Point+Point 自动重写、style opacity 双路可观测）+ 修复回路

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
| `agentLoop.ts` | ReAct 循环主控：`runAgentLoop()` 最多 30 次迭代，`executeSafeTools`/`handleDangerousTools` 分发（eval_raw 赋值形态经 `isEvalAutoSafe` 自动降档免确认），`truncateHistory` 截断 + 修复消息配对。**轮次耗尽 = `incomplete` 可续作暂停**（画布保留不回滚、成功命令照常入 constructionLog，结束文案引导用户发后续指令）；下一轮经 `deps.resumeMessages` 注入暂停轮完整对话缓存（换新 system prompt、原始请求保持 index 1、进入循环前立即压缩一次），消息数组追加式扩展 + 动态内容后置以对齐 DeepSeek KV Cache 的前缀命中规则；`deps.trapPrompt`（pipeline 注入 buildTrapPrompt 产物）追加到 system prompt 尾部，agent 回路接入陷阱闭环 |
| `toolExecutor.ts` | 工具分发：26 个 case（create_points/segment/circle/polygon/sliders/vector/text/function/parametric/transform_object + physics_constants/trace + get_canvas_info/fit_view_to/get_object_info/list_objects + set_style/animation/view + delete/clear + eval_raw + **attach_vector/create_readout/create_spring/create_fractal**）；Zod 校验 + 安全拦截 + RAG 纠正 + preflight 语义预检 + `isEvalAutoSafe` 自动降档判定。物理演示层：attach_vector 矢量随动（视窗 15% 自动归一化缩放，助手对象 Mag*/Tip* 大写开头避开小写 Vector 推断陷阱）、create_readout 动态读数条（round 小写）、create_spring 真弹簧（PolyLine 锯齿端点随动）、create_fractal 分形（L-system + 海龟 TS 数值生成，kind=koch/snowflake/sierpinski/dragon，段数护栏 4500，深度固定不支持滑块——Zip/Flatten/Element/KeepIf 实测可用（5.4.927），列表代数不可行的真实原因是每代重写须静态展开、乌龟折叠需 O(n²) 前缀和且深度无法滑块驱动；真正不可用的命令见开发约定「列表函数与大小写」条目）。★ 已下线薄包装工具（create_point/slider、create_line/midpoint/intersect/locus、set_unit_axes、eval_sequence）由批量版/免确认 eval_raw 承接，重放映射保留兼容历史轨迹 |
| `tools.ts` | 工具定义：`TOOL_DEFINITIONS`（OpenAI tool schemas）+ `TOOL_SCHEMAS`（Zod）+ `getToolSafety()` |

### 工具安全分级

- **safe**：create_*/set_*/list_*/get_*（含 transform_object、get_canvas_info/fit_view_to）— 无需确认直接执行；单命令薄包装（Line/Midpoint/Intersect/Locus/Point/Tangent/Angle）走免确认 eval_raw + ggbKB 惯用法
- **dangerous**：`eval_raw`、`delete_object`、`clear_canvas` — 需用户确认（或信任会话后自动通过）
- **★ eval 自动降档**：赋值形态（`name = ...`）+ 通过黑名单/XSS 拦截 + 通过静态预检 + 不含 Delete 的 `eval_raw` 调用自动并入 safe 免确认（`isEvalAutoSafe`）——3D 构造（Cube/Sphere/Surface 均为赋值形态）确认次数趋零；Delete / 非赋值 scripting（SetColor/ZoomIn）/ 任一拦截失败仍走确认

### Agent 模式 vs 流水线模式

| | 流水线模式 | Agent 模式 |
|---|---|---|
| 入口 | `runPipeline()` | `runAgentLoop()` |
| AI 调用 | `chat()` 单次返回 commands JSON | `agentChat()` 多次流式返回 tool_calls |
| 执行方式 | 批量 `executeCommands` | 逐步 `executeToolCall` |
| 错误恢复 | 批量失败 → checker prompt 修复 | 单步失败 → AI 观察 error 自行调整 |
| 适用场景 | 已知需求的快速生成 | 复杂多步构造、探索性绘图 |

### Agent 模型配置

`AgentLoopDeps.agentModel` 由 `resolveModel(config, "agent")` 解析（`agentModel` → `model` 回退链），支持独立于主力/轻量/视觉模型的第三角色。

## 多模态题目识别（Agent 基底 + 画布状态核对）

带图片消息（上传/粘贴/拖拽，≤3 张/条）自动走「题目识别 → 确认 → Agent 构造 + 状态核对」分支。纯文字输入行为零变化。

### 架构

```
带图输入 → extractProblem（视觉模型 chatRaw JSON）→ 题目确认气泡 → taskText
  → runAgentRound(taskText, stateCheck) → Agent 循环构造
    → AI 输出文本时触发终止核对（双路合并，失败均不阻断）：
        ① 文本结构：getRichSnapshot vs serializeProblem（evaluateSatisfaction，轻量模型）
        ② 截图视觉：exportPNG(画布) + evaluateVisual（visionModel）→ 出框/遮挡/样式问题
      → 未通过 → issues（视觉项带 [视觉] 前缀）+ 快照注入循环继续修正（≤2 次，共享 30 迭代预算）
      → 通过 / 预算耗尽 → 结束
```

### 关键文件

| 文件 | 职责 |
|---|---|
| `problemSchema.ts` | ProblemAnalysis Zod schema + 容错 + `parseProblemAnalysis` + `serializeProblem`（确定性序列化） |
| `visionPrompt.ts` | `buildVisionExtractPrompt(domain)` — 视觉模型系统提示 |
| `imageInput.ts` | `validateImageFile`（纯校验）+ `fileToDataUrl`（浏览器缩放+白底+JPEG） |
| `pipeline.ts:runVisionPipeline` | 识别 loop → 确认 → `runAgentRound` + stateCheck（文本+视觉双路核对，`evalVisualImpl?` 可注入） |
| `pipeline.ts:runAgentRound` | 从 `runAgentPipeline` 抽取的内部函数，接受可选 `stateCheck`/`evalBasis` |
| `agentLoop.ts:StateCheckSpec` | Case 1 终止钩子：`checkRounds < maxRounds` 时调用 `check(snapshot)` → 未通过则注入反馈消息 continue |

### 4-role 模型配置

`AIConfig` 四角色：`model`（主力）/ `lightModel`（精炼/评估）/ `agentModel`（Agent）/ `visionModel`（题目识别）。`resolveModel(config, "vision")` 回退链 `visionModel → model`。

### ChatTurn 扩展

- `user` turn 加 `attachments?: string[]`（base64 JPEG 数组）
- 新增 `problem-review` role（payload: `{problem: ProblemAnalysis, status}`）
- `collectHistory` / `convertHistory`：有 attachments 时追加 `[附件:图片×N]` 占位

### 降级策略

- 识别失败 + 有文字 → error 气泡 → 降级为普通 Agent 轮（无 stateCheck）
- 纯图识别失败 → error 气泡指向设置
- 核对失败 / null → 按通过结束（不阻断）

## 3D 画布稳定性（DockGlassPane 修复与恢复系统）

### 根因

GeoGebra web3d 内部使用 `DockGlassPane`（一个 DIV 遮罩层）处理视图切换动画。以下操作会触发 `DockGlassPane` 接管 3D 视图 iframe，且动画有时不完成 → iframe 永久消失 → 所有 canvas 归零：

- `api.setPerspective("3d")` 在已有 3D 透视时重复调用
- `api.setRepaintingActive(true)` 在 3D 模式下触发内部布局重组

### 三层防御

| 层 | 位置 | 机制 |
|---|---|---|
| **预防 #1** | `toolExecutor.ts:set_view` | **运行时完全不切透视**（v1.8）：classic 画布下 `setPerspective("3d")` 实测触发 DockGlassPane → canvas 全消失 → 心跳硬重建。已在 3D 则只回文案；2D 则返回提示「请用工具栏切 3D 模式」，模式切换统一走工具栏 `setAppName`（store）→ `GGBCanvas` 监听 `ggbAppName` 变化整体重注入 applet |
| **预防 #2** | `repaintGate.ts:shouldBatch` + `ggbBridge.ts:executeCommands` | 批处理策略集中化：**任何非空批次都批处理**（实测：不批处理 → 代数区 avOutput / avDefinition / canvasDef 逐行重建 = 绘图闪烁）；3D 可由用户关闭 |
| **预防 #3** | `repaintGate.withRepaintBatch` + `toolExecutor.executeToolCalls` / `agentLoop` 危险工具组 | 危险工具（eval_raw/eval_sequence）此前完全不批处理，v1.8 起统一批处理 |
| **预防 #4** | `repaintGate.ts` 静默期 | `setRepaintingActive(true)` / applet 重建后 `markRepaintBusy()`，心跳在该窗口挂起 |
| **恢复** | `GGBCanvas.tsx:heartbeat` | 2s 间隔心跳监控 canvas 数量 + DockGlassPane 检测 → **连续 2 次确认**后硬重建 |

### 3D 绘图区闪烁（v1.8 止血）：四条路径与对策

| # | 路径 | 现象 | 对策 |
|---|---|---|---|
| ① | 逐条重绘（未达批处理阈值） | 对象"一跳一跳"出现 | 阈值降到 1：**任何非空批次都批处理**（此前 Agent 每轮 1~2 个工具调用根本没批处理） |
| ② | `setRepaintingActive(true)` 恢复重绘 | 3D 视图整屏重建，几帧 canvas 空白 | 恢复后进入静默期（`REPAINT_GRACE_MS=2000ms`） |
| ③ | 心跳把 ② 的空白误判为"画布消失" | 闪一下 + 停顿（硬重建 + 快照恢复） | 静默期挂起 + **连续 2 次**（≥4s）canvas=0 才认定丢失 |
| ④ | ResizeObserver 逐帧 `setSize + refreshViews` | 布局过渡期间 3D 视图重排、抖动 | **220ms 尺寸稳定后**同步一次；**3D 下不调用 `refreshViews()`** |

A/B 开关：设置面板「3D 批量重绘」（`localStorage: aiggb_batch_3d`，`repaintGate.isBatch3DEnabled`）。开启 → 代数区平滑 / 3D 恢复重绘会整屏重建；关闭则相反。切换立即生效。

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
| `npm run test:drift` | — | 漂移监控 N=10（需 .env 真实 Key）；`DRIFT_THINKING=high` 开 thinking 跑（A/B 用）；核心 `runDrift()` 已导出供 A/B 复用，统计含 token 用量 |
| `npm run test:ab` | — | **A/B 测试**：`reasoning_effort` 开/关 同用例对比（端到端 + 延迟 + token 成本），输出 `tests/ab-report.json` |
| `npm run test:visual` | — | Playwright 截图（physics,dynamic,composite）。前置：`npm run dev` 已运行（5173，宿主 `tests/visual.html` 加载本地 GGB bundle）|
| `npm run demos:regen` | — | **重生成 README 效果图**（docs/demos/ 10 个 GIF：P- 物理 / X- 复合 / D- 数学动态 / H- 3D）：fixture 场景 → dev server 本地 GGB 画布（宿主 `tests/visual.html`，与视觉回归共用；3D 场景 `?app=3d` 注入）→ Playwright 抓帧 8s → ffmpeg 调色板合成 640×448 GIF。`regen-demos.ts` 支持 per-id 附加命令（EXTRA_COMMANDS：静态场景补动画/覆盖样式）。前置：`npm run dev` 已运行（5173） |
| `npm run prompt:iterate` | — | Prompt 迭代工作流 |
| **单测** | — | 216 个（0 API）：`tests/commandValidate.test.ts`（静态预检：Sequence 官方 5 种重载/括号配对/逗号句点误用/循环变量契约 + 属性命令专项：3D 禁令/值域/色名）、`tests/pipeline.test.ts`（流水线状态机 + 视觉管线 + 视觉核对合并）、`tests/specCache.test.ts`（缓存，注入 `createMemoryStorage`）、`tests/satisfactionEval.test.ts`（满足度评估 + evaluateVisual 视觉审查）、`tests/problemSchema.test.ts`（题目识别 schema 容错 + 序列化确定性）、`tests/imageInput.test.ts`（图片校验边界）、`tests/agentLoop.test.ts` / `toolExecutor.test.ts` / `agentSmoke.test.ts` / `ggbBridge.test.ts` / `ggbKB.test.ts` / `sessionStore.test.ts` / `trainingStore.test.ts` / `trajectory-replay.test.ts` / `trapStore.test.ts` / `runControl.test.ts` / `repaintGate.test.ts` / `aiClient.test.ts` |

关键文件：`tests/runner.ts`（运行器）、`tests/mockGGB.ts`（轻量 GGB mock）、`tests/cases.json`（用例）、`tests/assertions.ts`（12 维断言）、`tests/fixtures/`（回放数据）。基线 216 单测 / 63 回放。

**注意**：`test:record` 会覆盖 `tests/fixtures/`。基准 `tests/report.json` 当前 ~59/63（highschool 3D 是主要拉分项）。

## 环境

- `.env` 放测试密钥：`DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL`（默认 deepseek-flash，V4.1）、`DEEPSEEK_BASE_URL`
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
- **Sequence（序列）五重载**：`Sequence(n)`｜`Sequence(k,n)`｜`Sequence(k,n,inc)`（整数表）｜`Sequence(expr,k,a,b)`｜`Sequence(expr,k,a,b,step)`（迭代）。迭代形态的循环变量必须是**单个 ASCII 字母**，`start/end/step` 必须是三个独立参数，括号逐层闭合（嵌套 `Sequence(Cube(…))` 最外层 `)` 最易漏），参数之间禁句点。改这条规则同时要改 `commandValidate.ts` 的分支判定与 `tests/commandValidate.test.ts`
- **GGB evalCommand 对 scripting 命令恒返回 false（重要特性）**：`Set*/Show*/ZoomIn` 等**不产生新对象**的命令**即使执行成功也返回 false**（5.4.927/5.4.929 实测一致：SetColor 后 getColor 已变更、返回值仍 false）——返回值只对「产生输出对象」的命令可靠。判定统一走 `ggbBridge.isScriptingCommand` 豁免（eval op / eval_raw / visual.html 宿主三方同语义）。**Delete 是例外**：成败返回值相同（均 false）无法靠返回值区分，eval 路径特判——`api.exists` 执行前后对比，删除不存在对象/删除失败均有具体诊断（mockGGB 已同步真实移除对象）。style op 的 opacity 是否生效以 `readOpacity`（getXML 实读 lineStyle opacity，0~255 刻度）为准，不得以返回值决定 SetFilling 回退（否则 2D 对象被双重填充）。语法/值域错误仍由 commandValidate 静态预检在进引擎前拦截
- **属性命令（Set*/Show*/style op）**：`SetColor` r/g/b 必须 **0~255 整数**（0~1 浮点是最高频误用，0.9→230）；透明度/填充率才是 **0~1 小数**（`SetLineOpacity`/`SetFilling`）；颜色名只能英文且需引号（中文色名/裸标识符必失败）。3D 禁令清单与替代方案见 `commandValidate.ts` 的 `MODE_3D_FORBIDDEN`（与 prompts MODE_3D_ADDON、ggbKB modes 三方一致——改任何一方须同步其余两方 + 测试）。完整报错模式分析见 `docs/属性命令报错分析.md`
- **列表函数与大小写（自托管 bundle 5.4.927 实测，截图存证 `docs/列表函数实测/`）**：`Zip`（1~3 变量/产出对象列表/内嵌 If）/`Flatten`（含变长展开）/`Element`/`KeepIf`/`Take`/`First`/`Join`/`Unique`/`Sort`/`Sum` 均**可用**。**不可用**：`El`（GGB 从无此命令，正确名 `Element`）、大写 `Round`（此版本未编译，仅小写函数 `round(x,n)`）、小写 `mod`（仅大写命令 `Mod(x,y)`，且可嵌套进表达式）、`CumulativeSum`（此版本没有）、大写变体（`ELEMENT`/`ZIP` 必失败——命令名大小写敏感）。`El`/`Round` 已入 `HALLUCINATION_MAP` 自动纠正，`commandCorrect.extractCommandName` 对 `round` 的豁免是**大小写敏感**的（小写函数放行、大写送纠正）。实测方法：dev server + `tests/visual.html` 宿主 `?cmds=[{"op":"eval","cmd":"..."}]` + Playwright 驱动 `window.__ggbApplet__.evalCommand`
- **`api.exists()` 对函数对象不可靠（实测）**：`f1(x) = round(x, 2)` 经 evalCommand 创建成功（返回 true 且在 `getAllObjectNames()` 中），但 `exists("f1")` 返回 false——依赖 `exists` 前后对比做删除诊断的路径（ggbBridge eval Delete 特判、visual.html 宿主同语义）对**函数对象**会误报「删除不存在对象」；函数删除可改用 `getAllObjectNames` 兜底
- **诊断日志**：画布/执行相关日志使用 `[AiGGB:DIAG]` 前缀；**MutationObserver 逐节点日志默认静音**（`localStorage.setItem("aiggb_diag","1")` 开启）——该回调里做字符串拼接 + console 输出本身会加重卡顿
- **`requestAnimationFrame`**：在 lib 层使用须加 `typeof requestAnimationFrame !== "undefined"` 守卫以兼容 Node.js 单测环境
- **3D batch 启用**：`executeCommands` 和 `executeToolCalls` 统一走 `repaintGate.shouldBatch()`（**任何非空批次都批处理**；3D 可在设置面板关闭「3D 批量重绘」）。危险工具组走 `withRepaintBatch`。批处理 = 暂停重绘 → 整批执行 → 恢复重绘；**恢复后必须 `markRepaintBusy()` 进入静默期**，否则 GGB 整屏重绘的瞬时空白会被 2s 心跳误判为"画布消失"→ 硬重建 → 用户看到闪一下 + 停顿。3D 闪烁的四条路径与对策见 SPEC.md §3D 稳定性
- **尺寸同步防抖**：ResizeObserver 有对象时等 `RESIZE_SETTLE=220ms` 尺寸稳定后再 `setSize`，且 **3D 下不调用 `refreshViews()`**（size 变更已触发重绘，额外 refreshViews 是闪烁放大器）。**测量一律用 `measureHost()`（`.ggb-host`）而非 `#ggb-container`**——GGB 会往容器写内联尺寸，销毁子节点后仍残留，量容器会拿到陈旧尺寸（实测打开 DevTools 后注入 1137×670 而面板只有 1168×332）；`appletOnLoad` 后再做一次**尺寸对账**（偏差 >8px 即 `setSize`）
- **`setPerspective` 全面下线（v1.8）**：`set_view` 的 `perspective:"3d"` 不再改透视（实测 classic 下会触发 DockGlassPane → 画布消失 → 硬重建闪烁）；2D↔3D 只能走工具栏切换（`setAppName` → GGBCanvas 监听重建，整体重注入 applet）
- **思考深度（thinking）与输出预算**：`AIConfig.reasoningEffort`（SettingsDialog 设置，`chat`/`chatRaw`/`agentChat` 共用）三态：未设置（不发参数，**V4.1 实测仍会思考**）/ `"none"`（发 `reasoning_effort: "none"`，实测推理归零，GLM 走 `thinking.disabled`）/ low|medium|high。思考 token 与正文**共享** `max_tokens`（服务端封顶，客户端无法剔除）→ 预算可自定义：`AIConfig.maxOutputTokens` + `resolveMaxOutputTokens()`，默认 `16384` / thinking `32768`（v1.8 由 8192/16384 上调）；截断时 `agentLoop` 以 `{maxTokensScale: 2, reasoningEffort: "low"}` 扩容重试一次（否则同参数必然再次截断）。`AgentResponse.usage.reasoning` = `completion_tokens_details.reasoning_tokens`
- **视觉识别调用**：`extractProblem` 用 `jsonMode=false`（多数视觉模型不支持 `response_format: json_object`），解析容错在 `parseProblemAnalysis`；带图轮 token 统计无需特殊处理
- **A/B 验证**：`npm run test:ab`（`DRIFT_N`/`DRIFT_SAMPLE` 调规模）；结论：v4-flash 上 `reasoning_effort=high` 端到端 −8.3%，默认保持关闭
