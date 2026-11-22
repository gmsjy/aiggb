/** GIF 编码单元诊断：4 色小图 → 编码 → 浏览器解码 → 逐像素对比 */
import { chromium } from "playwright";
import { encodeGIF } from "../../src/gif.ts";
import { readFileSync } from "node:fs";

// 4×2 测试图：四个已知色块
const W = 4, H = 2;
const frame = new Uint8Array(W * H * 4);
const colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 255]];
for (let x = 0; x < W; x++) {
  for (let y = 0; y < H; y++) {
    const c = colors[(x + y) % 4];
    const p = (y * W + x) * 4;
    frame[p] = c[0]; frame[p + 1] = c[1]; frame[p + 2] = c[2]; frame[p + 3] = 255;
  }
}
const gif = encodeGIF([frame], W, H, 100);
console.log("GIF bytes:", gif.length, "| signature:", gif.subarray(0, 6).toString());
console.log("hex head:", gif.subarray(0, 40).toString("hex"));

// 浏览器解码对比
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const decoded = await page.evaluate(async (b64) => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const img = new Image();
  await new Promise((ok, err) => { img.onload = ok; img.onerror = () => err(new Error("decode fail")); img.src = URL.createObjectURL(new Blob([bytes], { type: "image/gif" })); });
  const cv = document.createElement("canvas");
  cv.width = img.naturalWidth; cv.height = img.naturalHeight;
  const ctx = cv.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
  const out = [];
  for (let p = 0; p < d.length; p += 4) out.push([d[p], d[p + 1], d[p + 2]]);
  return out;
}, gif.toString("base64"));
await browser.close();

console.log("解码结果 vs 期望:");
let pass = true;
for (let x = 0; x < W; x++) {
  for (let y = 0; y < H; y++) {
    const expect = colors[(x + y) % 4];
    const got = decoded[y * W + x];
    const ok = Math.abs(got[0] - expect[0]) <= 8 && Math.abs(got[1] - expect[1]) <= 8 && Math.abs(got[2] - expect[2]) <= 8;
    if (!ok) pass = false;
    console.log(`  (${x},${y}) expect ${expect} got ${got} ${ok ? "✓" : "✗"}`);
  }
}
console.log(pass ? "往返一致 ✓" : "往返不一致 ✗ —— 编码器有 bug");
