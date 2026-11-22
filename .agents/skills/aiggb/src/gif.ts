/**
 * [aiggb skill] GIF 动图编码 —— RGBA 帧序列 → GIF89a
 *
 * 基于 gifenc（业界标准 JS 编码器，中位切分量化 + LZW）。
 * 打包进 aiggb.mjs，运行时零额外依赖。
 * 自写编码器已废弃（LZW 升位约定与浏览器解码器错位一个码，见 2026-11 测试记录）。
 */
import { GIFEncoder, quantize, applyPalette } from "gifenc";

/**
 * RGBA 帧序列 → GIF 动图 Buffer
 * @param frames RGBA 帧数组（等宽高，来自宿主 canvas getImageData）
 * @param delayMs 每帧显示时长（毫秒）
 */
export function encodeGIF(frames: Uint8Array[], width: number, height: number, delayMs: number): Buffer {
  if (frames.length === 0) throw new Error("encodeGIF: 无帧");
  const gif = GIFEncoder();

  // 全局调色板：首帧 + 中段帧 + 末帧合并量化（覆盖动画过程中新出现的颜色，如轨迹）
  const mid = frames[Math.floor(frames.length / 2)];
  const last = frames[frames.length - 1];
  const sample = new Uint8Array(frames[0].length + mid.length + last.length);
  sample.set(frames[0], 0);
  sample.set(mid, frames[0].length);
  sample.set(last, frames[0].length + mid.length);
  const palette = quantize(sample, 256, { format: "rgba4444" });

  frames.forEach((f, i) => {
    const index = applyPalette(f, palette, "rgba4444");
    gif.writeFrame(index, width, height, {
      palette: i === 0 ? palette : undefined, // 首帧写全局色表，后续帧复用
      delay: delayMs,
      repeat: 0, // 无限循环
      first: i === 0
    });
  });
  gif.finish();
  return Buffer.from(gif.bytes());
}
