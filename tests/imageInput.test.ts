/**
 * imageInput L1 单测（0 API、纯离线）
 *   npm run test:unit
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { validateImageFile, MAX_FILE_MB } from "../src/lib/imageInput";

function mockFile(type: string, sizeBytes: number): File {
  return { type, size: sizeBytes } as File;
}

test("合法图片 → null", () => {
  const result = validateImageFile(mockFile("image/png", 1024));
  assert.equal(result, null);
});

test("JPEG → null", () => {
  const result = validateImageFile(mockFile("image/jpeg", 5 * 1024 * 1024));
  assert.equal(result, null);
});

test("非图片类型 → 错误", () => {
  const result = validateImageFile(mockFile("application/pdf", 1024));
  assert.ok(result);
  assert.ok(result.includes("不支持的文件类型"));
});

test("空类型 → 错误", () => {
  const result = validateImageFile(mockFile("", 1024));
  assert.ok(result);
  assert.ok(result.includes("不支持的文件类型"));
});

test("恰好 10MB → 通过", () => {
  const result = validateImageFile(mockFile("image/png", MAX_FILE_MB * 1024 * 1024));
  assert.equal(result, null);
});

test("超过 10MB → 错误", () => {
  const result = validateImageFile(mockFile("image/png", MAX_FILE_MB * 1024 * 1024 + 1));
  assert.ok(result);
  assert.ok(result.includes("超过"));
});
