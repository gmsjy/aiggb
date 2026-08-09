// 生成新用例的离线回放 fixtures —— 每个 fixture 是经过验证的正确 AIResponse JSON
// Usage: node tests/gen-fixtures.js

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, "fixtures");

const fixtures = {
  "S-polygon": {
    explanation: "构造三角形 ABC",
    commands: [
      { op: "eval", cmd: "A = (0, 0)" },
      { op: "eval", cmd: "B = (4, 0)" },
      { op: "eval", cmd: "C = (2, 3)" },
      { op: "eval", cmd: "tri = Polygon(A, B, C)" },
      { op: "style", target: "tri", color: "#1e88e5", thickness: 2 }
    ]
  },
  "S-ellipse": {
    explanation: "以 (0,1)(0,-1) 为焦点、过 (2,0) 的椭圆",
    commands: [
      { op: "eval", cmd: "F1 = (0, 1)" },
      { op: "eval", cmd: "F2 = (0, -1)" },
      { op: "eval", cmd: "P = (2, 0)" },
      { op: "eval", cmd: "ell = Ellipse(F1, F2, P)" },
      { op: "style", target: "ell", color: "#1e88e5", thickness: 2 }
    ]
  },
  "D-rotation": {
    explanation: "点绕 O(0,0) 匀速旋转，角速度 omega 可调",
    commands: [
      { op: "slider", name: "omega", min: 0.1, max: 5, step: 0.1, value: 1, unit: "rad/s", label: "角速度" },
      { op: "slider", name: "t", min: 0, max: 10, step: 0.02, value: 0, unit: "s", label: "时间" },
      { op: "eval", cmd: "O = (0, 0)" },
      { op: "eval", cmd: "P = (2*cos(omega*t), 2*sin(omega*t))" },
      { op: "physicsTrace", target: "P", mode: "trail" },
      { op: "animate", target: "t", speed: 1, on: true, repeat: "increasing" }
    ]
  },
  "D-locus": {
    explanation: "圆上点 P 随 t 运动，用 Locus 画轨迹",
    commands: [
      { op: "slider", name: "t", min: 0, max: 6.2832, step: 0.02, value: 0, unit: "rad", label: "角度" },
      { op: "eval", cmd: "O = (0, 0)" },
      { op: "eval", cmd: "c = Circle(O, 2)" },
      { op: "eval", cmd: "P = (2*cos(t), 2*sin(t))" },
      { op: "eval", cmd: "trail = Locus(P, t)" },
      { op: "style", target: "trail", color: "#e53935" },
      { op: "animate", target: "t", speed: 1, on: true, repeat: "increasing" }
    ]
  },
  "D-param-curve": {
    explanation: "x=cos(3t) y=sin(2t) 参数曲线",
    commands: [
      { op: "slider", name: "tMax", min: 0, max: 6.2832, step: 0.02, value: 6.2832, unit: "rad", label: "t上限" },
      { op: "eval", cmd: "c = Curve(cos(3*t), sin(2*t), t, 0, tMax)" },
      { op: "style", target: "c", color: "#1e88e5", thickness: 2 }
    ]
  },
  "P-spring": {
    explanation: "弹簧振子 x=A*cos(omega*t), omega=sqrt(k/m)",
    commands: [
      { op: "slider", name: "k", min: 1, max: 50, step: 1, value: 10, unit: "N/m", label: "劲度" },
      { op: "slider", name: "m", min: 0.1, max: 5, step: 0.1, value: 1, unit: "kg", label: "质量" },
      { op: "slider", name: "t", min: 0, max: 10, step: 0.02, value: 0, unit: "s", label: "时间" },
      { op: "eval", cmd: "amp = 1" },
      { op: "eval", cmd: "omega = sqrt(k / m)" },
      { op: "eval", cmd: "xpos = amp*cos(omega*t)" },
      { op: "eval", cmd: "P = (xpos, 0)" },
      { op: "physicsTrace", target: "P", mode: "trail" },
      { op: "style", target: "P", color: "#e53935" },
      { op: "unitAxes", xUnit: "m", yUnit: "m" },
      { op: "view", xmin: -2, xmax: 2, ymin: -2, ymax: 2 },
      { op: "animate", target: "t", speed: 1, on: true, repeat: "oscillating" }
    ]
  },
  "P-wave": {
    explanation: "行波 y=A*sin(kw*x-omega*t)，kw避免与GGB冲突",
    commands: [
      { op: "slider", name: "A", min: 0.1, max: 2, step: 0.1, value: 1, unit: "m", label: "振幅" },
      { op: "slider", name: "kw", min: 0.5, max: 5, step: 0.1, value: 1.5, unit: "rad/m", label: "波数" },
      { op: "slider", name: "omega", min: 0.5, max: 5, step: 0.1, value: 2, unit: "rad/s", label: "角频率" },
      { op: "slider", name: "t", min: 0, max: 10, step: 0.02, value: 0, unit: "s", label: "时间" },
      { op: "eval", cmd: "f(x) = A*sin(kw*x - omega*t)" },
      { op: "style", target: "f", color: "#1e88e5", thickness: 2 },
      { op: "unitAxes", xUnit: "m", yUnit: "m" },
      { op: "view", xmin: 0, xmax: 10, ymin: -2.5, ymax: 2.5 },
      { op: "animate", target: "t", speed: 1, on: true, repeat: "increasing" }
    ]
  },
  "M-add-point": {
    explanation: "在线段 AB 上添加中点 M",
    commands: [
      { op: "eval", cmd: "M = Midpoint(A, B)" },
      { op: "caption", target: "M", text: "中点 M" },
      { op: "style", target: "M", color: "#e53935" }
    ]
  },
  "M-change-speed": {
    explanation: "将 t 的动画速度改为原来的 2 倍",
    commands: [{ op: "animate", target: "t", speed: 2, on: true }]
  },
  "M-delete-object": {
    explanation: "删除辅助点 P",
    commands: [{ op: "delete", target: "P" }]
  },
  "F-ambiguous-speed": {
    explanation: "需要确认运动参数",
    commands: [],
    ask: "请问点的运动轨迹是什么形状（圆/直线/抛物线）？速度大小是多少？"
  },
  "F-ambiguous-function": {
    explanation: "需要确认函数表达式",
    commands: [],
    ask: "请问你想画哪个函数的图像？例如 y=sin(x) 或 y=x^2+1？"
  },
  "E-regression-denominator-zero": {
    explanation: "点电荷电场分量，分母+0.001防除零",
    commands: [
      { op: "slider", name: "q", min: 0.5, max: 5, step: 0.5, value: 1, unit: "C", label: "电荷" },
      { op: "eval", cmd: "A = (0, 0)" },
      { op: "eval", cmd: "Ex(x,y) = q*(x-x(A))/((x-x(A))^2+(y-y(A))^2+0.001)^1.5" },
      { op: "eval", cmd: "Ey(x,y) = q*(y-y(A))/((x-x(A))^2+(y-y(A))^2+0.001)^1.5" }
    ]
  },
  "E-regression-naming-v": {
    explanation: "速度标量用 speed 命名，避免 v 被 GGB 当 Vector",
    commands: [
      { op: "slider", name: "speed", min: 1, max: 20, step: 0.5, value: 5, unit: "m/s", label: "速率" },
      { op: "slider", name: "t", min: 0, max: 10, step: 0.02, value: 0, unit: "s", label: "时间" },
      { op: "eval", cmd: "P = (speed*t, 0)" },
      { op: "physicsTrace", target: "P", mode: "trail" },
      { op: "animate", target: "t", speed: 1, on: true, repeat: "increasing" }
    ]
  },
  "E-regression-naming-A": {
    explanation: "振幅用 amp 命名，避免大写 A 被 GGB 当 Point",
    commands: [
      { op: "slider", name: "amp", min: 0.1, max: 5, step: 0.1, value: 2, unit: "m", label: "振幅" },
      { op: "slider", name: "omega", min: 0.1, max: 5, step: 0.1, value: 1, unit: "rad/s", label: "角频率" },
      { op: "slider", name: "t", min: 0, max: 10, step: 0.02, value: 0, unit: "s", label: "时间" },
      { op: "eval", cmd: "xpos = amp*cos(omega*t)" },
      { op: "eval", cmd: "P = (xpos, 0)" }
    ]
  },
  "E-regression-code-fence": {
    explanation: "函数 y=x^2",
    commands: [
      { op: "eval", cmd: "f(x) = x^2" },
      { op: "style", target: "f", color: "#1e88e5", thickness: 2 }
    ]
  },
  "E-regression-anonymous-segment": {
    explanation: "先声明端点再构造线段",
    commands: [
      { op: "eval", cmd: "O = (0, 0)" },
      { op: "eval", cmd: "P = (3, 4)" },
      { op: "eval", cmd: "s = Segment(O, P)" },
      { op: "style", target: "s", color: "#1e88e5", thickness: 2 }
    ]
  },
  "B-3d-surface": {
    explanation: "参数曲面 z=x^2+y^2",
    commands: [
      { op: "eval", cmd: "surf = Surface(u, v, u^2+v^2, u, -2, 2, v, -2, 2)" }
    ]
  },
  "B-nested-sequence": {
    explanation: "5x5 点阵，嵌套 Sequence",
    commands: [
      { op: "eval", cmd: "pts = Sequence(Sequence((i, j), i, -2, 2, 1), j, -2, 2, 1)" }
    ]
  },
  "C-multi-modify": {
    explanation: "将线段 s 改为蓝色，透明度 0.3",
    commands: [
      { op: "style", target: "s", color: "#1e88e5", thickness: 2 },
      { op: "eval", cmd: "SetLineOpacity(s, 0.3)" }
    ]
  }
};

for (const [id, fixture] of Object.entries(fixtures)) {
  const p = join(dir, `${id}.json`);
  writeFileSync(p, JSON.stringify(fixture, null, 2) + "\n");
  console.log(`✓ ${id}`);
}
console.log(`\n${Object.keys(fixtures).length} fixtures written`);
