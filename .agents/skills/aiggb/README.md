# aiggb skill

从 [AiGGB](../../../) 项目抽离的「自然语言 → GeoGebra 命令」能力包，供**任意大模型 / agent** 调用。

## 这是什么

AiGGB 主应用的核心资产是三块：GGB 命令知识库（~130 条实测签名 + 30 条臆造映射）、静态语法预检（10 类检查）、两阶段流水线（精炼→编译→修复）。本 skill 把它们抽成自包含的 CLI + 参考文档：

- **任何模型可用**：不绑定特定 LLM——模型自己写命令，用 CLI 自检；或走 CLI 的两阶段流水线
- **自包含**：`scripts/aiggb.mjs` 单文件 255KB（esbuild 打包，zod 已内联），零运行时依赖，Node ≥18
- **零改动主项目**：全部为新增文件（`.agents/skills/aiggb/`），主项目源码仅作只读上游

## 安装到 agent 环境

本目录（`.agents/skills/aiggb/`）已是 ZCode / Claude Code 等兼容 Agent Skills 规范的技能目录格式：
`SKILL.md`（触发与工作流）+ `references/`（按需加载的知识）+ `scripts/`（可执行工具）。

- **本项目内使用**：无需操作，ZCode 会自动发现 `.agents/skills/aiggb/`
- **全局使用**：把整个 `aiggb/` 目录复制到 `~/.agents/skills/aiggb/`
- **其他工具**：任何支持 Agent Skills / SKILL.md 约定的 harness 同理；不支持技能发现的 agent，把 `SKILL.md` 内容注入 system prompt 并允许其执行 `node scripts/aiggb.mjs` 即可

## 目录结构

```
aiggb/
├── SKILL.md                    # 模型入口：触发条件 + 标准工作流
├── references/
│   ├── protocol.md             # 14-op 命令协议 + 书写规则
│   ├── traps.md                # 陷阱清单（臆造/保留名/值域/3D 禁令，实测积累）
│   ├── commands-2d.md          # 命令参考（构建时从知识库生成）
│   └── commands-3d.md
├── scripts/aiggb.mjs           # 自包含 CLI（离线护栏 + 在线流水线）
├── src/                        # TS 源码（主应用纯 TS 模块快照 + 胶水）
│   ├── ggbKB.ts / commandValidate.ts / commandCorrect.ts / schema.ts / ...
│   ├── envConfig.ts / orchestrator.ts / cli.ts   # skill 侧新增
├── build.mjs                   # esbuild 打包 + 重新生成 references
└── package.json                # devDependencies（仅重新构建时需要）
```

`src/` 中的模块是主应用 `src/lib/` 对应文件的**快照副本**（aiClient/commandValidate/ggbKB 等 12 个，全部无 React/浏览器依赖）。上游更新后复制新版本并 `node build.mjs` 重新打包即可。

## CLI 命令一览

| 命令 | 说明 | 需要 API |
|---|---|---|
| `check` | 校验/纠正原始 GGB 命令文本 | 否 |
| `validate` | 校验 14-op 协议 JSON | 否 |
| `kb <Name>` | 查命令签名/臆造映射 | 否 |
| `list [pattern]` | 列可用命令 | 否 |
| `hallucinations` | 臆造黑名单 | 否 |
| `reference` / `gen-docs` | 输出/生成命令参考 markdown | 否 |
| `refine` | 自然语言 → 分节规格（Phase 1） | 是 |
| `compile` | 规格 → 已校验命令（Phase 2） | 是 |
| `run` | refine → compile 直通 | 是 |
| `render` | 命令 JSON → 真实引擎渲染 → **PNG / GIF 动图 / .ggb 文件** | 否（需引擎+浏览器） |
| `draw` | 自然语言 → 编译 → **PNG / GIF / .ggb 出图** 一条龙 | 是（需引擎+浏览器） |

在线命令环境变量：`AIGGB_API_KEY` / `AIGGB_BASE_URL` / `AIGGB_MODEL` / `AIGGB_LIGHT_MODEL` / `AIGGB_REASONING_EFFORT` / `AIGGB_MAX_OUTPUT_TOKENS` / `AIGGB_TEMPERATURE`。
出图环境变量：`AIGGB_GGB_HOME`（引擎目录）/ `AIGGB_CHROME`（浏览器可执行文件）/ `AIGGB_BROWSER_CHANNEL`。

## 快速体验

```bash
node scripts/aiggb.mjs check --mode 2d -- 'f(x)=x^2' 'ell: x^2/9+y^2/4=1' 'SetVisible(a,true)'
node scripts/aiggb.mjs kb Conic
node scripts/aiggb.mjs list slider
```

## 与主应用的差异（headless 取舍）

- **不执行命令**：产出已校验命令，执行交给 GeoGebra 本体或 AiGGB 应用
- 无画布快照回滚 / 满足度评估 / 训练数据闭环 / 会话历史
- 修复回路降为 1 轮（issue 回喂），无引擎二次确认
- **臆造命令直接判失败**（主应用里靠引擎失败兜底的场景，如 `SetVisible` 静默 no-op）
