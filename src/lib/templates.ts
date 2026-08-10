/**
 * 一键模板
 *
 * 按 domain（数学 general / 物理 physics）+ mode（平面 2d / 立体 3d）双重分类。
 * 3D 模板在 3D 模式下独立展示，2D 模板按 domain 展示。
 *
 * 提示词编写原则（v1.6）：
 *   - 含完整 slider 范围/默认值/单位，减少 Phase 1 臆测
 *   - 显式指定视窗范围，不泛写"view op 适配"
 *   - 物理模板显式要求 constants op 注入 g
 *   - 3D 模板遵循铁律：Cross 两步法、Sphere 标记点、禁 SetViewDirection/SetFilling/SetPointSize/SetCaption/ZoomIn
 *   - 矢量场景指定 vector/forceDiagram op，避免 Point+Point
 *   - 分母含距离平方的结构显式提醒 +0.001
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
    prompt: "斜抛运动演示。用 constants op 注入 g=9.8。v0 slider 1~50 默认 20 step 1 unit m/s label 初速度。theta slider 0~π/2 默认 π/4 step 0.01 unit rad label 仰角。t slider 0~5 默认 0 step 0.02 unit s。质点 P=(v0*cos(theta)*t, v0*sin(theta)*t-0.5*g*t^2)。速度矢量 V=(v0*cos(theta), v0*sin(theta)-g*t)，用 vector op 从 P 画到 P+V/5 绿色 #43a047。P 拖尾轨迹蓝色。unitAxes x/m y/m。视窗 -2~50 × -2~25。t 自动播放 increasing。",
    domain: "physics", mode: "2d"
  },
  {
    id: "circular", icon: "🎯", title: "圆周运动", subtitle: "向心加速度 + 转速可调",
    prompt: "匀速圆周运动。r slider 0.5~3 默认 2 step 0.1 unit m label 半径。omega slider 0.5~5 默认 1 step 0.1 unit rad/s label 角速度。t slider 0~10 默认 0 step 0.02 unit s。O=(0,0)，P=(r*cos(omega*t), r*sin(omega*t)) 红色点。vector op 画绿色速度 vArrow 从 P 到 P+(-r*omega*sin(omega*t), r*omega*cos(omega*t))/3。vector op 画橙色 #fb8c00 向心加速度 aArrow 从 P 到 P+(-r*omega^2*cos(omega*t), -r*omega^2*sin(omega*t))/5。Segment(O,P) 蓝色虚线。P 开启蓝色轨迹。视窗 -4~4 × -4~4。t 自动播放。",
    domain: "physics", mode: "2d"
  },
  {
    id: "pendulum", icon: "🪀", title: "单摆", subtitle: "小角近似 · 周期摆动",
    prompt: "单摆（小角近似）。constants op 注入 g=9.8。L slider 0.1~2 默认 1 step 0.05 unit m label 摆长。theta0 slider 0~π/3 默认 π/6 step 0.01 unit rad label 初角。t slider 0~10 默认 0 step 0.02 unit s。omega=sqrt(g/(L+0.001))。theta=theta0*cos(omega*t)。O=(0,0)，M=(L*sin(theta), -L*cos(theta))。Segment(O,M) 蓝色 thickness 2。M 红色 Sphere 效果用 Point 样式 0 size 5。M 拖尾轨迹蓝色。unitAxes x/m y/m。视窗 -1.5~1.5 × -1.5~0.3。t 动画 oscillating。",
    domain: "physics", mode: "2d"
  },
  {
    id: "spring", icon: "🌀", title: "弹簧振子", subtitle: "简谐振动 + 实时振动曲线",
    prompt: "水平弹簧振子（简谐振动）。kSpr slider 1~50 默认 10 step 1 unit N/m label 劲度系数。m slider 0.1~5 默认 1 step 0.1 unit kg label 质量。t slider 0~10 默认 0 step 0.02 unit s。omega=sqrt(kSpr/(m+0.001))。x=cos(omega*t)。P=(x,0) 红色点 size 5。P 下方画振动波形：用 Curve(t, x(t), t, 0, 10) 或定义 f(x)=cos(omega*x) 蓝色曲线。P 到横轴虚线垂线。视窗 0~10 × -1.5~1.5。标轴 t/s、x/m。t 自动播放。",
    domain: "physics", mode: "2d"
  },
  {
    id: "wave", icon: "🌊", title: "横波传播", subtitle: "行波 y=A·sin(kx−ωt)",
    prompt: "行波动画——一维横波向右传播。A slider 0.1~2 默认 1 step 0.1 unit m label 振幅。kw slider 0.5~5 默认 1.5 step 0.1 unit rad/m label 波数（用 kw 而非 k 避免 GGB 命名冲突）。omega slider 0.5~5 默认 2 step 0.1 unit rad/s label 角频率。t slider 0~10 默认 0 step 0.02 unit s。f(x)=A*sin(kw*x-omega*t) 蓝色曲线 thickness 2。标轴 x/m、y/m。视窗 0~10 × -2.5~2.5。t 自动播放。",
    domain: "physics", mode: "2d"
  },
  {
    id: "standing-wave", icon: "🪈", title: "驻波", subtitle: "两列反向行波叠加",
    prompt: "驻波（两列反向行波叠加）。A slider 0.1~2 默认 1 step 0.1 unit m。kw slider 0.5~5 默认 1.5 step 0.1 unit rad/m（避开 k 命名冲突）。omega slider 0.5~5 默认 2 step 0.1 unit rad/s。t slider 0~10 默认 0 step 0.02 unit s。正向 f1(x)=A*sin(kw*x-omega*t) 浅蓝虚线。反向 f2(x)=A*sin(kw*x+omega*t) 浅绿虚线。叠加 f(x)=f1(x)+f2(x) 蓝色实线 thickness 2。波节位置 xNode=pi/kw 原点标记。标轴 x/m、y/m。视窗 0~10 × -2.5~2.5。t 自动播放。",
    domain: "physics", mode: "2d"
  },
  {
    id: "dipole", icon: "🧲", title: "偶极子电场", subtitle: "正负电荷电场矢量网格",
    prompt: "电偶极子电场矢量网格。d slider 0.5~4 默认 2 step 0.1 unit m label 半间距。q slider 0.5~3 默认 1 step 0.1 unit C label 电荷量。正电荷 A=(d,0) 红色点 size 5，负电荷 B=(-d,0) 蓝色点 size 5。Ex(x,y)=q*(x-d)/(( (x-d)^2+y^2+0.001 )^1.5)-q*(x+d)/(( (x+d)^2+y^2+0.001 )^1.5)。Ey(x,y)=q*y/(( (x-d)^2+y^2+0.001 )^1.5)-q*y/(( (x+d)^2+y^2+0.001 )^1.5)。用 Sequence 嵌套 Vector 画 7×7 网格矢量（等比缩放避免箭头过大），紫色 #8e24aa。标轴 x/m、y/m。视窗 -5~5 × -4~4。",
    domain: "physics", mode: "2d"
  },
  {
    id: "lens", icon: "🔍", title: "凸透镜成像", subtitle: "物距可调 · 三条特殊光线",
    prompt: "薄凸透镜成像（高斯公式）。f slider 1~5 默认 3 step 0.1 unit cm label 焦距。u slider 1.5~10 默认 6 step 0.1 unit cm label 物距。透镜 x=0 竖线 Segment((0,-3),(0,3)) 蓝色 thickness 3。光轴 y=0 虚线。焦点 F=(-f,0) 和 F'=(f,0) 红色标记。物点 P=(-u,1.5) 红色。1/v=1/f-1/u → v=1/(1/f-1/(u+0.001))，像点 Q=(v, -(v/u)*1.5)。三条光线：① 平行→F' ② 过心直射 ③ 过F→平行，均为橙色虚线。物箭头从 (-u,0) 到 P，像箭头从 (v,0) 到 Q 虚线。视窗 -12~12 × -4~4。",
    domain: "physics", mode: "2d"
  },
  {
    id: "incline", icon: "📐", title: "斜面受力", subtitle: "重力 / 支持力 / 摩擦力矢量",
    prompt: "斜面物块受力分析。constants op 注入 g=9.8。m slider 0.1~10 默认 2 step 0.1 unit kg label 质量。theta slider 0~π/3 默认 π/6 step 0.01 unit rad label 倾角。A=(0,0)，B=(5*cos(theta), 5*sin(theta))。Segment(A,B) 蓝色 thickness 3 为斜面。P=(2.5*cos(theta), 2.5*sin(theta)) 为物块位置。用 forceDiagram op 在 P 点画三个力：G (0,-m*g/10) 红色 #e53935 label G，N (-sin(theta)*m*g*cos(theta)/10, cos(theta)*m*g*cos(theta)/10) 橙色 #fb8c00 label N，f (cos(theta)*m*g*sin(theta)/10, sin(theta)*m*g*sin(theta)/10) 紫色 #8e24aa label f。unitAxes x/m y/m。视窗 -2~6 × -3~4。",
    domain: "physics", mode: "2d"
  },

  // ═══════ 2D · 数学 ═══════
  {
    id: "sin-family", icon: "〰️", title: "正弦函数族", subtitle: "y=A·sin(kx+φ) 三参数可调",
    prompt: "正弦函数族 y=A·sin(kw·x+phi)。A slider 0.5~3 默认 1 step 0.1 label 振幅。kw slider 0.5~5 默认 1 step 0.1 label 频率（用 kw 避 GGB k 冲突）。phi slider -π~π 默认 0 step 0.05 unit rad label 相位。f(x)=A*sin(kw*x+phi) 蓝色曲线 thickness 2。灰色虚线 y=A 和 y=-A 标注振幅。视窗 -2π~2π × -3.5~3.5。标轴 x、y。",
    domain: "general", mode: "2d"
  },
  {
    id: "unit-circle", icon: "⭕", title: "单位圆与三角函数", subtitle: "角 θ 对应 sin/cos 线段",
    prompt: "单位圆与三角函数定义。theta slider 0~2π 默认 0 step 0.01 unit rad。O=(0,0)，Circle(O,1) 蓝色。P=(cos(theta), sin(theta)) 红色点 size 5。Segment(O,P) 绿色。从 P 向 x 轴引虚线垂足 (cos(theta),0) 橙色线段为 sin，从 P 向 y 轴引虚线垂足 (0,sin(theta)) 紫色线段为 cos。标轴 x、y。视窗 -1.5~1.5 × -1.5~1.5。theta 自动播放。",
    domain: "general", mode: "2d"
  },
  {
    id: "cycloid", icon: "🔁", title: "摆线", subtitle: "圆沿直线滚动 · 圆周点轨迹",
    prompt: "摆线——圆在 x 轴上纯滚动，圆周上一点的轨迹。r slider 0.5~3 默认 1 step 0.05 label 半径。t slider 0~4π 默认 0 step 0.02。圆心 C=(r*t, r)。当前圆 Circle(C,r) 浅蓝。P=(r*t-r*sin(t), r-r*cos(t)) 红色点 size 5。Segment(C,P) 绿色为当前半径。P 开启轨迹蓝色。x 轴为灰色虚线。视窗 0~14 × -0.5~3。t 自动播放。",
    domain: "general", mode: "2d"
  },
  {
    id: "conic", icon: "🥚", title: "圆锥曲线", subtitle: "椭圆 · 双曲线 · 抛物线对比",
    prompt: "圆锥曲线族对比。a slider 0.5~4 默认 3 step 0.1 label 长半轴。b slider 0.5~4 默认 2 step 0.1 label 短半轴。c=sqrt(abs(a^2-b^2)+0.001)。原点 O 蓝色椭圆 x^2/a^2+y^2/b^2=1 蓝色实线。焦点 F1=(c,0) F2=(-c,0) 红色。双曲线 x^2/a^2-y^2/b^2=1 绿色虚线（|x|≥a）。抛物线 y=x^2/(4*a) 紫色虚线。视窗 -6~6 × -4~4。",
    domain: "general", mode: "2d"
  },
  {
    id: "taylor", icon: "📈", title: "泰勒展开", subtitle: "sin(x) 的多项式逼近",
    prompt: "泰勒多项式逼近 sin(x)。n slider 1~15 默认 5 step 1 label 展开阶数。f(x)=sin(x) 蓝色虚线。T(x)=TaylorPolynomial(sin(x), 0, n) 红色实线 thickness 2。在原点附近放大可见逼近效果随 n 增大而改善。视窗 -2π~2π × -2~2。标轴 x、y。",
    domain: "general", mode: "2d"
  },
  {
    id: "integral", icon: "∫", title: "定积分与黎曼和", subtitle: "曲线下面积 · 矩形逼近",
    prompt: "定积分黎曼左和可视化。f(x)=sin(x)+2 蓝色曲线 thickness 2。n slider 1~50 默认 10 step 1 label 分割数。x=0 到 x=π 区间蓝色填充。n 个矩形（黎曼左和）半透明蓝色 opacity 0.3 逼近面积。Text 显示精确积分值 a=Integral(f, 0, π) 和黎曼和近似值。视窗 -0.5~3.5 × 0~3.5。",
    domain: "general", mode: "2d"
  },
  {
    id: "rose", icon: "🌹", title: "玫瑰线", subtitle: "极坐标花瓣曲线",
    prompt: "极坐标玫瑰线 r=a·cos(kθ)。a slider 1~3 默认 2 step 0.1 label 振幅。kv slider 2~7 默认 4 step 1 label 花瓣参数（kv 偶→2kv 瓣，奇→kv 瓣）。Curve(a*cos(kv*t)*cos(t), a*cos(kv*t)*sin(t), t, 0, 2π) 红色 thickness 2。极轴灰色虚线。视窗 -4~4 × -4~4。",
    domain: "general", mode: "2d"
  },

  // ═══════ 3D 立体（独立于 domain，3D 模式下全量展示） ═══════
  {
    id: "cube-section", icon: "📦", title: "正方体截面", subtitle: "平面 ACF 截正方体",
    prompt: "3D 正方体平面截面。A=(0,0,0) B=(3,0,0)。cube=Cube(A,B) 蓝色半透明 opacity 0.25。C=(3,3,0) F=(0,0,3)。Plane(A,C,F) 灰色半透明。截面三角形=IntersectPath(Plane(A,C,F), cube) 红色 #E91E63 thickness 4。A、C、F 点红色 size 6。视窗 xmin=-2 xmax=6 ymin=-2 ymax=6 zmin=-1 zmax=5。",
    domain: "general", mode: "3d"
  },
  {
    id: "tetrahedron", icon: "🔺", title: "正四面体", subtitle: "等边三角锥 · 体积标注",
    prompt: "3D 正四面体。A=(0,0,0) B=(3,0,0) C=(1.5, 2.598, 0)。D=(1.5, 0.866, 2.449) 为顶点（高 h=edge*sqrt(2/3)≈2.449）。tet=Tetrahedron(A,B,C,D) 蓝色半透明 opacity 0.25。底面 ABC 轮廓 orange thickness 2。D 点红色 size 6。eval 计算体积 vol=Volume(tet) 显示。Sphere(D,0.12) 红色标记顶点。视窗 xmin=-1 xmax=5 ymin=-1 ymax=4 zmin=-1 zmax=4。",
    domain: "general", mode: "3d"
  },
  {
    id: "cylinder-net", icon: "🫙", title: "圆柱与展开图", subtitle: "底面圆 + 侧面展开",
    prompt: "3D 圆柱体展开图。O=(0,0,0)，cyl=Cylinder(O, (0,0,5), 2) 蓝色半透明 opacity 0.25。底面和顶面圆形轮廓加深。Net(cyl, 0) 橙色绘制展开图（圆柱侧面展开为矩形 + 两个底面圆），用 Net 命令一步到位——不要用 Polygon 手动拼接。视窗 xmin=-5 xmax=7 ymin=-3 ymax=7 zmin=-1 zmax=6。",
    domain: "general", mode: "3d"
  },
  {
    id: "sphere-section", icon: "🔵", title: "球体截面", subtitle: "平面截球 · 截面圆高亮",
    prompt: "3D 球体被水平面截切。sph=Sphere((0,0,0), 3) 蓝色半透明 opacity 0.20。plane=Plane((0,0,1.5), Vector((0,0,1))) 灰色半透明 opacity 0.25。截面圆=IntersectPath(plane, sph) 橙色 #E91E63 thickness 4。球心 (0,0,0) 蓝色点。截面圆心 (0,0,1.5) 红色点。球心到截面圆心虚线。视窗 xmin=-4 xmax=4 ymin=-4 ymax=4 zmin=-3 zmax=3。",
    domain: "general", mode: "3d"
  },
  {
    id: "pyramid", icon: "🔻", title: "棱锥", subtitle: "底面正方形 · 顶点投影",
    prompt: "3D 正四棱锥。A=(2,2,0) B=(2,-2,0) C=(-2,-2,0) D=(-2,2,0)。base=Polygon(A,B,C,D) 灰色半透明 opacity 0.2 轮廓加粗。apex=(0,0,5) 红色点 size 6。pyr=Pyramid(base, apex) 蓝色半透明 opacity 0.25。从 apex 向底面中心 O=(0,0,0) 画虚线垂线 Segment(apex,O) 灰色虚线。计算体积 Volume(pyr) 用 Text 显示。Sphere(apex,0.15) 红色标记顶点。视窗 xmin=-3 xmax=3 ymin=-3 ymax=3 zmin=-1 zmax=6。",
    domain: "general", mode: "3d"
  },
  {
    id: "helix", icon: "🧬", title: "螺旋运动", subtitle: "带电粒子在磁场中",
    prompt: "3D 螺旋线——电子在匀强磁场 B 中做螺旋运动。t slider 0~6π 默认 0 step 0.02。螺旋曲线 Curve(cos(t), sin(t), t/3, t, 0, 6π) 橙色 thickness 2。动点 P=(cos(t), sin(t), t/3)。Sphere(P, 0.12) 红色标记电子。速度矢量 vVec=( -sin(t), cos(t), 1/3 ) 绿色 #43a047——用 O=(0,0,0)，vTmp=Vector((0,0,0), (-sin(t), cos(t), 1/3))，vArrow=Translate(vTmp, P) 两步法。磁场矢量 B=(0,0,1) 紫色 #8e24aa 沿 z 轴箭头。P 轨迹用 Sequence 采样 60 个点渲染。视窗 xmin=-2 xmax=2 ymin=-2 ymax=2 zmin=0 zmax=7。t 自动播放。",
    domain: "general", mode: "3d"
  },
  {
    id: "cross-product-3d", icon: "✖️", title: "空间向量叉乘", subtitle: "u×v 可视化",
    prompt: "3D 空间向量叉乘 u×v 可视化。O=(0,0,0)。A=(2,0,0) B=(1,2,0)。uVec=Vector(O,A) 红色 thickness 3。vVec=Vector(O,B) 绿色 thickness 3。叉乘 w=Cross(uVec, vVec)（3D 中 Cross 返回自由 Vector 类型）。用两步法画箭头：end=O+w，wArrow=Vector(O, end) 蓝色 thickness 3。uv 所在平面半透明灰色矩形（A、B、A+B 四点 Polygon 半透明）。标出 A 点「u」、B 点「v」、end 点「u×v」。视窗 xmin=-2 xmax=4 ymin=-2 ymax=3 zmin=-1 zmax=3。",
    domain: "general", mode: "3d"
  },
  {
    id: "space-curve", icon: "〰", title: "空间曲线", subtitle: "三维参数曲线动画",
    prompt: "3D 空间参数曲线与动点动画。t slider 0~4π 默认 0 step 0.02。定义曲线 SpaceCurve=Curve(sin(t), cos(t), t/3, t, 0, 4π) 紫色 thickness 2。动点 P=(sin(t), cos(t), t/3)。Sphere(P, 0.12) 红色标记。沿曲线等间隔采样 40 个点用 Sequence 生成半透点列（淡紫色 opacity 0.4），视觉上形成轨迹。视窗 xmin=-2 xmax=2 ymin=-2 ymax=2 zmin=0 zmax=5。t 自动播放。",
    domain: "general", mode: "3d"
  },
];
