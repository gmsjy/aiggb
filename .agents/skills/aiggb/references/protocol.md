# AI → GeoGebra 命令协议（14 op）

> 本协议是 AiGGB 项目的 AI 输出契约，schema 校验（zod）+ 静态预检都以此为基准。
> 用 `aiggb validate` 校验的 JSON 必须符合本文件。

## 顶层结构（AIResponse）

```json
{
  "explanation": "一句话说明本次绘图内容（≤500 字符，必填）",
  "commands": [ { "op": "...", ... }, ... ],
  "ask": "需要用户澄清时的反问（可选；有 ask 时 commands 必须为空数组）",
  "self_check": "自检报告纯文本（可选；逐项核对白名单/3D 禁用/Point+Vector/除零/参数个数）"
}
```

- `commands` 最多 64 条。
- 每条命令一个 JSON 对象，按 `op` 区分（见下）。
- 数值字段（min/max/step/value/xmin…）接受数字或数字字符串（`"3.14"`）。
- 颜色一律 `#RRGGBB` 形式（如 `"#CC2222"`）。

## 5 阶段构造流程（命令排序原则）

```
①滑块/参数 → ②Point 声明 → ③线/圆/函数（引用 Point）→ ④动画/轨迹 → ⑤属性样式
```

**铁律**：动态线段必须先 `A = (x,y)` 再 `Segment(A,B)`，禁止 `Segment((x,y),(x,y))`——坐标字面量连的点不会随滑块动。

## 14 个 op

| # | op | 字段 | 用途 |
|---|---|---|---|
| 1 | `eval` | `cmd: string` | 任意合法 GGB 命令（构造/函数/属性命令都走它，最常用） |
| 2 | `slider` | `name, min, max, step(>0), value∈[min,max], unit?(≤8), label?(≤40)` | 创建滑块（物理量标注） |
| 3 | `animate` | `target, speed?, on: bool, repeat?: "oscillating"\|"increasing"\|"once"` | 开/关滑块动画 |
| 4 | `trace` | `target, on: bool` | 轨迹开关 |
| 5 | `style` | `target, color?, thickness?(1–13), visible?, opacity?(0–1), dashed?, pointSize?(1–9), pointStyle?(-1~9)` | 批量样式（opacity 0~1 小数） |
| 6 | `view` | `xmin<xmax, ymin<ymax, axesUnit?: [x, y]` | 视窗范围 + 轴单位 |
| 7 | `caption` | `target, text(≤120)` | 对象标注 |
| 8 | `delete` | `target` | 删除对象 |
| 9 | `reset` | （无字段） | 清空画布 |
| 10 | `vector` | `name, from: "(x,y)", to: "(x,y)", color?, label?` | 物理矢量箭头（from/to 是坐标字面量字符串） |
| 11 | `forceDiagram` | `at: "(x,y)", forces: [{name, vec: "(dx,dy)", color?, label?}]（1–8 个）` | 受力图基元；vec 必须是 `(dx, dy)` 字面量，不引用未声明对象 |
| 12 | `physicsTrace` | `target, mode: "trail"\|"stroboscopic", fade?` | 物理轨迹（拖尾/频闪） |
| 13 | `unitAxes` | `xUnit(≤8), yUnit(≤8), xLabel?(≤20), yLabel?(≤20)` | 带单位坐标轴 |
| 14 | `constants` | `names: string[1–8]` | 注入物理常量（白名单：`g c Grav e eps0 mu0 k_e h k_B`） |

## eval 命令书写规则（引擎实测，静态预检强制）

1. **命名等式用冒号**：`ell: x^2/9 + y^2/4 = 1`。`name = expr = value` 双等号形态引擎必失败。
2. **赋值形态只能有一个顶层等号**：`f(x) = x^2` ✔；`v0 = 20` ✔。
3. **分母防除零**：`x/(t + 0.001)`。
4. **Point+Point 不可相加**：先定义 Point 对象再运算。
5. **每条 eval 一条命令**（不要在一个 cmd 里堆多行；换行分隔仅在 eval_raw 场景有效）。
6. **科学计数法禁用**：`3e8` 会被解析成 3×e×8，写 `3 * 10^(8)`。

## 自检（self_check）核对清单

compile 输出应附自检报告，逐项核对：

- [ ] 所有命令在知识库白名单内（`aiggb list` 可查）
- [ ] 3D 模式未用 3D 禁令命令（见 traps.md）
- [ ] 动态构造遵循「先 Point 再引用」
- [ ] 无 Point+Point、无除零风险
- [ ] 属性命令参数个数正确、SetColor 值域 0~1
