/** GIF 解码验证：浏览器解码器加载 → 尺寸 + 首帧像素抽样 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const gifPath = process.argv[2] ?? "figures/P1.gif";
const buf = readFileSync(gifPath);
const b64 = buf.toString("base64");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const r = await page.evaluate(async (b) => {
  const bin = atob(b);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: "image/gif" }));
  const img = new Image();
  await new Promise((ok, err) => { img.onload = ok; img.onerror = () => err(new Error("GIF 解码失败")); img.src = url; });
  const cv = document.createElement("canvas");
  cv.width = img.naturalWidth; cv.height = img.naturalHeight;
  const ctx = cv.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(cv.width >> 1, cv.height >> 1, 1, 1).data;
  // 数帧：扫 image descriptor `,` 后跟 4 字节 0 宽高起始（简化统计：GCE 扩展块 21 F9 数）
  let frames = 0;
  for (let i = 0; i < bytes.length - 1; i++) {
    if (bytes[i] === 0x21 && bytes[i + 1] === 0xf9) frames++;
  }
  return { w: img.naturalWidth, h: img.naturalHeight, centerPixel: [d[0], d[1], d[2]], gceBlocks: frames };
}, b64).catch(e => ({ decodeError: String(e) }));
console.log(JSON.stringify(r));
await browser.close();
