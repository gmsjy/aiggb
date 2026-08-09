/**
 * AI 输出 schema —— 见 SPEC.md §4.3 / §10A.5
 * 用 Zod discriminatedUnion 确保 op 字段驱动后续字段类型。
 *
 * 数值字段统一走 NumLike：允许 number 或可被 parseFloat 的 string，
 * 容错 AI 偶尔的类型漂移（例如把 0.5 输出成 "0.5"）。
 *
 * 防漂移增强：
 *   - eval 命令静态扫描硬黑名单命令（不存在命令 → 直接拒绝，进入格式修复）
 *   - slider 数值合理性（min<max、初值在区间内）
 *   - view 区间合理性（xmin<xmax、ymin<ymax）
 *   - forceDiagram.vec 强制坐标字面量形态
 *   - ask 与 commands 互斥（反问时不得携带命令）
 */
import { z } from "zod";
import { GGB_FORBIDDEN_COMMANDS } from "./commands";

const Color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "颜色需为 #RRGGBB 形式");

/** 去掉字符串字面量，避免 Text("Play") 这类字符串内容触发误报 */
function stripStringLiterals(s: string): string {
  return s
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, "")
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, "");
}

/** 硬黑名单：命中「不存在的 GGB 命令 + 紧跟括号」即视为臆造命令调用 */
const FORBIDDEN_CMD_RE = new RegExp(
  `\\b(?:${GGB_FORBIDDEN_COMMANDS.join("|")})\\s*\\(`,
  "i"
);

/** 展示型文本（caption/label/unit）的危险片段检测：防 prompt 注入经标注字段落地 */
const DANGEROUS_TEXT_RE = /<script|javascript:|on\w+=/i;
function withTextSafety(s: z.ZodString): z.ZodEffects<z.ZodString> {
  return s.refine(v => !DANGEROUS_TEXT_RE.test(v), "文本含有危险片段");
}

const SafeCmd = z
  .string()
  .min(1)
  .max(500)
  .refine(s => !/<script|javascript:|on\w+=/i.test(s), "命令含有危险片段")
  .refine(
    s => !FORBIDDEN_CMD_RE.test(stripStringLiterals(s)),
    "命令使用了不存在的 GGB 命令（命中硬黑名单），请删除或改用白名单命令"
  );

const Identifier = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "标识符仅允许 ASCII 字母数字下划线");

/**
 * 坐标/位置表达式（vector.from/to、forceDiagram.at 等，会原样拼进 evalCommand）。
 * 校验：禁止分号/花括号（命令分隔符），并复用硬黑名单命令检测，防 GGB 命令注入
 * （如 to: "(0,0)); StartAnimation(); (0,0" 或 JavaScript(...)）。
 * 允许合法数学函数（sin/cos/sqrt 等），仅拦截黑名单命令调用。
 */
const CoordExpr = z
  .string()
  .min(1)
  .max(80)
  .refine(s => !/[;{}]/.test(s), "坐标表达式不能包含分号或花括号")
  .refine(
    s => !FORBIDDEN_CMD_RE.test(stripStringLiterals(s)),
    "坐标表达式不能调用 GGB 命令"
  );

/** number | "1.23" | "1e-3" → number；其他情况抛错 */
const NumLike = z.preprocess(v => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (trimmed === "") return v;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : v;
  }
  return v;
}, z.number());

/** 与 NumLike 同思路，但保持整数语义 */
const IntLike = z.preprocess(v => {
  if (typeof v === "number") return Math.trunc(v);
  if (typeof v === "string") {
    const n = Number(v.trim());
    return Number.isFinite(n) ? Math.trunc(n) : v;
  }
  return v;
}, z.number().int());

/** number | "true"/"false" → boolean，容错 AI 把布尔写成字符串 */
const BoolLike = z.preprocess(v => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1" || s === "yes" || s === "on") return true;
    if (s === "false" || s === "0" || s === "no" || s === "off") return false;
  }
  if (typeof v === "number") return v !== 0;
  return v;
}, z.boolean());

export const PhysicsConstantName = z.enum([
  "g", "c", "e", "eps0", "mu0", "k_e", "Grav", "h", "k_B"
]);

export const Command = z.discriminatedUnion("op", [
  z.object({ op: z.literal("eval"), cmd: SafeCmd }),

  z.object({
    op: z.literal("slider"),
    name: Identifier,
    min: NumLike,
    max: NumLike,
    step: NumLike.refine(n => n > 0, "step 必须 > 0"),
    value: NumLike,
    unit: withTextSafety(z.string().max(8)).optional(),
    label: withTextSafety(z.string().max(40)).optional()
  }),

  z.object({
    op: z.literal("animate"),
    target: Identifier,
    speed: NumLike.optional(),
    on: BoolLike,
    repeat: z.enum(["oscillating", "increasing", "once"]).optional()
  }),

  z.object({ op: z.literal("trace"), target: Identifier, on: BoolLike }),

  z.object({
    op: z.literal("style"),
    target: Identifier,
    color: Color.optional(),
    thickness: IntLike.refine(n => n >= 1 && n <= 13, "thickness 应在 1–13 之间").optional(),
    visible: BoolLike.optional(),
    opacity: NumLike.refine(n => n >= 0 && n <= 1, "opacity 应在 0–1 之间").optional(),
    dashed: BoolLike.optional()
  }),

  z.object({
    op: z.literal("view"),
    xmin: NumLike,
    xmax: NumLike,
    ymin: NumLike,
    ymax: NumLike,
    axesUnit: z.tuple([z.string().max(8), z.string().max(8)]).optional()
  }),

  z.object({ op: z.literal("caption"), target: Identifier, text: withTextSafety(z.string().max(120)) }),
  z.object({ op: z.literal("delete"), target: Identifier }),
  z.object({ op: z.literal("reset") }),

  // —— 物理基元 ——
  z.object({
    op: z.literal("vector"),
    name: Identifier,
    from: CoordExpr,
    to: CoordExpr,
    color: Color.optional(),
    label: withTextSafety(z.string().max(40)).optional()
  }),

  z.object({
    op: z.literal("forceDiagram"),
    at: CoordExpr,
    forces: z
      .array(
        z.object({
          name: Identifier,
          vec: z
            .string()
            .max(80)
            .refine(
              s => /^\([\s\S]*\)$/.test(s.trim()),
              "forceDiagram.vec 必须写成坐标/矢量字面量 (dx, dy) 形式，不要引用未声明对象"
            ),
          color: Color.optional(),
          label: withTextSafety(z.string().max(40)).optional()
        })
      )
      .min(1)
      .max(8)
  }),

  z.object({
    op: z.literal("physicsTrace"),
    target: Identifier,
    mode: z.enum(["trail", "stroboscopic"]),
    fade: BoolLike.optional()
  }),

  z.object({
    op: z.literal("unitAxes"),
    xUnit: withTextSafety(z.string().max(8)),
    yUnit: withTextSafety(z.string().max(8)),
    xLabel: withTextSafety(z.string().max(20)).optional(),
    yLabel: withTextSafety(z.string().max(20)).optional()
  }),

  z.object({
    op: z.literal("constants"),
    names: z.array(PhysicsConstantName).min(1).max(8)
  })
]);

export type Command = z.infer<typeof Command>;

export const AIResponse = z
  .object({
    explanation: z.string().max(500),
    commands: z.array(Command).max(64),
    /** AI 不确定需求时反问用户；有 ask 时 commands 必须为空数组 */
    ask: z.string().max(300).optional(),
    /** Phase 2 自检报告（生成+自检同一响应）。可选，由 compile prompt 按需触发 */
    self_check: z.string().max(400).optional()
  })
  .superRefine((data, ctx) => {
    // ask 与 commands 互斥
    if (data.ask && data.commands.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ask"],
        message: "有 ask 反问时 commands 必须为空数组"
      });
    }
    // slider / view 数值语义合理性（跨命令级校验，避免污染 discriminatedUnion）
    data.commands.forEach((c, i) => {
      if (c.op === "slider") {
        if (c.min >= c.max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["commands", i, "min"],
            message: "slider.min 必须小于 slider.max"
          });
        } else if (c.value < c.min || c.value > c.max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["commands", i, "value"],
            message: "slider 初值 value 需落在 [min, max] 区间内"
          });
        }
      } else if (c.op === "view") {
        if (c.xmin >= c.xmax || c.ymin >= c.ymax) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["commands", i],
            message: "view 要求 xmin < xmax 且 ymin < ymax"
          });
        }
      }
    });
  });

export type AIResponse = z.infer<typeof AIResponse>;

/** 把 zod issues 压成单行用户可读消息 */
export function formatZodError(err: z.ZodError): string {
  return err.issues
    .map(i => `${i.path.join(".") || "<root>"}: ${i.message}`)
    .slice(0, 5)
    .join("; ");
}
