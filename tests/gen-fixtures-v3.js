import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, "fixtures");

const fixtures = {
  "A-stop-animation": {
    explanation: "使用 SetAnimating 控制动画或 StartAnimation 启停，不输出停用命令",
    commands: [
      { op: "animate", target: "t", on: false }
    ]
  },
  "A-export-gif": {
    explanation: "需要确认导出格式",
    commands: [],
    ask: "AiGGB 目前支持导出 .ggb 文件和 PNG 截图，不支持 GIF 导出。是否需要导出为这两种格式之一？"
  },
  "A-opacity-trap": {
    explanation: "使用 SetLineOpacity 设置透明度",
    commands: [
      { op: "eval", cmd: "SetLineOpacity(P, 0.5)" }
    ]
  },
  "E-edge-very-fast": {
    explanation: "高速斜抛：x=v0cosθ·t y=v0sinθ·t-½gt²，v0=1000 θ=80°(~1.396rad)",
    commands: [
      { op: "constants", names: ["g"] },
      { op: "slider", name: "v0", min: 100, max: 2000, step: 10, value: 1000, unit: "m/s", label: "初速" },
      { op: "slider", name: "theta", min: 0, max: 1.5708, step: 0.01, value: 1.396, unit: "rad", label: "仰角" },
      { op: "slider", name: "t", min: 0, max: 200, step: 0.1, value: 0, unit: "s", label: "时间" },
      { op: "eval", cmd: "P = (v0*cos(theta)*t, v0*sin(theta)*t - 0.5*g*t^2)" },
      { op: "physicsTrace", target: "P", mode: "trail" },
      { op: "unitAxes", xUnit: "m", yUnit: "m" },
      { op: "view", xmin: -2000, xmax: 22000, ymin: -1000, ymax: 5000 },
      { op: "animate", target: "t", speed: 2, on: true, repeat: "increasing" }
    ]
  },
  "E-edge-empty": {
    explanation: "输入过于模糊，需要确认具体需求",
    commands: [],
    ask: "请问你想画什么类型的图形？例如：几何构造（点/线/圆）、函数图像、物理模拟？如果能描述得更具体一些就更好了。"
  },
  "E-edge-negative": {
    explanation: "半径取绝对值创建圆，滑块允许负值可调",
    commands: [
      { op: "slider", name: "r", min: -3, max: 3, step: 0.1, value: -2, unit: "", label: "半径" },
      { op: "eval", cmd: "O = (0, 0)" },
      { op: "eval", cmd: "c = Circle(O, abs(r))" },
      { op: "style", target: "c", color: "#1e88e5", thickness: 2 }
    ]
  },
  "X-composite-pendulums": {
    explanation: "两个单摆：L1=1m L2=0.5m，独立滑块控制",
    commands: [
      { op: "constants", names: ["g"] },
      { op: "slider", name: "L1", min: 0.1, max: 2, step: 0.05, value: 1, unit: "m", label: "摆长1" },
      { op: "slider", name: "L2", min: 0.1, max: 2, step: 0.05, value: 0.5, unit: "m", label: "摆长2" },
      { op: "slider", name: "theta0", min: 0, max: 0.6, step: 0.01, value: 0.4, unit: "rad", label: "初角" },
      { op: "slider", name: "t", min: 0, max: 10, step: 0.02, value: 0, unit: "s", label: "时间" },
      { op: "eval", cmd: "omega1 = sqrt(g/L1)" },
      { op: "eval", cmd: "omega2 = sqrt(g/L2)" },
      { op: "eval", cmd: "theta1 = theta0*cos(omega1*t)" },
      { op: "eval", cmd: "theta2 = theta0*cos(omega2*t)" },
      { op: "eval", cmd: "O1 = (0, 0)" },
      { op: "eval", cmd: "M1 = (L1*sin(theta1), -L1*cos(theta1))" },
      { op: "eval", cmd: "O2 = (1.5, 0)" },
      { op: "eval", cmd: "M2 = (1.5 + L2*sin(theta2), -L2*cos(theta2))" },
      { op: "physicsTrace", target: "M1", mode: "trail" },
      { op: "physicsTrace", target: "M2", mode: "trail" },
      { op: "style", target: "M1", color: "#e53935" },
      { op: "style", target: "M2", color: "#1e88e5" },
      { op: "view", xmin: -1, xmax: 3, ymin: -2, ymax: 0.5 },
      { op: "animate", target: "t", speed: 1, on: true, repeat: "increasing" }
    ]
  },
  "X-composite-compare": {
    explanation: "两角度斜抛对比：红色30°绿色60°，v0=20",
    commands: [
      { op: "constants", names: ["g"] },
      { op: "slider", name: "v0", min: 1, max: 50, step: 1, value: 20, unit: "m/s", label: "初速" },
      { op: "slider", name: "t", min: 0, max: 5, step: 0.02, value: 0, unit: "s", label: "时间" },
      { op: "eval", cmd: "theta1 = pi/6" },
      { op: "eval", cmd: "theta2 = pi/3" },
      { op: "eval", cmd: "P1 = (v0*cos(theta1)*t, v0*sin(theta1)*t - 0.5*g*t^2)" },
      { op: "eval", cmd: "P2 = (v0*cos(theta2)*t, v0*sin(theta2)*t - 0.5*g*t^2)" },
      { op: "physicsTrace", target: "P1", mode: "trail" },
      { op: "physicsTrace", target: "P2", mode: "trail" },
      { op: "style", target: "P1", color: "#e53935" },
      { op: "style", target: "P2", color: "#43a047" },
      { op: "unitAxes", xUnit: "m", yUnit: "m" },
      { op: "view", xmin: -2, xmax: 50, ymin: -2, ymax: 15 },
      { op: "animate", target: "t", speed: 0.5, on: true, repeat: "increasing" }
    ]
  },
  "X-field-particle": {
    explanation: "磁场中带电粒子圆周运动 ω=qB/m",
    commands: [
      { op: "slider", name: "B", min: 0.1, max: 2, step: 0.1, value: 1, unit: "T", label: "磁感应强度" },
      { op: "slider", name: "qm", min: 0.5, max: 5, step: 0.1, value: 2, unit: "C/kg", label: "荷质比" },
      { op: "slider", name: "t", min: 0, max: 10, step: 0.02, value: 0, unit: "s", label: "时间" },
      { op: "eval", cmd: "omega = qm*B" },
      { op: "eval", cmd: "O = (0, 0)" },
      { op: "eval", cmd: "P = (cos(omega*t), sin(omega*t))" },
      { op: "physicsTrace", target: "P", mode: "trail" },
      { op: "style", target: "P", color: "#e53935" },
      { op: "view", xmin: -2, xmax: 2, ymin: -2, ymax: 2 },
      { op: "animate", target: "t", speed: 1, on: true, repeat: "increasing" }
    ]
  },
  "L-casual-chinese": {
    explanation: "斜抛运动：x=v0cosθt, y=v0sinθt-½gt²",
    commands: [
      { op: "constants", names: ["g"] },
      { op: "slider", name: "v0", min: 1, max: 50, step: 1, value: 20, unit: "m/s", label: "初速" },
      { op: "slider", name: "theta", min: 0, max: 1.5708, step: 0.01, value: 0.785, unit: "rad", label: "仰角" },
      { op: "slider", name: "t", min: 0, max: 5, step: 0.02, value: 0, unit: "s", label: "时间" },
      { op: "eval", cmd: "P = (v0*cos(theta)*t, v0*sin(theta)*t - 0.5*g*t^2)" },
      { op: "physicsTrace", target: "P", mode: "trail" },
      { op: "unitAxes", xUnit: "m", yUnit: "m" },
      { op: "view", xmin: -2, xmax: 50, ymin: -2, ymax: 20 },
      { op: "animate", target: "t", speed: 0.5, on: true, repeat: "increasing" }
    ]
  },
  "L-homework-style": {
    explanation: "3-4-5直角三角形ABC，标注边长",
    commands: [
      { op: "eval", cmd: "A = (0, 0)" },
      { op: "eval", cmd: "B = (4, 0)" },
      { op: "eval", cmd: "C = (0, 3)" },
      { op: "eval", cmd: "tri = Polygon(A, B, C)" },
      { op: "eval", cmd: "AB = Segment(A, B)" },
      { op: "eval", cmd: "BC = Segment(B, C)" },
      { op: "eval", cmd: "CA = Segment(C, A)" },
      { op: "style", target: "tri", color: "#1e88e5" },
      { op: "caption", target: "AB", text: "4" },
      { op: "caption", target: "CA", text: "3" },
      { op: "caption", target: "BC", text: "5" },
      { op: "view", xmin: -1, xmax: 5, ymin: -1, ymax: 4 }
    ]
  },
  "L-mixed-lang": {
    explanation: "正弦函数 y=A·sin(ωx)，amplitude=2 frequency=3",
    commands: [
      { op: "slider", name: "amp", min: 0.5, max: 5, step: 0.1, value: 2, unit: "", label: "振幅" },
      { op: "slider", name: "freq", min: 0.5, max: 5, step: 0.1, value: 3, unit: "", label: "频率" },
      { op: "eval", cmd: "f(x) = amp*sin(freq*x)" },
      { op: "style", target: "f", color: "#1e88e5", thickness: 2 },
      { op: "view", xmin: -6.2832, xmax: 6.2832, ymin: -5.5, ymax: 5.5 }
    ]
  },
  "N-very-small": {
    explanation: "r=0.001 微小圆，视窗需缩小才能看见",
    commands: [
      { op: "eval", cmd: "O = (0, 0)" },
      { op: "eval", cmd: "c = Circle(O, 0.001)" },
      { op: "style", target: "c", color: "#e53935", thickness: 3 },
      { op: "view", xmin: -0.01, xmax: 0.01, ymin: -0.01, ymax: 0.01 }
    ]
  },
  "N-zero-value": {
    explanation: "振幅滑块 min=0 使简谐振动可退化为静止",
    commands: [
      { op: "slider", name: "amp", min: 0, max: 5, step: 0.1, value: 0, unit: "m", label: "振幅" },
      { op: "slider", name: "omega", min: 0.1, max: 5, step: 0.1, value: 1, unit: "rad/s", label: "角频率" },
      { op: "slider", name: "t", min: 0, max: 10, step: 0.02, value: 0, unit: "s", label: "时间" },
      { op: "eval", cmd: "xpos = amp*cos(omega*t)" },
      { op: "eval", cmd: "P = (xpos, 0)" },
      { op: "physicsTrace", target: "P", mode: "trail" },
      { op: "animate", target: "t", speed: 1, on: true, repeat: "increasing" }
    ]
  }
};

for (const [id, fixture] of Object.entries(fixtures)) {
  const p = join(dir, `${id}.json`);
  writeFileSync(p, JSON.stringify(fixture, null, 2) + "\n");
  console.log(`wrote ${id}`);
}
console.log(`\n${Object.keys(fixtures).length} fixtures written`);
