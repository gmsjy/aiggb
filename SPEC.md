# AiGGB 规格书

> **AI 驱动的 GeoGebra 动态图像生成器**
> 版本：v1.6
> 日期：2026-08-10
> 状态：MVP 完成，已扩展 Agent 模式、3D 画布稳定性修复、3-Role 模型配置，进入迭代优化

---

## 1. 项目目标

构建一个**纯前端**工具（React 19 + Vite 8 + PWA），让用户用自然语言描述**数学 / 物理 / 几何**场景，由 AI 自动生成 **GeoGebra 命令序列**，在内嵌的 GeoGebra 画布中实时渲染为**可交互的动态图像**（含滑块、动画、轨迹、3D、物理仿真）。

一句话定位：**”说人话 → 出动图”**，并面向**物理可视化**做专项优化。

### 1.1 目标用户

- 数学 / 物理 / 工程教师：快速制作课堂演示动画
- 学生：把题面文字直接变成可拖动的图形辅助理解
- 科普 / 自媒体作者：批量生成数学与物理可视化素材
- **物理教研场景重点**：力学、运动学、电磁、振动与波、光学的二维示意

### 1.2 设计原则

1. **零后端**：所有逻辑在浏览器内完成，构建产物可直接部署到任意静态托管
2. **现代化前端**：React 19 + Vite 8，开发体验与运行性能兼顾
3. **离线可用 (PWA)**：首次加载后即可离线使用界面与缓存的 GGB SDK；AI 调用需在线
4. **自带 Key**：用户在前端自填 AI API Key，仅存本机 localStorage
5. **AI 输出受控**：强制结构化 JSON，前端校验后再执行
6. **可恢复**：命令执行失败自动反馈给 AI 修复
7. **物理优先**：内置物理领域 prompt 与命令原语，区别于通用数学绘图工具

---

## 2. 范围

### 2.1 MVP 必须有

- [x] 用户在前端自行填入 **AI API Key**（不经过任何后端，仅存浏览器 localStorage）
- [x] 支持 **OpenAI 兼容协议**（覆盖 OpenAI 官方、DeepSeek、Moonshot/Kimi、智谱 GLM、SiliconFlow、Ollama 本地等）
- [x] 内嵌 **GeoGebra Classic** 应用（通过官方 `deployggb.js`，含代数 + 2D + 3D）
- [x] 对话式交互：用户输入需求 → AI 返回 GGB 命令 JSON → 自动执行并显示
- [x] 多轮对话：AI 能在已有构造基础上**追加 / 修改 / 删除**对象
- [x] 错误自修复：执行失败时把错误反馈给 AI，限重试 2 次
- [x] 一键导出：`.ggb` 文件下载、PNG 截图、命令脚本复制
- [x] **PWA 支持**：可安装到桌面 / 主屏，Service Worker 缓存资源，离线可用
- [x] **物理图像生成专项优化**：
  - 物理领域 System Prompt 与 few-shot（运动学、动力学、振动、电磁、光学）
  - 物理量 → GGB 滑块的命名约定（`v0`, `g`, `theta`, `omega`, `m`, `k`, `q`, `B`…）
  - 物理常量预置（`g = 9.8`, `c = 3e8`, `e = 1.6e-19`, `eps0`, `mu0`, `k_e`）
  - 矢量箭头、力图、轨迹、相位图等"物理基元"快捷命令
- [x] **3D 几何支持**：自动识别 3D 意图，2D applet 单向升级为 3D applet；正方体/棱柱/棱锥/圆柱/圆锥/球/截面/空间曲线曲面/螺旋运动等场景
- [x] **中文 prompt 模板库**：12 个一键模板（物理 2D 4 + 数学 2D 4 + 3D 4）
- [x] **`[ASK]` 反问机制**：参数缺失时 AI 反问而非臆测
- [x] **视觉回归测试**：Playwright 驱动的真机截图比对（`test:visual`）

### 2.2 v0.2+ 可选

- [ ] 命令预览面板（执行前可手动编辑 AI 给出的命令）
- [ ] 历史会话持久化（IndexedDB）
- [ ] 兼容 Anthropic 原生协议、Gemini 协议（另写适配器）
- [ ] 3D→2D 主动降级（当前仅单向升级，新对话才彻底重置）

### 2.3 明确不做

- ❌ 用户系统、云存储、计费
- ❌ 重写 GGB 内核，所有几何能力由 GeoGebra 提供
- ❌ 多用户协作

---

## 3. 技术架构

### 3.1 总览

```
┌──────────────────────────────────────────────────────┐
│  React SPA（Vite 构建，无后端）                       │
│                                                      │
│  ┌────────────┐   ┌──────────────┐  ┌──────────┐     │
│  │ <ChatPanel>│──▶│ aiClient.ts  │─▶│ OpenAI   │     │
│  │            │   │ (OpenAI 兼容)│  │ DeepSeek │     │
│  └────────────┘   └──────┬───────┘  │ Moonshot │     │
│        ▲                 │          │ GLM ...  │     │
│        │ Zustand store   ▼          └──────────┘     │
│  ┌─────┴──────┐   ┌──────────────┐                   │
│  │<GGBCanvas> │◀──│ ggbBridge.ts │                   │
│  │            │   │ + schema 校验 │                   │
│  └─────┬──────┘   └──────────────┘                   │
│        ▼                                             │
│  ┌────────────────────────────────────────────────┐  │
│  │   GeoGebra Applet（deployggb.js, 嵌入 iframe）  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### 3.2 技术栈

| 层 | 选型 | 版本 | 理由 |
|---|---|---|---|
| 框架 | **React** | **19.x** | Server Components 不用，但用其新的 `use()` Hook、Actions、`useOptimistic` 改进交互 |
| 构建 | **Vite** | **8.x** | 极速 dev / 原生 ESM / 内置 TS |
| 语言 | TypeScript | 5.x | schema 严格类型 |
| 状态 | Zustand | 5.x | 轻量、对 React 19 友好 |
| 样式 | CSS Modules + CSS Variables | — | 不引入 UI 库，避免重量 |
| AI 通信 | `fetch` + OpenAI Chat Completions 协议 | — | 覆盖主流 provider |
| 几何引擎 | GeoGebra 官方 `deployggb.js`（Classic + web3d） | latest | 2D/3D 功能完备、可嵌入 |
| Markdown | `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex` | 9.x / 4.x / 6.x / 7.x | 渲染 AI 解说与 LaTeX 公式 |
| 图标 | `lucide-react` | ^0.460 | 体积小、风格统一 |
| 持久化 | `localStorage` + Zustand `persist` 中间件 | — | Key、配置、domain |
| **PWA** | **`vite-plugin-pwa` (Workbox)** | **^1.3** | 自动生成 manifest 与 Service Worker，离线缓存 |
| 代码规范 | ESLint 9 (`typescript-eslint` + `eslint-plugin-react-hooks` + `react-refresh`) | latest | 标准 React 19 配置 |
| 测试 | `tsx` + `playwright` | ^4.22 / ^1.61 | 离线回放用 tsx；视觉回归用 Playwright 真机截图 |
| 跨平台脚本 | `cross-env` | ^7.3 | 跨 Windows/POSIX 设置环境变量 |

> **不引 UI 框架**（不上 Antd / MUI）：本工具界面极简，自写组件足够，避免增加打包体积影响首屏。

### 3.3 项目结构

```
e:\Project\AiGGB\
├── SPEC.md                  ← 本规格书
├── README.md                ← 使用说明 + 测试指南
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── .editorconfig
├── .env.example             ← 测试密钥模板（.env 在 .gitignore）
├── index.html               ← Vite 入口（注入 deployggb.js）
├── public\
│   └── favicon.svg          ← PWA 图标（SVG 矢量）
└── src\
    ├── main.tsx             ← React 19 createRoot + StrictMode
    ├── App.tsx              ← 三栏布局 + offline 检测 + 注册 3D 切换回调
    ├── components\
    │   ├── ChatPanel.tsx    ← 左栏：对话 + [ASK] + 格式重试 + 执行自修复 + 3D 升级
    │   ├── MessageBubble.tsx ← 消息气泡（user/assistant/ask/error）
    │   ├── GGBCanvas.tsx    ← 中栏：GeoGebra applet，监听 ggbAppName 重建（2D↔3D）
    │   ├── ScriptPanel.tsx  ← 右栏：实时脚本陈列（可折叠）
    │   ├── SettingsDialog.tsx ← API 配置面板（Provider/Key/模型/温度/测试 + 用量统计图）
    │   ├── TokenUsageChart.tsx ← token 用量统计图（SVG 手绘：堆叠柱状图 + 累计折线）
    │   ├── Toolbar.tsx      ← 顶栏：domain 切换 / 模板 / 撤销 / 导出 / 安装 + token 胶囊
    │   ├── TemplateGallery.tsx ← 物理+数学模板卡片（含 3D）
    │   └── PWAUpdatePrompt.tsx ← SW 更新提示
    ├── lib\
    │   ├── aiClient.ts      ← OpenAI 兼容适配器 + 3-role 模型解析 + AIError/AISchemaError + ping
    │   ├── ggbBridge.ts     ← op→GGB API 执行器 + 容错 + 诊断 + 2D/3D batch 统一启用 + 3D 检测/切换/导出
    │   ├── pipeline.ts      ← 两阶段流水线状态机（纯 TS，可 node 单测）
    │   ├── schema.ts        ← Zod discriminatedUnion + NumLike/BoolLike/IntLike + ask
    │   ├── prompts.ts       ← System Prompt（通用+物理域+3D 规则+白/黑名单+5阶段）
    │   ├── commands.ts      ← GGB 命令白名单（含 3D）+ 黑名单 + 5阶段流程
    │   ├── physics.ts       ← 物理常量库 + 配色
    │   ├── templates.ts     ← 12 个一键模板（物理 2D 4 + 数学 2D 4 + 3D 4）
    │   ├── agentLoop.ts     ← ReAct Agent 工具调用循环（observe→plan→act）
    │   ├── toolExecutor.ts  ← Agent 工具→GGB API 分发（含 3D DockGlassPane 防护 + RAG 纠正）
    │   ├── tools.ts         ← 工具 Function Calling 定义（18 工具 + safe/dangerous 分级）
    │   ├── satisfactionEval.ts ← 满足度评估（画布快照 vs 精炼规格逻辑审查）
    │   ├── specCache.ts     ← 意图→规格缓存（LRU + TTL + 画布指纹键）
    │   ├── specSchema.ts    ← Phase 1 输出校验
    │   ├── refinePrompt.ts  ← Phase 1 精炼 prompt
    │   ├── runControl.ts    ← 单轮运行生命周期（AbortSignal + 取消）
    │   ├── ggbKB.ts         ← RAG 命令知识库（~126 条 + 臆造映射）
    │   ├── commandCorrect.ts ← 后置命令纠正器（Levenshtein + 臆造查表）
    │   └── providers.ts     ← 6 预置 Provider + 自定义（含模型清单与 apiKeyUrl）
    ├── store\
    │   └── useAppStore.ts   ← Zustand persist v3：config/domain/privacy/messages/constructionLog/ggbApi/ggbAppName
    ├── types\
    │   └── ggb.d.ts         ← GGBAppletApi + GGBAppletParameters 类型补丁
    └── styles\
        ├── tokens.css       ← CSS 变量（暗/亮主题）
        └── global.css       ← 全部样式
tests/
    ├── cases.json           ← 63 条测试用例（14 类别，含 highschool 3D 14 条）
    ├── runner.ts            ← 测试运行器（replay/record/smoke）
    ├── mockGGB.ts           ← 轻量 GeoGebra Mock（Point/Vector/Number 类型推断）
    ├── assertions.ts        ← 断言库（12 维校验）
    ├── drift-monitor.ts     ← 漂移监控（N=10 重复 + 分层指标）
    ├── drift-analyze.ts     ← 失败 pattern 自动诊断
    ├── prompt-iterate.ts    ← Prompt 迭代驱动（full/analyze/golden/compare）
    ├── prompt-hash.ts       ← Prompt 版本指纹
    ├── load-env.ts          ← 零依赖 .env 加载器
    ├── visual-screenshots.ts ← 视觉回归主驱动（Playwright，按类别截图）
    ├── visual-capture.ts    ← 浏览器内截图采集脚本
    ├── visual.html / visual-runner.html ← 视觉测试宿主页面
    ├── gen-fixtures.js / gen-fixtures-v3.js ← 在线 fixtures 生成器
    ├── fixtures/            ← 离线回放 AI 响应
    ├── screenshots/         ← 视觉回归产物（按类别子目录）
    ├── versions.json        ← Prompt 版本账本（自动 golden 标记）
    ├── drift-analysis.json  ← 自动生成的漂移分析
    ├── prompt-suggestions.md← 自动生成的可读修复建议
    ├── report.json          ← 最新测试报告（当前 63/63）
    └── report-v4-flash.json / report-v4-pro.json / report-current.json ← 历史与模型对比报告
```

### 3.4 package.json 脚本

```json
{
  "name": "aiggb",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test:replay": "tsx tests/runner.ts",
    "test:record": "cross-env TEST_MODE=record tsx tests/runner.ts",
    "test:smoke": "cross-env TEST_MODE=smoke tsx tests/runner.ts",
    "test:drift": "cross-env DRIFT_BASELINE=0 tsx tests/drift-monitor.ts",
    "test:baseline": "cross-env DRIFT_BASELINE=1 tsx tests/drift-monitor.ts",
    "test:hash": "tsx tests/show-hash.ts",
    "test:visual": "tsx tests/visual-screenshots.ts physics,dynamic,composite",
    "test:visual-all": "tsx tests/visual-screenshots.ts static,dynamic,physics,modify,composite",
    "prompt:iterate": "tsx tests/prompt-iterate.ts full",
    "prompt:analyze": "tsx tests/prompt-iterate.ts analyze",
    "prompt:golden": "tsx tests/prompt-iterate.ts golden",
    "prompt:compare": "tsx tests/prompt-iterate.ts compare"
  },
  "dependencies": {
    "katex": "^0.16.11",
    "lucide-react": "^0.460.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-markdown": "^9.0.0",
    "rehype-katex": "^7.0.0",
    "remark-gfm": "^4.0.0",
    "remark-math": "^6.0.0",
    "zod": "^3.23.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "cross-env": "^7.0.3",
    "eslint": "^9.0.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "globals": "^15.0.0",
    "playwright": "^1.61.1",
    "tsx": "^4.22.4",
    "typescript": "^5.6.0",
    "typescript-eslint": "^8.0.0",
    "vite": "^8.0.0",
    "vite-plugin-pwa": "^1.3.0",
    "workbox-window": "^7.3.0"
  }
}
```

### 3.5 React 19 用法约定

- **入口**：`createRoot(document.getElementById('root')!).render(<App />)`，启用 React 19 自动批处理
- **数据获取**：AI 调用通过 `useTransition` 提供"思考中"的 pending UI（`isThinking` 状态驱动聊天流加载提示）
- **错误边界**：每条消息独立 `<ErrorBoundary>`，单条失败不波及全局
- **避免**：`forwardRef`（React 19 已可直接传 ref 给函数组件）、`defaultProps`（已废弃）
- **Actions**：API 设置表单使用受控 `useState` + `onClick`（测试连接 / 保存 / 清除 Key），未用 React 19 Actions（表单字段少，受控更直白）
- **Compiler**：可选开启 React Compiler（`babel-plugin-react-compiler`），但 MVP 不强制

### 3.6 Vite 8 配置要点

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",          // 有新版本时弹提示，不强制刷新
      injectRegister: "auto",
      manifest: {
        name: "AiGGB · AI 驱动的 GeoGebra 动图生成器",
        short_name: "AiGGB",
        description: "用自然语言生成可交互的数学与物理动态图像",
        theme_color: "#1e88e5",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "any",
        lang: "zh-CN",
        start_url: "./",
        scope: "./",
        icons: [
          { src: "favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
          // 生产如需桌面安装，按 README 补充 192/512/maskable PNG 图标
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            // GeoGebra SDK 与资源：长期缓存
            urlPattern: /^https:\/\/www\.geogebra\.org\/apps\//,
            handler: "CacheFirst",
            options: {
              cacheName: "ggb-sdk",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // GeoGebra CDN（web3d 等附加资源）：长期缓存
            urlPattern: /^https:\/\/cdn\.geogebra\.org\//,
            handler: "CacheFirst",
            options: {
              cacheName: "ggb-cdn",
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // AI provider 请求一律不缓存（涉及密钥与即时性）
            urlPattern: ({ url }) => /\/v1\/chat\/completions$/.test(url.pathname),
            handler: "NetworkOnly"
          }
        ]
      },
      devOptions: { enabled: false }    // 开发时不启用 SW，避免缓存干扰
    })
  ],
  server: { port: 5173, open: true },
  build: {
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      output: {
        // 用函数形式按模块路径分块，兼容 3D 等动态加载场景
        manualChunks: (id: string) => {
          if (id.includes("node_modules")) {
            if (/[\\/]react(-dom)?[\\/]/.test(id) || /[\\/]zustand[\\/]/.test(id)) return "vendor";
            if (/react-markdown|remark-|rehype-|katex/.test(id)) return "markdown";
          }
          return undefined;
        }
      }
    }
  }
});
```

- 不开启 SSR
- GGB SDK 通过 `<script defer>` 标签注入 `index.html`（不走 npm 包，因官方未发布 ESM 版本）；SW 把 `www.geogebra.org/apps/` 与 `cdn.geogebra.org/` 纳入 CacheFirst，安装后离线可用
- 3D applet 通过 `setHTML5Codebase("./GeoGebra/HTML5/5.0/web3d/")` 加载 web3d 代码库，同样落入 CDN 缓存
- AI 请求显式声明 `NetworkOnly`，避免 Workbox 误缓存敏感响应

---

## 3A. PWA 规格（专项）

### 3A.1 离线策略

| 资源 | 策略 | 说明 |
|---|---|---|
| 应用壳（HTML/JS/CSS/字体） | **Precache** (StaleWhileRevalidate) | Workbox build 时哈希注入，每次发版自动失效 |
| GGB SDK & 静态资源 | **CacheFirst** | 首次联网下载后离线可用；30 天过期 |
| AI Chat Completions | **NetworkOnly** | 强制走网，无网时聊天面板提示"AI 需在线" |
| 用户配置 / 会话 | **localStorage / IndexedDB** | 与 SW 无关，浏览器原生持久化 |

### 3A.2 安装与可发现性

- `manifest.webmanifest` 字段齐全（name / icons / theme_color / display / start_url / scope）
- 图标默认使用矢量 `favicon.svg`（`sizes: any`）；生产如需桌面安装，按 README 补充 192/512/maskable PNG
- 顶栏检测 `beforeinstallprompt` 事件，捕获后才显示"安装到桌面"按钮
- 标签页 `<meta name="theme-color">` 与系统深色/浅色模式联动

### 3A.3 更新流程

- `registerType: "prompt"`：检测到新版本后通过 `<PWAUpdatePrompt>` 提示用户"有新版本，刷新启用"
- 用户接受 → `updateSW(true)` → `skipWaiting` 立即激活新 SW
- 用户拒绝 → 下次刷新自动激活
- 任何时候不强制中断当前操作

### 3A.4 离线降级 UI

- 检测 `navigator.onLine === false` → 顶栏黄色横幅"离线模式：仅本地命令可用，AI 调用将失败"
- 输入框发送按钮 disabled，悬停提示原因
- GGB 画布、模板库、历史会话回放均可继续使用

### 3A.5 限制

- iOS Safari：PWA 安装受限，本工具仍可"添加到主屏幕"运行，但不支持系统级通知；不在本范围内
- Windows：Chrome / Edge 完美支持桌面安装
- 不实现 Push 通知、Background Sync（无意义场景）

---

## 4. AI ↔ GGB 协议

让 AI **只输出结构化 JSON**，前端解析后调用 GGB API。这样可以避免模型自由发挥导致的 GGB 语法错误，也能在 schema 层做安全过滤。

### 4.1 输出 Schema

AI 每轮返回如下 JSON：

```json
{
  "explanation": "用一句话描述本次构造或修改",
  "commands": [
    { "op": "eval", "cmd": "A = (0, 0)" },
    { "op": "eval", "cmd": "B = (3, 0)" },
    { "op": "eval", "cmd": "c = Circle(A, B)" },
    { "op": "slider", "name": "t", "min": 0, "max": 6.283, "step": 0.01, "value": 0 },
    { "op": "eval", "cmd": "P = A + (cos(t), sin(t))" },
    { "op": "trace", "target": "P", "on": true },
    { "op": "animate", "target": "t", "speed": 1, "on": true },
    { "op": "style", "target": "c", "color": "#1e88e5", "thickness": 3 },
    { "op": "view", "xmin": -2, "xmax": 4, "ymin": -2, "ymax": 2 }
  ]
}
```

> 顶层还支持可选 `ask: string`（≤300 字）字段：当用户描述缺少可量化参数（半径 / 速度 / 表达式…）时，AI 只设 `ask`、`commands` 留空，前端把问题以独立气泡渲染并等待用户回复，不执行任何命令（见 §8 / §10A.3 的 `[ASK]` 机制）。

### 4.2 支持的操作（`op`）

| op | 字段 | 说明 | 映射到 GGB API |
|---|---|---|---|
| `eval` | `cmd: string` | 执行任意合法 GGB 命令 | `evalCommand(cmd)` |
| `slider` | `name, min, max, step, value, unit?, label?` | 创建滑块（`unit`/`label` 用于物理量显示） | `evalCommand("name = Slider(...)")` + `setCaption` |
| `animate` | `target, speed?, on, repeat?` | 开关动画；`repeat` ∈ `oscillating` / `increasing` / `once` | `setAnimating` + `startAnimation` |
| `trace` | `target, on` | 开关轨迹 | `setTrace(target, on)` |
| `style` | `target, color?, thickness?, visible?, opacity?, dashed?` | 样式 | `setColor` / `setLineThickness` / `setVisible` / `setFilling` / `setLineStyle` |
| `view` | `xmin, xmax, ymin, ymax, axesUnit?` | 视窗范围；`axesUnit` 用于物理单位标注 | `setCoordSystem` +（可选）`setAxisUnits` |
| `caption` | `target, text` | 设置标注（支持 LaTeX） | `setCaption` + `setLabelStyle` |
| `delete` | `target` | 删除对象 | `deleteObject` |
| `reset` | — | 清空画布 | `newConstruction` |
| **`vector`** | `name, from, to, color?, label?` | **物理矢量箭头**（位移 / 速度 / 力 / 场强） | `evalCommand("name = Vector(from, to)")` + 样式；自动把 `at + offsetVar` 形式重写为 `Vector(at, at + Vector((0,0), offsetVar))` 避免 Point+Point |
| **`forceDiagram`** | `at, forces: [{name, vec, color?, label?}]` | **力图基元**：在某点叠加多个力矢量 | 每个力先 `Vector((0,0), vec)` 再 `Vector(at, at + tmp)` + 颜色/标注；辅助矢量自动隐藏 |
| **`physicsTrace`** | `target, mode, fade?` | **物理轨迹**：`mode` ∈ `trail` / `stroboscopic` | MVP 两模式均 `setTrace(target, true)`；`stroboscopic` 由 AI 通过 `Sequence` 显式采样点列实现频闪 |
| **`unitAxes`** | `xUnit, yUnit, xLabel?, yLabel?` | **设置带单位的坐标轴**（如 `t/s` × `x/m`） | `setAxisLabels(1, "xLabel/xUnit", "yLabel/yUnit", "")` |
| **`constants`** | `names: string[]` | **批量引入物理常量**（白名单：`g, c, e, eps0, mu0, k_e, h, k_B`） | 多条 `evalCommand` 赋值 |

### 4.3 校验规则（前端强制，使用 Zod）

```ts
// src/lib/schema.ts
import { z } from "zod";

const Color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "颜色需为 #RRGGBB 形式");

const SafeCmd = z.string().min(1).max(500).refine(
  s => !/<script|javascript:|on\w+=/i.test(s),
  "命令含有危险片段"
);

// 标识符仅 ASCII 字母数字下划线（1~40 字符）
const Identifier = z.string().min(1).max(40).regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "标识符仅允许 ASCII 字母数字下划线");

// 数值/布尔/整数容错：AI 偶把 0.5 输出成 "0.5"、true 输出成 "true"，先做类型归一再校验
const NumLike = z.preprocess(/* number | "1.23" → number */, z.number());
const IntLike = z.preprocess(/* 同 NumLike 但 Math.trunc */, z.number().int());
const BoolLike = z.preprocess(/* "true"/"1"/"on" → true 等 */, z.boolean());

export const PhysicsConstantName = z.enum(["g","c","e","eps0","mu0","k_e","h","k_B"]);

export const Command = z.discriminatedUnion("op", [
  z.object({ op: z.literal("eval"),    cmd: SafeCmd }),
  z.object({ op: z.literal("slider"),  name: Identifier, min: NumLike, max: NumLike, step: NumLike.refine(n => n > 0), value: NumLike, unit: z.string().max(8).optional(), label: z.string().max(40).optional() }),
  z.object({ op: z.literal("animate"), target: Identifier, speed: NumLike.optional(), on: BoolLike, repeat: z.enum(["oscillating","increasing","once"]).optional() }),
  z.object({ op: z.literal("trace"),   target: Identifier, on: BoolLike }),
  z.object({ op: z.literal("style"),   target: Identifier, color: Color.optional(), thickness: IntLike.refine(n => n >= 1 && n <= 13).optional(), visible: BoolLike.optional(), opacity: NumLike.refine(n => n >= 0 && n <= 1).optional(), dashed: BoolLike.optional() }),
  z.object({ op: z.literal("view"),    xmin: NumLike, xmax: NumLike, ymin: NumLike, ymax: NumLike, axesUnit: z.tuple([z.string().max(8), z.string().max(8)]).optional() }),
  z.object({ op: z.literal("caption"), target: Identifier, text: z.string().max(120) }),
  z.object({ op: z.literal("delete"),  target: Identifier }),
  z.object({ op: z.literal("reset") }),

  // —— 物理基元 ——
  z.object({ op: z.literal("vector"),       name: Identifier, from: z.string().max(80), to: z.string().max(80), color: Color.optional(), label: z.string().max(40).optional() }),
  z.object({ op: z.literal("forceDiagram"), at: z.string().max(80), forces: z.array(z.object({ name: Identifier, vec: z.string().max(80), color: Color.optional(), label: z.string().max(40).optional() })).min(1).max(8) }),
  z.object({ op: z.literal("physicsTrace"), target: Identifier, mode: z.enum(["trail","stroboscopic"]), fade: BoolLike.optional() }),
  z.object({ op: z.literal("unitAxes"),     xUnit: z.string().max(8), yUnit: z.string().max(8), xLabel: z.string().max(20).optional(), yLabel: z.string().max(20).optional() }),
  z.object({ op: z.literal("constants"),    names: z.array(PhysicsConstantName).min(1).max(8) }),
]);

export const AIResponse = z.object({
  explanation: z.string().max(500),
  commands: z.array(Command).max(64),
  /** AI 不确定需求时反问用户；有 ask 时 commands 可为空数组 */
  ask: z.string().max(300).optional(),
});
```

校验失败的 commands 被跳过并在 UI 标红，整体失败则进入 §8 自修复回路。

### 4.4 System Prompt 要点

详见 `src/lib/prompts.ts`。基础约束：

1. **强制 JSON 输出**：使用 `response_format: { type: "json_object" }`，并在 prompt 里再次声明
2. **合法语法**：列出常用 GGB 命令清单（`Point`, `Segment`, `Circle`, `Function`, `Locus`, `Vector`, `Rotate`, `Translate`, `Intersect`, `Curve`, `Surface`, `Sequence`, `If`…）
3. **变量名 ASCII**：禁止中文 / 特殊符号
4. **优先动态**：当用户描述含糊时，主动引入 1~2 个滑块驱动动效，呼应"动图"主题
5. **降级声明**：若用户请求超出 GGB 能力，在 `explanation` 中说明并给出近似方案
6. **上下文复用**：多轮对话中应引用已存在的对象名，而非重新声明

#### 物理域增强约束（domain = "physics" 时附加）

7. **量纲与单位**：所有可调参数尽量用 `slider` 并显式指定 `unit`（`m`、`s`、`m/s`、`rad`、`N`、`C`、`T` …）
8. **常量优先用 `constants` op**：避免 AI 凭记忆写错精度（如 `g = 9.81`）
9. **矢量必须用 `vector`/`forceDiagram` 而非裸 `Segment`**：以便正确显示箭头
10. **时间参数命名为 `t`**：单位 `s`，作为驱动动画的滑块
11. **坐标轴用 `unitAxes` 标注**：例如 `t/s × x/m`、`x/m × y/m`、`omega·t × A·sin(omega·t)`
12. **场景默认配色**：位移蓝 `#1e88e5`、速度绿 `#43a047`、加速度橙 `#fb8c00`、力红 `#e53935`、电场紫 `#8e24aa`、磁场青 `#00897b`
13. **轨迹采用 `physicsTrace`**：默认 `trail`；若用户提到"频闪"、"等时间间隔"则用 `stroboscopic`
14. **图像比例**：选择 `view` 时保留 ~10% 边距，确保运动轨迹不出框

System Prompt 在运行时根据当前 **domain**（用户在工具栏切换：`general` / `physics`）拼装；多轮历史只保留最近 `HISTORY_WINDOW = 6` 轮（user+assistant 配对，超出滑窗丢弃），避免上下文爆炸。

#### 通用域附加约束（含 3D）

7. **Point/Vector 类型铁律**：`(x,y)` 赋给变量是 **Point** 而非 Vector；`Point+Point` 未定义会执行失败，`Point+Vector` 才合法。力 / 速度 / 场矢量必须用 `forceDiagram` 或 `vector` op，禁止 `eval` 出中间 Point 变量再做加法。
8. **变量命名受 GGB 首字母类型推断约束**：`u/v/w` → Vector、`A~Z` 单大写 → Point、`f/g/h` → Function；标量须改用 `speed/disp/r` 等避开冲突名。
9. **3D 场景规则**（用户描述含立体 / 正方体 / 圆柱 / 球 / 空间向量 / 螺旋等时附加）：正方体优先 `Cube(A,B)` 两点形式；建体后 `ZoomIn(0.5)` 适配视窗；截面用 `IntersectPath(Plane(...), poly)`；纯 3D applet 禁用 `SetViewDirection/SetFilling/SetPointSize/SetAxesRatio`，透明度改用 `style` 的 `opacity`，标记点用 `Sphere(p, 0.1)`。
10. **已知坑**：`NSolveODE` 不能画 2D 向量场；`Sequence(var, list)` 简写不可靠须用五参形式；距离平方分母必须 `+0.001` 防除零；`SetColor(obj,r,g,b)` 的 r/g/b 必须是 0~255 整数；偶极子 Ex/Ey 分量符号有硬编码模板。

---

## 4A. 物理图像生成专项优化

### 4A.1 目标场景清单

| 子领域 | 典型动图 |
|---|---|
| **运动学** | 匀变速直线运动、斜抛、圆周运动、相对运动 |
| **动力学** | 受力分析图、斜面 + 摩擦、连接体 |
| **振动与波** | 单摆、弹簧振子、横波 / 纵波传播、驻波、相位差 |
| **电磁** | 点电荷电场线、平行板电容、安培力 / 洛伦兹力、电磁感应（导线切割磁感线） |
| **光学** | 反射、折射、凸透镜成像、双缝干涉条纹强度图 |
| **热学（弱支持）** | 理想气体 pV 图、波尔兹曼分布曲线（静态） |

> 上述场景以 **2D 示意 + 滑块驱动** 为主；超出 GGB 仿真能力的（碰撞动力学、流体）显式降级并在 `explanation` 中说明。

### 4A.2 物理常量库（`src/lib/physics.ts`）

```ts
export const PHYSICS_CONSTANTS = {
  g:    { value: 9.8,     unit: "m/s²", desc: "重力加速度" },
  c:    { value: 3e8,     unit: "m/s",  desc: "真空光速" },
  e:    { value: 1.6e-19, unit: "C",    desc: "元电荷" },
  eps0: { value: 8.854e-12, unit: "F/m", desc: "真空介电常数" },
  mu0:  { value: 1.2566e-6, unit: "H/m", desc: "真空磁导率" },
  k_e:  { value: 8.99e9,  unit: "N·m²/C²", desc: "库仑常量" },
  h:    { value: 6.626e-34, unit: "J·s",   desc: "普朗克常量" },
  k_B:  { value: 1.381e-23, unit: "J/K",   desc: "玻尔兹曼常量" },
} as const;
```

`op: "constants"` 会按白名单将这些值以 GGB `evalCommand` 形式注入画布作为只读变量（GGB 中以 `g`、`c` 等命名）。AI prompt 中会说明"如需使用常量请通过 `constants` op 引入，不要自己赋值"。

### 4A.3 物理基元的展开规则（`ggbBridge` 内部）

| op | 展开为 GGB 命令 |
|---|---|
| `vector` | `name = Vector(from, to)` + `SetColor(name, ...)` + 可选 `SetCaption` |
| `forceDiagram` | 对每个力：先 `F_i = Vector(at, at + vec)`，再叠加 `caption`；最后自动按力大小排序颜色 |
| `physicsTrace.trail` | `setTrace(target, true)` |
| `physicsTrace.stroboscopic` | MVP 同样 `setTrace(target, true)`；频闪点列由 AI 在 `eval` 中用 `Sequence(<expr>, t, 0, tMax, dt)` 显式采样生成 |
| `unitAxes` | `SetAxisLabels(1, xLabel/xUnit, yLabel/yUnit, "")`（无 `xLabel` 时退化为 `/xUnit`） |
| `constants` | 对每个名字：`evalCommand("g = 9.8")` 等，名称冲突时跳过，并 `setVisible(name, false)` 隐藏 |

### 4A.4 物理 Few-shot 示例（嵌入 prompts.ts）

**示例 A — 斜抛运动**

用户："演示斜抛运动，初速度 20 m/s，仰角 45°，画出轨迹和瞬时速度矢量"

期望 AI 输出：

```json
{
  "explanation": "斜抛运动：t 为时间，v0 与 theta 可调；红色矢量为速度，蓝色为位置轨迹",
  "commands": [
    {"op":"constants","names":["g"]},
    {"op":"slider","name":"v0","min":1,"max":50,"step":1,"value":20,"unit":"m/s","label":"初速度"},
    {"op":"slider","name":"theta","min":0,"max":1.5708,"step":0.01,"value":0.785,"unit":"rad","label":"仰角"},
    {"op":"slider","name":"t","min":0,"max":5,"step":0.02,"value":0,"unit":"s","label":"时间"},
    {"op":"eval","cmd":"P = (v0*cos(theta)*t, v0*sin(theta)*t - 0.5*g*t^2)"},
    {"op":"eval","cmd":"V = (v0*cos(theta), v0*sin(theta) - g*t)"},
    {"op":"vector","name":"vArrow","from":"P","to":"P+V/5","color":"#43a047","label":"v"},
    {"op":"physicsTrace","target":"P","mode":"trail"},
    {"op":"unitAxes","xUnit":"m","yUnit":"m","xLabel":"x","yLabel":"y"},
    {"op":"view","xmin":-2,"xmax":50,"ymin":-2,"ymax":20},
    {"op":"animate","target":"t","speed":0.5,"on":true,"repeat":"increasing"}
  ]
}
```

**示例 B — 单摆**

用户："画一个长 1 m 的单摆，初始角度 30°"

```json
{
  "explanation": "单摆小角近似：omega = sqrt(g/L)；红色为摆球，蓝色为摆线",
  "commands": [
    {"op":"constants","names":["g"]},
    {"op":"slider","name":"L","min":0.1,"max":2,"step":0.05,"value":1,"unit":"m","label":"摆长"},
    {"op":"slider","name":"theta0","min":0,"max":0.6,"step":0.01,"value":0.524,"unit":"rad","label":"初角"},
    {"op":"slider","name":"t","min":0,"max":10,"step":0.02,"value":0,"unit":"s","label":"时间"},
    {"op":"eval","cmd":"omega = sqrt(g/L)"},
    {"op":"eval","cmd":"theta = theta0 * cos(omega*t)"},
    {"op":"eval","cmd":"O = (0, 0)"},
    {"op":"eval","cmd":"M = (L*sin(theta), -L*cos(theta))"},
    {"op":"eval","cmd":"rope = Segment(O, M)"},
    {"op":"style","target":"rope","color":"#1e88e5","thickness":2},
    {"op":"style","target":"M","color":"#e53935"},
    {"op":"physicsTrace","target":"M","mode":"trail"},
    {"op":"unitAxes","xUnit":"m","yUnit":"m","xLabel":"x","yLabel":"y"},
    {"op":"view","xmin":-1.5,"xmax":1.5,"ymin":-1.5,"ymax":0.3},
    {"op":"animate","target":"t","speed":1,"on":true,"repeat":"increasing"}
  ]
}
```

**示例 C — 受力分析（斜面物块）**

用户："质量 2 kg 的物块在 30° 斜面上，画出受力图"

```json
{
  "explanation": "静止物块的三力图：重力 G、法向支持力 N、摩擦力 f",
  "commands": [
    {"op":"constants","names":["g"]},
    {"op":"slider","name":"m","min":0.1,"max":10,"step":0.1,"value":2,"unit":"kg","label":"质量"},
    {"op":"slider","name":"alpha","min":0,"max":1.2,"step":0.01,"value":0.524,"unit":"rad","label":"倾角"},
    {"op":"eval","cmd":"A = (0,0)"},
    {"op":"eval","cmd":"B = (4*cos(alpha), 4*sin(alpha))"},
    {"op":"eval","cmd":"slope = Segment(A, B)"},
    {"op":"eval","cmd":"P = (2*cos(alpha), 2*sin(alpha))"},
    {"op":"forceDiagram","at":"P","forces":[
      {"name":"G","vec":"(0, -m*g/10)","color":"#e53935","label":"G"},
      {"name":"N","vec":"(-sin(alpha)*m*g*cos(alpha)/10, cos(alpha)*m*g*cos(alpha)/10)","color":"#fb8c00","label":"N"},
      {"name":"f","vec":"(cos(alpha)*m*g*sin(alpha)/10, sin(alpha)*m*g*sin(alpha)/10)","color":"#8e24aa","label":"f"}
    ]},
    {"op":"unitAxes","xUnit":"m","yUnit":"m","xLabel":"x","yLabel":"y"},
    {"op":"view","xmin":-1,"xmax":5,"ymin":-3,"ymax":3}
  ]
}
```

> Few-shot 在 prompt 中以"压缩示例"形式出现（去注释、紧凑 JSON），不超过 1.5K tokens，否则会挤占用户上下文。

### 4A.5 模板库（一键场景）

`<TemplateGallery>` 组件展示如下卡片，点击即注入对应 prompt 直接发送（共 **12 个**：物理 2D 4 + 数学 2D 4 + 3D 4）。3D 模式下展示全部 3D 模板，2D 模式下按当前 domain 过滤展示。

**物理（2D，4）**
- 🏐 斜抛运动 — 抛物线轨迹 + 速度矢量（min/max 落地钳制防穿地）
- 🎯 圆周运动 — 向心加速度 + 转速可调（v/a 同缩放，保持 |a|=ω|v|）
- 🪀 单摆 — 小角近似周期摆动（θ₀≤45° 并 Text 标注近似误差）
- 🧿 偶极子电场 — 电场矢量网格

**数学（2D，4）**
- 〰️ 正弦函数族 — y=A·sin(kx+φ) 三参数可调
- ⭕ 单位圆与三角函数 — 角 θ 对应正弦/余弦线
- 🥚 圆锥曲线 — 椭圆·双曲线·抛物线对比（各带独立焦点：椭圆 ±√|a²−b²|、双曲线 ±√(a²+b²)、抛物线 (0,p)）
- 🔁 摆线 — 滚轮圆周点轨迹

**3D（4）**
- 📦 正方体截面 — 平面 ACF 截正方体（显式顶点 + Prism，避开 Cube 自动命名冲突）
- 🔺 正四面体 — 等边三角锥 · 体积标注
- 🔵 球体截面 — 平面截球 · 截面圆高亮
- 🧬 螺旋运动 — 磁场中的粒子螺旋轨迹

> 注：弹簧振子、横波传播、凸透镜成像、斜面受力、玫瑰线、泰勒展开等更多场景已从模板库**精简**，仍可通过自然语言 prompt 直接生成（弹簧振子 / 横波 / 斜面受力见 `tests/cases.json` 对应用例）。

模板定义在 `src/lib/templates.ts`。每条 prompt 内嵌完整约束（滑块范围与默认值、动画类型、配色、视窗），给 AI 留极小发挥空间，使一句话即可产出"理想动图"。3D 模板归入数学类，由 `ggbBridge` 的 3D 自动检测按需升级 applet，无需单独分类。点击模板会先清空画布与聊天记录再发送，避免新旧构造混乱。

### 4A.6 性能微调（针对动画密集场景）

- GGB applet 初始化时 `enableLabelDrags: false`、`showResetIcon: false`，减少 DOM 交互层级
- 物理动画启动前自动 `setAnimating` 关闭其他动画对象，防止多滑块同时驱动导致卡顿
- `physicsTrace.stroboscopic` 采样上限：`(tMax - tMin) / dt ≤ 200`，超过自动减采
- 滑块默认 `step` 启发：时间类 0.02s、角度类 0.01rad、长度类 1%~5% 量程

### 4A.7 物理域局限与说明

- GGB 不是物理引擎，**不做碰撞、约束、连续介质仿真**
- 涉及 ODE 的场景（如阻尼振动）使用解析解或 Euler 近似 `Sequence`，AI 须在 `explanation` 中点明
- 矢量长度 / 力的大小默认以"视觉比例"显示（不是真实物理量），通过 `caption` 标注真实数值

---

## 4B. 3D 几何支持（专项）

### 4B.1 目标场景

正方体 / 长方体 / 棱柱 / 棱锥 / 圆柱 / 圆锥 / 球 / 四面体、空间截面（平面截立体）、空间曲线（螺旋）、空间向量与叉乘、展开图、三视图、体积与高度度量等中学立体几何与空间物理（如洛伦兹力螺旋运动）场景。

### 4B.2 applet 单向升级策略

GeoGebra 的 `classic`（2D）与 `3d` applet 是两套代码库，运行中无法热切换。本工具采用 **单向升级 + 实例稳定** 策略（`ggbBridge.ts` + `ChatPanel.tsx` + `GGBCanvas.tsx`）：

1. **意图检测**：发送前 `hasUser3DIntent(text)` 用关键词正则（`3D/三维/立体/正方体/圆柱/球体/螺旋/截面/洛伦兹力/叉乘/Cube/Sphere/…`）判断是否需要 3D。
2. **命令兜底检测**：若 AI 返回的 commands 含 3D 命令或三维坐标（`has3DCommands`），即使意图检测漏判也强制升级。
3. **销毁重建**：需要 3D 而当前仍是 2D 时，`switchTo3D()` 写入 `store.ggbAppName = "3d"`，`GGBCanvas` 的 `useEffect([ggbAppName])` 销毁旧 applet 并以 `appName: "3d"` + `setHTML5Codebase("…/web3d/")` 重建。
4. **等待就绪**：`waitForAPI(oldApi)` 轮询 `store.ggbApi` 被替换为新实例（最多 15s 超时），就绪后才执行命令，避免命令打到已销毁的旧实例。
5. **实例稳定**：一旦进入 3D，后续非 3D 语句（修改 / 属性）仍保持在同一 3D 实例（3D applet 同样支持 2D 绘制），**绝不切回 2D**；实例彻底重置只发生在「清空 / 新对话」边界。

### 4B.3 3D 命令白名单（`commands.ts` 节选）

```
3D几何体：Cube(A,B) Cube(A,B,C) Tetrahedron(A,B,C) Prism(poly,point) Pyramid(poly,point)
          Cylinder(circle,h) Cylinder(P1,P2,r) Cone(circle,h) Cone(P1,P2,r) Sphere(O,r) Sphere(P1,P2) Net(poly,idx)
3D曲线曲面：Curve(x(t),y(t),z(t),t,t0,t1) Surface(x,y,z,u,u0,u1,v,v0,v1)
3D求交：IntersectPath(plane,polyhedron) IntersectPath(line,polygon) IntersectConic(plane,quadric)
3D度量：Volume(solid) Height(solid) Distance(p,plane) Angle(line,plane) Angle(P1,vertex,P2)
3D视图：SetViewDirection(dir) SetSpinSpeed(n)   ← 纯 3D applet 中 SetViewDirection 不可用，已禁用
```

### 4B.4 3D 铁律（嵌入 `GGB_5STAGE_FLOW` 与 prompt）

- 正方体优先 `Cube(A,B)` 两点形式（A、B 为底面一条棱的相邻顶点，第三点自动生成，可绕 AB 边旋转）；避免 `Cube(A,B,C)`——三点必须精确构成正方形否则只画点不出体。
- 所有点用 `(x,y,z)` 三维坐标；`IntersectPath(Plane(A,B,C), poly)` 得截面。
- `SetColor(obj, r, g, b)` 中 r/g/b 必须是 0~255 整数，禁止 0~1 浮点。
- `SetFilling` 在 3D 中对立体无效，透明效果用 `style` op 的 `opacity` 字段。
- `SetViewDirection` / `SetPointSize` / `SetAxesRatio(1,1,1)` 在纯 3D applet 中不可靠，禁止生成。
- 创建 3D 对象后必须 `ZoomIn(0.5)` 适配视窗，否则默认相机俯视使立体看似平面。
- 配色约定：几何体 `#90CAF9` opacity 0.3、截面 `#E91E63`、向量 `#4CAF50`、轨迹 `#FF5722`。

### 4B.5 3D 局限

- 同一会话内 2D→3D 单向不可逆（需新对话重置）。
- 截面与展开图依赖 GGB 引擎能力，复杂多面体可能降级。
- 3D 动画性能受 GGB web3d 限制，建议几何体数量 ≤ 几十个。

### 4B.6 3D 画布稳定性 —— DockGlassPane 修复与恢复系统

**根因**：GeoGebra web3d 内部使用 `DockGlassPane`（DIV 遮罩层）处理视图切换动画。当 `api.setPerspective("3d")` 在已有 3D 透视下重复调用，或 `api.setRepaintingActive(true)` 在 3D 模式下触发内部布局重组时，`DockGlassPane` 可能接管并替换 3D 视图 iframe，且过渡动画有时不完成 → iframe 永久消失 → 所有 canvas 归零。症状：画布突然空白但 GGB 工具栏（前进/后退箭头）仍存在。

**三层防御体系**：

| 层 | 文件 | 机制 |
|---|---|---|
| **预防 #1** | `toolExecutor.ts:set_view` (L314-323) | 调用 `api.setPerspective("3d")` 前先 `api.getPerspectiveXML()?.includes("3D")` 检测，已是 3D 则跳过——避免无意义触发 GGB 内部视图过渡 |
| **预防 #2** | `ggbBridge.ts:executeCommands` (L42) | `setRepaintingActive` 批量包裹 **2D/3D 统一启用**（2026-08 升级官方 5.4.927.1 后 DockGlassPane 不再因 batch 复发；禁用 batch 会导致代数区逐条重建闪烁）|
| **预防 #3** | `toolExecutor.ts:executeToolCalls` (L84) | Agent 模式同样统一启用 batch；`setPerspective("3d")` 保留已 3D 则跳过的守卫 |
| **恢复** | `GGBCanvas.tsx` 心跳监控 | 2s 间隔检测 canvas 数量 + DockGlassPane DOM → 自动硬重建 applet |

**心跳恢复流程**（`GGBCanvas.tsx`）：

```
setInterval(2s):
  检测: objCount > 0 && canvasCount === 0 && DockGlassPane 存在
    → containerEl.style.visibility = "hidden"     // 抑制闪烁
    → api.getBase64(cb)                            // 保存画布快照（3s 超时兜底）
    → inject(w, h, force=true)                     // 强制销毁 + 重建 applet
    → api.setBase64(snapshot, () => {              // 恢复画布内容
        containerEl.style.visibility = ""          // 恢复可见
      })
```

关键设计决策：
- **`force` 参数**：`inject(w, h, force)` 新增 `force` 参数（默认 false）。`force=true` 时跳过 `getObjectNumber() > 0` 的对象保留检查，直接销毁重建——因为此时画布已无法渲染，必须强制重建。
- **DockGlassPane 专用路径**：检测到 DockGlassPane 直接走硬重建，不尝试软恢复（`refreshViews` + `setPerspective`），因为：软恢复自身也可能触发新 DockGlassPane；AG↔3d 视图切换本身产生可见闪烁。
- **闪烁抑制**：重建期间容器 `visibility: hidden`，等待快照恢复完成后才恢复可见——用户看到的是"短暂停顿"而非"白屏闪烁"。
- **`inject()` 防御性保护**：`getObjectNumber()` 可能在 3D 忙碌时抛出异常，此时不走销毁流程，仅尝试 `refreshViews()` 触发重绘。

**诊断日志**（`GGBCanvas.tsx`）：所有画布监控日志使用 `[AiGGB:DIAG]` 前缀。包括：
- 心跳 canvas 计数变化（`心跳: canvas 9→0 ⚠DockGlassPane!`）
- MutationObserver DOM 增删（`GGB 容器 DOM 变化: +1 -0`）
- `inject()` 调用栈与 `getObjectNumber()` 结果
- `executeCommands` canvas 计数前后对比
- `containerEl.innerHTML = ''` 销毁点（画布消失的唯一 DOM 操作点）

---

## 4C. Agent 模式（ReAct 工具调用）

除两阶段流水线（Phase 1→确认→Phase 2→执行）外，系统还支持 **Agent 模式**：AI 通过 OpenAI Function Calling 逐步调用工具，每步观察执行结果再决定下一步，形成 observe→plan→act 循环。

### 4C.1 架构

```
用户输入 → runAgentLoop()
  → system prompt（含画布当前对象清单）
  → agentChat（流式返回 tool_calls）
  → [safe 工具直接执行] + [dangerous 工具等待确认]
  → 观察结果注入下一轮
  → 循环直到 AI 返回纯文本（或达到 MAX_AGENT_ITERATIONS=30）
```

关键文件：

| 文件 | 职责 |
|---|---|
| `src/lib/agentLoop.ts` | 主循环：`runAgentLoop()` / `truncateHistory()` / 确认处理器注入 |
| `src/lib/toolExecutor.ts` | 工具→GGB API 分发：`executeToolCall()` / `executeToolCalls()` |
| `src/lib/tools.ts` | 工具定义：OpenAI JSON Schema + Zod 校验 + 安全分级 |

### 4C.2 工具列表（18 个）

| 工具 | 安全等级 | 说明 |
|---|---|---|
| `create_point` / `create_segment` / `create_circle` / `create_polygon` | safe | 基础几何构造 |
| `create_slider` | safe | 创建滑块（含 unit/label/caption） |
| `create_vector` | safe | 矢量箭头（自动 Point→Vector 重写） |
| `create_function` / `create_parametric` | safe | 函数/参数曲线 |
| `create_text` / `create_trace` | safe | 文本标注/轨迹 |
| `physics_constants` / `set_unit_axes` | safe | 物理常量注入/坐标轴单位 |
| `set_style` / `set_animation` / `set_view` | safe | 样式/动画/视窗 |
| `get_object_info` / `list_objects` | safe | 画布查询（供 AI 了解当前状态） |
| `delete_object` / `clear_canvas` | **dangerous** | 删除对象/清空画布 |
| `eval_raw` / `eval_sequence` | **dangerous** | 执行任意 GGB 命令/批量序列 |

### 4C.3 安全确认机制

- **safe** 工具：无需确认，直接执行
- **dangerous** 工具：UI 层弹出确认对话框，用户可选择：批准 / 拒绝 / **信任此会话**（后续所有 dangerous 工具自动通过）
- 确认处理器通过 `registerConfirmationHandler(fn)` 注入（ChatPanel 在启动 agent loop 前注册）

### 4C.4 3D 兼容（DockGlassPane 防护）

Agent 模式的 `toolExecutor.ts` 同样包含 3D 防护：
- `executeToolCalls` 批量执行（`setRepaintingActive` 包裹）在 2D/3D 统一启用（升级官方 5.4.927.1 后 DockGlassPane 不再因 batch 复发）
- `set_view` 工具调用 `setPerspective("3d")` 前检查 `getPerspectiveXML()`，已是 3D 则跳过

### 4C.5 对话历史截断

`truncateHistory(messages, windowSize)` 保留最近 N 条消息，并修复截断边界处的消息配对问题（孤立 tool/tool_calls 消息会被移除），确保 AI 始终收到完整可理解的上下文。

### 4C.6 思考深度（thinking）与 A/B 验证

DeepSeek V4 原生内嵌 thinking（流式返回 `reasoning_content`）。系统通过 `AIConfig.reasoningEffort`（SettingsDialog「思考深度」下拉）控制：

- **默认关闭（baseline）**：`reasoningEffort` 未设置 → 三个调用点（`chat` 编译/修复、`chatRaw` 精炼/评估、`agentChat` Agent 模式）均**不发送** `reasoning_effort` 参数
- **开启**：设置后对支持 thinking 的 provider（`quirks.supportsThinking` = DeepSeek V4）发送 `reasoning_effort`（low/medium/high）
- **Agent 模式实时展示**：`agentChat` 的 `reasoning_content` 增量经 `onReasoning` 回调 → `onThinking` 在 UI 显示 `🧠 思考中…`（截尾 400 字符，经 ChatPanel 120ms 节流），V4 思考阶段不再干等
- **回传门控**：`reasoning_content` 多轮回传受 `quirks.mustRoundtripReasoning` 控制（V4=true，其他 provider 无该字段，回传即 no-op）
- **空响应诊断**：按 `quirks.streamsFinishReason` 判断 `finish_reason="length"` 截断提示是否可信（DeepSeek 流式偶发缺失）

**A/B 验证结论（2026-08，DeepSeek v4-flash，N=10×6 用例，`npm run test:ab`）**：

| 指标 | baseline | thinking(high) | Δ |
|---|---|---|---|
| 端到端通过率 | 85.0% | 76.7% | **−8.3%** |
| completion tokens | 5000 | 5017 | +0.3% |
| 平均延迟 | 44647ms | 44362ms | −285ms |

结论：**`reasoning_effort=high` 在 v4-flash 上损害编译质量（困难物理用例过度思考产出更差命令），token/延迟无收益 → 默认保持关闭**。Agent 模式的 `🧠` 推理展示保留（展示 V4 本来就产生的思考，与质量结论无关）。

---

## 5. 用户交互流程

### 5.1 首次启动

1. 打开应用（开发模式 `npm run dev`，或安装为 PWA 后从桌面启动） → 顶栏弹出 **API 设置面板**
2. 用户选择 Provider 预设（或自填 baseURL）
3. 粘贴 API Key、选择模型名（如 `deepseek-v4-pro` / `deepseek-v4-flash`）
4. 点击「测试连接」→ 通过则保存到 localStorage
5. 引导提示："你也可以将本应用安装到桌面（菜单 → 安装 AiGGB）"

### 5.2 主流程状态机

```
[输入]
   ↓
[思考中] ← AI 调用
   ↓
[命令预览]（可选展开）
   ↓
[执行中] ← GGB 桥接逐条执行
   ↓ 成功                     ↓ 失败
[完成]                  [自修复 ≤ 2 次]
                              ↓ 仍失败
                        [标红 + 等待用户]
```

### 5.3 典型对话示例

```
用户: 画一个单位圆，让点 P 在圆上动起来，并留下轨迹

AI: {
  "explanation": "构造单位圆并让点 P 沿圆周运动，开启轨迹",
  "commands": [
    {"op":"eval","cmd":"O = (0,0)"},
    {"op":"eval","cmd":"c = Circle(O, 1)"},
    {"op":"slider","name":"t","min":0,"max":6.283,"step":0.01,"value":0},
    {"op":"eval","cmd":"P = (cos(t), sin(t))"},
    {"op":"trace","target":"P","on":true},
    {"op":"animate","target":"t","speed":1,"on":true}
  ]
}

用户: 把圆改成红色虚线，再加一条从 O 到 P 的半径

AI: {
  "explanation": "修改圆样式，新增半径线段 OP",
  "commands": [
    {"op":"style","target":"c","color":"#e53935"},
    {"op":"eval","cmd":"SetLineStyle(c, 2)"},
    {"op":"eval","cmd":"r = Segment(O, P)"}
  ]
}
```

### 5.4 工具栏按钮

| 按钮 | 行为 |
|---|---|
| 🗑 清空 | `ggbApi.newConstruction()` 并清空聊天上下文（确认弹窗） |
| ↶ 撤销 | 删除最后一组 user+assistant，`newConstruction()` 后重放剩余 `eval` 命令 |
| 💾 导出 .ggb | `getBase64` → 下载 `aiggb-<ts>.ggb` |
| 📷 截图 | `getPNGBase64` → 下载 `aiggb-<ts>.png` |
| 📋 复制脚本 | 把所有 assistant 回合的 `eval` 命令拼接复制到剪贴板 |
| 📐/⚛ **领域** | 切换 `数学 / 物理`（Sigma / Atom 图标），影响 System Prompt 与默认配色，切换时弹出 toast |
| 📚 **模板** | 打开 `<TemplateGallery>`，点击模板先清空画布与聊天再发送 |
| 📥 **安装应用** | 仅在捕获到 `beforeinstallprompt` 时出现，触发系统安装提示 |
| 🔢 **token 统计** | 顶栏右侧胶囊，实时显示会话累计 token（悬停看 prompt/completion 明细）|
| ⚙ 设置 | 重新打开 API 配置面板（含「用量统计」历史图表）|

### 5.5 Token 用量统计

每次 AI 调用的 token 用量（`usage.prompt_tokens`/`completion_tokens`）经 `onUsage` 回传，累计到 store：

- **数据流**：`chat`/`chatRaw`/`agentChat`/`evaluateSatisfaction` 四个调用点均回传 `onUsage`；`agentChat` 通过 `stream_options.include_usage` 解析流式最后一块的 usage
- **store 三层状态**（`useAppStore.ts`）：
  - `tokenUsage`：会话累计（顶栏胶囊显示，随会话切换/清空重置）
  - `roundTokenUsage`：本轮累计（ChatPanel `runRound` 开始 `startRound` 清零）
  - `tokenHistory`：持久化历史（每轮对话一条 `{ts, prompt, completion}`，`runRound` 结束 `finishRound` 落一条）
- **持久化**：localStorage 独立 key `aiggb_token_usage`，最多保留 100 轮（每条 ~50 字节，约 5KB），与 `aiggb_config`（含 API Key）完全隔离
- **统计图**：设置面板「用量统计」区（`TokenUsageChart.tsx`）——SVG 手绘堆叠柱状图（prompt 蓝 / completion 绿分色）+ 累计折线（橙），两个小图各持单一 Y 轴，原生 `<title>` hover tooltip，含累计输入/输出/合计 stat 卡片

---

## 6. AI Key 配置与隐私

### 6.1 存储

- 键：`aiggb_config`
- 值：

```json
{
  "provider": "deepseek",
  "baseURL": "https://api.deepseek.com",
  "apiKey": "sk-...",
  "model": "deepseek-v4-pro",
  "temperature": 0.2
}
```

- 持久化键 `aiggb_config`（store v2），仅写入 `localStorage`，不发送到任何非 provider 官方端点
- 持久化字段：`config` / `domain` / `privacyAcknowledged`（消息、画布 API、`ggbAppName` 不持久化）

### 6.2 预置 Provider

| Provider | baseURL | 代表模型 | 浏览器直连 |
|---|---|---|---|
| DeepSeek | `https://api.deepseek.com` | `deepseek-v4-pro` / `deepseek-v4-flash` | ✅ |
| Moonshot (Kimi) | `https://api.moonshot.cn/v1` | `kimi-k2-0905-preview` / `kimi-latest` / `moonshot-v1-128k` | ✅ |
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4` | `glm-4.6` / `glm-4.6-flash` / `glm-4.5` | ✅ |
| SiliconFlow | `https://api.siliconflow.cn/v1` | `deepseek-ai/DeepSeek-V3` / `Qwen/Qwen2.5-72B-Instruct` | ✅ |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o` / `gpt-4.1` / `o1-mini` | ✅ |
| Ollama 本地 | `http://localhost:11434/v1` | `qwen2.5:7b` / `llama3.1:8b` | ✅ |
| 自定义 | 用户手填 | 用户手填 | — |

每个预置 Provider 附带模型下拉、官方 `apiKeyUrl`（获取 Key 入口）与说明 `note`；模型支持切到「自定义」手填。`chat()` 统一拼接 `{baseURL}/chat/completions`。

### 6.3 隐私告警

首次保存 Key 时弹窗：

> ⚠️ 你的 API Key 将以明文形式保存在本浏览器的 localStorage 中。
> 请**不要**在公共电脑、共享账户或不信任的浏览器扩展环境下使用本工具。
> 你可以随时点击「设置 → 清除 Key」从本机移除。

---

## 7. 安全设计

| 风险 | 处置 |
|---|---|
| **Key 泄漏** | localStorage + 明示告警 + 一键清除；不写入任何日志或 console |
| **AI 注入恶意命令** | Schema 校验 + `cmd` 字段字符白名单；GGB applet 本身运行在 iframe 沙箱 |
| **XSS** | 聊天流所有 AI 输出经 `textContent` 渲染，禁用 `innerHTML` |
| **CORS** | 仅请求用户配置的 `baseURL`，所有预置 provider 均允许浏览器直连 |
| **任意 URL 请求** | baseURL 必须以 `http://` 或 `https://` 开头，且不能是 IP 段 `0.0.0.0` / `169.254.*`（`isSafeBaseURL`） |
| **依赖污染** | 仅加载 GeoGebra 官方 CDN `https://www.geogebra.org/apps/deployggb.js`（`<script defer>`，无第三方来源）；3D 资源来自官方 `cdn.geogebra.org` web3d |

---

## 8. 错误处理与自修复

### 8.1 错误来源

1. **AI 输出格式错误**：非 JSON / schema 不合规 → 重新请求，附上格式说明
2. **GGB 命令执行失败**：`evalCommand` 返回 `false` → 把失败命令 + 上下文反馈给 AI
3. **网络 / 鉴权错误**：透传错误信息到聊天流，不重试

### 8.2 自修复回路

```
执行命令 → 失败 →
  把 { failedCmd, ggbError, originalRequest } 加入对话历史 →
  再次调用 AI → 得到新 commands → 重新执行
重试上限：2 次
```

### 8.3 用户可见反馈

- 成功：聊天气泡显示 `explanation` + 折叠命令明细
- 部分成功：成功命令绿色 ✓，失败命令红色 ✗ 并给出 GGB 报错原文
- 全部失败：红色气泡 + 「重试 / 编辑命令 / 放弃」按钮

---

## 9. 验收标准

MVP 须通过以下 12 个场景：

| # | 类别 | 场景 | 通过标准 |
|---|---|---|---|
| 1 | 配置 | 配置流 | 从零启动 → 填 key → 1 分钟内出第一张图 |
| 2 | 数学 | 静态几何 | "过三点画圆并标出圆心" → 出现外接圆 + 圆心标签 |
| 3 | 数学 | 函数族 | "画 y=sin(kx)，k 用滑块从 1 到 5" → 滑块可拖动且曲线随动 |
| 4 | 数学 | 动画 + 轨迹 | "摆线" → 自动播放并留下完整轨迹 |
| 5 | 通用 | 多轮修改 | "把那个圆改成红色虚线" → 复用上下文成功修改 |
| 6 | 通用 | 错误恢复 | 故意诱导 AI 写错命令 → 自动重试成功 |
| 7 | 通用 | 导出 | 下载的 `.ggb` 可用桌面版 GeoGebra 打开且效果一致 |
| 8 | **PWA** | 可安装 | Chrome / Edge 浏览器栏出现"安装"图标，安装后桌面独立窗口运行 |
| 9 | **PWA** | 离线壳 | 首次加载后断网刷新仍能打开界面，AI 调用显示离线提示 |
| 10 | **物理** | 斜抛 | "斜抛运动 v0=20 m/s 仰角 45°" → 出现 v0/theta/t 滑块、轨迹、速度矢量 |
| 11 | **物理** | 单摆 | "长 1 m 单摆初角 30°" → 出现摆球周期性摆动且生成轨迹 |
| 12 | **物理** | 受力图 | "30° 斜面上 2 kg 物块的受力分析" → 出现至少 3 个标注的力矢量 |

---

## 10. 性能与可用性指标

| 指标 | 目标 |
|---|---|
| 首屏可交互（开发模式） | < 1 秒（Vite dev server） |
| 首屏可交互（生产构建） | < 2 秒（不含 GGB 首次加载） |
| 主包体积（gzip） | < 80 KB（不含 GGB SDK，GGB 由官方 CDN 异步加载） |
| AI 响应延迟 | 取决于 provider，UI 显示 `useTransition` pending 态 |
| GGB 命令执行 | 单条 < 50 ms；100 条 < 3 秒 |
| 内存占用 | 长会话 < 300 MB |
| 兼容浏览器 | Chrome / Edge / Firefox 最近两年版本，Safari 16+ |

---

## 10A. AI 输出漂移修正框架（防漂移体系）

在 AI + GeoGebra 自然语言动态绘图系统中，大语言模型（DeepSeek 等）的输出必须严格符合 GeoGebra 命令的语法和语义规范。然而，通用模型的固有特性会导致 **输出漂移**：即在连续对话或复杂上下文中逐渐偏离既定规则，产生无效命令、格式污染或逻辑错误。本章详细阐述系统针对漂移问题建立的多层防御与自愈机制。

### 10A.1 漂移的类型与根源

| 漂移类型 | 表现形式 | 根本原因 |
|----------|----------|----------|
| **格式漂移** | 输出问候语、代码块标记（```）、多行解释、空行 | 模型对话惯性，倾向于"礼貌且完整"的回复 |
| **语法漂移** | 命令名拼写错误、大小写混乱、括号不匹配、参数顺序错误 | 训练数据中 GeoGebra 命令样本不足或存在噪声 |
| **语义漂移** | 凭空臆造不存在的命令（如 `AnimateRotation`、`SetOpacity`）、错误使用动态构造逻辑（匿名坐标、依赖缺失） | 模型对 GeoGebra 领域知识的泛化不精确 |
| **上下文遗忘** | 重复创建已存在对象、错误引用对象名、忘记用户之前的修改 | 长对话中注意力散乱，或未及时注入画布状态 |
| **类型推断冲突** | `(x,y)` 赋给变量被 GGB 当作 Point 而非 Vector、`v/u/w` 被强制识别为 Vector 类型 | 模型不了解 GGB 按首字母推断变量类型的约定 |

### 10A.2 四层防漂移体系总览

系统构建了 **提示层 → 清洗层 → 校验层 → 修正层** 的递进防御闭环，每一层都针对特定漂移类型进行拦截和修复。

```
用户输入 → [提示层] → AI 调用 → [清洗层] → [校验层] → [执行层] → 成功
                                            ↓ 失败
                                    [修正层] → 重新调用 AI
```

### 10A.3 提示层约束（源头防漂）

**目标**：在 AI 生成回复前，通过系统提示将输出空间压缩到极小的合法集合内。

| 约束项 | 实现位置 | 说明 |
|---|---|---|
| **铁律** | `prompts.ts:buildPromptBase()` | 纯 JSON 输出；数值字段严格 number；布尔字段严格 true/false；颜色 #RRGGBB；标识符 ASCII |
| **命令白名单** | `commands.ts:GGB_COMMANDS` | 14 类 ~200 条经验证命令，含完整签名；作为 `${GGB_COMMANDS}` 嵌入 system prompt |
| **假命令黑名单** | `commands.ts:GGB_BLACKLIST` | 25 条不存在命令（`PauseAnimation`/`SetOpacity`/`VectorField`…）明确禁止 |
| **5 阶段强制流程** | `commands.ts:GGB_5STAGE_FLOW` | 参数→基础点→图形→动画→属性；严禁匿名坐标、强制 Segment 两端点前置声明 |
| **Point/Vector 类型区分** | `prompts.ts` 专节 | `(x,y)=Point`；`Vector((0,0),(x,y))=Vector`；`Point+Point=❌`；`Point+Vector=✓` |
| **分母防零** | `prompts.ts`「已知坑」 | 所有含距离平方的分母必须加 `+0.001` |
| **偶极子公式模板** | `prompts.ts`「已知坑」 | Ex/Ey 分量符号约定硬编码，防止 AI 推导错误 |
| **唯一合法非命令：`[ASK]`** | `prompts.ts` + `schema.ts` | AI 不确定参数时反问用户，不瞎猜；此时禁止同时输出命令 |
| **思维链自检** | `prompts.ts` 末尾隐式压力 | 规则密集排列迫使模型逐条对照，模拟校对行为 |

> 提示层是**投入产出比最高**的一层——在 prompt 里锁死 1 条规则 = 免除 10 次运行时修复。

### 10A.4 清洗层约束（输出表面净化）

**目标**：即使模型轻微违规，前端也能在解析前去除所有非命令杂质。

| 清洗步骤 | 实现位置 | 说明 |
|---|---|---|
| 去除 Markdown 代码块 | `aiClient.ts:stripCodeFence()` | 正则匹配 ` ```json ... ``` ` 剥离 |
| JSON 容错预处理 | `aiClient.ts:chat()` | `JSON.parse` 失败抛 `AISchemaError`，进入修正循环 |
| Zod 数值/布尔容错 | `schema.ts:NumLike/BoolLike` | `"0.5"`→`0.5`、`"true"`→`true`，不因 1 字符漂移毙掉整轮 |

### 10A.5 校验层约束（本地语法与白名单拦截）

**目标**：在命令进入 GeoGebra 引擎前，由前端进行二次合法性检查，形成最后一道"防火墙"。

| 校验项 | 实现位置 | 说明 |
|---|---|---|
| Schema discriminatedUnion | `schema.ts:Command` | 每个 op 字段驱动后续字段类型；不匹配直接 Zod 报错 |
| 命令名白名单隐含校验 | `schema.ts` op literal | op 值只允许枚举的 15 种，未列出的 op 自动被 Zod 拒绝 |
| `cmd` 字段危险片段过滤 | `schema.ts:SafeCmd` | 拒绝 `<script`、`javascript:`、`onXxx=` |
| 颜色格式正则 | `schema.ts:Color` | 强制 `#RRGGBB` |
| 标识符格式 | `schema.ts:Identifier` | 仅 `[A-Za-z_][A-Za-z0-9_]*` |
| 长度限制 | `explanation`≤500、`cmd`≤500、commands≤64 | 防止输出膨胀 |
| 起点存在性预检 | `ggbBridge.ts:vector/forceDiagram` | 执行前检查 `api.exists(from)` 或 `isCoordLiteral` |

### 10A.6 执行层与修正闭环（自愈机制）

**目标**：当命令在 GeoGebra 中执行失败时，利用 AI 自身的修正能力，将错误信息反馈并生成修正后的命令。

#### 错误捕获
前端逐条执行 `api.evalCommand()`，`try-catch` 所有异常。每条记录：
- 失败命令原文与展开形式
- `api.evalCommand()` 返回的 `false` 或异常消息
- 启发式诊断（`ggbBridge.ts:diagnose()`）——识别分母除零、Point+Point 等高频模式

#### 修正请求构建
将错误列表与**当前画布已存在对象清单（符号表）**一起组装成新的用户消息：

```
【执行失败的命令及错误】
1. 命令：weight = Vector(block, block + Gvec)  → 错误：Point+Point 未定义
   → 诊断：Gvec = (0, -m*g/10) 是 Point 不是 Vector
当前画布对象：g, m, theta, O, R, slope, block
修复建议：将 Gvec 改为 Vector((0,0), (0, -m*g/10))，或改用 forceDiagram op
请修正后重新输出 JSON，不要解释。
```

#### 重试策略与回滚
- **格式重试**：`AISchemaError` → `chatWithFormatRetry()`（`ChatPanel.tsx`），最多 2 次。每次将 raw 输出 + detail 反馈给 AI
- **执行重试**：GGB 命令失败 → `runRound()` 自修复循环，最多 2 次
- **快照回滚**：执行前通过 `api.getBase64()` 保存快照；全部失败时回滚到快照状态，避免半成功状态污染下一轮
- **回滚策略**：若 2 次修正后仍未完全成功，保留已成功部分，失败项在聊天流以红色标注，允许用户手动介入

#### 修复类型优先级
1. **自动容错**（无需 AI 参与）：`forceDiagram Point+Point → Vector((0,0),...)`、`NumLike/BoolLike` 类型转换
2. **启发式诊断**（精准定位）：`diagnose()` 函数匹配已知失败模式
3. **AI 重修复**（通用兜底）：把诊断信息注入修正 prompt

### 10A.7 测试驱动的防漂移验证

完整的测试用例集覆盖所有漂移类型，每次修改提示词或校验规则后，自动运行全量回归测试，确保：
- 格式漂移率 < 1%（生产观测 ≥ 98% 首轮合规）
- 白名单外的假命令出现次数 = 0
- 动态生成必须遵循 5 阶段顺序
- 错误修正成功率 ≥ 95%

### 10A.8 防漂移框架与动态图形生成流程的融合

上述防漂移框架深度嵌入到我们为动态物理/数学演示设计的生成管道中：

```
用户输入 → [提示层] → AI 调用 → [清洗层]
    → [校验层: Zod schema] → [执行层: ggbBridge]
    → 成功 ✓ / 失败 → [修正层: 诊断 → 符号表注入 → 重试]
    → 仍失败 → 用户可读错误 + 手动介入
```

**结论**：通过"提示词强约束 + 前端清洗校验 + 错误自愈闭环 + 符号表注入 + 快照回滚"多维一体的漂移修正框架，系统将通用大模型的非确定性输出转化为工业生产级的可靠 GeoGebra 命令流，为自然语言驱动的动态数学绘图提供了鲁棒性保障。

---

## 10B. 测试框架

### 10B.1 三层测试体系

| 层 | 命令 | 用例数 | API 调用 | 耗时 | 触发 |
|---|---|---|---|---|---|
| **L1 离线回放** | `npm run test:replay` | 63 | 0 | <600ms | 每次 commit |
| **L2 在线冒烟** | `npm run test:smoke` | 5 | 5 次 | ~20s | PR 前 |
| **L3 在线全量** | `npm run test:record` | 63 | 63 次 | ~6min | prompt 变更后 |
| **L4 视觉回归** | `npm run test:visual` / `test:visual-all` | 按类别 | 在线 | 视 prompt/桥接变更 | Playwright 截图 |

### 10B.2 用例覆盖（63 条 × 14 类别）

| 类别 | 数量 | 覆盖目标 |
|---|---|---|
| static | 4 | 圆/函数族/多边形/椭圆 |
| dynamic | 4 | 摆线/旋转/Locus/参数曲线 |
| physics | 5 | 斜抛/单摆/斜面/弹簧/横波 |
| modify | 4 | 颜色/加速度/删除/添加 |
| clarify | 3 | 缺半径/缺速度/缺表达式 → `[ASK]` |
| regression | 9 | 所有已修 bug（Point+Point/Sequence简写/NSolveODE/分母除零/v命名/A命名/code fence/匿名Segment/字符串数字） |
| boundary | 4 | SetLineOpacity/假命令/3D Surface/嵌套Sequence |
| context | 2 | 多轮引用/三轮修改 |
| adversarial | 3 | StopAnimation陷阱/ExportGIF/SetOpacity |
| edge | 3 | 极大参数/空输入/负值 |
| composite | 3 | 双摆/对比轨迹/场+运动 |
| language | 3 | 口语/作业风/中英混合 |
| numeric | 2 | 极小值/零值 |
| **highschool** | **14** | **3D / 立体几何**：正方体截面/圆柱展开/球体积/空间向量/螺旋/棱锥/叉乘/四面体 + 3D 回归（SetColor整数/SetFilling无效/SetPointSize禁用/SetAxesRatio禁用/预声明/禁SetViewDirection） |

### 10B.3 MockGGB 轻量执行验证

- 对象注册表（按命名约定推断 Point/Vector/Number/Function/List）
- 依赖检查（引用未定义对象 → 执行失败）
- Point+Point 类型冲突检测
- 内置常用 GGB 命令名（sin/cos/Vector/Sequence 等 100+ 标识符）

### 10B.4 断言维度（12 项）

```
mustContainCommands / mustNotContainCommands  → 白名单/黑名单命令
mustHaveOps / mustContainPatterns             → op 使用 + 正则匹配
mustNotPatterns / mustContainConstants        → 禁用模式 + 物理常量
executeSuccessRate / containsAsk              → 执行成功率 + ASK 检测
commandCount / schemaValid                    → 数量范围 + schema
mustReferenceExisting                         → 上下文保持
```

### 10B.5 质量门禁

| 通过率 | 状态 |
|---|---|
| ≥ 95% | ✅ 合格，可合并 |
| 85%~95% | ⚠️ 警告，需人工评审 |
| < 85% | 🚫 阻塞，必须修复 |

当前 L1 基线：**63/63 (100.0%)** ✅ 已达标（见 `tests/report.json`）。

---

## 10C. 漂移监控与 Prompt 迭代

### 10C.1 监控四层指标

| 层 | 指标 | 目标 |
|---|---|---|
| L1 清洗层 | 格式漂移率（code fence/问候语污染） | < 1% |
| L2 校验层 | Schema 首轮通过率 | ≥ 99% |
| L3 执行层 | MockGGB 命令执行成功率 | ≥ 95% |
| L4 端到端 | 首轮完全成功率（无需修复） | ≥ 90% |

### 10C.2 漂移类型细分

- **格式漂移**：含 ``` 包裹 / 问候语 / 解释性前缀
- **语法漂移**：非法 JSON / schema 不匹配 / 字符串数字
- **语义漂移**：假命令 / 白名单外命令 / 执行失败
- **类型漂移**：Point+Point / 变量命名冲突（v/V/A）

### 10C.3 迭代工作流

```bash
npm run prompt:iterate   # 完整：测试→分析→建议
npm run prompt:analyze   # 分析最近报告 → 输出 suggestions.md
npm run prompt:golden    # 查看当前最优 prompt 版本
npm run prompt:compare   # 对比最近两个版本
npm run test:hash        # 查看当前 prompt 指纹
```

### 10C.4 版本管理

`tests/versions.json` 自动维护：
- 每次 `test:drift` 追加/更新版本记录
- 按 e2e 通过率降序排列
- 最高通过率 ≥ 85% 自动标 ⭐ golden
- 输出 vs 基线对比（端到端 Δ / 格式漂移 Δ / 延迟 Δ）

### 10C.5 自动分析器

`tests/drift-analyze.ts` — 12 类失败 pattern 自动诊断：
- schema-failure-json / missing-physicsTrace / missing-Locus / missing-Polygon
- missing-Circle / missing-slider-op / missing-animate-op / ask-not-triggered
- command-count-too-low / execution-failure-mock / context-not-referenced / missing-style-op

每个 pattern 输出：受影响的 prompt 规则 + 建议修复 + 修复难度评估

### 10C.6 当前基线

离线 L1 回放（对 fixtures 的 schema + MockGGB 校验，与模型无关）：**63/63 (100.0%)** ✅。

在线 L3（真实模型，历史对比，49 用例集时期）：

| 模型 | 离线 L1 | 在线 L3 | 平均延迟 |
|---|---|---|---|
| v4-flash | 42/49 (85.7%) | 36/49 (73.5%) | 11.5s |
| v4-pro | 42/49 (85.7%) | 37/49 (75.5%) | 18.7s |

**结论**：v4-pro 提升微弱（+2%）但慢 63%。日常推荐 v4-flash，复杂动态 / 3D 场景切 v4-pro。模型对比原始报告见 `tests/report-v4-flash.json` / `report-v4-pro.json`。

### 10C.7 A/B 测试（`test:ab`）与 runDrift 复用

`drift-monitor.ts` 的核心跑批已抽为可复用的 **`runDrift(config, opts)`**（用例选取 → N 次重复 → 分层统计 → 返回完整报告），供 A/B 对比脚本直接调用：

- **`npm run test:ab`**：同用例同次数跑两组——baseline（`reasoningEffort` 未设）vs thinking（`AB_EFFORT`，默认 high），对比端到端/Schema/执行/延迟/**token 成本**，输出 `tests/ab-report.json`。`DRIFT_N` / `DRIFT_SAMPLE` 调规模。
- **`DRIFT_THINKING=high npm run test:drift`**：漂移监控单开 thinking 跑（写报告时带 `thinking=` 标注）。
- **token 统计**：`chat()` 新增 `onUsage` 回调，`DriftRun.tokens` 记录 prompt/completion 用量（此前 `usage` 字段声明但从未填充）。
- **修复的既有 bug**：原版 drift-monitor **从未 `runs.push(run)`**——`computeStats` 对空数组计算，所有统计恒为 0%、质量门禁（e2e<85% 阻塞）从未真正生效。本次重构已修复。

首次 A/B 结论（v4-flash，N=10×6，2026-08）：`reasoning_effort=high` 端到端 **−8.3%**（85.0%→76.7%），token 持平（5000→5017）→ **thinking 默认关闭**。详见 §4C.6。

---

## 10D. 视觉回归测试（Playwright）

离线 L1 只能验证「命令是否合法、能否被 MockGGB 执行」，无法验证「画布上真正画出了什么」。视觉回归用 Playwright 驱动真实浏览器 + 真实 GeoGebra applet，对每个用例截图存档，用于捕获 schema 通过但渲染错误（如只画点不出体、坐标系错位、动画不启动）的回归。

| 项 | 说明 |
|---|---|
| 入口 | `tests/visual-screenshots.ts`（按类别参数化：`physics,dynamic,composite` 等） |
| 宿主 | `tests/visual.html` / `visual-runner.html` + `tests/visual-capture.ts`（浏览器内采集） |
| 脚本 | `npm run test:visual`（精选类别）/ `npm run test:visual-all`（static+dynamic+physics+modify+composite） |
| 产物 | `tests/screenshots/<类别>/` 下按用例 id 存档 PNG |
| 触发时机 | prompt 或 `ggbBridge` 行为变更后人工运行；不纳入每次 commit 的 L1 |

> 视觉回归不设自动阈值比对（GGB 渲染含抗锯齿/动画帧差异），主要用途是**人工肉眼巡检**与**留档对比**，作为 L1~L3 之外的端到端信心补充。

---

## 11. 里程碑

| 里程碑 | 内容 | 状态 |
|---|---|---|
| M1 | 规格书定稿（含 PWA + 物理专项 + 防漂移框架） | ✅ v1.1 |
| M2 | MVP 实现：React 19 + Vite 8 + 三栏布局 + Key 配置 + 四层防漂移 | ✅ 完成 |
| M3 | 错误自修复 + 导出 + PWA 上线 + `[ASK]` 反问 + 符号表注入 + 快照回滚 | ✅ 完成 |
| M4 | 物理域 prompts + 模板库 + Point/Vector 类型检测 + 分母除零防护 + GGB 命令白名单 | ✅ 完成 |
| M5 | 测试框架：用例 × 多类别 × 三层模式 + MockGGB + 漂移分析器 | ✅ v1.2 |
| M6 | 漂移监控：N=10 重复 + 四层指标 + prompt 版本管理 + 迭代驱动 | ✅ v1.3 |
| M7 | 3D 几何支持：意图检测 + applet 单向升级 + 3D 白名单/铁律 + 2 个 3D 模板 + highschool 14 用例 | ✅ v1.4 |
| M8 | 视觉回归测试（Playwright 截图）+ 模板库扩至 16 + 用例扩至 63×14 + store v2 迁移 | ✅ v1.5 |
| M9 | Agent 模式（ReAct 工具调用回路）+ 3D 画布 DockGlassPane 修复与恢复系统 + 3-role 模型配置（主力/轻量/Agent）+ 满足度评估 | ✅ v1.6 |
| M10 | 生产缺陷回流管道、在线 N=10 漂移基线、CI/CD 集成、3D→2D 主动降级 | 🔜 v1.7 |

---

## 12. 附录

### 12.1 常用 GeoGebra 命令速查（供 AI System Prompt 引用）

```
点 / 线：
  Point[<expr>], Segment[A,B], Line[A,B], Ray[A,B], Vector[A,B]

圆 / 圆锥曲线：
  Circle[A,B], Circle[A,r], Ellipse[F1,F2,a], Parabola[F,l], Hyperbola[F1,F2,a]

函数 / 曲线：
  f(x) = ..., Curve[xExpr, yExpr, t, tMin, tMax], Surface[..., u, uMin, uMax, v, ...]

变换：
  Rotate[obj, angle, center], Translate[obj, vec], Reflect[obj, line], Dilate[obj, k, center]

求交 / 构造：
  Intersect[a,b], Midpoint[A,B], PerpendicularBisector[A,B], Tangent[P, c]

动态：
  Slider[min, max, step, ...], Locus[P, slider], Sequence[expr, k, kMin, kMax]
```

### 12.2 OpenAI 兼容请求示例

```http
POST {baseURL}/chat/completions
Authorization: Bearer {apiKey}
Content-Type: application/json

{
  "model": "deepseek-v4-pro",
  "messages": [
    { "role": "system", "content": "<见 prompts.js>" },
    { "role": "user", "content": "画一个单位圆并让 P 在上面动起来" }
  ],
  "response_format": { "type": "json_object" },
  "temperature": 0.2
}
```

### 12.3 GGB Applet 嵌入参数

`<GGBCanvas>` 实际注入参数（`appName` 随 `store.ggbAppName` 在 `classic` / `3d` 间切换；容器尺寸由 `ResizeObserver` 自适应，350ms 防抖重建）：

```js
new GGBApplet({
  appName: ggbAppName,          // "classic" 或 "3d"
  width, height,                // 由容器 getBoundingClientRect 决定
  showToolBar: true,
  showAlgebraInput: true,
  showMenuBar: false,
  showResetIcon: false,
  showKeyboardOnFocus: false,
  enableLabelDrags: false,
  enableShiftDragZoom: true,
  enableRightClick: false,
  errorDialogsActive: false,
  useBrowserForJS: true,
  language: "zh",
  preventFocus: true,
  appletOnLoad: api => setGGBApi(api)   // 写入 store
}, true);
// 3D 模式额外加载 web3d 代码库
if (ggbAppName === "3d") applet.setHTML5Codebase("./GeoGebra/HTML5/5.0/web3d/");
applet.inject("ggb-container");
```

---

**规格书结束。** 经用户确认后进入 M2 实现阶段。
