/**
 * GeoGebra Bridge —— 见 SPEC.md §4.2 / §4A.3
 *
 * 把 schema 中的 op 翻译为对 GGBAppletApi 的真实调用，并返回每条命令的执行结果。
 * 失败的命令不会中断后续执行，统一返回结果列表交给上层。
 */
import type { Command } from "./schema";
import type { GGBAppletApi } from "../types/ggb";
import { PHYSICS_CONSTANTS } from "./physics";

/** 全局自增临时对象 id：避免 vector/forceDiagram 的辅助矢量名跨命令复用导致动态污染 */
let _tmpSeq = 0;
function genTmpId(prefix: string): string {
  return `${prefix}${_tmpSeq++}`;
}

export interface ExecResult {
  ok: boolean;
  command: Command;
  /** 该 op 实际执行的最底层 GGB 命令（供错误回喂 AI） */
  expanded: string[];
  error?: string;
}

/** 把所有命令逐条执行，失败不停。 */
export function executeCommands(api: GGBAppletApi, commands: Command[]): ExecResult[] {
  return commands.map(cmd => executeOne(api, cmd));
}

function executeOne(api: GGBAppletApi, cmd: Command): ExecResult {
  const expanded: string[] = [];
  try {
    switch (cmd.op) {
      case "eval": {
        expanded.push(cmd.cmd);
        const ok = api.evalCommand(cmd.cmd);
        return { ok, command: cmd, expanded, error: ok ? undefined : "GGB evalCommand 返回 false" };
      }

      case "slider": {
        // GGB Slider 语法： name = Slider(min, max, step, speed, width, isAngle, horizontal, animating, random)
        const sliderCmd = `${cmd.name} = Slider(${cmd.min}, ${cmd.max}, ${cmd.step}, 1, 150, false, true, false, false)`;
        expanded.push(sliderCmd);
        const ok = api.evalCommand(sliderCmd);
        if (!ok) return { ok, command: cmd, expanded, error: "滑块创建失败" };
        // 初值
        api.evalCommand(`SetValue(${cmd.name}, ${cmd.value})`);
        // 标注
        const captionText = cmd.label
          ? cmd.unit
            ? `${cmd.label} = %v ${cmd.unit}`
            : `${cmd.label} = %v`
          : cmd.unit
          ? `${cmd.name} = %v ${cmd.unit}`
          : "";
        if (captionText) {
          api.setCaption(cmd.name, captionText);
          api.setLabelStyle(cmd.name, 3); // NAME_VALUE_CAPTION → 3 (caption)
        }
        return { ok: true, command: cmd, expanded };
      }

      case "animate": {
        // 目标存在性预检：动画目标必须是已存在对象（通常是滑块 / 点）
        if (!api.exists(cmd.target)) {
          return {
            ok: false,
            command: cmd,
            expanded: [],
            error: `动画目标 ${cmd.target} 不存在；请先通过 slider 或 eval 创建该对象，再启动动画`
          };
        }
        if (cmd.speed !== undefined) {
          api.setAnimationSpeed(cmd.target, cmd.speed);
        }
        if (cmd.repeat) {
          // GGB 动画类型：0 oscillating, 1 increasing, 2 decreasing, 3 increasing once
          const map = { oscillating: 0, increasing: 1, once: 3 } as const;
          api.evalCommand(`SetAnimationType(${cmd.target}, ${map[cmd.repeat]})`);
        }
        api.setAnimating(cmd.target, cmd.on);
        if (cmd.on) api.startAnimation();
        else api.stopAnimation();
        return { ok: true, command: cmd, expanded };
      }

      case "trace": {
        // 目标存在性预检：轨迹目标必须是已存在对象
        if (!api.exists(cmd.target)) {
          return {
            ok: false,
            command: cmd,
            expanded: [],
            error: `轨迹目标 ${cmd.target} 不存在；请先通过 eval 创建该对象，再开启轨迹`
          };
        }
        api.setTrace(cmd.target, cmd.on);
        return { ok: true, command: cmd, expanded };
      }

      case "style": {
        if (cmd.color) {
          const [r, g, b] = hexToRgb(cmd.color);
          api.setColor(cmd.target, r, g, b);
        }
        if (cmd.thickness !== undefined) api.setLineThickness(cmd.target, cmd.thickness);
        if (cmd.visible !== undefined) api.setVisible(cmd.target, cmd.visible);
        if (cmd.opacity !== undefined) {
          // ★ 线/函数/曲线透明度：优先 SetLineOpacity（对无填充对象才真正生效）；
          //   若该对象不支持（如 3D 立体）则回退 setFilling
          expanded.push(`SetLineOpacity(${cmd.target}, ${cmd.opacity})`);
          if (!api.evalCommand(`SetLineOpacity(${cmd.target}, ${cmd.opacity})`)) {
            api.setFilling(cmd.target, cmd.opacity);
          }
        }
        if (cmd.dashed) api.setLineStyle(cmd.target, 1);
        return { ok: true, command: cmd, expanded };
      }

      case "view": {
        api.setCoordSystem(cmd.xmin, cmd.xmax, cmd.ymin, cmd.ymax);
        if (cmd.axesUnit && api.setAxisUnits) {
          api.setAxisUnits(1, cmd.axesUnit[0], cmd.axesUnit[1], "");
        }
        return { ok: true, command: cmd, expanded };
      }

      case "caption": {
        api.setCaption(cmd.target, cmd.text);
        api.setLabelStyle(cmd.target, 3);
        return { ok: true, command: cmd, expanded };
      }

      case "delete": {
        api.deleteObject(cmd.target);
        return { ok: true, command: cmd, expanded };
      }

      case "reset": {
        api.newConstruction();
        return { ok: true, command: cmd, expanded };
      }

      // —— 物理基元 ——
      case "vector": {
        const startOk = isCoordLiteral(cmd.from) || api.exists(cmd.from);
        if (!startOk) {
          return {
            ok: false,
            command: cmd,
            expanded: [`${cmd.name} = Vector(${cmd.from}, ${cmd.to})`],
            error: `起点 ${cmd.from} 不存在；请先用 eval 命令创建该 Point，或把 from 改成坐标字面量如 "(0,0)"`
          };
        }

        // 容错：检测 "block + Gvec" 模式 —— Gvec 是 Point 则 Point+Point 会崩
        // 自动转换为 "Vector(at, at + Vector((0,0), offset))" = Point+Vector 安全形式
        const plusMatch = /^(.+)\s*\+\s*(\w[\w.]*)\s*$/.exec(cmd.to.trim());
        if (plusMatch) {
          const atExpr = plusMatch[1].trim();
          const offsetVar = plusMatch[2].trim();
          // 偏移量必须是已存在的 GGB 对象（不是字面量）才需要转换
          if (!isCoordLiteral(offsetVar) && api.exists(offsetVar)) {
            // 两步法：先把偏移量转成真正的 Vector，再 Point+Vector
            // 临时名用全局自增 id，避免多条 vector op 复用同名临时对象导致动态污染
            const tmpId = genTmpId("_vv");
            const c1 = `${tmpId} = Vector((0,0), ${offsetVar})`;
            expanded.push(c1);
            let ok = api.evalCommand(c1);
            if (ok) {
              const c2 = `${cmd.name} = Vector(${atExpr}, ${atExpr} + ${tmpId})`;
              expanded.push(c2);
              ok = api.evalCommand(c2);
              api.setVisible(tmpId, false);
            }
            if (ok) {
              if (cmd.color) {
                const [r, g, b] = hexToRgb(cmd.color);
                api.setColor(cmd.name, r, g, b);
              }
              api.setLineThickness(cmd.name, 4);
              if (cmd.label) {
                api.setCaption(cmd.name, cmd.label);
                api.setLabelStyle(cmd.name, 3);
              }
              return { ok: true, command: cmd, expanded };
            }
            return {
              ok: false,
              command: cmd,
              expanded,
              error: `矢量创建失败：to="${cmd.to}" 中 ${offsetVar} 是 Point 不是 Vector（GGB 中 Point+Point 未定义）。请改用 forceDiagram op，或把偏移量写成画括字面量 "(...,...)" 而非赋给变量`
            };
          }
        }

        const vCmd = `${cmd.name} = Vector(${cmd.from}, ${cmd.to})`;
        expanded.push(vCmd);
        const ok = api.evalCommand(vCmd);
        if (!ok) {
          return {
            ok,
            command: cmd,
            expanded,
            error: `矢量创建失败。可能原因：(1) to="${cmd.to}" 包含 Point+Point；(2) to 表达式出现 NaN/除零。请改用 forceDiagram op 自动处理类型安全，或确保 to 为坐标字面量`
          };
        }
        if (cmd.color) {
          const [r, g, b] = hexToRgb(cmd.color);
          api.setColor(cmd.name, r, g, b);
        }
        api.setLineThickness(cmd.name, 4);
        if (cmd.label) {
          api.setCaption(cmd.name, cmd.label);
          api.setLabelStyle(cmd.name, 3);
        }
        return { ok: true, command: cmd, expanded };
      }

      case "forceDiagram": {
        const startOk = isCoordLiteral(cmd.at) || api.exists(cmd.at);
        if (!startOk) {
          return {
            ok: false,
            command: cmd,
            expanded: [],
            error: `力图作用点 ${cmd.at} 不存在；请先用 eval 命令创建该 Point（例如 "block = (2*cos(theta), 2*sin(theta))")，或把 at 改成坐标字面量`
          };
        }
        const failed: string[] = [];
        for (let fi = 0; fi < cmd.forces.length; fi++) {
          const f = cmd.forces[fi];
          // 临时名全局自增：单个 forceDiagram 内 fi 唯一，跨命令也唯一
          const tmpId = genTmpId("_fv");
          // Step 1: 用 Vector((0,0), endPoint) 创建位移矢量（而非 Point 相加）
          //         GGB 中 Vector((0,0),(dx,dy)) 始终产生 Vector，不会被推断为 Point
          const tmpCmd = `${tmpId} = Vector((0,0), ${f.vec})`;
          expanded.push(tmpCmd);
          let ok = api.evalCommand(tmpCmd);
          if (!ok) {
            failed.push(`${f.name} (位移矢量创建失败)`);
            continue;
          }
          // Step 2: Point + Vector = translated Point（GGB 保证成立）
          const vCmd = `${f.name} = Vector(${cmd.at}, ${cmd.at} + ${tmpId})`;
          expanded.push(vCmd);
          ok = api.evalCommand(vCmd);
          if (!ok) {
            failed.push(`${f.name} (终点计算失败)`);
            continue;
          }
          if (f.color) {
            const [r, g, b] = hexToRgb(f.color);
            api.setColor(f.name, r, g, b);
          } else {
            const [r, g, b] = hexToRgb("#e53935");
            api.setColor(f.name, r, g, b);
          }
          api.setLineThickness(f.name, 4);
          if (f.label) {
            api.setCaption(f.name, f.label);
            api.setLabelStyle(f.name, 3);
          }
          // 隐藏辅助矢量
          api.setVisible(tmpId, false);
        }
        return failed.length === 0
          ? { ok: true, command: cmd, expanded }
          : { ok: false, command: cmd, expanded, error: `力矢量创建失败: ${failed.join(", ")}` };
      }

      case "physicsTrace": {
        // MVP 阶段：trail 走原生 trace；stroboscopic 也启用 trace，并提示 AI 在需要时显式生成 Sequence 采样
        api.setTrace(cmd.target, true);
        return { ok: true, command: cmd, expanded };
      }

      case "unitAxes": {
        const xLabel = cmd.xLabel ? `${cmd.xLabel}/${cmd.xUnit}` : `/${cmd.xUnit}`;
        const yLabel = cmd.yLabel ? `${cmd.yLabel}/${cmd.yUnit}` : `/${cmd.yUnit}`;
        api.setAxisLabels(1, xLabel, yLabel, "");
        return { ok: true, command: cmd, expanded };
      }

      case "constants": {
        for (const name of cmd.names) {
          const def = PHYSICS_CONSTANTS[name];
          if (!def) continue;
          if (api.exists(name)) continue; // 已存在不重复
          const c = `${name} = ${def.value}`;
          expanded.push(c);
          api.evalCommand(c);
          api.setVisible(name, false); // 常量不显示在画布
        }
        return { ok: true, command: cmd, expanded };
      }

      default: {
        // schema 已约束 op，此处兜底防未来扩展遗漏
        return {
          ok: false,
          command: cmd,
          expanded,
          error: `未知 op：${(cmd as { op?: string }).op ?? "(无)"}`
        };
      }
    }
  } catch (err) {
    return {
      ok: false,
      command: cmd,
      expanded,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace(/^#/, "");
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16)
  ];
}

/** 粗略判断字符串是不是 GGB 坐标字面量，如 "(1,2)" / "(a, b+1)" */
function isCoordLiteral(s: string): boolean {
  return /^\s*\(/.test(s) && /\)\s*$/.test(s);
}

/** 把一组 ExecResult 中失败项汇总成传给 prompts.buildCheckerPrompt 的入参 */
export function collectFailures(results: ExecResult[]): { cmd: string; error: string }[] {
  return results
    .filter(r => !r.ok)
    .map(r => ({
      cmd: r.expanded.length ? r.expanded.join("; ") : JSON.stringify(r.command),
      error: diagnose(r) ?? "未知错误"
    }));
}

/** 启发式诊断：根据失败命令内容给出更具体的修复建议 */
function diagnose(r: ExecResult): string | undefined {
  const raw = r.error ?? "";
  if (/Vector/i.test(raw)) {
    const cmdStr = r.expanded.join(" ") + JSON.stringify(r.command);
    if (/\/\s*Emag/i.test(cmdStr) || /\/\s*E_y/i.test(cmdStr) || /\/\s*E\b/i.test(cmdStr)) {
      return `矢量创建失败，很可能是分母在某个网格点处为零。请检查：(1) 分母是否加了 +0.001 防除零？(2) Ex/Ey 在电荷位置处是否产生 NaN？`;
    }
    if (/\b(Ex|Ey|E)\s*\(/i.test(cmdStr)) {
      const cmdStr2 = r.expanded.join(" ");
      if (!/\+0\.0*[0-9]/.test(cmdStr2)) {
        return `矢量创建失败，疑似分母缺少 epsilon 防护。请在所有分母含 (x-x0)^2+y^2 的表达式中加 +0.001：((x-x0)^2+y^2+0.001)^1.5`;
      }
    }
    return `矢量创建失败，可能原因：(1) from/to 使用了尚未声明的对象名；(2) 表达式在 Sequence 内产生了 undefined；(3) 分母除零。请用坐标字面量 "(x,y)" 代替对象名，并在所有距离平方分母中加 +0.001`;
  }
  if (/Slider/i.test(raw)) {
    return "滑块创建失败，检查 Slider(min, max, step, ...) 参数是否合法（step>0, min<max）";
  }
  return raw;
}

/** 注册 setAppName 回调（ChatPanel 调用前由 App 注入，供手动 2D↔3D 切换使用） */
let _setAppNameFn: ((name: "classic" | "3d") => void) | null = null;

export function registerAppNameSetter(fn: (name: "classic" | "3d") => void): void {
  _setAppNameFn = fn;
}

/** 手动切换 applet 模式（由 Toolbar 2D/3D 按钮调用） */
export function switchAppletMode(name: "classic" | "3d"): void {
  console.log(`[AiGGB] switching appName to '${name}'`);
  if (_setAppNameFn) {
    _setAppNameFn(name);
    console.log(`[AiGGB] setAppName('${name}') called → GGBCanvas will rebuild`);
  } else {
    console.warn("[AiGGB] setAppName not registered");
  }
}

// ──── 已废弃（手动模式切换后不再需要自动检测）────
// hasUser3DIntent / has3DCommands 已移除。
// 3D 切换现由 Toolbar 按钮控制，prompt 通过 buildSystemPrompt(domain, appMode) 注入模式前缀。

/** 导出当前画布为 base64 编码的 .ggb 文件内容（不含 data: 前缀） */
export function exportGGB(api: GGBAppletApi): Promise<string> {
  return new Promise(resolve => {
    api.getBase64(data => resolve(data));
  });
}

/** 导出 PNG（DataURL） */
export function exportPNG(api: GGBAppletApi): string {
  const base64 = api.getPNGBase64(1, false, 96);
  return `data:image/png;base64,${base64}`;
}
