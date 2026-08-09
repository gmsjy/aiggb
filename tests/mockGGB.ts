/**
 * 轻量 GeoGebra Mock —— 实现 GGBAppletApi 子集供测试使用
 *
 * 不渲染图形，仅做：
 *   - 对象注册表（按命名约定推断类型：Point/Vector/Number/Function）
 *   - 简单依赖检查（被引用对象必须存在）
 *   - Vector(A, B) / Point + Vector 等类型规则
 *   - SetColor/SetTrace 等属性 op 仅做注册
 *
 * 目标是覆盖 ~70% 的 GGB 执行失败，无需 Puppeteer。
 */
import type { GGBAppletApi } from "../../src/types/ggb";

type GGBType = "Point" | "Vector" | "Number" | "Function" | "Segment" | "Line" | "Circle" | "List" | "Other";

interface GGBObject {
  name: string;
  type: GGBType;
  expr?: string;
}

export class MockGGB implements Pick<GGBAppletApi,
  "evalCommand" | "exists" | "setVisible" | "setColor" | "setLineThickness" | "setLineStyle"
  | "setFilling" | "setCaption" | "setLabelStyle" | "setLabelVisible" | "setCoordSystem"
  | "setAxisLabels" | "setAnimating" | "setAnimationSpeed" | "startAnimation" | "stopAnimation"
  | "setTrace" | "deleteObject" | "reset" | "newConstruction" | "getAllObjectNames"
> {
  private objects = new Map<string, GGBObject>();
  errors: string[] = [];

  // —— 主入口 ——
  evalCommand(cmd: string): boolean {
    const c = cmd.trim();
    if (!c) return true;
    try {
      // 多条命令以 ; 或换行分隔
      for (const single of c.split(/[;\n]/).map(s => s.trim()).filter(Boolean)) {
        if (!this.execSingle(single)) return false;
      }
      return true;
    } catch (e) {
      this.errors.push(`exec ${cmd}: ${e instanceof Error ? e.message : e}`);
      return false;
    }
  }

  private execSingle(cmd: string): boolean {
    // SetValue(name, val) / SetXxx(...) 形式
    const setCmdM = /^Set\w+\s*\(/i.exec(cmd);
    if (setCmdM) return true; // 属性命令一律放行（已在 bridge 层做过参数校验）

    // name = expr
    const assignM = /^(\w[\w_]*)\s*\(?([^)=]*)\)?\s*=\s*(.+)$/.exec(cmd);
    if (assignM) {
      const name = assignM[1];
      const rhs = assignM[3].trim();
      const type = this.inferType(name, rhs);
      // 检查 rhs 中引用的标识符是否已存在
      const missing = this.findMissingRefs(rhs);
      if (missing.length > 0) {
        this.errors.push(`${cmd}: 引用未定义对象 ${missing.join(", ")}`);
        return false;
      }
      // Point + Point 检测
      if (/\b\w+\s*\+\s*\w+\b/.test(rhs)) {
        const m = /(\w[\w_]*)\s*\+\s*(\w[\w_]*)/.exec(rhs);
        if (m) {
          const a = this.objects.get(m[1]);
          const b = this.objects.get(m[2]);
          if (a?.type === "Point" && b?.type === "Point") {
            this.errors.push(`${cmd}: Point+Point 未定义（${m[1]} 与 ${m[2]} 都是 Point）`);
            return false;
          }
        }
      }
      this.objects.set(name, { name, type, expr: rhs });
      // ★ Cube(A,B[,C]) 在真实 GGB 中会自动生成其余顶点（D/E/F/G/H），
      //   模型引用这些顶点（如 Plane(A,C,F)）是合法行为，mock 需同步注册
      this.registerCubeVertices(name, rhs);
      return true;
    }

    // 纯函数调用如 Polygon(A, B, C) 不赋值——简单忽略
    return true;
  }

  /** 启发式类型推断 */
  private inferType(name: string, rhs: string): GGBType {
    if (/^Vector\(/.test(rhs)) return "Vector";
    if (/^Segment\(/.test(rhs)) return "Segment";
    if (/^Line\(/.test(rhs) || /^Ray\(/.test(rhs)) return "Line";
    if (/^Circle\(|^Ellipse\(|^Conic\(|^Hyperbola\(|^Parabola\(/.test(rhs)) return "Circle";
    if (/^(Sequence|List|Zip)\(/.test(rhs)) return "List";
    if (/^\([^)]+,[^)]+\)$/.test(rhs)) {
      // (x, y) 字面量按 GGB 规则推断
      if (/^[uvw]$/.test(name)) return "Vector";
      if (/^[A-Z]$/.test(name)) return "Point";
      return "Point";
    }
    if (/^[fgh]$/.test(name) && /^[^=]*\bx\b/.test(rhs)) return "Function";
    if (/^[A-Z]$/.test(name)) return "Point";
    if (/^[uvw]$/.test(name)) return "Vector";
    return "Number";
  }

  private findMissingRefs(rhs: string): string[] {
    const tokens = rhs.match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g) ?? [];
    const builtin = new Set([
      "x", "y", "z", "t", "u", "v", "s", "i", "j", "k", "n", "pi", "e", "true", "false",
      "sin", "cos", "tan", "asin", "acos", "atan", "atan2", "sqrt", "exp", "log",
      "abs", "floor", "ceil", "round", "min", "max", "if", "Text",
      // 常用 GGB 命令名
      "Vector", "Point", "Segment", "Line", "Ray", "Circle", "Ellipse", "Parabola",
      "Hyperbola", "Conic", "Polygon", "PolyLine", "Function", "Curve", "Sequence",
      "Element", "Length", "Slider", "Rotate", "Translate", "Reflect", "Dilate",
      "Mirror", "Intersect", "Tangent", "Midpoint", "Center", "Distance", "If",
      "Sum", "Min", "Max", "Mean", "Median", "Cross", "Dot", "Derivative",
      "Integral", "Solve", "NSolve", "Root", "Factor", "Simplify", "Expand",
      "UnitVector", "AngleBisector", "PerpendicularLine", "ParallelLine",
      "Semicircle", "RigidPolygon", "TaylorPolynomial", "IterationList",
      "Zip", "Append", "Join", "First", "Last", "Take", "Sort", "Unique",
      "Flatten", "KeepIf", "RemoveUndefined", "Locus", "SlopeField",
      "ImplicitCurve", "NDerivative", "NIntegral", "Surface", "Sphere",
      "Cube", "Tetrahedron", "Prism", "Pyramid", "Cylinder", "Cone",
      "Net", "Plane", "Volume", "Height", "IntersectPath", "IntersectConic",
      "AreParallel", "ArePerpendicular", "AreCollinear", "IsTangent",
      "Defined", "Execute", "Repeat", "SetViewDirection", "SetSpinSpeed",
      "FractionText", "SurdText", "LaTeX", "Text",
      "g", "c", "eps0", "mu0", "k_e", "h", "k_B"
    ]);
    const missing: string[] = [];
    for (const tok of tokens) {
      if (builtin.has(tok)) continue;
      if (/^\d/.test(tok)) continue;
      if (this.objects.has(tok)) continue;
      // 排除函数定义参数（如 Ex(x,y) = ... 中的 x, y）
      missing.push(tok);
    }
    return [...new Set(missing)];
  }

  // —— GGBAppletApi 实现 ——
  exists = (name: string) => this.objects.has(name);

  setVisible = () => {};
  setColor = () => {};
  setLineThickness = () => {};
  setLineStyle = () => {};
  setFilling = () => {};
  setCaption = () => {};
  setLabelStyle = () => {};
  setLabelVisible = () => {};
  setCoordSystem = () => {};
  setAxisLabels = () => {};
  setAxisUnits = () => {};
  setAnimating = () => {};
  setAnimationSpeed = () => {};
  startAnimation = () => {};
  stopAnimation = () => {};

  setTrace = (label: string) => {
    if (!this.objects.has(label)) {
      this.errors.push(`setTrace: 对象 ${label} 不存在`);
    }
  };

  deleteObject = (label: string) => {
    this.objects.delete(label);
  };

  reset = () => this.objects.clear();
  newConstruction = () => this.objects.clear();

  getAllObjectNames = () => Array.from(this.objects.keys());

  /** Cube(A,B[,C]) 派生顶点注册：两点式注册 C..H，三点式注册 D..H（已给点跳过） */
  private registerCubeVertices(name: string, rhs: string): void {
    const m = /^Cube\s*\(\s*([A-Za-z_]\w*)\s*,\s*([A-Za-z_]\w*)(?:\s*,\s*([A-Za-z_]\w*))?\s*\)/.exec(rhs);
    if (!m) return;
    const given = new Set([m[1], m[2], m[3]].filter(Boolean));
    const derive = m[3] ? ["D", "E", "F", "G", "H"] : ["C", "D", "E", "F", "G", "H"];
    for (const v of derive) {
      if (!given.has(v) && !this.objects.has(v)) {
        this.objects.set(v, { name: v, type: "Point" });
      }
    }
  }

  // 预注入已存在对象（用例 context 用）
  seed(existing: Array<{ name: string; type?: GGBType }>) {
    for (const o of existing) {
      this.objects.set(o.name, { name: o.name, type: o.type ?? "Other" });
    }
  }
}
