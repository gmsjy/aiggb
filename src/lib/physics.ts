/**
 * 物理域支持 —— 见 SPEC.md §4A
 */

export interface PhysicsConstantDef {
  value: number;
  unit: string;
  desc: string;
}

export const PHYSICS_CONSTANTS: Record<string, PhysicsConstantDef> = {
  g: { value: 9.8, unit: "m/s²", desc: "重力加速度" },
  c: { value: 3e8, unit: "m/s", desc: "真空光速" },
  Grav: { value: 6.67430e-11, unit: "N·m²/kg²", desc: "万有引力常量" },
  e: { value: 1.6e-19, unit: "C", desc: "元电荷" },
  eps0: { value: 8.854e-12, unit: "F/m", desc: "真空介电常数" },
  mu0: { value: 1.2566e-6, unit: "H/m", desc: "真空磁导率" },
  k_e: { value: 8.99e9, unit: "N·m²/C²", desc: "库仑常量" },
  h: { value: 6.626e-34, unit: "J·s", desc: "普朗克常量" },
  k_B: { value: 1.381e-23, unit: "J/K", desc: "玻尔兹曼常量" }
};
