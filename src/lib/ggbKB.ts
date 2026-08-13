/**
 * GeoGebra Command Knowledge Base —— RAG 增强核心
 *
 * 职责：
 *   1. 结构化命令签名库 → 供 prompts.ts 按模式/领域动态组装（替代静态全量白名单）
 *   2. 常见臆造→正确命令映射 → 供 commandCorrect.ts 模糊纠正
 *   3. 参数校验 → 执行前预检、修正修复 prompt
 *
 * 设计原则：
 *   - 零外部依赖，纯 TypeScript 静态数据
 *   - 按 mode（2d/3d）和 category 双索引，prompt 组装时精准过滤
 *   - hallucinationMap 覆盖已知高频臆造命令
 */

// ── 命令分类 ──

export type CommandCategory =
  | "point"      // 点/向量构造
  | "line"       // 线/线段
  | "circle"     // 圆/圆锥曲线
  | "polygon"    // 多边形
  | "function"   // 函数/曲线
  | "slider"     // 滑块/动画
  | "calc"       // 代数运算→已废弃，改用 metric/numeric
  | "metric"     // 度量
  | "transform"  // 变换
  | "list"       // 列表/序列
  | "text"       // 文本/标签
  | "style"      // 样式/属性
  | "solid3d"    // 3D 几何体
  | "curve3d"    // 3D 曲线曲面
  | "intersect3d"// 3D 求交/截面
  | "measure3d"  // 3D 度量
  | "view"       // 视图控制
  | "view3d"     // 3D 视图（多数不可靠）
  | "logic"      // 逻辑/条件
  | "equation";  // 方程求解

// ── 命令定义 ──

/** 重载参数类型（Mock 与真实执行共享同一签名表） */
export type GGBArgType =
  | "Point" | "Number" | "Vector" | "List" | "Line" | "Circle" | "Function" | "Any";

/** 一个重载签名：参数类型数组 + 语义说明 */
export interface GGBOverload {
  args: GGBArgType[];
  semantic: string;
}

export interface GGBCommandDef {
  /** 规范命令名（如 "Segment"） */
  name: string;
  /** 签名描述（人类可读，注入 prompt） */
  signature: string;
  /** 参数数量范围 [min, max]，-1 表示无上限 */
  paramCount: [number, number];
  /** 适用模式 */
  modes: ("2d" | "3d")[];
  /** 所属分类 */
  category: CommandCategory;
  /** 正确用法示例（每条一行，注入 prompt few-shot） */
  examples: string[];
  /** 中文意图别名（改造三）：如 Diameter 的 aliases=["过圆心的线","直径"]。
   *  注入 prompt 帮助 LLM 从自然意图联想正确命令。可增量维护，零依赖。 */
  aliases?: string[];
  /** 重载签名表：MockGGB 据此做参数类型校验，防模型把点/半径/坐标混淆。
   *  只对存在重载歧义的命令补充（Circle/Segment/Vector/…），其余省略。 */
  overloads?: GGBOverload[];
  /** 补充说明（使用时注意事项） */
  note?: string;
}

// ── 臆造→正确映射 ──

export interface HallucinationEntry {
  /** 模型常输出的错误命令 */
  hallucination: string;
  /** 正确的命令或替代方案 */
  correct: string;
  /** 替换说明（注入修复 prompt） */
  reason: string;
}

// ══════════════════════════════════════════════
// 命令知识库（~170 条，覆盖全部常用 GGB 命令）
// ══════════════════════════════════════════════

export const GGB_COMMAND_DEFS: GGBCommandDef[] = [
  // ─── 点 / 向量 ───
  {
    name: "Point", signature: "Point(x [, y])", paramCount: [1, 2],
    modes: ["2d", "3d"], category: "point",
    examples: ["A = Point({1,2})", "B = Point(a)"],
  },
  {
    name: "Vector", signature: "Vector(A, B)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "point",
    examples: ["v = Vector((0,0), (3,4))", "w = Vector(A, B)"],
    overloads: [
      { args: ["Point", "Point"], semantic: "起点 A → 终点 B（位移矢量）" },
      { args: ["Point", "Vector"], semantic: "起点 A → A + 位移 Vector" },
    ],
    note: "A、B 必须是 Point 或坐标字面量，禁止 Point+Point",
  },
  {
    name: "Midpoint", signature: "Midpoint(A, B)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "point",
    examples: ["M = Midpoint(A, B)"],
    aliases: ["中点", "两点中点"],
  },
  {
    name: "Center", signature: "Center(c)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "point",
    examples: ["O = Center(c)"],
    aliases: ["圆心", "中心"],
  },
  {
    name: "Intersect", signature: "Intersect(a, b [, n])", paramCount: [2, 3],
    modes: ["2d", "3d"], category: "point",
    examples: ["P = Intersect(f, g)", "Q = Intersect(c, l, 2)"],
    aliases: ["交点", "求交", "相交点"],
  },
  {
    name: "UnitVector", signature: "UnitVector(v)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "point",
    examples: ["u = UnitVector(v)"],
  },

  // ─── 线 / 线段 ───
  {
    name: "Line", signature: "Line(A, B)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "line",
    examples: ["l = Line(A, B)", "l = Line(P, Direction)"],
    aliases: ["直线", "两点连线", "过两点"],
  },
  {
    name: "Segment", signature: "Segment(A, B)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "line",
    examples: ["s = Segment(A, B)"],
    overloads: [
      { args: ["Point", "Point"], semantic: "两点之间的线段" },
    ],
    note: "两端点必须是已声明的 Point，禁止匿名坐标 Segment((x1,y1),(x2,y2))",
    aliases: ["线段", "两点连线（有限长）"],
  },
  {
    name: "Ray", signature: "Ray(A, B)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "line",
    examples: ["r = Ray(A, B)"],
  },
  {
    name: "PerpendicularLine", signature: "PerpendicularLine(P, l)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "line",
    examples: ["pl = PerpendicularLine(P, l)"],
  },
  {
    name: "ParallelLine", signature: "ParallelLine(P, l)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "line",
    examples: ["pl = ParallelLine(P, l)"],
  },
  {
    name: "AngleBisector", signature: "AngleBisector(A, O, B)", paramCount: [3, 3],
    modes: ["2d", "3d"], category: "line",
    examples: ["b = AngleBisector(A, O, B)"],
    aliases: ["角平分线", "平分角"],
  },
  {
    name: "PerpendicularBisector", signature: "PerpendicularBisector(A, B)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "line",
    examples: ["pb = PerpendicularBisector(A, B)"],
    aliases: ["中垂线", "垂直平分线"],
  },
  {
    name: "Tangent", signature: "Tangent(P, c)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "line",
    examples: ["t = Tangent(P, c)", "t = Tangent(l, c)"],
    aliases: ["切线", "相切"],
  },
  {
    name: "PerpendicularLine", signature: "PerpendicularLine(P, l)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "line",
    examples: ["pl = PerpendicularLine(P, l)"],
    aliases: ["垂线", "过点作垂线"],
  },
  {
    name: "ParallelLine", signature: "ParallelLine(P, l)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "line",
    examples: ["pl = ParallelLine(P, l)"],
    aliases: ["平行线", "过点作平行线"],
  },

  // ─── 圆 / 圆锥曲线 ───
  {
    name: "Circle", signature: "Circle(O, r) | Circle(A, B, C)", paramCount: [2, 3],
    modes: ["2d", "3d"], category: "circle",
    examples: ["c = Circle((0,0), 3)", "c = Circle(A, B, C)"],
    overloads: [
      { args: ["Point", "Number"], semantic: "圆心 O + 半径 r" },
      { args: ["Point", "Point"], semantic: "圆心 O + 圆上一点 P" },
      { args: ["Point", "Point", "Point"], semantic: "过三点 A/B/C 的圆" },
    ],
    aliases: ["圆", "画圆", "过三点画圆", "圆心半径"],
  },
  {
    name: "Semicircle", signature: "Semicircle(A, B)", paramCount: [2, 2],
    modes: ["2d"], category: "circle",
    examples: ["sc = Semicircle(A, B)"],
  },
  {
    name: "Ellipse", signature: "Ellipse(F1, F2, a)", paramCount: [3, 3],
    modes: ["2d"], category: "circle",
    examples: ["e = Ellipse(F1, F2, 3)"],
  },
  {
    name: "Hyperbola", signature: "Hyperbola(F1, F2, a)", paramCount: [3, 3],
    modes: ["2d"], category: "circle",
    examples: ["h = Hyperbola(F1, F2, 2)"],
  },
  {
    name: "Parabola", signature: "Parabola(F, d)", paramCount: [2, 2],
    modes: ["2d"], category: "circle",
    examples: ["p = Parabola(F, d)"],
  },
  {
    name: "Conic", signature: "Conic(A,B,C,D,E)", paramCount: [5, 5],
    modes: ["2d"], category: "circle",
    examples: ["c = Conic(A, B, C, D, E)"],
  },
  {
    name: "Incircle", signature: "Incircle(A, B, C)", paramCount: [3, 3],
    modes: ["2d"], category: "circle",
    examples: ["ic = Incircle(A, B, C)"],
    aliases: ["内切圆", "三角形内切圆"],
  },
  {
    name: "CircumcircleArc", signature: "CircumcircleArc(A, B, C)", paramCount: [3, 3],
    modes: ["2d"], category: "circle",
    examples: ["arc = CircumcircleArc(A, B, C)"],
    aliases: ["过三点圆弧", "外接圆弧"],
  },
  {
    name: "Sector", signature: "Sector(c, P1, P2)", paramCount: [3, 3],
    modes: ["2d"], category: "circle",
    examples: ["sec = Sector(c, A, B)"],
  },
  {
    name: "Polar", signature: "Polar(P, c)", paramCount: [2, 2],
    modes: ["2d"], category: "circle",
    examples: ["l = Polar(P, c)"],
  },
  {
    name: "Focus", signature: "Focus(c)", paramCount: [1, 1],
    modes: ["2d"], category: "circle",
    examples: ["F1 = Focus(c)"],
  },
  {
    name: "Directrix", signature: "Directrix(c)", paramCount: [1, 1],
    modes: ["2d"], category: "circle",
    examples: ["d = Directrix(c)"],
  },

  // ─── 多边形 ───
  {
    name: "Polygon", signature: "Polygon(A,B,C,...) | Polygon(list)", paramCount: [3, -1],
    modes: ["2d", "3d"], category: "polygon",
    examples: ["p = Polygon(A, B, C)", "p = Polygon({A,B,C,D})"],
    overloads: [
      { args: ["Point", "Point", "Point"], semantic: "≥3 顶点，多点用 ... 变长" },
      { args: ["List"], semantic: "顶点列表 Polygon({A,B,C})" },
    ],
    aliases: ["多边形", "三角形", "四边形", "五边形"],
  },
  {
    name: "RigidPolygon", signature: "RigidPolygon(A, B, C)", paramCount: [3, 3],
    modes: ["2d"], category: "polygon",
    examples: ["rp = RigidPolygon(A, B, C)"],
  },
  {
    name: "PolyLine", signature: "PolyLine(A, B, C, ...)", paramCount: [2, -1],
    modes: ["2d", "3d"], category: "polygon",
    examples: ["pl = PolyLine(A, B, C)"],
  },

  // ─── 函数 / 曲线 ───
  {
    name: "Function", signature: "Function(f, x0, x1)", paramCount: [1, 3],
    modes: ["2d", "3d"], category: "function",
    examples: ["f(x) = x^2", "g = Function(x^2, -5, 5)"],
  },
  {
    name: "Curve", signature: "Curve(x(t),y(t),t,t0,t1)", paramCount: [3, 5],
    modes: ["2d", "3d"], category: "function",
    examples: ["c = Curve(cos(t), sin(t), t, 0, 2π)"],
    note: "参数变量名不能与已存在对象同名",
    aliases: ["参数曲线", "轨迹曲线", "参数方程"],
  },
  {
    name: "Derivative", signature: "Derivative(f)", paramCount: [1, 1],
    modes: ["2d"], category: "function",
    examples: ["df = Derivative(f)"],
  },
  {
    name: "NDerivative", signature: "NDerivative(f)", paramCount: [1, 1],
    modes: ["2d"], category: "function",
    examples: ["ndf = NDerivative(f)"],
  },
  {
    name: "Integral", signature: "Integral(f, a, b)", paramCount: [1, 3],
    modes: ["2d"], category: "function",
    examples: ["A = Integral(f, 0, π)"],
  },
  {
    name: "TaylorPolynomial", signature: "TaylorPolynomial(f, x0, n)", paramCount: [3, 3],
    modes: ["2d"], category: "function",
    examples: ["T = TaylorPolynomial(sin(x), 0, 5)"],
  },
  {
    name: "Root", signature: "Root(f, a, b)", paramCount: [2, 3],
    modes: ["2d"], category: "function",
    examples: ["r = Root(f, 0, 3)"],
  },
  {
    name: "Extremum", signature: "Extremum(f, a, b)", paramCount: [2, 3],
    modes: ["2d"], category: "function",
    examples: ["E = Extremum(f, 0, 3)"],
  },
  {
    name: "ImplicitCurve", signature: "ImplicitCurve(eq)", paramCount: [1, 1],
    modes: ["2d"], category: "function",
    examples: ["ic = ImplicitCurve(x^2 + y^2 = 1)"],
  },
  {
    name: "SlopeField", signature: "SlopeField(f)", paramCount: [1, 1],
    modes: ["2d"], category: "function",
    examples: ["sf = SlopeField(1 - x*y)"],
  },
  {
    name: "If", signature: "If(cond, then, else)", paramCount: [3, 3],
    modes: ["2d", "3d"], category: "logic",
    examples: ["v = If(x>0, x^2, -x^2)"],
  },

  // ─── 滑块 / 动画 ───
  {
    name: "Slider", signature: "Slider(min,max,step,speed,width,isAngle,horiz,anim,rand)", paramCount: [3, 9],
    modes: ["2d", "3d"], category: "slider",
    examples: ["t = Slider(0, 10, 0.1, 1, 150, false, true, false, false)"],
  },
  {
    name: "StartAnimation", signature: "StartAnimation()", paramCount: [0, 0],
    modes: ["2d", "3d"], category: "slider",
    examples: ["StartAnimation()"],
  },
  {
    name: "SetAnimationSpeed", signature: "SetAnimationSpeed(obj, val)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "slider",
    examples: ["SetAnimationSpeed(t, 0.5)"],
  },
  {
    name: "SetAnimationType", signature: "SetAnimationType(obj, type)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "slider",
    examples: ["SetAnimationType(t, 0)"],
    note: "type: 0=oscillating, 1=increasing, 2=decreasing, 3=increasing once",
  },
  {
    name: "SetValue", signature: "SetValue(obj, val)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "slider",
    examples: ["SetValue(t, 5)"],
  },
  {
    name: "SetTrace", signature: "SetTrace(obj, flag)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "slider",
    examples: ["SetTrace(P, true)"],
  },

  // ─── 度量 ───
  {
    name: "Distance", signature: "Distance(P, l) | Distance(A, B)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "metric",
    examples: ["d = Distance(P, l)", "d = Distance(A, B)"],
  },
  {
    name: "Area", signature: "Area(obj)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "metric",
    examples: ["A = Area(poly)"],
  },
  {
    name: "Perimeter", signature: "Perimeter(obj)", paramCount: [1, 1],
    modes: ["2d"], category: "metric",
    examples: ["p = Perimeter(poly)"],
  },
  {
    name: "Circumference", signature: "Circumference(c)", paramCount: [1, 1],
    modes: ["2d"], category: "metric",
    examples: ["C = Circumference(c)"],
  },
  {
    name: "Length", signature: "Length(obj)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "metric",
    examples: ["L = Length(s)", "n = Length(list)"],
  },

  // ─── 变换 ───
  {
    name: "Translate", signature: "Translate(obj, v)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "transform",
    examples: ["T = Translate(poly, v)"],
  },
  {
    name: "Rotate", signature: "Rotate(obj, angle, center)", paramCount: [3, 3],
    modes: ["2d", "3d"], category: "transform",
    examples: ["R = Rotate(poly, π/2, O)"],
  },
  {
    name: "Reflect", signature: "Reflect(obj, line)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "transform",
    examples: ["R = Reflect(poly, l)"],
  },
  {
    name: "Dilate", signature: "Dilate(obj, k, center)", paramCount: [3, 3],
    modes: ["2d"], category: "transform",
    examples: ["D = Dilate(poly, 2, O)"],
  },

  // ─── 列表 / 序列 ───
  {
    name: "Sequence", signature: "Sequence(expr, var, start, end, step)", paramCount: [4, 5],
    modes: ["2d", "3d"], category: "list",
    examples: ["pts = Sequence((i, i^2), i, 0, 10, 0.5)"],
    note: "禁止 Sequence(var, list) 简写格式，必须五个参数完整",
    aliases: ["序列", "等间距", "批量生成", "网格点"],
  },
  {
    name: "IterationList", signature: "IterationList(f, init, n)", paramCount: [3, 3],
    modes: ["2d", "3d"], category: "list",
    examples: ["il = IterationList(x+1, 0, 10)"],
  },
  {
    name: "Element", signature: "Element(list, i) | Element(list, i, j)", paramCount: [2, 3],
    modes: ["2d", "3d"], category: "list",
    examples: ["e = Element(pts, 3)", "e = Element(mat, 2, 3)"],
  },
  {
    name: "Join", signature: "Join(a, b)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "list",
    examples: ["combined = Join(list1, list2)"],
  },
  {
    name: "Sort", signature: "Sort(list)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "list",
    examples: ["sorted = Sort(pts)"],
  },
  {
    name: "Unique", signature: "Unique(list)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "list",
    examples: ["u = Unique(pts)"],
  },
  {
    name: "Zip", signature: "Zip(expr, var1, list1, var2, list2)", paramCount: [5, 5],
    modes: ["2d", "3d"], category: "list",
    examples: ["z = Zip(a+b, a, {1,2}, b, {3,4})"],
  },
  {
    name: "Append", signature: "Append(list, obj)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "list",
    examples: ["l2 = Append(pts, P)"],
  },
  {
    name: "First", signature: "First(list)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "list",
    examples: ["f = First(pts)"],
  },
  {
    name: "Last", signature: "Last(list)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "list",
    examples: ["l = Last(pts)"],
  },
  {
    name: "Flatten", signature: "Flatten(list)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "list",
    examples: ["flat = Flatten(nested)"],
  },
  {
    name: "KeepIf", signature: "KeepIf(cond, list)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "list",
    examples: ["filtered = KeepIf(x>0, pts)"],
  },
  {
    name: "RemoveUndefined", signature: "RemoveUndefined(list)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "list",
    examples: ["clean = RemoveUndefined(pts)"],
  },

  // ─── 文本 / 标签 ───
  {
    name: "Text", signature: 'Text(text, Point [, Boolean])', paramCount: [2, 3],
    modes: ["2d", "3d"], category: "text",
    examples: ['T = Text("Hello", (0,0))', 'T = Text("公式", (3,2), true)'],
  },
  {
    name: "LaTeX", signature: "LaTeX(expr, Point)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "text",
    examples: ["T = LaTeX(sqrt(2)+1, (0,0))"],
  },
  {
    name: "FractionText", signature: "FractionText(n)", paramCount: [1, 1],
    modes: ["2d"], category: "text",
    examples: ["ft = FractionText(0.75)"],
  },
  {
    name: "SurdText", signature: "SurdText(n)", paramCount: [1, 1],
    modes: ["2d"], category: "text",
    examples: ["st = SurdText(sqrt(2))"],
  },

  // ─── 样式 / 属性 ───
  {
    name: "SetColor", signature: "SetColor(obj, color) | SetColor(obj, r, g, b)", paramCount: [2, 4],
    modes: ["2d", "3d"], category: "style",
    examples: ["SetColor(c, \"red\")", "SetColor(c, 230, 50, 50)"],
    note: "r/g/b 必须是 0~255 整数，禁止 0~1 浮点数",
  },
  {
    name: "SetLineStyle", signature: "SetLineStyle(obj, n)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "style",
    examples: ["SetLineStyle(c, 1)"],
  },
  {
    name: "SetLineOpacity", signature: "SetLineOpacity(obj, 0~1)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "style",
    examples: ["SetLineOpacity(c, 0.5)"],
  },
  {
    name: "SetLineThickness", signature: "SetLineThickness(obj, n)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "style",
    examples: ["SetLineThickness(c, 3)"],
  },
  {
    name: "SetFilling", signature: "SetFilling(obj, 0~1)", paramCount: [2, 2],
    modes: ["2d"], category: "style",
    examples: ["SetFilling(c, 0.3)"],
    note: "3D 中对立体无效——用 style op 的 opacity 字段替代",
  },
  {
    name: "SetPointStyle", signature: "SetPointStyle(p, n)", paramCount: [2, 2],
    modes: ["2d"], category: "style",
    examples: ["SetPointStyle(P, 4)"],
  },
  {
    name: "SetPointSize", signature: "SetPointSize(obj, n)", paramCount: [2, 2],
    modes: ["2d"], category: "style",
    examples: ["SetPointSize(P, 6)"],
    note: "3D 中不可用——用 Sphere(P, 0.2) 替代标记点",
  },
  {
    name: "SetCaption", signature: "SetCaption(obj, text)", paramCount: [2, 2],
    modes: ["2d"], category: "style",
    examples: ["SetCaption(P, \"质点\")"],
    note: "3D 中不可用——直接用变量名标识",
  },
  {
    name: "SetLabelMode", signature: "SetLabelMode(obj, n)", paramCount: [2, 2],
    modes: ["2d"], category: "style",
    examples: ["SetLabelMode(c, 2)"],
  },
  {
    name: "ShowLabel", signature: "ShowLabel(obj, bool)", paramCount: [2, 2],
    modes: ["2d"], category: "style",
    examples: ["ShowLabel(P, true)"],
  },
  {
    name: "Rename", signature: "Rename(obj, name)", paramCount: [2, 2],
    modes: ["2d"], category: "style",
    examples: ["Rename(c, \"圆O\")"],
  },
  {
    name: "Delete", signature: "Delete(obj)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "style",
    examples: ["Delete(c)"],
  },

  // ─── 逻辑 / 判定 ───
  {
    name: "Repeat", signature: "Repeat(n, cmd)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "logic",
    examples: ["Repeat(5, A = A + (1,0))"],
  },
  {
    name: "AreCollinear", signature: "AreCollinear(A, B, C)", paramCount: [3, 3],
    modes: ["2d", "3d"], category: "logic",
    examples: ["b = AreCollinear(A, B, C)"],
  },
  {
    name: "AreParallel", signature: "AreParallel(a, b)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "logic",
    examples: ["b = AreParallel(l1, l2)"],
  },
  {
    name: "ArePerpendicular", signature: "ArePerpendicular(a, b)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "logic",
    examples: ["b = ArePerpendicular(l1, l2)"],
  },
  {
    name: "IsTangent", signature: "IsTangent(l, c)", paramCount: [2, 2],
    modes: ["2d"], category: "logic",
    examples: ["b = IsTangent(l, c)"],
  },
  {
    name: "Defined", signature: "Defined(obj)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "logic",
    examples: ["b = Defined(P)"],
  },

  // ─── 方程求解 ───
  {
    name: "Solve", signature: "Solve(eq)", paramCount: [1, 1],
    modes: ["2d"], category: "equation",
    examples: ["sol = Solve(x^2 = 4)"],
  },
  {
    name: "NSolve", signature: "NSolve(eq)", paramCount: [1, 1],
    modes: ["2d"], category: "equation",
    examples: ["nsol = NSolve(x^3 = 2)"],
  },
  {
    name: "Solutions", signature: "Solutions(eq)", paramCount: [1, 1],
    modes: ["2d"], category: "equation",
    examples: ["sol = Solutions(x^2 = 4)"],
  },
  {
    name: "Roots", signature: "Roots(f, a, b)", paramCount: [2, 3],
    modes: ["2d"], category: "equation",
    examples: ["r = Roots(f, 0, 3)"],
  },
  {
    name: "SolveODE", signature: "SolveODE(f, x0, y0, x1, step)", paramCount: [5, 5],
    modes: ["2d"], category: "equation",
    examples: ["pts = SolveODE(-x*y, x(A), y(A), 5, 0.1)"],
    note: "不可用于 2D 向量场/电场线——该命令接受标量 ODE 而非二元向量场",
  },

  // ─── 向量运算 ───
  {
    name: "Cross", signature: "Cross(u, v)", paramCount: [2, 2],
    modes: ["3d"], category: "metric",
    examples: ["w = Cross(u, v)"],
    note: "返回自由 Vector；Vector(O, w) 失败——用 end = O + w; Vector(O, end)",
  },
  {
    name: "Dot", signature: "Dot(u, v)", paramCount: [2, 2],
    modes: ["2d", "3d"], category: "metric",
    examples: ["d = Dot(u, v)"],
  },

  // ─── 数值 / 代数 ───
  {
    name: "Simplify", signature: "Simplify(expr)", paramCount: [1, 1],
    modes: ["2d"], category: "metric",
    examples: ["s = Simplify(x^2 + 2x + 1)"],
  },
  {
    name: "Expand", signature: "Expand(expr)", paramCount: [1, 1],
    modes: ["2d"], category: "metric",
    examples: ["e = Expand((x+1)^2)"],
  },
  {
    name: "Factor", signature: "Factor(expr)", paramCount: [1, 1],
    modes: ["2d"], category: "metric",
    examples: ["f = Factor(x^2 - 1)"],
  },
  {
    name: "Substitute", signature: "Substitute(expr, old, new)", paramCount: [3, 3],
    modes: ["2d"], category: "metric",
    examples: ["s = Substitute(x^2, x, 3)"],
  },
  {
    name: "Sum", signature: "Sum(list)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "metric",
    examples: ["s = Sum({1,2,3})"],
  },
  {
    name: "Min", signature: "Min(list)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "metric",
    examples: ["m = Min({3,1,2})"],
  },
  {
    name: "Max", signature: "Max(list)", paramCount: [1, 1],
    modes: ["2d", "3d"], category: "metric",
    examples: ["M = Max({3,1,2})"],
  },

  // ─── 3D 几何体 ───
  {
    name: "Cube", signature: "Cube(A, B) | Cube(A, B, C)", paramCount: [2, 3],
    modes: ["3d"], category: "solid3d",
    examples: ["cube = Cube(A, B)"],
    note: "优先两点 Cube(A,B)——A/B 底面相邻顶点，第三点自动生成；避免三点形式除非精确构成正方形",
  },
  {
    name: "Tetrahedron", signature: "Tetrahedron(A, B, C, D)", paramCount: [4, 4],
    modes: ["3d"], category: "solid3d",
    examples: ["tet = Tetrahedron(A, B, C, D)"],
  },
  {
    name: "Prism", signature: "Prism(poly, point)", paramCount: [2, 2],
    modes: ["3d"], category: "solid3d",
    examples: ["prism = Prism(base, (0,0,5))"],
  },
  {
    name: "Pyramid", signature: "Pyramid(poly, point)", paramCount: [2, 2],
    modes: ["3d"], category: "solid3d",
    examples: ["pyr = Pyramid(base, (0,0,5))"],
  },
  {
    name: "Cylinder", signature: "Cylinder(circle, h) | Cylinder(P1, P2, r)", paramCount: [2, 3],
    modes: ["3d"], category: "solid3d",
    examples: ["cyl = Cylinder((0,0,0), (0,0,5), 2)"],
  },
  {
    name: "Cone", signature: "Cone(circle, h) | Cone(P1, P2, r)", paramCount: [2, 3],
    modes: ["3d"], category: "solid3d",
    examples: ["cone = Cone((0,0,0), (0,0,5), 3)"],
  },
  {
    name: "Sphere", signature: "Sphere(O, r) | Sphere(P1, P2)", paramCount: [2, 2],
    modes: ["3d"], category: "solid3d",
    examples: ["s = Sphere((0,0,0), 3)", "marker = Sphere(P, 0.2)"],
    overloads: [
      { args: ["Point", "Number"], semantic: "球心 O + 半径 r" },
      { args: ["Point", "Point"], semantic: "球心 P1 + 球面点 P2" },
    ],
    note: "3D 禁止 SetPointSize——用 Sphere(P, 0.2) 替代标记点",
  },
  {
    name: "Net", signature: "Net(poly, idx)", paramCount: [2, 2],
    modes: ["3d"], category: "solid3d",
    examples: ["net = Net(cube, 0)"],
    note: "展开图必须用 Net，禁止 Polygon 拼接",
  },

  // ─── 3D 曲线 / 曲面 ───
  {
    name: "Surface", signature: "Surface(x,y,z,u,u0,u1,v,v0,v1)", paramCount: [9, 9],
    modes: ["3d"], category: "curve3d",
    examples: ["s = Surface(u, v, u^2+v^2, u, -2, 2, v, -2, 2)"],
  },

  // ─── 3D 求交 / 截面 ───
  {
    name: "IntersectPath", signature: "IntersectPath(plane, poly) | IntersectPath(line, poly)", paramCount: [2, 2],
    modes: ["3d"], category: "intersect3d",
    examples: ["section = IntersectPath(Plane(A,C,F), cube)"],
  },
  {
    name: "IntersectConic", signature: "IntersectConic(plane, quadric)", paramCount: [2, 2],
    modes: ["3d"], category: "intersect3d",
    examples: ["ic = IntersectConic(plane, sphere)"],
  },
  {
    name: "Plane", signature: "Plane(A, B, C) | Plane(point, line)", paramCount: [2, 3],
    modes: ["3d"], category: "intersect3d",
    examples: ["p = Plane(A, C, F)", "p = Plane(P, l)"],
  },

  // ─── 3D 度量 ───
  {
    name: "Volume", signature: "Volume(solid)", paramCount: [1, 1],
    modes: ["3d"], category: "measure3d",
    examples: ["V = Volume(cube)"],
  },
  {
    name: "Height", signature: "Height(solid)", paramCount: [1, 1],
    modes: ["3d"], category: "measure3d",
    examples: ["h = Height(pyr)"],
  },
  {
    name: "Angle", signature: "Angle(line, plane) | Angle(P1, vertex, P2)", paramCount: [2, 3],
    modes: ["2d", "3d"], category: "metric",
    examples: ["a = Angle(l, plane)", "a = Angle(P1, O, P2)"],
  },

  // ─── 3D 视图 ───
  {
    name: "SetViewDirection", signature: "SetViewDirection(dir)", paramCount: [1, 1],
    modes: ["2d"], category: "view3d",
    examples: ["SetViewDirection((1,1,1))"],
    note: "纯 3D applet 中完全不可用——禁止在 3D 模式使用，依靠鼠标旋转",
  },
  {
    name: "SetSpinSpeed", signature: "SetSpinSpeed(n)", paramCount: [1, 1],
    modes: ["3d"], category: "view3d",
    examples: ["SetSpinSpeed(10)"],
  },

  // ─── 视图控制 ───
  {
    name: "SetAxesRatio", signature: "SetAxesRatio(x, y) | 3D: SetAxesRatio(x, y, z)", paramCount: [2, 3],
    modes: ["2d"], category: "view",
    examples: ["SetAxesRatio(1, 1)"],
    note: "3D 中不可靠——3D 等比例交给 view op 或用户手动",
  },
  {
    name: "SetCoordSystem", signature: "SetCoordSystem(xMin, xMax, yMin, yMax)", paramCount: [4, 4],
    modes: ["2d", "3d"], category: "view",
    examples: ["SetCoordSystem(-5, 5, -3, 3)"],
  },
  {
    name: "ZoomIn", signature: "ZoomIn([scale])", paramCount: [0, 1],
    modes: ["2d"], category: "view",
    examples: ["ZoomIn(0.5)"],
    note: "3D applet 中常返回 false——3D 用 view op 替代",
  },
  {
    name: "CenterView", signature: "CenterView(P)", paramCount: [1, 1],
    modes: ["2d"], category: "view",
    examples: ["CenterView((0,0))"],
  },
  {
    name: "SetCoords", signature: "SetCoords(obj, x, y)", paramCount: [3, 3],
    modes: ["2d"], category: "view",
    examples: ["SetCoords(P, 5, 3)"],
  },
];

// ══════════════════════════════════════════════
// 臆造→正确命令映射（高频漂移纠正）
// ══════════════════════════════════════════════

export const HALLUCINATION_MAP: HallucinationEntry[] = [
  { hallucination: "SetOpacity",      correct: "SetLineOpacity", reason: "GeoGebra 无 SetOpacity，透明度用 SetLineOpacity" },
  { hallucination: "SetTransparency", correct: "SetLineOpacity", reason: "GeoGebra 无 SetTransparency，透明度用 SetLineOpacity" },
  { hallucination: "DSolve",          correct: "SolveODE",       reason: "GeoGebra 无 DSolve，常微分方程用 SolveODE" },
  { hallucination: "ContourPlot",     correct: "ImplicitCurve",  reason: "GeoGebra 无 ContourPlot，隐式曲线用 ImplicitCurve" },
  { hallucination: "Plot3D",          correct: "Surface",        reason: "GeoGebra 无 Plot3D，三维曲面用 Surface" },
  { hallucination: "VectorField",     correct: "Sequence + Vector 嵌套", reason: "GeoGebra 无 VectorField，向量场用嵌套 Sequence 生成箭头网格" },
  { hallucination: "StreamPlot",      correct: "Sequence + Vector 嵌套", reason: "GeoGebra 无 StreamPlot，流线用嵌套 Sequence 箭头网格" },
  { hallucination: "FieldLine",       correct: "IterationList",  reason: "GeoGebra 无 FieldLine，场线用 IterationList 递推" },
  { hallucination: "StreamLine",      correct: "IterationList",  reason: "GeoGebra 无 StreamLine，流线用 IterationList 递推" },
  { hallucination: "PauseAnimation",  correct: "SetAnimating(obj, false)", reason: "GeoGebra 无 PauseAnimation——用 eval SetAnimating(obj, false) 或 animate op 的 on:false" },
  { hallucination: "StopAnimation",   correct: "SetAnimating(obj, false)", reason: "GeoGebra 无 StopAnimation——用 eval SetAnimating 或 animate op" },
  { hallucination: "AnimateRotation", correct: "Rotate + Slider 组合", reason: "GeoGebra 无 AnimateRotation——用 Rotate(obj, t, O) + slider t 驱动" },
  { hallucination: "DrawPoint",       correct: "Point({x,y})",   reason: "GeoGebra 无 DrawPoint——用 Point({x,y}) 创建点" },
  { hallucination: "DrawLine",        correct: "Segment(A,B)",   reason: "GeoGebra 无 DrawLine——用 Segment(A,B) 创建线段" },
  { hallucination: "DrawCircle",      correct: "Circle(O, r)",   reason: "GeoGebra 无 DrawCircle——用 Circle(O, r) 创建圆" },
  { hallucination: "AddPoint",        correct: "Point({x,y})",   reason: "GeoGebra 无 AddPoint——用 Point 命令创建" },
  { hallucination: "MoveObject",      correct: "SetCoords(obj, x, y)", reason: "GeoGebra 无 MoveObject——移动对象用 SetCoords 命令" },
  { hallucination: "Drag",            correct: "SetCoords(obj, x, y)", reason: "GeoGebra 无 Drag——移动对象用 SetCoords" },
  { hallucination: "Play",            correct: "StartAnimation()", reason: "GeoGebra 无 Play——启动动画用 StartAnimation()" },
  { hallucination: "Animate",         correct: "StartAnimation()", reason: "GeoGebra 无 Animate 命令——用 StartAnimation() 或 animate op" },
  { hallucination: "ExportGIF",       correct: "无替代（前端处理）", reason: "GeoGebra 无 ExportGIF——导出由前端 JS 处理，不通过 GGB 命令" },
  { hallucination: "ExportImage",     correct: "无替代（前端处理）", reason: "GeoGebra 无 ExportImage——导出由前端 JS 处理" },
  { hallucination: "Variable",        correct: "直接赋值",        reason: "GeoGebra 无 Variable 命令——直接 x = 3 即可定义变量" },
  { hallucination: "Parameter",       correct: "Slider(min, max, ...)", reason: "GeoGebra 无 Parameter 命令——用 Slider 创建可调参数" },
  { hallucination: "SetOpaque",       correct: "SetLineOpacity", reason: "GeoGebra 无 SetOpaque——透明度用 SetLineOpacity" },
];

// ── 辅助函数 ──

/** 按模式过滤命令 */
export function filterCommandsByMode(mode: "2d" | "3d"): GGBCommandDef[] {
  return GGB_COMMAND_DEFS.filter(c => c.modes.includes(mode));
}

/** 按分类过滤命令 */
export function filterCommandsByCategory(category: CommandCategory): GGBCommandDef[] {
  return GGB_COMMAND_DEFS.filter(c => c.category === category);
}

/** 查找命令（精确匹配） */
export function findCommand(name: string): GGBCommandDef | undefined {
  return GGB_COMMAND_DEFS.find(c => c.name.toLowerCase() === name.toLowerCase());
}

/** 查找臆造映射 */
export function findHallucination(name: string): HallucinationEntry | undefined {
  return HALLUCINATION_MAP.find(
    h => h.hallucination.toLowerCase() === name.toLowerCase()
  );
}

/** 生成按模式过滤的命令速查文本（注入 prompt） */
export function buildCommandReference(mode: "2d" | "3d", domain?: "general" | "physics"): string {
  const cmds = filterCommandsByMode(mode);

  // 按分类分组
  const groups = new Map<CommandCategory, GGBCommandDef[]>();
  for (const c of cmds) {
    const list = groups.get(c.category) || [];
    list.push(c);
    groups.set(c.category, list);
  }

  const categoryLabels: Record<string, string> = {
    point: "点/向量",
    line: "线/线段",
    circle: "圆/圆锥曲线",
    polygon: "多边形",
    function: "函数/曲线",
    slider: "滑块/动画",
    metric: "度量",
    transform: "变换",
    list: "列表/序列",
    text: "文本/标签",
    style: "样式/属性",
    logic: "逻辑/判定",
    equation: "方程求解",
    solid3d: "3D 几何体",
    curve3d: "3D 曲线曲面",
    intersect3d: "3D 求交/截面",
    measure3d: "3D 度量",
    view: "视图控制",
    view3d: mode === "3d" ? "3D 视图(慎用)" : "",
  };

  const lines: string[] = [];
  for (const [cat, catCmds] of groups) {
    const label = categoryLabels[cat];
    if (!label || cat === "view3d" && mode === "2d") continue;
    const cmdStr = catCmds.map(c => {
      return `${c.name}(${c.signature.split(" | ")[0].split("(")[1] || ""}`;
    }).join(" ");
    lines.push(`${label}：${cmdStr}`);
  }

  // 物理域附加矢量/微积分命令权重
  if (domain === "physics") {
    lines.unshift("⚛ 物理域推荐优先使用：Vector Tangent Normal Integral NDerivative SolveODE Sequence");
  }

  // 改造三：中文意图速查（aliases）——帮助 LLM 从自然语言意图联想正确命令
  //   "过圆心" → Circle、"中垂线" → PerpendicularBisector
  const aliasParts: string[] = [];
  for (const c of cmds) {
    if (c.aliases && c.aliases.length > 0) {
      aliasParts.push(c.aliases.map(a => `${a}→${c.name}`).join(" "));
    }
  }
  if (aliasParts.length > 0) {
    lines.push(`\n【中文意图→命令速查】${aliasParts.join("  ")}`);
  }

  return lines.join("\n");
}

/** 生成按模式过滤的臆造警告文本（注入 prompt） */
export function buildHallucinationWarnings(mode: "2d" | "3d"): string {
  const relevant = mode === "3d"
    ? HALLUCINATION_MAP.filter(h =>
        ["SetFilling", "SetPointSize", "SetAxesRatio", "SetViewDirection", "SetCaption", "ShowLabel", "SetLabelMode", "Rename", "ZoomIn"]
          .includes(h.hallucination) || h.hallucination.startsWith("Set"))
    : HALLUCINATION_MAP;

  const modeNote = mode === "3d"
    ? "\n【3D 额外禁止】SetFilling SetPointSize SetAxesRatio SetViewDirection SetCaption ShowLabel SetLabelMode Rename ZoomIn — 3D 中不可用，见 3D 规则"
    : "";

  return relevant
    .map(h => `❌ ${h.hallucination} → ✅ ${h.correct}（${h.reason}）`)
    .join("\n") + modeNote;
}
