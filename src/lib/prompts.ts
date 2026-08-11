/**
 * System Prompt 与 Few-shot
 *
 * 核心策略：示例驱动（few-shot）替代规则清单。
 * 2-3 个高质量示例覆盖 80% 的场景模式，剩余 20% 靠紧凑规则 + RAG 命令纠正兜底。
 *
 * 运行时根据 domain + appMode 拼装：
 *   buildSystemPrompt("general", "2d") → 通用数学 + 2D 限制
 *   buildSystemPrompt("physics", "2d") → 物理增强 + 2D 限制
 *   buildSystemPrompt("general", "3d") → 通用数学 + 3D 规则
 */

export type Domain = "general" | "physics";

import { GGB_5STAGE_FLOW } from "./commands";
import { buildCommandReference, buildHallucinationWarnings } from "./ggbKB";

// ═══════════════════════════════════════════════════
// 通用 Few-shot 示例（2D 数学 — 覆盖常用模式）
// ═══════════════════════════════════════════════════
const GENERAL_FEW_SHOT = `
【参考示例 — 以下为经过验证的正确 pattern，直接模仿】

示例 1：2D 几何 + 动画 + 轨迹
用户："画单位圆，点 P 在圆上匀速旋转，留轨迹，显示 sin/cos 线段"
→ {"explanation":"单位圆 + 三角函数线段 + 动画","commands":[
  {"op":"slider","name":"omega","min":0.5,"max":3,"step":0.1,"value":1,"unit":"rad/s","label":"角速度"},
  {"op":"slider","name":"t","min":0,"max":6.283,"step":0.02,"value":0,"unit":"s","label":"时间"},
  {"op":"eval","cmd":"O=(0,0)"},
  {"op":"eval","cmd":"c1=Circle(O,1)"},
  {"op":"style","target":"c1","color":"#1e88e5","thickness":2},
  {"op":"eval","cmd":"P=(cos(omega*t), sin(omega*t))"},
  {"op":"style","target":"P","color":"#e53935","pointSize":5},
  {"op":"eval","cmd":"cosPt=(cos(omega*t),0)"},
  {"op":"eval","cmd":"sinPt=(0,sin(omega*t))"},
  {"op":"eval","cmd":"rSeg=Segment(O,P)"},
  {"op":"style","target":"rSeg","color":"#43a047","thickness":2},
  {"op":"eval","cmd":"sinSeg=Segment(P,cosPt)"},
  {"op":"style","target":"sinSeg","color":"#fb8c00","dashed":true},
  {"op":"eval","cmd":"cosSeg=Segment(P,sinPt)"},
  {"op":"style","target":"cosSeg","color":"#8e24aa","dashed":true},
  {"op":"trace","target":"P","on":true},
  {"op":"view","xmin":-1.5,"xmax":1.5,"ymin":-1.5,"ymax":1.5},
  {"op":"animate","target":"t","speed":1,"on":true,"repeat":"oscillating"}
]}

示例 2：2D 函数族 + 参数滑块
用户："画正弦函数族 y=A·sin(kx+φ)，A/k/φ 用滑块控制，区间 -2π 到 2π"
→ {"explanation":"三参数可调的正弦函数族","commands":[
  {"op":"slider","name":"A","min":0.5,"max":3,"step":0.1,"value":1,"label":"振幅"},
  {"op":"slider","name":"kw","min":0.5,"max":5,"step":0.1,"value":1,"label":"频率"},
  {"op":"slider","name":"phi","min":-3.1416,"max":3.1416,"step":0.05,"value":0,"unit":"rad","label":"相位"},
  {"op":"eval","cmd":"f(x)=A*sin(kw*x+phi)"},
  {"op":"style","target":"f","color":"#1e88e5","thickness":2},
  {"op":"eval","cmd":"topLine: y=A"},
  {"op":"eval","cmd":"botLine: y=-A"},
  {"op":"style","target":"topLine","color":"#9e9e9e","dashed":true},
  {"op":"style","target":"botLine","color":"#9e9e9e","dashed":true},
  {"op":"view","xmin":-6.283,"xmax":6.283,"ymin":-3.5,"ymax":3.5}
]}`;

// ═══════════════════════════════════════════════════
// 物理 Few-shot 示例（已有，保留）
// ═══════════════════════════════════════════════════
const PHYSICS_FEW_SHOT = `
【参考示例 — 以下为经过验证的正确 pattern，直接模仿】

示例 3：2D 抛体运动（矢量 + 轨迹 + 动画）
用户："斜抛运动 v0=20 m/s 仰角 45°"
→ {"explanation":"斜抛：常量→滑块→质点→速度矢量→轨迹→单位轴→动画","commands":[
  {"op":"constants","names":["g"]},
  {"op":"slider","name":"v0","min":1,"max":50,"step":1,"value":20,"unit":"m/s","label":"初速"},
  {"op":"slider","name":"theta","min":0,"max":1.5708,"step":0.01,"value":0.785,"unit":"rad","label":"仰角"},
  {"op":"slider","name":"t","min":0,"max":5,"step":0.02,"value":0,"unit":"s","label":"时间"},
  {"op":"eval","cmd":"P = (v0*cos(theta)*t, v0*sin(theta)*t - 0.5*g*t^2)"},
  {"op":"style","target":"P","color":"#e53935","pointSize":4},
  {"op":"eval","cmd":"vx = v0*cos(theta)"},
  {"op":"eval","cmd":"vy = v0*sin(theta) - g*t"},
  {"op":"eval","cmd":"Ptip = P + (vx/5, vy/5)"},
  {"op":"vector","name":"vArrow","from":"P","to":"Ptip","color":"#43a047","label":"v"},
  {"op":"physicsTrace","target":"P","mode":"trail"},
  {"op":"unitAxes","xUnit":"m","yUnit":"m"},
  {"op":"view","xmin":-2,"xmax":50,"ymin":-2,"ymax":20},
  {"op":"animate","target":"t","speed":0.5,"on":true,"repeat":"increasing"}
]}

示例 4：2D 电场矢量网格（Sequence 嵌套 + 除零防护）
用户："两个点电荷的电场示意图"
→ {"explanation":"偶极子：Ex/Ey分量函数+分母+0.01防零+嵌套Sequence矢量网格","commands":[
  {"op":"slider","name":"d","min":1,"max":4,"step":0.1,"value":2,"unit":"m","label":"间距/2"},
  {"op":"slider","name":"qmag","min":1,"max":5,"step":0.5,"value":1,"unit":"","label":"电荷量"},
  {"op":"eval","cmd":"A=(d,0)"},
  {"op":"eval","cmd":"B=(-d,0)"},
  {"op":"style","target":"A","color":"#e53935","pointSize":5},
  {"op":"style","target":"B","color":"#1e88e5","pointSize":5},
  {"op":"eval","cmd":"Ex(x,y)=qmag*(x-d)/((x-d)^2+y^2+0.01)^1.5 - qmag*(x+d)/((x+d)^2+y^2+0.01)^1.5"},
  {"op":"eval","cmd":"Ey(x,y)=qmag*y/((x-d)^2+y^2+0.01)^1.5 - qmag*y/((x+d)^2+y^2+0.01)^1.5"},
  {"op":"eval","cmd":"Emag(x,y)=sqrt(Ex(x,y)^2+Ey(x,y)^2+0.001)"},
  {"op":"eval","cmd":"gridStep=0.4"},
  {"op":"eval","cmd":"arrows=Sequence(Sequence(Vector((i,j),(i+gridStep*Ex(i,j)/Emag(i,j),j+gridStep*Ey(i,j)/Emag(i,j))),i,-4,4,1),j,-3,3,1)"},
  {"op":"style","target":"arrows","color":"#8e24aa"},
  {"op":"unitAxes","xUnit":"m","yUnit":"m"},
  {"op":"view","xmin":-5,"xmax":5,"ymin":-4,"ymax":4}
]}`;

// ═══════════════════════════════════════════════════
// 模式 Header
// ═══════════════════════════════════════════════════
const MODE_2D_HEADER = `
【当前模式：2D 平面】
你正在二维平面画布上作图。只使用 (x,y) 坐标，禁止 z 轴和 3D 几何命令（Cube/Sphere/Tetrahedron…）。`;

const MODE_3D_ADDON = `
【当前模式：3D 三维】
你正在三维画布上作图。可使用 (x,y,z) 坐标和 3D 几何体命令。

示例 5：3D 正方体截面
用户："画边长 3 的正方体，显示平面 ACF 截面"
→ {"explanation":"两点 Cube 构造（A/B 声明后 C/F 自动生成勿重声明）+ 截面高亮","commands":[
  {"op":"eval","cmd":"A=(0,0,0)"},
  {"op":"eval","cmd":"B=(3,0,0)"},
  {"op":"eval","cmd":"cube=Cube(A,B)"},
  {"op":"style","target":"cube","color":"#90CAF9","opacity":0.3},
  {"op":"eval","cmd":"section=IntersectPath(Plane(A,C,F),cube)"},
  {"op":"style","target":"section","color":"#E91E63","thickness":4},
  {"op":"eval","cmd":"D=(3,3,0)"},
  {"op":"eval","cmd":"E=(0,3,0)"},
  {"op":"view","xmin":-2,"xmax":6,"ymin":-2,"ymax":6}
]}

【3D 铁律】
- 正方体优先两点式 Cube(A,B)。截面用到 A/C/F 时勿重声明（它们由 Cube 自动生成）。
- ★ Cross(u,v) 返回自由 Vector → Vector(O,wVec) ❌ 崩。两步法：end = O + wVec; Vector(O,end) ✓
- ★ 3D 禁用（执行即失败）：SetViewDirection / SetFilling / SetPointSize / SetAxesRatio / SetCaption / ShowLabel / SetLabelMode / Rename / ZoomIn
  替代：透明度用 style opacity；标记顶点用 Sphere(P,0.2)；标注用 Text("<文字>", Point)；视窗用 view op
- 配色：几何体不透明 #90CAF9、截面 #E91E63`;

// ═══════════════════════════════════════════════════
// 物理域后缀
// ═══════════════════════════════════════════════════
const PHYSICS_ADDON = `
【物理域增强】
- 参数 slider 带 unit 字段（m/s, rad, kg, N/m…）。时间滑块命名为 t。
- 物理常量 g/c/e… 用 constants op 注入（示例 3）。
- 力/速度矢量用 forceDiagram 或 vector op。禁止 Point+Point。
- 分母含距离平方必须 +0.001 防除零（示例 4 的 Ex/Ey 公式）。
- 轨迹默认 trail；频闪用 physicsTrace mode=stroboscopic。
- 默认配色：位移 #1e88e5、速度 #43a047、加速度 #fb8c00、力 #e53935、电场 #8e24aa、磁场 #00897b。`;

function buildPromptBase(appMode: "2d" | "3d", domain: Domain, phase: "full" | "compile" = "full"): string {
  const cmdRef = buildCommandReference(appMode, domain);
  const hallucWarn = buildHallucinationWarnings(appMode);

  const phaseIntro = phase === "compile"
    ? "你是 AiGGB 命令编译器。用户消息是已精炼完成的绘图规格（含全部参数、配色、动画细节）。将其编译为 GGB 命令 JSON。禁止反问、禁止新增需求、禁止改写规格中的参数与对象名。参考示例中的命令 pattern。"
    : "你是 AiGGB 助手，将用户的自然语言需求转为 GGB 命令 JSON。参考以下示例直接生成正确输出。";

  const selfCheckSection = phase === "compile"
    ? "\n【自检要求】JSON 中必须包含 \"self_check\" 字段（≤200 字）。逐项核对：① eval 命令名在白名单？② 无 SetViewDirection/SetFilling 等 3D 禁用命令？③ Vector 参数合法（非 Point+Point）？④ 分母 +0.001？⑤ 参数个数匹配？⑥ 无中文变量名？全通过写 \"ok\"。"
    : "";

  const askSection = phase === "compile"
    ? "\n【输入说明】收到的是一份已确定所有参数的绘图规格。直接编译为命令，禁止反问（ask 字段省略）。"
    : "【反问（最后手段）】仅当缺「核心定义参数」且无法合理默认时才反问（如\\\"画个圆\\\"无半径、\\\"画个函数\\\"无表达式）。能默认就默认：圆心默认原点、角速度默认 1、未给 slider 的参数一律给合理默认值让用户拖动调节。反问格式：{\\\"explanation\\\":\\\"...\\\",\\\"commands\\\":[],\\\"ask\\\":\\\"...\\\"}";

  return phaseIntro + "\n\n" + [
    "═══ 输出格式 ═══",
    "★ 只输出纯 JSON 对象，无任何额外字符 ★",
    "禁止 Markdown 代码块（\\`\\`\\`json）、禁止\\\"好的\\\" \\\"这是\\\" 等解释文字、禁止前后缀。",
    phase === "compile"
      ? "JSON 结构：{ \"explanation\": \"<一句话说明>\", \"commands\": [...], \"self_check\": \"<自检报告>\" }"
      : "JSON 结构：{ \"explanation\": \"<≤80 汉字的本轮说明>\", \"commands\": [<命令对象>] }",
    "",
    "═══ 14 个命令 op ═══",
    "- eval    { cmd }                                  执行合法 GGB 命令",
    "- slider  { name, min, max, step, value, unit?, label? }",
    "- animate { target, speed?, on, repeat? }          repeat: oscillating/increasing/once",
    "- trace   { target, on }",
    "- style   { target, color?, thickness?, visible?, opacity?, dashed?, pointSize?, pointStyle? }",
    "- view    { xmin, xmax, ymin, ymax, axesUnit? }",
    "- caption { target, text }",
    "- delete  { target }",
    "- reset",
    "- vector  { name, from, to, color?, label? }      物理矢量箭头（from: 点名或 (x,y) 字面量）",
    "- forceDiagram { at, forces: [{name, vec, color?, label?}] }  力矢量组",
    "- physicsTrace { target, mode }                    mode: trail/stroboscopic",
    "- unitAxes { xUnit, yUnit, xLabel?, yLabel? }      带单位坐标轴",
    "- constants { names: [...] }                      g/c/e/eps0/mu0/k_e/Grav/h/k_B",
    "",
    "═══ 硬性规则 ═══",
    "1. 标识符仅 ASCII 字母数字下划线。禁止中文变量名。",
    "2. 颜色 #RRGGBB。SetColor r/g/b 必须 0~255 整数（非 0~1）。",
    "3. 优先用 slider 引入可调参数。v/w/x/y/z 小写字母可用作 slider 名但不得用作 Vector 对象名。",
    "4. 多轮对话复用已存在对象名，不重新声明。",
    "5. JSON 类型严格：数值→数字，布尔→true/false。",
    "6. cmd 字段只使用下方命令速查中列出的命令，禁止臆造命令。",
    "",
    "═══ GGB 类型铁律（最高频错误源）═══",
    "★ (x,y) 赋值给变量 = Point（非 Vector）！Point+Point → ❌ 崩！",
    "★ 大写 A~Z 单字母 = Point 类型。禁止用作数值变量。",
    "★ 小写 u/v/w = Vector 类型。速度取值用 speed/vMag/vel 禁止用 v。",
    "★ 小写 f/g/h = Function 类型。其他小写可自由作数值。",
    "★ 位移/速度矢量用 vector 或 forceDiagram op（它们内部已处理 Point+Vector 安全转换）。",
    "★ 分母含 (x-x0)^2+y^2 必须 +0.001 防除零。",
    "",
    "【当前模式可用命令速查 — RAG 过滤】",
    cmdRef,
    "",
    "【常见臆造命令 — 以下命令不存在，禁止使用】",
    hallucWarn,
    "",
    GGB_5STAGE_FLOW,
    "",
    askSection,
    "",
    selfCheckSection,
  ].join("\n");
}

/**
 * Phase-aware System Prompt 构建。
 */
export function buildSystemPrompt(
  domain: Domain,
  appMode: "2d" | "3d" = "2d",
  phase: "full" | "compile" = "full"
): string {
  const mode = appMode === "3d" ? MODE_3D_ADDON : MODE_2D_HEADER;
  const base = mode + "\n" + buildPromptBase(appMode, domain, phase);

  // 拼接示例和领域后缀
  const parts = [base];
  parts.push(GENERAL_FEW_SHOT);
  if (domain === "physics") {
    parts.push(PHYSICS_ADDON);
    parts.push(PHYSICS_FEW_SHOT);
  }
  return parts.join("\n");
}

/** Phase 2 编译专用简写 */
export function buildCompilePrompt(domain: Domain, appMode: "2d" | "3d" = "2d"): string {
  return buildSystemPrompt(domain, appMode, "compile");
}

/**
 * 命令执行失败后的「核对检查」角色 prompt —— 专注修复，不做生成。
 */
export function buildCheckerPrompt(
  failures: { cmd: string; error: string }[],
  existingObjects: string[],
  originalRequest: string
): string {
  const failureLines = failures
    .map((f, i) => `  ${i + 1}. ${f.cmd}\n     → ${f.error}`)
    .join("\n");
  const symbolTable =
    existingObjects.length
      ? `已存在对象（可直接引用，禁止重复声明）：${existingObjects.join(", ")}`
      : "暂无已存在对象";

  return `你是 AiGGB 的「核对检查」角色。你的唯一任务：修正上一轮在 GeoGebra 中执行失败的命令。
不要新增功能，不要重新设计构造方案——只修复报错的那些命令。

【原始用户需求】
${originalRequest}

【当前画布状态】
${symbolTable}

【执行失败的命令及错误】
${failureLines}

【修复规则（只读这些，忽略生成规则）】
1. ★ 最高频错误 —— Point+Point 未定义：
   Gvec = (0, -m*g/10) 是 Point（GGB 默认将 (x,y) 识别为 Point），
   然后 block + Gvec = Point+Point = ❌ 崩。
   修复：用 forceDiagram op（最安全），或把偏移量改为 Vector((0,0),(dx,dy))。

2. 缺失对象：检查每个 eval 命令中引用的变量名是否都已存在于画布或本轮前面的命令中声明。
   如果引用了未声明的对象 → 在该命令前插入 eval 声明它。

3. 分母除零：如果错误涉及 Vector/Curve 执行失败，检查所有距离平方分母是否缺少 +0.001 防护。
   将 ((x-d)^2+y^2)^1.5 改为 ((x-d)^2+y^2+0.001)^1.5。

4. 变量命名冲突：如果错误涉及变量名，检查是否 v/u/w（Vector 默认类型）被用作标量、
   或单大写字母 A-Z（Point 默认类型）被用作数值。改名。

5. 3D 禁止命令：如果错误涉及 SetViewDirection/SetFilling/SetPointSize/SetAxesRatio，
   改用替代方案（Sphere 替代 SetPointSize、删掉 SetAxesRatio、style opacity 替代 SetFilling）。

6. 最小改动原则：只修改报错的命令，已成功的命令不要改动、不要重复输出。
   如果某个命令失败是因为依赖了失败命令的对象，一并修正。

7. 如果 forceDiagram/vector op 失败 → 检查 at/to/from 引用的 Point 是否已存在。
   若不存在 → 先 eval 声明该 Point。

8. ★ 3D 模式专项修复：
   - Cross(u,v) 返回自由 Vector。Vector(O, wVec) → ❌ 失败。修复：end = O + wVec; Vector(O, end)
   - SetCaption / ShowLabel / SetLabelMode → 全部删掉。改用对象名本身标识，或 Text("..",Point)。
   - ZoomIn → 删掉。改用 view op。
   - SetViewDirection / SetFilling / SetPointSize / SetAxesRatio → 删掉。

【输出格式】★ 只输出纯 JSON，不要任何解释、不要 Markdown 代码块：
{"explanation":"<一句话说明修复了什么>","commands":[<仅修复后的命令>]}

★ commands 只包含**被修复的那几条失败命令**（每条用与原命令相同的 op 和顺序，内容已修正）。
已成功的命令不要输出——前端会自动重放画布中已存在的对象。
如果失败命令依赖某个缺失的对象，把该对象的声明命令也一并输出（排在依赖它的命令之前）。`;
}

/** AI 返回格式 / schema 错误时的修复 prompt */
export function buildFormatRepairMessage(raw: string, detail: string): string {
  const preview = raw.length > 400 ? raw.slice(0, 400) + "…(truncated)" : raw;
  return `你上一轮的回复格式不正确，无法被前端解析或不符合 schema。

【你的原始输出（开头 400 字符）】
${preview}

【校验错误】
${detail}

请严格按照以下要求重新输出：
1. 只输出一个 JSON 对象，不要 Markdown 代码块、不要任何说明文字、不要前后缀。
2. 顶层结构必须是 { "explanation": "<string>", "commands": [<对象数组>] }。
3. 数值字段（min/max/step/value/speed/thickness/opacity/xmin/...）必须是 JSON 数字，不能写成字符串："value": 0.5 ✅；"value": "0.5" ❌。
4. 布尔字段（on/visible/dashed/fade）必须是 true/false，不能写成字符串。
5. 每条 commands 必须包含 "op" 字段，且 op 必须是 system 中声明的允许值之一。
6. 颜色字段格式 #RRGGBB。

请重新输出完整且合法的 JSON。`;
}
