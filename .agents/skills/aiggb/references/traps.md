# GeoGebra 命令陷阱清单（bundle 5.4.927 实测）

> 本文件是 AiGGB 项目长期整机实测积累的工程约定，**生成命令前必读**。
> 大部分陷阱已被 `aiggb check` / `aiggb validate` 静态拦截——但知道为什么才能写对。

## 1. 不存在的命令（臆造黑名单，引擎静默 no-op 或报错）

| 臆造 | 正确替代 |
|---|---|
| `SetVisible(obj, bool)` | `SetVisibleInView(obj, 1, true/false)`（显隐必须带视图号 1）。★ 幻觉根源：JS API 有 `ggbApplet.setVisible(name, bool)` 方法，但 GGB **脚本命令**无 SetVisible——两者勿混 |
| `El(list, n)` | `Element(list, n)` |
| `Round(x, n)`（大写） | `round(x, n)`（小写函数）。⚠ 版本差异：**现行官方手册已收录大写 `Round(x)/Round(x,n)` 命令**，仅自托管 5.4.927 bundle 未编译——若对接更新版 GGB 需放开此规则 |
| `mod(x, y)`（小写） | `Mod(x, y)`（大写命令，可嵌套进表达式）。5.4.927 实测；网络资料称新版可用小写，对接新版时复核 |
| `CumulativeSum` | 5.4.927 实测没有；用 `Sequence` + `Sum` 组合。⚠ 现行官方手册已有 `CumulativeSum(list)`/`CumulativeSum(list, bool)`——版本差异 |
| `ELEMENT` / `ZIP`（全大写） | 命令名大小写敏感，必须 `Element` / `Zip` |
| `VisibleInView` / `GetVisibleInView` / `IsVisibleInView` | 查询显隐无命令形态，读对象属性代替 |
| `xAxis = Line((0,0),(1,0))` | 坐标轴画布自带，**不需要也无法创建**（官方确认 xAxis/yAxis/zAxis/xOyPlane 是特殊对象名） |

完整映射：`aiggb hallucinations` 或生成的 commands-*.md 文末。

## 2. 保留对象名（赋值名禁用）

- `If`（内置条件命令）、`xAxis`/`yAxis`/`zAxis`（自带轴）、`x`/`y`/`z`（坐标变量）、`e`（欧拉数，赋值后 `3e8` 会被拆成 3×e×8）。
- 命名推断惯例：**`A~Z` 单大写 = Point**、**`u`/`v`/`w` = Vector**、**`f`/`g`/`h` = Function**、小写字母 = 数值/变量。`(x,y)` 坐标字面量赋给变量会被推断为 Point。

## 3. 语法陷阱

- **双等号必失败**：命名等式/圆锥曲线用**冒号**——`ell: x^2/9+y^2/4=1`。
- **科学计数法**：`evalCommand` 不认 `3e8`（解析成 3×e×8）。写 `3 * 10^(8)`。
- **除零**：分母加 `+0.001`（如 `v/(t+0.001)`）。
- **Point+Point 相加崩溃**：向量运算先定义 `v = Vector(A,B)`。
- **Set\* 是语句不是表达式**：不能嵌进 `Sequence`/`Zip`/`If`。批量显隐逐条发命令。
- **Conic 六系数顺序（官方手册易误读，2026-11 联网复核确认一致）**：`Conic(a, b, c, d, e, f)` 按位置代入 **a·x² + b·y² + c·(常数) + d·xy + e·x + f·y = 0**。官方手册写作「a·x²+d·xy+b·y²+e·x+f·y=−c」（把常数移到右边），位置顺序完全相同；官方示例 `Conic(2, 3, -1, 4, 2, -3)` → `2x²+4xy+3y²+2x−3y=1` 可直接验证。椭圆 `x²/9+y²/4=1` → `Conic(1/9, 1/4, -1, 0, 0, 0)`。7 系数可能「返回 true 却画出 emptyset」（空转型陷阱），用 `Defined(obj)` 自查。
- **Sequence 五重载**：`Sequence(n)`｜`Sequence(k,n)`｜`Sequence(k,n,inc)`｜`Sequence(expr,k,a,b)`｜`Sequence(expr,k,a,b,step)`。循环变量必须**单个 ASCII 字母**，start/end/step 必须是三个独立参数。

## 3.5 对象级联与命名陷阱（2026-11 物理场景回归实测新增）

- **★ 元组赋值的类型由名字首字母大小写决定（本节最重要规则）**：`name = (x, y)` 及一切点表达式赋值——**首字母大写 → Point，首字母小写 → Vector**（显式命令类型优先，如 `f = Vector(A,B)` 显式为 vector）。实测铁证：`p1=(5,1)`、`qa=(0,0)` 小写开头 → vector；`A9=(0,0)`、`Qa` 大写开头 → point；**驼峰名 `dTip=P+(v/5,0)` 首字母小写 → vector**（draw 端到端实测，导致 `Vector(P, dTip)` 三连失败）。**推论**：受力箭头端点、多边形顶点等"点表达式"变量必须用**首字母大写**的名字（`Ftip`、`PL`），驼峰 `dTip` 也不行；小写名得到 vector 后 `Polygon(小写名,…)` / `Vector(大写点, 小写名)` 都会失败。AGENTS 旧表述「(x,y) 赋变量=Point」不完整，仅对首字母大写成立。
- **Polygon/多边形内联字面量的顶点与边会被自动命名**：`Polygon((0,0),(6,0),(0,3))` 的顶点与边自动占用 `f`/`g`/`h` 等小写名——若后续命令再 `f = Vector(...)` 显式赋值，会**重定义顶点 f，导致整个 polygon 连同顶点级联消失**（evalCommand 全程返回 true，静默失败）。规避：**先 Point（大写名）再 Polygon**（`A1=(0,0); B1=(6,0); C1=(0,3); Polygon(A1,B1,C1)`）——「先 Point 再引用」铁律同样适用于多边形顶点。
- **`rad` 是保留字**：GGB 弧度单位关键字。`rad = Segment(O,P)` evalCommand 返回 true，但对象被引擎**静默改名**（如 eq1）——下游按 `rad` 引用全部断链。类似地，单位关键字（rad/deg 等）勿作对象名。
- **坐标访问只能 `x(P)` / `y(P)`**：`P_x` / `W_x` 形态在经典输入中**不存在**（引擎直接拒绝该命令）。2026-11 draw 端到端实测 AI 输出 `xL=P_x-0.4` 被拒——已列入静态警告。分量运算一律写 `xL = x(P) - 0.4`、`y(P)`。
- **`Vector(Point, Vector)` 二参重载不可用**（5.4.927 实测返回 false）——位移箭头一律写 `Vector(P, P + (dx, dy))`，其中端点变量用大写名。`x(vector)`/`y(vector)` 取分量可用。

## 4. 属性命令值域（引擎按 0~1 解析，方向别记反）

- `SetColor(obj, r, g, b)`：r/g/b 是 **0~1 浮点**（`(0.9,0.2,0.2)` ✔；`(230,50,50)` 会被钳成全白）。
- `SetLineOpacity` / `SetFilling`：**0~1 小数**。
- 颜色名只能英文且带引号：`SetColor(a, "red")`；中文色名/裸标识符必失败。
- 颜色字段在协议 JSON 里用 `#RRGGBB`。

## 5. 3D 模式禁令（纯 3D applet 中执行必失败）

| 禁用 | 替代 |
|---|---|
| `SetViewDirection` | 鼠标旋转视角 |
| `SetFilling` | style op 的 `opacity` 字段 |
| `SetPointSize` | `Sphere(P, 0.2)` 标记点 |
| `SetCaption` / `ShowLabel` / `SetLabelMode` | `Text("<文字>", 点)` |
| `Rename` | 创建时直接命名 |
| `ZoomIn` / `SetAxesRatio` | view op / 用户手动 |

3D 专用：点用 `(x,y,z)` 三维坐标；**正方体优先 `Cube(A,B)` 两点式**（三点式必须精确构成正方形，否则只画点不出体）；截面用 `IntersectPath(plane, poly)`。
**★ Cube(A,B) 的自动顶点不可重定义**（2026-11 3D 出图实测）：两点式会自动生成顶点 C（自由，可重定义）与 D（**依赖顶点，重定义必被拒绝**）及 A1/B1/C1/D1。需要自己的角点时用不冲突的名字（如 `Dc`），或先建顶点再 `Cube(A,B,C)`。渲染 3D 场景必须 `render --mode 3d`（漏了会注入 classic applet，立体被投影成平面）。

## 6. 可靠性注意（脚本/自动化场景）

- `evalCommand` 对 `Set*`/`Show*`/`ZoomIn` 等**不产生新对象**的命令**即使成功也返回 false**——返回值只对「产生输出对象」的命令可靠。
- `exists()` 对函数对象（`f1(x)=...`）返回 false，删除前判断用 `getAllObjectNames` 兜底。
- `Delete` 的返回值无法区分成败（存在与否都返回 false）。

## 7. 可用列表函数（5.4.927 实测）

`Zip`（1~3 变量）/`Flatten`/`Element`/`KeepIf`/`Take`/`First`/`Join`/`Unique`/`Sort`/`Sum` 均可用；`IterationList`、`RemoveUndefined` 亦可用。分形/离散构造优先「静态展开」思路（列表代数无法每代重写）。
