# AiGGB · AI 驱动的 GeoGebra 动态图像生成器

> 说人话 / 拍题 → 出动图。React 19 + Vite 8 + GeoGebra + 任意 OpenAI 兼容大模型，纯前端，可装 PWA。

---

## 演示

以下动图由 AiGGB 实际生成（真实 GeoGebra 渲染，非模拟）：

<div align="center">

| 物理 · 斜抛运动 | 物理 · 单摆 |
|---|---|
| ![斜抛运动](docs/demos/P-projectile.gif) | ![单摆](docs/demos/P-pendulum.gif) |

| 物理 · 弹簧振子 | 物理 · 横波传播 |
|---|---|
| ![弹簧振子](docs/demos/P-spring.gif) | ![横波传播](docs/demos/P-wave.gif) |

| 物理 · 斜面受力分析 | 物理 · 磁场圆周运动 |
|---|---|
| ![斜面受力分析](docs/demos/P-incline.gif) | ![磁场圆周运动](docs/demos/X-field-particle.gif) |

| 数学 · 摆线 | 数学 · 旋转变换 |
|---|---|
| ![摆线](docs/demos/D-cycloid.gif) | ![旋转变换](docs/demos/D-rotation.gif) |

| 3D · 棱锥与高（滑块驱动） | 3D · 内接棱柱逼近圆柱 |
|---|---|
| ![棱锥与高](docs/demos/H-pyramid.gif) | ![内接棱柱逼近圆柱](docs/demos/H-cylinder-net.gif) |

</div>

---

## 快速开始

```bash
npm install
npm run dev        # → http://localhost:5173
```

首次启动自动弹出 API 设置面板。推荐 **DeepSeek**（国内直连、速度快）：

| 设置项 | 值 |
|---|---|
| Provider | DeepSeek |
| 模型（主力） | `deepseek-flash`（V4.1-Flash-1017，原生多模态，推荐） |
| 轻量模型（评估/核对，可选） | 留空跟随主力 |
| Agent 模型（对话代理，可选） | 留空跟随主力（⚠ 带图场景请勿选 `deepseek-v4-pro`——不支持图片输入） |
| 视觉模型（题目识别，可选） | 留空跟随主力（原生多模态；主力为 `deepseek-v4-pro` 时必须单独配置） |
| API Key | `sk-...`（从 [platform.deepseek.com](https://platform.deepseek.com/api_keys) 获取） |

点「测试连接」通过后保存，即可开始对话。

> ⚠️ Key 明文存浏览器 localStorage，**勿在公共电脑使用**。随时在设置中清除。

> 💡 **输入框旁的「思考」开关**：借鉴 DeepSeek 对话页的就近开关设计，点击可循环切换思考档位（低→中→高→最高→关闭），无需打开设置面板。它与设置面板中的「思考深度」是同一份配置，自动同步。Agent 构造时的思考/工具步骤可点箭头展开查看全文。

---

## 运行模式

v2.0 起采用**统一 Agent 架构**：纯文字与带图输入都由 Agent 工具循环构造。两阶段"精炼→确认→编译"管线已于 v2.0 移除——Agent 循环 + 工具预检 + 状态核对覆盖同样的质量目标，链路更短、交互更直接。

```
用户输入（纯文字 / 拍题图片）
  → 视觉模型识别题目（仅带图轮）→ 题目确认气泡
  → Agent 工具循环（ReAct）：创建点/滑块/矢量/函数/执行命令…每步拿执行反馈即时调整
  → 画布状态核对（双路：结构快照 + 截图视觉）→ 偏差自动回喂修正
  → 完成（附满足度报告）
```

关键机制：
- **26 个工具**，分 safe / dangerous 两级（`eval_raw`/`delete`/`clear` 需用户确认，可信任会话后自动通过）
- **参数归一化**：Zod 校验 → 安全拦截 → **preFlight 语义预检**（负半径、min≥max、除零、依赖对象缺失在调用 GGB 前拦截，可读错误喂回 AI 自行修正）
- **未知工具过滤**：AI 臆造的工具名直接返回错误，不执行
- **连续失败熔断**：3 轮执行失败自动中止（参数类错误不计入，给模型自我修正机会）
- **思考实时展示**：V4 thinking 的 `reasoning_content` 增量经 `🧠` 气泡实时呈现，思考阶段不再干等
- **可重放**：工具调用 → `toolCallToEvalCommands` 映射为 GGB 命令，undo 回滚与训练回放复用同一套

---

## 多模态题目识别（拍题出动图）

把高中数学 / 物理题目**拍照或截图**发给 AiGGB，AI 自动读题、设计并构造动图。纯文字输入行为完全不变。

### 加图方式（三选一，可混用）

- 点输入框左侧 **📎 按钮**选择图片（可多选）
- **Ctrl+V** 直接粘贴剪贴板截图
- 把图片文件**拖拽**到输入区

每条消息最多 **3 张**（同一题的多张图会合并解读）；自动等比压缩至最长边 1280px 并转 JPEG 后上传，点击缩略图可放大查看。

### 前置配置：视觉模型

**设置 → 高级：角色专用模型 → 视觉模型（题目识别）**，选择支持图片输入的模型：

| Provider | 视觉模型候选 |
|---|---|
| DeepSeek | `deepseek-flash`（V4.1-Flash-1017 原生多模态；`deepseek-v4-pro` 不支持图片） |
| 智谱 GLM | `glm-4.5v` |
| SiliconFlow | `Qwen/Qwen2.5-VL-72B-Instruct` |
| OpenAI | `gpt-4o` / `gpt-4.1` |
| Ollama 本地 | `qwen2.5vl:7b` / `llama3.2-vision` |

> 留空则跟随主力模型（主力须本身多模态）。「测试连接」会顺带验证视觉模型可用性。识别与构造分离：视觉模型负责读题，绘图仍由主力 / Agent 模型完成。
>
> 💡 **带图场景建议主力 / Agent 模型都用 `deepseek-flash`**：带图轮会把原题图片直接交给 Agent 模型（构造时回看原图核对几何关系），`deepseek-v4-pro` 官方不支持图片输入，选它会让图片被静默忽略、退化为纯文字构造。设置面板在 Agent 模型选了非多模态模型时会给出黄色警示。

### 使用流程

1. 附加题目图片（可附一句补充说明，如"画出运动过程"）
2. 视觉模型识别 → 弹出**题目确认气泡**：题干转写、已知量、目标、图示信息、动画要素建议
   - 识别有误 → **编辑题干**直接改正（比重新识别快）
   - 图片不清 → **重新识别**
   - 确认无误 → **确认并绘制**
3. AI 以 Agent 工具循环逐步构造（右侧脚本面板可实时观察）
   - **原图会随任务一起交给绘图模型**，构造过程中可回看原图核对几何关系（平行/垂直/相切/中点），而不是只依赖读题转写出的文字
4. 构造完成时自动**画布状态核对**（双路）：
   - 文本：画布结构化快照 vs 题目解读逐项对照
   - 视觉：**原题图片 vs 画布截图**直接比对（这是交叉验证——即使读题理解有偏差也能被发现），核对几何关系一致性、出框/遮挡/样式
   - 发现偏差自动回喂修正（最多 2 轮）
5. 结束后附满足度评估报告

### 降级与边界

- 识别失败但消息里有文字 → 提示后**直接按文字构造**（仍带原图，模型能看图就还有机会画对）
- 纯图片识别失败 → **反问引导**：换更清晰的图，或直接用文字描述题目
- 题意存疑（图片不清）→ 以普通反问气泡呈现，回复后继续
- 带图轮固定走 Agent 构造；3D 题目请先手动切到 3D 模式
- 多张图（≤3）会逐张标注 `[图1] [图2]` 分别解读，避免模型把多张图混淆成一张
- 历史会话中的图片随消息保存（IndexedDB），刷新后可回看

---

## 如何写好提示词

> AiGGB 将你的自然语言转译为 GeoGebra 命令。描述越精确，结果越接近预期。下面是从入门到进阶的完整指南。

### 一、基础原则

**说清楚三个要素：画什么、参数怎么调、要不动起来。**

| ❌ 太模糊 | ✅ 明确 |
|---|---|
| 画个圆 | 画以原点为圆心、半径为 3 的圆 |
| 画个运动的点 | 点 P 在单位圆上匀速旋转，角速度用滑块控制 |
| 画个函数 | 画 y = sin(kx)，k 用滑块从 1 调到 5 |
| 画个三角锥 | 3D 正四面体边长 3，标注体积 |

> AiGGB 会对**确实缺少核心参数**的请求反问（如"画个圆"没给半径），但能合理默认的不会追问——圆心默认原点、角速度默认 slider=1。

> 📷 也可以直接**上传题目图片**（📎 按钮 / Ctrl+V 粘贴 / 拖拽到输入区），AI 识别题意后自动设计动图——见下文「多模态题目识别」章节。

### 二、让图像动起来

AiGGB 的核心价值是**动态可交互**。默认情况下 AI 会主动引入 slider 和动画，但你可以更精确地控制：

```
✅ "画出摆线，时间 t 自动播放，质点留轨迹"
✅ "斜抛运动 v0=20 m/s，仰角 45°，t 自动播放 increasing"
✅ "弹簧振子 k=10 N/m m=1 kg，下方同步画振动曲线"
```

**关键词**：`自动播放`、`留轨迹`、`滑块可调`、`动画`

### 三、指定参数与滑块

想控制某个量可调？直接说范围与默认值：

```
✅ "振幅 A 滑块 0.5~3 默认 1"
✅ "频率 k 滑块 0.5~5 默认 1"
✅ "质量 m 滑块 0.1~10 kg 默认 2"
✅ "阶数 n 滑块 1~12 默认 5，step=1 整数"
```

不给范围的参数 AI 会给合理默认值（如角速度默认 1 rad/s）。

### 四、物理场景

物理域有**专门优化**（矢量箭头、物理常量、受力分析）。建议切换到⚛物理模式后使用：

```
✅ "斜面 30° 上 2 kg 物块的受力分析，画重力、支持力、摩擦力"
✅ "斜抛 v0=20 仰角 45°，显示速度矢量和轨迹"
✅ "单摆 L=1 m 初角 30°，小角近似，留轨迹"
✅ "横波 y=A·sin(kx−ωt)，t 自动播放"
✅ "驻波：两列反向行波叠加，显示波节和波腹"
✅ "偶极子电场：+q 在 (d,0)，-q 在 (−d,0)，画矢量网格"
```

**物理模式自动启用**：`forceDiagram`（力矢量叠加）、`constants`（g=9.8 等物理常量）、`unitAxes`（坐标轴带单位 m/s）。

### 五、平面 / 3D 切换

AiGGB 默认在**二维平面**作图。工具栏提供手动切换按钮：

- **📐 平面模式**：默认。AI 只用 (x,y) 坐标，禁止 z 轴和三维修命令。即使用户说"正方体"，AI 也只在二维画俯视图或斜二测投影。
- **📦 3D 模式**：点击切换。画布重建为 3D 立体画布，AI 可使用 (x,y,z) 坐标和 Cube/Sphere/Cylinder/Tetrahedron 等 3D 专属命令。

> ⚠️ 切换模式会**清空当前画布和聊天历史**（2D 和 3D 是不同的 GGB 引擎）。

**3D 模式下：**

```
✅ "正方体边长 3，平面 ACF 截正方体，截面红色高亮"
✅ "正四面体边长 3，标注体积"
✅ "圆柱底面半径 2 高 5，展示侧面展开图"
✅ "球体半径 3，用平面 z=1.5 截球，截面橙色高亮"
✅ "空间向量 u=(2,0,0) 红色、v=(1,2,0) 绿色，叉乘 w=u×v 蓝色"
✅ "螺旋线 Curve(cos(t), sin(t), t/3) 橙色，红球 Sphere 表示粒子"
```

> 💡 如果你在平面模式描述 3D 内容，AI 会用二维投影表示。切换到 3D 模式后重新发送同一句话，即可得到真正的三维效果。

### 六、指定样式与配色

```
✅ "圆改成红色虚线，线宽加粗到 3"
✅ "轨迹用蓝色，矢量用绿色 #43a047"
✅ "几何体半透明蓝色 opacity 0.3"
✅ "背景网格隐藏" / "坐标轴标为 x/m 和 y/m"
```

### 七、多轮对话：修改与迭代

对话中 AI 会记住已创建的对象名，后续可以直接修改：

```
第 1 轮："画单位圆，点 P 在圆上旋转，留轨迹"
第 2 轮："把圆的颜色改成蓝色虚线"
第 3 轮："加一条从圆心 O 到 P 的半径，染绿"
第 4 轮："把 P 的轨迹关掉，速度改成 2 倍"
```

> ⚠️ 修改类指令（"改成红色""删除那个点"）需要 AI 在上下文中找到对象名。如果上一轮执行失败导致对象未创建，修改也会失败。

### 八、使用模板库

不想手写提示词？点击工具栏「模板」：

- **平面模式**：按当前 domain（数学/物理）各展示 4 个 2D 模板卡片（数学：正弦函数族、单位圆、圆锥曲线、摆线；物理：斜抛、圆周运动、单摆、偶极子电场）
- **3D 模式**：展示 4 个 3D 立体场景模板（正方体截面、正四面体、球体截面、螺旋运动）

点击卡片自动发送对应 prompt，由 AI 即时生成可拖动调节的动图。

### 九、常见误区

| ❌ 不要这样写 | ✅ 应该这样写 | 原因 |
|---|---|---|
| 画个图 | 画单位圆，点 P 绕圆周运动留轨迹 | 太模糊，AI 会反问 |
| 把速度改成 2 | 把 t 的动画速度改成 2 倍 | 引用明确对象名 |
| v = 5 m/s | 速度 magnitude 用 slider 默认 5 | `v` 在 GGB 中是 Vector 类型，不能做标量 |
| A = 3 | 振幅 A slider 默认 3 | 大写单字母 A 在 GGB 中默认 Point 类型（会与坐标点冲突） |
| 在 2D 画正方体 | 先切到 3D 模式，再画正方体 | 2D 模式 AI 只画投影 |

### 十、写出高质量提示词的检查清单

每次发送前，快速确认：

- [ ] 画什么？对象明确（圆/函数/点/矢量/几何体）
- [ ] 参数可调？slider 范围与默认值清楚
- [ ] 要不动？提到动画/轨迹/自动播放
- [ ] 颜色/样式？需要时直接指定
- [ ] 视窗范围？需要时给出 xmin/xmax/ymin/ymax
- [ ] 2D 还是 3D？工具栏模式正确

---

## 配置 AI Key

支持任意 OpenAI Chat Completions 兼容服务，预置 6 个 provider + 自定义：

| Provider | baseURL | 推荐模型 |
|---|---|---|
| **DeepSeek** | `https://api.deepseek.com` | `deepseek-flash`（V4.1-Flash-1017，推荐）/ `deepseek-v4-pro`（在售，贵约 4 倍，**不支持图片**） |
| Moonshot (Kimi) | `https://api.moonshot.cn/v1` | `kimi-k2-0905-preview` |
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4` | `glm-4.6` / `glm-4.6-flash` |
| SiliconFlow | `https://api.siliconflow.cn/v1` | `deepseek-ai/DeepSeek-V3` |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o` / `gpt-4.1` |
| Ollama 本地 | `http://localhost:11434/v1` | `qwen2.5:7b` 等 |

> 日常推荐 `deepseek-flash`（V4.1-Flash-1017，2026-10-17：原生多模态、1M 上下文、`max_tokens` 上限 384K）。`deepseek-v4-pro` 仍在服务但价格约为 flash 的 4 倍且**不支持图片输入**；旧模型名 `deepseek-v4-flash` / `deepseek-v4-flash-vision-exp` 已下线，服务端暂时路由到 V4.1-Flash-1017。轻量模型用于满足度评估与画布状态核对（可留空跟随主力）。

> 💡 **四类角色模型**（设置 → 高级，均可留空跟随主力）：轻量模型（精炼/评估）、Agent 模型（工具调用代理）、**视觉模型（题目图片识别，需支持图片输入）**。各 provider 视觉候选见「多模态题目识别」章节。

> 💡 **思考深度（Thinking）**：设置面板高级区可调思考深度，**默认「关闭」**。DeepSeek 官方档位为 `none/low/high/max`，服务端原生默认是「开启且 high」，但本项目默认关闭——A/B 实测（N=10×6）`high` 端到端 −8.3%，且思考开启时**服务端会忽略 `temperature`**（Agent 的低温度防工具名幻觉随之失效）。想用思考需显式选档（`max` 档自动配 128K 输出预算）。Agent 模式仍会实时展示模型思考过程（`🧠` 气泡）。

---

## 工具栏

| 按钮 | 功能 |
|---|---|
| 📐 **数学** / ⚛ **物理** | 切换 System Prompt domain（影响 AI 的行为偏好） |
| 📐 **平面** / 📦 **3D** | 手动切换 2D/3D 画布（切换时清空当前会话） |
| 📚 模板 | 打开场景模板库（按当前 domain + 模式过滤） |
| 💬 会话 | 会话历史：多会话新建/切换/删除/重命名，随浏览器保存（含画布快照） |
| ↶ 撤销 | 撤销上一轮 AI 产生的全部命令 |
| 🗑 清空 | 清空画布与聊天历史，重置回平面模式 |
| 💾 导出 .ggb | 下载当前画布为 GeoGebra 文件 |
| 📷 截图 | 导出 PNG |
| 📋 复制脚本 | 把所有 eval 命令拼接复制到剪贴板 |
| 🔢 token 统计 | 顶栏右侧实时显示会话累计 token 用量（悬停看 prompt/completion 明细）|
| ⚙ 设置 | 重新打开 API 配置面板（含「用量统计」历史图表）|

---

## 用量统计（Token）

每次对话的 token 消耗都会持久化到浏览器（`aiggb_token_usage`），供成本追踪：

- **顶栏实时显示**：会话累计 token（输入 prompt + 输出 completion），随会话切换/清空重置
- **设置面板统计图**：「⚙ 设置 → 用量统计」展示每次对话的 token 消耗（堆叠柱状图，prompt/completion 分色）+ 累计趋势折线
- **持久化**：每轮对话一条记录（时间戳 + 输入/输出 token），最多保留最近 100 轮，刷新/重开不丢失

---

## 会话历史（浏览器本地保存）

每次对话自动保存为**会话**，刷新 / 重开页面后恢复，可随时回到任意历史场景继续编辑：

- **自动保存**：每轮 AI 构造完成后，消息 + 画布 base64 快照写入 IndexedDB（`aiggb` 库 v3），不阻塞 UI
- **恢复**：启动时自动装载上次会话（消息 + 画布）；画布快照优先恢复，失败回退重放构造命令
- **多会话管理**：工具栏「💬 会话」→ 新建 / 切换 / 删除 / 重命名
- **存储分离**：会话数据（`aiggb_sessions` 索引 + IndexedDB）与 API Key 配置（`aiggb_config`）完全隔离，不含任何凭据；「清除全部会话」可一键清空
- 容量上限 30 个会话，超出自动淘汰最旧

---

## 运行流程

### 统一 Agent 流水线（纯文字）

```
用户输入
  → Agent 工具循环（ReAct，≤30 次迭代）：
      observe（画布状态）→ plan → act（执行工具，单步反馈）
      ├─ 单步失败 → 错误详情喂回 AI 自行调整（参数/预检类不计熔断）
      ├─ 连续 3 轮失败 → 熔断中止（画布保留）
      └─ 轮次耗尽 → incomplete 可续作（下轮对话接力）
  → AI 输出总结文本 → 完成
  → 全部失败 → 快照回滚 + 重放构造日志
```

### 带图输入（多模态）

```
上传/粘贴/拖拽图片（≤3 张）
  → 视觉模型识别 → 题目解读 JSON（题干/已知量/目标/图示/动画建议）
  → 题目确认气泡（编辑题干 / 重新识别 / 确认并绘制）
  → Agent 工具循环构造（复用全部 Agent 机制：熔断/危险工具确认/快照回滚）
  → AI 输出总结时触发画布状态核对（双路合并）：
    ① 文本结构核对：画布结构化快照 vs 题目解读（轻量模型）
    ② 截图视觉核对：画布截图发给视觉模型（判断出框/遮挡/样式不符/标注不可读）
    → 有偏差 → 问题清单注入循环继续修正（≤2 轮，共享 30 次迭代预算）
    → 通过 / 预算耗尽 → 满足度评估报告 → 完成
```

识别失败但有文字 → 降级为普通 Agent 轮；纯图片失败 → 提示配置视觉模型。视觉核对与识别共用视觉模型配置。

### 七层防漂移（v2.0）

1. **提示层**：Agent system prompt（RAG 命令参考 + 臆造警告 + 5 阶段流程 + Point/Vector 类型铁律 + Sequence 契约）+ known_traps 陷阱动态注入
2. **清洗层**：BOM 剥离 + Code Fence 清理
3. **校验层**：TOOL_SCHEMAS Zod 校验 + SafeCmd 黑名单 + XSS/注入拦截
4. **预检层**：commandValidate 静态语法预检（括号/Sequence 契约/参数个数/3D 禁令/保留名/双等号）+ preFlight 语义预检（负半径/min≥max/除零/依赖缺失）
5. **纠正层**：RAG 命令后置纠正（Levenshtein ≤2 + 臆造映射 + 参数个数校验）
6. **执行层**：Pre-check（animate/trace 目标存在）+ Point+Point 自动重写 + 失败详情喂回 AI 自修复
7. **核对层**：AI 总结时画布状态核对（结构快照 + 截图视觉双路），偏差自动回喂修正

---

## 分层记忆系统

Agent 模式运行时会沉淀可复用的经验，形成训练数据闭环（`trapStore.ts` / `trainingStore.ts` / `trajectoryStore.ts`，IndexedDB 持久化）：

- **prompt_hash**：prompt 版本指纹，标记记忆所对应的 System Prompt 版本
- **L2 场景**：按场景类型（单摆/电场/3D 几何…）分类的记忆索引
- **known_traps**：已确认的 GGB 陷阱（如 Circle 第二参点/半径混淆）——模型踩过并修复后沉淀为规则，下次提前规避
- **符号表**：画布对象名 + 类型快照，多轮修改直接引用
- **偏好**：配色 / 命名 / 视窗风格的用户偏好

每次 ReAct 轨迹（成功/失败）可回放（`npm run test:trajectory`），用当前执行层重放历史轨迹统计修复率，验证"越用越强"。

---

## PWA 安装

- **Chrome / Edge 桌面**：地址栏安装图标，或工具栏「安装」按钮
- **Android**：菜单 → 安装应用
- **iOS Safari**：分享 → 添加到主屏幕

安装后离线可打开界面和已缓存的 GGB SDK；AI 调用需在线。

---

## 技术栈

React 19 · Vite 8 · TypeScript 5 · Zustand 5 · Zod 3 · GeoGebra deployggb.js (5.4.927.1 local bundle) · react-markdown + KaTeX · vite-plugin-pwa (Workbox) · lucide-react

---

## 测试

| 命令 | 说明 |
|---|---|
| `npm run test:unit` | **323 单测（0 API）**：pipeline（含视觉管线）/ ggbBridge / ggbKB / commandValidate / toolExecutor / agentLoop / agentSmoke / satisfactionEval（含视觉审查）/ sessionStore / trainingStore / trajectory-replay / trapStore / runControl / problemSchema / imageInput / providers / schema / aiClient / repaintGate |
| `npm run test:replay` | 离线回归 63 用例（当前 **63/63, 100%**） |
| `npm run test:trajectory` | 用当前执行层重放历史失败轨迹，统计"越用越强"修复率（离线） |
| `npm run test:record` | 在线全量 + 录制 fixtures（需 `.env` 配置 Key） |
| `npm run test:smoke` | 在线冒烟（static + clarify 子集） |
| `npm run test:drift` / `test:baseline` | 漂移监控 N=10 / 更新基线（需 `.env` Key）；`DRIFT_THINKING=high` 可单开 thinking 跑 |
| `npm run test:ab` | **A/B 对比**：thinking 开/关 同用例对比（端到端 + 延迟 + token 成本），输出 `tests/ab-report.json` |
| `npm run test:hash` | 查看 prompt 指纹 |
| `npm run prompt:iterate` / `analyze` / `golden` / `compare` | Prompt 迭代工作流 |
| `npm run test:visual` / `test:visual-all` | Playwright 截图回归 |
| `npm run test:e2e` | 欧几里得 E2E（需真实 Key） |

详见 [SPEC.md](SPEC.md) 第 10B/10C 章。

---

## 项目结构

```
src/
├── main.tsx / App.tsx         入口 + 顶层布局
├── components/
│   ├── ChatPanel.tsx           对话面板（输入 + 图片附件 / 消息渲染 / store 依赖注入 / 发送路由）
│   ├── GGBCanvas.tsx           GeoGebra applet 嵌入（2D/3D 切换 + ResizeObserver 跟随 + 心跳自愈）
│   ├── Toolbar.tsx             工具栏（domain 切换/2D-3D/清空/撤销/导出）
│   ├── TemplateGallery.tsx     模板库（按 domain + 模式双重过滤）
│   ├── ScriptPanel.tsx         实时脚本展示
│   ├── SettingsDialog.tsx      API 配置（4-role 模型 + 思考深度 + 用量统计）
│   ├── SessionDialog.tsx       会话历史弹层（列表/新建/切换/删除/重命名）
│   ├── TrainingDialog.tsx      训练数据管理（统计/导出/导入）
│   ├── TokenUsageChart.tsx     Token 用量统计图（SVG 手绘）
│   └── MessageBubble.tsx / PWAUpdatePrompt.tsx
├── lib/
│   ├── pipeline.ts             Agent 统一管线（runAgentPipeline / runVisionPipeline：识别→题目确认→Agent 构造+状态核对；快照回滚）
│   ├── agentLoop.ts            Agent 模式 ReAct 循环（工具调用 + 熔断 + 未知工具过滤 + 画布状态核对）
│   ├── toolExecutor.ts         Agent 工具执行（Zod 校验 + 安全拦截 + preFlight 语义预检 + 可重放映射）
│   ├── tools.ts                Agent 工具定义（Function Calling schema + 安全分级）
│   ├── aiClient.ts             OpenAI 兼容客户端（chat/chatRaw/agentChat 流式工具调用 + 4-role 模型 + 多模态消息）
│   ├── ggbBridge.ts            op→GGB API 执行器 + 画布快照 + 批量渲染
│   ├── schema.ts               Zod 校验 + CoordExpr 注入防护
│   ├── prompts.ts              System/Compile/Checker Prompt（v2.0 起无调用方，保留兼容）
│   ├── satisfactionEval.ts     满足度评估（flash 模型画布审查）
│   ├── commandCorrect.ts       RAG 命令后置纠正
│   ├── ggbKB.ts                命令知识库（~130 条 + 臆造映射 + 重载签名表）
│   ├── commands.ts             GGB 命令白名单/黑名单
│   ├── commandValidate.ts      执行前静态语法预检（括号/Sequence/参数个数/3D 禁令/保留名/双等号）
│   ├── runControl.ts           单轮运行生命周期管理（AbortSignal/取消）
│   ├── physics.ts              物理常量
│   ├── templates.ts            12 条模板（物理 4 + 数学 4 + 3D 4）
│   ├── providers.ts            AI 预置 provider
│   ├── trainingStore.ts        训练数据闭环（IndexedDB 轨迹持久化）
│   ├── trajectoryStore.ts      ReAct 轨迹构造（供回放/训练）
│   ├── problemSchema.ts        题目识别输出校验（ProblemAnalysis + 确定性序列化）
│   ├── visionPrompt.ts         视觉模型题目识别 Prompt
│   ├── imageInput.ts           图片输入预处理（校验 + 缩放编码）
│   ├── sessionStore.ts         会话历史存储（IndexedDB + localStorage 索引分离）
│   ├── ggbDB.ts                共享 IndexedDB（记忆库 schema 统一建表）
│   └── trapStore.ts            分层记忆系统（prompt_hash / L2场景 / known_traps / 符号表 / 偏好）
├── store/useAppStore.ts        Zustand (persist v4)
├── styles/                     CSS Variables + 全局样式
└── types/ggb.d.ts              GGBAppletApi 类型

tests/
├── runner.ts + cases.json      63 用例离线回放运行器
├── mockGGB.ts                  轻量 GeoGebra Mock（类型推断 + 依赖检查 + 重载校验）
├── toolExecutor.test.ts        工具层 23 用例
├── agentLoop.test.ts           Agent 状态机 13 用例
├── agentSmoke.test.ts          Agent 端到端冒烟 4 场景（单摆/电场/3D/负例）
├── pipeline.test.ts / ggbBridge.test.ts / ggbKB.test.ts / satisfactionEval.test.ts
├── trainingStore.test.ts / trajectory-replay.test.ts / trapStore.test.ts / sessionStore.test.ts
└── fixtures/                   录制的 AI 响应基线
```

---

## License

MIT
