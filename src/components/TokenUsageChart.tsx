/**
 * Token 用量统计图 —— 设置面板内嵌，SVG 手绘（无图表库依赖）。
 *
 * 两个小图（small multiples，各自单一 Y 轴）：
 *   1. 堆叠柱状图：最近 N 轮对话的 token 消耗（prompt 蓝 / completion 绿分段）
 *   2. 累计折线图：total token 累计趋势
 *
 * 规范：细柱 + 2px 段间间隙 + 弱化网格/轴 + 原生 <title> hover tooltip + legend。
 */
import type { TokenRecord } from "../store/useAppStore";
import { fmtTokens } from "../lib/format";

const MAX_BARS = 30; // 最多展示最近 N 轮

export function TokenUsageChart({ history }: { history: TokenRecord[] }) {
  const data = history.slice(-MAX_BARS);
  if (data.length === 0) {
    return (
      <div className="token-chart-empty">
        暂无用量数据。完成一次对话后这里会显示每次对话的 token 消耗统计。
      </div>
    );
  }

  const totals = data.map(d => d.prompt + d.completion);
  const maxTotal = Math.max(...totals, 1);
  const cumulative: number[] = [];
  let acc = 0;
  for (const t of totals) {
    acc += t;
    cumulative.push(acc);
  }
  const maxCum = Math.max(...cumulative, 1);

  const n = data.length;

  // 柱状图几何
  const barW = 320;
  const barH = 130;
  const barPadL = 34;
  const barPadR = 6;
  const barPadT = 8;
  const barPadB = 18;
  const plotW = barW - barPadL - barPadR;
  const plotH = barH - barPadT - barPadB;
  const slot = plotW / n;
  const barWidth = Math.max(3, slot * 0.6);

  // 折线图几何
  const lineW = 320;
  const lineH = 64;
  const linePadL = 34;
  const linePadR = 6;
  const linePadT = 6;
  const linePadB = 14;
  const linePlotW = lineW - linePadL - linePadR;
  const linePlotH = lineH - linePadT - linePadB;

  const xForBar = (i: number) => barPadL + slot * i + (slot - barWidth) / 2;
  const xForLine = (i: number) =>
    n === 1 ? linePadL + linePlotW / 2 : linePadL + (linePlotW * i) / (n - 1);

  const yMaxLabel = fmtTokens(maxTotal);
  const yMaxCumLabel = fmtTokens(maxCum);

  return (
    <div className="token-chart">
      {/* ── 图 1：堆叠柱状图 ── */}
      <div className="token-chart-block">
        <div className="token-chart-title">每次对话 token 消耗（最近 {n} 轮）</div>
        <svg viewBox={`0 0 ${barW} ${barH}`} role="img" aria-label="每次对话 token 消耗柱状图">
          {/* Y 轴参考线 + 刻度 */}
          <line x1={barPadL} y1={barPadT} x2={barPadL} y2={barPadT + plotH} stroke="var(--border)" strokeWidth="1" />
          <line x1={barPadL} y1={barPadT + plotH} x2={barW - barPadR} y2={barPadT + plotH} stroke="var(--border)" strokeWidth="1" />
          <text x={barPadL - 4} y={barPadT + 3} textAnchor="end" fontSize="9" fill="var(--fg-3)">{yMaxLabel}</text>
          <text x={barPadL - 4} y={barPadT + plotH + 3} textAnchor="end" fontSize="9" fill="var(--fg-3)">0</text>

          {data.map((d, i) => {
            const total = d.prompt + d.completion;
            const totalH = (total / maxTotal) * plotH;
            const promptH = (d.prompt / maxTotal) * plotH;
            const x = xForBar(i);
            const yTop = barPadT + plotH - totalH;
            const yPromptTop = yTop + (totalH - promptH);
            return (
              <g key={i}>
                {/* prompt 段（底部） */}
                <rect
                  x={x} y={yPromptTop + 1} width={barWidth} height={Math.max(0, promptH - 1)}
                  rx={1.5} fill="var(--accent)"
                >
                  <title>{`第 ${i + 1} 轮\n输入 prompt: ${fmtTokens(d.prompt)}\n输出 completion: ${fmtTokens(d.completion)}\n合计: ${fmtTokens(total)}`}</title>
                </rect>
                {/* completion 段（顶部，留 2px 间隙） */}
                <rect
                  x={x} y={yTop} width={barWidth} height={Math.max(0, totalH - promptH - 1)}
                  rx={1.5} fill="var(--ok)"
                >
                  <title>{`第 ${i + 1} 轮\n输入 prompt: ${fmtTokens(d.prompt)}\n输出 completion: ${fmtTokens(d.completion)}\n合计: ${fmtTokens(total)}`}</title>
                </rect>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── 图 2：累计折线图 ── */}
      <div className="token-chart-block">
        <div className="token-chart-title">累计 token 趋势</div>
        <svg viewBox={`0 0 ${lineW} ${lineH}`} role="img" aria-label="累计 token 趋势折线图">
          <line x1={linePadL} y1={linePadT} x2={linePadL} y2={linePadT + linePlotH} stroke="var(--border)" strokeWidth="1" />
          <line x1={linePadL} y1={linePadT + linePlotH} x2={lineW - linePadR} y2={linePadT + linePlotH} stroke="var(--border)" strokeWidth="1" />
          <text x={linePadL - 4} y={linePadT + 3} textAnchor="end" fontSize="9" fill="var(--fg-3)">{yMaxCumLabel}</text>
          <text x={linePadL - 4} y={linePadT + linePlotH + 3} textAnchor="end" fontSize="9" fill="var(--fg-3)">0</text>

          <polyline
            points={cumulative.map((c, i) => `${xForLine(i)},${linePadT + linePlotH - (c / maxCum) * linePlotH}`).join(" ")}
            fill="none" stroke="var(--warn)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
          />
          {cumulative.map((c, i) => (
            <circle
              key={i}
              cx={xForLine(i)} cy={linePadT + linePlotH - (c / maxCum) * linePlotH}
              r={2.5} fill="var(--warn)"
            >
              <title>{`累计到第 ${i + 1} 轮：${fmtTokens(c)} token`}</title>
            </circle>
          ))}
        </svg>
      </div>

      {/* ── legend ── */}
      <div className="token-chart-legend">
        <span className="legend-item"><i className="legend-swatch" style={{ background: "var(--accent)" }} />输入 prompt</span>
        <span className="legend-item"><i className="legend-swatch" style={{ background: "var(--ok)" }} />输出 completion</span>
        <span className="legend-item"><i className="legend-swatch legend-line" />累计 total</span>
      </div>
    </div>
  );
}
