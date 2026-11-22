# GeoGebra 命令参考（2D 模式）

> 由 aiggb 知识库自动生成（全库 130 条命令定义，本文件收录 115 条）。
> 命令签名/用法一律以本文件为准；不在本文件中的命令视为臆造，见文末臆造映射。

## 总览（精简提示版）

⚛ 物理域推荐优先使用：Vector Tangent Normal Integral NDerivative SolveODE Sequence
点/向量：Point(object) Vector(A, B) Midpoint(A, B) Locus(P, Q) Center(c) Intersect(a, b [, n]) UnitVector(v)
线/线段：Line(A, B) Segment(A, B) Ray(A, B) AngleBisector(A, O, B) PerpendicularBisector(A, B) Tangent(P, c) PerpendicularLine(P, l) ParallelLine(P, l)
圆/圆锥曲线：Circle(O, r) Semicircle(A, B) Ellipse(F1, F2, a) Hyperbola(F1, F2, a) Parabola(F, d) Conic(A,B,C,D,E) Incircle(A, B, C) CircumcircleArc(A, B, C) Sector(c, P1, P2) Polar(P, c) Focus(c) Directrix(c)
多边形：Polygon(A,B,C,...) RigidPolygon(A, B, C) PolyLine(A, B, C, ...)
函数/曲线：Function(f, x0, x1) Curve(x Derivative(f) NDerivative(f) Integral(f, a, b) TaylorPolynomial(f, x0, n) Root(f, a, b) Extremum(f, a, b) ImplicitCurve(eq) SlopeField(f)
逻辑/判定：If(cond, then, else) Repeat(n, cmd) AreCollinear(A, B, C) AreParallel(a, b) ArePerpendicular(a, b) IsTangent(l, c) Defined(obj)
滑块/动画：Slider(min,max,step,speed,width,isAngle,horiz,anim,rand) StartAnimation() SetAnimationSpeed(obj, val) SetAnimationType(obj, type) SetValue(obj, val) SetTrace(obj, flag) SetAnimating(obj, flag)
度量：Distance(P, l) Area(obj) Perimeter(obj) Circumference(c) Length(obj) Dot(u, v) Simplify(expr) Expand(expr) Factor(expr) Substitute(expr, old, new) Sum(list) Min(list) Max(list) Angle(line, plane)
变换：Translate(obj, v) Rotate(obj, angle, center) Reflect(obj, line) Dilate(obj, k, center)
列表/序列：Sequence(expr, var, start, end, step) IterationList(f, init, n) Element(list, i) Join(a, b) Sort(list) Unique(list) Zip(expr, var1, list1, var2, list2, ...) Append(list, obj) First(list) Last(list) Flatten(list) KeepIf(cond, list) RemoveUndefined(list)
文本/标签：Text(text, Point [, Boolean]) LaTeX(expr, Point) FractionText(n) SurdText(n)
样式/属性：SetColor(obj, color) SetVisibleInView(obj, 1, true/false) SetConditionToShowObject(obj, condition) SetLineStyle(obj, n) SetLineOpacity(obj, 0~1) SetLineThickness(obj, n) SetFilling(obj, 0~1) SetPointStyle(p, n) SetPointSize(obj, n) SetCaption(obj, text) SetLabelMode(obj, n) ShowLabel(obj, bool) Rename(obj, name) Delete(obj)
方程求解：Solve(eq) NSolve(eq) Solutions(eq) Roots(f, a, b) SolveODE(f)
3D 求交/截面：IntersectPath(plane, poly)
视图控制：SetAxesRatio(x, y) SetCoordSystem(xMin, xMax, yMin, yMax) ZoomIn([scale]) CenterView(P) SetCoords(obj, x, y)

【中文意图→命令速查】中点→Midpoint 两点中点→Midpoint  轨迹→Locus 点的轨迹→Locus 动点轨迹→Locus  圆心→Center 中心→Center  交点→Intersect 求交→Intersect 相交点→Intersect  直线→Line 两点连线→Line 过两点→Line  线段→Segment 两点连线（有限长）→Segment  角平分线→AngleBisector 平分角→AngleBisector  中垂线→PerpendicularBisector 垂直平分线→PerpendicularBisector  切线→Tangent 相切→Tangent  垂线→PerpendicularLine 过点作垂线→PerpendicularLine  平行线→ParallelLine 过点作平行线→ParallelLine  圆→Circle 画圆→Circle 过三点画圆→Circle 圆心半径→Circle  内切圆→Incircle 三角形内切圆→Incircle  过三点圆弧→CircumcircleArc 外接圆弧→CircumcircleArc  多边形→Polygon 三角形→Polygon 四边形→Polygon 五边形→Polygon  参数曲线→Curve 轨迹曲线→Curve 参数方程→Curve  序列→Sequence 等间距→Sequence 批量生成→Sequence 网格点→Sequence

## 分命令详情

### 点 / 向量

#### Point
- 签名: `Point(object) | Point(x, y)` ｜ 参数个数: 1~2 ｜ 适用: 2d, 3d
- 示例:
  - `A = Point({1,2})`
  - `F = Point(f)（点落在函数 f 的曲线上，动画 F 即沿曲线扫描）`
  - `B = Point(a)`
- ⚠ 注意: 单参数 Point(曲线/多边形边) = 点在对象上：切线扫描（配合 Tangent）、单位圆→正弦等演示的地基原语

#### Vector
- 签名: `Vector(A, B)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 重载语义:
  - (Point, Point): 起点 A → 终点 B（位移矢量）
- 示例:
  - `v = Vector((0,0), (3,4))`
  - `w = Vector(A, B)`
- ⚠ 注意: A、B 必须是 Point 或坐标字面量，禁止 Point+Point。★ 实测 Vector(Point, Vector) 二参重载不可用（2026-11 整机回归：Vector(P, 位移向量) 返回 false）——「从点 P 出发的位移箭头」一律写 Vector(P, P + (dx, dy))。★ 负方向位移用 P + (-dx, -dy)，勿用 P - (dx, dy)（减法形态类型推断不稳定，实测同一写法可产出 point 或 vector）

#### Midpoint
- 签名: `Midpoint(A, B)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `M = Midpoint(A, B)`
- 别名: 中点、两点中点

#### Locus
- 签名: `Locus(P, Q)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `loc = Locus(P, Q)（Q 为驱动点/路径，P 为随 Q 运动的从动点）`
- ⚠ 注意: 轨迹生成：先构造「驱动点在路径上运动 → 从动点」的依赖链，再对从动点取 Locus
- 别名: 轨迹、点的轨迹、动点轨迹

#### Center
- 签名: `Center(c)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `O = Center(c)`
- 别名: 圆心、中心

#### Intersect
- 签名: `Intersect(a, b [, n])` ｜ 参数个数: 2~3 ｜ 适用: 2d, 3d
- 示例:
  - `P = Intersect(f, g)`
  - `Q = Intersect(c, l, 2)`
- ⚠ 注意: 两对象有多个交点时用第 3 参选第 n 个（从 1 起）；省略则取第一个交点
- 别名: 交点、求交、相交点

#### UnitVector
- 签名: `UnitVector(v)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `u = UnitVector(v)`

### 线 / 线段

#### Line
- 签名: `Line(A, B)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `l = Line(A, B)`
  - `l = Line(P, Direction)`
- 别名: 直线、两点连线、过两点

#### Segment
- 签名: `Segment(A, B)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 重载语义:
  - (Point, Point): 两点之间的线段
- 示例:
  - `s = Segment(A, B)`
- ⚠ 注意: 两端点必须是已声明的 Point，禁止匿名坐标 Segment((x1,y1),(x2,y2))；且端点名不能是小写开头——GGB 会把小写名的坐标字面量（如 contact = (r*t, 0)）隐式推断为 Vector，Segment 引用即失败。坐标点一律用大写开头名字
- 别名: 线段、两点连线（有限长）

#### Ray
- 签名: `Ray(A, B)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `r = Ray(A, B)`

#### AngleBisector
- 签名: `AngleBisector(A, O, B)` ｜ 参数个数: 3~3 ｜ 适用: 2d, 3d
- 示例:
  - `b = AngleBisector(A, O, B)`
- 别名: 角平分线、平分角

#### PerpendicularBisector
- 签名: `PerpendicularBisector(A, B)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `pb = PerpendicularBisector(A, B)`
- 别名: 中垂线、垂直平分线

#### Tangent
- 签名: `Tangent(P, c)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `t = Tangent(P, c)`
  - `t = Tangent(l, c)`
- 别名: 切线、相切

#### PerpendicularLine
- 签名: `PerpendicularLine(P, l)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `pl = PerpendicularLine(P, l)`
- 别名: 垂线、过点作垂线

#### ParallelLine
- 签名: `ParallelLine(P, l)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `pl = ParallelLine(P, l)`
- 别名: 平行线、过点作平行线

### 圆 / 圆锥曲线

#### Circle
- 签名: `Circle(O, r) | Circle(A, B, C)` ｜ 参数个数: 2~3 ｜ 适用: 2d, 3d
- 重载语义:
  - (Point, Number): 圆心 O + 半径 r
  - (Point, Point): 圆心 O + 圆上一点 P
  - (Point, Point, Point): 过三点 A/B/C 的圆
- 示例:
  - `c = Circle((0,0), 3)`
  - `c = Circle(A, B, C)`
- 别名: 圆、画圆、过三点画圆、圆心半径

#### Semicircle
- 签名: `Semicircle(A, B)` ｜ 参数个数: 2~2 ｜ 适用: 2d
- 示例:
  - `sc = Semicircle(A, B)`

#### Ellipse
- 签名: `Ellipse(F1, F2, a)` ｜ 参数个数: 3~3 ｜ 适用: 2d
- 示例:
  - `e = Ellipse(F1, F2, 3)`
- ⚠ 注意: a 是半长轴，必须大于 |F1F2|/2——a 偏小不会报错而是**静默退化成双曲线**（实测）

#### Hyperbola
- 签名: `Hyperbola(F1, F2, a)` ｜ 参数个数: 3~3 ｜ 适用: 2d
- 示例:
  - `h = Hyperbola(F1, F2, 2)`

#### Parabola
- 签名: `Parabola(F, d)` ｜ 参数个数: 2~2 ｜ 适用: 2d
- 示例:
  - `p = Parabola(F, d)`

#### Conic
- 签名: `Conic(A,B,C,D,E) | Conic(ax²,by²,c,dxy,ex,fy)` ｜ 参数个数: 5~6 ｜ 适用: 2d
- 示例:
  - `c = Conic(A, B, C, D, E)`
  - `ell = Conic(1/9, 1/4, -1, 0, 0, 0)`

#### Incircle
- 签名: `Incircle(A, B, C)` ｜ 参数个数: 3~3 ｜ 适用: 2d
- 示例:
  - `ic = Incircle(A, B, C)`
- 别名: 内切圆、三角形内切圆

#### CircumcircleArc
- 签名: `CircumcircleArc(A, B, C)` ｜ 参数个数: 3~3 ｜ 适用: 2d
- 示例:
  - `arc = CircumcircleArc(A, B, C)`
- 别名: 过三点圆弧、外接圆弧

#### Sector
- 签名: `Sector(c, P1, P2)` ｜ 参数个数: 3~3 ｜ 适用: 2d
- 示例:
  - `sec = Sector(c, A, B)`

#### Polar
- 签名: `Polar(P, c)` ｜ 参数个数: 2~2 ｜ 适用: 2d
- 示例:
  - `l = Polar(P, c)`

#### Focus
- 签名: `Focus(c)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `F1 = Focus(c)`

#### Directrix
- 签名: `Directrix(c)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `d = Directrix(c)`

### 多边形

#### Polygon
- 签名: `Polygon(A,B,C,...) | Polygon(list)` ｜ 参数个数: 3+ ｜ 适用: 2d, 3d
- 重载语义:
  - (Point, Point, Point): ≥3 顶点，多点用 ... 变长
  - (List): 顶点列表 Polygon({A,B,C})
- 示例:
  - `p = Polygon(A, B, C)`
  - `p = Polygon({A,B,C,D})`
- 别名: 多边形、三角形、四边形、五边形

#### RigidPolygon
- 签名: `RigidPolygon(A, B, C)` ｜ 参数个数: 3~3 ｜ 适用: 2d
- 示例:
  - `rp = RigidPolygon(A, B, C)`

#### PolyLine
- 签名: `PolyLine(A, B, C, ...) | PolyLine(list)` ｜ 参数个数: 1+ ｜ 适用: 2d, 3d
- 示例:
  - `pl = PolyLine(A, B, C)`
  - `zig = PolyLine(Sequence((u, 0.2*(-1)^u), u, 0, 20))`
- ⚠ 注意: 官方另有 PolyLine(点列表) 单参形态——配合 Sequence 生成锯齿/弹簧等折线

### 函数 / 曲线

#### Function
- 签名: `Function(f, x0, x1)` ｜ 参数个数: 1~3 ｜ 适用: 2d, 3d
- 示例:
  - `f(x) = x^2`
  - `g = Function(x^2, -5, 5)`

#### Curve
- 签名: `Curve(x(t),y(t),t,t0,t1)` ｜ 参数个数: 3~5 ｜ 适用: 2d, 3d
- 示例:
  - `c = Curve(cos(t), sin(t), t, 0, 2π)`
- ⚠ 注意: 参数变量名不能与已存在对象同名
- 别名: 参数曲线、轨迹曲线、参数方程

#### Derivative
- 签名: `Derivative(f)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `df = Derivative(f)`

#### NDerivative
- 签名: `NDerivative(f)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `ndf = NDerivative(f)`

#### Integral
- 签名: `Integral(f, a, b)` ｜ 参数个数: 1~3 ｜ 适用: 2d
- 示例:
  - `A = Integral(f, 0, π)`

#### TaylorPolynomial
- 签名: `TaylorPolynomial(f, x0, n)` ｜ 参数个数: 3~3 ｜ 适用: 2d
- 示例:
  - `T = TaylorPolynomial(sin(x), 0, 5)`

#### Root
- 签名: `Root(f, a, b)` ｜ 参数个数: 2~3 ｜ 适用: 2d
- 示例:
  - `r = Root(f, 0, 3)`

#### Extremum
- 签名: `Extremum(f, a, b)` ｜ 参数个数: 2~3 ｜ 适用: 2d
- 示例:
  - `E = Extremum(f, 0, 3)`

#### ImplicitCurve
- 签名: `ImplicitCurve(eq)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `ic = ImplicitCurve(x^2 + y^2 = 1)`

#### SlopeField
- 签名: `SlopeField(f)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `sf = SlopeField(1 - x*y)`

### 逻辑 / 判定

#### If
- 签名: `If(cond, then, else)` ｜ 参数个数: 3~3 ｜ 适用: 2d, 3d
- 示例:
  - `v = If(x>0, x^2, -x^2)`

#### Repeat
- 签名: `Repeat(n, cmd)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `Repeat(5, A = A + (1,0))`

#### AreCollinear
- 签名: `AreCollinear(A, B, C)` ｜ 参数个数: 3~3 ｜ 适用: 2d, 3d
- 示例:
  - `b = AreCollinear(A, B, C)`

#### AreParallel
- 签名: `AreParallel(a, b)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `b = AreParallel(l1, l2)`

#### ArePerpendicular
- 签名: `ArePerpendicular(a, b)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `b = ArePerpendicular(l1, l2)`

#### IsTangent
- 签名: `IsTangent(l, c)` ｜ 参数个数: 2~2 ｜ 适用: 2d
- 示例:
  - `b = IsTangent(l, c)`

#### Defined
- 签名: `Defined(obj)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `b = Defined(P)`

### 滑块 / 动画

#### Slider
- 签名: `Slider(min,max,step,speed,width,isAngle,horiz,anim,rand)` ｜ 参数个数: 2~9 ｜ 适用: 2d, 3d
- 示例:
  - `t = Slider(0, 10, 0.1, 1, 150, false, true, false, false)`
- ⚠ 注意: 官方仅 min/max 必选（2 参合法），其余缺省：step=0.1 speed=1 width=200

#### StartAnimation
- 签名: `StartAnimation() | StartAnimation(slider) | StartAnimation(bool)` ｜ 参数个数: 0~2 ｜ 适用: 2d, 3d
- 示例:
  - `StartAnimation()`
  - `StartAnimation(t)`
  - `StartAnimation(t, false)`
- ⚠ 注意: 官方另有 (list)/(slider|list, bool) 形态；StartAnimation(false) 暂停全部动画

#### SetAnimationSpeed
- 签名: `SetAnimationSpeed(obj, val)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `SetAnimationSpeed(t, 0.5)`

#### SetAnimationType
- 签名: `SetAnimationType(obj, type)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `SetAnimationType(t, 0)`
- ⚠ 注意: type: 0=oscillating, 1=increasing, 2=decreasing, 3=increasing once

#### SetValue
- 签名: `SetValue(obj, val)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `SetValue(t, 5)`

#### SetTrace
- 签名: `SetTrace(obj, flag)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `SetTrace(P, true)`

#### SetAnimating
- 签名: `SetAnimating(obj, flag)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `SetAnimating(t, false)`
- ⚠ 注意: flag=false 停止动画（等价 PauseAnimation/StopAnimation）；启动动画也可用 animate op

### 度量

#### Distance
- 签名: `Distance(P, l) | Distance(A, B)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `d = Distance(P, l)`
  - `d = Distance(A, B)`

#### Area
- 签名: `Area(obj)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `A = Area(poly)`

#### Perimeter
- 签名: `Perimeter(obj)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `p = Perimeter(poly)`

#### Circumference
- 签名: `Circumference(c)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `C = Circumference(c)`

#### Length
- 签名: `Length(obj)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `L = Length(s)`
  - `n = Length(list)`

#### Dot
- 签名: `Dot(u, v)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `d = Dot(u, v)`

#### Simplify
- 签名: `Simplify(expr)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `s = Simplify(x^2 + 2x + 1)`

#### Expand
- 签名: `Expand(expr)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `e = Expand((x+1)^2)`

#### Factor
- 签名: `Factor(expr)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `f = Factor(x^2 - 1)`

#### Substitute
- 签名: `Substitute(expr, old, new)` ｜ 参数个数: 3~3 ｜ 适用: 2d
- 示例:
  - `s = Substitute(x^2, x, 3)`

#### Sum
- 签名: `Sum(list)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `s = Sum({1,2,3})`

#### Min
- 签名: `Min(list)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `m = Min({3,1,2})`
- ⚠ 注意: 只支持单参数列表；两数取小/取大用 If(c, a, b)，禁止 Min(a, b) 双参数形式

#### Max
- 签名: `Max(list)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `M = Max({3,1,2})`
- ⚠ 注意: 只支持单参数列表；两数取大用 If(c, a, b)，禁止 Max(a, b) 双参数形式

#### Angle
- 签名: `Angle(line, plane) | Angle(P1, vertex, P2)` ｜ 参数个数: 2~3 ｜ 适用: 2d, 3d
- 示例:
  - `a = Angle(l, plane)`
  - `a = Angle(P1, O, P2)`
- ⚠ 注意: 三点形态 P1/vertex/P2 必须全部是【已声明的 Point】（先创建底角顶点与两条边的端点，再取 Angle）——引用滑块 t 时写大写 T 大小写不符必失败；斜面倾角：O=(0,0)、Hx=(4,0) 水平参考点、Ps=斜面上点，则 ang = Angle(Hx, O, Ps)

### 几何变换

#### Translate
- 签名: `Translate(obj, v)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `T = Translate(poly, v)`

#### Rotate
- 签名: `Rotate(obj, angle, center)` ｜ 参数个数: 3~3 ｜ 适用: 2d, 3d
- 示例:
  - `R = Rotate(poly, π/2, O)`

#### Reflect
- 签名: `Reflect(obj, line)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `R = Reflect(poly, l)`

#### Dilate
- 签名: `Dilate(obj, k, center)` ｜ 参数个数: 3~3 ｜ 适用: 2d
- 示例:
  - `D = Dilate(poly, 2, O)`

### 列表 / 序列

#### Sequence
- 签名: `Sequence(expr, var, start, end, step) | Sequence(start, end, inc) | Sequence(end)` ｜ 参数个数: 1~5 ｜ 适用: 2d, 3d
- 示例:
  - `pts = Sequence((i, i^2), i, 0, 10, 0.5)`
  - `ints = Sequence(7, 13, 2)`
  - `grid = Sequence(Sequence(Cube((i,j,0), (i+1,j,0)), i, 0, 2, 1), j, 0, 2, 1)`
- ⚠ 注意: 官方 5 种重载：Sequence(n)｜Sequence(k,n)｜Sequence(k,n,inc)〔整数表〕｜Sequence(expr,k,a,b)｜Sequence(expr,k,a,b,step)〔迭代表达式〕。① 表达式形态的 var 必须是单个 ASCII 字母（i/j/k/t/n），多字母/中文/数字会失败；② start/end/step 是三个独立参数，禁止 "0,1,0.1" 压缩写法；③ 禁止 Sequence(var, list) 简写；④ 参数之间用逗号，禁用句点；⑤ 嵌套 Sequence 时最外层 `)` 最易漏闭合；⑥ 三点式 Cube(A,B,C) 在 Sequence 内要求 A/B/C 为已声明 Point 且构成正方形（坐标字面量只适用两点式）。
- 别名: 序列、等间距、批量生成、网格点

#### IterationList
- 签名: `IterationList(f, init, n)` ｜ 参数个数: 3~3 ｜ 适用: 2d, 3d
- 示例:
  - `il = IterationList(x+1, 0, 10)`

#### Element
- 签名: `Element(list, i) | Element(list, i, j)` ｜ 参数个数: 2~3 ｜ 适用: 2d, 3d
- 示例:
  - `e = Element(pts, 3)`
  - `e = Element(mat, 2, 3)`

#### Join
- 签名: `Join(a, b)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `combined = Join(list1, list2)`

#### Sort
- 签名: `Sort(list)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `sorted = Sort(pts)`

#### Unique
- 签名: `Unique(list)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `u = Unique(pts)`

#### Zip
- 签名: `Zip(expr, var1, list1, var2, list2, ...)` ｜ 参数个数: 3~7 ｜ 适用: 2d, 3d
- 示例:
  - `z = Zip(a+b, a, {1,2}, b, {3,4})`
  - `squares = Zip(a^2, a, {1,2,3})`
- ⚠ 注意: 官方可变长：3/5/7 参数（1~3 组 变量+列表），单列表 3 参形态合法；变量数比列表多 1 时末位变量取 1..k 索引

#### Append
- 签名: `Append(list, obj)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `l2 = Append(pts, P)`

#### First
- 签名: `First(list)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `f = First(pts)`

#### Last
- 签名: `Last(list)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `l = Last(pts)`

#### Flatten
- 签名: `Flatten(list)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `flat = Flatten(nested)`

#### KeepIf
- 签名: `KeepIf(cond, list)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `filtered = KeepIf(x>0, pts)`

#### RemoveUndefined
- 签名: `RemoveUndefined(list)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `clean = RemoveUndefined(pts)`

### 文本 / 标签

#### Text
- 签名: `Text(text, Point [, Boolean])` ｜ 参数个数: 2~3 ｜ 适用: 2d, 3d
- 示例:
  - `T = Text("Hello", (0,0))`
  - `T = Text("公式", (3,2), true)`

#### LaTeX
- 签名: `LaTeX(expr, Point)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `T = LaTeX(sqrt(2)+1, (0,0))`

#### FractionText
- 签名: `FractionText(n)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `ft = FractionText(0.75)`

#### SurdText
- 签名: `SurdText(n)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `st = SurdText(sqrt(2))`

### 样式 / 属性

#### SetColor
- 签名: `SetColor(obj, color) | SetColor(obj, r, g, b)` ｜ 参数个数: 2~4 ｜ 适用: 2d, 3d
- 示例:
  - `SetColor(c, "red")`
  - `SetColor(c, 0.9, 0.2, 0.2)`
- ⚠ 注意: r/g/b 是 0~1 浮点（引擎按 ×255 解析）；写 0~255 整数会被钳成白色

#### SetVisibleInView
- 签名: `SetVisibleInView(obj, 1, true/false)` ｜ 参数个数: 3~3 ｜ 适用: 2d, 3d
- 示例:
  - `SetVisibleInView(c, 1, false)`
- ⚠ 注意: 对象显隐唯一命令形态（第二参是视图号 1/2）；GGB 无 SetVisible 命令；Set* 是语句，不能嵌套进 Sequence/Zip（批量逐条发命令或 eval_raw 换行分隔）

#### SetConditionToShowObject
- 签名: `SetConditionToShowObject(obj, condition)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `SetConditionToShowObject(c, n > 2)`
- ⚠ 注意: 按条件显隐（如与滑块联动）；查询显隐状态无命令形态，用 get_object_info 工具

#### SetLineStyle
- 签名: `SetLineStyle(obj, n)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `SetLineStyle(c, 1)`

#### SetLineOpacity
- 签名: `SetLineOpacity(obj, 0~1)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `SetLineOpacity(c, 0.5)`

#### SetLineThickness
- 签名: `SetLineThickness(obj, n)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `SetLineThickness(c, 3)`

#### SetFilling
- 签名: `SetFilling(obj, 0~1)` ｜ 参数个数: 2~2 ｜ 适用: 2d
- 示例:
  - `SetFilling(c, 0.3)`
- ⚠ 注意: 3D 中对立体无效——用 style op 的 opacity 字段替代

#### SetPointStyle
- 签名: `SetPointStyle(p, n)` ｜ 参数个数: 2~2 ｜ 适用: 2d
- 示例:
  - `SetPointStyle(P, 4)`

#### SetPointSize
- 签名: `SetPointSize(obj, n)` ｜ 参数个数: 2~2 ｜ 适用: 2d
- 示例:
  - `SetPointSize(P, 6)`
- ⚠ 注意: 3D 中不可用——用 Sphere(P, 0.2) 替代标记点

#### SetCaption
- 签名: `SetCaption(obj, text)` ｜ 参数个数: 2~2 ｜ 适用: 2d
- 示例:
  - `SetCaption(P, "质点")`
- ⚠ 注意: 3D 中不可用——直接用变量名标识

#### SetLabelMode
- 签名: `SetLabelMode(obj, n)` ｜ 参数个数: 2~2 ｜ 适用: 2d
- 示例:
  - `SetLabelMode(c, 2)`

#### ShowLabel
- 签名: `ShowLabel(obj, bool)` ｜ 参数个数: 2~2 ｜ 适用: 2d
- 示例:
  - `ShowLabel(P, true)`

#### Rename
- 签名: `Rename(obj, name)` ｜ 参数个数: 2~2 ｜ 适用: 2d
- 示例:
  - `Rename(c, "圆O")`

#### Delete
- 签名: `Delete(obj)` ｜ 参数个数: 1~1 ｜ 适用: 2d, 3d
- 示例:
  - `Delete(c)`

### 方程 / 表达式

#### Solve
- 签名: `Solve(eq)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `sol = Solve(x^2 = 4)`

#### NSolve
- 签名: `NSolve(eq)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `nsol = NSolve(x^3 = 2)`

#### Solutions
- 签名: `Solutions(eq)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `sol = Solutions(x^2 = 4)`

#### Roots
- 签名: `Roots(f, a, b)` ｜ 参数个数: 2~3 ｜ 适用: 2d
- 示例:
  - `r = Roots(f, 0, 3)`

#### SolveODE
- 签名: `SolveODE(f) | SolveODE(f, x0, y0, x1, step) | SolveODE(b, c, f, x0, y0, ...) ` ｜ 参数个数: 1~5 ｜ 适用: 2d
- 示例:
  - `pts = SolveODE(-x*y, x(A), y(A), 5, 0.1)`
  - `sol = SolveODE(y = x^2)`
- ⚠ 注意: 官方另有线性形 SolveODE(b,c,f,StartX,StartY) 与二阶 8 参形态（本知识库未全录）；不可用于 2D 向量场/电场线——该命令接受标量 ODE 而非二元向量场

### 3D 求交 / 截面

#### IntersectPath
- 签名: `IntersectPath(plane, poly) | IntersectPath(line, poly)` ｜ 参数个数: 2~2 ｜ 适用: 2d, 3d
- 示例:
  - `section = IntersectPath(Plane(A,C,F), cube)`
- ⚠ 注意: 官方 2D 亦有 IntersectPath(line, polygon)（线与多边形的截段）——2D/3D 均可用

### 3D 视图

#### SetViewDirection
- 签名: `SetViewDirection(dir)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `SetViewDirection((1,1,1))`
- ⚠ 注意: 纯 3D applet 中完全不可用——禁止在 3D 模式使用，依靠鼠标旋转

### 视图控制

#### SetAxesRatio
- 签名: `SetAxesRatio(x, y) | 3D: SetAxesRatio(x, y, z)` ｜ 参数个数: 2~3 ｜ 适用: 2d
- 示例:
  - `SetAxesRatio(1, 1)`
- ⚠ 注意: 3D 中不可靠——3D 等比例交给 view op 或用户手动

#### SetCoordSystem
- 签名: `SetCoordSystem(xMin, xMax, yMin, yMax)` ｜ 参数个数: 4~4 ｜ 适用: 2d, 3d
- 示例:
  - `SetCoordSystem(-5, 5, -3, 3)`

#### ZoomIn
- 签名: `ZoomIn([scale])` ｜ 参数个数: 0~1 ｜ 适用: 2d
- 示例:
  - `ZoomIn(0.5)`
- ⚠ 注意: 3D applet 中常返回 false——3D 用 view op 替代

#### CenterView
- 签名: `CenterView(P)` ｜ 参数个数: 1~1 ｜ 适用: 2d
- 示例:
  - `CenterView((0,0))`

#### SetCoords
- 签名: `SetCoords(obj, x, y)` ｜ 参数个数: 3~3 ｜ 适用: 2d
- 示例:
  - `SetCoords(P, 5, 3)`

❌ SetOpacity → ✅ SetLineOpacity（GeoGebra 无 SetOpacity，透明度用 SetLineOpacity）
❌ SetTransparency → ✅ SetLineOpacity（GeoGebra 无 SetTransparency，透明度用 SetLineOpacity）
❌ DSolve → ✅ SolveODE（GeoGebra 无 DSolve，常微分方程用 SolveODE）
❌ ContourPlot → ✅ ImplicitCurve（GeoGebra 无 ContourPlot，隐式曲线用 ImplicitCurve）
❌ Plot3D → ✅ Surface（GeoGebra 无 Plot3D，三维曲面用 Surface）
❌ VectorField → ✅ Sequence + Vector 嵌套（GeoGebra 无 VectorField，向量场用嵌套 Sequence 生成箭头网格）
❌ StreamPlot → ✅ Sequence + Vector 嵌套（GeoGebra 无 StreamPlot，流线用嵌套 Sequence 箭头网格）
❌ FieldLine → ✅ IterationList（GeoGebra 无 FieldLine，场线用 IterationList 递推）
❌ StreamLine → ✅ IterationList（GeoGebra 无 StreamLine，流线用 IterationList 递推）
❌ PauseAnimation → ✅ SetAnimating(obj, false)（GeoGebra 无 PauseAnimation——用 eval SetAnimating(obj, false) 或 animate op 的 on:false）
❌ StopAnimation → ✅ SetAnimating(obj, false)（GeoGebra 无 StopAnimation——用 eval SetAnimating 或 animate op）
❌ AnimateRotation → ✅ Rotate + Slider 组合（GeoGebra 无 AnimateRotation——用 Rotate(obj, t, O) + slider t 驱动）
❌ DrawPoint → ✅ Point({x,y})（GeoGebra 无 DrawPoint——用 Point({x,y}) 创建点）
❌ DrawLine → ✅ Segment(A,B)（GeoGebra 无 DrawLine——用 Segment(A,B) 创建线段）
❌ DrawCircle → ✅ Circle(O, r)（GeoGebra 无 DrawCircle——用 Circle(O, r) 创建圆）
❌ AddPoint → ✅ Point({x,y})（GeoGebra 无 AddPoint——用 Point 命令创建）
❌ MoveObject → ✅ SetCoords(obj, x, y)（GeoGebra 无 MoveObject——移动对象用 SetCoords 命令）
❌ Drag → ✅ SetCoords(obj, x, y)（GeoGebra 无 Drag——移动对象用 SetCoords）
❌ Play → ✅ StartAnimation()（GeoGebra 无 Play——启动动画用 StartAnimation()）
❌ Animate → ✅ StartAnimation()（GeoGebra 无 Animate 命令——用 StartAnimation() 或 animate op）
❌ ExportGIF → ✅ 无替代（前端处理）（GeoGebra 无 ExportGIF——导出由前端 JS 处理，不通过 GGB 命令）
❌ ExportImage → ✅ 无替代（前端处理）（GeoGebra 无 ExportImage——导出由前端 JS 处理）
❌ Variable → ✅ 直接赋值（GeoGebra 无 Variable 命令——直接 x = 3 即可定义变量）
❌ Parameter → ✅ Slider(min, max, ...)（GeoGebra 无 Parameter 命令——用 Slider 创建可调参数）
❌ SetOpaque → ✅ SetLineOpacity（GeoGebra 无 SetOpaque——透明度用 SetLineOpacity）
❌ El → ✅ Element（GeoGebra 无 El——列表取元素用 Element(list, n)（5.4.927 实测可用））
❌ Round → ✅ round（自托管 bundle（5.4.927）无大写 Round 命令——取整用小写函数 round(x, n)（小写实测可用））
❌ SetVisible → ✅ SetVisibleInView(obj, 1, true/false)（GGB 无 SetVisible 命令（5.4.927 实测静默 no-op）——显隐补视图号：SetVisibleInView(obj, 1, false)）
❌ GetVisibleInView → ✅ 无命令替代（get_object_info 工具）（GGB 无 GetVisibleInView 查询命令——显隐状态用 get_object_info 工具读取）
❌ IsVisibleInView → ✅ 无命令替代（get_object_info 工具）（GGB 无 IsVisibleInView 查询命令——显隐状态用 get_object_info 工具读取）
