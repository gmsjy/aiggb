/**
 * AiGGB 工具调用（Function Calling）工具集
 *
 * 将 GeoGebra 操作封装为 OpenAI/DeepSeek 兼容的 tool definitions，
 * 供 ReAct agent loop 使用。每个工具有：
 *   - OpenAI JSON Schema 定义（name / description / parameters）
 *   - Zod 校验 schema（在 toolExecutor 中验证参数）
 *   - 安全等级（safe | dangerous）—— dangerous 工具需用户确认
 */

import { z } from "zod";

// ──── 安全等级 ────

export type ToolSafety = "safe" | "dangerous";

// ──── 工具参数 Zod Schemas ────

const Identifier = z.string().min(1).max(40)
  .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "标识符仅允许 ASCII 字母数字下划线");

const ColorHex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "颜色需为 #RRGGBB 形式");

/** 表达式/数值联合类型：接受字面量数字或 GGB 表达式字符串（如 "v0*cos(theta)*t"） */
const ExprLike = z.union([z.number(), z.string().min(1).max(120)]);

export const CreatePointArgs = z.object({
  name: Identifier,
  x: ExprLike,
  y: ExprLike,
  z: ExprLike.optional(),
});
export const CreateSegmentArgs = z.object({
  name: Identifier,
  start: Identifier,
  end: Identifier,
});
export const CreateCircleArgs = z.object({
  name: Identifier,
  center: Identifier,
  radius: ExprLike,
});
export const CreatePolygonArgs = z.object({
  name: Identifier,
  vertices: z.array(Identifier).min(3).max(12),
});
export const CreateSliderArgs = z.object({
  name: Identifier,
  min: ExprLike,
  max: ExprLike,
  step: ExprLike,
  value: ExprLike,
  unit: z.string().max(8).optional(),
  label: z.string().max(40).optional(),
});

// ── 批量创建工具（减少 API 往返 + token 消耗） ──
export const CreateSlidersArgs = z.object({
  sliders: z.array(CreateSliderArgs).min(1).max(6),
});
export const CreatePointsArgs = z.object({
  points: z.array(CreatePointArgs).min(1).max(8),
});
export const CreateVectorArgs = z.object({
  name: Identifier,
  from: z.union([Identifier, z.string().min(1).max(80)]), // 点名 或 坐标表达式
  to: z.string().min(1).max(120), // 坐标字面量或表达式
  color: ColorHex.optional(),
});
export const CreateTextArgs = z.object({
  name: Identifier,
  text: z.string().max(200),
  position: Identifier,  // 定位点
});

// ── 新增工具 schemas ──
export const CreateFunctionArgs = z.object({
  name: Identifier,
  expression: z.string().min(1).max(300),
});
export const CreateParametricArgs = z.object({
  name: Identifier,
  xExpr: z.string().min(1).max(200),
  yExpr: z.string().min(1).max(200),
  zExpr: z.string().min(1).max(200).optional(), // 3D 参数曲线
  tMin: ExprLike,
  tMax: ExprLike,
});
export const PhysicsConstantsArgs = z.object({
  names: z.array(z.string().min(1).max(10)).min(1).max(8),
});
export const CreateTraceArgs = z.object({
  target: Identifier,
  mode: z.enum(["trail", "stroboscopic"]),
});
export const SetUnitAxesArgs = z.object({
  xUnit: z.string().max(8),
  yUnit: z.string().max(8),
  xLabel: z.string().max(20).optional(),
  yLabel: z.string().max(20).optional(),
});
export const EvalSequenceArgs = z.object({
  name: Identifier,
  expr: z.string().min(1).max(300),
  var: z.string().min(1).max(10).regex(/^[a-z][a-z0-9_]*$/i, "循环变量需为合法标识符"),
  start: ExprLike,
  end: ExprLike,
  step: ExprLike,
});

// ── Modification ──
export const SetStyleArgs = z.object({
  target: Identifier,
  color: ColorHex.optional(),
  thickness: z.number().int().min(1).max(13).optional(),
  opacity: z.number().min(0).max(1).optional(),
  dashed: z.boolean().optional(),
  visible: z.boolean().optional(),
  pointSize: z.number().int().min(1).max(9).optional(),
  pointStyle: z.number().int().min(-1).max(9).optional(),
});
export const SetAnimationArgs = z.object({
  target: Identifier,
  action: z.enum(["start", "stop"]),
  speed: z.number().positive().optional(),
  repeat: z.enum(["oscillating", "increasing", "once"]).optional(),
});
export const SetViewArgs = z.object({
  xmin: z.number().optional(),
  xmax: z.number().optional(),
  ymin: z.number().optional(),
  ymax: z.number().optional(),
  xUnit: z.string().max(8).optional(),
  yUnit: z.string().max(8).optional(),
  showGrid: z.boolean().optional(),
  perspective: z.enum(["2d", "3d"]).optional(),
});
export const DeleteObjectArgs = z.object({
  target: Identifier,
});
export const ClearCanvasArgs = z.object({});

// ── Query ──
export const GetObjectInfoArgs = z.object({
  name: Identifier,
});
export const ListObjectsArgs = z.object({
  type: z.string().optional(),  // 按类型过滤（可选）
});

// ── Raw ──
export const EvalRawArgs = z.object({
  command: z.string().min(1).max(500),
});

// ──── 工具定义（OpenAI Function Calling 格式） ────

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
  /** 安全等级 */
  safety: ToolSafety;
}

/**
 * Zod schema → JSON Schema（简化版，覆盖本工具集的字段类型）。
 * 仅处理 string / number / boolean / enum / array，不做完整 JSON Schema draft。
 */
function toJsonSchema(schema: z.ZodTypeAny): {
  properties: Record<string, unknown>;
  required: string[];
} {
  const shape = (schema as z.ZodObject<Record<string, z.ZodTypeAny>>).shape;
  if (!shape) return { properties: {}, required: [] };

  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [key, field] of Object.entries(shape)) {
    // 解包 optional / default / refine / regex 等 wrapper
    let inner = field;
    while (inner instanceof z.ZodOptional || inner instanceof z.ZodDefault) {
      if (inner instanceof z.ZodOptional) {
        inner = inner._def.innerType;
      } else if (inner instanceof z.ZodDefault) {
        inner = inner._def.innerType;
      }
    }

    const isOptional = field instanceof z.ZodOptional || field instanceof z.ZodDefault;
    if (!isOptional) required.push(key);

    if (inner instanceof z.ZodUnion) {
      // union 类型：取各分支的类型合并（string|number → ["string","number"]）
      const options = (inner as z.ZodUnion<z.ZodUnionOptions>).options;
      const types = new Set<string>();
      for (const opt of options) {
        if (opt instanceof z.ZodNumber) types.add("number");
        else if (opt instanceof z.ZodString) types.add("string");
        else if (opt instanceof z.ZodBoolean) types.add("boolean");
        else types.add("string");
      }
      properties[key] = types.size === 1
        ? { type: [...types][0] }
        : { type: "string", description: `可接受类型：${[...types].join(" 或 ")}` };
    } else if (inner instanceof z.ZodString) {
      const prop: Record<string, unknown> = { type: "string" };
      for (const check of (inner as z.ZodString)._def.checks || []) {
        if (check.kind === "min") prop.minLength = check.value;
        if (check.kind === "max") prop.maxLength = check.value;
      }
      // enum
      if (inner instanceof z.ZodEnum) {
        prop.enum = (inner as z.ZodEnum<[string, ...string[]]>).options;
      }
      properties[key] = prop;
    } else if (inner instanceof z.ZodNumber) {
      const prop: Record<string, unknown> = { type: "number" };
      for (const check of (inner as z.ZodNumber)._def.checks || []) {
        if (check.kind === "min") prop.minimum = check.value;
        if (check.kind === "max") prop.maximum = check.value;
        if (check.kind === "int") prop.type = "integer";
      }
      properties[key] = prop;
    } else if (inner instanceof z.ZodBoolean) {
      properties[key] = { type: "boolean" };
    } else if (inner instanceof z.ZodArray) {
      const arrSchema = inner as z.ZodArray<z.ZodTypeAny>;
      const elementType = arrSchema._def.type;
      let items: unknown;
      if (elementType instanceof z.ZodObject) {
        // ★ 递归：array of objects → 展开内层 object 的 properties
        const nested = toJsonSchema(elementType);
        items = { type: "object", ...nested };
      } else if (elementType instanceof z.ZodString) {
        items = { type: "string" };
      } else if (elementType instanceof z.ZodNumber) {
        items = { type: "number" };
      } else {
        items = { type: "string" }; // fallback
      }
      properties[key] = {
        type: "array",
        items,
        minItems: arrSchema._def.minLength?.value,
        maxItems: arrSchema._def.maxLength?.value,
      };
    } else if (inner instanceof z.ZodEnum) {
      properties[key] = {
        type: "string",
        enum: (inner as z.ZodEnum<[string, ...string[]]>).options,
      };
    } else {
      properties[key] = { type: "string" }; // fallback
    }
  }
  return { properties, required };
}

// ──── 23 个工具 ────

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  // ═══ 创建类（safe） ═══
  {
    type: "function",
    function: {
      name: "create_points",
      description: "★ 批量创建多个点（推荐）。一次调用创建 1~8 个点，减少 API 往返。用法：points=[{name,x,y},{name,x,y},...]。3D 时可加 z 坐标。",
      parameters: { type: "object", ...toJsonSchema(CreatePointsArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "create_point",
      description: "在画布上创建一个点。x/y/z 可以是数值或表达式字符串（如 \"v0*cos(theta)*t\"）。2D 时只填 x,y；3D 时可填 z。多个点请用 create_points。",
      parameters: { type: "object", ...toJsonSchema(CreatePointArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "create_segment",
      description: "连接两个已存在的点，创建一条线段。",
      parameters: { type: "object", ...toJsonSchema(CreateSegmentArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "create_circle",
      description: "以指定点为圆心创建圆。radius 可以是数值或引用已存在的滑块名（字符串）。",
      parameters: { type: "object", ...toJsonSchema(CreateCircleArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "create_polygon",
      description: "用已存在的顶点创建多边形（至少 3 个顶点）。",
      parameters: { type: "object", ...toJsonSchema(CreatePolygonArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "create_sliders",
      description: "★ 批量创建多个滑块（推荐）。一次调用创建 1~6 个滑块，减少 API 往返。当需要多个参数（如初速、角度、时间）时优先用此工具。用法：sliders=[{name,min,max,step,value,unit?,label?},...]。",
      parameters: { type: "object", ...toJsonSchema(CreateSlidersArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "create_slider",
      description: "创建一个数值滑块。min/max/value/step 可以是数值或表达式。用于角度、速度、时间等可调参数。多个滑块请用 create_sliders。",
      parameters: { type: "object", ...toJsonSchema(CreateSliderArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "create_vector",
      description: "从起点指向终点的矢量箭头（力、速度、加速度等）。from 是点名或坐标字面量，to 是坐标表达式如 \"(x+dx, y+dy)\"。",
      parameters: { type: "object", ...toJsonSchema(CreateVectorArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "create_text",
      description: "在画布上放置静态文本标签。",
      parameters: { type: "object", ...toJsonSchema(CreateTextArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "create_function",
      description: "创建一个函数/表达式。expression 是 GGB 表达式，如 \"sin(x)\"、\"v0*cos(theta)*t\"、\"sqrt(x^2+y^2)\"。这是构造动态图形的核心工具。",
      parameters: { type: "object", ...toJsonSchema(CreateFunctionArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "create_parametric",
      description: "创建参数曲线。xExpr/yExpr 是含参数 t 的表达式，如 xExpr=\"cos(t)\" yExpr=\"sin(t)\"。3D 时可加 zExpr。",
      parameters: { type: "object", ...toJsonSchema(CreateParametricArgs) },
    },
    safety: "safe",
  },

  // ═══ 物理专用（safe） ═══
  {
    type: "function",
    function: {
      name: "physics_constants",
      description: "注入物理常量到画布（自动隐藏）。可用常量：g（重力加速度）、c（光速）、e（元电荷）、eps0（真空介电常数）、mu0（真空磁导率）、k_e（库仑常量）、Grav（万有引力常量）、h（普朗克常量）、k_B（玻尔兹曼常量）。",
      parameters: { type: "object", ...toJsonSchema(PhysicsConstantsArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "create_trace",
      description: "为对象添加运动轨迹。mode=trail（拖尾轨迹）或 stroboscopic（频闪采样）。",
      parameters: { type: "object", ...toJsonSchema(CreateTraceArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "set_unit_axes",
      description: "设置带单位的坐标轴标签，如 xUnit=\"m\" yUnit=\"s\"。",
      parameters: { type: "object", ...toJsonSchema(SetUnitAxesArgs) },
    },
    safety: "safe",
  },

  // ═══ 修改类（safe） ═══
  {
    type: "function",
    function: {
      name: "set_style",
      description: "设置对象的视觉样式：颜色、粗细、透明度、虚线、点大小/样式等。只需填要修改的字段。",
      parameters: { type: "object", ...toJsonSchema(SetStyleArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "set_animation",
      description: "控制对象动画（通常是滑块）。action=start 开始，action=stop 停止。可选调速和重复模式。",
      parameters: { type: "object", ...toJsonSchema(SetAnimationArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "set_view",
      description: "设置视窗范围、坐标轴单位和网格。可切换到 3D 透视。只需填要修改的字段。",
      parameters: { type: "object", ...toJsonSchema(SetViewArgs) },
    },
    safety: "safe",
  },

  // ═══ 删除类（dangerous） ═══
  {
    type: "function",
    function: {
      name: "delete_object",
      description: "删除画布上的指定对象。此操作不可撤销。",
      parameters: { type: "object", ...toJsonSchema(DeleteObjectArgs) },
    },
    safety: "dangerous",
  },
  {
    type: "function",
    function: {
      name: "clear_canvas",
      description: "清空整个画布，删除所有对象。此操作不可撤销！",
      parameters: { type: "object", properties: {} },
    },
    safety: "dangerous",
  },

  // ═══ 查询类（safe） ═══
  {
    type: "function",
    function: {
      name: "get_object_info",
      description: "查询画布上指定对象的类型、定义和当前值。用于在创建新对象前确认依赖对象是否存在。",
      parameters: { type: "object", ...toJsonSchema(GetObjectInfoArgs) },
    },
    safety: "safe",
  },
  {
    type: "function",
    function: {
      name: "list_objects",
      description: "列出当前画布上所有对象的名称。可选按类型过滤（如 \"point\", \"slider\", \"vector\"）。用于了解画布当前状态。",
      parameters: { type: "object", ...toJsonSchema(ListObjectsArgs) },
    },
    safety: "safe",
  },

  // ═══ 高级 ═══
  {
    type: "function",
    function: {
      name: "eval_sequence",
      description: "生成序列对象列表。用于批量创建对象网格（如电场箭头、采样点）。expr 是含循环变量的表达式，var 是循环变量名。⚠ 可能产生大量对象。",
      parameters: { type: "object", ...toJsonSchema(EvalSequenceArgs) },
    },
    safety: "dangerous",
  },
  {
    type: "function",
    function: {
      name: "eval_raw",
      description: "执行原始 GeoGebra 命令。仅限无法用专用工具表达的复杂操作：3D 几何体（Cube/Sphere/Tetrahedron）、IntersectPath 截面、Surface 曲面、SolveODE 等。⚠ 需要用户确认。",
      parameters: { type: "object", ...toJsonSchema(EvalRawArgs) },
    },
    safety: "dangerous",
  },
];

// ──── 工具名 → Zod schema 映射（供 toolExecutor 校验） ────

export const TOOL_SCHEMAS: Record<string, z.ZodTypeAny> = {
  create_point: CreatePointArgs,
  create_points: CreatePointsArgs,
  create_segment: CreateSegmentArgs,
  create_circle: CreateCircleArgs,
  create_polygon: CreatePolygonArgs,
  create_slider: CreateSliderArgs,
  create_sliders: CreateSlidersArgs,
  create_vector: CreateVectorArgs,
  create_text: CreateTextArgs,
  create_function: CreateFunctionArgs,
  create_parametric: CreateParametricArgs,
  physics_constants: PhysicsConstantsArgs,
  create_trace: CreateTraceArgs,
  set_unit_axes: SetUnitAxesArgs,
  set_style: SetStyleArgs,
  set_animation: SetAnimationArgs,
  set_view: SetViewArgs,
  delete_object: DeleteObjectArgs,
  clear_canvas: ClearCanvasArgs,
  get_object_info: GetObjectInfoArgs,
  list_objects: ListObjectsArgs,
  eval_sequence: EvalSequenceArgs,
  eval_raw: EvalRawArgs,
};

/** 获取工具的安全等级 */
export function getToolSafety(name: string): ToolSafety {
  return TOOL_DEFINITIONS.find(t => t.function.name === name)?.safety ?? "dangerous";
}

/** 判断工具名是否为已注册的已知工具（防止 AI hallucinate 不存在的工具） */
export function isKnownTool(name: string): boolean {
  return name in TOOL_SCHEMAS;
}

// ──── 工具分类元数据（改造四） ────

export type ToolCategory =
  | "create"    // 创建对象（点/线/圆/多边形/滑块/矢量/文本/函数/曲线）
  | "physics"   // 物理专用（常量/轨迹/单位轴）
  | "modify"    // 修改（样式/动画/视图）
  | "delete"    // 删除（对象/清空）
  | "query"     // 查询（对象信息/列表）
  | "advanced"; // 高级（序列/原始命令）

/**
 * 工具名 → 分类映射。独立于 TOOL_DEFINITIONS（保持 API tools 参数纯净，
 * 避免未知字段在 strict schema 下被拒绝）。用于 agent system prompt 按分组速览工具。
 */
export const TOOL_CATEGORIES: Record<string, ToolCategory> = {
  // create
  create_points: "create", create_point: "create", create_segment: "create",
  create_circle: "create", create_polygon: "create", create_sliders: "create",
  create_slider: "create", create_vector: "create", create_text: "create",
  create_function: "create", create_parametric: "create",
  // physics
  physics_constants: "physics", create_trace: "physics", set_unit_axes: "physics",
  // modify
  set_style: "modify", set_animation: "modify", set_view: "modify",
  // delete
  delete_object: "delete", clear_canvas: "delete",
  // query
  get_object_info: "query", list_objects: "query",
  // advanced
  eval_sequence: "advanced", eval_raw: "advanced",
};

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  create: "创建对象",
  physics: "物理专用",
  modify: "修改样式/动画/视图",
  delete: "删除对象",
  query: "查询画布状态",
  advanced: "高级（序列/原始命令）",
};

/** 生成按分类分组的工具速览文本（注入 agent system prompt，帮助模型理解工具分组） */
export function buildToolCategoryOverview(): string {
  const groups = new Map<ToolCategory, string[]>();
  for (const [name, cat] of Object.entries(TOOL_CATEGORIES)) {
    const list = groups.get(cat) ?? [];
    list.push(name);
    groups.set(cat, list);
  }
  const lines: string[] = [];
  for (const cat of Object.keys(CATEGORY_LABELS) as ToolCategory[]) {
    const tools = groups.get(cat);
    if (tools && tools.length > 0) {
      lines.push(`  ${CATEGORY_LABELS[cat]}: ${tools.join(" / ")}`);
    }
  }
  return lines.join("\n");
}
