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
import type { GGBAppletApi } from "../src/types/ggb";
import { GGB_COMMAND_DEFS, type GGBArgType } from "../src/lib/ggbKB";

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
  | "setRepaintingActive" | "setPointSize" | "setPointStyle"
  | "setOnTheFlyPointCreationActive" | "enableRightClick" | "enableLabelDrags"
  | "enable3D" | "setGridVisible" | "setErrorDialogsActive"
  | "getColor" | "getVisible" | "getLineThickness" | "getLineStyle"
  | "getFilling" | "getPointSize" | "getPointStyle" | "getCaption"
  | "getXcoord" | "getYcoord" | "getZcoord" | "getValue" | "getValueString"
  | "getDefinitionString" | "getCommandString" | "getObjectType" | "isDefined"
> {
  private objects = new Map<string, GGBObject>();
  /** 简单样式存储：对象名 → 部分样式属性 */
  private styles = new Map<string, Record<string, unknown>>();
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

      // ★ 重载类型校验：模型把点/半径/坐标混淆（如 Circle(A, 3) 中 A 是数字）→ 拦截
      //    只对 ggbKB 中声明了 overloads 的命令做类型检查，其余放行。
      const overloadErr = this.validateCommandArgs(rhs);
      if (overloadErr) {
        this.errors.push(`${cmd}: ${overloadErr}`);
        return false;
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
    // ★ Cross/UnitVector 等返回 Vector 的命令（3D 叉乘/单位向量）
    if (/^Cross\(|^UnitVector\(/.test(rhs)) return "Vector";
    if (/^Segment\(/.test(rhs)) return "Segment";
    if (/^Line\(/.test(rhs) || /^Ray\(/.test(rhs)) return "Line";
    if (/^Circle\(|^Ellipse\(|^Conic\(|^Hyperbola\(|^Parabola\(/.test(rhs)) return "Circle";
    if (/^(Sequence|List|Zip)\(/.test(rhs)) return "List";
    // Point + (dx,dy) / Point - (dx,dy) → Point（平移点，如 "Ptip = P + (vx/5, vy/5)"）
    //    真实 GGB 中 Point ± 位移坐标 = Point；必须先于纯坐标判断（P 是已存在的 Point）
    const translateM = /^(\w[\w_]*)\s*([+-])\s*\(.+\)$/.exec(rhs.trim());
    if (translateM && this.objects.get(translateM[1])?.type === "Point") {
      return "Point";
    }
    // Point + Vector对象 / Point - Point → Point（如 "end = O + wVec"）
    const binObjM = /^(\w[\w_]*)\s*([+-])\s*(\w[\w_]*)$/.exec(rhs.trim());
    if (binObjM && this.objects.get(binObjM[1])?.type === "Point") {
      const rightType = this.objects.get(binObjM[3])?.type;
      if (rightType === "Vector" || rightType === "Point") return "Point";
    }
    if (this.isCoordLiteral(rhs)) {
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

  /**
   * 判断是否为坐标字面量：(...) 且最外层含一个顶层逗号，括号平衡。
   * 用括号深度扫描而非 [^)] 正则——正确处理含嵌套括号的坐标
   * （如 "(r*cos(omega*t), r*sin(omega*t))" 内层有 (omega*t)）。
   */
  private isCoordLiteral(rhs: string): boolean {
    const s = rhs.trim();
    if (!s.startsWith("(") || !s.endsWith(")")) return false;
    let depth = 0;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        // 提前闭合（非末尾）或深度为负 → 不是平衡坐标
        if (depth < 0 || (depth === 0 && i !== s.length - 1)) return false;
      } else if (ch === "," && depth === 1) {
        return true; // 顶层逗号 → 坐标字面量
      }
    }
    return false; // 无顶层逗号（如 "(x,y)" 退化 / 单个值）
  }

  private findMissingRefs(rhs: string): string[] {
    const tokens = rhs.match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g) ?? [];
    // ★ Sequence(expr, var, start, end, step) 的循环变量是声明（非引用），须豁免
    const seqVars = this.extractSequenceVars(rhs);
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
      "Semicircle", "CircumcircleArc", "CircumcircleSector", "RigidPolygon", "TaylorPolynomial", "IterationList",
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
      if (seqVars.has(tok)) continue; // Sequence 循环变量豁免
      if (/^\d/.test(tok)) continue;
      if (this.objects.has(tok)) continue;
      // 排除函数定义参数（如 Ex(x,y) = ... 中的 x, y）
      missing.push(tok);
    }
    return [...new Set(missing)];
  }

  /**
   * 提取所有 Sequence(expr, var, ...) 的循环变量名（var 是声明，非引用）。
   * 逐层扫描跳过嵌套括号，取每个 Sequence 调用的第 2 个顶层参数。
   */
  private extractSequenceVars(rhs: string): Set<string> {
    const vars = new Set<string>();
    const re = /\bSequence\s*\(/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(rhs)) !== null) {
      const start = m.index + m[0].length;
      let depth = 1;
      let i = start;
      let argIdx = 0;
      let curStart = start;
      while (i < rhs.length && depth > 0) {
        const ch = rhs[i];
        if (ch === "(" || ch === "[" || ch === "{") depth++;
        else if (ch === ")" || ch === "]" || ch === "}") depth--;
        else if (ch === "," && depth === 1) {
          argIdx++;
          if (argIdx === 1) curStart = i + 1; // 第 2 个参数起点
          if (argIdx >= 2) break;             // 到第 3 个参数即停
        }
        i++;
      }
      const varName = rhs.slice(curStart, i).trim().match(/^([A-Za-z]\w*)/);
      if (varName) vars.add(varName[1]);
    }
    return vars;
  }

  // —— GGBAppletApi 实现 ——
  exists = (name: string) => this.objects.has(name);

  // ═══ 重载类型校验（overloads 元数据驱动） ═══

  /**
   * 校验命令调用的参数类型是否匹配任一重载签名。
   * 仅对 GGB_COMMAND_DEFS 中声明了 overloads 的命令生效；无元数据 → 放行。
   * 返回错误文案，或 null（通过）。
   */
  private validateCommandArgs(rhs: string): string | null {
    // 匹配 "Fn(arg1, arg2, ...)"（含嵌套括号，贪婪到末尾）
    const m = /^(\w+)\s*\((.*)\)\s*$/.exec(rhs.trim());
    if (!m) return null;
    const fn = m[1];
    const def = GGB_COMMAND_DEFS.find(d => d.name === fn);
    if (!def?.overloads?.length) return null;

    const actual = splitArgs(m[2]).map(a => this.resolveArgType(a));
    for (const ov of def.overloads) {
      if (this.argMatchesSequence(ov.args, actual)) return null;
    }
    const forms = def.overloads.map(o => `${fn}(${o.args.join(", ")})`).join(" | ");
    return `${fn} 参数类型不匹配：${actual.join(", ")}，可用形式 ${forms}`;
  }

  /** 解析单个实参的类型：坐标字面量/纯数字/已存在对象/表达式 */
  private resolveArgType(arg: string): GGBArgType {
    const a = arg.trim();
    if (/^\(.*,.*\)$/.test(a)) return "Point";               // 坐标字面量 (x,y)/(x,y,z)
    if (/^\{.*\}$/.test(a)) return "List";                   // 列表 {A,B,C}
    if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(a)) return "Number"; // 纯数字
    const obj = this.objects.get(a);
    if (obj) return mapToArgType(obj.type);
    // Point ± 位移 → Point（平移表达式，如 "A+v"、"P + (dx,dy)"、"P + (O-P)/r*scale"）
    //    真实 GGB 中 Point ± Vector/坐标位移 = Point；Point ± Number 表达式也是 Point（再求值）
    const binOp = /^([\w.]+)\s*([+-])\s*(.+)$/.exec(a);
    if (binOp) {
      const left = this.objects.get(binOp[1])?.type;
      const rightStr = binOp[3].trim();
      const rightObj = this.objects.get(rightStr);
      if (left === "Point") {
        // 右侧是坐标位移、已存在 Vector/Point，或任意表达式 → 平移结果仍是 Point
        if (/^\(.*,.*\)$/.test(rightStr)) return "Point"; // Point + (dx,dy)
        if (rightObj?.type === "Vector" || rightObj?.type === "Point") return "Point";
        if (/[+\-*/^]|\(|\)/.test(rightStr)) return "Point"; // Point + 复杂表达式
        return "Number"; // Point + 纯数字（异常但按 GGB 宽松处理为 Number）
      }
      // 非 Point 左侧：X ± Vector → Vector（Number+Vector=Vector，seed 对象类型未知也按 Vector）
      if (rightObj?.type === "Vector" && left !== undefined) return "Vector";
      if (left === "Vector" && /^\(.*,.*\)$/.test(rightStr)) return "Vector"; // Vector + 坐标
    }
    // 数字表达式（含运算符/函数调用）→ Number；否则未知对象名 → 放行
    if (/[+\-*/^]|\b(sin|cos|tan|sqrt|abs|floor|ceil|round|log|exp|min|max|if)\b|\(/.test(a)) {
      return "Number";
    }
    return "Any";
  }

  /** 序列匹配 + 变长延伸（如 Polygon 可 3/4/5 个顶点） */
  private argMatchesSequence(expected: GGBArgType[], actual: GGBArgType[]): boolean {
    if (actual.length < expected.length) return false;
    for (let i = 0; i < expected.length; i++) {
      if (!this.argMatches(expected[i], actual[i])) return false;
    }
    const last = expected[expected.length - 1];
    for (let i = expected.length; i < actual.length; i++) {
      if (!this.argMatches(last, actual[i])) return false;
    }
    return true;
  }

  private argMatches(expected: GGBArgType, actual: GGBArgType): boolean {
    if (expected === "Any" || actual === "Any") return true; // 未定义对象不拦截（可能后续定义）
    return expected === actual;
  }

  // Style setters —— 记录到 styles map 供 getter 查询
  setVisible = (name: string, v: boolean) => { this.styles.set(name, { ...this.styles.get(name), visible: v }); };
  setColor = (name: string, r: number, g: number, b: number) => {
    const hex = "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0")).join("");
    getOrCreateStyle(this.styles, name).color = hex;
  };
  setLineThickness = (name: string, t: number) => { getOrCreateStyle(this.styles, name).thickness = t; };
  setLineStyle = (name: string, s: number) => { getOrCreateStyle(this.styles, name).lineStyle = s; };
  setFilling = (name: string, f: number) => { getOrCreateStyle(this.styles, name).filling = f; };
  setCaption = (name: string, c: string) => { getOrCreateStyle(this.styles, name).caption = c; };
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

  // Phase 1 新增 API
  setRepaintingActive = () => {};
  setPointSize = (name: string, s: number) => { getOrCreateStyle(this.styles, name).pointSize = s; };
  setPointStyle = (name: string, s: number) => { getOrCreateStyle(this.styles, name).pointStyle = s; };
  setOnTheFlyPointCreationActive = () => {};
  enableRightClick = () => {};
  enableLabelDrags = () => {};
  enable3D = () => {};
  setGridVisible = () => {};
  setErrorDialogsActive = () => {};

  // —— Getter（供 getRichSnapshot / getCanvasSnapshot 使用） ——
  getColor = (name: string) => String(this.styles.get(name)?.color ?? "#000000");
  getVisible = () => true;
  getLineThickness = (name: string) => Number(this.styles.get(name)?.thickness ?? 1);
  getLineStyle = (name: string) => Number(this.styles.get(name)?.lineStyle ?? 0);
  getFilling = (name: string) => Number(this.styles.get(name)?.filling ?? 1);
  getPointSize = (name: string) => Number(this.styles.get(name)?.pointSize ?? 1);
  getPointStyle = (name: string) => Number(this.styles.get(name)?.pointStyle ?? 0);
  getCaption = (name: string) => String(this.styles.get(name)?.caption ?? "");
  getXcoord = () => 0;
  getYcoord = () => 0;
  getZcoord = () => 0;
  getValue = () => 0;
  getValueString = () => "0";
  getDefinitionString = (name: string) => this.objects.get(name)?.expr ?? "";
  getCommandString = (name: string) => this.objects.get(name)?.expr ?? "";
  getObjectType = (name: string) => this.objects.get(name)?.type ?? "Other";
  isDefined = (name: string) => this.objects.has(name);

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

/** 获取或创建对象的样式记录 */
function getOrCreateStyle(
  styles: Map<string, Record<string, unknown>>,
  name: string
): Record<string, unknown> {
  let s = styles.get(name);
  if (!s) {
    s = {};
    styles.set(name, s);
  }
  return s;
}

/** 按顶层逗号切分参数列表（括号/方括号/花括号嵌套深度保护） */
function splitArgs(s: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Mock 内部类型 → 重载签名类型（Segment/Ray 归为 Line 类） */
function mapToArgType(t: GGBType): GGBArgType {
  switch (t) {
    case "Point": return "Point";
    case "Number": return "Number";
    case "Vector": return "Vector";
    case "List": return "List";
    case "Line": return "Line";
    case "Segment": return "Line";
    case "Circle": return "Circle";
    case "Function": return "Function";
    default: return "Any";
  }
}
