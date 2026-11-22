---
name: aiggb
description: 用自然语言生成 GeoGebra 绘图命令（数学/物理/几何，2D 与 3D）。当用户想画函数图像、几何图形、物理场景（斜抛运动/单摆/受力分析/电磁场等）、动态演示、分形，或提到 GeoGebra/GGB 命令、需要生成可交互数学图像时使用。提供经过整机实测的命令知识库、静态预检与纠正护栏，任何大模型均可通过本 skill 产出可执行的 GGB 命令。
---

# aiggb — 自然语言 → GeoGebra 命令

本 skill 从 AiGGB 项目抽离了两条能力：

1. **离线护栏**（无需 API Key）：命令知识库查询、静态语法预检、臆造命令纠正——保证产出的 GGB 命令真实可执行
2. **在线两阶段流水线**（需 OpenAI 兼容 API）：精炼规格 → 编译命令，带格式重试与修复回路

所有命令都通过 `node <skill目录>/scripts/aiggb.mjs` 调用（下文简写 `aiggb`），零运行时依赖，Node ≥18。

## 生成命令的标准流程（任何模型走这条路径）

**第 1 步：明确三要素**——领域（数学 general / 物理 physics）、模式（2D / 3D）、动态需求（是否需要滑块/动画/轨迹）。

**第 2 步：读陷阱清单** `references/traps.md`（首次生成本会话必须读一次；臆造命令是 GGB 生成质量的最大杀手）。

**第 3 步：查知识库**，拿到真实签名再写命令，不要凭记忆写：

```bash
aiggb kb Slider          # 查单条命令：签名/参数/示例/注意事项
aiggb kb Conic
aiggb list circle        # 按关键词/类别列命令
aiggb list --mode 3d     # 列 3D 模式全部可用命令
aiggb hallucinations     # 臆造命令黑名单与正确替代
```

详细参考（按需读）：`references/commands-2d.md` / `references/commands-3d.md`。

**第 4 步：起草命令**，遵守 `references/protocol.md` 的书写规则（冒号命名等式、防除零、先 Point 再引用、科学计数法禁用）。

**第 5 步：离线自检（关键步骤，不要跳过）**：

```bash
# 校验/纠正原始 GGB 命令（每个候选命令都过一遍）
aiggb check --mode 2d -- 'v0 = 20' 'x0 = 0' 'y0 = 1.5' 'f(t) = y0 + v0*sin(45°)*t - 0.5*9.8*t^2'

# 校验 14-op 协议 JSON（如果你按协议产出结构化命令）
aiggb validate --mode 3d --file commands.json
```

输出 JSON：`ok` + 每条命令的 `issues`（必须修复）与 `warnings`（审阅后可忽略）。`corrections` 是已自动纠正的命令——**直接采用纠正后的文本**。退出码 1 = 有未通过项，修复后重跑直到 `ok: true`。

**第 6 步：交付**。产出两种形态：
- **原始 GGB 命令**（check 通过的）——可直接粘贴进 GeoGebra Classic 输入栏逐条执行
- **14-op 协议 JSON**（validate 通过的）——供集成方（如 AiGGB 应用）程序化执行

## 在线两阶段流水线（可选，适合复杂场景）

需求复杂或要求高质量时，用流水线让轻量模型先出规格、主力模型再编译（需配置 API）：

```bash
export AIGGB_API_KEY=sk-...
export AIGGB_BASE_URL=https://api.deepseek.com   # 任何 OpenAI 兼容端点
export AIGGB_MODEL=deepseek-chat                  # 可选，默认 deepseek-chat

# Phase 1：自然语言 → 分节规格（人工/AI 可审阅修改）
aiggb refine '画斜抛运动 v0=20m/s 仰角45°，显示轨迹与最大高度' --domain physics --out spec.json

# Phase 2：规格 → 已校验命令 JSON（含护栏修复回路）
aiggb compile --spec spec.json --mode 2d --domain physics

# 或一键直通（跳过审阅）
aiggb run '画单摆小角度摆动' --domain physics --mode 2d
```

- `compile`/`run` 输出的 `commands` 已经过 schema 校验 + 臆造纠正 + 静态预检 + 1 轮自动修复；`self_check` 是 AI 自检报告；`rounds: 2` 表示经历了修复。
- 若返回 `ask`（AI 需要澄清），把问题转述给用户后再重试。
- 其余环境变量：`AIGGB_LIGHT_MODEL`（精炼模型）、`AIGGB_REASONING_EFFORT`（默认 none，实测关闭最优）、`AIGGB_MAX_OUTPUT_TOKENS`、`AIGGB_TEMPERATURE`。也可用 `--api-key/--base-url/--model` 临时覆盖。

## 协议速查（详见 references/protocol.md）

```json
{
  "explanation": "一句话说明",
  "commands": [
    { "op": "eval", "cmd": "A = (1, 2)" },
    { "op": "slider", "name": "t", "min": 0, "max": 10, "step": 0.01, "value": 0, "unit": "s", "label": "时间" },
    { "op": "style", "target": "A", "color": "#CC2222", "pointSize": 5 },
    { "op": "animate", "target": "t", "on": true, "repeat": "oscillating" }
  ],
  "self_check": "已核对：命令在白名单内；无 3D 禁用；先 Point 后引用"
}
```

14 个 op：`eval / slider / animate / trace / style / view / caption / delete / reset / vector / forceDiagram / physicsTrace / unitAxes / constants`。命令排序遵循 5 阶段：**滑块 → Point → 图形 → 动画 → 属性**。

## 硬规则（预检会拦截，一次写对省一轮修复）

1. 命名等式/圆锥曲线用**冒号**：`ell: x^2/9+y^2/4=1`（双等号必失败）
2. `SetColor` 的 r/g/b 是 **0~1 浮点**；透明度 0~1；协议 JSON 颜色用 `#RRGGBB`
3. `SetVisible` 不存在 → `SetVisibleInView(obj, 1, true)`；`El` → `Element`；大写 `Round` → 小写 `round`
4. 保留名不可赋值：`If / xAxis / yAxis / zAxis / x / y / z / e`
5. 科学计数法写 `3 * 10^(8)`，不写 `3e8`
6. 分母加 `+0.001` 防除零；动态线段先 `A = (x,y)` 再 `Segment(A,B)`
7. 3D 禁用清单见 traps.md（SetViewDirection/SetFilling/SetCaption 等），正方体用 `Cube(A,B)` 两点式

## 出图（render / draw）——直接产出 PNG / GIF 动图

命令校验通过后，可用**真实 GGB 引擎**渲染出图：

```bash
# 命令 JSON → PNG（引擎自动探测 AiGGB 项目的 public/GeoGebra；或 --engine 指定）
aiggb render --file commands.json --out figure.png
aiggb render --file figure-3d.json --out fig3d.png --mode 3d --engine /path/to/GeoGebra

# GIF 动图（确定性帧步进驱动动画滑块 → 往复循环，零新依赖）
aiggb render --file commands.json --out demo.gif --gif [--frames 24] [--fps 15] [--anim t]
aiggb render --file cube.json --out cube.gif --mode 3d --gif

# .ggb 构造文件（GeoGebra 直接打开，滑块/动画可继续交互编辑——最有价值的交付物）
aiggb render --file commands.json --out demo.ggb
aiggb draw '画单摆演示，摆长可调' --domain physics --out pendulum.ggb

# 自然语言 → 出图 一条龙（需 AIGGB_API_KEY + 引擎）
aiggb draw '画弹簧振子简谐运动演示' --domain physics --out spring.png --save-cmds spring.json
aiggb draw '画斜抛运动动画' --domain physics --out projectile.gif --gif
```

- `draw` = refine → compile → render 全链路；`--save-cmds` 留存中间命令 JSON
- `--gif`（或 `--out` 以 .gif 结尾）导出动图：自动从 animate op / `StartAnimation(t)` / Slider 定义推导**动画目标滑块与区间**；`--anim` 可显式指定。振荡动画自动往复循环
- `--out` 以 .ggb 结尾（或 `--ggb`）导出 **.ggb 构造文件**：ZIP 容器含 geogebra.xml，GeoGebra 桌面/网页版直接打开，滑块/动画/样式全部保留可继续编辑——**交互交付首选**（已验证引擎回读一致性）
- 输出 JSON 含 `execOk/execTotal`（引擎逐条执行结果）与 `failedIdx`——**渲染失败的具体索引就是最好的修复反馈**，可据此修命令后重新 render
- PNG 默认导出前停止动画（截图确定性）；GIF 模式用帧步进（SetValue 逐帧驱动），确定性等价
- 引擎缺失时：`--engine <目录>`（含 deployggb.js）或环境变量 `AIGGB_GGB_HOME` 或 `--download`（官方 bundle ~50MB）
- 浏览器：需在 skill 目录 `npm i playwright-core`（用系统 Edge/Chrome，无需下载浏览器）；`AIGGB_CHROME` 可指定可执行文件

## 执行说明

本 skill 产出**已校验的命令**，执行三选一：
- `render`/`draw` 直接出图（见上，推荐）
- 粘贴进 GeoGebra Classic / GeoGebra 官网输入栏
- AiGGB 应用（若可用）：14-op JSON 可直接被其流水线消费
- 命令含 `slider/animate/trace` 等交互 op 时，原始 GGB 形态对应 `Slider()`/`StartAnimation()`/`SetTrace()` 命令，同样可在 GeoGebra 中手动执行

## 常见输出字段

- `check` → `{ok, mode, results: [{input, corrected?, warnings, ok, issues}]}`
- `validate` → `{ok, mode, commands(纠正后), corrections, warnings, issues, self_check?, ask?}`
- `refine` → `{ok, title?, spec?, ask?}`
- `compile`/`run` → `{ok, commands, corrections, warnings, issues, rounds, self_check?}`
- `kb <name>` → 命令定义 JSON；若是臆造名返回 `{hallucination: true, correctName|reason}` + 退出码 1
