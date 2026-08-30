/**
 * 图片输入预处理 —— SPEC.md §4D.5
 *
 * validateImageFile: 纯校验（node 可测）
 * fileToDataUrl: 浏览器 only（canvas 缩放 + 白底填充 + JPEG 编码）
 */

export const MAX_IMAGES = 3;
export const MAX_FILE_MB = 10;

/**
 * 校验单个图片文件。返回错误原因字符串，通过返回 null。
 * 纯函数，node 环境可测。
 */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return `不支持的文件类型：${file.type || "未知"}`;
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return `图片超过 ${MAX_FILE_MB}MB 限制`;
  }
  return null;
}

/**
 * 将图片文件转为 data URL（JPEG）。
 * - 等比缩放至最长边 maxDim（默认 1280）
 * - 透明底填白（避免 JPEG 透明区变黑）
 * - quality 默认 0.85
 *
 * 仅浏览器可用（依赖 createImageBitmap / canvas）。
 * HEIC / 解码失败抛 Error。
 */
export async function fileToDataUrl(
  file: File,
  opts?: { maxDim?: number; quality?: number }
): Promise<string> {
  if (typeof document === "undefined") {
    throw new Error("fileToDataUrl 仅在浏览器环境可用");
  }

  const maxDim = opts?.maxDim ?? 1280;
  const quality = opts?.quality ?? 0.85;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("无法解析该图片（可能为 HEIC 或已损坏）");
  }

  const { width, height } = bitmap;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // 白底填充（JPEG 无透明通道）
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}
