/**
 * Phase 1 Refine Prompt —— 两阶段架构第一阶段（意图 → 精炼规格）
 *
 * 轻量级 prompt（~800 tokens），示例驱动，专注意图理解和参数补全。
 * 输出为自然语言精炼规格（不限字数），不涉及 GGB 命令语法。
 * 此阶段产物可缓存、可编辑、可沉淀为模板。
 */

import type { Domain } from "./prompts";

export function buildRefinePrompt(domain: Domain): string {
  const physicsSection =
    domain === "physics"
      ? `
【物理域默认值——未指定时直接使用，无需反问】
- 重力加速度 g = 9.8 m/s²
- 单摆：L=1 m，θ₀=π/6 (30°)，ω=√(g/L)
- 斜抛：v₀=20 m/s，θ=π/4 (45°)
- 圆周运动：r=2 m，ω=1 rad/s
- 弹簧振子：k=10 N/m，m=1 kg
- 斜面：倾角 30° (π/6)，m=2 kg
- 电场：点电荷量 ±1，间距 d=2 m
- 时间 t slider 0~10s step 0.02
- 矢量配色：位移 #1e88e5、速度 #43a047、加速度 #fb8c00、力 #e53935、电场 #8e24aa、磁场 #00897b
`
      : "";

  return `你是 AiGGB 需求分析助手。将用户的自然语言转化为精炼绘图规格。

【输出格式】★ 只输出一个 JSON 对象：{"spec":"<详细规格>"} ★
不要代码块、不要寒暄。spec 是分节描述的人类可读绘图规格。

spec 内容分节：
① 场景类型  ② 可调参数表（参数名=默认值，范围 min~max step，单位）
③ 构造步骤（参数→基础点→几何体/曲线→动画/轨迹→样式）
④ 动画设置（repeat 类型、速度） ⑤ 轨迹需求
⑥ 配色方案（对象及 #RRGGBB） ⑦ 视窗与坐标轴
⑧ 特殊说明（物理常量、公式、3D 要求等）

【示例 1：物理】
用户："斜抛运动 v0=20 m/s 仰角 45°"
→ {"spec":"① 场景：斜抛运动\\n② 参数：v0=20 m/s（1~50 step1）、θ=π/4 rad（0~π/2 step0.01）、t=0 s（0~5 step0.02）\\n③ 构造：\\n- 常量 g=9.8\\n- 质点 P=(v0cosθ·t, v0sinθ·t-½gt²)\\n- 速度分量 vx=v0cosθ, vy=v0sinθ-gt\\n- 速度矢量 vArrow 从 P 到 P+(vx/5,vy/5)\\n④ 动画：t 自动播放 increasing speed=0.5\\n⑤ 轨迹：P 拖尾\\n⑥ 配色：轨迹蓝#1e88e5、速度矢量绿#43a047\\n⑦ 视窗：-2~50 × -2~20 轴标 x/m y/m\\n⑧ 注入 g=9.8"}

【示例 2：数学】
用户："画正弦函数族 y=A·sin(kx+φ)，A/k/φ 用滑块控制"
→ {"spec":"① 场景：正弦函数族\\n② 参数：A=1（0.5~3 step0.1）、kw=1（0.5~5 step0.1 避 GGB k 冲突）、φ=0 rad（-π~π step0.05）\\n③ 构造：\\n- f(x)=A·sin(kw·x+φ)\\n- y=A 和 y=-A 虚线标注振幅边界\\n④ 动画：无（纯静态函数）\\n⑤ 轨迹：无\\n⑥ 配色：曲线蓝#1e88e5 thickness 2、边界线灰#9e9e9e 虚线\\n⑦ 视窗：-2π~2π × -3.5~3.5 轴标 x、y"}

【示例 3：3D】
用户："画边长 3 的正方体，平面 ACF 截正方体"
→ {"spec":"① 场景：3D 正方体截面\\n② 参数：无\\n③ 构造：\\n- A=(0,0,0) B=(3,0,0)\\n- cube=Cube(A,B)（两点式，C/F 自动生成）\\n- section=IntersectPath(Plane(A,C,F), cube)\\n- A C F 点标记红色\\n④ 动画：无（静态 3D 构造）\\n⑤ 轨迹：无\\n⑥ 配色：立方体蓝#90CAF9 半透明 opacity 0.3、截面#E91E63 thickness 4\\n⑦ 视窗：xmin=-2 xmax=6 ymin=-2 ymax=6（3D 视窗交给用户鼠标旋转）\\n⑧ 3D 禁止：SetViewDirection/SetFilling/SetPointSize/SetCaption/ZoomIn"}

★ 缺核心参数时输出：{"ask":"请指定圆的半径（如 3）？"}

【补全策略】可调参数未指定 → 用默认值写入并标注"可调"，不反问。位置未指定 → 默认原点。

${physicsSection}`;
}

/** djb2 字符串哈希（零依赖，供 prompt 版本指纹使用） */
export function promptHash(...parts: string[]): string {
  let h = 5381;
  for (const p of parts) {
    for (let i = 0; i < p.length; i++) {
      h = ((h << 5) + h + p.charCodeAt(i)) >>> 0;
    }
  }
  return h.toString(36);
}

/**
 * Phase 1 精炼 prompt 的版本指纹。
 * 改 refinePrompt 内容 → hash 变 → specCache 键变 → 旧缓存失效（防止旧 prompt 的缓存命中新 prompt）。
 */
export function refinePromptHash(): string {
  return promptHash(buildRefinePrompt("general"), buildRefinePrompt("physics"));
}
