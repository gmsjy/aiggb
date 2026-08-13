/**
 * 一键模板
 *
 * 按 domain（数学 general / 物理 physics）+ mode（平面 2d / 立体 3d）双重分类。
 * 精简版：每个分类（物理2D / 数学2D / 3D）各保留 4 个最有代表性的模板。
 *
 * 提示词编写原则（v2.1 —— 精简优化版）：
 *   - 【训练闭环】模板是「意图→成功命令」训练样本的最佳来源：点击 → specCache 精确命中 →
 *     Phase 2 编译 → 首次执行全成功 → 自动存训练库。因此必须"一次成功率高"。
 *   - 【保留关键，精简样板】保留 Phase 2 编译必需的信息（slider 完整参数、数学公式、
 *     矢量 to 坐标表达式、复杂 Sequence 命令、视窗范围），删冗余（op 前缀、重复样式、长解释）。
 *   - 【矢量铁律】矢量 to 一律用坐标表达式（"P+(dx,dy)"），禁止 Point+Point；/k 写进每个分量。
 *   - 【Pre-flight 兼容】slider 保证 min<max / step>0 / value∈[min,max]。
 *   - 物理模板注入 g=9.8；分母 +0.001 防除零；3D 遵循铁律（Cross 两步法、Cube 两点式、
 *     禁 SetViewDirection/SetFilling/SetPointSize/SetCaption/ZoomIn）。
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
  // ═══════ 2D · 物理（4 个） ═══════
  {
    id: "projectile", icon: "🏐", title: "斜抛运动", subtitle: "抛物线轨迹 + 速度矢量",
    prompt: "斜抛运动。注入 g=9.8。参数：v0=20(1~50 step1 m/s 初速)，theta=π/4(0~π/2 step0.01 rad 仰角)，t=0(0~5 step0.02 s)。质点 P=(v0*cos(theta)*t, v0*sin(theta)*t-0.5*g*t^2) 红。矢量 vArrow: P→P+(v0*cos(theta)/5, (v0*sin(theta)-g*t)/5) 绿#43a047。轨迹 P 蓝拖尾。视窗 -2~50 × -2~25。轴 x/m y/m。动画 t increasing。",
    domain: "physics", mode: "2d"
  },
  {
    id: "circular", icon: "🎯", title: "圆周运动", subtitle: "向心加速度 + 转速可调",
    prompt: "匀速圆周运动。参数：r=2(0.5~3 step0.1 m 半径)，omega=1(0.5~5 step0.1 rad/s 角速度)，t=0(0~10 step0.02 s)。O=(0,0)，P=(r*cos(omega*t), r*sin(omega*t)) 红。矢量 vArrow: P→P+(-r*omega*sin(omega*t)/3, r*omega*cos(omega*t)/3) 绿#43a047。矢量 aArrow(向心): P→P+(-r*omega^2*cos(omega*t)/5, -r*omega^2*sin(omega*t)/5) 橙#fb8c00。Segment(O,P) 蓝虚线。轨迹 P 蓝。视窗 -4~4 × -4~4。动画 t 自动。",
    domain: "physics", mode: "2d"
  },
  {
    id: "pendulum", icon: "🪀", title: "单摆", subtitle: "小角近似 · 周期摆动",
    prompt: "单摆（小角近似）。注入 g=9.8。参数：L=1(0.1~2 step0.05 m 摆长)，theta0=π/6(0~π/3 step0.01 rad 初角)，t=0(0~10 step0.02 s)。omega=sqrt(g/(L+0.001))，theta=theta0*cos(omega*t)。O=(0,0)，M=(L*sin(theta), -L*cos(theta)) 红。Segment(O,M) 蓝。轨迹 M 蓝拖尾。视窗 -1.5~1.5 × -1.5~0.3。轴 x/m y/m。动画 t oscillating。",
    domain: "physics", mode: "2d"
  },
  {
    id: "field-dipole", icon: "🧿", title: "偶极子电场", subtitle: "正负电荷电场线对称弧族",
    prompt: "等量异种电荷电场。参数：d=2(1~3 step0.1)，q=3(1~5 step1)。A=(d,0) 红，B=(-d,0) 蓝。上半电场线 Sequence(CircumcircleArc(A,(0,j),B), j, 0.4, 2.6, 0.45) 红，下半 Sequence(CircumcircleArc(A,(0,-j),B), j, 0.4, 2.6, 0.45) 红。中垂线 Segment(B,A) 红虚线。方向箭头 Vector((-0.5,0),(0.2,0)) 黑。标注 +q @A、−q @B。视窗 -5~5 × -4~4。轴 x/m y/m。",
    domain: "physics", mode: "2d"
  },

  // ═══════ 2D · 数学（4 个） ═══════
  {
    id: "sin-family", icon: "〰️", title: "正弦函数族", subtitle: "y=A·sin(kx+φ) 三参数可调",
    prompt: "正弦函数族 y=A*sin(kw*x+phi)。参数：A=1(0.5~3 step0.1 振幅)，kw=1(0.5~5 step0.1 频率)，phi=0(-π~π step0.05 rad 相位)。f(x)=A*sin(kw*x+phi) 蓝。y=A、y=-A 灰虚线（振幅边界）。视窗 -2π~2π × -3.5~3.5。轴 x y。",
    domain: "general", mode: "2d"
  },
  {
    id: "unit-circle", icon: "⭕", title: "单位圆与三角函数", subtitle: "角 θ 对应 sin/cos 线段",
    prompt: "单位圆与三角函数。参数：theta=0(0~2π step0.01 rad)。O=(0,0)，Circle(O,1) 蓝。P=(cos(theta),sin(theta)) 红。Segment(O,P) 绿。垂线 Segment(P,(cos(theta),0)) 橙（sin 值）、Segment(P,(0,sin(theta))) 紫（cos 值）。视窗 -1.5~1.5 × -1.5~1.5。动画 theta 自动。",
    domain: "general", mode: "2d"
  },
  {
    id: "conic", icon: "🥚", title: "圆锥曲线", subtitle: "椭圆 · 双曲线 · 抛物线对比",
    prompt: "圆锥曲线对比。参数：a=3(0.5~4 step0.1 长半轴)，b=2(0.5~4 step0.1 短半轴)。c=sqrt(abs(a^2-b^2)+0.001)。椭圆 x^2/a^2+y^2/b^2=1 蓝。焦点 F1=(c,0) F2=(-c,0) 红。双曲线 x^2/a^2-y^2/b^2=1 绿虚线。抛物线 y=x^2/(4a) 紫虚线。视窗 -6~6 × -4~4。轴 x y。",
    domain: "general", mode: "2d"
  },
  {
    id: "cycloid", icon: "🔁", title: "摆线", subtitle: "圆沿直线滚动 · 圆周点轨迹",
    prompt: "摆线（圆在 x 轴上滚动，圆周点轨迹）。参数：r=1(0.5~3 step0.05)，t=0(0~4π step0.02)。圆心 C=(r*t, r)，圆 Circle(C,r) 浅蓝。P=(r*t-r*sin(t), r-r*cos(t)) 红。Segment(C,P) 绿。轨迹 P 蓝。x 轴灰虚线。视窗 0~14 × -0.5~3。动画 t 自动。",
    domain: "general", mode: "2d"
  },

  // ═══════ 3D 立体（4 个，3D 模式下全量展示） ═══════
  {
    id: "cube-section", icon: "📦", title: "正方体截面", subtitle: "平面 ACF 截正方体",
    prompt: "3D 正方体截面。A=(0,0,0) B=(3,0,0)，cube=Cube(A,B)（两点式）半透明蓝。C=(3,3,0) F=(0,0,3)。截面=IntersectPath(Plane(A,C,F), cube) 红。A/C/F 红。视窗 xmin=-2 xmax=6 ymin=-2 ymax=6 zmin=-1 zmax=5。3D 禁 SetViewDirection/SetFilling/SetPointSize/SetCaption/ZoomIn。",
    domain: "general", mode: "3d"
  },
  {
    id: "tetrahedron", icon: "🔺", title: "正四面体", subtitle: "等边三角锥 · 体积标注",
    prompt: "3D 正四面体。A=(0,0,0) B=(3,0,0) C=(1.5,2.598,0) D=(1.5,0.866,2.449)。tet=Tetrahedron(A,B,C,D) 半透明蓝。底面 ABC 橙轮廓。vol=Volume(tet) Text。Sphere(D,0.12) 红标记顶点。视窗 xmin=-1 xmax=5 ymin=-1 ymax=4 zmin=-1 zmax=4。3D 禁 SetViewDirection/SetFilling/SetPointSize/SetCaption。",
    domain: "general", mode: "3d"
  },
  {
    id: "sphere-section", icon: "🔵", title: "球体截面", subtitle: "平面截球 · 截面圆高亮",
    prompt: "3D 球体截面。sph=Sphere((0,0,0),3) 半透明蓝。plane=Plane((0,0,1.5),Vector((0,0,1))) 半透明灰。截面=IntersectPath(plane,sph) 橙。球心/截面圆心点。虚线 Segment((0,0,0),(0,0,1.5)) 灰。视窗 xmin=-4 xmax=4 ymin=-4 ymax=4 zmin=-3 zmax=3。3D 禁 SetViewDirection/SetFilling/SetPointSize/SetCaption。",
    domain: "general", mode: "3d"
  },
  {
    id: "helix", icon: "🧬", title: "螺旋运动", subtitle: "带电粒子在磁场中",
    prompt: "3D 螺旋线（带电粒子在匀强磁场）。参数：t=0(0~6π step0.02)。曲线 Curve(cos(t),sin(t),t/3,t,0,6π) 橙。动点 P=(cos(t),sin(t),t/3)，Sphere(P,0.12) 红。速度矢量：vTmp=Vector((0,0,0),(-sin(t),cos(t),1/3))，vArrow=Translate(vTmp,P) 绿（两步法防 Point+Point）。磁场 B 沿 z 轴紫：bTmp=Vector((0,0,0),(0,0,1))，B=Translate(bTmp,(0,0,0))。采样轨迹 Sequence(Sphere((cos(i*0.1),sin(i*0.1),i*0.1/3),0.05), i, 0, 59, 1) 淡紫。视窗 xmin=-2 xmax=2 ymin=-2 ymax=2 zmin=0 zmax=7。动画 t 自动。3D 禁 SetViewDirection/SetFilling/SetPointSize/SetCaption。",
    domain: "general", mode: "3d"
  },
];
