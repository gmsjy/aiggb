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
| `aiClient.ts` | OpenAI 兼容调用 | `chat(config, msgs, signal?, modelOverride?)` 返回 schema 校验后的 `AIResponse`；`chatRaw(...)` 返回纯文本（Phase 1 用）；`ping()` 连接测试；`AIConfig`（含 `flashModel?`）、`ChatMessage`、`AIError`、`AISchemaError` |
| `pipeline.ts` | **两阶段流水线状态机**（从 ChatPanel 抽取） | `runPipeline(userText, deps, cb)`（Phase 1→确认→Phase 2→修复）、`ReviewHandle`/`ReviewDecision`、`PipelineDeps`（依赖注入接口）、`PipelineCallbacks`、`MAX_REPAIR=2`、`MAX_FORMAT_RETRY=2`、`HISTORY_WINDOW=6`、`parseRefinedSpec`、`collectHistory`；内部 `runSinglePhase`/`runPhase2`/`executeAndRepair`/`applyRagCorrection`/`chatWithFormatRetry` |
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
| `templates.ts` | 16 个一键模板 | `Template {id, icon, title, subtitle, prompt, domain, mode}`；prompt 即精炼规格，天然命中 specCache |
| `ggbBridge.ts` | op → GGB API 执行器 | `executeCommands`、`collectFailures`、**`resetTmpIds`**（vector 容错重试时复位临时对象计数）、`exportGGB`/`exportPNG`、`registerAppNameSetter`/`switchAppletMode`（2D↔3D）|
| `providers.ts` | 6 预置 provider + 自定义 | `PROVIDER_PRESETS`（DeepSeek/Moonshot/GLM/SiliconFlow/OpenAI/Ollama） |

### src/components/（React UI）

| 文件 | 职责 |
|---|---|
| `ChatPanel.tsx` | 编排已提取至 pipeline.ts，本组件只负责：输入 UI、消息渲染、**store 依赖注入成 `PipelineDeps`**、spec 确认事件桥接（`reviewHandleRef`）|
| `MessageBubble.tsx` | 消息气泡：user/assistant/error/ask/**spec-review**（规格确认 UI：编辑/重新生成/确认绘制）+ **assistant 渲染 self_check 报告** |
| `GGBCanvas.tsx` | GeoGebra applet 注入，监听 `ggbAppName` 重建（2D↔3D）|
| `Toolbar.tsx` | 顶栏：domain 切换/模板/撤销/清空/导出/截图/复制/安装；清空/切模式/撤销时调用 `abortCurrentRun()` |
| `SettingsDialog.tsx` | API 配置（Provider/Key/模型/温度/测试连接）|
| `ScriptPanel.tsx` | 右侧实时 GGB 脚本展示（可折叠/复制/下载）|
| `TemplateGallery.tsx` | 模板卡片，点击发 `aiggb:send` 事件 |
| `PWAUpdatePrompt.tsx` | SW 更新提示 |

### src/store/useAppStore.ts

- Zustand + persist **version 2**，存储键 `aiggb_config`
- 持久化：`config`、`domain`、`privacyAcknowledged`
- 运行期：`ggbApi`、`ggbAppName`（"classic"\|"3d"）、`messages`、**`constructionLog`**（成功命令日志，供回滚兜底重建）、`isThinking`
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

## 测试（tests/）

| 命令 | 层 | 说明 |
|---|---|---|
| `npm run test:replay` | L1 | 离线回放 63 用例（14 类别，含 highschool 3D），0 API 调用 |
| `npm run test:smoke` | L2 | 在线冒烟 5 用例 |
| `npm run test:record` | L3 | 在线全量 63 用例 + 覆盖 fixtures |
| `npm run test:drift` | — | 漂移监控 N=10（需 .env 真实 Key）|
| `npm run test:visual` | — | Playwright 截图（physics,dynamic,composite）|
| `npm run prompt:iterate` | — | Prompt 迭代工作流 |
| **单测** | — | `tests/pipeline.test.ts`（流水线状态机）、`tests/specCache.test.ts`（缓存，注入 `createMemoryStorage`）|

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
