/**
 * 一键模板
 *
 * 按 domain（数学 general / 物理 physics）+ mode（平面 2d / 立体 3d）双重分类。
 * 3D 模板在 3D 模式下独立展示，2D 模板按 domain 展示。
 */

export interface Template {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  prompt: string;
  domain: "general" | "physics";
  /** 适用的画布模式 */
  mode: "2d" | "3d";
}

export const TEMPLATES: Template[] = [
  // ═══════ 2D · 物理 ═══════
  {
    id: "projectile", icon: "🏐", title: "斜抛运动", subtitle: "抛物线轨迹 + 速度矢量",
    prompt: "斜抛运动：初速度 v0 slider 1~50 默认 20 m/s，仰角 theta slider 0~π/2 默认 π/4 rad，时间 t slider 0~5 默认 0 s。质点 P 沿抛物线运动，留蓝色轨迹，绿色速度矢量跟随。标轴 x/m、y/m，视窗 -2~50 × -2~25，t 自动播放 increasing。",
    domain: "physics", mode: "2d"
  },
  {
    id: "circular", icon: "🎯", title: "圆周运动", subtitle: "向心加速度 + 转速可调",
    prompt: "匀速圆周运动：半径 r slider 0.5~3 默认 2，角速度 omega slider 0.5~5 默认 1 rad/s，时间 t slider 0~10。质点 P=(r*cos(omega*t), r*sin(omega*t)) 留蓝色轨迹，红色半径矢量 OP，橙色向心加速度矢量。视窗 -4~4 × -4~4，t 自动播放。",
    domain: "physics", mode: "2d"
  },
  {
    id: "pendulum", icon: "🪀", title: "单摆", subtitle: "小角近似 · 周期摆动",
    prompt: "单摆：摆长 L slider 0.1~2 默认 1 m，初角 theta0 slider 0~π/3 默认 π/6 rad，时间 t slider 0~10。omega=sqrt(g/L)，theta=theta0*cos(omega*t)。蓝色摆线 O→M，质点 M 红色留轨迹。视窗 -1.5~1.5 × -1.5~0.3，t 自动播放 oscillating。",
    domain: "physics", mode: "2d"
  },
  {
    id: "spring", icon: "🌀", title: "弹簧振子", subtitle: "简谐振动 + 实时振动曲线",
    prompt: "水平弹簧振子：劲度系数 k slider 1~50 默认 10 N/m，质量 m slider 0.1~5 默认 1 kg，时间 t slider 0~10。x(t)=cos(sqrt(k/m)*t)。质点 P=(x(t),0) 红色留轨迹，下方同步画振动波形 (t,x(t))。标轴 t/s、x/m，视窗 0~10 × -1.5~1.5，t 自动播放。",
    domain: "physics", mode: "2d"
  },
  {
    id: "wave", icon: "🌊", title: "横波传播", subtitle: "行波 y=A·sin(kx−ωt)",
    prompt: "行波动画：振幅 A slider 0.1~2 默认 1，波数 kw slider 0.5~5 默认 1.5 rad/m（用 kw 而非 k 避免冲突），角频率 omega slider 0.5~5 默认 2 rad/s，时间 t slider 0~10。f(x)=A*sin(kw*x-omega*t) 蓝色曲线。标轴 x/m、y/m，视窗 0~10 × -2.5~2.5，t 自动播放。",
    domain: "physics", mode: "2d"
  },
  {
    id: "standing-wave", icon: "🪈", title: "驻波", subtitle: "两列反向行波叠加",
    prompt: "驻波动画：振幅 A slider 0.1~2 默认 1，波数 kw slider 0.5~5 默认 1.5，角频率 omega slider 0.5~5 默认 2，时间 t slider 0~10。y1=A*sin(kw*x-omega*t) 正向、y2=A*sin(kw*x+omega*t) 反向，叠加 y=y1+y2 蓝色，显示波节和波腹。标轴 x/m、y/m，视窗 0~10 × -2.5~2.5，t 自动播放。",
    domain: "physics", mode: "2d"
  },
  {
    id: "dipole", icon: "🧲", title: "偶极子电场", subtitle: "正负电荷电场矢量网格",
    prompt: "偶极子电场：间距半值 d slider 0.5~4 默认 2 m，电荷量 q slider 0.5~3 默认 1。+q 红点 A=(d,0)，-q 蓝点 B=(-d,0)。用 Ex/Ey 标量函数 + 嵌套 Sequence Vector 画矢量网格，分母 +0.01 防除零。标轴 x/m、y/m，视窗 -5~5 × -4~4。",
    domain: "physics", mode: "2d"
  },
  {
    id: "lens", icon: "🔍", title: "凸透镜成像", subtitle: "物距可调 · 三条光线",
    prompt: "薄凸透镜成像：焦距 f slider 1~5 默认 3，物距 u slider 1.5~10 默认 6（物在 x=-u 处）。透镜 x=0 竖线，光轴 y=0。物点 P=(-u,1)，用成像公式求像距 v，像点 Q。画三条光线：平行→焦、过心直射、过焦→平行。视窗 -12~12 × -4~4。",
    domain: "physics", mode: "2d"
  },
  {
    id: "incline", icon: "📐", title: "斜面受力", subtitle: "重力 / 支持力 / 摩擦力矢量",
    prompt: "斜面物块受力分析：质量 m slider 0.1~10 默认 2 kg，倾角 theta slider 0~π/3 默认 π/6 rad。蓝色斜面，物块位于斜面中点。用 forceDiagram op 画三个力：G 红色、N 橙色、f 紫色。标轴 x/m、y/m，视窗 -2~6 × -3~4。",
    domain: "physics", mode: "2d"
  },

  // ═══════ 2D · 数学 ═══════
  {
    id: "sin-family", icon: "〰️", title: "正弦函数族", subtitle: "y=A·sin(kx+φ) 三参数可调",
    prompt: "正弦函数族：振幅 A slider 0.5~3 默认 1，频率 k slider 0.5~5 默认 1，相位 phi slider -π~π 默认 0。f(x)=A*sin(k*x+phi) 蓝色曲线。视窗 -2π~2π × -3.5~3.5。",
    domain: "general", mode: "2d"
  },
  {
    id: "unit-circle", icon: "⭕", title: "单位圆与三角函数", subtitle: "角 θ 对应 sin/cos 线段",
    prompt: "单位圆三角函数：角度 theta slider 0~2π 默认 0 rad。单位圆蓝色，动点 P=(cosθ,sinθ) 红色。绿色半径 OP，橙色正弦垂线，紫色余弦线段。标轴 x、y，视窗 -1.5~1.5 × -1.5~1.5，theta 自动播放。",
    domain: "general", mode: "2d"
  },
  {
    id: "cycloid", icon: "🔁", title: "摆线", subtitle: "圆沿直线滚动 · 圆周点轨迹",
    prompt: "摆线：半径 r slider 0.5~3 默认 1，时间 t slider 0~4π。圆沿 x 轴滚动，圆心 C=(r*t, r)，圆周点 P=(r*t-r*sin(t), r-r*cos(t)) 红色留轨迹。浅蓝当前圆、绿色半径。标轴 x、y，视窗 0~14 × -0.5~3，t 自动播放。",
    domain: "general", mode: "2d"
  },
  {
    id: "conic", icon: "🥚", title: "圆锥曲线", subtitle: "椭圆 · 双曲线 · 抛物线对比",
    prompt: "圆锥曲线族：长半轴 a slider 0.5~4 默认 3，短半轴 b slider 0.5~4 默认 2。椭圆中心原点蓝色，焦点 F1/F2 红色，焦距 c=sqrt(|a²-b²|)。双曲线 x²/a²-y²/b²=1 虚线，抛物线 y=x²/(2a) 虚线。视窗 -6~6 × -4~4。",
    domain: "general", mode: "2d"
  },
  {
    id: "taylor", icon: "📈", title: "泰勒展开", subtitle: "sin(x) 的多项式逼近",
    prompt: "泰勒逼近 sin(x)：阶数 n slider 1~12 默认 5 step 1。f(x)=sin(x) 蓝色虚线，T(x)=TaylorPolynomial(sin(x),0,n) 红色实线。视窗 -2π~2π × -2~2。",
    domain: "general", mode: "2d"
  },
  {
    id: "integral", icon: "∫", title: "定积分与黎曼和", subtitle: "曲线下面积 · 矩形逼近",
    prompt: "定积分可视化：f(x)=sin(x)+2 蓝色曲线，分割数 n slider 1~50 默认 10 step 1。x=0 到 x=π 区间，n 个矩形逼近面积（黎曼左和），半透蓝色，显示精确积分值 Integral(f,0,π)。视窗 -0.5~3.5 × 0~3.5。",
    domain: "general", mode: "2d"
  },
  {
    id: "rose", icon: "🌹", title: "玫瑰线", subtitle: "极坐标花瓣曲线",
    prompt: "极坐标玫瑰线：振幅 a slider 1~3 默认 2，花瓣数 k slider 2~7 默认 4 step 1。曲线 Curve(a*cos(k*t)*cos(t), a*cos(k*t)*sin(t), t, 0, 2π) 红色。视窗 -4~4 × -4~4。",
    domain: "general", mode: "2d"
  },

  // ═══════ 3D 立体（独立于 domain，3D 模式下全量展示） ═══════
  {
    id: "cube-section", icon: "📦", title: "正方体截面", subtitle: "平面 ACF 截正方体",
    prompt: "3D 正方体截面：边长 3，正方体 ABCD-EFGH，平面 ACF 截正方体得三角形截面。顶点两点法：A=(0,0,0) B=(3,0,0) → cube=Cube(A,B)，截面用到的顶点先声明再构造。截面红色高亮，立体半透蓝色。view op 适配。",
    domain: "general", mode: "3d"
  },
  {
    id: "tetrahedron", icon: "🔺", title: "正四面体", subtitle: "等边三角锥 · 体积标注",
    prompt: "3D 正四面体：边长 3。A=(0,0,0) B=(3,0,0) C=(1.5, 3*sqrt(3)/2-1.5, 0)，顶点 D 在底面正上方。用 Tetrahedron(A,B,C,D) 构造，半透蓝色 opacity 0.3。标注体积用 Volume 命令，底面轮廓加粗。view op 适配。",
    domain: "general", mode: "3d"
  },
  {
    id: "cylinder-net", icon: "🫙", title: "圆柱与展开图", subtitle: "底面圆 + 侧面展开",
    prompt: "3D 圆柱：底面半径 2，高 5。底面圆心 O=(0,0,0)，轴沿 z 轴。cyl=Cylinder(O, (0,0,5), 2) 半透蓝色。展开图用 Net(cyl, 0) 命令（禁止 Polygon 拼接），橙色绘制。view op 适配。",
    domain: "general", mode: "3d"
  },
  {
    id: "sphere-section", icon: "🔵", title: "球体截面", subtitle: "平面截球 · 截面圆高亮",
    prompt: "3D 球体截面：半径 3，球心原点。球 Sphere((0,0,0), 3) 半透蓝 opacity 0.3。平面 z=1.5 用 Plane 命令，截球得截面圆 IntersectPath(plane, sphere)，橙色高亮 thickness 4。标注球心和截面半径。view op 适配。",
    domain: "general", mode: "3d"
  },
  {
    id: "pyramid", icon: "🔻", title: "棱锥", subtitle: "底面正方形 · 顶点投影",
    prompt: "3D 正四棱锥：底面边长 4 的正方形（z=0），顶点在 (0,0,5)。底边四点 (2,2,0)(2,-2,0)(-2,-2,0)(-2,2,0)，Pyramid(poly, (0,0,5)) 半透蓝色。标注体积 Volume，从顶点向底面中心画虚线垂线。view op 适配。",
    domain: "general", mode: "3d"
  },
  {
    id: "helix", icon: "🧬", title: "螺旋运动", subtitle: "带电粒子在磁场中",
    prompt: "3D 螺旋运动：电子在匀强磁场 B 中做螺旋线。t slider 0~6π 默认 0。螺旋曲线 Curve(cos(t), sin(t), t/3, t, 0, 6π) 橙色。红色小球 Sphere(P,0.2) 表示电子，绿色速度矢量、紫色磁场矢量。view op 适配，t 自动播放。",
    domain: "general", mode: "3d"
  },
  {
    id: "cross-product-3d", icon: "✖️", title: "空间向量叉乘", subtitle: "u×v 可视化",
    prompt: "3D 空间向量叉乘：O=(0,0,0)，A=(2,0,0)，B=(1,2,0)。uVec=Vector(O,A) 红色、vVec=Vector(O,B) 绿色。叉乘 wVec=Cross(uVec,vVec)，end=O+wVec，wArrow=Vector(O,end) 蓝色。画 uv 所在平面矩形半透灰色。用 view op 设视窗 -2~4 × -2~3，不要 ZoomIn/SetCaption。",
    domain: "general", mode: "3d"
  },
  {
    id: "space-curve", icon: "〰", title: "空间曲线", subtitle: "三维参数曲线动画",
    prompt: "3D 空间曲线动画：t slider 0~4π 默认 0。定义三维参数曲线 Curve(sin(t), cos(t), t/3, t, 0, 4π) 紫色。动点 P=(sin(t), cos(t), t/3) 红球 Sphere(P,0.15)，留轨迹用多个点 Sequence 生成采样点列。view op 适配，t 自动播放。",
    domain: "general", mode: "3d"
  },
];
