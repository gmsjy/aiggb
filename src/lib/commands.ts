/**
 * GeoGebra 命令白名单（2026-06-28）—— 精简高频版
 *
 * 仅保留 AiGGB 实际用到的命令，删除低使用率项。
 * 每条一行：命令(参数概要)  ← 最大限度压缩 token
 */

export const GGB_COMMANDS = /* prettier-ignore */ `
【GGB 命令白名单——仅使用以下命令，禁止臆造】

点/向量：Point(p) Vector(A,B) Midpoint(A,B) Center(c) Intersect(a,b) UnitVector(v) Distance(P,l)
线/线段：Line(A,B) Segment(A,B) Ray(A,B) PerpendicularLine(P,l) ParallelLine(P,l) AngleBisector(A,O,B) PerpendicularBisector(A,B) Tangent(P,c)
圆/圆锥：Circle(O,r) Circle(A,B,C) Semicircle(A,B) Ellipse(F1,F2,a) Hyperbola(F1,F2,a) Parabola(F,d) Conic(5点) Incircle(A,B,C) CircumcircleArc(A,B,C) Sector(c,P1,P2) Polar(P,c) Focus(c) Directrix(c)
多边形：Polygon(A,B,C) Polygon(list) RigidPolygon(A,B,C) PolyLine(A,B,C)
函数：Function(f,x0,x1) If(cond,then,else) Curve(x(t),y(t),t,t0,t1) Derivative(f) NDerivative(f) Integral(f,a,b) TaylorPolynomial(f,x0,n) Root(f,a,b) Extremum(f,a,b) ImplicitCurve(f) SlopeField(f)
滑动条：Slider(min,max,step,speed,width,isAngle,horiz,anim,rand) StartAnimation() SetAnimationSpeed(obj,val) SetAnimationType(obj,type) SetValue(obj,val) SetTrace(obj,true/false)
属性：SetColor(obj,color) SetColor(obj,r,g,b) SetLineStyle(obj,n) SetLineOpacity(obj,0~1) SetLineThickness(obj,n) SetFilling(obj,0~1) SetPointStyle(p,n) SetPointSize(obj,n)(仅2D) SetCaption(obj,text)(仅2D) SetLabelMode(obj,n)(仅2D) ShowLabel(obj,bool)(仅2D) Rename(obj,name)(仅2D) Delete(obj)
变换：Translate(obj,v) Rotate(obj,angle,center) Reflect(obj,line) Dilate(obj,k,center)
列表：Sequence(expr,var,start,end,step) IterationList(f,init,n) Element(list,i) Length(list) Join(a,b) Sort(list) Unique(list) Zip(expr,var1,list1,var2,list2) Append(list,obj) First(list) Last(list) Flatten(list) KeepIf(cond,list) RemoveUndefined(list)
文本：Text(obj,pos) LaTeX(expr,pos) FractionText(n) SurdText(n)
逻辑：If(cond,then,else) Repeat(n,cmd)
判定：AreCollinear(A,B,C) AreParallel(a,b) ArePerpendicular(a,b) IsTangent(l,c) Defined(obj)
方程：Solve(eq) NSolve(eq) Solutions(eq) Roots(f,a,b) SolveODE(f,x0,y0,x1,step)
向量运算：Cross(u,v) Dot(u,v)
数值：Simplify(expr) Expand(expr) Factor(expr) Substitute(expr,old,new) Sum(list) Min(list) Max(list) Length(obj) Area(obj) Perimeter(obj) Circumference(c)
3D几何体（仅3D模式）：Cube(A,B) Cube(A,B,C) Tetrahedron(A,B,C) Prism(poly,point) Pyramid(poly,point) Cylinder(circle,h) Cylinder(P1,P2,r) Cone(circle,h) Cone(P1,P2,r) Sphere(O,r) Sphere(P1,P2) Net(poly,idx)
3D曲线曲面：Curve(x(t),y(t),z(t),t,t0,t1) Surface(x,y,z,u,u0,u1,v,v0,v1)
3D求交：IntersectPath(plane,polyhedron) IntersectPath(line,polygon) IntersectConic(plane,quadric)
3D度量：Volume(solid) Height(solid) Distance(p,plane) Angle(line,plane) Angle(P1,vertex,P2)
3D视图：SetViewDirection(dir)(仅2D) SetSpinSpeed(n)(仅3D)
视图：SetAxesRatio(x,y)(仅2D) SetCoordSystem(xMin,xMax,yMin,yMax) ZoomIn()(仅2D) CenterView(p) SetCoords(obj,x,y)

⚠ Sequence 必须用 Sequence(expr,var,start,end,step)，禁止 Sequence(var,list) 简写。
⚠ Vector 第一个参数是起点 Point，第二个参数是终点 Point 或坐标字面量。
⚠ (x,y) 赋给变量 = Point，不是 Vector。位移矢量用 Vector((0,0),(dx,dy))。
⚠ 分母含距离平方必须加 +0.001 防除零：( (x-d)^2+y^2+0.001 )^1.5
`;

/**
 * 已知在 GeoGebra 中不存在的命令（硬黑名单）。
 * 供两处复用：
 *   1. schema.ts 对 eval cmd 做静态硬校验（命中即拒绝，进入格式修复循环）
 *   2. GGB_BLACKLIST 作为 prompt 文本（提示 AI 禁止臆造）
 * 注意：3D 专用限制（SetViewDirection/SetFilling/SetPointSize 等）是「模式相关」而非「不存在」，
 * 故不在此列，由 MODE_3D_ADDON 规则约束。
 */
export const GGB_FORBIDDEN_COMMANDS = [
  "DSolve", "ContourPlot", "Plot3D", "VectorField", "StreamPlot", "FieldLine", "StreamLine",
  "SetOpacity", "SetTransparency", "ExportGIF", "ExportImage", "Variable", "Parameter",
  "PauseAnimation", "StopAnimation", "Animate", "Play", "DrawPoint", "DrawLine",
  "DrawCircle", "AddPoint", "MoveObject", "Drag", "AnimateRotation",
  // ⚠ 安全：允许任意 JS 执行，配合 useBrowserForJS:true 可窃取 localStorage 的 API Key
  "JavaScript", "Execute"
] as const;

export const GGB_BLACKLIST = `
★ 以下命令在 GeoGebra 中根本不存在或不可靠，禁止在任何上下文使用：
不存在：${GGB_FORBIDDEN_COMMANDS.join(" ")}
`;

export const GGB_5STAGE_FLOW = `
5阶段流程：①滑块→②Point声明→③线/圆(引用Point)→④动画/轨迹→⑤属性(SetLineOpacity等)
铁律：动态线段必须先 Point 再 Segment(A,B)，禁止 Segment((x,y),(x,y))。
3D铁律：
①所有点用 (x,y,z) 三维坐标
②★ 正方体优先用 Cube(A,B) 两点形式：A、B 为底面一条棱的相邻顶点，第三个顶点自动生成，正方体可绕 AB 边旋转。避免 Cube(A,B,C)——三点必须精确构成正方形否则只画点不出体。需要固定朝向时才用 Cube(A,B,C) 并确保三点构成正方形。
③IntersectPath(plane,poly) 得截面
④SetViewDirection 在纯 3D applet 中不可用，禁止生成
⑤SetColor obj,r,g,b 中 r/g/b 必须是 0-255 整数（如 SetColor(c, 230, 50, 50)），禁止 0~1 浮点数
⑥SetFilling 在 3D 中对 Sphere/Cube 等立体无效——用 style op 的 opacity 字段替代
⑦SetAxesRatio 在 3D 中不可靠——如需等比例坐标轴用 view op 替代（见 3D 模式规则）
`;
