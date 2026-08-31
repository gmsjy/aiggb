// 生成多模态手测用物理题图片（平抛运动，含示意图）
// 用法: node tests/.tmp-gen-problem-image.mjs  → 输出 tests/.tmp-problem.png
import { chromium } from "playwright";

const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { margin:0; width:820px; height:640px; background:#fff;
         font-family:"Times New Roman","SimSun",serif; padding:36px 44px; box-sizing:border-box; }
  .title { font-size:22px; font-weight:bold; margin-bottom:14px; }
  .stem  { font-size:19px; line-height:1.9; text-align:justify; }
  .fig   { margin-top:18px; text-align:center; }
  .sub   { font-size:17px; color:#333; margin-top:8px; }
</style></head><body>
  <div class="title">14．（10 分）平抛运动</div>
  <div class="stem">
    如图所示，一小球从距水平地面高 h = 20 m 的平台边缘，以初速度
    v<sub>0</sub> = 15 m/s <b>水平抛出</b>。不计空气阻力，重力加速度
    g 取 10 m/s<sup>2</sup>。求：
    <br>(1) 小球在空中运动的时间 t；
    <br>(2) 小球落地点到平台边缘的水平距离 x（水平射程）；
    <br>(3) 在图中定性画出小球运动的轨迹示意图。
  </div>
  <div class="fig">
    <svg width="560" height="260" viewBox="0 0 560 260">
      <!-- 地面 -->
      <line x1="30" y1="230" x2="540" y2="230" stroke="#333" stroke-width="2.5"/>
      <g stroke="#555" stroke-width="1.2">
        <line x1="60" y1="230" x2="45" y2="245"/><line x1="100" y1="230" x2="85" y2="245"/>
        <line x1="140" y1="230" x2="125" y2="245"/><line x1="180" y1="230" x2="165" y2="245"/>
        <line x1="220" y1="230" x2="205" y2="245"/><line x1="260" y1="230" x2="245" y2="245"/>
        <line x1="300" y1="230" x2="285" y2="245"/><line x1="340" y1="230" x2="325" y2="245"/>
        <line x1="380" y1="230" x2="365" y2="245"/><line x1="420" y1="230" x2="405" y2="245"/>
        <line x1="460" y1="230" x2="445" y2="245"/><line x1="500" y1="230" x2="485" y2="245"/>
      </g>
      <!-- 平台 -->
      <rect x="40" y="70" width="70" height="160" fill="#e8e0d0" stroke="#333" stroke-width="2"/>
      <text x="52" y="60" font-size="17" fill="#111">h = 20 m</text>
      <line x1="118" y1="70" x2="150" y2="70" stroke="#999" stroke-width="1" stroke-dasharray="4 3"/>
      <!-- 抛出点小球 -->
      <circle cx="112" cy="60" r="7" fill="#1e6bd6"/>
      <!-- 初速度箭头 -->
      <line x1="122" y1="60" x2="185" y2="60" stroke="#c62828" stroke-width="3"/>
      <polygon points="185,54 200,60 185,66" fill="#c62828"/>
      <text x="150" y="48" font-size="18" fill="#c62828" font-style="italic">v&#8320;</text>
      <!-- 虚线轨迹（示意） -->
      <path d="M 112 60 Q 260 165 400 228" fill="none" stroke="#888" stroke-width="2" stroke-dasharray="7 5"/>
      <!-- 落点 -->
      <circle cx="402" cy="229" r="5" fill="#1e6bd6"/>
      <text x="388" y="252" font-size="16" fill="#111">落地点</text>
      <text x="240" y="130" font-size="16" fill="#666" font-style="italic">轨迹（待画）</text>
    </svg>
  </div>
  <div class="sub">（第 14 题图）</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 820, height: 640 }, deviceScaleFactor: 1.5 });
await page.setContent(html);
await page.screenshot({ path: "tests/.tmp-problem.png", fullPage: false });
await browser.close();
console.log("OK → tests/.tmp-problem.png");
