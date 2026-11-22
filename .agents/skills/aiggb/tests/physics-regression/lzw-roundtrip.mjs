/** LZW 往返诊断：标准 GIF LZW 解码器 解码 encodeGIF 输出 → 对照期望索引流 */
import { encodeGIF } from "../../src/gif.ts";

const W = 4, H = 2;
const frame = new Uint8Array(W * H * 4);
const colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 255]];
for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
  const c = colors[(x + y) % 4]; const p = (y * W + x) * 4;
  frame[p] = c[0]; frame[p + 1] = c[1]; frame[p + 2] = c[2]; frame[p + 3] = 255;
}
const gif = encodeGIF([frame], W, H, 100);

// ── 解析 GIF 结构 ──
let off = 6;
const w = gif.readUInt16LE(off); off += 2;
const h = gif.readUInt16LE(off); off += 2;
const packed = gif[off]; off += 3;
const gctSize = 2 ** ((packed & 7) + 1);
console.log(`LSD: ${w}x${h} packed=0x${packed.toString(16)} GCT=${gctSize}`);
const gct = [];
for (let i = 0; i < gctSize; i++) gct.push([gif[off], gif[off + 1], gif[off + 2]]), off += 3;
console.log("GCT:", JSON.stringify(gct));

// 找图像数据
while (off < gif.length) {
  const b = gif[off];
  if (b === 0x21) { // extension
    const label = gif[off + 1]; off += 2;
    while (gif[off] !== 0) off += gif[off] + 1;
    off++;
    console.log(`ext 0x${label.toString(16)}`);
  } else if (b === 0x2c) { // image
    off += 9; // sep + descriptor 8
    const minCode = gif[off]; off++;
    // LZW 数据块拼接
    const data = [];
    while (gif[off] !== 0) { const n = gif[off]; data.push(...gif.subarray(off + 1, off + 1 + n)); off += n + 1; }
    off++;
    console.log(`image: minCodeSize=${minCode} dataBytes=${data.length}`);

    // ── LZW 解码 ──
    const clear = 1 << minCode, eoi = clear + 1;
    let size = minCode + 1, next = eoi + 1;
    let bitPos = 0, bitBuf = 0;
    const readCode = () => {
      while (bitCnt() < size) { bitBuf |= (data[bytePtr()] ?? 0) << bitCnt; advance(); }
      const code = bitBuf & ((1 << size) - 1);
      bitBuf >>>= size;
      return code;
    };
    let byteIdx = 0, bitInByte = 0;
    const bytePtr = () => byteIdx;
    const advance = () => { bitInByte++; if (bitInByte === 8) { bitInByte = 0; byteIdx++; } };
    const bitCnt = () => bitInByte; // 简化：bitBuf 位计数 —— 需要真实实现，改用标准位读

    // ── 改用标准位读器 ──
    let pos = 0;
    const readBits = (n) => {
      let v = 0;
      for (let i = 0; i < n; i++) {
        const byte = data[Math.floor(pos / 8)] ?? 0;
        v |= ((byte >> (pos % 8)) & 1) << i;
        pos++;
      }
      return v;
    };
    const dict = new Map();
    const out = [];
    let old = null;
    let first = true;
    for (;;) {
      const code = readBits(size);
      if (code === clear) { dict.clear(); size = minCode + 1; next = eoi + 1; old = null; first = false; continue; }
      if (code === eoi) break;
      let entry;
      if (code < clear) entry = [code];
      else if (dict.has(code)) entry = dict.get(code);
      else if (old !== null) entry = [...dict.get(old) ?? [], dict.get(old)?.[0] ?? old];
      else throw new Error("bad code " + code);
      out.push(...entry);
      if (old !== null) dict.set(next++, [...(dict.get(old) ?? [old]), entry[0]]);
      old = code;
      if (next >= (1 << size) && size < 12) size++;
      if (out.length >= w * h) break;
    }
    console.log("解码索引流:", out.join(","));
    console.log("调色板映射:", out.map(i => gct[i]?.join(",")).join(" | "));
    break;
  } else if (b === 0x3b) { console.log("trailer"); break; }
  else off++;
}
console.log("期望索引流: 2,1,0,3,1,0,3,2（palette [蓝,绿,红,白] 顺序下 frame 红,绿,蓝,白,绿,蓝,白,红）");
