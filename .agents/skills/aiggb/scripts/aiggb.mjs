#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/gifenc/dist/gifenc.js
var require_gifenc = __commonJS({
  "node_modules/gifenc/dist/gifenc.js"(exports) {
    var __defProp2 = Object.defineProperty;
    var __markAsModule = (target) => __defProp2(target, "__esModule", { value: true });
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    __markAsModule(exports);
    __export2(exports, {
      GIFEncoder: () => GIFEncoder2,
      applyPalette: () => applyPalette2,
      default: () => src_default,
      nearestColor: () => nearestColor,
      nearestColorIndex: () => nearestColorIndex,
      nearestColorIndexWithDistance: () => nearestColorIndexWithDistance,
      prequantize: () => prequantize,
      quantize: () => quantize2,
      snapColorsToPalette: () => snapColorsToPalette
    });
    var constants_default = {
      signature: "GIF",
      version: "89a",
      trailer: 59,
      extensionIntroducer: 33,
      applicationExtensionLabel: 255,
      graphicControlExtensionLabel: 249,
      imageSeparator: 44,
      signatureSize: 3,
      versionSize: 3,
      globalColorTableFlagMask: 128,
      colorResolutionMask: 112,
      sortFlagMask: 8,
      globalColorTableSizeMask: 7,
      applicationIdentifierSize: 8,
      applicationAuthCodeSize: 3,
      disposalMethodMask: 28,
      userInputFlagMask: 2,
      transparentColorFlagMask: 1,
      localColorTableFlagMask: 128,
      interlaceFlagMask: 64,
      idSortFlagMask: 32,
      localColorTableSizeMask: 7
    };
    function createStream(initialCapacity = 256) {
      let cursor = 0;
      let contents = new Uint8Array(initialCapacity);
      return {
        get buffer() {
          return contents.buffer;
        },
        reset() {
          cursor = 0;
        },
        bytesView() {
          return contents.subarray(0, cursor);
        },
        bytes() {
          return contents.slice(0, cursor);
        },
        writeByte(byte) {
          expand(cursor + 1);
          contents[cursor] = byte;
          cursor++;
        },
        writeBytes(data, offset = 0, byteLength = data.length) {
          expand(cursor + byteLength);
          for (let i = 0; i < byteLength; i++) {
            contents[cursor++] = data[i + offset];
          }
        },
        writeBytesView(data, offset = 0, byteLength = data.byteLength) {
          expand(cursor + byteLength);
          contents.set(data.subarray(offset, offset + byteLength), cursor);
          cursor += byteLength;
        }
      };
      function expand(newCapacity) {
        var prevCapacity = contents.length;
        if (prevCapacity >= newCapacity)
          return;
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
        if (prevCapacity != 0)
          newCapacity = Math.max(newCapacity, 256);
        const oldContents = contents;
        contents = new Uint8Array(newCapacity);
        if (cursor > 0)
          contents.set(oldContents.subarray(0, cursor), 0);
      }
    }
    var BITS = 12;
    var DEFAULT_HSIZE = 5003;
    var MASKS = [
      0,
      1,
      3,
      7,
      15,
      31,
      63,
      127,
      255,
      511,
      1023,
      2047,
      4095,
      8191,
      16383,
      32767,
      65535
    ];
    function lzwEncode(width, height, pixels, colorDepth, outStream = createStream(512), accum = new Uint8Array(256), htab = new Int32Array(DEFAULT_HSIZE), codetab = new Int32Array(DEFAULT_HSIZE)) {
      const hsize = htab.length;
      const initCodeSize = Math.max(2, colorDepth);
      accum.fill(0);
      codetab.fill(0);
      htab.fill(-1);
      let cur_accum = 0;
      let cur_bits = 0;
      const init_bits = initCodeSize + 1;
      const g_init_bits = init_bits;
      let clear_flg = false;
      let n_bits = g_init_bits;
      let maxcode = (1 << n_bits) - 1;
      const ClearCode = 1 << init_bits - 1;
      const EOFCode = ClearCode + 1;
      let free_ent = ClearCode + 2;
      let a_count = 0;
      let ent = pixels[0];
      let hshift = 0;
      for (let fcode = hsize; fcode < 65536; fcode *= 2) {
        ++hshift;
      }
      hshift = 8 - hshift;
      outStream.writeByte(initCodeSize);
      output(ClearCode);
      const length = pixels.length;
      for (let idx = 1; idx < length; idx++) {
        next_block: {
          const c = pixels[idx];
          const fcode = (c << BITS) + ent;
          let i = c << hshift ^ ent;
          if (htab[i] === fcode) {
            ent = codetab[i];
            break next_block;
          }
          const disp = i === 0 ? 1 : hsize - i;
          while (htab[i] >= 0) {
            i -= disp;
            if (i < 0)
              i += hsize;
            if (htab[i] === fcode) {
              ent = codetab[i];
              break next_block;
            }
          }
          output(ent);
          ent = c;
          if (free_ent < 1 << BITS) {
            codetab[i] = free_ent++;
            htab[i] = fcode;
          } else {
            htab.fill(-1);
            free_ent = ClearCode + 2;
            clear_flg = true;
            output(ClearCode);
          }
        }
      }
      output(ent);
      output(EOFCode);
      outStream.writeByte(0);
      return outStream.bytesView();
      function output(code) {
        cur_accum &= MASKS[cur_bits];
        if (cur_bits > 0)
          cur_accum |= code << cur_bits;
        else
          cur_accum = code;
        cur_bits += n_bits;
        while (cur_bits >= 8) {
          accum[a_count++] = cur_accum & 255;
          if (a_count >= 254) {
            outStream.writeByte(a_count);
            outStream.writeBytesView(accum, 0, a_count);
            a_count = 0;
          }
          cur_accum >>= 8;
          cur_bits -= 8;
        }
        if (free_ent > maxcode || clear_flg) {
          if (clear_flg) {
            n_bits = g_init_bits;
            maxcode = (1 << n_bits) - 1;
            clear_flg = false;
          } else {
            ++n_bits;
            maxcode = n_bits === BITS ? 1 << n_bits : (1 << n_bits) - 1;
          }
        }
        if (code == EOFCode) {
          while (cur_bits > 0) {
            accum[a_count++] = cur_accum & 255;
            if (a_count >= 254) {
              outStream.writeByte(a_count);
              outStream.writeBytesView(accum, 0, a_count);
              a_count = 0;
            }
            cur_accum >>= 8;
            cur_bits -= 8;
          }
          if (a_count > 0) {
            outStream.writeByte(a_count);
            outStream.writeBytesView(accum, 0, a_count);
            a_count = 0;
          }
        }
      }
    }
    var lzwEncode_default = lzwEncode;
    function rgb888_to_rgb565(r, g, b) {
      return r << 8 & 63488 | g << 2 & 992 | b >> 3;
    }
    function rgba8888_to_rgba4444(r, g, b, a) {
      return r >> 4 | g & 240 | (b & 240) << 4 | (a & 240) << 8;
    }
    function rgb888_to_rgb444(r, g, b) {
      return r >> 4 << 8 | g & 240 | b >> 4;
    }
    function clamp(value, min, max) {
      return value < min ? min : value > max ? max : value;
    }
    function sqr(value) {
      return value * value;
    }
    function find_nn(bins, idx, hasAlpha) {
      var nn = 0;
      var err = 1e100;
      const bin1 = bins[idx];
      const n1 = bin1.cnt;
      const wa = bin1.ac;
      const wr = bin1.rc;
      const wg = bin1.gc;
      const wb = bin1.bc;
      for (var i = bin1.fw; i != 0; i = bins[i].fw) {
        const bin = bins[i];
        const n2 = bin.cnt;
        const nerr2 = n1 * n2 / (n1 + n2);
        if (nerr2 >= err)
          continue;
        var nerr = 0;
        if (hasAlpha) {
          nerr += nerr2 * sqr(bin.ac - wa);
          if (nerr >= err)
            continue;
        }
        nerr += nerr2 * sqr(bin.rc - wr);
        if (nerr >= err)
          continue;
        nerr += nerr2 * sqr(bin.gc - wg);
        if (nerr >= err)
          continue;
        nerr += nerr2 * sqr(bin.bc - wb);
        if (nerr >= err)
          continue;
        err = nerr;
        nn = i;
      }
      bin1.err = err;
      bin1.nn = nn;
    }
    function create_bin() {
      return {
        ac: 0,
        rc: 0,
        gc: 0,
        bc: 0,
        cnt: 0,
        nn: 0,
        fw: 0,
        bk: 0,
        tm: 0,
        mtm: 0,
        err: 0
      };
    }
    function create_bin_list(data, format) {
      const bincount = format === "rgb444" ? 4096 : 65536;
      const bins = new Array(bincount);
      const size = data.length;
      if (format === "rgba4444") {
        for (let i = 0; i < size; ++i) {
          const color = data[i];
          const a = color >> 24 & 255;
          const b = color >> 16 & 255;
          const g = color >> 8 & 255;
          const r = color & 255;
          const index = rgba8888_to_rgba4444(r, g, b, a);
          let bin = index in bins ? bins[index] : bins[index] = create_bin();
          bin.rc += r;
          bin.gc += g;
          bin.bc += b;
          bin.ac += a;
          bin.cnt++;
        }
      } else if (format === "rgb444") {
        for (let i = 0; i < size; ++i) {
          const color = data[i];
          const b = color >> 16 & 255;
          const g = color >> 8 & 255;
          const r = color & 255;
          const index = rgb888_to_rgb444(r, g, b);
          let bin = index in bins ? bins[index] : bins[index] = create_bin();
          bin.rc += r;
          bin.gc += g;
          bin.bc += b;
          bin.cnt++;
        }
      } else {
        for (let i = 0; i < size; ++i) {
          const color = data[i];
          const b = color >> 16 & 255;
          const g = color >> 8 & 255;
          const r = color & 255;
          const index = rgb888_to_rgb565(r, g, b);
          let bin = index in bins ? bins[index] : bins[index] = create_bin();
          bin.rc += r;
          bin.gc += g;
          bin.bc += b;
          bin.cnt++;
        }
      }
      return bins;
    }
    function quantize2(rgba, maxColors, opts = {}) {
      const {
        format = "rgb565",
        clearAlpha = true,
        clearAlphaColor = 0,
        clearAlphaThreshold = 0,
        oneBitAlpha = false
      } = opts;
      if (!rgba || !rgba.buffer) {
        throw new Error("quantize() expected RGBA Uint8Array data");
      }
      if (!(rgba instanceof Uint8Array) && !(rgba instanceof Uint8ClampedArray)) {
        throw new Error("quantize() expected RGBA Uint8Array data");
      }
      const data = new Uint32Array(rgba.buffer);
      let useSqrt = opts.useSqrt !== false;
      const hasAlpha = format === "rgba4444";
      const bins = create_bin_list(data, format);
      const bincount = bins.length;
      const bincountMinusOne = bincount - 1;
      const heap = new Uint32Array(bincount + 1);
      var maxbins = 0;
      for (var i = 0; i < bincount; ++i) {
        const bin = bins[i];
        if (bin != null) {
          var d = 1 / bin.cnt;
          if (hasAlpha)
            bin.ac *= d;
          bin.rc *= d;
          bin.gc *= d;
          bin.bc *= d;
          bins[maxbins++] = bin;
        }
      }
      if (sqr(maxColors) / maxbins < 0.022) {
        useSqrt = false;
      }
      var i = 0;
      for (; i < maxbins - 1; ++i) {
        bins[i].fw = i + 1;
        bins[i + 1].bk = i;
        if (useSqrt)
          bins[i].cnt = Math.sqrt(bins[i].cnt);
      }
      if (useSqrt)
        bins[i].cnt = Math.sqrt(bins[i].cnt);
      var h, l, l2;
      for (i = 0; i < maxbins; ++i) {
        find_nn(bins, i, false);
        var err = bins[i].err;
        for (l = ++heap[0]; l > 1; l = l2) {
          l2 = l >> 1;
          if (bins[h = heap[l2]].err <= err)
            break;
          heap[l] = h;
        }
        heap[l] = i;
      }
      var extbins = maxbins - maxColors;
      for (i = 0; i < extbins; ) {
        var tb;
        for (; ; ) {
          var b1 = heap[1];
          tb = bins[b1];
          if (tb.tm >= tb.mtm && bins[tb.nn].mtm <= tb.tm)
            break;
          if (tb.mtm == bincountMinusOne)
            b1 = heap[1] = heap[heap[0]--];
          else {
            find_nn(bins, b1, false);
            tb.tm = i;
          }
          var err = bins[b1].err;
          for (l = 1; (l2 = l + l) <= heap[0]; l = l2) {
            if (l2 < heap[0] && bins[heap[l2]].err > bins[heap[l2 + 1]].err)
              l2++;
            if (err <= bins[h = heap[l2]].err)
              break;
            heap[l] = h;
          }
          heap[l] = b1;
        }
        var nb = bins[tb.nn];
        var n1 = tb.cnt;
        var n2 = nb.cnt;
        var d = 1 / (n1 + n2);
        if (hasAlpha)
          tb.ac = d * (n1 * tb.ac + n2 * nb.ac);
        tb.rc = d * (n1 * tb.rc + n2 * nb.rc);
        tb.gc = d * (n1 * tb.gc + n2 * nb.gc);
        tb.bc = d * (n1 * tb.bc + n2 * nb.bc);
        tb.cnt += nb.cnt;
        tb.mtm = ++i;
        bins[nb.bk].fw = nb.fw;
        bins[nb.fw].bk = nb.bk;
        nb.mtm = bincountMinusOne;
      }
      let palette = [];
      var k = 0;
      for (i = 0; ; ++k) {
        let r = clamp(Math.round(bins[i].rc), 0, 255);
        let g = clamp(Math.round(bins[i].gc), 0, 255);
        let b = clamp(Math.round(bins[i].bc), 0, 255);
        let a = 255;
        if (hasAlpha) {
          a = clamp(Math.round(bins[i].ac), 0, 255);
          if (oneBitAlpha) {
            const threshold = typeof oneBitAlpha === "number" ? oneBitAlpha : 127;
            a = a <= threshold ? 0 : 255;
          }
          if (clearAlpha && a <= clearAlphaThreshold) {
            r = g = b = clearAlphaColor;
            a = 0;
          }
        }
        const color = hasAlpha ? [r, g, b, a] : [r, g, b];
        const exists = existsInPalette(palette, color);
        if (!exists)
          palette.push(color);
        if ((i = bins[i].fw) == 0)
          break;
      }
      return palette;
    }
    function existsInPalette(palette, color) {
      for (let i = 0; i < palette.length; i++) {
        const p = palette[i];
        let matchesRGB = p[0] === color[0] && p[1] === color[1] && p[2] === color[2];
        let matchesAlpha = p.length >= 4 && color.length >= 4 ? p[3] === color[3] : true;
        if (matchesRGB && matchesAlpha)
          return true;
      }
      return false;
    }
    function euclideanDistanceSquared(a, b) {
      var sum = 0;
      var n;
      for (n = 0; n < a.length; n++) {
        const dx = a[n] - b[n];
        sum += dx * dx;
      }
      return sum;
    }
    function roundStep(byte, step) {
      return step > 1 ? Math.round(byte / step) * step : byte;
    }
    function prequantize(rgba, { roundRGB = 5, roundAlpha = 10, oneBitAlpha = null } = {}) {
      const data = new Uint32Array(rgba.buffer);
      for (let i = 0; i < data.length; i++) {
        const color = data[i];
        let a = color >> 24 & 255;
        let b = color >> 16 & 255;
        let g = color >> 8 & 255;
        let r = color & 255;
        a = roundStep(a, roundAlpha);
        if (oneBitAlpha) {
          const threshold = typeof oneBitAlpha === "number" ? oneBitAlpha : 127;
          a = a <= threshold ? 0 : 255;
        }
        r = roundStep(r, roundRGB);
        g = roundStep(g, roundRGB);
        b = roundStep(b, roundRGB);
        data[i] = a << 24 | b << 16 | g << 8 | r << 0;
      }
    }
    function applyPalette2(rgba, palette, format = "rgb565") {
      if (!rgba || !rgba.buffer) {
        throw new Error("quantize() expected RGBA Uint8Array data");
      }
      if (!(rgba instanceof Uint8Array) && !(rgba instanceof Uint8ClampedArray)) {
        throw new Error("quantize() expected RGBA Uint8Array data");
      }
      if (palette.length > 256) {
        throw new Error("applyPalette() only works with 256 colors or less");
      }
      const data = new Uint32Array(rgba.buffer);
      const length = data.length;
      const bincount = format === "rgb444" ? 4096 : 65536;
      const index = new Uint8Array(length);
      const cache = new Array(bincount);
      const hasAlpha = format === "rgba4444";
      if (format === "rgba4444") {
        for (let i = 0; i < length; i++) {
          const color = data[i];
          const a = color >> 24 & 255;
          const b = color >> 16 & 255;
          const g = color >> 8 & 255;
          const r = color & 255;
          const key = rgba8888_to_rgba4444(r, g, b, a);
          const idx = key in cache ? cache[key] : cache[key] = nearestColorIndexRGBA(r, g, b, a, palette);
          index[i] = idx;
        }
      } else {
        const rgb888_to_key = format === "rgb444" ? rgb888_to_rgb444 : rgb888_to_rgb565;
        for (let i = 0; i < length; i++) {
          const color = data[i];
          const b = color >> 16 & 255;
          const g = color >> 8 & 255;
          const r = color & 255;
          const key = rgb888_to_key(r, g, b);
          const idx = key in cache ? cache[key] : cache[key] = nearestColorIndexRGB(r, g, b, palette);
          index[i] = idx;
        }
      }
      return index;
    }
    function nearestColorIndexRGBA(r, g, b, a, palette) {
      let k = 0;
      let mindist = 1e100;
      for (let i = 0; i < palette.length; i++) {
        const px2 = palette[i];
        const a2 = px2[3];
        let curdist = sqr2(a2 - a);
        if (curdist > mindist)
          continue;
        const r2 = px2[0];
        curdist += sqr2(r2 - r);
        if (curdist > mindist)
          continue;
        const g2 = px2[1];
        curdist += sqr2(g2 - g);
        if (curdist > mindist)
          continue;
        const b2 = px2[2];
        curdist += sqr2(b2 - b);
        if (curdist > mindist)
          continue;
        mindist = curdist;
        k = i;
      }
      return k;
    }
    function nearestColorIndexRGB(r, g, b, palette) {
      let k = 0;
      let mindist = 1e100;
      for (let i = 0; i < palette.length; i++) {
        const px2 = palette[i];
        const r2 = px2[0];
        let curdist = sqr2(r2 - r);
        if (curdist > mindist)
          continue;
        const g2 = px2[1];
        curdist += sqr2(g2 - g);
        if (curdist > mindist)
          continue;
        const b2 = px2[2];
        curdist += sqr2(b2 - b);
        if (curdist > mindist)
          continue;
        mindist = curdist;
        k = i;
      }
      return k;
    }
    function snapColorsToPalette(palette, knownColors, threshold = 5) {
      if (!palette.length || !knownColors.length)
        return;
      const paletteRGB = palette.map((p) => p.slice(0, 3));
      const thresholdSq = threshold * threshold;
      const dim = palette[0].length;
      for (let i = 0; i < knownColors.length; i++) {
        let color = knownColors[i];
        if (color.length < dim) {
          color = [color[0], color[1], color[2], 255];
        } else if (color.length > dim) {
          color = color.slice(0, 3);
        } else {
          color = color.slice();
        }
        const r = nearestColorIndexWithDistance(paletteRGB, color.slice(0, 3), euclideanDistanceSquared);
        const idx = r[0];
        const distanceSq = r[1];
        if (distanceSq > 0 && distanceSq <= thresholdSq) {
          palette[idx] = color;
        }
      }
    }
    function sqr2(a) {
      return a * a;
    }
    function nearestColorIndex(colors, pixel, distanceFn = euclideanDistanceSquared) {
      let minDist = Infinity;
      let minDistIndex = -1;
      for (let j = 0; j < colors.length; j++) {
        const paletteColor = colors[j];
        const dist = distanceFn(pixel, paletteColor);
        if (dist < minDist) {
          minDist = dist;
          minDistIndex = j;
        }
      }
      return minDistIndex;
    }
    function nearestColorIndexWithDistance(colors, pixel, distanceFn = euclideanDistanceSquared) {
      let minDist = Infinity;
      let minDistIndex = -1;
      for (let j = 0; j < colors.length; j++) {
        const paletteColor = colors[j];
        const dist = distanceFn(pixel, paletteColor);
        if (dist < minDist) {
          minDist = dist;
          minDistIndex = j;
        }
      }
      return [minDistIndex, minDist];
    }
    function nearestColor(colors, pixel, distanceFn = euclideanDistanceSquared) {
      return colors[nearestColorIndex(colors, pixel, distanceFn)];
    }
    function GIFEncoder2(opt = {}) {
      const { initialCapacity = 4096, auto = true } = opt;
      const stream = createStream(initialCapacity);
      const HSIZE = 5003;
      const accum = new Uint8Array(256);
      const htab = new Int32Array(HSIZE);
      const codetab = new Int32Array(HSIZE);
      let hasInit = false;
      return {
        reset() {
          stream.reset();
          hasInit = false;
        },
        finish() {
          stream.writeByte(constants_default.trailer);
        },
        bytes() {
          return stream.bytes();
        },
        bytesView() {
          return stream.bytesView();
        },
        get buffer() {
          return stream.buffer;
        },
        get stream() {
          return stream;
        },
        writeHeader,
        writeFrame(index, width, height, opts = {}) {
          const {
            transparent = false,
            transparentIndex = 0,
            delay = 0,
            palette = null,
            repeat = 0,
            colorDepth = 8,
            dispose = -1
          } = opts;
          let first = false;
          if (auto) {
            if (!hasInit) {
              first = true;
              writeHeader();
              hasInit = true;
            }
          } else {
            first = Boolean(opts.first);
          }
          width = Math.max(0, Math.floor(width));
          height = Math.max(0, Math.floor(height));
          if (first) {
            if (!palette) {
              throw new Error("First frame must include a { palette } option");
            }
            encodeLogicalScreenDescriptor(stream, width, height, palette, colorDepth);
            encodeColorTable(stream, palette);
            if (repeat >= 0) {
              encodeNetscapeExt(stream, repeat);
            }
          }
          const delayTime = Math.round(delay / 10);
          encodeGraphicControlExt(stream, dispose, delayTime, transparent, transparentIndex);
          const useLocalColorTable = Boolean(palette) && !first;
          encodeImageDescriptor(stream, width, height, useLocalColorTable ? palette : null);
          if (useLocalColorTable)
            encodeColorTable(stream, palette);
          encodePixels(stream, index, width, height, colorDepth, accum, htab, codetab);
        }
      };
      function writeHeader() {
        writeUTFBytes(stream, "GIF89a");
      }
    }
    function encodeGraphicControlExt(stream, dispose, delay, transparent, transparentIndex) {
      stream.writeByte(33);
      stream.writeByte(249);
      stream.writeByte(4);
      if (transparentIndex < 0) {
        transparentIndex = 0;
        transparent = false;
      }
      var transp, disp;
      if (!transparent) {
        transp = 0;
        disp = 0;
      } else {
        transp = 1;
        disp = 2;
      }
      if (dispose >= 0) {
        disp = dispose & 7;
      }
      disp <<= 2;
      const userInput = 0;
      stream.writeByte(0 | disp | userInput | transp);
      writeUInt16(stream, delay);
      stream.writeByte(transparentIndex || 0);
      stream.writeByte(0);
    }
    function encodeLogicalScreenDescriptor(stream, width, height, palette, colorDepth = 8) {
      const globalColorTableFlag = 1;
      const sortFlag = 0;
      const globalColorTableSize = colorTableSize(palette.length) - 1;
      const fields = globalColorTableFlag << 7 | colorDepth - 1 << 4 | sortFlag << 3 | globalColorTableSize;
      const backgroundColorIndex = 0;
      const pixelAspectRatio = 0;
      writeUInt16(stream, width);
      writeUInt16(stream, height);
      stream.writeBytes([fields, backgroundColorIndex, pixelAspectRatio]);
    }
    function encodeNetscapeExt(stream, repeat) {
      stream.writeByte(33);
      stream.writeByte(255);
      stream.writeByte(11);
      writeUTFBytes(stream, "NETSCAPE2.0");
      stream.writeByte(3);
      stream.writeByte(1);
      writeUInt16(stream, repeat);
      stream.writeByte(0);
    }
    function encodeColorTable(stream, palette) {
      const colorTableLength = 1 << colorTableSize(palette.length);
      for (let i = 0; i < colorTableLength; i++) {
        let color = [0, 0, 0];
        if (i < palette.length) {
          color = palette[i];
        }
        stream.writeByte(color[0]);
        stream.writeByte(color[1]);
        stream.writeByte(color[2]);
      }
    }
    function encodeImageDescriptor(stream, width, height, localPalette) {
      stream.writeByte(44);
      writeUInt16(stream, 0);
      writeUInt16(stream, 0);
      writeUInt16(stream, width);
      writeUInt16(stream, height);
      if (localPalette) {
        const interlace = 0;
        const sorted = 0;
        const palSize = colorTableSize(localPalette.length) - 1;
        stream.writeByte(128 | interlace | sorted | 0 | palSize);
      } else {
        stream.writeByte(0);
      }
    }
    function encodePixels(stream, index, width, height, colorDepth = 8, accum, htab, codetab) {
      lzwEncode_default(width, height, index, colorDepth, stream, accum, htab, codetab);
    }
    function writeUInt16(stream, short) {
      stream.writeByte(short & 255);
      stream.writeByte(short >> 8 & 255);
    }
    function writeUTFBytes(stream, text) {
      for (var i = 0; i < text.length; i++) {
        stream.writeByte(text.charCodeAt(i));
      }
    }
    function colorTableSize(length) {
      return Math.max(Math.ceil(Math.log2(length)), 1);
    }
    var src_default = GIFEncoder2;
  }
});

// src/cli.ts
import { readFileSync as readFileSync2, writeFileSync as writeFileSync2, mkdirSync as mkdirSync2, existsSync as existsSync2 } from "node:fs";
import { join as join2, resolve as resolvePath2 } from "node:path";

// src/ggbKB.ts
var GGB_COMMAND_DEFS = [
  // ─── 点 / 向量 ───
  {
    name: "Point",
    signature: "Point(object) | Point(x, y)",
    paramCount: [1, 2],
    modes: ["2d", "3d"],
    category: "point",
    examples: ["A = Point({1,2})", "F = Point(f)\uFF08\u70B9\u843D\u5728\u51FD\u6570 f \u7684\u66F2\u7EBF\u4E0A\uFF0C\u52A8\u753B F \u5373\u6CBF\u66F2\u7EBF\u626B\u63CF\uFF09", "B = Point(a)"],
    note: "\u5355\u53C2\u6570 Point(\u66F2\u7EBF/\u591A\u8FB9\u5F62\u8FB9) = \u70B9\u5728\u5BF9\u8C61\u4E0A\uFF1A\u5207\u7EBF\u626B\u63CF\uFF08\u914D\u5408 Tangent\uFF09\u3001\u5355\u4F4D\u5706\u2192\u6B63\u5F26\u7B49\u6F14\u793A\u7684\u5730\u57FA\u539F\u8BED"
  },
  {
    name: "Vector",
    signature: "Vector(A, B)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "point",
    examples: ["v = Vector((0,0), (3,4))", "w = Vector(A, B)"],
    overloads: [
      { args: ["Point", "Point"], semantic: "\u8D77\u70B9 A \u2192 \u7EC8\u70B9 B\uFF08\u4F4D\u79FB\u77E2\u91CF\uFF09" }
    ],
    note: "A\u3001B \u5FC5\u987B\u662F Point \u6216\u5750\u6807\u5B57\u9762\u91CF\uFF0C\u7981\u6B62 Point+Point\u3002\u2605 \u5B9E\u6D4B Vector(Point, Vector) \u4E8C\u53C2\u91CD\u8F7D\u4E0D\u53EF\u7528\uFF082026-11 \u6574\u673A\u56DE\u5F52\uFF1AVector(P, \u4F4D\u79FB\u5411\u91CF) \u8FD4\u56DE false\uFF09\u2014\u2014\u300C\u4ECE\u70B9 P \u51FA\u53D1\u7684\u4F4D\u79FB\u7BAD\u5934\u300D\u4E00\u5F8B\u5199 Vector(P, P + (dx, dy))\u3002\u2605 \u8D1F\u65B9\u5411\u4F4D\u79FB\u7528 P + (-dx, -dy)\uFF0C\u52FF\u7528 P - (dx, dy)\uFF08\u51CF\u6CD5\u5F62\u6001\u7C7B\u578B\u63A8\u65AD\u4E0D\u7A33\u5B9A\uFF0C\u5B9E\u6D4B\u540C\u4E00\u5199\u6CD5\u53EF\u4EA7\u51FA point \u6216 vector\uFF09"
  },
  {
    name: "Midpoint",
    signature: "Midpoint(A, B)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "point",
    examples: ["M = Midpoint(A, B)"],
    aliases: ["\u4E2D\u70B9", "\u4E24\u70B9\u4E2D\u70B9"]
  },
  {
    name: "Locus",
    signature: "Locus(P, Q)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "point",
    examples: ["loc = Locus(P, Q)\uFF08Q \u4E3A\u9A71\u52A8\u70B9/\u8DEF\u5F84\uFF0CP \u4E3A\u968F Q \u8FD0\u52A8\u7684\u4ECE\u52A8\u70B9\uFF09"],
    aliases: ["\u8F68\u8FF9", "\u70B9\u7684\u8F68\u8FF9", "\u52A8\u70B9\u8F68\u8FF9"],
    note: "\u8F68\u8FF9\u751F\u6210\uFF1A\u5148\u6784\u9020\u300C\u9A71\u52A8\u70B9\u5728\u8DEF\u5F84\u4E0A\u8FD0\u52A8 \u2192 \u4ECE\u52A8\u70B9\u300D\u7684\u4F9D\u8D56\u94FE\uFF0C\u518D\u5BF9\u4ECE\u52A8\u70B9\u53D6 Locus"
  },
  {
    name: "Center",
    signature: "Center(c)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "point",
    examples: ["O = Center(c)"],
    aliases: ["\u5706\u5FC3", "\u4E2D\u5FC3"]
  },
  {
    name: "Intersect",
    signature: "Intersect(a, b [, n])",
    paramCount: [2, 3],
    modes: ["2d", "3d"],
    category: "point",
    examples: ["P = Intersect(f, g)", "Q = Intersect(c, l, 2)"],
    aliases: ["\u4EA4\u70B9", "\u6C42\u4EA4", "\u76F8\u4EA4\u70B9"],
    note: "\u4E24\u5BF9\u8C61\u6709\u591A\u4E2A\u4EA4\u70B9\u65F6\u7528\u7B2C 3 \u53C2\u9009\u7B2C n \u4E2A\uFF08\u4ECE 1 \u8D77\uFF09\uFF1B\u7701\u7565\u5219\u53D6\u7B2C\u4E00\u4E2A\u4EA4\u70B9"
  },
  {
    name: "UnitVector",
    signature: "UnitVector(v)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "point",
    examples: ["u = UnitVector(v)"]
  },
  // ─── 线 / 线段 ───
  {
    name: "Line",
    signature: "Line(A, B)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "line",
    examples: ["l = Line(A, B)", "l = Line(P, Direction)"],
    aliases: ["\u76F4\u7EBF", "\u4E24\u70B9\u8FDE\u7EBF", "\u8FC7\u4E24\u70B9"]
  },
  {
    name: "Segment",
    signature: "Segment(A, B)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "line",
    examples: ["s = Segment(A, B)"],
    overloads: [
      { args: ["Point", "Point"], semantic: "\u4E24\u70B9\u4E4B\u95F4\u7684\u7EBF\u6BB5" }
    ],
    note: "\u4E24\u7AEF\u70B9\u5FC5\u987B\u662F\u5DF2\u58F0\u660E\u7684 Point\uFF0C\u7981\u6B62\u533F\u540D\u5750\u6807 Segment((x1,y1),(x2,y2))\uFF1B\u4E14\u7AEF\u70B9\u540D\u4E0D\u80FD\u662F\u5C0F\u5199\u5F00\u5934\u2014\u2014GGB \u4F1A\u628A\u5C0F\u5199\u540D\u7684\u5750\u6807\u5B57\u9762\u91CF\uFF08\u5982 contact = (r*t, 0)\uFF09\u9690\u5F0F\u63A8\u65AD\u4E3A Vector\uFF0CSegment \u5F15\u7528\u5373\u5931\u8D25\u3002\u5750\u6807\u70B9\u4E00\u5F8B\u7528\u5927\u5199\u5F00\u5934\u540D\u5B57",
    aliases: ["\u7EBF\u6BB5", "\u4E24\u70B9\u8FDE\u7EBF\uFF08\u6709\u9650\u957F\uFF09"]
  },
  {
    name: "Ray",
    signature: "Ray(A, B)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "line",
    examples: ["r = Ray(A, B)"]
  },
  {
    name: "AngleBisector",
    signature: "AngleBisector(A, O, B)",
    paramCount: [3, 3],
    modes: ["2d", "3d"],
    category: "line",
    examples: ["b = AngleBisector(A, O, B)"],
    aliases: ["\u89D2\u5E73\u5206\u7EBF", "\u5E73\u5206\u89D2"]
  },
  {
    name: "PerpendicularBisector",
    signature: "PerpendicularBisector(A, B)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "line",
    examples: ["pb = PerpendicularBisector(A, B)"],
    aliases: ["\u4E2D\u5782\u7EBF", "\u5782\u76F4\u5E73\u5206\u7EBF"]
  },
  {
    name: "Tangent",
    signature: "Tangent(P, c)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "line",
    examples: ["t = Tangent(P, c)", "t = Tangent(l, c)"],
    aliases: ["\u5207\u7EBF", "\u76F8\u5207"]
  },
  {
    name: "PerpendicularLine",
    signature: "PerpendicularLine(P, l)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "line",
    examples: ["pl = PerpendicularLine(P, l)"],
    aliases: ["\u5782\u7EBF", "\u8FC7\u70B9\u4F5C\u5782\u7EBF"]
  },
  {
    name: "ParallelLine",
    signature: "ParallelLine(P, l)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "line",
    examples: ["pl = ParallelLine(P, l)"],
    aliases: ["\u5E73\u884C\u7EBF", "\u8FC7\u70B9\u4F5C\u5E73\u884C\u7EBF"]
  },
  // ─── 圆 / 圆锥曲线 ───
  {
    name: "Circle",
    signature: "Circle(O, r) | Circle(A, B, C)",
    paramCount: [2, 3],
    modes: ["2d", "3d"],
    category: "circle",
    examples: ["c = Circle((0,0), 3)", "c = Circle(A, B, C)"],
    overloads: [
      { args: ["Point", "Number"], semantic: "\u5706\u5FC3 O + \u534A\u5F84 r" },
      { args: ["Point", "Point"], semantic: "\u5706\u5FC3 O + \u5706\u4E0A\u4E00\u70B9 P" },
      { args: ["Point", "Point", "Point"], semantic: "\u8FC7\u4E09\u70B9 A/B/C \u7684\u5706" }
    ],
    aliases: ["\u5706", "\u753B\u5706", "\u8FC7\u4E09\u70B9\u753B\u5706", "\u5706\u5FC3\u534A\u5F84"]
  },
  {
    name: "Semicircle",
    signature: "Semicircle(A, B)",
    paramCount: [2, 2],
    modes: ["2d"],
    category: "circle",
    examples: ["sc = Semicircle(A, B)"]
  },
  {
    name: "Ellipse",
    signature: "Ellipse(F1, F2, a)",
    paramCount: [3, 3],
    modes: ["2d"],
    category: "circle",
    examples: ["e = Ellipse(F1, F2, 3)"],
    note: "a \u662F\u534A\u957F\u8F74\uFF0C\u5FC5\u987B\u5927\u4E8E |F1F2|/2\u2014\u2014a \u504F\u5C0F\u4E0D\u4F1A\u62A5\u9519\u800C\u662F**\u9759\u9ED8\u9000\u5316\u6210\u53CC\u66F2\u7EBF**\uFF08\u5B9E\u6D4B\uFF09"
  },
  {
    name: "Hyperbola",
    signature: "Hyperbola(F1, F2, a)",
    paramCount: [3, 3],
    modes: ["2d"],
    category: "circle",
    examples: ["h = Hyperbola(F1, F2, 2)"]
  },
  {
    name: "Parabola",
    signature: "Parabola(F, d)",
    paramCount: [2, 2],
    modes: ["2d"],
    category: "circle",
    examples: ["p = Parabola(F, d)"]
  },
  {
    name: "Conic",
    signature: "Conic(A,B,C,D,E) | Conic(ax\xB2,by\xB2,c,dxy,ex,fy)",
    paramCount: [5, 6],
    modes: ["2d"],
    category: "circle",
    // ★ 6 系数顺序为 2026-09 二轮整机实测（dev 画布 evalCommand 存证，与官方手册标注不符！）：
    //   Conic(a, b, c, d, e, f) → a·x² + b·y² + c·<常数> + d·xy + e·x + f·y = 0
    //   即【常数项在第 3 位、xy 在第 4 位】。手册标注的 (ax²,by²,cxy,dx,ey,f) 顺序在本 bundle
    //   (5.4.927) 会产生平移/旋转的错误圆锥曲线（实测 Conic(1/9,1/4,0,0,0,-1) → 中心 (0,2)）。
    //   椭圆 x²/9+y²/4=1 的正确形态：Conic(1/9, 1/4, -1, 0, 0, 0)
    //   （0.44x² + y² = 4，中心 (0,0)，半轴 3/2，实测通过）。
    //   实测 7 个系数引擎返回 true 却产出 emptyset，是"看似成功实则失败"的陷阱（预检 [5,6] 拦截）。
    examples: ["c = Conic(A, B, C, D, E)", "ell = Conic(1/9, 1/4, -1, 0, 0, 0)"]
  },
  {
    name: "Incircle",
    signature: "Incircle(A, B, C)",
    paramCount: [3, 3],
    modes: ["2d"],
    category: "circle",
    examples: ["ic = Incircle(A, B, C)"],
    aliases: ["\u5185\u5207\u5706", "\u4E09\u89D2\u5F62\u5185\u5207\u5706"]
  },
  {
    name: "CircumcircleArc",
    signature: "CircumcircleArc(A, B, C)",
    paramCount: [3, 3],
    modes: ["2d"],
    category: "circle",
    examples: ["arc = CircumcircleArc(A, B, C)"],
    aliases: ["\u8FC7\u4E09\u70B9\u5706\u5F27", "\u5916\u63A5\u5706\u5F27"]
  },
  {
    name: "Sector",
    signature: "Sector(c, P1, P2)",
    paramCount: [3, 3],
    modes: ["2d"],
    category: "circle",
    examples: ["sec = Sector(c, A, B)"]
  },
  {
    name: "Polar",
    signature: "Polar(P, c)",
    paramCount: [2, 2],
    modes: ["2d"],
    category: "circle",
    examples: ["l = Polar(P, c)"]
  },
  {
    name: "Focus",
    signature: "Focus(c)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "circle",
    examples: ["F1 = Focus(c)"]
  },
  {
    name: "Directrix",
    signature: "Directrix(c)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "circle",
    examples: ["d = Directrix(c)"]
  },
  // ─── 多边形 ───
  {
    name: "Polygon",
    signature: "Polygon(A,B,C,...) | Polygon(list)",
    paramCount: [3, -1],
    modes: ["2d", "3d"],
    category: "polygon",
    examples: ["p = Polygon(A, B, C)", "p = Polygon({A,B,C,D})"],
    overloads: [
      { args: ["Point", "Point", "Point"], semantic: "\u22653 \u9876\u70B9\uFF0C\u591A\u70B9\u7528 ... \u53D8\u957F" },
      { args: ["List"], semantic: "\u9876\u70B9\u5217\u8868 Polygon({A,B,C})" }
    ],
    aliases: ["\u591A\u8FB9\u5F62", "\u4E09\u89D2\u5F62", "\u56DB\u8FB9\u5F62", "\u4E94\u8FB9\u5F62"]
  },
  {
    name: "RigidPolygon",
    signature: "RigidPolygon(A, B, C)",
    paramCount: [3, 3],
    modes: ["2d"],
    category: "polygon",
    examples: ["rp = RigidPolygon(A, B, C)"]
  },
  {
    name: "PolyLine",
    signature: "PolyLine(A, B, C, ...) | PolyLine(list)",
    paramCount: [1, -1],
    modes: ["2d", "3d"],
    category: "polygon",
    examples: ["pl = PolyLine(A, B, C)", "zig = PolyLine(Sequence((u, 0.2*(-1)^u), u, 0, 20))"],
    note: "\u5B98\u65B9\u53E6\u6709 PolyLine(\u70B9\u5217\u8868) \u5355\u53C2\u5F62\u6001\u2014\u2014\u914D\u5408 Sequence \u751F\u6210\u952F\u9F7F/\u5F39\u7C27\u7B49\u6298\u7EBF"
  },
  // ─── 函数 / 曲线 ───
  {
    name: "Function",
    signature: "Function(f, x0, x1)",
    paramCount: [1, 3],
    modes: ["2d", "3d"],
    category: "function",
    examples: ["f(x) = x^2", "g = Function(x^2, -5, 5)"]
  },
  {
    name: "Curve",
    signature: "Curve(x(t),y(t),t,t0,t1)",
    paramCount: [3, 5],
    modes: ["2d", "3d"],
    category: "function",
    examples: ["c = Curve(cos(t), sin(t), t, 0, 2\u03C0)"],
    note: "\u53C2\u6570\u53D8\u91CF\u540D\u4E0D\u80FD\u4E0E\u5DF2\u5B58\u5728\u5BF9\u8C61\u540C\u540D",
    aliases: ["\u53C2\u6570\u66F2\u7EBF", "\u8F68\u8FF9\u66F2\u7EBF", "\u53C2\u6570\u65B9\u7A0B"]
  },
  {
    name: "Derivative",
    signature: "Derivative(f)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "function",
    examples: ["df = Derivative(f)"]
  },
  {
    name: "NDerivative",
    signature: "NDerivative(f)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "function",
    examples: ["ndf = NDerivative(f)"]
  },
  {
    name: "Integral",
    signature: "Integral(f, a, b)",
    paramCount: [1, 3],
    modes: ["2d"],
    category: "function",
    examples: ["A = Integral(f, 0, \u03C0)"]
  },
  {
    name: "TaylorPolynomial",
    signature: "TaylorPolynomial(f, x0, n)",
    paramCount: [3, 3],
    modes: ["2d"],
    category: "function",
    examples: ["T = TaylorPolynomial(sin(x), 0, 5)"]
  },
  {
    name: "Root",
    signature: "Root(f, a, b)",
    paramCount: [2, 3],
    modes: ["2d"],
    category: "function",
    examples: ["r = Root(f, 0, 3)"]
  },
  {
    name: "Extremum",
    signature: "Extremum(f, a, b)",
    paramCount: [2, 3],
    modes: ["2d"],
    category: "function",
    examples: ["E = Extremum(f, 0, 3)"]
  },
  {
    name: "ImplicitCurve",
    signature: "ImplicitCurve(eq)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "function",
    examples: ["ic = ImplicitCurve(x^2 + y^2 = 1)"]
  },
  {
    name: "SlopeField",
    signature: "SlopeField(f)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "function",
    examples: ["sf = SlopeField(1 - x*y)"]
  },
  {
    name: "If",
    signature: "If(cond, then, else)",
    paramCount: [3, 3],
    modes: ["2d", "3d"],
    category: "logic",
    examples: ["v = If(x>0, x^2, -x^2)"]
  },
  // ─── 滑块 / 动画 ───
  {
    name: "Slider",
    signature: "Slider(min,max,step,speed,width,isAngle,horiz,anim,rand)",
    paramCount: [2, 9],
    modes: ["2d", "3d"],
    category: "slider",
    examples: ["t = Slider(0, 10, 0.1, 1, 150, false, true, false, false)"],
    note: "\u5B98\u65B9\u4EC5 min/max \u5FC5\u9009\uFF082 \u53C2\u5408\u6CD5\uFF09\uFF0C\u5176\u4F59\u7F3A\u7701\uFF1Astep=0.1 speed=1 width=200"
  },
  {
    name: "StartAnimation",
    signature: "StartAnimation() | StartAnimation(slider) | StartAnimation(bool)",
    paramCount: [0, 2],
    modes: ["2d", "3d"],
    category: "slider",
    examples: ["StartAnimation()", "StartAnimation(t)", "StartAnimation(t, false)"],
    note: "\u5B98\u65B9\u53E6\u6709 (list)/(slider|list, bool) \u5F62\u6001\uFF1BStartAnimation(false) \u6682\u505C\u5168\u90E8\u52A8\u753B"
  },
  {
    name: "SetAnimationSpeed",
    signature: "SetAnimationSpeed(obj, val)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "slider",
    examples: ["SetAnimationSpeed(t, 0.5)"]
  },
  {
    name: "SetAnimationType",
    signature: "SetAnimationType(obj, type)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "slider",
    examples: ["SetAnimationType(t, 0)"],
    note: "type: 0=oscillating, 1=increasing, 2=decreasing, 3=increasing once"
  },
  {
    name: "SetValue",
    signature: "SetValue(obj, val)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "slider",
    examples: ["SetValue(t, 5)"]
  },
  {
    name: "SetTrace",
    signature: "SetTrace(obj, flag)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "slider",
    examples: ["SetTrace(P, true)"]
  },
  {
    // ★ 必须收录：HALLUCINATION_MAP 把 PauseAnimation/StopAnimation 纠正为 SetAnimating(obj, false)，
    //   若 KB 无此条目，纠正后的命令下轮又会被纠正器报「不在已验证命令库」，来回震荡
    name: "SetAnimating",
    signature: "SetAnimating(obj, flag)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "slider",
    examples: ["SetAnimating(t, false)"],
    note: "flag=false \u505C\u6B62\u52A8\u753B\uFF08\u7B49\u4EF7 PauseAnimation/StopAnimation\uFF09\uFF1B\u542F\u52A8\u52A8\u753B\u4E5F\u53EF\u7528 animate op"
  },
  // ─── 度量 ───
  {
    name: "Distance",
    signature: "Distance(P, l) | Distance(A, B)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "metric",
    examples: ["d = Distance(P, l)", "d = Distance(A, B)"]
  },
  {
    name: "Area",
    signature: "Area(obj)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "metric",
    examples: ["A = Area(poly)"]
  },
  {
    name: "Perimeter",
    signature: "Perimeter(obj)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "metric",
    examples: ["p = Perimeter(poly)"]
  },
  {
    name: "Circumference",
    signature: "Circumference(c)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "metric",
    examples: ["C = Circumference(c)"]
  },
  {
    name: "Length",
    signature: "Length(obj)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "metric",
    examples: ["L = Length(s)", "n = Length(list)"]
  },
  // ─── 变换 ───
  {
    name: "Translate",
    signature: "Translate(obj, v)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "transform",
    examples: ["T = Translate(poly, v)"]
  },
  {
    name: "Rotate",
    signature: "Rotate(obj, angle, center)",
    paramCount: [3, 3],
    modes: ["2d", "3d"],
    category: "transform",
    examples: ["R = Rotate(poly, \u03C0/2, O)"]
  },
  {
    name: "Reflect",
    signature: "Reflect(obj, line)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "transform",
    examples: ["R = Reflect(poly, l)"]
  },
  {
    name: "Dilate",
    signature: "Dilate(obj, k, center)",
    paramCount: [3, 3],
    modes: ["2d"],
    category: "transform",
    examples: ["D = Dilate(poly, 2, O)"]
  },
  // ─── 列表 / 序列 ───
  {
    name: "Sequence",
    signature: "Sequence(expr, var, start, end, step) | Sequence(start, end, inc) | Sequence(end)",
    paramCount: [1, 5],
    modes: ["2d", "3d"],
    category: "list",
    examples: [
      "pts = Sequence((i, i^2), i, 0, 10, 0.5)",
      "ints = Sequence(7, 13, 2)",
      "grid = Sequence(Sequence(Cube((i,j,0), (i+1,j,0)), i, 0, 2, 1), j, 0, 2, 1)"
    ],
    note: '\u5B98\u65B9 5 \u79CD\u91CD\u8F7D\uFF1ASequence(n)\uFF5CSequence(k,n)\uFF5CSequence(k,n,inc)\u3014\u6574\u6570\u8868\u3015\uFF5CSequence(expr,k,a,b)\uFF5CSequence(expr,k,a,b,step)\u3014\u8FED\u4EE3\u8868\u8FBE\u5F0F\u3015\u3002\u2460 \u8868\u8FBE\u5F0F\u5F62\u6001\u7684 var \u5FC5\u987B\u662F\u5355\u4E2A ASCII \u5B57\u6BCD\uFF08i/j/k/t/n\uFF09\uFF0C\u591A\u5B57\u6BCD/\u4E2D\u6587/\u6570\u5B57\u4F1A\u5931\u8D25\uFF1B\u2461 start/end/step \u662F\u4E09\u4E2A\u72EC\u7ACB\u53C2\u6570\uFF0C\u7981\u6B62 "0,1,0.1" \u538B\u7F29\u5199\u6CD5\uFF1B\u2462 \u7981\u6B62 Sequence(var, list) \u7B80\u5199\uFF1B\u2463 \u53C2\u6570\u4E4B\u95F4\u7528\u9017\u53F7\uFF0C\u7981\u7528\u53E5\u70B9\uFF1B\u2464 \u5D4C\u5957 Sequence \u65F6\u6700\u5916\u5C42 `)` \u6700\u6613\u6F0F\u95ED\u5408\uFF1B\u2465 \u4E09\u70B9\u5F0F Cube(A,B,C) \u5728 Sequence \u5185\u8981\u6C42 A/B/C \u4E3A\u5DF2\u58F0\u660E Point \u4E14\u6784\u6210\u6B63\u65B9\u5F62\uFF08\u5750\u6807\u5B57\u9762\u91CF\u53EA\u9002\u7528\u4E24\u70B9\u5F0F\uFF09\u3002',
    aliases: ["\u5E8F\u5217", "\u7B49\u95F4\u8DDD", "\u6279\u91CF\u751F\u6210", "\u7F51\u683C\u70B9"]
  },
  {
    name: "IterationList",
    signature: "IterationList(f, init, n)",
    paramCount: [3, 3],
    modes: ["2d", "3d"],
    category: "list",
    examples: ["il = IterationList(x+1, 0, 10)"]
  },
  {
    name: "Element",
    signature: "Element(list, i) | Element(list, i, j)",
    paramCount: [2, 3],
    modes: ["2d", "3d"],
    category: "list",
    examples: ["e = Element(pts, 3)", "e = Element(mat, 2, 3)"]
  },
  {
    name: "Join",
    signature: "Join(a, b)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "list",
    examples: ["combined = Join(list1, list2)"]
  },
  {
    name: "Sort",
    signature: "Sort(list)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "list",
    examples: ["sorted = Sort(pts)"]
  },
  {
    name: "Unique",
    signature: "Unique(list)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "list",
    examples: ["u = Unique(pts)"]
  },
  {
    name: "Zip",
    signature: "Zip(expr, var1, list1, var2, list2, ...)",
    paramCount: [3, 7],
    modes: ["2d", "3d"],
    category: "list",
    examples: ["z = Zip(a+b, a, {1,2}, b, {3,4})", "squares = Zip(a^2, a, {1,2,3})"],
    note: "\u5B98\u65B9\u53EF\u53D8\u957F\uFF1A3/5/7 \u53C2\u6570\uFF081~3 \u7EC4 \u53D8\u91CF+\u5217\u8868\uFF09\uFF0C\u5355\u5217\u8868 3 \u53C2\u5F62\u6001\u5408\u6CD5\uFF1B\u53D8\u91CF\u6570\u6BD4\u5217\u8868\u591A 1 \u65F6\u672B\u4F4D\u53D8\u91CF\u53D6 1..k \u7D22\u5F15"
  },
  {
    name: "Append",
    signature: "Append(list, obj)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "list",
    examples: ["l2 = Append(pts, P)"]
  },
  {
    name: "First",
    signature: "First(list)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "list",
    examples: ["f = First(pts)"]
  },
  {
    name: "Last",
    signature: "Last(list)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "list",
    examples: ["l = Last(pts)"]
  },
  {
    name: "Flatten",
    signature: "Flatten(list)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "list",
    examples: ["flat = Flatten(nested)"]
  },
  {
    name: "KeepIf",
    signature: "KeepIf(cond, list)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "list",
    examples: ["filtered = KeepIf(x>0, pts)"]
  },
  {
    name: "RemoveUndefined",
    signature: "RemoveUndefined(list)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "list",
    examples: ["clean = RemoveUndefined(pts)"]
  },
  // ─── 文本 / 标签 ───
  {
    name: "Text",
    signature: "Text(text, Point [, Boolean])",
    paramCount: [2, 3],
    modes: ["2d", "3d"],
    category: "text",
    examples: ['T = Text("Hello", (0,0))', 'T = Text("\u516C\u5F0F", (3,2), true)']
  },
  {
    name: "LaTeX",
    signature: "LaTeX(expr, Point)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "text",
    examples: ["T = LaTeX(sqrt(2)+1, (0,0))"]
  },
  {
    name: "FractionText",
    signature: "FractionText(n)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "text",
    examples: ["ft = FractionText(0.75)"]
  },
  {
    name: "SurdText",
    signature: "SurdText(n)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "text",
    examples: ["st = SurdText(sqrt(2))"]
  },
  // ─── 样式 / 属性 ───
  {
    name: "SetColor",
    signature: "SetColor(obj, color) | SetColor(obj, r, g, b)",
    paramCount: [2, 4],
    modes: ["2d", "3d"],
    category: "style",
    examples: ['SetColor(c, "red")', "SetColor(c, 0.9, 0.2, 0.2)"],
    note: "r/g/b \u662F 0~1 \u6D6E\u70B9\uFF08\u5F15\u64CE\u6309 \xD7255 \u89E3\u6790\uFF09\uFF1B\u5199 0~255 \u6574\u6570\u4F1A\u88AB\u94B3\u6210\u767D\u8272"
  },
  {
    name: "SetVisibleInView",
    signature: "SetVisibleInView(obj, 1, true/false)",
    paramCount: [3, 3],
    modes: ["2d", "3d"],
    category: "style",
    examples: ["SetVisibleInView(c, 1, false)"],
    note: "\u5BF9\u8C61\u663E\u9690\u552F\u4E00\u547D\u4EE4\u5F62\u6001\uFF08\u7B2C\u4E8C\u53C2\u662F\u89C6\u56FE\u53F7 1/2\uFF09\uFF1BGGB \u65E0 SetVisible \u547D\u4EE4\uFF1BSet* \u662F\u8BED\u53E5\uFF0C\u4E0D\u80FD\u5D4C\u5957\u8FDB Sequence/Zip\uFF08\u6279\u91CF\u9010\u6761\u53D1\u547D\u4EE4\u6216 eval_raw \u6362\u884C\u5206\u9694\uFF09"
  },
  {
    name: "SetConditionToShowObject",
    signature: "SetConditionToShowObject(obj, condition)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "style",
    examples: ["SetConditionToShowObject(c, n > 2)"],
    note: "\u6309\u6761\u4EF6\u663E\u9690\uFF08\u5982\u4E0E\u6ED1\u5757\u8054\u52A8\uFF09\uFF1B\u67E5\u8BE2\u663E\u9690\u72B6\u6001\u65E0\u547D\u4EE4\u5F62\u6001\uFF0C\u7528 get_object_info \u5DE5\u5177"
  },
  {
    name: "SetLineStyle",
    signature: "SetLineStyle(obj, n)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "style",
    examples: ["SetLineStyle(c, 1)"]
  },
  {
    name: "SetLineOpacity",
    signature: "SetLineOpacity(obj, 0~1)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "style",
    examples: ["SetLineOpacity(c, 0.5)"]
  },
  {
    name: "SetLineThickness",
    signature: "SetLineThickness(obj, n)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "style",
    examples: ["SetLineThickness(c, 3)"]
  },
  {
    name: "SetFilling",
    signature: "SetFilling(obj, 0~1)",
    paramCount: [2, 2],
    modes: ["2d"],
    category: "style",
    examples: ["SetFilling(c, 0.3)"],
    note: "3D \u4E2D\u5BF9\u7ACB\u4F53\u65E0\u6548\u2014\u2014\u7528 style op \u7684 opacity \u5B57\u6BB5\u66FF\u4EE3"
  },
  {
    name: "SetPointStyle",
    signature: "SetPointStyle(p, n)",
    paramCount: [2, 2],
    modes: ["2d"],
    category: "style",
    examples: ["SetPointStyle(P, 4)"]
  },
  {
    name: "SetPointSize",
    signature: "SetPointSize(obj, n)",
    paramCount: [2, 2],
    modes: ["2d"],
    category: "style",
    examples: ["SetPointSize(P, 6)"],
    note: "3D \u4E2D\u4E0D\u53EF\u7528\u2014\u2014\u7528 Sphere(P, 0.2) \u66FF\u4EE3\u6807\u8BB0\u70B9"
  },
  {
    name: "SetCaption",
    signature: "SetCaption(obj, text)",
    paramCount: [2, 2],
    modes: ["2d"],
    category: "style",
    examples: ['SetCaption(P, "\u8D28\u70B9")'],
    note: "3D \u4E2D\u4E0D\u53EF\u7528\u2014\u2014\u76F4\u63A5\u7528\u53D8\u91CF\u540D\u6807\u8BC6"
  },
  {
    name: "SetLabelMode",
    signature: "SetLabelMode(obj, n)",
    paramCount: [2, 2],
    modes: ["2d"],
    category: "style",
    examples: ["SetLabelMode(c, 2)"]
  },
  {
    name: "ShowLabel",
    signature: "ShowLabel(obj, bool)",
    paramCount: [2, 2],
    modes: ["2d"],
    category: "style",
    examples: ["ShowLabel(P, true)"]
  },
  {
    name: "Rename",
    signature: "Rename(obj, name)",
    paramCount: [2, 2],
    modes: ["2d"],
    category: "style",
    examples: ['Rename(c, "\u5706O")']
  },
  {
    name: "Delete",
    signature: "Delete(obj)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "style",
    examples: ["Delete(c)"]
  },
  // ─── 逻辑 / 判定 ───
  {
    name: "Repeat",
    signature: "Repeat(n, cmd)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "logic",
    examples: ["Repeat(5, A = A + (1,0))"]
  },
  {
    name: "AreCollinear",
    signature: "AreCollinear(A, B, C)",
    paramCount: [3, 3],
    modes: ["2d", "3d"],
    category: "logic",
    examples: ["b = AreCollinear(A, B, C)"]
  },
  {
    name: "AreParallel",
    signature: "AreParallel(a, b)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "logic",
    examples: ["b = AreParallel(l1, l2)"]
  },
  {
    name: "ArePerpendicular",
    signature: "ArePerpendicular(a, b)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "logic",
    examples: ["b = ArePerpendicular(l1, l2)"]
  },
  {
    name: "IsTangent",
    signature: "IsTangent(l, c)",
    paramCount: [2, 2],
    modes: ["2d"],
    category: "logic",
    examples: ["b = IsTangent(l, c)"]
  },
  {
    name: "Defined",
    signature: "Defined(obj)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "logic",
    examples: ["b = Defined(P)"]
  },
  // ─── 方程求解 ───
  {
    name: "Solve",
    signature: "Solve(eq)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "equation",
    examples: ["sol = Solve(x^2 = 4)"]
  },
  {
    name: "NSolve",
    signature: "NSolve(eq)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "equation",
    examples: ["nsol = NSolve(x^3 = 2)"]
  },
  {
    name: "Solutions",
    signature: "Solutions(eq)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "equation",
    examples: ["sol = Solutions(x^2 = 4)"]
  },
  {
    name: "Roots",
    signature: "Roots(f, a, b)",
    paramCount: [2, 3],
    modes: ["2d"],
    category: "equation",
    examples: ["r = Roots(f, 0, 3)"]
  },
  {
    name: "SolveODE",
    signature: "SolveODE(f) | SolveODE(f, x0, y0, x1, step) | SolveODE(b, c, f, x0, y0, ...) ",
    paramCount: [1, 5],
    modes: ["2d"],
    category: "equation",
    examples: ["pts = SolveODE(-x*y, x(A), y(A), 5, 0.1)", "sol = SolveODE(y = x^2)"],
    note: "\u5B98\u65B9\u53E6\u6709\u7EBF\u6027\u5F62 SolveODE(b,c,f,StartX,StartY) \u4E0E\u4E8C\u9636 8 \u53C2\u5F62\u6001\uFF08\u672C\u77E5\u8BC6\u5E93\u672A\u5168\u5F55\uFF09\uFF1B\u4E0D\u53EF\u7528\u4E8E 2D \u5411\u91CF\u573A/\u7535\u573A\u7EBF\u2014\u2014\u8BE5\u547D\u4EE4\u63A5\u53D7\u6807\u91CF ODE \u800C\u975E\u4E8C\u5143\u5411\u91CF\u573A"
  },
  // ─── 向量运算 ───
  {
    name: "Cross",
    signature: "Cross(u, v)",
    paramCount: [2, 2],
    modes: ["3d"],
    category: "metric",
    examples: ["w = Cross(u, v)"],
    note: "\u8FD4\u56DE\u81EA\u7531 Vector\uFF1BVector(O, w) \u5931\u8D25\u2014\u2014\u7528 end = O + w; Vector(O, end)"
  },
  {
    name: "Dot",
    signature: "Dot(u, v)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "metric",
    examples: ["d = Dot(u, v)"]
  },
  // ─── 数值 / 代数 ───
  {
    name: "Simplify",
    signature: "Simplify(expr)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "metric",
    examples: ["s = Simplify(x^2 + 2x + 1)"]
  },
  {
    name: "Expand",
    signature: "Expand(expr)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "metric",
    examples: ["e = Expand((x+1)^2)"]
  },
  {
    name: "Factor",
    signature: "Factor(expr)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "metric",
    examples: ["f = Factor(x^2 - 1)"]
  },
  {
    name: "Substitute",
    signature: "Substitute(expr, old, new)",
    paramCount: [3, 3],
    modes: ["2d"],
    category: "metric",
    examples: ["s = Substitute(x^2, x, 3)"]
  },
  {
    name: "Sum",
    signature: "Sum(list)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "metric",
    examples: ["s = Sum({1,2,3})"]
  },
  {
    name: "Min",
    signature: "Min(list)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "metric",
    examples: ["m = Min({3,1,2})"],
    // ★ 实测：Min/Max 的双参数形式 Min(a, b) 在部分场景直接失败（哪怕是合法表达式），
    //   两值取小/取大必须用 If(c, a, b) 条件表达式——见 prompts 已知坑
    note: "\u53EA\u652F\u6301\u5355\u53C2\u6570\u5217\u8868\uFF1B\u4E24\u6570\u53D6\u5C0F/\u53D6\u5927\u7528 If(c, a, b)\uFF0C\u7981\u6B62 Min(a, b) \u53CC\u53C2\u6570\u5F62\u5F0F"
  },
  {
    name: "Max",
    signature: "Max(list)",
    paramCount: [1, 1],
    modes: ["2d", "3d"],
    category: "metric",
    examples: ["M = Max({3,1,2})"],
    note: "\u53EA\u652F\u6301\u5355\u53C2\u6570\u5217\u8868\uFF1B\u4E24\u6570\u53D6\u5927\u7528 If(c, a, b)\uFF0C\u7981\u6B62 Max(a, b) \u53CC\u53C2\u6570\u5F62\u5F0F"
  },
  // ─── 3D 几何体 ───
  {
    name: "Cube",
    signature: "Cube(A, B) | Cube(A, B, C)",
    paramCount: [2, 3],
    modes: ["3d"],
    category: "solid3d",
    examples: ["cube = Cube(A, B)"],
    note: "\u4F18\u5148\u4E24\u70B9 Cube(A,B)\u2014\u2014A/B \u5E95\u9762\u76F8\u90BB\u9876\u70B9\uFF0C\u7B2C\u4E09\u70B9\u81EA\u52A8\u751F\u6210\uFF1B\u907F\u514D\u4E09\u70B9\u5F62\u5F0F\u9664\u975E\u7CBE\u786E\u6784\u6210\u6B63\u65B9\u5F62"
  },
  {
    name: "Tetrahedron",
    signature: "Tetrahedron(A, B, C, D)",
    paramCount: [4, 4],
    modes: ["3d"],
    category: "solid3d",
    examples: ["tet = Tetrahedron(A, B, C, D)"]
  },
  {
    name: "Prism",
    signature: "Prism(poly, point)",
    paramCount: [2, 2],
    modes: ["3d"],
    category: "solid3d",
    examples: ["prism = Prism(base, (0,0,5))"]
  },
  {
    name: "Pyramid",
    signature: "Pyramid(poly, point)",
    paramCount: [2, 2],
    modes: ["3d"],
    category: "solid3d",
    examples: ["pyr = Pyramid(base, (0,0,5))"]
  },
  {
    name: "Cylinder",
    signature: "Cylinder(circle, h) | Cylinder(P1, P2, r)",
    paramCount: [2, 3],
    modes: ["3d"],
    category: "solid3d",
    examples: ["cyl = Cylinder((0,0,0), (0,0,5), 2)"]
  },
  {
    name: "Cone",
    signature: "Cone(circle, h) | Cone(P1, P2, r)",
    paramCount: [2, 3],
    modes: ["3d"],
    category: "solid3d",
    examples: ["cone = Cone((0,0,0), (0,0,5), 3)"]
  },
  {
    name: "Sphere",
    signature: "Sphere(O, r) | Sphere(P1, P2)",
    paramCount: [2, 2],
    modes: ["3d"],
    category: "solid3d",
    examples: ["s = Sphere((0,0,0), 3)", "marker = Sphere(P, 0.2)"],
    overloads: [
      { args: ["Point", "Number"], semantic: "\u7403\u5FC3 O + \u534A\u5F84 r" },
      { args: ["Point", "Point"], semantic: "\u7403\u5FC3 P1 + \u7403\u9762\u70B9 P2" }
    ],
    note: "3D \u7981\u6B62 SetPointSize\u2014\u2014\u7528 Sphere(P, 0.2) \u66FF\u4EE3\u6807\u8BB0\u70B9"
  },
  {
    name: "Net",
    signature: "Net(poly, idx)",
    paramCount: [2, 2],
    modes: ["3d"],
    category: "solid3d",
    examples: ["net = Net(cube, 0)"],
    note: "\u5C55\u5F00\u56FE\u5FC5\u987B\u7528 Net\uFF0C\u7981\u6B62 Polygon \u62FC\u63A5"
  },
  // ─── 3D 曲线 / 曲面 ───
  {
    name: "Surface",
    signature: "Surface(x,y,z,u,u0,u1,v,v0,v1)",
    paramCount: [9, 9],
    modes: ["3d"],
    category: "curve3d",
    examples: ["s = Surface(u, v, u^2+v^2, u, -2, 2, v, -2, 2)"]
  },
  // ─── 3D 求交 / 截面 ───
  {
    name: "IntersectPath",
    signature: "IntersectPath(plane, poly) | IntersectPath(line, poly)",
    paramCount: [2, 2],
    modes: ["2d", "3d"],
    category: "intersect3d",
    examples: ["section = IntersectPath(Plane(A,C,F), cube)"],
    note: "\u5B98\u65B9 2D \u4EA6\u6709 IntersectPath(line, polygon)\uFF08\u7EBF\u4E0E\u591A\u8FB9\u5F62\u7684\u622A\u6BB5\uFF09\u2014\u20142D/3D \u5747\u53EF\u7528"
  },
  {
    name: "IntersectConic",
    signature: "IntersectConic(plane, quadric)",
    paramCount: [2, 2],
    modes: ["3d"],
    category: "intersect3d",
    examples: ["ic = IntersectConic(plane, sphere)"]
  },
  {
    name: "Plane",
    signature: "Plane(A, B, C) | Plane(point, line)",
    paramCount: [2, 3],
    modes: ["3d"],
    category: "intersect3d",
    examples: ["p = Plane(A, C, F)", "p = Plane(P, l)"]
  },
  // ─── 3D 度量 ───
  {
    name: "Volume",
    signature: "Volume(solid)",
    paramCount: [1, 1],
    modes: ["3d"],
    category: "measure3d",
    examples: ["V = Volume(cube)"]
  },
  {
    name: "Height",
    signature: "Height(solid)",
    paramCount: [1, 1],
    modes: ["3d"],
    category: "measure3d",
    examples: ["h = Height(pyr)"]
  },
  {
    name: "Angle",
    signature: "Angle(line, plane) | Angle(P1, vertex, P2)",
    paramCount: [2, 3],
    modes: ["2d", "3d"],
    category: "metric",
    examples: ["a = Angle(l, plane)", "a = Angle(P1, O, P2)"],
    note: "\u4E09\u70B9\u5F62\u6001 P1/vertex/P2 \u5FC5\u987B\u5168\u90E8\u662F\u3010\u5DF2\u58F0\u660E\u7684 Point\u3011\uFF08\u5148\u521B\u5EFA\u5E95\u89D2\u9876\u70B9\u4E0E\u4E24\u6761\u8FB9\u7684\u7AEF\u70B9\uFF0C\u518D\u53D6 Angle\uFF09\u2014\u2014\u5F15\u7528\u6ED1\u5757 t \u65F6\u5199\u5927\u5199 T \u5927\u5C0F\u5199\u4E0D\u7B26\u5FC5\u5931\u8D25\uFF1B\u659C\u9762\u503E\u89D2\uFF1AO=(0,0)\u3001Hx=(4,0) \u6C34\u5E73\u53C2\u8003\u70B9\u3001Ps=\u659C\u9762\u4E0A\u70B9\uFF0C\u5219 ang = Angle(Hx, O, Ps)"
  },
  // ─── 3D 视图 ───
  {
    name: "SetViewDirection",
    signature: "SetViewDirection(dir)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "view3d",
    examples: ["SetViewDirection((1,1,1))"],
    note: "\u7EAF 3D applet \u4E2D\u5B8C\u5168\u4E0D\u53EF\u7528\u2014\u2014\u7981\u6B62\u5728 3D \u6A21\u5F0F\u4F7F\u7528\uFF0C\u4F9D\u9760\u9F20\u6807\u65CB\u8F6C"
  },
  {
    name: "SetSpinSpeed",
    signature: "SetSpinSpeed(n)",
    paramCount: [1, 1],
    modes: ["3d"],
    category: "view3d",
    examples: ["SetSpinSpeed(10)"]
  },
  // ─── 视图控制 ───
  {
    name: "SetAxesRatio",
    signature: "SetAxesRatio(x, y) | 3D: SetAxesRatio(x, y, z)",
    paramCount: [2, 3],
    modes: ["2d"],
    category: "view",
    examples: ["SetAxesRatio(1, 1)"],
    note: "3D \u4E2D\u4E0D\u53EF\u9760\u2014\u20143D \u7B49\u6BD4\u4F8B\u4EA4\u7ED9 view op \u6216\u7528\u6237\u624B\u52A8"
  },
  {
    name: "SetCoordSystem",
    signature: "SetCoordSystem(xMin, xMax, yMin, yMax)",
    paramCount: [4, 4],
    modes: ["2d", "3d"],
    category: "view",
    examples: ["SetCoordSystem(-5, 5, -3, 3)"]
  },
  {
    name: "ZoomIn",
    signature: "ZoomIn([scale])",
    paramCount: [0, 1],
    modes: ["2d"],
    category: "view",
    examples: ["ZoomIn(0.5)"],
    note: "3D applet \u4E2D\u5E38\u8FD4\u56DE false\u2014\u20143D \u7528 view op \u66FF\u4EE3"
  },
  {
    name: "CenterView",
    signature: "CenterView(P)",
    paramCount: [1, 1],
    modes: ["2d"],
    category: "view",
    examples: ["CenterView((0,0))"]
  },
  {
    name: "SetCoords",
    signature: "SetCoords(obj, x, y)",
    paramCount: [3, 3],
    modes: ["2d"],
    category: "view",
    examples: ["SetCoords(P, 5, 3)"]
  }
];
var HALLUCINATION_MAP = [
  { hallucination: "SetOpacity", correct: "SetLineOpacity", reason: "GeoGebra \u65E0 SetOpacity\uFF0C\u900F\u660E\u5EA6\u7528 SetLineOpacity" },
  { hallucination: "SetTransparency", correct: "SetLineOpacity", reason: "GeoGebra \u65E0 SetTransparency\uFF0C\u900F\u660E\u5EA6\u7528 SetLineOpacity" },
  { hallucination: "DSolve", correct: "SolveODE", reason: "GeoGebra \u65E0 DSolve\uFF0C\u5E38\u5FAE\u5206\u65B9\u7A0B\u7528 SolveODE" },
  { hallucination: "ContourPlot", correct: "ImplicitCurve", reason: "GeoGebra \u65E0 ContourPlot\uFF0C\u9690\u5F0F\u66F2\u7EBF\u7528 ImplicitCurve" },
  { hallucination: "Plot3D", correct: "Surface", reason: "GeoGebra \u65E0 Plot3D\uFF0C\u4E09\u7EF4\u66F2\u9762\u7528 Surface" },
  { hallucination: "VectorField", correct: "Sequence + Vector \u5D4C\u5957", reason: "GeoGebra \u65E0 VectorField\uFF0C\u5411\u91CF\u573A\u7528\u5D4C\u5957 Sequence \u751F\u6210\u7BAD\u5934\u7F51\u683C" },
  { hallucination: "StreamPlot", correct: "Sequence + Vector \u5D4C\u5957", reason: "GeoGebra \u65E0 StreamPlot\uFF0C\u6D41\u7EBF\u7528\u5D4C\u5957 Sequence \u7BAD\u5934\u7F51\u683C" },
  { hallucination: "FieldLine", correct: "IterationList", reason: "GeoGebra \u65E0 FieldLine\uFF0C\u573A\u7EBF\u7528 IterationList \u9012\u63A8" },
  { hallucination: "StreamLine", correct: "IterationList", reason: "GeoGebra \u65E0 StreamLine\uFF0C\u6D41\u7EBF\u7528 IterationList \u9012\u63A8" },
  { hallucination: "PauseAnimation", correct: "SetAnimating(obj, false)", reason: "GeoGebra \u65E0 PauseAnimation\u2014\u2014\u7528 eval SetAnimating(obj, false) \u6216 animate op \u7684 on:false" },
  { hallucination: "StopAnimation", correct: "SetAnimating(obj, false)", reason: "GeoGebra \u65E0 StopAnimation\u2014\u2014\u7528 eval SetAnimating \u6216 animate op" },
  { hallucination: "AnimateRotation", correct: "Rotate + Slider \u7EC4\u5408", reason: "GeoGebra \u65E0 AnimateRotation\u2014\u2014\u7528 Rotate(obj, t, O) + slider t \u9A71\u52A8" },
  { hallucination: "DrawPoint", correct: "Point({x,y})", reason: "GeoGebra \u65E0 DrawPoint\u2014\u2014\u7528 Point({x,y}) \u521B\u5EFA\u70B9" },
  { hallucination: "DrawLine", correct: "Segment(A,B)", reason: "GeoGebra \u65E0 DrawLine\u2014\u2014\u7528 Segment(A,B) \u521B\u5EFA\u7EBF\u6BB5" },
  { hallucination: "DrawCircle", correct: "Circle(O, r)", reason: "GeoGebra \u65E0 DrawCircle\u2014\u2014\u7528 Circle(O, r) \u521B\u5EFA\u5706" },
  { hallucination: "AddPoint", correct: "Point({x,y})", reason: "GeoGebra \u65E0 AddPoint\u2014\u2014\u7528 Point \u547D\u4EE4\u521B\u5EFA" },
  { hallucination: "MoveObject", correct: "SetCoords(obj, x, y)", reason: "GeoGebra \u65E0 MoveObject\u2014\u2014\u79FB\u52A8\u5BF9\u8C61\u7528 SetCoords \u547D\u4EE4" },
  { hallucination: "Drag", correct: "SetCoords(obj, x, y)", reason: "GeoGebra \u65E0 Drag\u2014\u2014\u79FB\u52A8\u5BF9\u8C61\u7528 SetCoords" },
  { hallucination: "Play", correct: "StartAnimation()", reason: "GeoGebra \u65E0 Play\u2014\u2014\u542F\u52A8\u52A8\u753B\u7528 StartAnimation()" },
  { hallucination: "Animate", correct: "StartAnimation()", reason: "GeoGebra \u65E0 Animate \u547D\u4EE4\u2014\u2014\u7528 StartAnimation() \u6216 animate op" },
  { hallucination: "ExportGIF", correct: "\u65E0\u66FF\u4EE3\uFF08\u524D\u7AEF\u5904\u7406\uFF09", reason: "GeoGebra \u65E0 ExportGIF\u2014\u2014\u5BFC\u51FA\u7531\u524D\u7AEF JS \u5904\u7406\uFF0C\u4E0D\u901A\u8FC7 GGB \u547D\u4EE4" },
  { hallucination: "ExportImage", correct: "\u65E0\u66FF\u4EE3\uFF08\u524D\u7AEF\u5904\u7406\uFF09", reason: "GeoGebra \u65E0 ExportImage\u2014\u2014\u5BFC\u51FA\u7531\u524D\u7AEF JS \u5904\u7406" },
  { hallucination: "Variable", correct: "\u76F4\u63A5\u8D4B\u503C", reason: "GeoGebra \u65E0 Variable \u547D\u4EE4\u2014\u2014\u76F4\u63A5 x = 3 \u5373\u53EF\u5B9A\u4E49\u53D8\u91CF" },
  { hallucination: "Parameter", correct: "Slider(min, max, ...)", reason: "GeoGebra \u65E0 Parameter \u547D\u4EE4\u2014\u2014\u7528 Slider \u521B\u5EFA\u53EF\u8C03\u53C2\u6570" },
  { hallucination: "SetOpaque", correct: "SetLineOpacity", reason: "GeoGebra \u65E0 SetOpaque\u2014\u2014\u900F\u660E\u5EA6\u7528 SetLineOpacity" },
  { hallucination: "El", correct: "Element", reason: "GeoGebra \u65E0 El\u2014\u2014\u5217\u8868\u53D6\u5143\u7D20\u7528 Element(list, n)\uFF085.4.927 \u5B9E\u6D4B\u53EF\u7528\uFF09" },
  { hallucination: "Round", correct: "round", reason: "\u81EA\u6258\u7BA1 bundle\uFF085.4.927\uFF09\u65E0\u5927\u5199 Round \u547D\u4EE4\u2014\u2014\u53D6\u6574\u7528\u5C0F\u5199\u51FD\u6570 round(x, n)\uFF08\u5C0F\u5199\u5B9E\u6D4B\u53EF\u7528\uFF09" },
  { hallucination: "SetVisible", correct: "SetVisibleInView(obj, 1, true/false)", reason: "GGB \u65E0 SetVisible \u547D\u4EE4\uFF085.4.927 \u5B9E\u6D4B\u9759\u9ED8 no-op\uFF09\u2014\u2014\u663E\u9690\u8865\u89C6\u56FE\u53F7\uFF1ASetVisibleInView(obj, 1, false)" },
  { hallucination: "GetVisibleInView", correct: "\u65E0\u547D\u4EE4\u66FF\u4EE3\uFF08get_object_info \u5DE5\u5177\uFF09", reason: "GGB \u65E0 GetVisibleInView \u67E5\u8BE2\u547D\u4EE4\u2014\u2014\u663E\u9690\u72B6\u6001\u7528 get_object_info \u5DE5\u5177\u8BFB\u53D6" },
  { hallucination: "IsVisibleInView", correct: "\u65E0\u547D\u4EE4\u66FF\u4EE3\uFF08get_object_info \u5DE5\u5177\uFF09", reason: "GGB \u65E0 IsVisibleInView \u67E5\u8BE2\u547D\u4EE4\u2014\u2014\u663E\u9690\u72B6\u6001\u7528 get_object_info \u5DE5\u5177\u8BFB\u53D6" }
];
function filterCommandsByMode(mode) {
  return GGB_COMMAND_DEFS.filter((c) => c.modes.includes(mode));
}
function findCommand(name) {
  return GGB_COMMAND_DEFS.find((c) => c.name.toLowerCase() === name.toLowerCase());
}
function findHallucination(name) {
  return HALLUCINATION_MAP.find(
    (h) => h.hallucination.toLowerCase() === name.toLowerCase()
  );
}
function buildCommandReference(mode, domain) {
  const cmds = filterCommandsByMode(mode);
  const groups = /* @__PURE__ */ new Map();
  for (const c of cmds) {
    const list = groups.get(c.category) || [];
    list.push(c);
    groups.set(c.category, list);
  }
  const categoryLabels = {
    point: "\u70B9/\u5411\u91CF",
    line: "\u7EBF/\u7EBF\u6BB5",
    circle: "\u5706/\u5706\u9525\u66F2\u7EBF",
    polygon: "\u591A\u8FB9\u5F62",
    function: "\u51FD\u6570/\u66F2\u7EBF",
    slider: "\u6ED1\u5757/\u52A8\u753B",
    metric: "\u5EA6\u91CF",
    transform: "\u53D8\u6362",
    list: "\u5217\u8868/\u5E8F\u5217",
    text: "\u6587\u672C/\u6807\u7B7E",
    style: "\u6837\u5F0F/\u5C5E\u6027",
    logic: "\u903B\u8F91/\u5224\u5B9A",
    equation: "\u65B9\u7A0B\u6C42\u89E3",
    solid3d: "3D \u51E0\u4F55\u4F53",
    curve3d: "3D \u66F2\u7EBF\u66F2\u9762",
    intersect3d: "3D \u6C42\u4EA4/\u622A\u9762",
    measure3d: "3D \u5EA6\u91CF",
    view: "\u89C6\u56FE\u63A7\u5236",
    view3d: mode === "3d" ? "3D \u89C6\u56FE(\u614E\u7528)" : ""
  };
  const lines = [];
  for (const [cat, catCmds] of groups) {
    const label = categoryLabels[cat];
    if (!label || cat === "view3d" && mode === "2d") continue;
    const cmdStr = catCmds.map((c) => {
      return `${c.name}(${c.signature.split(" | ")[0].split("(")[1] || ""}`;
    }).join(" ");
    lines.push(`${label}\uFF1A${cmdStr}`);
  }
  if (domain === "physics") {
    lines.unshift("\u269B \u7269\u7406\u57DF\u63A8\u8350\u4F18\u5148\u4F7F\u7528\uFF1AVector Tangent Normal Integral NDerivative SolveODE Sequence");
  }
  const aliasParts = [];
  for (const c of cmds) {
    if (c.aliases && c.aliases.length > 0) {
      aliasParts.push(c.aliases.map((a) => `${a}\u2192${c.name}`).join(" "));
    }
  }
  if (aliasParts.length > 0) {
    lines.push(`
\u3010\u4E2D\u6587\u610F\u56FE\u2192\u547D\u4EE4\u901F\u67E5\u3011${aliasParts.join("  ")}`);
  }
  return lines.join("\n");
}
function buildHallucinationWarnings(mode) {
  const relevant = mode === "3d" ? HALLUCINATION_MAP.filter((h) => h.hallucination.startsWith("Set")) : HALLUCINATION_MAP;
  const modeNote = mode === "3d" ? "\n\u30103D \u989D\u5916\u7981\u6B62\u3011SetFilling SetPointSize SetAxesRatio SetViewDirection SetCaption ShowLabel SetLabelMode Rename ZoomIn \u2014 3D \u4E2D\u4E0D\u53EF\u7528\uFF0C\u89C1 3D \u89C4\u5219" : "";
  return relevant.map((h) => `\u274C ${h.hallucination} \u2192 \u2705 ${h.correct}\uFF08${h.reason}\uFF09`).join("\n") + modeNote;
}

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = /* @__PURE__ */ Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// src/commands.ts
var GGB_FORBIDDEN_COMMANDS = [
  "DSolve",
  "ContourPlot",
  "Plot3D",
  "VectorField",
  "StreamPlot",
  "FieldLine",
  "StreamLine",
  "SetOpacity",
  "SetTransparency",
  "ExportGIF",
  "ExportImage",
  "Variable",
  "Parameter",
  "PauseAnimation",
  "StopAnimation",
  "Animate",
  "Play",
  "DrawPoint",
  "DrawLine",
  "DrawCircle",
  "AddPoint",
  "MoveObject",
  "Drag",
  "AnimateRotation",
  // ⚠ 安全：允许任意 JS 执行，配合 useBrowserForJS:true 可窃取 localStorage 的 API Key
  "JavaScript",
  "Execute"
];
var GGB_5STAGE_FLOW = `
5\u9636\u6BB5\u6D41\u7A0B\uFF1A\u2460\u6ED1\u5757\u2192\u2461Point\u58F0\u660E\u2192\u2462\u7EBF/\u5706(\u5F15\u7528Point)\u2192\u2463\u52A8\u753B/\u8F68\u8FF9\u2192\u2464\u5C5E\u6027(SetLineOpacity\u7B49)
\u94C1\u5F8B\uFF1A\u52A8\u6001\u7EBF\u6BB5\u5FC5\u987B\u5148 Point \u518D Segment(A,B)\uFF0C\u7981\u6B62 Segment((x,y),(x,y))\u3002
3D\u94C1\u5F8B\uFF1A
\u2460\u6240\u6709\u70B9\u7528 (x,y,z) \u4E09\u7EF4\u5750\u6807
\u2461\u2605 \u6B63\u65B9\u4F53\u4F18\u5148\u7528 Cube(A,B) \u4E24\u70B9\u5F62\u5F0F\uFF1AA\u3001B \u4E3A\u5E95\u9762\u4E00\u6761\u68F1\u7684\u76F8\u90BB\u9876\u70B9\uFF0C\u7B2C\u4E09\u4E2A\u9876\u70B9\u81EA\u52A8\u751F\u6210\uFF0C\u6B63\u65B9\u4F53\u53EF\u7ED5 AB \u8FB9\u65CB\u8F6C\u3002\u907F\u514D Cube(A,B,C)\u2014\u2014\u4E09\u70B9\u5FC5\u987B\u7CBE\u786E\u6784\u6210\u6B63\u65B9\u5F62\u5426\u5219\u53EA\u753B\u70B9\u4E0D\u51FA\u4F53\u3002\u9700\u8981\u56FA\u5B9A\u671D\u5411\u65F6\u624D\u7528 Cube(A,B,C) \u5E76\u786E\u4FDD\u4E09\u70B9\u6784\u6210\u6B63\u65B9\u5F62\u3002
\u2462IntersectPath(plane,poly) \u5F97\u622A\u9762
\u2463SetViewDirection \u5728\u7EAF 3D applet \u4E2D\u4E0D\u53EF\u7528\uFF0C\u7981\u6B62\u751F\u6210
\u2464SetColor obj,r,g,b \u4E2D r/g/b \u662F 0~1 \u6D6E\u70B9\uFF08\u5982 SetColor(c, 0.9, 0.2, 0.2)\uFF09\uFF1B\u5199 0~255 \u6574\u6570\u4F1A\u88AB\u5F15\u64CE \xD7255 \u94B3\u6210\u767D\u8272\uFF085.4.927 \u5B9E\u6D4B + \u5B98\u65B9\u624B\u518C\uFF09
\u2465SetFilling \u5728 3D \u4E2D\u5BF9 Sphere/Cube \u7B49\u7ACB\u4F53\u65E0\u6548\u2014\u2014\u7528 style op \u7684 opacity \u5B57\u6BB5\u66FF\u4EE3
\u2466SetAxesRatio \u5728 3D \u4E2D\u4E0D\u53EF\u9760\u2014\u2014\u5982\u9700\u7B49\u6BD4\u4F8B\u5750\u6807\u8F74\u7528 view op \u66FF\u4EE3\uFF08\u89C1 3D \u6A21\u5F0F\u89C4\u5219\uFF09
`;

// src/schema.ts
var Color = external_exports.string().regex(/^#[0-9a-fA-F]{6}$/, "\u989C\u8272\u9700\u4E3A #RRGGBB \u5F62\u5F0F");
function stripStringLiterals(s) {
  return s.replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, "").replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, "");
}
var FORBIDDEN_CMD_RE = new RegExp(
  `\\b(?:${GGB_FORBIDDEN_COMMANDS.join("|")})\\s*\\(`,
  "i"
);
var DANGEROUS_TEXT_RE = /<script\b|javascript:|(?:^|[^\w])on\w+\s*=/i;
function withTextSafety(s) {
  return s.refine((v) => !DANGEROUS_TEXT_RE.test(v), "\u6587\u672C\u542B\u6709\u5371\u9669\u7247\u6BB5");
}
var SafeCmd = external_exports.string().min(1).max(500).refine((s) => !/<script\b|javascript:|(?:^|[^\w])on\w+\s*=/i.test(s), "\u547D\u4EE4\u542B\u6709\u5371\u9669\u7247\u6BB5").refine(
  (s) => !FORBIDDEN_CMD_RE.test(stripStringLiterals(s)),
  "\u547D\u4EE4\u4F7F\u7528\u4E86\u4E0D\u5B58\u5728\u7684 GGB \u547D\u4EE4\uFF08\u547D\u4E2D\u786C\u9ED1\u540D\u5355\uFF09\uFF0C\u8BF7\u5220\u9664\u6216\u6539\u7528\u767D\u540D\u5355\u547D\u4EE4"
);
var Identifier = external_exports.string().min(1).max(40).regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "\u6807\u8BC6\u7B26\u4EC5\u5141\u8BB8 ASCII \u5B57\u6BCD\u6570\u5B57\u4E0B\u5212\u7EBF");
var CoordExpr = external_exports.string().min(1).max(80).refine((s) => !/[;{}]/.test(s), "\u5750\u6807\u8868\u8FBE\u5F0F\u4E0D\u80FD\u5305\u542B\u5206\u53F7\u6216\u82B1\u62EC\u53F7").refine(
  (s) => !FORBIDDEN_CMD_RE.test(stripStringLiterals(s)),
  "\u5750\u6807\u8868\u8FBE\u5F0F\u4E0D\u80FD\u8C03\u7528 GGB \u547D\u4EE4"
);
var NumLike = external_exports.preprocess((v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (trimmed === "") return v;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : v;
  }
  return v;
}, external_exports.number());
var IntLike = external_exports.preprocess((v) => {
  if (typeof v === "number") return Math.trunc(v);
  if (typeof v === "string") {
    const n = Number(v.trim());
    return Number.isFinite(n) ? Math.trunc(n) : v;
  }
  return v;
}, external_exports.number().int());
var BoolLike = external_exports.preprocess((v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1" || s === "yes" || s === "on") return true;
    if (s === "false" || s === "0" || s === "no" || s === "off") return false;
  }
  if (typeof v === "number") return v !== 0;
  return v;
}, external_exports.boolean());
var PhysicsConstantName = external_exports.enum([
  "g",
  "c",
  "e",
  "eps0",
  "mu0",
  "k_e",
  "Grav",
  "h",
  "k_B"
]);
var Command = external_exports.discriminatedUnion("op", [
  external_exports.object({ op: external_exports.literal("eval"), cmd: SafeCmd }),
  external_exports.object({
    op: external_exports.literal("slider"),
    name: Identifier,
    min: NumLike,
    max: NumLike,
    step: NumLike.refine((n) => n > 0, "step \u5FC5\u987B > 0"),
    value: NumLike,
    unit: withTextSafety(external_exports.string().max(8)).optional(),
    label: withTextSafety(external_exports.string().max(40)).optional()
  }),
  external_exports.object({
    op: external_exports.literal("animate"),
    target: Identifier,
    speed: NumLike.optional(),
    on: BoolLike,
    repeat: external_exports.enum(["oscillating", "increasing", "once"]).optional()
  }),
  external_exports.object({ op: external_exports.literal("trace"), target: Identifier, on: BoolLike }),
  external_exports.object({
    op: external_exports.literal("style"),
    target: Identifier,
    color: Color.optional(),
    thickness: IntLike.refine((n) => n >= 1 && n <= 13, "thickness \u5E94\u5728 1\u201313 \u4E4B\u95F4").optional(),
    visible: BoolLike.optional(),
    opacity: NumLike.refine((n) => n >= 0 && n <= 1, "opacity \u5E94\u5728 0\u20131 \u4E4B\u95F4").optional(),
    dashed: BoolLike.optional(),
    pointSize: IntLike.refine((n) => n >= 1 && n <= 9, "pointSize \u5E94\u5728 1\u20139 \u4E4B\u95F4").optional(),
    pointStyle: IntLike.refine((n) => n >= -1 && n <= 9, "pointStyle \u5E94\u5728 -1~9 \u4E4B\u95F4").optional()
  }),
  external_exports.object({
    op: external_exports.literal("view"),
    xmin: NumLike,
    xmax: NumLike,
    ymin: NumLike,
    ymax: NumLike,
    axesUnit: external_exports.tuple([external_exports.string().max(8), external_exports.string().max(8)]).optional()
  }),
  external_exports.object({ op: external_exports.literal("caption"), target: Identifier, text: withTextSafety(external_exports.string().max(120)) }),
  external_exports.object({ op: external_exports.literal("delete"), target: Identifier }),
  external_exports.object({ op: external_exports.literal("reset") }),
  // —— 物理基元 ——
  external_exports.object({
    op: external_exports.literal("vector"),
    name: Identifier,
    from: CoordExpr,
    to: CoordExpr,
    color: Color.optional(),
    label: withTextSafety(external_exports.string().max(40)).optional()
  }),
  external_exports.object({
    op: external_exports.literal("forceDiagram"),
    at: CoordExpr,
    forces: external_exports.array(
      external_exports.object({
        name: Identifier,
        vec: external_exports.string().max(80).refine(
          (s) => /^\([\s\S]*\)$/.test(s.trim()),
          "forceDiagram.vec \u5FC5\u987B\u5199\u6210\u5750\u6807/\u77E2\u91CF\u5B57\u9762\u91CF (dx, dy) \u5F62\u5F0F\uFF0C\u4E0D\u8981\u5F15\u7528\u672A\u58F0\u660E\u5BF9\u8C61"
        ),
        color: Color.optional(),
        label: withTextSafety(external_exports.string().max(40)).optional()
      })
    ).min(1).max(8)
  }),
  external_exports.object({
    op: external_exports.literal("physicsTrace"),
    target: Identifier,
    mode: external_exports.enum(["trail", "stroboscopic"]),
    fade: BoolLike.optional()
  }),
  external_exports.object({
    op: external_exports.literal("unitAxes"),
    xUnit: withTextSafety(external_exports.string().max(8)),
    yUnit: withTextSafety(external_exports.string().max(8)),
    xLabel: withTextSafety(external_exports.string().max(20)).optional(),
    yLabel: withTextSafety(external_exports.string().max(20)).optional()
  }),
  external_exports.object({
    op: external_exports.literal("constants"),
    names: external_exports.array(PhysicsConstantName).min(1).max(8)
  })
]);
var AIResponse = external_exports.object({
  explanation: external_exports.string().max(500),
  commands: external_exports.array(Command).max(64),
  /** AI 不确定需求时反问用户；有 ask 时 commands 必须为空数组 */
  ask: external_exports.string().max(300).optional(),
  /** Phase 2 自检报告（生成+自检同一响应）。可选，由 compile prompt 按需触发 */
  self_check: external_exports.string().max(400).optional()
}).superRefine((data, ctx) => {
  if (data.ask && data.commands.length > 0) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      path: ["ask"],
      message: "\u6709 ask \u53CD\u95EE\u65F6 commands \u5FC5\u987B\u4E3A\u7A7A\u6570\u7EC4"
    });
  }
  data.commands.forEach((c, i) => {
    if (c.op === "slider") {
      if (c.min >= c.max) {
        ctx.addIssue({
          code: external_exports.ZodIssueCode.custom,
          path: ["commands", i, "min"],
          message: "slider.min \u5FC5\u987B\u5C0F\u4E8E slider.max"
        });
      } else if (c.value < c.min || c.value > c.max) {
        ctx.addIssue({
          code: external_exports.ZodIssueCode.custom,
          path: ["commands", i, "value"],
          message: "slider \u521D\u503C value \u9700\u843D\u5728 [min, max] \u533A\u95F4\u5185"
        });
      }
    } else if (c.op === "view") {
      if (c.xmin >= c.xmax || c.ymin >= c.ymax) {
        ctx.addIssue({
          code: external_exports.ZodIssueCode.custom,
          path: ["commands", i],
          message: "view \u8981\u6C42 xmin < xmax \u4E14 ymin < ymax"
        });
      }
    }
  });
});
function formatZodError(err) {
  return err.issues.map((i) => `${i.path.join(".") || "<root>"}: ${i.message}`).slice(0, 5).join("; ");
}

// src/envConfig.ts
var DEFAULT_BASE_URL = "https://api.deepseek.com";
var DEFAULT_MODEL = "deepseek-chat";
var REASONING_LEVELS = ["none", "low", "medium", "high", "max"];
var MissingKeyError = class extends Error {
  constructor() {
    super(
      "\u7F3A\u5C11 API Key\u3002\u8BF7\u8BBE\u7F6E\u73AF\u5883\u53D8\u91CF AIGGB_API_KEY\uFF08\u6216\u7528 --api-key \u4F20\u5165\uFF09\u3002\n\u5176\u4ED6\u53EF\u9009\u73AF\u5883\u53D8\u91CF\uFF1AAIGGB_BASE_URL\uFF08\u9ED8\u8BA4 https://api.deepseek.com\uFF09\u3001AIGGB_MODEL\uFF08\u9ED8\u8BA4 deepseek-chat\uFF09\u3001\nAIGGB_LIGHT_MODEL\u3001AIGGB_REASONING_EFFORT\uFF08none|low|high|max\uFF0C\u9ED8\u8BA4 none\uFF09\u3001AIGGB_MAX_OUTPUT_TOKENS\u3001AIGGB_TEMPERATURE\u3002"
    );
    this.name = "MissingKeyError";
  }
};
function normalizeEffort(v) {
  if (!v) return void 0;
  const s = v.trim().toLowerCase();
  return REASONING_LEVELS.includes(s) ? s : void 0;
}
function num(v) {
  if (!v) return void 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : void 0;
}
function buildAIConfig(flags) {
  const env = process.env;
  const apiKey = flags.apiKey ?? env.AIGGB_API_KEY;
  if (!apiKey) throw new MissingKeyError();
  return {
    provider: "custom",
    baseURL: flags.baseUrl ?? env.AIGGB_BASE_URL ?? DEFAULT_BASE_URL,
    apiKey,
    model: flags.model ?? env.AIGGB_MODEL ?? DEFAULT_MODEL,
    lightModel: flags.lightModel ?? env.AIGGB_LIGHT_MODEL,
    reasoningEffort: normalizeEffort(flags.reasoningEffort ?? env.AIGGB_REASONING_EFFORT) ?? "none",
    maxOutputTokens: flags.maxOutputTokens ?? num(env.AIGGB_MAX_OUTPUT_TOKENS),
    temperature: flags.temperature ?? num(env.AIGGB_TEMPERATURE)
  };
}

// src/aiClient.ts
function resolveModel(config, role) {
  switch (role) {
    case "light":
      return config.lightModel ?? config.flashModel ?? config.model;
    case "heavy":
      return config.model;
    case "agent":
      return config.agentModel ?? config.model;
    case "vision":
      return config.visionModel ?? config.model;
  }
}
function getProviderQuirks(config) {
  const fingerprint = [
    (config.provider ?? "").toLowerCase(),
    (config.model ?? "").toLowerCase(),
    (config.agentModel ?? "").toLowerCase()
  ].join(" ");
  if (/deepseek/.test(fingerprint)) {
    return {
      agentTemperature: 0.05,
      agentForceUserPrefix: true,
      maxToolsPerTurn: 4,
      // DeepSeek 单轮 >4 个 tool 时后半易丢失
      streamsFinishReason: false,
      supportsThinking: true,
      // V4 原生 thinking
      reasoningEffort: "high",
      // 官方默认档位
      mustRoundtripReasoning: true,
      // ★ 多轮必须回传 reasoning_content
      contextWindow: 1e6,
      // V4 百万上下文
      thinkingIgnoresTemperature: true
      // 官方：thinking 模式不支持 temperature
    };
  }
  if (/zhipu|bigmodel|glm/.test(fingerprint)) {
    return {
      streamsFinishReason: true,
      supportsThinking: true,
      mustRoundtripReasoning: false
    };
  }
  return { streamsFinishReason: true };
}
function isZhipuProvider(config) {
  const fp = [
    (config.provider ?? "").toLowerCase(),
    (config.baseURL ?? "").toLowerCase(),
    (config.model ?? "").toLowerCase()
  ].join(" ");
  return /zhipu|bigmodel|glm/.test(fp);
}
function isDeepSeek(config) {
  const fp = [
    (config.provider ?? "").toLowerCase(),
    (config.baseURL ?? "").toLowerCase(),
    (config.model ?? "").toLowerCase(),
    (config.agentModel ?? "").toLowerCase()
  ].join(" ");
  return /deepseek/.test(fp);
}
function buildThinkingParam(config) {
  const effort = config.reasoningEffort;
  if (isZhipuProvider(config)) {
    return { thinking: { type: effort && effort !== "none" ? "enabled" : "disabled" } };
  }
  if (isDeepSeek(config) && getProviderQuirks(config).supportsThinking === true) {
    return { reasoning_effort: effort === "medium" ? "high" : effort || "none" };
  }
  if (effort && getProviderQuirks(config).supportsThinking) {
    return { reasoning_effort: effort };
  }
  return null;
}
var AIError = class extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
    this.name = "AIError";
  }
  cause;
};
var AISchemaError = class extends Error {
  constructor(message, raw, detail) {
    super(message);
    this.raw = raw;
    this.detail = detail;
    this.name = "AISchemaError";
  }
  raw;
  detail;
};
var AI_CALL_TIMEOUT_MS = 18e4;
function withCallTimeout(signal, ms) {
  const ctrl = new AbortController();
  if (signal?.aborted) {
    ctrl.abort(signal.reason);
    return { signal: ctrl.signal, done: () => {
    } };
  }
  const onOuterAbort = () => ctrl.abort(signal?.reason);
  if (signal) signal.addEventListener("abort", onOuterAbort, { once: true });
  const timer = setTimeout(
    () => ctrl.abort(new DOMException(`AI \u8C03\u7528\u8D85\u65F6\uFF08${Math.round(ms / 1e3)}s \u65E0\u54CD\u5E94\uFF0C\u5DF2\u4E2D\u65AD\uFF09`, "TimeoutError")),
    ms
  );
  return {
    signal: ctrl.signal,
    done: () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onOuterAbort);
    }
  };
}
async function fetchCompletion(config, body, signal) {
  const baseURL = config.baseURL.replace(/\/+$/, "");
  const url = `${baseURL}/chat/completions`;
  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(body),
      signal
    });
  } catch (err) {
    throw new AIError(
      err instanceof Error ? `\u7F51\u7EDC\u9519\u8BEF\uFF1A${err.message}` : "\u7F51\u7EDC\u9519\u8BEF",
      err
    );
  }
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new AIError(`HTTP ${resp.status} ${resp.statusText} ${text.slice(0, 300)}`);
  }
  return resp;
}
async function callAPI(config, body, signal) {
  const t = withCallTimeout(signal, config.timeoutMs ?? AI_CALL_TIMEOUT_MS);
  try {
    const resp = await fetchCompletion(config, body, t.signal);
    try {
      return await resp.json();
    } catch (err) {
      throw new AIError("\u54CD\u5E94\u4E0D\u662F\u5408\u6CD5 JSON", err);
    }
  } finally {
    t.done();
  }
}
function getProviderCapabilities(config) {
  const fp = [
    (config.provider ?? "").toLowerCase(),
    (config.baseURL ?? "").toLowerCase()
  ].join(" ");
  if (/openai|glm|moonshot|zhipu|siliconflow|api\.together|fireworks/.test(fp)) {
    return { jsonSchema: true };
  }
  return { jsonSchema: false };
}
var AI_RESPONSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    explanation: { type: "string", description: "\u64CD\u4F5C\u8BF4\u660E\uFF0C\u2264500 \u5B57" },
    commands: {
      type: "array",
      description: "GGB \u547D\u4EE4\u5217\u8868\uFF0C\u226464 \u6761",
      items: {
        type: "object",
        properties: {
          op: {
            type: "string",
            enum: [
              "eval",
              "slider",
              "animate",
              "trace",
              "style",
              "view",
              "caption",
              "delete",
              "reset",
              "vector",
              "forceDiagram",
              "physicsTrace",
              "unitAxes",
              "constants"
            ]
          }
        },
        required: ["op"]
      }
    },
    ask: { type: "string", description: "\u53CD\u95EE\u7528\u6237\u7684\u5185\u5BB9\uFF08\u4E0E commands \u4E92\u65A5\uFF0C\u6709\u6B64\u5B57\u6BB5\u65F6 commands \u4E3A\u7A7A\u6570\u7EC4\uFF09" },
    self_check: { type: "string", description: "AI \u81EA\u68C0\u62A5\u544A\uFF0C\u2264400 \u5B57" }
  },
  required: ["explanation", "commands"],
  additionalProperties: false
};
async function chat(config, messages, signal, modelOverride, onUsage) {
  const caps = getProviderCapabilities(config);
  const body = {
    model: modelOverride ?? config.model,
    messages,
    temperature: config.temperature ?? 0.2,
    stream: false
  };
  if (config.maxOutputTokens && config.maxOutputTokens > 0) {
    body[getProviderQuirks(config).maxTokensField ?? "max_tokens"] = config.maxOutputTokens;
  }
  const thinking = buildThinkingParam(config);
  if (thinking) Object.assign(body, thinking);
  const usedJsonSchema = caps.jsonSchema;
  if (usedJsonSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: "ai_response",
        strict: false,
        // false 以兼容 optional 字段 + discriminatedUnion
        schema: AI_RESPONSE_JSON_SCHEMA
      }
    };
  } else {
    body.response_format = { type: "json_object" };
  }
  let data;
  try {
    data = await callAPI(config, body, signal);
  } catch (err) {
    if (usedJsonSchema && err instanceof AIError && /400/.test(err.message)) {
      console.warn("[aiClient] json_schema \u8BF7\u6C42\u88AB\u62D2\uFF08400\uFF09\uFF0C\u56DE\u9000 json_object \u91CD\u8BD5");
      body.response_format = { type: "json_object" };
      data = await callAPI(config, body, signal);
    } else {
      throw err;
    }
  }
  const raw = data.choices?.[0]?.message?.content ?? "";
  if (!raw) {
    throw new AISchemaError("AI \u54CD\u5E94\u4E3A\u7A7A", raw, "choices[0].message.content \u4E3A\u7A7A");
  }
  const cleaned = stripCodeFence(raw);
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new AISchemaError(
      "AI \u8FD4\u56DE\u7684\u4E0D\u662F\u5408\u6CD5 JSON",
      cleaned,
      e instanceof Error ? e.message : "JSON.parse \u5931\u8D25"
    );
  }
  const result = AIResponse.safeParse(parsed);
  if (!result.success) {
    throw new AISchemaError(
      "AI \u8F93\u51FA\u4E0D\u7B26\u5408 schema",
      cleaned,
      formatZodError(result.error)
    );
  }
  if (onUsage && data.usage) {
    onUsage({
      prompt: data.usage.prompt_tokens ?? 0,
      completion: data.usage.completion_tokens ?? 0,
      reasoning: data.usage.completion_tokens_details?.reasoning_tokens,
      cacheHit: data.usage.prompt_cache_hit_tokens ?? data.usage.prompt_tokens_details?.cached_tokens
    });
  }
  return result.data;
}
async function chatRaw(config, messages, signal, modelOverride, maxTokens, jsonMode, onUsage) {
  const body = {
    model: modelOverride ?? config.model,
    messages,
    temperature: config.temperature ?? 0.2,
    stream: false
  };
  const effectiveMax = maxTokens ?? (config.maxOutputTokens && config.maxOutputTokens > 0 ? config.maxOutputTokens : void 0);
  if (effectiveMax) body.max_tokens = effectiveMax;
  if (jsonMode) {
    body.response_format = { type: "json_object" };
    if (!body.max_tokens) body.max_tokens = 4096;
  }
  const thinkingParam = buildThinkingParam(config);
  if (thinkingParam) Object.assign(body, thinkingParam);
  const data = await callAPI(config, body, signal);
  if (onUsage && data.usage) {
    onUsage({
      prompt: data.usage.prompt_tokens ?? 0,
      completion: data.usage.completion_tokens ?? 0,
      reasoning: data.usage.completion_tokens_details?.reasoning_tokens,
      cacheHit: data.usage.prompt_cache_hit_tokens ?? data.usage.prompt_tokens_details?.cached_tokens
    });
  }
  return data.choices?.[0]?.message?.content ?? "";
}
function stripCodeFence(s) {
  const t = s.replace(/^\uFEFF/, "").trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return m ? m[1].trim() : t;
}

// src/prompts.ts
var GENERAL_FEW_SHOT = `
\u3010\u53C2\u8003\u793A\u4F8B \u2014 \u4EE5\u4E0B\u4E3A\u7ECF\u8FC7\u9A8C\u8BC1\u7684\u6B63\u786E pattern\uFF0C\u76F4\u63A5\u6A21\u4EFF\u3011

\u793A\u4F8B 1\uFF1A2D \u51E0\u4F55 + \u52A8\u753B + \u8F68\u8FF9
\u7528\u6237\uFF1A"\u753B\u5355\u4F4D\u5706\uFF0C\u70B9 P \u5728\u5706\u4E0A\u5300\u901F\u65CB\u8F6C\uFF0C\u7559\u8F68\u8FF9\uFF0C\u663E\u793A sin/cos \u7EBF\u6BB5"
\u2192 {"explanation":"\u5355\u4F4D\u5706 + \u4E09\u89D2\u51FD\u6570\u7EBF\u6BB5 + \u52A8\u753B","commands":[
  {"op":"slider","name":"omega","min":0.5,"max":3,"step":0.1,"value":1,"unit":"rad/s","label":"\u89D2\u901F\u5EA6"},
  {"op":"slider","name":"t","min":0,"max":6.283,"step":0.02,"value":0,"unit":"s","label":"\u65F6\u95F4"},
  {"op":"eval","cmd":"O=(0,0)"},
  {"op":"eval","cmd":"c1=Circle(O,1)"},
  {"op":"style","target":"c1","color":"#1e88e5","thickness":2},
  {"op":"eval","cmd":"P=(cos(omega*t), sin(omega*t))"},
  {"op":"style","target":"P","color":"#e53935","pointSize":5},
  {"op":"eval","cmd":"cosPt=(cos(omega*t),0)"},
  {"op":"eval","cmd":"sinPt=(0,sin(omega*t))"},
  {"op":"eval","cmd":"rSeg=Segment(O,P)"},
  {"op":"style","target":"rSeg","color":"#43a047","thickness":2},
  {"op":"eval","cmd":"sinSeg=Segment(P,cosPt)"},
  {"op":"style","target":"sinSeg","color":"#fb8c00","dashed":true},
  {"op":"eval","cmd":"cosSeg=Segment(P,sinPt)"},
  {"op":"style","target":"cosSeg","color":"#8e24aa","dashed":true},
  {"op":"trace","target":"P","on":true},
  {"op":"view","xmin":-1.5,"xmax":1.5,"ymin":-1.5,"ymax":1.5},
  {"op":"animate","target":"t","speed":1,"on":true,"repeat":"oscillating"}
]}

\u793A\u4F8B 2\uFF1A2D \u51FD\u6570\u65CF + \u53C2\u6570\u6ED1\u5757
\u7528\u6237\uFF1A"\u753B\u6B63\u5F26\u51FD\u6570\u65CF y=A\xB7sin(kx+\u03C6)\uFF0CA/k/\u03C6 \u7528\u6ED1\u5757\u63A7\u5236\uFF0C\u533A\u95F4 -2\u03C0 \u5230 2\u03C0"
\u2192 {"explanation":"\u4E09\u53C2\u6570\u53EF\u8C03\u7684\u6B63\u5F26\u51FD\u6570\u65CF","commands":[
  {"op":"slider","name":"A","min":0.5,"max":3,"step":0.1,"value":1,"label":"\u632F\u5E45"},
  {"op":"slider","name":"kw","min":0.5,"max":5,"step":0.1,"value":1,"label":"\u9891\u7387"},
  {"op":"slider","name":"phi","min":-3.1416,"max":3.1416,"step":0.05,"value":0,"unit":"rad","label":"\u76F8\u4F4D"},
  {"op":"eval","cmd":"f(x)=A*sin(kw*x+phi)"},
  {"op":"style","target":"f","color":"#1e88e5","thickness":2},
  {"op":"eval","cmd":"topLine: y=A"},
  {"op":"eval","cmd":"botLine: y=-A"},
  {"op":"style","target":"topLine","color":"#9e9e9e","dashed":true},
  {"op":"style","target":"botLine","color":"#9e9e9e","dashed":true},
  {"op":"view","xmin":-6.283,"xmax":6.283,"ymin":-3.5,"ymax":3.5}
]}`;
var PHYSICS_FEW_SHOT = `
\u3010\u53C2\u8003\u793A\u4F8B \u2014 \u4EE5\u4E0B\u4E3A\u7ECF\u8FC7\u9A8C\u8BC1\u7684\u6B63\u786E pattern\uFF0C\u76F4\u63A5\u6A21\u4EFF\u3011

\u793A\u4F8B 3\uFF1A2D \u629B\u4F53\u8FD0\u52A8\uFF08\u77E2\u91CF + \u8F68\u8FF9 + \u52A8\u753B\uFF09
\u7528\u6237\uFF1A"\u659C\u629B\u8FD0\u52A8 v0=20 m/s \u4EF0\u89D2 45\xB0"
\u2192 {"explanation":"\u659C\u629B\uFF1A\u5E38\u91CF\u2192\u6ED1\u5757\u2192\u8D28\u70B9\u2192\u901F\u5EA6\u77E2\u91CF\u2192\u8F68\u8FF9\u2192\u5355\u4F4D\u8F74\u2192\u52A8\u753B","commands":[
  {"op":"constants","names":["g"]},
  {"op":"slider","name":"v0","min":1,"max":50,"step":1,"value":20,"unit":"m/s","label":"\u521D\u901F"},
  {"op":"slider","name":"theta","min":0,"max":1.5708,"step":0.01,"value":0.785,"unit":"rad","label":"\u4EF0\u89D2"},
  {"op":"slider","name":"t","min":0,"max":5,"step":0.02,"value":0,"unit":"s","label":"\u65F6\u95F4"},
  {"op":"eval","cmd":"P = (v0*cos(theta)*t, v0*sin(theta)*t - 0.5*g*t^2)"},
  {"op":"style","target":"P","color":"#e53935","pointSize":4},
  {"op":"eval","cmd":"vx = v0*cos(theta)"},
  {"op":"eval","cmd":"vy = v0*sin(theta) - g*t"},
  {"op":"eval","cmd":"Ptip = P + (vx/5, vy/5)"},
  {"op":"vector","name":"vArrow","from":"P","to":"Ptip","color":"#43a047","label":"v"},
  {"op":"physicsTrace","target":"P","mode":"trail"},
  {"op":"unitAxes","xUnit":"m","yUnit":"m"},
  {"op":"view","xmin":-2,"xmax":50,"ymin":-2,"ymax":20},
  {"op":"animate","target":"t","speed":0.5,"on":true,"repeat":"increasing"}
]}

\u793A\u4F8B 4\uFF1A2D \u7535\u573A\u77E2\u91CF\u7F51\u683C\uFF08Sequence \u5D4C\u5957 + \u9664\u96F6\u9632\u62A4\uFF09
\u7528\u6237\uFF1A"\u4E24\u4E2A\u70B9\u7535\u8377\u7684\u7535\u573A\u793A\u610F\u56FE"
\u2192 {"explanation":"\u5076\u6781\u5B50\uFF1AEx/Ey\u5206\u91CF\u51FD\u6570+\u5206\u6BCD+0.01\u9632\u96F6+\u5D4C\u5957Sequence\u77E2\u91CF\u7F51\u683C","commands":[
  {"op":"slider","name":"d","min":1,"max":4,"step":0.1,"value":2,"unit":"m","label":"\u95F4\u8DDD/2"},
  {"op":"slider","name":"qmag","min":1,"max":5,"step":0.5,"value":1,"unit":"","label":"\u7535\u8377\u91CF"},
  {"op":"eval","cmd":"A=(d,0)"},
  {"op":"eval","cmd":"B=(-d,0)"},
  {"op":"style","target":"A","color":"#e53935","pointSize":5},
  {"op":"style","target":"B","color":"#1e88e5","pointSize":5},
  {"op":"eval","cmd":"Ex(x,y)=qmag*(x-d)/((x-d)^2+y^2+0.01)^1.5 - qmag*(x+d)/((x+d)^2+y^2+0.01)^1.5"},
  {"op":"eval","cmd":"Ey(x,y)=qmag*y/((x-d)^2+y^2+0.01)^1.5 - qmag*y/((x+d)^2+y^2+0.01)^1.5"},
  {"op":"eval","cmd":"Emag(x,y)=sqrt(Ex(x,y)^2+Ey(x,y)^2+0.001)"},
  {"op":"eval","cmd":"gridStep=0.4"},
  {"op":"eval","cmd":"arrows=Sequence(Sequence(Vector((i,j),(i+gridStep*Ex(i,j)/Emag(i,j),j+gridStep*Ey(i,j)/Emag(i,j))),i,-4,4,1),j,-3,3,1)"},
  {"op":"style","target":"arrows","color":"#8e24aa"},
  {"op":"unitAxes","xUnit":"m","yUnit":"m"},
  {"op":"view","xmin":-5,"xmax":5,"ymin":-4,"ymax":4}
]}`;
var MODE_2D_HEADER = `
\u3010\u5F53\u524D\u6A21\u5F0F\uFF1A2D \u5E73\u9762\u3011
\u4F60\u6B63\u5728\u4E8C\u7EF4\u5E73\u9762\u753B\u5E03\u4E0A\u4F5C\u56FE\u3002\u53EA\u4F7F\u7528 (x,y) \u5750\u6807\uFF0C\u7981\u6B62 z \u8F74\u548C 3D \u51E0\u4F55\u547D\u4EE4\uFF08Cube/Sphere/Tetrahedron\u2026\uFF09\u3002`;
var MODE_3D_ADDON = `
\u3010\u5F53\u524D\u6A21\u5F0F\uFF1A3D \u4E09\u7EF4\u3011
\u4F60\u6B63\u5728\u4E09\u7EF4\u753B\u5E03\u4E0A\u4F5C\u56FE\u3002\u53EF\u4F7F\u7528 (x,y,z) \u5750\u6807\u548C 3D \u51E0\u4F55\u4F53\u547D\u4EE4\u3002

\u793A\u4F8B 5\uFF1A3D \u6B63\u65B9\u4F53\u622A\u9762
\u7528\u6237\uFF1A"\u753B\u8FB9\u957F 3 \u7684\u6B63\u65B9\u4F53\uFF0C\u663E\u793A\u5E73\u9762 ACF \u622A\u9762"
\u2192 {"explanation":"\u4E24\u70B9 Cube \u6784\u9020\uFF08A/B \u58F0\u660E\u540E C/F \u81EA\u52A8\u751F\u6210\u52FF\u91CD\u58F0\u660E\uFF09+ \u622A\u9762\u9AD8\u4EAE","commands":[
  {"op":"eval","cmd":"A=(0,0,0)"},
  {"op":"eval","cmd":"B=(3,0,0)"},
  {"op":"eval","cmd":"cube=Cube(A,B)"},
  {"op":"style","target":"cube","color":"#90CAF9","opacity":0.3},
  {"op":"eval","cmd":"section=IntersectPath(Plane(A,C,F),cube)"},
  {"op":"style","target":"section","color":"#E91E63","thickness":4},
  {"op":"eval","cmd":"D=(3,3,0)"},
  {"op":"eval","cmd":"E=(0,3,0)"},
  {"op":"view","xmin":-2,"xmax":6,"ymin":-2,"ymax":6}
]}

\u30103D \u94C1\u5F8B\u3011
- \u6B63\u65B9\u4F53\u4F18\u5148\u4E24\u70B9\u5F0F Cube(A,B)\u3002\u622A\u9762\u7528\u5230 A/C/F \u65F6\u52FF\u91CD\u58F0\u660E\uFF08\u5B83\u4EEC\u7531 Cube \u81EA\u52A8\u751F\u6210\uFF09\u3002
- \u2605 Cross(u,v) \u8FD4\u56DE\u81EA\u7531 Vector \u2192 Vector(O,wVec) \u274C \u5D29\u3002\u4E24\u6B65\u6CD5\uFF1Aend = O + wVec; Vector(O,end) \u2713
- \u2605 3D \u7981\u7528\uFF08\u6267\u884C\u5373\u5931\u8D25\uFF09\uFF1ASetViewDirection / SetFilling / SetPointSize / SetAxesRatio / SetCaption / ShowLabel / SetLabelMode / Rename / ZoomIn
  \u66FF\u4EE3\uFF1A\u900F\u660E\u5EA6\u7528 style opacity\uFF1B\u6807\u8BB0\u9876\u70B9\u7528 Sphere(P,0.2)\uFF1B\u6807\u6CE8\u7528 Text("<\u6587\u5B57>", Point)\uFF1B\u89C6\u7A97\u7528 view op
- \u914D\u8272\uFF1A\u51E0\u4F55\u4F53\u4E0D\u900F\u660E #90CAF9\u3001\u622A\u9762 #E91E63`;
var PHYSICS_ADDON = `
\u3010\u7269\u7406\u57DF\u589E\u5F3A\u3011
- \u53C2\u6570 slider \u5E26 unit \u5B57\u6BB5\uFF08m/s, rad, kg, N/m\u2026\uFF09\u3002\u65F6\u95F4\u6ED1\u5757\u547D\u540D\u4E3A t\u3002
- \u7269\u7406\u5E38\u91CF g/c/e\u2026 \u7528 constants op \u6CE8\u5165\uFF08\u793A\u4F8B 3\uFF09\u3002
- \u529B/\u901F\u5EA6\u77E2\u91CF\u7528 forceDiagram \u6216 vector op\u3002\u7981\u6B62 Point+Point\u3002
- \u5206\u6BCD\u542B\u8DDD\u79BB\u5E73\u65B9\u5FC5\u987B +0.001 \u9632\u9664\u96F6\uFF08\u793A\u4F8B 4 \u7684 Ex/Ey \u516C\u5F0F\uFF09\u3002
- \u8F68\u8FF9\u9ED8\u8BA4 trail\uFF1B\u9891\u95EA\u7528 physicsTrace mode=stroboscopic\u3002
- \u2605 Min/Max \u53EA\u652F\u6301\u5355\u53C2\u6570\u5217\u8868 Min({3,1,2})\uFF1B\u4E24\u6570\u53D6\u5C0F/\u53D6\u5927\u5FC5\u987B\u7528 If(c, a, b)\uFF0CMin(a,b)/Max(a,b) \u53CC\u53C2\u6570\u5F62\u5F0F\u6267\u884C\u5931\u8D25\u3002
- \u2605 GGB \u547D\u4EE4\u540D\u5927\u5C0F\u5199\u654F\u611F\uFF1AIf\uFF08\u4E0D\u662F IF\uFF09\u3001Curve\u3001Min\u2014\u2014\u5199\u9519\u5927\u5C0F\u5199\u76F4\u63A5\u5931\u8D25\u3002
- \u9ED8\u8BA4\u914D\u8272\uFF1A\u4F4D\u79FB #1e88e5\u3001\u901F\u5EA6 #43a047\u3001\u52A0\u901F\u5EA6 #fb8c00\u3001\u529B #e53935\u3001\u7535\u573A #8e24aa\u3001\u78C1\u573A #00897b\u3002`;
function buildPromptBase(appMode, domain, phase = "full") {
  const cmdRef = buildCommandReference(appMode, domain);
  const hallucWarn = buildHallucinationWarnings(appMode);
  const phaseIntro = phase === "compile" ? "\u4F60\u662F AiGGB \u547D\u4EE4\u7F16\u8BD1\u5668\u3002\u7528\u6237\u6D88\u606F\u662F\u5DF2\u7CBE\u70BC\u5B8C\u6210\u7684\u7ED8\u56FE\u89C4\u683C\uFF08\u542B\u5168\u90E8\u53C2\u6570\u3001\u914D\u8272\u3001\u52A8\u753B\u7EC6\u8282\uFF09\u3002\u5C06\u5176\u7F16\u8BD1\u4E3A GGB \u547D\u4EE4 JSON\u3002\u7981\u6B62\u53CD\u95EE\u3001\u7981\u6B62\u65B0\u589E\u9700\u6C42\u3001\u7981\u6B62\u6539\u5199\u89C4\u683C\u4E2D\u7684\u53C2\u6570\u4E0E\u5BF9\u8C61\u540D\u3002\u53C2\u8003\u793A\u4F8B\u4E2D\u7684\u547D\u4EE4 pattern\u3002" : "\u4F60\u662F AiGGB \u52A9\u624B\uFF0C\u5C06\u7528\u6237\u7684\u81EA\u7136\u8BED\u8A00\u9700\u6C42\u8F6C\u4E3A GGB \u547D\u4EE4 JSON\u3002\u53C2\u8003\u4EE5\u4E0B\u793A\u4F8B\u76F4\u63A5\u751F\u6210\u6B63\u786E\u8F93\u51FA\u3002";
  const selfCheckSection = phase === "compile" ? '\n\u3010\u81EA\u68C0\u8981\u6C42\u3011JSON \u4E2D\u5FC5\u987B\u5305\u542B "self_check" \u5B57\u6BB5\uFF08\u2264200 \u5B57\uFF09\u3002\u9010\u9879\u6838\u5BF9\uFF1A\u2460 eval \u547D\u4EE4\u540D\u5728\u767D\u540D\u5355\uFF1F\u2461 \u65E0 SetViewDirection/SetFilling \u7B49 3D \u7981\u7528\u547D\u4EE4\uFF1F\u2462 Vector \u53C2\u6570\u5408\u6CD5\uFF08\u975E Point+Point\uFF09\uFF1F\u2463 \u5206\u6BCD +0.001\uFF1F\u2464 \u53C2\u6570\u4E2A\u6570\u5339\u914D\uFF1F\u2465 \u65E0\u4E2D\u6587\u53D8\u91CF\u540D\uFF1F\u2466 \u542B Sequence \u7684\u547D\u4EE4\uFF1A\u5FAA\u73AF\u53D8\u91CF\u662F\u5355\u4E2A\u5B57\u6BCD\u3001\u533A\u95F4\u662F\u9017\u53F7\u5206\u9694\u7684\u4E09\u4E2A\u72EC\u7ACB\u53C2\u6570\u3001\u62EC\u53F7\u9010\u5C42\u95ED\u5408\u3001\u65E0\u300C\u9017\u53F7\u8BEF\u5199\u6210\u53E5\u70B9\u300D\uFF1F\u5168\u901A\u8FC7\u5199 "ok"\u3002' : "";
  const askSection = phase === "compile" ? "\n\u3010\u8F93\u5165\u8BF4\u660E\u3011\u6536\u5230\u7684\u662F\u4E00\u4EFD\u5DF2\u786E\u5B9A\u6240\u6709\u53C2\u6570\u7684\u7ED8\u56FE\u89C4\u683C\u3002\u76F4\u63A5\u7F16\u8BD1\u4E3A\u547D\u4EE4\uFF0C\u7981\u6B62\u53CD\u95EE\uFF08ask \u5B57\u6BB5\u7701\u7565\uFF09\u3002" : '\u3010\u53CD\u95EE\uFF08\u6700\u540E\u624B\u6BB5\uFF09\u3011\u4EC5\u5F53\u7F3A\u300C\u6838\u5FC3\u5B9A\u4E49\u53C2\u6570\u300D\u4E14\u65E0\u6CD5\u5408\u7406\u9ED8\u8BA4\u65F6\u624D\u53CD\u95EE\uFF08\u5982\\"\u753B\u4E2A\u5706\\"\u65E0\u534A\u5F84\u3001\\"\u753B\u4E2A\u51FD\u6570\\"\u65E0\u8868\u8FBE\u5F0F\uFF09\u3002\u80FD\u9ED8\u8BA4\u5C31\u9ED8\u8BA4\uFF1A\u5706\u5FC3\u9ED8\u8BA4\u539F\u70B9\u3001\u89D2\u901F\u5EA6\u9ED8\u8BA4 1\u3001\u672A\u7ED9 slider \u7684\u53C2\u6570\u4E00\u5F8B\u7ED9\u5408\u7406\u9ED8\u8BA4\u503C\u8BA9\u7528\u6237\u62D6\u52A8\u8C03\u8282\u3002\u53CD\u95EE\u683C\u5F0F\uFF1A{\\"explanation\\":\\"...\\",\\"commands\\":[],\\"ask\\":\\"...\\"}';
  return phaseIntro + "\n\n" + [
    "\u2550\u2550\u2550 \u8F93\u51FA\u683C\u5F0F \u2550\u2550\u2550",
    "\u2605 \u53EA\u8F93\u51FA\u7EAF JSON \u5BF9\u8C61\uFF0C\u65E0\u4EFB\u4F55\u989D\u5916\u5B57\u7B26 \u2605",
    '\u7981\u6B62 Markdown \u4EE3\u7801\u5757\uFF08\\`\\`\\`json\uFF09\u3001\u7981\u6B62\\"\u597D\u7684\\" \\"\u8FD9\u662F\\" \u7B49\u89E3\u91CA\u6587\u5B57\u3001\u7981\u6B62\u524D\u540E\u7F00\u3002',
    phase === "compile" ? 'JSON \u7ED3\u6784\uFF1A{ "explanation": "<\u4E00\u53E5\u8BDD\u8BF4\u660E>", "commands": [...], "self_check": "<\u81EA\u68C0\u62A5\u544A>" }' : 'JSON \u7ED3\u6784\uFF1A{ "explanation": "<\u226480 \u6C49\u5B57\u7684\u672C\u8F6E\u8BF4\u660E>", "commands": [<\u547D\u4EE4\u5BF9\u8C61>] }',
    "",
    "\u2550\u2550\u2550 14 \u4E2A\u547D\u4EE4 op \u2550\u2550\u2550",
    "- eval    { cmd }                                  \u6267\u884C\u5408\u6CD5 GGB \u547D\u4EE4",
    "- slider  { name, min, max, step, value, unit?, label? }",
    "- animate { target, speed?, on, repeat? }          repeat: oscillating/increasing/once",
    "- trace   { target, on }",
    "- style   { target, color?, thickness?, visible?, opacity?, dashed?, pointSize?, pointStyle? }",
    "- view    { xmin, xmax, ymin, ymax, axesUnit? }",
    "- caption { target, text }",
    "- delete  { target }",
    "- reset",
    "- vector  { name, from, to, color?, label? }      \u7269\u7406\u77E2\u91CF\u7BAD\u5934\uFF08from: \u70B9\u540D\u6216 (x,y) \u5B57\u9762\u91CF\uFF09",
    "- forceDiagram { at, forces: [{name, vec, color?, label?}] }  \u529B\u77E2\u91CF\u7EC4",
    "- physicsTrace { target, mode }                    mode: trail/stroboscopic",
    "- unitAxes { xUnit, yUnit, xLabel?, yLabel? }      \u5E26\u5355\u4F4D\u5750\u6807\u8F74",
    "- constants { names: [...] }                      g/c/e/eps0/mu0/k_e/Grav/h/k_B",
    "",
    "\u2550\u2550\u2550 \u786C\u6027\u89C4\u5219 \u2550\u2550\u2550",
    "1. \u6807\u8BC6\u7B26\u4EC5 ASCII \u5B57\u6BCD\u6570\u5B57\u4E0B\u5212\u7EBF\u3002\u7981\u6B62\u4E2D\u6587\u53D8\u91CF\u540D\u3002",
    "2. \u989C\u8272 #RRGGBB\u3002SetColor r/g/b \u7528 0~1 \u6D6E\u70B9\uFF08\u5F15\u64CE\u6309 \xD7255 \u89E3\u6790\uFF1B0~255 \u6574\u6570\u4F1A\u6E32\u67D3\u6210\u767D\u8272\uFF09\u3002",
    "3. \u4F18\u5148\u7528 slider \u5F15\u5165\u53EF\u8C03\u53C2\u6570\u3002v/w/x/y/z \u5C0F\u5199\u5B57\u6BCD\u53EF\u7528\u4F5C slider \u540D\u4F46\u4E0D\u5F97\u7528\u4F5C Vector \u5BF9\u8C61\u540D\u3002",
    "4. \u591A\u8F6E\u5BF9\u8BDD\u590D\u7528\u5DF2\u5B58\u5728\u5BF9\u8C61\u540D\uFF0C\u4E0D\u91CD\u65B0\u58F0\u660E\u3002",
    "5. JSON \u7C7B\u578B\u4E25\u683C\uFF1A\u6570\u503C\u2192\u6570\u5B57\uFF0C\u5E03\u5C14\u2192true/false\u3002",
    "6. cmd \u5B57\u6BB5\u53EA\u4F7F\u7528\u4E0B\u65B9\u547D\u4EE4\u901F\u67E5\u4E2D\u5217\u51FA\u7684\u547D\u4EE4\uFF0C\u7981\u6B62\u81C6\u9020\u547D\u4EE4\u3002",
    "",
    "\u2550\u2550\u2550 GGB \u7C7B\u578B\u94C1\u5F8B\uFF08\u6700\u9AD8\u9891\u9519\u8BEF\u6E90\uFF09\u2550\u2550\u2550",
    "\u2605 \u547D\u540D\u51B3\u5B9A\u7C7B\u578B\uFF1A`(x,y)` \u6216\u70B9\u8868\u8FBE\u5F0F\u8D4B\u7ED9**\u9996\u5B57\u6BCD\u5927\u5199**\u7684\u540D\u5B57\uFF08A\u3001Ftip\u3001PL\uFF09\u2192 Point\uFF1B\u8D4B\u7ED9**\u9996\u5B57\u6BCD\u5C0F\u5199**\u7684\u540D\u5B57\uFF08ftip\u3001c1\u3001\u9A7C\u5CF0 dTip \u90FD\u7B97\uFF09\u2192 **Vector**\u3002\u7528\u4F5C Polygon \u9876\u70B9\u6216\u7BAD\u5934\u7AEF\u70B9\u7684\u70B9\u8868\u8FBE\u5F0F\u5FC5\u987B\u7528\u9996\u5B57\u6BCD\u5927\u5199\u7684\u540D\u5B57\u3002",
    "\u2605 \u5927\u5199 A~Z \u5355\u5B57\u6BCD = Point \u7C7B\u578B\u3002\u7981\u6B62\u7528\u4F5C\u6570\u503C\u53D8\u91CF\u3002",
    "\u2605 \u5C0F\u5199 u/v/w = Vector \u7C7B\u578B\uFF08\u4F4D\u79FB/\u65B9\u5411\u5411\u91CF\u6B63\u5408\u9002\uFF09\u3002\u901F\u5EA6\u53D6\u503C\u7528 speed/vMag/vel \u7981\u6B62\u7528 v\u3002",
    "\u2605 \u53D6\u5750\u6807\u5206\u91CF\u53EA\u80FD\u7528 x(P)/y(P)\u2014\u2014\u4E0D\u5B58\u5728 P_x \u5F62\u6001\uFF08\u5F15\u64CE\u5FC5\u62D2\u7EDD\uFF09\u3002",
    "\u2605 \u5C0F\u5199 f/g/h = Function \u7C7B\u578B\u3002\u5176\u4ED6\u5C0F\u5199\u53EF\u81EA\u7531\u4F5C\u6570\u503C\u3002",
    "\u2605 \u5BF9\u8C61\u540D\u7981\u7528 GGB \u4FDD\u7559\u540D\uFF1AIf \u662F\u5185\u7F6E\u6761\u4EF6\u547D\u4EE4\uFF08If(x)=\u2026 \u5FC5\u5931\u8D25\uFF09\uFF1BxAxis/yAxis \u662F\u753B\u5E03\u81EA\u5E26\u5750\u6807\u8F74\uFF08\u4E0D\u9700\u8981\u521B\u5EFA\uFF0C\u521B\u5EFA\u5FC5\u5931\u8D25\uFF09\uFF1Bx/y/z \u662F\u5750\u6807\u53D8\u91CF\uFF1Be \u662F\u6B27\u62C9\u6570\uFF1Brad \u662F\u5355\u4F4D\u5173\u952E\u5B57\u3002\u51FD\u6570\u547D\u540D\u7528 f/g/h \u6216\u8BED\u4E49\u540D\uFF08traj/poly\uFF09\u3002",
    "\u2605 \u4F4D\u79FB/\u901F\u5EA6\u77E2\u91CF\u7528 vector \u6216 forceDiagram op\uFF08\u5B83\u4EEC\u5185\u90E8\u5DF2\u5904\u7406 Point+Vector \u5B89\u5168\u8F6C\u6362\uFF09\u3002",
    "\u2605 \u5206\u6BCD\u542B (x-x0)^2+y^2 \u5FC5\u987B +0.001 \u9632\u9664\u96F6\u3002",
    "",
    "\u2550\u2550\u2550 \u2605 Sequence\uFF08\u5E8F\u5217\uFF09\u5951\u7EA6 \u2014\u2014 \u6700\u9AD8\u9891\u6267\u884C\u5931\u8D25\u6E90\uFF0C\u5FC5\u987B\u9010\u6761\u7167\u505A \u2550\u2550\u2550",
    "\u5B98\u65B9 5 \u79CD\u91CD\u8F7D\uFF08\u6309\u53C2\u6570\u5F62\u6001\u81EA\u52A8\u8BC6\u522B\uFF0C\u4E0D\u8981\u6DF7\u7528\uFF09\uFF1A",
    "  A) Sequence(\u7EC8\u70B9n)            \u2192 \u6574\u6570\u8868 {1..n}         \u4F8B Sequence(4)",
    "  B) Sequence(\u8D77\u70B9k, \u7EC8\u70B9n)      \u2192 \u6574\u6570\u8868 {k..n}         \u4F8B Sequence(7,13)",
    "  C) Sequence(\u8D77\u70B9k, \u7EC8\u70B9n, \u589E\u91CF) \u2192 \u6574\u6570\u8868 {k,k+inc,\u2026}    \u4F8B Sequence(7,13,2)",
    "  D) Sequence(\u8868\u8FBE\u5F0F, \u5FAA\u73AF\u53D8\u91CFk, \u8D77\u70B9a, \u7EC8\u70B9b)          \u2190 \u6B65\u957F\u9ED8\u8BA4 1",
    "  E) Sequence(\u8868\u8FBE\u5F0F, \u5FAA\u73AF\u53D8\u91CFk, \u8D77\u70B9a, \u7EC8\u70B9b, \u6B65\u957F)     \u2190 \u6700\u5E38\u7528",
    "  \u4F8B pts = Sequence((i, i^2), i, 0, 10, 0.5)",
    "\u2460 \u2605 \u7528 D/E \u5F62\u6001\u65F6\uFF0C\u7B2C 2 \u4E2A\u53C2\u6570\u5FC5\u987B\u662F**\u5355\u4E2A ASCII \u5B57\u6BCD**\u7684\u5FAA\u73AF\u53D8\u91CF\uFF08i/j/k/t/n\uFF09\u3002\u7981\u6B62\u591A\u5B57\u6BCD\u3001\u4E2D\u6587\u3001\u6570\u5B57\u3002",
    '\u2461 \u2605 \u8D77\u70B9/\u7EC8\u70B9/\u6B65\u957F\u5FC5\u987B\u662F**\u4E09\u4E2A\u72EC\u7ACB\u53C2\u6570**\uFF0C\u7528\u9017\u53F7\u5206\u9694\u3002\u7981\u6B62 Sequence(expr, i, "0,1,0.1") \u6216 "0..1" \u538B\u7F29\u5199\u6CD5\u3002',
    '\u2462 \u6240\u6709\u62EC\u53F7\u5FC5\u987B\u9010\u5C42\u95ED\u5408\uFF1A\u5D4C\u5957 Sequence(Cube(\u2026), i, \u2026) \u65F6\u6700\u5916\u5C42 Sequence \u7684 ")" \u6700\u5BB9\u6613\u6F0F\u3002',
    "\u2463 \u53C2\u6570\u4E4B\u95F4\u4E00\u5F8B\u7528**\u9017\u53F7**\u3002\u7981\u6B62\u628A\u9017\u53F7\u5199\u6210\u53E5\u70B9\uFF1ACube((i,j,k),(i+1,j,k).e(i,j+1,k) \u274C \u2192 Cube((i,j,k),(i+1,j,k),(i,j+1,k)) \u2713",
    "\u2464 \u5FAA\u73AF\u53D8\u91CF\u53EA\u5728\u7B2C 1 \u4E2A\u53C2\u6570\uFF08\u8868\u8FBE\u5F0F\uFF09\u5185\u6709\u6548\uFF0C\u4E14**\u5FC5\u987B\u5148\u58F0\u660E\u540E\u7528**\uFF1A\u5148\u7528 i \u624D\u7B97 i+1\u3002",
    "\u2465 \u5D4C\u5957\u7F51\u683C\uFF083D \u70B9\u9635/\u77E2\u91CF\u573A\uFF09\u6807\u51C6\u5199\u6CD5\u2014\u2014\u5916\u5C42 j\u3001\u5185\u5C42 i \u5404\u81EA\u72EC\u7ACB\u58F0\u660E\uFF08\u4E24\u7EA7\u90FD\u5FC5\u987B\u663E\u5F0F\u7ED9\u51FA\u6B65\u957F\uFF09\uFF1A",
    "   cubes = Sequence(Cube((i, j, 0), (i+1, j, 0)), i, 0, 2, 1)                     \u2190 \u5355\u5C42\uFF1A\u4E00\u884C\u7ACB\u65B9\u4F53",
    "   grid  = Sequence(Sequence(Cube((i,j,0),(i+1,j,0)), i, 0, 2, 1), j, 0, 2, 1)  \u2190 \u53CC\u5C42\uFF1A\u9762\u9635",
    "\u2466 \u4E09\u4E2A\u70B9\u5F62\u5F0F Cube(A,B,C) \u8981\u6C42 A/B/C **\u662F\u5DF2\u58F0\u660E\u7684 Point \u5BF9\u8C61\u4E14\u6784\u6210\u6B63\u65B9\u5F62**\uFF1B\u5750\u6807\u5B57\u9762\u91CF\u53EA\u9002\u7528\u4E8E\u4E24\u70B9\u5F0F Cube(A,B)\u3002",
    "\u2467 \u62A5\u9519\u300CSequence \u6267\u884C\u5931\u8D25\u300D\u65F6\uFF0C\u5148\u81EA\u67E5\u4E0A\u8FF0 \u2460~\u2466\uFF0C\u4E0D\u8981\u6539\u52A8\u5DF2\u6210\u529F\u7684\u547D\u4EE4\u3002",
    "",
    "\u3010\u5F53\u524D\u6A21\u5F0F\u53EF\u7528\u547D\u4EE4\u901F\u67E5 \u2014 RAG \u8FC7\u6EE4\u3011",
    cmdRef,
    "",
    "\u3010\u5E38\u89C1\u81C6\u9020\u547D\u4EE4 \u2014 \u4EE5\u4E0B\u547D\u4EE4\u4E0D\u5B58\u5728\uFF0C\u7981\u6B62\u4F7F\u7528\u3011",
    hallucWarn,
    "",
    GGB_5STAGE_FLOW,
    "",
    askSection,
    "",
    selfCheckSection
  ].join("\n");
}
function buildSystemPrompt(domain, appMode = "2d", phase = "full") {
  const mode = appMode === "3d" ? MODE_3D_ADDON : MODE_2D_HEADER;
  const base = mode + "\n" + buildPromptBase(appMode, domain, phase);
  const parts = [base];
  parts.push(GENERAL_FEW_SHOT);
  if (domain === "physics") {
    parts.push(PHYSICS_ADDON);
    parts.push(PHYSICS_FEW_SHOT);
  }
  return parts.join("\n");
}
function buildCompilePrompt(domain, appMode = "2d") {
  return buildSystemPrompt(domain, appMode, "compile");
}
function buildFormatRepairMessage(raw, detail) {
  const preview = raw.length > 400 ? raw.slice(0, 400) + "\u2026(truncated)" : raw;
  return `\u4F60\u4E0A\u4E00\u8F6E\u7684\u56DE\u590D\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u65E0\u6CD5\u88AB\u524D\u7AEF\u89E3\u6790\u6216\u4E0D\u7B26\u5408 schema\u3002

\u3010\u4F60\u7684\u539F\u59CB\u8F93\u51FA\uFF08\u5F00\u5934 400 \u5B57\u7B26\uFF09\u3011
${preview}

\u3010\u6821\u9A8C\u9519\u8BEF\u3011
${detail}

\u8BF7\u4E25\u683C\u6309\u7167\u4EE5\u4E0B\u8981\u6C42\u91CD\u65B0\u8F93\u51FA\uFF1A
1. \u53EA\u8F93\u51FA\u4E00\u4E2A JSON \u5BF9\u8C61\uFF0C\u4E0D\u8981 Markdown \u4EE3\u7801\u5757\u3001\u4E0D\u8981\u4EFB\u4F55\u8BF4\u660E\u6587\u5B57\u3001\u4E0D\u8981\u524D\u540E\u7F00\u3002
2. \u9876\u5C42\u7ED3\u6784\u5FC5\u987B\u662F { "explanation": "<string>", "commands": [<\u5BF9\u8C61\u6570\u7EC4>] }\u3002
3. \u6570\u503C\u5B57\u6BB5\uFF08min/max/step/value/speed/thickness/opacity/xmin/...\uFF09\u5FC5\u987B\u662F JSON \u6570\u5B57\uFF0C\u4E0D\u80FD\u5199\u6210\u5B57\u7B26\u4E32\uFF1A"value": 0.5 \u2705\uFF1B"value": "0.5" \u274C\u3002
4. \u5E03\u5C14\u5B57\u6BB5\uFF08on/visible/dashed/fade\uFF09\u5FC5\u987B\u662F true/false\uFF0C\u4E0D\u80FD\u5199\u6210\u5B57\u7B26\u4E32\u3002
5. \u6BCF\u6761 commands \u5FC5\u987B\u5305\u542B "op" \u5B57\u6BB5\uFF0C\u4E14 op \u5FC5\u987B\u662F system \u4E2D\u58F0\u660E\u7684\u5141\u8BB8\u503C\u4E4B\u4E00\u3002
6. \u989C\u8272\u5B57\u6BB5\u683C\u5F0F #RRGGBB\u3002

\u8BF7\u91CD\u65B0\u8F93\u51FA\u5B8C\u6574\u4E14\u5408\u6CD5\u7684 JSON\u3002`;
}

// src/refinePrompt.ts
function buildRefinePrompt(domain) {
  const physicsSection = domain === "physics" ? `
\u3010\u7269\u7406\u57DF\u9ED8\u8BA4\u503C\u2014\u2014\u672A\u6307\u5B9A\u65F6\u76F4\u63A5\u4F7F\u7528\uFF0C\u65E0\u9700\u53CD\u95EE\u3011
- \u91CD\u529B\u52A0\u901F\u5EA6 g = 9.8 m/s\xB2
- \u5355\u6446\uFF1AL=1 m\uFF0C\u03B8\u2080=\u03C0/6 (30\xB0)\uFF0C\u03C9=\u221A(g/L)
- \u659C\u629B\uFF1Av\u2080=20 m/s\uFF0C\u03B8=\u03C0/4 (45\xB0)
- \u5706\u5468\u8FD0\u52A8\uFF1Ar=2 m\uFF0C\u03C9=1 rad/s
- \u5F39\u7C27\u632F\u5B50\uFF1Ak=10 N/m\uFF0Cm=1 kg
- \u659C\u9762\uFF1A\u503E\u89D2 30\xB0 (\u03C0/6)\uFF0Cm=2 kg
- \u7535\u573A\uFF1A\u70B9\u7535\u8377\u91CF \xB11\uFF0C\u95F4\u8DDD d=2 m
- \u65F6\u95F4 t slider 0~10s step 0.02
- \u77E2\u91CF\u914D\u8272\uFF1A\u4F4D\u79FB #1e88e5\u3001\u901F\u5EA6 #43a047\u3001\u52A0\u901F\u5EA6 #fb8c00\u3001\u529B #e53935\u3001\u7535\u573A #8e24aa\u3001\u78C1\u573A #00897b
` : "";
  return `\u4F60\u662F AiGGB \u9700\u6C42\u5206\u6790\u52A9\u624B\u3002\u5C06\u7528\u6237\u7684\u81EA\u7136\u8BED\u8A00\u8F6C\u5316\u4E3A\u7CBE\u70BC\u7ED8\u56FE\u89C4\u683C\u3002

\u3010\u8F93\u51FA\u683C\u5F0F\u3011\u2605 \u53EA\u8F93\u51FA\u4E00\u4E2A JSON \u5BF9\u8C61\uFF1A{"spec":"<\u8BE6\u7EC6\u89C4\u683C>"} \u2605
\u4E0D\u8981\u4EE3\u7801\u5757\u3001\u4E0D\u8981\u5BD2\u6684\u3002spec \u662F\u5206\u8282\u63CF\u8FF0\u7684\u4EBA\u7C7B\u53EF\u8BFB\u7ED8\u56FE\u89C4\u683C\u3002

spec \u5185\u5BB9\u5206\u8282\uFF1A
\u2460 \u573A\u666F\u7C7B\u578B  \u2461 \u53EF\u8C03\u53C2\u6570\u8868\uFF08\u53C2\u6570\u540D=\u9ED8\u8BA4\u503C\uFF0C\u8303\u56F4 min~max step\uFF0C\u5355\u4F4D\uFF09
\u2462 \u6784\u9020\u6B65\u9AA4\uFF08\u53C2\u6570\u2192\u57FA\u7840\u70B9\u2192\u51E0\u4F55\u4F53/\u66F2\u7EBF\u2192\u52A8\u753B/\u8F68\u8FF9\u2192\u6837\u5F0F\uFF09
\u2463 \u52A8\u753B\u8BBE\u7F6E\uFF08repeat \u7C7B\u578B\u3001\u901F\u5EA6\uFF09 \u2464 \u8F68\u8FF9\u9700\u6C42
\u2465 \u914D\u8272\u65B9\u6848\uFF08\u5BF9\u8C61\u53CA #RRGGBB\uFF09 \u2466 \u89C6\u7A97\u4E0E\u5750\u6807\u8F74
\u2467 \u7279\u6B8A\u8BF4\u660E\uFF08\u7269\u7406\u5E38\u91CF\u3001\u516C\u5F0F\u30013D \u8981\u6C42\u7B49\uFF09

\u3010\u793A\u4F8B 1\uFF1A\u7269\u7406\u3011
\u7528\u6237\uFF1A"\u659C\u629B\u8FD0\u52A8 v0=20 m/s \u4EF0\u89D2 45\xB0"
\u2192 {"spec":"\u2460 \u573A\u666F\uFF1A\u659C\u629B\u8FD0\u52A8\\n\u2461 \u53C2\u6570\uFF1Av0=20 m/s\uFF081~50 step1\uFF09\u3001\u03B8=\u03C0/4 rad\uFF080~\u03C0/2 step0.01\uFF09\u3001t=0 s\uFF080~5 step0.02\uFF09\\n\u2462 \u6784\u9020\uFF1A\\n- \u5E38\u91CF g=9.8\\n- \u8D28\u70B9 P=(v0cos\u03B8\xB7t, v0sin\u03B8\xB7t-\xBDgt\xB2)\\n- \u901F\u5EA6\u5206\u91CF vx=v0cos\u03B8, vy=v0sin\u03B8-gt\\n- \u901F\u5EA6\u77E2\u91CF vArrow \u4ECE P \u5230 P+(vx/5,vy/5)\\n\u2463 \u52A8\u753B\uFF1At \u81EA\u52A8\u64AD\u653E increasing speed=0.5\\n\u2464 \u8F68\u8FF9\uFF1AP \u62D6\u5C3E\\n\u2465 \u914D\u8272\uFF1A\u8F68\u8FF9\u84DD#1e88e5\u3001\u901F\u5EA6\u77E2\u91CF\u7EFF#43a047\\n\u2466 \u89C6\u7A97\uFF1A-2~50 \xD7 -2~20 \u8F74\u6807 x/m y/m\\n\u2467 \u6CE8\u5165 g=9.8"}

\u3010\u793A\u4F8B 2\uFF1A\u6570\u5B66\u3011
\u7528\u6237\uFF1A"\u753B\u6B63\u5F26\u51FD\u6570\u65CF y=A\xB7sin(kx+\u03C6)\uFF0CA/k/\u03C6 \u7528\u6ED1\u5757\u63A7\u5236"
\u2192 {"spec":"\u2460 \u573A\u666F\uFF1A\u6B63\u5F26\u51FD\u6570\u65CF\\n\u2461 \u53C2\u6570\uFF1AA=1\uFF080.5~3 step0.1\uFF09\u3001kw=1\uFF080.5~5 step0.1 \u907F GGB k \u51B2\u7A81\uFF09\u3001\u03C6=0 rad\uFF08-\u03C0~\u03C0 step0.05\uFF09\\n\u2462 \u6784\u9020\uFF1A\\n- f(x)=A\xB7sin(kw\xB7x+\u03C6)\\n- y=A \u548C y=-A \u865A\u7EBF\u6807\u6CE8\u632F\u5E45\u8FB9\u754C\\n\u2463 \u52A8\u753B\uFF1A\u65E0\uFF08\u7EAF\u9759\u6001\u51FD\u6570\uFF09\\n\u2464 \u8F68\u8FF9\uFF1A\u65E0\\n\u2465 \u914D\u8272\uFF1A\u66F2\u7EBF\u84DD#1e88e5 thickness 2\u3001\u8FB9\u754C\u7EBF\u7070#9e9e9e \u865A\u7EBF\\n\u2466 \u89C6\u7A97\uFF1A-2\u03C0~2\u03C0 \xD7 -3.5~3.5 \u8F74\u6807 x\u3001y"}

\u3010\u793A\u4F8B 3\uFF1A3D\u3011
\u7528\u6237\uFF1A"\u753B\u8FB9\u957F 3 \u7684\u6B63\u65B9\u4F53\uFF0C\u5E73\u9762 ACF \u622A\u6B63\u65B9\u4F53"
\u2192 {"spec":"\u2460 \u573A\u666F\uFF1A3D \u6B63\u65B9\u4F53\u622A\u9762\\n\u2461 \u53C2\u6570\uFF1A\u65E0\\n\u2462 \u6784\u9020\uFF1A\\n- A=(0,0,0) B=(3,0,0)\\n- cube=Cube(A,B)\uFF08\u4E24\u70B9\u5F0F\uFF0CC/F \u81EA\u52A8\u751F\u6210\uFF09\\n- section=IntersectPath(Plane(A,C,F), cube)\\n- A C F \u70B9\u6807\u8BB0\u7EA2\u8272\\n\u2463 \u52A8\u753B\uFF1A\u65E0\uFF08\u9759\u6001 3D \u6784\u9020\uFF09\\n\u2464 \u8F68\u8FF9\uFF1A\u65E0\\n\u2465 \u914D\u8272\uFF1A\u7ACB\u65B9\u4F53\u84DD#90CAF9 \u534A\u900F\u660E opacity 0.3\u3001\u622A\u9762#E91E63 thickness 4\\n\u2466 \u89C6\u7A97\uFF1Axmin=-2 xmax=6 ymin=-2 ymax=6\uFF083D \u89C6\u7A97\u4EA4\u7ED9\u7528\u6237\u9F20\u6807\u65CB\u8F6C\uFF09\\n\u2467 3D \u7981\u6B62\uFF1ASetViewDirection/SetFilling/SetPointSize/SetCaption/ZoomIn"}

\u2605 \u7F3A\u6838\u5FC3\u53C2\u6570\u65F6\u8F93\u51FA\uFF1A{"ask":"\u8BF7\u6307\u5B9A\u5706\u7684\u534A\u5F84\uFF08\u5982 3\uFF09\uFF1F"}

\u3010\u8865\u5168\u7B56\u7565\u3011\u53EF\u8C03\u53C2\u6570\u672A\u6307\u5B9A \u2192 \u7528\u9ED8\u8BA4\u503C\u5199\u5165\u5E76\u6807\u6CE8"\u53EF\u8C03"\uFF0C\u4E0D\u53CD\u95EE\u3002\u4F4D\u7F6E\u672A\u6307\u5B9A \u2192 \u9ED8\u8BA4\u539F\u70B9\u3002

${physicsSection}`;
}

// src/commandCorrect.ts
function levenshtein(a, b) {
  const alen = a.length;
  const blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;
  let prev = Array.from({ length: blen + 1 }, (_, j) => j);
  let curr = new Array(blen + 1);
  for (let i = 1; i <= alen; i++) {
    curr[0] = i;
    for (let j = 1; j <= blen; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[blen];
}
var NON_COMMAND_NAMES = /^(sin|cos|tan|abs|sqrt|exp|ln|log|floor|ceil|random|pi|e|true|false|x|y|z)$/i;
function isExemptNonCommand(name) {
  return NON_COMMAND_NAMES.test(name) || /^round$/.test(name);
}
function extractCommandName(cmd) {
  const trimmed = cmd.trim();
  if (!trimmed) return null;
  if (/^[A-Za-z_]\w*\s*\([^)]*\)\s*=(?!=)/.test(trimmed)) return null;
  const assignM = /^[A-Za-z_]\w*\s*=\s*([A-Za-z_]\w*)\s*[([]/.exec(trimmed);
  if (assignM) {
    return isExemptNonCommand(assignM[1]) ? null : assignM[1];
  }
  const directM = /^([A-Za-z_]\w*)\s*[([]/.exec(trimmed);
  if (directM) {
    return isExemptNonCommand(directM[1]) ? null : directM[1];
  }
  return null;
}
function extractArgs(cmd) {
  const m = /\(([\s\S]*)\)\s*$/.exec(cmd.trim());
  return m ? m[1].trim() : "";
}
function countArgs(argsStr) {
  if (!argsStr) return 0;
  let depth = 0;
  let count = 1;
  for (const ch of argsStr) {
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (ch === "," && depth === 0) count++;
  }
  return count;
}
var FUZZY_THRESHOLD = 2;
function fuzzySearch(name) {
  let best = null;
  const target = name.toLowerCase();
  for (const def of GGB_COMMAND_DEFS) {
    const dist = levenshtein(target, def.name.toLowerCase());
    if (dist <= FUZZY_THRESHOLD) {
      if (!best || dist < best.distance) {
        best = { def, distance: dist };
      }
    }
  }
  return best;
}
function correctCommand(cmd) {
  const suggestions = [];
  let corrected = cmd;
  let changed = false;
  let matchedDef;
  const cmdName = extractCommandName(cmd);
  if (!cmdName) {
    return { original: cmd, corrected, suggestions: [], changed: false, matchedDef: void 0 };
  }
  const exact = findCommand(cmdName);
  if (exact) {
    matchedDef = exact;
    const argsStr = extractArgs(cmd);
    const given = countArgs(argsStr);
    const [pmin, pmax] = exact.paramCount;
    if (pmax === -1) {
      if (given < pmin) {
        suggestions.push(`\u547D\u4EE4 ${cmdName} \u6700\u5C11\u9700\u8981 ${pmin} \u4E2A\u53C2\u6570\uFF0C\u4F46\u53EA\u7ED9\u4E86 ${given} \u4E2A`);
      }
    } else {
      if (given < pmin) {
        suggestions.push(`\u547D\u4EE4 ${cmdName} \u9700\u8981 ${pmin}~${pmax} \u4E2A\u53C2\u6570\uFF0C\u4F46\u53EA\u7ED9\u4E86 ${given} \u4E2A`);
      } else if (given > pmax) {
        suggestions.push(`\u547D\u4EE4 ${cmdName} \u6700\u591A\u63A5\u53D7 ${pmax} \u4E2A\u53C2\u6570\uFF0C\u4F46\u7ED9\u4E86 ${given} \u4E2A`);
      }
    }
    return { original: cmd, corrected, suggestions, changed: false, matchedDef };
  }
  const halluc = findHallucination(cmdName);
  if (halluc) {
    suggestions.push(`${cmdName} \u4E0D\u5B58\u5728\u3002\u63A8\u8350\uFF1A${halluc.correct}\uFF08${halluc.reason}\uFF09`);
    const replacementCmd = halluc.correct.match(/^(\w[\w]*)$/);
    if (replacementCmd) {
      const replacementName = replacementCmd[1];
      const newCmd = cmd.replace(new RegExp("\\b" + cmdName + "\\b"), replacementName);
      if (newCmd !== cmd) {
        corrected = newCmd;
        changed = true;
        matchedDef = findCommand(replacementName);
        suggestions.push(`\u5DF2\u81EA\u52A8\u66FF\u6362\uFF1A${cmdName} \u2192 ${replacementName}`);
      }
    }
    return { original: cmd, corrected, suggestions, changed, matchedDef };
  }
  const fuzzy = fuzzySearch(cmdName);
  if (fuzzy) {
    matchedDef = fuzzy.def;
    if (fuzzy.distance === 1) {
      const newCmd = cmd.replace(new RegExp("\\b" + cmdName + "\\b"), fuzzy.def.name);
      corrected = newCmd;
      changed = true;
      suggestions.push(`\u7591\u4F3C\u7B14\u8BEF\uFF1A${cmdName} \u2192 ${fuzzy.def.name}\uFF08\u7F16\u8F91\u8DDD\u79BB ${fuzzy.distance}\uFF09`);
    } else {
      suggestions.push(`\u672A\u77E5\u547D\u4EE4 ${cmdName}\u3002\u4E5F\u8BB8\u4F60\u60F3\u7528 ${fuzzy.def.name}\uFF1F\uFF08\u7F16\u8F91\u8DDD\u79BB ${fuzzy.distance}\uFF09`);
    }
    return { original: cmd, corrected, suggestions, changed, matchedDef };
  }
  suggestions.push(`\u8B66\u544A\uFF1A${cmdName} \u4E0D\u5728\u5DF2\u9A8C\u8BC1\u547D\u4EE4\u5E93\u4E2D\u3002\u8BF7\u786E\u8BA4\u8FD9\u662F\u6709\u6548\u7684 GGB \u547D\u4EE4`);
  return { original: cmd, corrected, suggestions, changed: false, matchedDef: void 0 };
}

// src/commandValidate.ts
function stripStrings(s) {
  let out = "";
  let quote = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
        out += ch;
      } else {
        out += " ";
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      continue;
    }
    out += ch;
  }
  return out;
}
function checkBracketBalance(cmd) {
  const s = stripStrings(cmd);
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const closers = /* @__PURE__ */ new Set([")", "]", "}"]);
  let absoluteBarOpen = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "|") {
      if (s[i + 1] === "|") {
        i++;
        continue;
      }
      absoluteBarOpen = !absoluteBarOpen;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push({ ch, pos: i + 1 });
      continue;
    }
    if (closers.has(ch)) {
      const want = pairs[ch];
      if (stack.length === 0) {
        return {
          ok: false,
          position: i + 1,
          detail: `\u7B2C ${i + 1} \u4E2A\u5B57\u7B26\u5904\u51FA\u73B0\u591A\u4F59\u7684 '${ch}'\uFF08\u524D\u9762\u6CA1\u6709\u4E0E\u4E4B\u914D\u5BF9\u7684 '${want}'\uFF09\u2014\u2014 \u5E38\u89C1\u4E8E\u6F0F\u5199\u9017\u53F7/\u591A\u6253\u62EC\u53F7`
        };
      }
      const top = stack[stack.length - 1];
      if (top.ch !== want) {
        return {
          ok: false,
          position: i + 1,
          detail: `\u7B2C ${i + 1} \u4E2A\u5B57\u7B26 '${ch}' \u4E0E\u7B2C ${top.pos} \u4E2A\u5B57\u7B26\u672A\u95ED\u5408\u7684 '${top.ch}' \u4E0D\u5339\u914D`
        };
      }
      stack.pop();
      continue;
    }
  }
  if (absoluteBarOpen) {
    return { ok: false, position: s.length, detail: "\u7EDD\u5BF9\u503C\u7B26\u53F7 '|' \u672A\u95ED\u5408\uFF08\u6BCF\u4E2A '|' \u90FD\u9700\u8981\u6210\u5BF9\u51FA\u73B0\uFF09" };
  }
  if (stack.length > 0) {
    const last = stack[stack.length - 1];
    return {
      ok: false,
      position: s.length,
      detail: `\u547D\u4EE4\u7ED3\u675F\u65F6\u4ECD\u6709 ${stack.length} \u4E2A\u5DE6\u62EC\u53F7\u672A\u95ED\u5408\uFF08\u6700\u65E9\u7684 '${last.ch}' \u5728\u7B2C ${last.pos} \u4E2A\u5B57\u7B26\u5904\uFF09\u3002\u6CE8\u610F\u5D4C\u5957\u8C03\u7528\uFF08Sequence \u5957 Cube/Vector \u7B49\uFF09\u5FC5\u987B\u9010\u4E2A\u95ED\u5408`
    };
  }
  return { ok: true, position: -1, detail: "" };
}
function splitTopLevelArgs(s) {
  const out = [];
  let depth = 0;
  let quote = null;
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quote) {
      cur += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim() !== "") out.push(cur.trim());
  return out;
}
function extractCmdName(cmd) {
  const trimmed = cmd.trim();
  const m = /^(?:\w+\s*=\s*)?([A-Za-z_]\w*)\s*[([]/.exec(trimmed);
  return m ? m[1] : null;
}
function extractFirstCallArgs(cmd) {
  const s = cmd.trim();
  const m = /^(?:\w+\s*=\s*)?[A-Za-z_]\w*\s*(\(|\[)/.exec(s);
  if (!m) return null;
  const open = m.index + m[0].length - 1;
  let depth = 0;
  let quote = null;
  for (let i = open; i < s.length; i++) {
    const ch = s[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
      if (depth === 0) return s.slice(open + 1, i);
    }
  }
  return null;
}
var SINGLE_LETTER = /^[A-Za-z]$/;
var NUMBER_LITERAL = /^["']?\s*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?\s*["']?$/;
function unquote(s) {
  const t = s.trim();
  if (t.length >= 2 && (t[0] === '"' || t[0] === "'") && t[t.length - 1] === t[0]) {
    return t.slice(1, -1).trim();
  }
  return t;
}
function isNumberArg(s) {
  return s !== void 0 && NUMBER_LITERAL.test(unquote(s));
}
var STRAY_DOT_RE = /([)\]}])[ \t]*\.[ \t]*([(\w])/;
var TRAILING_OP_RE = /[+\-*/^,]\s*[)\]}]*\s*$/;
function trailingOperatorIssue(fragment, depth = 0) {
  const expr = fragment.trim();
  if (!expr || depth > 4) return null;
  if (TRAILING_OP_RE.test(expr)) {
    return {
      kind: "trailing-operator",
      message: `\u8868\u8FBE\u5F0F\u4EE5\u8FD0\u7B97\u7B26 ${JSON.stringify(expr.slice(-1))} \u7ED3\u5C3E\uFF0C\u7F3A\u5C11\u53F3\u64CD\u4F5C\u6570\uFF1A${expr}\uFF08\u6CE8\u610F\uFF1A\u53C2\u6570\u4E4B\u95F4\u53EA\u9700\u4E00\u4E2A\u9017\u53F7\uFF0C\u4E0D\u8981\u5199\u6210 ",," \u6216\u8BA9\u8868\u8FBE\u5F0F\u4EE5\u8FD0\u7B97\u7B26\u6536\u5C3E\uFF09`
    };
  }
  const argsStr = extractFirstCallArgs(expr);
  if (argsStr === null) return null;
  for (const arg of splitTopLevelArgs(argsStr)) {
    const inner = trailingOperatorIssue(arg, depth + 1);
    if (inner) return inner;
  }
  return null;
}
function validateSequence(argsStr, issues, balanced) {
  const args = splitTopLevelArgs(argsStr);
  if (!balanced) return;
  const second = unquote(args[1] ?? "");
  const isVarLike = /^[A-Za-z_]\w*$/.test(second);
  const isExpressionForm = args.length >= 3 && isVarLike;
  const third = unquote(args[2] ?? "");
  if (isExpressionForm && args[2] !== void 0 && !isNumberArg(args[2]) && /^[\s\d.,]+$/.test(third) && third.includes(",")) {
    issues.push({
      kind: "sequence-arity",
      message: `Sequence \u5FAA\u73AF\u533A\u95F4\u88AB\u5408\u6210\u4E86\u4E00\u4E2A\u53C2\u6570 ${JSON.stringify(args[2])}\u3002\u8D77\u70B9/\u7EC8\u70B9/\u6B65\u957F\u5FC5\u987B\u662F**\u4E09\u4E2A\u72EC\u7ACB\u53C2\u6570**\uFF08\u9017\u53F7\u5206\u9694\uFF09\uFF0C\u4E0D\u80FD\u5199\u6210 "0,1,0.1" \u6216 "0..1"\u3002\u6B63\u786E\u5F62\u6001\uFF1ASequence(<\u8868\u8FBE\u5F0F>, i, 0, 1, 0.1)`
    });
  }
  if (!isExpressionForm) {
    if (args.length === 3 && isNumberArg(args[2]) && Number(unquote(args[2])) === 0) {
      issues.push({
        kind: "sequence-arity",
        message: `Sequence \u7684\u589E\u91CF\u4E0D\u80FD\u4E3A 0\uFF08Sequence(${args.join(", ")})\uFF09\u2014\u2014 \u65E0\u6CD5\u6536\u655B`
      });
    }
    if (args.length === 0 || args.length > 3) {
      issues.push({
        kind: "sequence-arity",
        message: `Sequence \u53C2\u6570\u65E0\u6CD5\u5BF9\u5E94\u4EFB\u4F55\u5B98\u65B9\u5F62\u6001\u3002\u53EF\u7528\uFF1ASequence(\u7EC8\u70B9)\uFF5CSequence(\u8D77\u70B9, \u7EC8\u70B9)\uFF5CSequence(\u8D77\u70B9, \u7EC8\u70B9, \u589E\u91CF)\u3014\u6574\u6570\u8868\u3015\u6216 Sequence(\u8868\u8FBE\u5F0F, \u5FAA\u73AF\u53D8\u91CF, \u8D77\u70B9, \u7EC8\u70B9[, \u6B65\u957F])\u3014\u8FED\u4EE3\u8868\u8FBE\u5F0F\u3015\u3002\u5F53\u524D ${args.length} \u4E2A\u53C2\u6570\uFF1A${JSON.stringify(args.join(", "))}`
      });
    }
    return;
  }
  if (args.length < 4 || args.length > 5) {
    issues.push({
      kind: "sequence-arity",
      message: `Sequence \u8868\u8FBE\u5F0F\u5F62\u6001\u9700\u8981 4~5 \u4E2A\u53C2\u6570\uFF1ASequence(<\u8868\u8FBE\u5F0F>, <\u5FAA\u73AF\u53D8\u91CF>, <\u8D77\u70B9>, <\u7EC8\u70B9>[, <\u6B65\u957F>])\uFF0C\u5F53\u524D\u6709 ${args.length} \u4E2A\uFF1A${JSON.stringify(args.join(", "))}\u3002\u6CE8\u610F\uFF1A\u7B2C 3 \u4E2A\u53C2\u6570\u662F**\u8D77\u70B9**\u3001\u7B2C 4 \u4E2A\u662F**\u7EC8\u70B9**\u3001\u7B2C 5 \u4E2A\u624D\u662F**\u6B65\u957F** \u2014\u2014 Sequence(<\u8868\u8FBE\u5F0F>, i, 0) \u7F3A\u5C11\u7EC8\u70B9\u53C2\u6570\uFF0C\u987B\u5199\u6210 Sequence(<\u8868\u8FBE\u5F0F>, i, 0, 1, 0.1)\u3002`
    });
  }
  if (!SINGLE_LETTER.test(second)) {
    issues.push({
      kind: "sequence-var",
      message: `Sequence \u7684\u5FAA\u73AF\u53D8\u91CF\u5FC5\u987B\u662F**\u5355\u4E2A ASCII \u5B57\u6BCD**\uFF08i / j / k / t / n \u7B49\uFF09\uFF0C\u4F46\u6536\u5230 ${JSON.stringify(second)}\u3002\u591A\u5B57\u6BCD/\u4E2D\u6587\u53D8\u91CF\u540D\u4F1A\u88AB GGB \u5224\u4E3A\u5BF9\u8C61\u5F15\u7528\u800C\u62A5\u300CSequence \u6267\u884C\u5931\u8D25\u300D\u3002`
    });
  }
  const expr = args[0] ?? "";
  const trailing = /[)\]}]\s*\.\s*[A-Za-z_]\w*\s*$/.exec(expr);
  if (trailing) {
    issues.push({
      kind: "sequence-trailing",
      message: `Sequence \u7684\u8868\u8FBE\u5F0F\u5C3E\u90E8\u51FA\u73B0\u591A\u4F59\u5B57\u7B26 ${JSON.stringify(trailing[0].trim())}\u3002\u7591\u4F3C\u591A\u6253\u4E86\u5B57\u6BCD\u6216\u6F0F\u4E86\u9017\u53F7\uFF08,\uFF09\u2014\u2014 \u4F8B\u5982\u628A "Cube((i,j,k),(i+1,j,k),(i,j+1,k))" \u5199\u6210\u4E86 "Cube((i,j,k),(i+1,j,k).e(i,j+1,k)"\u3002`
    });
  }
  for (const [idx, a] of args.entries()) {
    if (TRAILING_OP_RE.test(a)) {
      issues.push({
        kind: "trailing-operator",
        message: `Sequence \u7B2C ${idx + 1} \u4E2A\u53C2\u6570 ${JSON.stringify(a)} \u4EE5\u8FD0\u7B97\u7B26/\u9017\u53F7\u7ED3\u5C3E\uFF0C\u7F3A\u5C11\u53F3\u64CD\u4F5C\u6570 \u2014\u2014 \u6CE8\u610F\u53C2\u6570\u4E4B\u95F4\u53EA\u9700\u4E00\u4E2A\u9017\u53F7\u5206\u9694\uFF0C\u4E0D\u8981\u5199\u6210 ",," \u6216\u5728\u672B\u5C3E\u591A\u7559\u9017\u53F7`
      });
      break;
    }
  }
}
var MODE_3D_FORBIDDEN = {
  setviewdirection: "\u4F9D\u9760\u9F20\u6807\u65CB\u8F6C\u89C6\u89D2\uFF0C\u4E0D\u8981\u7528\u547D\u4EE4",
  setfilling: "\u900F\u660E\u5EA6\u6539\u7528 style op \u7684 opacity \u5B57\u6BB5",
  setpointsize: "\u6807\u8BB0\u70B9\u6539\u7528 Sphere(P, 0.2)",
  setpointstyle: "\u5220\u9664\u8BE5\u6837\u5F0F\u8BBE\u7F6E",
  setaxesratio: "\u7B49\u6BD4\u4F8B\u4EA4\u7ED9 view op \u6216\u7528\u6237\u624B\u52A8",
  setcaption: '\u6807\u6CE8\u6539\u7528 Text("<\u6587\u5B57>", \u70B9)',
  showlabel: "\u5220\u9664\u8BE5\u547D\u4EE4",
  setlabelmode: "\u5220\u9664\u8BE5\u547D\u4EE4",
  rename: "\u521B\u5EFA\u5BF9\u8C61\u65F6\u76F4\u63A5\u7528\u76EE\u6807\u540D\u5B57\u547D\u540D",
  zoomin: "\u89C6\u7A97\u6539\u7528 view op"
};
var STYLE_CMD_RE = /^(?:Set|Show)[A-Z]|^Rename/;
var STYLE_ARG_COUNT_EXEMPT = /* @__PURE__ */ new Set(["setcoords"]);
function validateSetProperty(cmdName, args, mode, issues) {
  const def = findCommand(cmdName);
  if (mode === "3d") {
    const key = (def?.name ?? cmdName).toLowerCase();
    const fallback = MODE_3D_FORBIDDEN[key];
    if (fallback && def && !def.modes.includes("3d")) {
      issues.push({
        kind: "mode-forbidden",
        message: `${def.name} \u5728 3D \u6A21\u5F0F\u4E0B\u4E0D\u53EF\u7528\uFF08\u6267\u884C\u5FC5\u5931\u8D25\uFF09\u3002${def.note || fallback}\u3002\u8BF7\u5220\u9664\u8BE5\u547D\u4EE4\u5E76\u6539\u7528\u66FF\u4EE3\u65B9\u6848\u3002`
      });
    }
  }
  if (def?.name.toLowerCase() === "setcolor") {
    if (args.length === 4) {
      for (const [i, arg] of args.slice(1).entries()) {
        if (!isNumberArg(arg)) continue;
        const n = Number(unquote(arg));
        if (n < 0 || n > 1) {
          issues.push({
            kind: "value-range",
            message: `SetColor \u7B2C ${i + 2} \u4E2A\u53C2\u6570\uFF08r/g/b\uFF09\u8D85\u51FA 0~1\uFF1A${arg}\u3002r/g/b \u662F **0~1 \u6D6E\u70B9**\uFF08\u5F15\u64CE\u6309 \xD7255 \u89E3\u6790\uFF09\uFF0C${arg} \u5E94\u6539\u4E3A ${(n / 255).toFixed(3)}\u3002\u4F8B\u5982 (230, 50, 50) \u2192 (0.902, 0.196, 0.196)\uFF1B\u5199 0~255 \u6574\u6570\u4F1A\u88AB\u94B3\u6210\u767D\u8272\u3002`
          });
        }
      }
    } else if (args.length === 2) {
      const arg = args[1] ?? "";
      const quoted = /^["']/.test(arg.trim());
      if (!quoted && isNumberArg(arg)) {
        issues.push({
          kind: "value-range",
          message: `SetColor(${args.join(", ")}) \u662F\u300C\u989C\u8272\u540D\u300D\u5F62\u6001 \u2014\u2014 \u7B2C\u4E8C\u4E2A\u53C2\u6570\u5FC5\u987B\u662F\u989C\u8272\u540D\u5B57\u7B26\u4E32\u3002\u8981\u8BBE\u7F6E RGB \u5E94\u5199 **4 \u4E2A\u53C2\u6570**\uFF1ASetColor(obj, r, g, b)\uFF08r/g/b \u662F 0~1 \u6D6E\u70B9\uFF09\u3002`
        });
      } else if (quoted && new RegExp("\\P{ASCII}", "u").test(unquote(arg))) {
        issues.push({
          kind: "color-name",
          message: `SetColor \u7684\u989C\u8272\u540D\u5FC5\u987B\u662F**\u82F1\u6587**\uFF08\u5982 "red"\uFF09\uFF0C\u6536\u5230\u4E2D\u6587 ${arg} \u2014\u2014 GGB \u4E0D\u8BC6\u522B\u4E2D\u6587\u8272\u540D\u3002\u6539\u7528\u82F1\u6587\u8272\u540D\u5B57\u7B26\u4E32\uFF0C\u6216 SetColor(obj, r, g, b)\uFF080~1 \u6D6E\u70B9\uFF09\u3002`
        });
      } else if (!quoted && !isNumberArg(arg) && /^[A-Za-z_]\w*$/.test(arg.trim())) {
        issues.push({
          kind: "color-name",
          message: `SetColor \u7684\u989C\u8272\u53C2\u6570 ${arg} \u672A\u52A0\u5F15\u53F7 \u2014\u2014 \u88F8\u6807\u8BC6\u7B26\u4F1A\u88AB GGB \u5F53\u4F5C\u5BF9\u8C61\u5F15\u7528\u800C\u5931\u8D25\u3002\u989C\u8272\u540D\u9700\u5199\u6210\u5B57\u7B26\u4E32 ${JSON.stringify(`"${arg.trim().toLowerCase()}"`)}\uFF0C\u6216\u6539\u7528 SetColor(obj, r, g, b)\uFF080~1 \u6D6E\u70B9\uFF09\u3002`
        });
      }
    }
    return;
  }
  if (def && ["setlineopacity", "setfilling"].includes(def.name.toLowerCase()) && args.length === 2) {
    const arg = args[1] ?? "";
    if (isNumberArg(arg)) {
      const n = Number(unquote(arg));
      if (n < 0 || n > 1) {
        issues.push({
          kind: "value-range",
          message: `${def.name} \u7684\u900F\u660E\u5EA6\u5FC5\u987B\u662F 0~1 \u4E4B\u95F4\u7684\u5C0F\u6570\uFF0C\u6536\u5230 ${arg}\u3002\uFF08SetColor \u7684 r/g/b \u4E0E\u900F\u660E\u5EA6\u540C\u4E3A 0~1 \u6D6E\u70B9\uFF09`
        });
      }
    }
  }
}
var SCRIPTING_CALL_RE = /\b(Set[A-Z]\w*|Show[A-Z]\w*|ZoomIn|ZoomOut|CenterView|Pan|StartAnimation|StopAnimation)\s*\(/;
function scriptingNestIssue(cmd) {
  const body = stripStrings(cmd);
  for (const line of body.split("\n")) {
    const t = line.replace(/^\s*[A-Za-z_]\w*(?:\([^)]*\))?\s*=\s*/, "").trim();
    if (!t) continue;
    const headM = /^([A-Za-z_]\w*)\s*\(/.exec(t);
    if (headM && SCRIPTING_CALL_RE.test(`${headM[1]}(`)) continue;
    const m = SCRIPTING_CALL_RE.exec(t);
    if (!m) continue;
    return {
      kind: "scripting-nest",
      message: `\u68C0\u6D4B\u5230 scripting \u8BED\u53E5 ${m[1]}(...) \u5D4C\u5957\u5728\u8868\u8FBE\u5F0F\u4E2D \u2014\u2014 Set*/Show* \u7B49**\u53EA\u4EA7\u751F\u526F\u4F5C\u7528\u3001\u4E0D\u8FD4\u56DE\u503C**\uFF0CGGB \u53EA\u5141\u8BB8\u5B83\u4EEC\u4F5C\u6574\u6761\u547D\u4EE4\u7684\u5934\u90E8\uFF0C\u5D4C\u8FDB Sequence/Zip/If \u7B49\u8868\u8FBE\u5F0F\u4F4D\u7F6E\u5FC5\u5931\u8D25\uFF085.4.927 \u5B9E\u6D4B\uFF09\u3002\u6279\u91CF\u64CD\u4F5C\u8BF7**\u9010\u6761\u8F93\u51FA\u547D\u4EE4**\uFF08\u6BCF\u6761\u4E00\u4E2A eval\uFF09\uFF0C\u6216\u7528 eval_raw \u4EE5\u6362\u884C\u7B26\u5206\u9694\u591A\u6761\u547D\u4EE4\uFF08\u5B9E\u6D4B\u53EF\u884C\uFF1B\u5206\u53F7\u5206\u9694\u65E0\u6548\uFF09\u3002`
    };
  }
  return null;
}
var LOWERCASE_FUNCS = "sin|cos|tan|asin|acos|atan|atan2|sinh|cosh|tanh|sqrt|abs|exp|log|ln|floor|ceil|round";
function funcCaseIssue(cmd) {
  const body = stripStrings(cmd);
  const re = new RegExp(`\\b(${LOWERCASE_FUNCS})\\s*\\(`, "gi");
  let m;
  while ((m = re.exec(body)) !== null) {
    const hit = m[1];
    if (hit !== hit.toLowerCase()) {
      return {
        kind: "func-case",
        message: `\u68C0\u6D4B\u5230\u5927\u5199\u51FD\u6570 ${hit}(...) \u2014\u2014 \u51FD\u6570\u540D**\u5927\u5C0F\u5199\u654F\u611F\u4E14\u53EA\u6709\u5C0F\u5199\u5F62\u5F0F**\uFF08\u5B9E\u6D4B Sin/Cos/Tan/Sqrt/Abs/Exp/Log/Ln/Floor/Ceil/Round \u5927\u5199\u4E00\u5F8B\u6267\u884C\u5931\u8D25\uFF09\u3002\u8BF7\u6539\u4E3A\u5C0F\u5199 ${hit.toLowerCase()}(...)\u3002\u6CE8\u610F Min/Max/Mod \u662F\u5927\u5199\u547D\u4EE4\uFF0C\u4E0D\u53D7\u6B64\u9650\u3002`
      };
    }
  }
  return null;
}
var RESERVED_OBJECT_NAMES = /* @__PURE__ */ new Set(["If", "xAxis", "yAxis", "zAxis", "x", "y", "z", "e", "rad"]);
function reservedNameIssue(cmd) {
  const body = stripStrings(cmd);
  for (const line of body.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    const m = /^([A-Za-z_]\w*)(?:\([^)]*\))?\s*=(?!=)/.exec(t);
    if (!m) continue;
    const name = m[1];
    if (!RESERVED_OBJECT_NAMES.has(name)) continue;
    const why = name === "If" ? "If \u662F\u5185\u7F6E\u6761\u4EF6\u547D\u4EE4\uFF08If(\u6761\u4EF6, \u5219, \u5426\u5219)\uFF09\uFF0C\u5B9E\u6D4B\u8D4B\u503C\u521B\u5EFA\u7684\u51FD\u6570\u65E0\u6CD5\u88AB\u6837\u5F0F\u547D\u4EE4\u4E0E\u51E0\u4F55\u5F15\u7528\u6B63\u5E38\u5DE5\u4F5C" : name === "xAxis" || name === "yAxis" || name === "zAxis" ? `${name} \u662F\u753B\u5E03\u81EA\u5E26\u5750\u6807\u8F74\u7684\u4FDD\u7559\u540D\uFF0C\u65E0\u9700\u4E5F\u65E0\u6CD5\u521B\u5EFA\uFF08\u5B9E\u6D4B evalCommand \u6052\u8FD4\u56DE false\uFF09` : name === "e" ? "e \u662F\u6B27\u62C9\u6570\uFF0C\u8D4B\u503C\u540E 3e8 \u8FD9\u7C7B\u79D1\u5B66\u8BA1\u6570\u6CD5\u5B57\u9762\u91CF\u4F1A\u88AB\u5F15\u64CE\u62C6\u6210 3\xD7e\xD78\uFF08\u5B9E\u6D4B\uFF09" : name === "rad" ? "rad \u662F GGB \u5F27\u5EA6\u5355\u4F4D\u5173\u952E\u5B57\uFF0C\u8D4B\u503C\u540E\u5BF9\u8C61\u4F1A\u88AB\u5F15\u64CE\u9759\u9ED8\u6539\u540D\uFF08\u5982 eq1\uFF09\uFF0C\u4E0B\u6E38\u6309\u539F\u540D\u5F15\u7528\u5168\u90E8\u65AD\u94FE\uFF082026-11 \u6574\u673A\u56DE\u5F52\u5B9E\u6D4B\uFF09" : `${name} \u662F\u5750\u6807\u53D8\u91CF\u7B26\u53F7\uFF0C\u8D4B\u503C\u4F1A\u906E\u853D\u5750\u6807\u8BED\u4E49`;
    return {
      kind: "reserved-name",
      message: `\u68C0\u6D4B\u5230\u5BF9\u8C61\u8D4B\u503C\u540D ${name} \u4E0E GGB \u4FDD\u7559\u540D\u51B2\u7A81 \u2014\u2014 ${why}\u3002\u8BF7\u6362\u7528\u4E0D\u51B2\u7A81\u7684\u540D\u5B57\uFF08\u51FD\u6570\u5EFA\u8BAE f/g/h \u6216\u8BED\u4E49\u540D\u5982 traj/poly\uFF1B\u5750\u6807\u8F74\u4E0D\u9700\u8981\u521B\u5EFA\uFF0C\u753B\u5E03\u81EA\u5E26\uFF09\u3002`
    };
  }
  return null;
}
var ARG_COUNT_HINTS = {
  IterationList: [3, 3],
  Element: [2, 3],
  Zip: [3, 7],
  // 2026-11 联网核查：官方 Zip(expr, var1, list1, ...) 可变长，3/5/7 参均合法
  Segment: [2, 2],
  Vector: [2, 2],
  Sphere: [2, 2],
  Circle: [2, 3],
  Conic: [5, 6]
  // Conic(5 点) | Conic(ax²,by²,cxy,dx,ey,f 6 系数)；实测 7 系数引擎返回 true 却产出 emptyset（空转型陷阱）
};
function validateGGBCommand(cmd, mode) {
  const issues = [];
  const raw = cmd.trim();
  if (!raw) {
    return { ok: false, issues: [{ kind: "unbalanced", message: "\u547D\u4EE4\u4E3A\u7A7A" }], message: "\u547D\u4EE4\u4E3A\u7A7A" };
  }
  const balance = checkBracketBalance(raw);
  if (!balance.ok) {
    issues.push({
      kind: "unbalanced",
      message: `\u62EC\u53F7\u4E0D\u5339\u914D\uFF1A${balance.detail}\u3002\u8BF7\u9010\u4E2A\u6570\u6E05\u6BCF\u4E2A\u51FD\u6570\u8C03\u7528\u7684\u5DE6\u53F3\u62EC\u53F7\uFF08\u5D4C\u5957 Sequence/Cube/Vector \u65F6\u6700\u5BB9\u6613\u6F0F\u6389\u6700\u5916\u5C42 ")"\uFF09\u3002`
    });
  }
  const strayDot = STRAY_DOT_RE.exec(raw);
  if (strayDot) {
    issues.push({
      kind: "stray-dot",
      message: `\u68C0\u6D4B\u5230 ${JSON.stringify(strayDot[0])} \u2014\u2014 \u53C2\u6570\u4E4B\u95F4\u5FC5\u987B\u7528**\u9017\u53F7**\u5206\u9694\uFF0C\u4E0D\u80FD\u7528\u53E5\u70B9 "."\u3002\u5178\u578B\u9519\u8BEF\uFF1ACube((i,j,k),(i+1,j,k).e(i,j+1,k) \u5E94\u4E3A Cube((i,j,k),(i+1,j,k),(i,j+1,k))`
    });
  }
  const cmdName = extractCmdName(raw);
  const argsStr = extractFirstCallArgs(raw);
  if (cmdName && /^sequence$/i.test(cmdName) && argsStr !== null) {
    validateSequence(argsStr, issues, balance.ok);
  }
  const args = balance.ok && cmdName && argsStr !== null ? splitTopLevelArgs(argsStr) : null;
  if (args && cmdName) {
    const hint = ARG_COUNT_HINTS[capitalize(cmdName)];
    const def = hint ? void 0 : findCommand(cmdName);
    const styleHint = !hint && def && STYLE_CMD_RE.test(def.name) && !STYLE_ARG_COUNT_EXEMPT.has(def.name.toLowerCase()) ? def.paramCount : void 0;
    const effective = hint ?? styleHint;
    if (effective) {
      const given = args.length;
      const [pmin, pmax] = effective;
      if (given < pmin || pmax !== -1 && given > pmax) {
        const range = pmax === -1 ? `\u81F3\u5C11 ${pmin}` : `${pmin}~${pmax}`;
        issues.push({
          kind: "arg-count",
          message: `${cmdName} \u9700\u8981 ${range} \u4E2A\u53C2\u6570\uFF0C\u4F46\u6536\u5230 ${given} \u4E2A\uFF1A${JSON.stringify(argsStr)}`
        });
      }
    }
  }
  const trailing = trailingOperatorIssue(raw);
  if (trailing) issues.push(trailing);
  if (cmdName && args) {
    validateSetProperty(cmdName, args, mode, issues);
  }
  const scriptingNest = scriptingNestIssue(raw);
  if (scriptingNest) issues.push(scriptingNest);
  const funcCase = funcCaseIssue(raw);
  if (funcCase) issues.push(funcCase);
  const reserved = reservedNameIssue(raw);
  if (reserved) issues.push(reserved);
  issues.push(...assignDoubleEqualsIssues(raw));
  return { ok: issues.length === 0, issues, message: formatIssues(raw, issues) };
}
function assignDoubleEqualsIssues(raw) {
  const issues = [];
  for (const line of raw.split("\n")) {
    const s = stripStrings(line);
    let depth = 0;
    let seenAssignEq = false;
    let extraEqPos = -1;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === "(" || ch === "[" || ch === "{") {
        depth++;
        continue;
      }
      if (ch === ")" || ch === "]" || ch === "}") {
        depth--;
        continue;
      }
      if (ch === "=" && depth === 0) {
        const prev = s[i - 1];
        const next = s[i + 1];
        if (prev === "<" || prev === ">" || prev === "!" || prev === "=" || next === "=" || next === ">") continue;
        if (!seenAssignEq) {
          seenAssignEq = true;
        } else {
          extraEqPos = i;
          break;
        }
      }
    }
    if (seenAssignEq && extraEqPos >= 0) {
      issues.push({
        kind: "double-equals",
        message: `\u8D4B\u503C\u5F62\u6001\u51FA\u73B0\u7B2C\u4E8C\u4E2A\u9876\u5C42\u7B49\u53F7\uFF1A${JSON.stringify(line.trim().slice(0, 60))} \u2014\u2014 \u5F15\u64CE\u65E0\u6CD5\u89E3\u6790 "name = \u8868\u8FBE\u5F0F = \u503C" \u5F62\u6001\u3002\u547D\u540D\u7B49\u5F0F/\u5706\u9525\u66F2\u7EBF\u8BF7\u7528**\u5192\u53F7**\uFF1Aell: x^2/9 + y^2/4 = 1 \uFF08\u6216\u7701\u7565\u540D\u5B57\u76F4\u63A5\u5199 x^2/9 + y^2/4 = 1\uFF09`
      });
    }
  }
  return issues;
}
function capitalize(s) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
function formatIssues(cmd, issues) {
  if (issues.length === 0) return "";
  const lines = issues.map((it, i) => `  ${i + 1}. ${it.message}`);
  return `\u547D\u4EE4\u9759\u6001\u6821\u9A8C\u672A\u901A\u8FC7\uFF08\u65E0\u9700\u6267\u884C\u5373\u53EF\u5224\u5B9A\u5FC5\u5931\u8D25\uFF09\uFF1A
${cmd}
${lines.join("\n")}`;
}

// src/specSchema.ts
var RefinedSpec = external_exports.object({
  title: external_exports.string().max(60).optional(),
  spec: external_exports.string().max(3e3).optional(),
  ask: external_exports.string().max(300).optional()
}).refine(
  (o) => {
    if (o.ask && o.spec) return false;
    if (!o.ask && !o.spec) return false;
    return true;
  },
  "\u5FC5\u987B\u63D0\u4F9B spec \u6216 ask \u4E4B\u4E00\uFF0C\u4E14\u4E8C\u8005\u4E0D\u80FD\u540C\u65F6\u5B58\u5728"
);

// src/orchestrator.ts
var MAX_FORMAT_RETRY = 2;
function parseRefinedSpec(raw) {
  const cleaned = raw.trim().replace(/^```json?\s*/, "").replace(/\s*```$/, "");
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { spec: cleaned.slice(0, 3e3) };
  }
  const result = RefinedSpec.safeParse(parsed);
  if (result.success) return result.data;
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const o = parsed;
    if (typeof o.spec === "string" && o.spec.trim().length === 0 && !o.ask) {
      return { spec: "" };
    }
  }
  return { spec: cleaned.slice(0, 3e3) };
}
async function refineSpec(config, userText, domain, signal) {
  const phase1Messages = [
    { role: "system", content: buildRefinePrompt(domain) },
    { role: "user", content: userText }
  ];
  const light = resolveModel(config, "light");
  let raw = await chatRaw(config, phase1Messages, signal, light, void 0, true);
  if (!raw.trim()) {
    raw = await chatRaw(config, phase1Messages, signal, light, void 0, true);
  }
  const spec = parseRefinedSpec(raw);
  if (!spec) throw new AIError("Phase 1 \u7CBE\u70BC\u5931\u8D25\uFF1A\u8F93\u51FA\u65E0\u6CD5\u89E3\u6790\u4E3A\u89C4\u683C");
  return spec;
}
function leadingCommandName(cmd) {
  const t = cmd.trim();
  const direct = /^([A-Za-z_]\w*)\s*[([]/.exec(t);
  if (direct) return direct[1];
  const assigned = /=\s*([A-Za-z_]\w*)\s*[([]/.exec(t);
  return assigned ? assigned[1] : null;
}
function evaluateRawCommand(cmd, mode, definedNames) {
  const correction = correctCommand(cmd);
  const candidate = correction.changed ? correction.corrected : cmd;
  const v = validateGGBCommand(candidate, mode);
  const issues = v.issues.map((i) => ({ cmd, kind: i.kind, message: i.message }));
  const name = leadingCommandName(cmd);
  const halluc = name ? findHallucination(name) : void 0;
  const warnings = [];
  if (halluc && !correction.changed) {
    issues.push({
      cmd,
      kind: "hallucination",
      message: `${name} \u4E0D\u5B58\u5728\uFF08\u5F15\u64CE\u9759\u9ED8 no-op / \u6052 false\uFF09\u3002\u6B63\u786E\u7528\u6CD5\uFF1A${halluc.correct}\uFF08${halluc.reason}\uFF09`
    });
  } else {
    for (const s of correction.suggestions) warnings.push(s);
  }
  const assignFull = /^([A-Za-z_]\w*)(\([^)]*\))?\s*=(?!=)\s*(.+)$/.exec(cmd.trim());
  if (assignFull && /^[a-z_]/.test(assignFull[1]) && !assignFull[1].includes("_") && !assignFull[2] && !/^(u|v|w)$/.test(assignFull[1])) {
    const rhsExpr = assignFull[3].replace(/"[^"]*"/g, '""');
    const isExplicitGeomCmd = /^\s*[A-Z][A-Za-z]*\s*[([]/.test(rhsExpr);
    const isTupleLiteral = /^\(.*,[^)]*\)\s*$/.test(rhsExpr);
    const isPointArith = /[A-Za-z]\w*\s*[+-]\s*\([^)]*,[^)]*\)/.test(rhsExpr) || /\([^)]*,[^)]*\)\s*[+-]/.test(rhsExpr);
    if (!isExplicitGeomCmd && (isTupleLiteral || isPointArith)) {
      warnings.push(
        `\u300C${assignFull[1]}\u300D\u9996\u5B57\u6BCD\u5C0F\u5199\u2014\u2014GGB \u4F1A\u628A\u70B9\u8868\u8FBE\u5F0F\u8D4B\u7ED9\u5C0F\u5199\u540D\u7684\u7ED3\u679C\u63A8\u65AD\u4E3A Vector\uFF08\u591A\u8FB9\u5F62\u9876\u70B9/\u7BAD\u5934\u7AEF\u70B9\u5C06\u9759\u9ED8\u5931\u8D25\uFF09\u3002\u82E5\u7528\u4F5C\u70B9\uFF0C\u8BF7\u6539\u7528\u9996\u5B57\u6BCD\u5927\u5199\u7684\u540D\u5B57\uFF08\u5982 ${assignFull[1][0].toUpperCase()}${assignFull[1].slice(1)}\uFF09`
      );
    }
  }
  const assignM = /^([A-Za-z_]\w*)\s*(?:\([^)]*\))?\s*=(?!=)/.exec(cmd.trim());
  const rhs = (assignM ? cmd.trim().slice(assignM[0].length) : cmd).replace(/"[^"]*"/g, '""');
  for (const m of rhs.matchAll(/(?<![A-Za-z0-9_])[A-Za-z]\w*_[xy](?![\w])/g)) {
    const full = m[0];
    const base = full.replace(/_[xy]$/, "");
    if (definedNames) {
      if (!definedNames.has(full) && definedNames.has(base)) {
        issues.push({
          cmd,
          kind: "bad-coord-access",
          message: `\u300C${full}\u300D\u4E0D\u662F\u5DF2\u5B9A\u4E49\u5BF9\u8C61\u2014\u2014GGB \u7ECF\u5178\u8F93\u5165\u65E0 P_x \u5750\u6807\u8BBF\u95EE\u5F62\u6001\uFF08\u5F15\u64CE\u5FC5\u62D2\u7EDD\uFF09\u3002\u8BF7\u7528 x(${base}) / y(${base}) \u53D6\u5206\u91CF`
        });
        continue;
      }
      if (!definedNames.has(full)) {
        warnings.push(`\u300C${full}\u300D\u7591\u4F3C\u60F3\u53D6\u5750\u6807\u2014\u2014GGB \u7ECF\u5178\u8F93\u5165\u65E0 P_x \u5F62\u6001\uFF0C\u8BF7\u7528 x(${base}) / y(${base}) \u8BBF\u95EE\u5206\u91CF`);
      }
    } else {
      warnings.push(`\u300C${full}\u300D\u7591\u4F3C\u60F3\u53D6\u5750\u6807\u2014\u2014GGB \u7ECF\u5178\u8F93\u5165\u65E0 P_x \u5F62\u6001\uFF0C\u8BF7\u7528 x(${base}) / y(${base}) \u8BBF\u95EE\u5206\u91CF`);
    }
  }
  return {
    input: cmd,
    corrected: correction.changed ? correction.corrected : void 0,
    changed: correction.changed,
    warnings,
    ok: issues.length === 0,
    issues
  };
}
function guardResponse(response, mode) {
  const corrections = [];
  const issues = [];
  const warnings = [];
  const correctedByCmd = /* @__PURE__ */ new Map();
  const definedNames = /* @__PURE__ */ new Set();
  for (const c of response.commands) {
    if (c.op === "eval") {
      const m = /^\s*([A-Za-z_]\w*)\s*(?:\([^)]*\))?\s*=(?!=)/.exec(c.cmd);
      if (m) definedNames.add(m[1]);
    } else if (c.op === "slider" || c.op === "vector") {
      definedNames.add(c.name);
    }
  }
  for (const c of response.commands) {
    if (c.op !== "eval") continue;
    const ev = evaluateRawCommand(c.cmd, mode, definedNames);
    if (ev.changed && ev.corrected) {
      correctedByCmd.set(c.cmd, ev.corrected);
      corrections.push(`${c.cmd} \u2192 ${ev.corrected}`);
    }
    issues.push(...ev.issues);
    warnings.push(...ev.warnings);
  }
  const commands = response.commands.map((c) => {
    if (c.op === "eval" && correctedByCmd.has(c.cmd)) {
      return { ...c, cmd: correctedByCmd.get(c.cmd) };
    }
    return c;
  });
  const isLowerPointAssign = (cmdText) => {
    const m = /^([a-z_]\w*)\s*=(?!=)\s*(.+)$/.exec(cmdText.trim());
    if (!m || /^(u|v|w)$/.test(m[1]) || m[1].includes("_")) return null;
    const rhs = m[2].replace(/"[^"]*"/g, '""');
    if (/^\s*[A-Z][A-Za-z]*\s*[([]/.test(rhs)) return null;
    const isTupleLiteral = /^\(.*,[^)]*\)\s*$/.test(rhs);
    const isPointArith = /[A-Za-z]\w*\s*[+-]\s*\([^)]*,[^)]*\)/.test(rhs) || /\([^)]*,[^)]*\)\s*[+-]/.test(rhs);
    return isTupleLiteral || isPointArith ? m[1] : null;
  };
  const lowerPointNames = /* @__PURE__ */ new Map();
  for (const c of response.commands) {
    if (c.op !== "eval") continue;
    const nm = isLowerPointAssign(c.cmd);
    if (nm) lowerPointNames.set(nm, c.cmd);
  }
  if (lowerPointNames.size > 0) {
    const note = (nm, consumer) => `\u300C${nm}\u300D\u9996\u5B57\u6BCD\u5C0F\u5199\uFF0CGGB \u4F1A\u628A\u8BE5\u70B9\u8868\u8FBE\u5F0F\u63A8\u65AD\u4E3A Vector\uFF0C${consumer} \u5F15\u7528\u5FC5\u5931\u8D25\u3002\u8BF7\u628A\u5B9A\u4E49\u4E0E\u5F15\u7528\u90FD\u6539\u4E3A\u9996\u5B57\u6BCD\u5927\u5199\u7684\u540D\u5B57\uFF08\u5982 ${nm[0].toUpperCase()}${nm.slice(1)}\uFF09`;
    for (const c of response.commands) {
      if (c.op === "eval") {
        const pm = /\bPolygon\s*\(([^)]*)\)/.exec(c.cmd);
        if (pm) {
          for (const arg of pm[1].split(",")) {
            const nm = arg.trim();
            if (lowerPointNames.has(nm)) {
              issues.push({ cmd: c.cmd, kind: "lowercase-point", message: note(nm, "Polygon \u9876\u70B9") });
            }
          }
        }
      } else if (c.op === "vector") {
        for (const ep of [c.from, c.to]) {
          if (lowerPointNames.has(ep)) {
            issues.push({ cmd: c.cmd, kind: "lowercase-point", message: note(ep, "vector op \u7AEF\u70B9") });
          }
        }
      }
    }
  }
  return {
    ok: issues.length === 0,
    response,
    commands,
    corrections,
    issues,
    warnings,
    issuesMessage: issues.map((i) => `- ${i.cmd} \u2192 [${i.kind}] ${i.message}`).join("\n")
  };
}
async function chatWithFormatRetry(config, msgs, signal) {
  let conv = msgs;
  for (let i = 0; i <= MAX_FORMAT_RETRY; i++) {
    try {
      return await chat(config, conv, signal, resolveModel(config, "heavy"));
    } catch (err) {
      if (err instanceof AISchemaError && i < MAX_FORMAT_RETRY) {
        conv = [
          ...conv,
          { role: "assistant", content: err.raw },
          { role: "user", content: buildFormatRepairMessage(err.raw, err.detail) }
        ];
        continue;
      }
      throw err;
    }
  }
  throw new AIError("AI \u591A\u6B21\u8FD4\u56DE\u683C\u5F0F\u9519\u8BEF\uFF0C\u5DF2\u653E\u5F03");
}
async function compileSpec(config, specText, opts) {
  const { domain, mode, signal } = opts;
  const repair = opts.repair !== false;
  const phase2Messages = [
    { role: "system", content: buildCompilePrompt(domain, mode) },
    { role: "user", content: specText }
  ];
  const response = await chatWithFormatRetry(config, phase2Messages, signal);
  let guarded = guardResponse(response, mode);
  let rounds = 1;
  if (!guarded.ok && repair) {
    const feedback = [
      "\u4F60\u4E0A\u4E00\u8F6E\u8F93\u51FA\u7684\u4EE5\u4E0B\u547D\u4EE4\u672A\u901A\u8FC7\u79BB\u7EBF\u62A4\u680F\uFF0C\u8BF7\u4FEE\u6B63\u540E\u91CD\u65B0\u8F93\u51FA\u5B8C\u6574 JSON\uFF08\u540C\u6837\u7684\u547D\u4EE4\u534F\u8BAE\uFF0C\u4E0D\u8981\u89E3\u91CA\uFF09\uFF1A",
      guarded.issuesMessage,
      guarded.corrections.length > 0 ? "\n\u4EE5\u4E0B\u547D\u4EE4\u5DF2\u88AB\u81EA\u52A8\u7EA0\u6B63\uFF0C\u8BF7\u76F4\u63A5\u91C7\u7528\u7EA0\u6B63\u540E\u7684\u5F62\u6001\uFF1A\n" + guarded.corrections.map((c) => `- ${c}`).join("\n") : ""
    ].filter(Boolean).join("\n");
    const repairMessages = [
      ...phase2Messages,
      { role: "assistant", content: JSON.stringify(response) },
      { role: "user", content: feedback }
    ];
    const repaired = await chatWithFormatRetry(config, repairMessages, signal);
    const guarded2 = guardResponse(repaired, mode);
    rounds = 2;
    if (guarded2.ok || guarded2.issues.length < guarded.issues.length) {
      guarded = guarded2;
    }
  }
  return {
    ...guarded,
    rounds,
    self_check: guarded.response.self_check
  };
}
async function runOnce(config, userText, opts) {
  const refine = await refineSpec(config, userText, opts.domain, opts.refineSignal);
  if (refine.ask || !refine.spec) {
    return { refine, compile: null, asked: Boolean(refine.ask) };
  }
  const { refineSignal: _ignored, ...compileOpts } = opts;
  const compile = await compileSpec(config, refine.spec, compileOpts);
  return { refine, compile };
}

// src/render.ts
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

// src/gif.ts
var import_gifenc = __toESM(require_gifenc(), 1);
function encodeGIF(frames, width, height, delayMs) {
  if (frames.length === 0) throw new Error("encodeGIF: \u65E0\u5E27");
  const gif = (0, import_gifenc.GIFEncoder)();
  const mid = frames[Math.floor(frames.length / 2)];
  const last = frames[frames.length - 1];
  const sample = new Uint8Array(frames[0].length + mid.length + last.length);
  sample.set(frames[0], 0);
  sample.set(mid, frames[0].length);
  sample.set(last, frames[0].length + mid.length);
  const palette = (0, import_gifenc.quantize)(sample, 256, { format: "rgba4444" });
  frames.forEach((f, i) => {
    const index = (0, import_gifenc.applyPalette)(f, palette, "rgba4444");
    gif.writeFrame(index, width, height, {
      palette: i === 0 ? palette : void 0,
      // 首帧写全局色表，后续帧复用
      delay: delayMs,
      repeat: 0,
      // 无限循环
      first: i === 0
    });
  });
  gif.finish();
  return Buffer.from(gif.bytes());
}

// src/render.ts
var SKILL_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
var HOST_HTML = join(SKILL_ROOT, "scripts", "ggb-host.html");
function resolveEngineDir(explicit) {
  const candidates = [];
  if (explicit) candidates.push(resolvePath(explicit));
  if (process.env.AIGGB_GGB_HOME) candidates.push(resolvePath(process.env.AIGGB_GGB_HOME));
  let dir = SKILL_ROOT;
  for (let i = 0; i < 6; i++) {
    candidates.push(join(dir, "public", "GeoGebra"));
    dir = dirname(dir);
  }
  for (const c of candidates) {
    if (existsSync(join(c, "deployggb.js"))) return c;
  }
  return "";
}
function downloadEngine() {
  const dest = join(SKILL_ROOT, "engine");
  if (existsSync(join(dest, "deployggb.js"))) return dest;
  mkdirSync(dest, { recursive: true });
  const zip = join(tmpdir(), `aiggb-ggb-bundle-${Date.now()}.zip`);
  console.error("[render] \u6B63\u5728\u4ECE\u5B98\u65B9\u4E0B\u8F7D GeoGebra Math Apps Bundle\uFF08~50MB\uFF0C\u9700\u76F4\u8FDE\u7F51\u7EDC\uFF09\u2026");
  execFileSync(process.execPath, ["-e", `
    const { get } = require("https");
    const fs = require("fs");
    get("https://download.geogebra.org/package/geogebra-math-apps-bundle", res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        get(res.headers.location, r2 => pipe(r2));
        return;
      }
      pipe(res);
      function pipe(r) {
        if (r.statusCode !== 200) { console.error("HTTP", r.statusCode); process.exit(1); }
        const f = fs.createWriteStream(${JSON.stringify(zip)});
        r.pipe(f);
        f.on("finish", () => f.close(() => process.exit(0)));
      }
    });
  `], { stdio: "inherit" });
  console.error("[render] \u89E3\u538B\u5230", dest);
  try {
    execFileSync("unzip", ["-o", zip, "-d", dest], { stdio: "pipe" });
  } catch {
    if (process.platform === "win32") {
      execFileSync("powershell", [
        "-NoProfile",
        "-Command",
        `Expand-Archive -Force -Path '${zip}' -DestinationPath '${dest}'`
      ], { stdio: "pipe" });
    } else {
      execFileSync("tar", ["-xf", zip, "-C", dest], { stdio: "pipe" });
    }
  }
  if (!existsSync(join(dest, "deployggb.js")) && existsSync(join(dest, "GeoGebra", "deployggb.js"))) {
    return join(dest, "GeoGebra");
  }
  if (!existsSync(join(dest, "deployggb.js"))) {
    throw new Error("\u89E3\u538B\u540E\u672A\u627E\u5230 deployggb.js\u2014\u2014\u8BF7\u68C0\u67E5 engine/ \u76EE\u5F55\u7ED3\u6784");
  }
  return dest;
}
var MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".json": "application/json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".eot": "application/vnd.ms-fontobject",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon"
};
function startHostServer(engineDir) {
  const hostHtml = readFileSync(HOST_HTML, "utf-8");
  return new Promise((resolvePromise, reject) => {
    const server = createServer((req, res) => {
      try {
        const url = (req.url ?? "/").split("?")[0];
        if (url === "/" || url === "/host.html") {
          res.writeHead(200, { "Content-Type": MIME[".html"] });
          res.end(hostHtml);
          return;
        }
        if (url.startsWith("/engine/")) {
          const rel = url.slice("/engine/".length).split("/").map(decodeURIComponent).join("/");
          const file = resolvePath(engineDir, rel);
          if (!file.startsWith(resolvePath(engineDir)) || !existsSync(file) || !statSync(file).isFile()) {
            res.writeHead(404);
            res.end("not found");
            return;
          }
          const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
          res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream", "Cache-Control": "no-store" });
          res.end(readFileSync(file));
          return;
        }
        res.writeHead(204);
        res.end();
      } catch (e) {
        res.writeHead(500);
        res.end(String(e));
      }
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      resolvePromise({ port, close: () => server.close() });
    });
  });
}
async function launchBrowserHeadless() {
  const executablePath = process.env.AIGGB_CHROME || void 0;
  const channel = process.env.AIGGB_BROWSER_CHANNEL;
  const errors = [];
  const importPkg = async (name) => {
    try {
      return await import(
        /* @vite-ignore */
        name
      );
    } catch {
      errors.push(`${name}: \u672A\u5B89\u88C5`);
      return null;
    }
  };
  let pw = await importPkg("playwright-core") ?? await importPkg("playwright");
  if (!pw) {
    throw new Error(
      "\u6E32\u67D3\u9700\u8981\u6D4F\u89C8\u5668\u9A71\u52A8\uFF1A\u8BF7\u5728 skill \u76EE\u5F55\u6267\u884C `npm i playwright-core`\uFF08\u63A8\u8350\uFF0C\u7528\u7CFB\u7EDF Edge/Chrome\uFF0C\u65E0\u9700\u4E0B\u8F7D\u6D4F\u89C8\u5668\uFF09\uFF0C\u6216 `npm i playwright && npx playwright install chromium`\u3002\u4E5F\u53EF\u7528 AIGGB_CHROME \u6307\u5B9A\u6D4F\u89C8\u5668\u53EF\u6267\u884C\u6587\u4EF6\u3002" + (errors.length ? `\uFF08\u5C1D\u8BD5\u5931\u8D25\uFF1A${errors.join("\uFF1B")}\uFF09` : "")
    );
  }
  const attempts = [];
  if (executablePath) attempts.push({ executablePath, headless: true });
  if (channel) attempts.push({ channel, headless: true });
  attempts.push({ headless: true });
  attempts.push({ channel: "msedge", headless: true });
  attempts.push({ channel: "chrome", headless: true });
  for (const opt of attempts) {
    try {
      const browser = await pw.chromium.launch(opt);
      return browser;
    } catch (e) {
      errors.push(`${JSON.stringify(opt)}: ${e.message.split("\n")[0]}`);
    }
  }
  throw new Error("\u65E0\u6CD5\u542F\u52A8\u6D4F\u89C8\u5668\u3002\u5C1D\u8BD5\u8BB0\u5F55\uFF1A\n" + errors.join("\n"));
}
function inferAnimParams(commands, override) {
  const cmds = commands;
  let target = override?.animTarget ?? "";
  let from = override?.animFrom;
  let to = override?.animTo;
  let pingpong = false;
  const sliders = /* @__PURE__ */ new Map();
  const num2 = (v) => typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : void 0;
  for (const c of cmds) {
    if (c.op === "slider") {
      const s = c;
      const mn = num2(s.min), mx = num2(s.max);
      if (s.name && mn !== void 0 && mx !== void 0) sliders.set(s.name, { min: mn, max: mx });
    } else if (c.op === "eval") {
      const cmdStr = String(c.cmd ?? "");
      const sm = /^\s*([A-Za-z_]\w*)\s*=\s*Slider\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)/.exec(cmdStr);
      if (sm) sliders.set(sm[1], { min: Number(sm[2]), max: Number(sm[3]) });
    }
  }
  for (const c of cmds) {
    if (c.op === "animate" && c.on === true) {
      const t = c.target ?? "";
      if (!target) {
        target = t;
        pingpong = c.repeat === "oscillating";
      }
    } else if (c.op === "eval" && !target) {
      const sm = /StartAnimation\(\s*([A-Za-z_]\w*)\s*[,)]/.exec(String(c.cmd ?? ""));
      if (sm) target = sm[1];
    }
    if (c.op === "slider" && c.name === target) {
      const s = c;
      from ??= num2(s.min);
      to ??= num2(s.max);
    }
  }
  if (target && sliders.has(target)) {
    from ??= sliders.get(target).min;
    to ??= sliders.get(target).max;
  }
  if (!target && sliders.size > 0) {
    target = [...sliders.keys()][0];
    from ??= sliders.get(target).min;
    to ??= sliders.get(target).max;
  }
  return {
    animTarget: target,
    animFrom: from ?? 0,
    animTo: to ?? 1,
    pingpong,
    frames: override?.frames ?? 24,
    fps: override?.fps ?? 15,
    scale: override?.scale ?? 0.5
  };
}
async function renderCommands(opts) {
  const t0 = Date.now();
  const timeoutMs = opts.timeoutMs ?? 12e4;
  const result = {
    ok: false,
    out: opts.out,
    execOk: 0,
    execTotal: opts.commands.length,
    failedIdx: "",
    objects: 0,
    exportSource: "none",
    ms: 0,
    engineDir: ""
  };
  let engineDir = resolveEngineDir(opts.engineDir);
  if (!engineDir && opts.download) engineDir = downloadEngine();
  if (!engineDir) {
    result.error = "\u672A\u627E\u5230 GeoGebra \u5F15\u64CE\u3002\u4E09\u9009\u4E00\uFF1A\u2460 --engine <Math Apps Bundle \u76EE\u5F55>\uFF08\u542B deployggb.js\uFF09\uFF1B\u2461 \u73AF\u5883\u53D8\u91CF AIGGB_GGB_HOME\uFF1B\u2462 --download \u4ECE\u5B98\u65B9\u4E0B\u8F7D\u5230 skill/engine/\uFF08\u9700\u76F4\u8FDE\u7F51\u7EDC\uFF09\u3002AiGGB \u9879\u76EE\u7684 public/GeoGebra \u4F1A\u88AB\u81EA\u52A8\u63A2\u6D4B\u3002";
    result.ms = Date.now() - t0;
    return result;
  }
  result.engineDir = engineDir;
  const server = await startHostServer(engineDir);
  let browser = null;
  try {
    browser = await launchBrowserHeadless();
    const page = await browser.newPage({ viewport: { width: opts.width ?? 1280, height: opts.height ?? 800 } });
    const isGif = Boolean(opts.gif);
    const isGgb = Boolean(opts.ggb) && !isGif;
    const anim = isGif ? inferAnimParams(opts.commands, opts.gif) : null;
    if (isGif && anim && !anim.animTarget) {
      result.error = "GIF \u6A21\u5F0F\u672A\u627E\u5230\u52A8\u753B\u76EE\u6807\uFF1A\u547D\u4EE4\u4E2D\u65E0 on:true \u7684 animate op\uFF0C\u53EF\u7528 --anim <\u6ED1\u5757\u540D> \u663E\u5F0F\u6307\u5B9A";
      result.ms = Date.now() - t0;
      return result;
    }
    const qs = new URLSearchParams({
      cmds: JSON.stringify(opts.commands),
      app: opts.appMode === "3d" ? "3d" : "classic",
      w: String(opts.width ?? 1280),
      h: String(opts.height ?? 800),
      static: opts.staticMode === false ? "0" : "1",
      export: "1"
    });
    if (isGgb) qs.set("ggb", "1");
    if (isGif && anim) {
      qs.set("gif", "1");
      qs.set("frames", String(anim.frames));
      qs.set("anim", anim.animTarget);
      qs.set("animFrom", String(anim.animFrom));
      qs.set("animTo", String(anim.animTo));
      qs.set("gifScale", String(anim.scale));
      if (anim.pingpong) qs.set("pingpong", "1");
    }
    await page.goto(`http://127.0.0.1:${server.port}/?${qs.toString()}`, { waitUntil: "domcontentloaded", timeout: 3e4 });
    await page.waitForFunction(() => typeof document.title === "string" && (document.title.startsWith("DONE:") || document.title.startsWith("ERR:")), { timeout: timeoutMs, polling: 400 });
    const title = await page.title();
    if (title.startsWith("ERR:")) throw new Error("\u5BBF\u4E3B\u9519\u8BEF: " + title);
    const m = /DONE:(\d+)\/(\d+) fail:([\d,]*)/.exec(title);
    result.execOk = m ? Number(m[1]) : -1;
    result.execTotal = m ? Number(m[2]) : -1;
    result.failedIdx = m ? m[3] || "" : "?";
    result.objects = await page.evaluate(() => window.__execReport?.objects ?? -1);
    if (isGgb) {
      await page.waitForFunction(() => typeof document.title === "string" && (document.title.startsWith("GGBF:") || document.title.startsWith("ERR:")), { timeout: 15e3, polling: 300 });
      const b64 = await page.evaluate(() => window.__GGBFILE ?? null);
      if (typeof b64 === "string" && Buffer.from(b64.slice(0, 8), "base64").subarray(0, 2).toString("latin1") === "PK") {
        mkdirSync(dirname(resolvePath(opts.out)), { recursive: true });
        writeFileSync(resolvePath(opts.out), Buffer.from(b64, "base64"));
        result.exportSource = "ggb";
      } else {
        result.error = "getBase64 \u672A\u8FD4\u56DE\u6709\u6548\u7684 .ggb ZIP \u5BB9\u5668";
      }
    } else if (isGif && anim) {
      await page.waitForFunction(() => typeof document.title === "string" && (document.title.startsWith("GIF:") || document.title.startsWith("ERR:")), { timeout: timeoutMs, polling: 500 });
      const gifTitle = await page.title();
      const gifErr = await page.evaluate(() => window.__GIFERR ?? null);
      const count = Number(/GIF:(\d+)/.exec(gifTitle)?.[1] ?? 0);
      if (gifErr || count === 0) throw new Error("GIF \u5E27\u91C7\u96C6\u5931\u8D25: " + (gifErr ?? "0 \u5E27"));
      const frames = [];
      for (let k = 0; k < count; k++) {
        const b64 = await page.evaluate((i) => {
          const arr = window.__FRAMES ?? [];
          return arr[i] ?? null;
        }, k);
        if (!b64) throw new Error(`GIF \u7B2C ${k} \u5E27\u6570\u636E\u7F3A\u5931`);
        frames.push(Buffer.from(b64, "base64"));
      }
      const fw = Math.round((opts.width ?? 1280) * anim.scale);
      const fh = Math.round((opts.height ?? 800) * anim.scale);
      const delayMs = Math.round(1e3 / anim.fps);
      const gifBuf = encodeGIF(frames, fw, fh, delayMs);
      mkdirSync(dirname(resolvePath(opts.out)), { recursive: true });
      writeFileSync(resolvePath(opts.out), gifBuf);
      result.exportSource = "gif";
    } else {
      const isPngB64 = (b64) => typeof b64 === "string" && Buffer.from(b64.slice(0, 20), "base64").subarray(0, 4).toString("hex") === "89504e47";
      try {
        await page.waitForFunction(() => typeof document.title === "string" && document.title.startsWith("PNG:"), { timeout: 1e4, polling: 300 });
        const b64 = await page.evaluate(() => window.__PNG ?? null);
        if (isPngB64(b64)) {
          mkdirSync(dirname(resolvePath(opts.out)), { recursive: true });
          writeFileSync(resolvePath(opts.out), Buffer.from(b64, "base64"));
          result.exportSource = "getBase64";
        }
      } catch {
      }
      if (result.exportSource === "none") {
        mkdirSync(dirname(resolvePath(opts.out)), { recursive: true });
        await page.screenshot({ path: resolvePath(opts.out) });
        result.exportSource = "screenshot";
      }
    }
    result.ok = result.exportSource !== "none" && result.execOk === result.execTotal && result.execTotal > 0;
    if (result.exportSource === "none") {
      result.error = "\u5BFC\u51FA\u5931\u8D25\uFF08\u672A\u4EA7\u51FA\u6709\u6548\u6587\u4EF6\uFF09";
    } else if (result.execOk !== result.execTotal) {
      result.error = `\u90E8\u5206\u547D\u4EE4\u6267\u884C\u5931\u8D25\uFF08failIdx: ${result.failedIdx}\uFF09\u2014\u2014\u6587\u4EF6\u5DF2\u751F\u6210\uFF0C\u53EF\u4EBA\u5DE5\u68C0\u67E5`;
    }
  } finally {
    try {
      await browser?.close();
    } catch {
    }
    server.close();
  }
  result.ms = Date.now() - t0;
  return result;
}

// src/cli.ts
var FLAG_NAMES = /* @__PURE__ */ new Set([
  "--mode",
  "--domain",
  "--file",
  "--spec",
  "--out",
  "--base-url",
  "--api-key",
  "--model",
  "--light-model",
  "--reasoning",
  "--max-tokens",
  "--temperature",
  "--json",
  "--no-repair",
  "--help",
  "-h",
  "--engine",
  "--width",
  "--height",
  "--channel",
  "--save-cmds",
  "--timeout",
  "--frames",
  "--fps",
  "--anim",
  "--gif-scale"
]);
var BOOLEAN_FLAGS = /* @__PURE__ */ new Set(["--json", "--no-repair", "--help", "--animate", "--download", "--gif", "--ggb"]);
function parseArgs(argv) {
  const positionals = [];
  const flags = {};
  let command = "";
  let sepSeen = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--" && !sepSeen) {
      sepSeen = true;
      continue;
    }
    if (!sepSeen && a.startsWith("--")) {
      const eq = a.indexOf("=");
      let name = eq > 0 ? a.slice(0, eq) : a;
      let value = eq > 0 ? a.slice(eq + 1) : true;
      if (eq < 0 && FLAG_NAMES.has(name) && !BOOLEAN_FLAGS.has(name) && i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        value = argv[++i];
      }
      flags[name] = value;
      continue;
    }
    if (!command) command = a;
    else positionals.push(a);
  }
  return { command, positionals, flags };
}
function usage() {
  return `aiggb \u2014 \u81EA\u7136\u8BED\u8A00 \u2192 GeoGebra \u547D\u4EE4\uFF08\u62A4\u680F CLI\uFF09

\u79BB\u7EBF\uFF08\u65E0\u9700 API Key\uFF09:
  check --mode 2d -- 'f(x)=x^2' 'Conic(1/9,1/4,0,0,0,-1)'
      \u6821\u9A8C/\u7EA0\u6B63\u539F\u59CB GGB \u547D\u4EE4\uFF08\u4E5F\u53EF\u4ECE stdin \u9010\u884C\u8BFB\u5165\uFF09
  validate --mode 2d --file response.json
      \u6821\u9A8C 14-op \u534F\u8BAE JSON\uFF08schema + \u9010\u6761\u9759\u6001\u9884\u68C0 + \u6A21\u7CCA\u7EA0\u6B63\uFF09
  kb Slider                    \u67E5\u547D\u4EE4\u7B7E\u540D/\u53C2\u6570/\u793A\u4F8B
  kb El                        \u67E5\u81C6\u9020\u547D\u4EE4\u7684\u6B63\u786E\u66FF\u4EE3
  list [pattern] [--mode 3d]   \u5217\u51FA\u53EF\u7528\u547D\u4EE4
  hallucinations [--mode 3d]   \u81C6\u9020\u547D\u4EE4\u9ED1\u540D\u5355\u4E0E\u6B63\u786E\u66FF\u4EE3
  reference --mode 3d --domain physics [--out file.md]
  gen-docs <outdir>            \u751F\u6210\u547D\u4EE4\u53C2\u8003 markdown\uFF082d/3d\uFF09

\u5728\u7EBF\uFF08\u9700 AIGGB_API_KEY\uFF0C\u4EFB\u4F55 OpenAI \u517C\u5BB9\u7AEF\u70B9\uFF09:
  refine '\u753B\u659C\u629B\u8FD0\u52A8 v0=20 \u4EF0\u89D245\xB0' [--domain physics]
  compile --spec spec.json [--mode 2d] [--no-repair]
  run '\u753B\u5355\u6446\u5C0F\u89D2\u5EA6\u6446\u52A8' [--domain physics] [--mode 2d]

\u51FA\u56FE\uFF08\u771F\u5B9E GGB \u5F15\u64CE\u6E32\u67D3 \u2192 PNG/GIF/.ggb\uFF09:
  render --file commands.json --out figure.png [--engine <bundle\u76EE\u5F55>] [--mode 3d]
      \u6267\u884C 14-op \u547D\u4EE4 JSON \u5E76\u5BFC\u51FA PNG\uFF08--animate \u4FDD\u7559\u52A8\u753B\uFF0C\u9ED8\u8BA4\u9759\u6001\u622A\u56FE\uFF09
  render --file cmds.json --out demo.gif --gif [--frames 24] [--fps 15] [--anim t]
      \u5BFC\u51FA GIF \u52A8\u56FE\uFF08\u786E\u5B9A\u6027\u5E27\u6B65\u8FDB\u9A71\u52A8\u52A8\u753B\u6ED1\u5757\uFF1B--anim \u663E\u5F0F\u6307\u5B9A\u76EE\u6807\u6ED1\u5757\uFF09
  render --file cmds.json --out demo.ggb
      \u5BFC\u51FA .ggb \u6784\u9020\u6587\u4EF6\uFF08GeoGebra \u76F4\u63A5\u6253\u5F00\uFF0C\u6ED1\u5757/\u52A8\u753B\u53EF\u7EE7\u7EED\u4EA4\u4E92\u7F16\u8F91\uFF09
  draw '\u753B\u659C\u629B\u8FD0\u52A8\u6F14\u793A' --out p1.png [--save-cmds cmds.json] [--gif] [--out *.ggb]
      \u81EA\u7136\u8BED\u8A00 \u2192 \u7CBE\u70BC \u2192 \u7F16\u8BD1 \u2192 \u51FA\u56FE \u4E00\u6761\u9F99\uFF08\u9700 AIGGB_API_KEY + \u5F15\u64CE\uFF09
  \u5F15\u64CE: \u81EA\u52A8\u63A2\u6D4B AiGGB \u9879\u76EE public/GeoGebra\uFF1B\u6216 --engine <\u76EE\u5F55>\uFF1B\u6216 AIGGB_GGB_HOME\uFF1B
        \u6216 --download\uFF08\u5B98\u65B9 bundle ~50MB\uFF0C\u9700\u76F4\u8FDE\u7F51\u7EDC\uFF09
  \u6D4F\u89C8\u5668: \u9700 npm i playwright-core\uFF08\u7528\u7CFB\u7EDF Edge/Chrome\uFF09\uFF1BAIGGB_CHROME \u53EF\u6307\u5B9A\u53EF\u6267\u884C\u6587\u4EF6

\u73AF\u5883\u53D8\u91CF: AIGGB_API_KEY / AIGGB_BASE_URL / AIGGB_MODEL / AIGGB_LIGHT_MODEL /
          AIGGB_REASONING_EFFORT / AIGGB_MAX_OUTPUT_TOKENS / AIGGB_TEMPERATURE /
          AIGGB_GGB_HOME / AIGGB_CHROME / AIGGB_BROWSER_CHANNEL
\u9000\u51FA\u7801:   0 \u6210\u529F | 1 \u6821\u9A8C\u672A\u901A\u8FC7 | 2 \u7528\u6CD5\u6216\u914D\u7F6E\u9519\u8BEF`;
}
function readInput(file, positional) {
  if (file) return readFileSync2(resolvePath2(file), "utf-8");
  if (positional) return positional;
  if (!process.stdin.isTTY) {
    try {
      return readFileSync2(0, "utf-8");
    } catch {
      return void 0;
    }
  }
  return void 0;
}
function strFlag(flags, name) {
  const v = flags[name];
  return typeof v === "string" && v.length > 0 ? v : void 0;
}
function printJSON(obj) {
  console.log(JSON.stringify(obj, null, 2));
}
function fail(obj, code) {
  printJSON(obj);
  process.exit(code);
}
function cmdCheck(a) {
  const mode = strFlag(a.flags, "--mode") ?? "2d";
  if (mode !== "2d" && mode !== "3d") fail({ ok: false, error: `--mode \u5FC5\u987B\u662F 2d \u6216 3d\uFF0C\u6536\u5230: ${mode}` }, 2);
  let cmds = a.positionals;
  if (cmds.length === 0) {
    const stdin = readInput(void 0, void 0);
    if (stdin) cmds = stdin.split("\n").map((l) => l.trim()).filter(Boolean);
  }
  if (cmds.length === 0) fail({ ok: false, error: "check \u9700\u8981\u81F3\u5C11\u4E00\u6761\u547D\u4EE4\uFF08\u4F4D\u7F6E\u53C2\u6570\u6216 stdin\uFF09" }, 2);
  const definedNames = /* @__PURE__ */ new Set();
  for (const line of cmds) {
    const m = /^\s*([A-Za-z_]\w*)\s*(?:\([^)]*\))?\s*=(?!=)/.exec(line);
    if (m) definedNames.add(m[1]);
  }
  const results = cmds.map((input) => {
    const ev = evaluateRawCommand(input, mode, definedNames);
    return {
      input,
      corrected: ev.corrected,
      warnings: ev.warnings,
      ok: ev.ok,
      issues: ev.issues
    };
  });
  const ok = results.every((r) => r.ok);
  fail({ ok, mode, results }, ok ? 0 : 1);
}
function cmdValidate(a) {
  const mode = strFlag(a.flags, "--mode") ?? "2d";
  if (mode !== "2d" && mode !== "3d") fail({ ok: false, error: `--mode \u5FC5\u987B\u662F 2d \u6216 3d\uFF0C\u6536\u5230: ${mode}` }, 2);
  const text = readInput(strFlag(a.flags, "--file"), a.positionals[0]);
  if (!text?.trim()) fail({ ok: false, error: "validate \u9700\u8981\u534F\u8BAE JSON\uFF08--file\u3001\u4F4D\u7F6E\u53C2\u6570\u6216 stdin\uFF09" }, 2);
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    fail({ ok: false, error: `JSON \u89E3\u6790\u5931\u8D25: ${e.message}` }, 1);
  }
  const result = AIResponse.safeParse(parsed);
  if (!result.success) {
    fail({ ok: false, error: "schema \u6821\u9A8C\u5931\u8D25", detail: formatZodError(result.error) }, 1);
  }
  const g = guardResponse(result.data, mode);
  fail({
    ok: g.ok,
    mode,
    commands: g.commands,
    corrections: g.corrections,
    warnings: g.warnings,
    issues: g.issues,
    self_check: g.response.self_check,
    ask: g.response.ask
  }, g.ok ? 0 : 1);
}
function cmdKb(a) {
  const name = a.positionals[0];
  if (!name) fail({ ok: false, error: "kb \u9700\u8981\u547D\u4EE4\u540D\uFF0C\u5982: kb Slider" }, 2);
  const halluc = findHallucination(name);
  if (halluc) {
    fail({
      ok: false,
      hallucination: true,
      input: name,
      correctName: halluc.correctName,
      reason: halluc.reason
    }, 1);
  }
  const def = findCommand(name);
  if (!def) fail({ ok: false, error: `\u672A\u77E5\u547D\u4EE4: ${name}\uFF08\u4E0D\u5728\u77E5\u8BC6\u5E93\u4E5F\u4E0D\u5728\u81C6\u9020\u6620\u5C04\u4E2D\uFF09` }, 1);
  fail({ ok: true, ...def }, 0);
}
function cmdList(a) {
  const mode = strFlag(a.flags, "--mode") ?? "2d";
  if (mode !== "2d" && mode !== "3d") fail({ ok: false, error: `--mode \u5FC5\u987B\u662F 2d \u6216 3d` }, 2);
  const pattern = a.positionals[0]?.toLowerCase();
  let cmds = filterCommandsByMode(mode);
  if (pattern) {
    cmds = cmds.filter(
      (c) => c.name.toLowerCase().includes(pattern) || c.signature.toLowerCase().includes(pattern) || (c.aliases ?? []).some((al) => al.includes(pattern)) || c.category.includes(pattern)
    );
  }
  fail({
    ok: true,
    mode,
    count: cmds.length,
    commands: cmds.map((c) => ({
      name: c.name,
      signature: c.signature,
      category: c.category,
      paramCount: c.paramCount,
      note: c.note
    }))
  }, 0);
}
function cmdHallucinations(a) {
  const mode = strFlag(a.flags, "--mode") ?? "2d";
  if (mode !== "2d" && mode !== "3d") fail({ ok: false, error: `--mode \u5FC5\u987B\u662F 2d \u6216 3d` }, 2);
  if (a.flags["--json"]) {
    fail({ ok: true, count: HALLUCINATION_MAP.length, entries: HALLUCINATION_MAP }, 0);
  }
  process.stdout.write(buildHallucinationWarnings(mode) + "\n");
  process.exit(0);
}
function cmdReference(a) {
  const mode = strFlag(a.flags, "--mode") ?? "2d";
  const domain = strFlag(a.flags, "--domain") ?? "general";
  if (mode !== "2d" && mode !== "3d") fail({ ok: false, error: `--mode \u5FC5\u987B\u662F 2d \u6216 3d` }, 2);
  if (domain !== "general" && domain !== "physics") fail({ ok: false, error: `--domain \u5FC5\u987B\u662F general \u6216 physics` }, 2);
  const md = buildCommandReference(mode, domain) + "\n\n" + buildHallucinationWarnings(mode) + "\n";
  const out = strFlag(a.flags, "--out");
  if (out) {
    writeFileSync2(resolvePath2(out), md, "utf-8");
    process.stderr.write(`\u5DF2\u5199\u5165 ${resolvePath2(out)}
`);
    process.exit(0);
  }
  process.stdout.write(md);
  process.exit(0);
}
function cmdGenDocs(a) {
  const outdir = a.positionals[0];
  if (!outdir) fail({ ok: false, error: "gen-docs \u9700\u8981\u8F93\u51FA\u76EE\u5F55\uFF0C\u5982: gen-docs ../references" }, 2);
  const dir = resolvePath2(outdir);
  if (!existsSync2(dir)) mkdirSync2(dir, { recursive: true });
  const files = [["commands-2d.md", "2d"], ["commands-3d.md", "3d"]];
  for (const [fname, mode] of files) {
    const md = [
      `# GeoGebra \u547D\u4EE4\u53C2\u8003\uFF08${mode.toUpperCase()} \u6A21\u5F0F\uFF09`,
      "",
      `> \u7531 aiggb \u77E5\u8BC6\u5E93\u81EA\u52A8\u751F\u6210\uFF08\u5168\u5E93 ${GGB_COMMAND_DEFS.length} \u6761\u547D\u4EE4\u5B9A\u4E49\uFF0C\u672C\u6587\u4EF6\u6536\u5F55 ${filterCommandsByMode(mode).length} \u6761\uFF09\u3002`,
      "> \u547D\u4EE4\u7B7E\u540D/\u7528\u6CD5\u4E00\u5F8B\u4EE5\u672C\u6587\u4EF6\u4E3A\u51C6\uFF1B\u4E0D\u5728\u672C\u6587\u4EF6\u4E2D\u7684\u547D\u4EE4\u89C6\u4E3A\u81C6\u9020\uFF0C\u89C1\u6587\u672B\u81C6\u9020\u6620\u5C04\u3002",
      "",
      "## \u603B\u89C8\uFF08\u7CBE\u7B80\u63D0\u793A\u7248\uFF09",
      "",
      buildCommandReference(mode, "physics"),
      "",
      "## \u5206\u547D\u4EE4\u8BE6\u60C5",
      "",
      buildDetailedReference(mode),
      buildHallucinationWarnings(mode),
      ""
    ].join("\n");
    writeFileSync2(join2(dir, fname), md, "utf-8");
    process.stderr.write(`\u5DF2\u5199\u5165 ${join2(dir, fname)}
`);
  }
  process.exit(0);
}
var CATEGORY_LABELS = {
  point: "\u70B9 / \u5411\u91CF",
  line: "\u7EBF / \u7EBF\u6BB5",
  circle: "\u5706 / \u5706\u9525\u66F2\u7EBF",
  equation: "\u65B9\u7A0B / \u8868\u8FBE\u5F0F",
  polygon: "\u591A\u8FB9\u5F62",
  function: "\u51FD\u6570 / \u66F2\u7EBF",
  logic: "\u903B\u8F91 / \u5224\u5B9A",
  slider: "\u6ED1\u5757 / \u52A8\u753B",
  metric: "\u5EA6\u91CF",
  measure3d: "3D \u5EA6\u91CF",
  transform: "\u51E0\u4F55\u53D8\u6362",
  list: "\u5217\u8868 / \u5E8F\u5217",
  text: "\u6587\u672C / \u6807\u7B7E",
  style: "\u6837\u5F0F / \u5C5E\u6027",
  view: "\u89C6\u56FE\u63A7\u5236",
  solid3d: "3D \u51E0\u4F55\u4F53",
  curve3d: "3D \u66F2\u7EBF\u66F2\u9762",
  intersect3d: "3D \u6C42\u4EA4 / \u622A\u9762",
  view3d: "3D \u89C6\u56FE"
};
function buildDetailedReference(mode) {
  const cmds = filterCommandsByMode(mode);
  const byCategory = /* @__PURE__ */ new Map();
  for (const c of cmds) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category).push(c);
  }
  const parts = [];
  for (const [cat, list] of byCategory) {
    parts.push(`### ${CATEGORY_LABELS[cat] ?? cat}`);
    parts.push("");
    for (const c of list) {
      parts.push(`#### ${c.name}`);
      parts.push(`- \u7B7E\u540D: \`${c.signature}\` \uFF5C \u53C2\u6570\u4E2A\u6570: ${c.paramCount[0]}${c.paramCount[1] === -1 ? "+" : `~${c.paramCount[1]}`} \uFF5C \u9002\u7528: ${c.modes.join(", ")}`);
      if (c.overloads?.length) {
        parts.push("- \u91CD\u8F7D\u8BED\u4E49:");
        for (const o of c.overloads) parts.push(`  - (${o.args.join(", ")}): ${o.semantic}`);
      }
      if (c.examples?.length) {
        parts.push("- \u793A\u4F8B:");
        for (const e of c.examples) parts.push(`  - \`${e}\``);
      }
      if (c.note) parts.push(`- \u26A0 \u6CE8\u610F: ${c.note}`);
      if (c.aliases?.length) parts.push(`- \u522B\u540D: ${c.aliases.join("\u3001")}`);
      parts.push("");
    }
  }
  return parts.join("\n");
}
function flagsToRuntime(a) {
  const f = a.flags;
  const rt = {
    baseUrl: strFlag(f, "--base-url"),
    apiKey: strFlag(f, "--api-key"),
    model: strFlag(f, "--model"),
    lightModel: strFlag(f, "--light-model"),
    reasoningEffort: strFlag(f, "--reasoning"),
    maxOutputTokens: strFlag(f, "--max-tokens") ? Number(strFlag(f, "--max-tokens")) : void 0,
    temperature: strFlag(f, "--temperature") ? Number(strFlag(f, "--temperature")) : void 0
  };
  return rt;
}
function parseDomain(a) {
  const d = strFlag(a.flags, "--domain") ?? "general";
  if (d !== "general" && d !== "physics") {
    fail({ ok: false, error: `--domain \u5FC5\u987B\u662F general \u6216 physics\uFF0C\u6536\u5230: ${d}` }, 2);
  }
  return d;
}
function parseMode(a) {
  const m = strFlag(a.flags, "--mode") ?? "2d";
  if (m !== "2d" && m !== "3d") fail({ ok: false, error: `--mode \u5FC5\u987B\u662F 2d \u6216 3d\uFF0C\u6536\u5230: ${m}` }, 2);
  return m;
}
async function cmdRefine(a) {
  const text = readInput(void 0, a.positionals[0])?.trim();
  if (!text) fail({ ok: false, error: "refine \u9700\u8981\u9700\u6C42\u6587\u672C\uFF08\u4F4D\u7F6E\u53C2\u6570\u6216 stdin\uFF09" }, 2);
  const config = buildAIConfig(flagsToRuntime(a));
  const domain = parseDomain(a);
  const result = await refineSpec(config, text, domain);
  const out = strFlag(a.flags, "--out");
  if (out) {
    writeFileSync2(resolvePath2(out), JSON.stringify(result, null, 2), "utf-8");
    process.stderr.write(`[aiggb] \u89C4\u683C\u5DF2\u5199\u5165 ${resolvePath2(out)}
`);
  }
  fail({ ok: Boolean(result.spec), domain, ...result }, result.spec ? 0 : 1);
}
async function cmdCompile(a) {
  const specText = readInput(strFlag(a.flags, "--spec"), a.positionals[0])?.trim();
  if (!specText) fail({ ok: false, error: "compile \u9700\u8981 --spec <file>\uFF08\u6216\u4F4D\u7F6E\u53C2\u6570/stdin \u4F20\u5165\u89C4\u683C\u6587\u672C\uFF09" }, 2);
  const config = buildAIConfig(flagsToRuntime(a));
  const opts = {
    domain: parseDomain(a),
    mode: parseMode(a),
    repair: !a.flags["--no-repair"]
  };
  const result = await compileSpec(config, specText, opts);
  const { response: _raw, ...rest } = result;
  fail({ ok: rest.ok, spec: specText.slice(0, 200), ...rest }, rest.ok ? 0 : 1);
}
async function cmdRun(a) {
  const text = readInput(void 0, a.positionals[0])?.trim();
  if (!text) fail({ ok: false, error: "run \u9700\u8981\u9700\u6C42\u6587\u672C\uFF08\u4F4D\u7F6E\u53C2\u6570\u6216 stdin\uFF09" }, 2);
  const config = buildAIConfig(flagsToRuntime(a));
  const opts = {
    domain: parseDomain(a),
    mode: parseMode(a),
    repair: !a.flags["--no-repair"]
  };
  const result = await runOnce(config, text, opts);
  if (result.asked) {
    fail({ ok: false, asked: true, refine: result.refine }, 1);
  }
  const compile = result.compile;
  const { response: _raw, ...rest } = compile;
  fail({ ok: rest.ok, refine: result.refine, ...rest }, rest.ok ? 0 : 1);
}
function renderFlagsFrom(a) {
  return {
    out: strFlag(a.flags, "--out") ?? "aiggb-figure.png",
    engineDir: strFlag(a.flags, "--engine"),
    width: strFlag(a.flags, "--width") ? Number(strFlag(a.flags, "--width")) : void 0,
    height: strFlag(a.flags, "--height") ? Number(strFlag(a.flags, "--height")) : void 0,
    staticMode: !a.flags["--animate"],
    download: Boolean(a.flags["--download"]),
    timeoutMs: strFlag(a.flags, "--timeout") ? Number(strFlag(a.flags, "--timeout")) : void 0,
    gif: a.flags["--gif"] || /\.gif$/i.test(strFlag(a.flags, "--out") ?? "") ? {
      frames: strFlag(a.flags, "--frames") ? Number(strFlag(a.flags, "--frames")) : void 0,
      fps: strFlag(a.flags, "--fps") ? Number(strFlag(a.flags, "--fps")) : void 0,
      animTarget: strFlag(a.flags, "--anim"),
      scale: strFlag(a.flags, "--gif-scale") ? Number(strFlag(a.flags, "--gif-scale")) : void 0
    } : void 0,
    ggb: Boolean(a.flags["--ggb"]) || /\.ggb$/i.test(strFlag(a.flags, "--out") ?? "")
  };
}
async function cmdRender(a) {
  const text = readInput(strFlag(a.flags, "--file"), a.positionals[0])?.trim();
  if (!text) fail({ ok: false, error: "render \u9700\u8981 --file <14-op JSON>\uFF08\u6216\u4F4D\u7F6E\u53C2\u6570/stdin\uFF09" }, 2);
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    fail({ ok: false, error: `JSON \u89E3\u6790\u5931\u8D25: ${e.message}` }, 1);
  }
  const arr = Array.isArray(parsed) ? parsed : parsed?.commands;
  if (!Array.isArray(arr) || arr.length === 0) {
    fail({ ok: false, error: "\u8F93\u5165\u9700\u4E3A 14-op \u547D\u4EE4\u6570\u7EC4\u6216 {commands:[...]}" }, 1);
  }
  const rf = renderFlagsFrom(a);
  const r = await renderCommands({
    commands: arr,
    out: rf.out,
    engineDir: rf.engineDir,
    appMode: parseMode(a),
    width: rf.width,
    height: rf.height,
    staticMode: rf.staticMode,
    download: rf.download,
    timeoutMs: rf.timeoutMs,
    gif: rf.gif,
    ggb: rf.ggb
  });
  fail({ ...r }, r.ok ? 0 : 1);
}
async function cmdDraw(a) {
  const text = readInput(void 0, a.positionals[0])?.trim();
  if (!text) fail({ ok: false, error: "draw \u9700\u8981\u81EA\u7136\u8BED\u8A00\u9700\u6C42\uFF08\u4F4D\u7F6E\u53C2\u6570\u6216 stdin\uFF09" }, 2);
  const config = buildAIConfig(flagsToRuntime(a));
  const domain = parseDomain(a);
  const mode = parseMode(a);
  const rf = renderFlagsFrom(a);
  const refine = await refineSpec(config, text, domain);
  if (refine.ask || !refine.spec) {
    fail({ ok: false, asked: Boolean(refine.ask), refine }, 1);
  }
  const compile = await compileSpec(config, refine.spec, { domain, mode, repair: !a.flags["--no-repair"] });
  if (strFlag(a.flags, "--save-cmds")) {
    writeFileSync2(resolvePath2(strFlag(a.flags, "--save-cmds")), JSON.stringify({ commands: compile.commands }, null, 2), "utf-8");
  }
  const render = await renderCommands({
    commands: compile.commands,
    out: rf.out,
    engineDir: rf.engineDir,
    appMode: mode === "3d" ? "3d" : "2d",
    width: rf.width,
    height: rf.height,
    staticMode: rf.staticMode,
    download: rf.download,
    timeoutMs: rf.timeoutMs,
    gif: rf.gif,
    ggb: rf.ggb
  });
  const { response: _raw, ...compileRest } = compile;
  const ok = compileRest.ok && render.ok;
  fail({ ok, refine, compile: compileRest, render }, ok ? 0 : 1);
}
async function main() {
  const argv = process.argv.slice(2);
  const a = parseArgs(argv);
  if (!a.command || a.command === "--help" || a.command === "-h" || a.flags["--help"]) {
    const explicit = Boolean(a.command || a.flags["--help"]);
    process.stderr.write(usage() + "\n");
    process.exit(explicit ? 0 : 2);
  }
  switch (a.command) {
    case "check":
      return cmdCheck(a);
    case "validate":
      return cmdValidate(a);
    case "kb":
      return cmdKb(a);
    case "list":
      return cmdList(a);
    case "hallucinations":
      return cmdHallucinations(a);
    case "reference":
      return cmdReference(a);
    case "gen-docs":
      return cmdGenDocs(a);
    case "refine":
      return await cmdRefine(a);
    case "compile":
      return await cmdCompile(a);
    case "run":
      return await cmdRun(a);
    case "render":
      return await cmdRender(a);
    case "draw":
      return await cmdDraw(a);
    default:
      process.stderr.write(`\u672A\u77E5\u547D\u4EE4: ${a.command}

` + usage() + "\n");
      process.exit(2);
  }
}
main().catch((err) => {
  if (err instanceof MissingKeyError) {
    process.stderr.write(`[aiggb] ${err.message}
`);
    process.exit(2);
  }
  process.stderr.write(`[aiggb] ${err instanceof Error ? err.message : String(err)}
`);
  process.exit(2);
});
