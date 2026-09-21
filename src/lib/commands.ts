/**
 * GGB 命令知识数据：硬黑名单 + 5 阶段流程文本。
 * 命令签名/适用模式的权威数据在 ggbKB.ts（buildCommandReference 注入 prompt）。
 */

/**
 * 已知在 GeoGebra 中不存在的命令（硬黑名单）。
 * 消费方：schema.ts 对 eval cmd 做静态硬校验（命中即拒绝，进入格式修复循环）；
 * toolExecutor 做同规则的二次拦截。
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

export const GGB_5STAGE_FLOW = `
5阶段流程：①滑块→②Point声明→③线/圆(引用Point)→④动画/轨迹→⑤属性(SetLineOpacity等)
铁律：动态线段必须先 Point 再 Segment(A,B)，禁止 Segment((x,y),(x,y))。
3D铁律：
①所有点用 (x,y,z) 三维坐标
②★ 正方体优先用 Cube(A,B) 两点形式：A、B 为底面一条棱的相邻顶点，第三个顶点自动生成，正方体可绕 AB 边旋转。避免 Cube(A,B,C)——三点必须精确构成正方形否则只画点不出体。需要固定朝向时才用 Cube(A,B,C) 并确保三点构成正方形。
③IntersectPath(plane,poly) 得截面
④SetViewDirection 在纯 3D applet 中不可用，禁止生成
⑤SetColor obj,r,g,b 中 r/g/b 是 0~1 浮点（如 SetColor(c, 0.9, 0.2, 0.2)）；写 0~255 整数会被引擎 ×255 钳成白色（5.4.927 实测 + 官方手册）
⑥SetFilling 在 3D 中对 Sphere/Cube 等立体无效——用 style op 的 opacity 字段替代
⑦SetAxesRatio 在 3D 中不可靠——如需等比例坐标轴用 view op 替代（见 3D 模式规则）
`;
