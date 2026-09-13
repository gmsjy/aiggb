# AiGGB 用户视角全量测试报告 —— deepseek-flash 统一模型轮

- **测试时间**：2026-09-13（用户模拟黑盒测试：Playwright + 真实 GeoGebra applet + 真实 AI 调用）
- **模型**：**`deepseek-flash`（V4.1）**——本轮起 `.env` 统一指定（替代即将淘汰的 v4-flash）
- **环境**：Vite dev server · Chrome headless 1440×900 · 本地自托管 GeoGebra 5.4.927 bundle
- **驱动脚本**：`tests/user-e2e.ts`（可复跑）；场景 A 首屏 / B 模板斜抛 / C 多轮修改 / D 自然语言单摆 / E 清空 / F 切 3D

## 一、结果总览：5/6 通过（较 v4-flash 轮 +1），0 页面异常、0 控制台错误

| # | 场景 | deepseek-flash（本轮） | v4-flash（昨日对照） | 耗时 | 截图 |
|---|---|---|---|---|---|
| A | 首屏加载 | ✅ | ✅ | 1.4s | [01-A-home.png](01-A-home.png) |
| B | 模板→规格确认→绘制（斜抛） | ✅ **一次成型** | ❌（3 次运行全伴随 3~4 错误气泡） | **20s** | [02-B1](02-B1-template-gallery.png) / [03-B2](03-B2-spec-review.png) / [04-B3](04-B3-drawn.png) |
| C | 多轮修改（红色虚线） | ✅ | ✅ | 6.8s | [05-C-modified.png](05-C-modified.png) |
| D | 自然语言画单摆 | ❌¹ | ❌ | 177s | [06-D2](06-D2-spec-review.png) / [07-D-pendulum.png](07-D-pendulum.png) |
| E | 清空画布 | ✅（气泡 9→0） | ✅ | 2.0s | [08-E-cleared.png](08-E-cleared.png) |
| F | 切 3D | ✅ | ✅ | 5.2s | [09-F-3d.png](09-F-3d.png) |

## 二、关键对比：deepseek-flash vs v4-flash

| 维度 | deepseek-flash（本轮） | v4-flash（昨日 2~4 轮运行） |
|---|---|---|
| B 斜抛一次成型 | ✅ **14 行命令全部成功、0 失败、0 气泡** | ❌ 3/3 次需 3~4 轮修复，12~14 成功 / 4~14 失败 |
| B 端到端耗时 | **20s** | 41~96s |
| D 单摆脚本失败行 | 8 行（23 成功） | 16 行（34 成功）/ 1 行（清空后） |
| 典型错误 | 多条命令 `op` 字段非法（schema 格式重试可自愈） | Min/Max 双参、IF 大写、中文函数名、Point+Point、SafeCmd 误杀 |

**结论**：统一 deepseek-flash 后，斜抛这类标准场景从「必经多轮修复」提升为「**一次成型**」，端到端耗时缩短约 60%~80%；此前修复的 Min/Max、命令大小写等知识层补强也可能贡献了改善。D（单摆）是高复杂度场景（张力/速度/参考弧/周期 20+ 行构造），flash 档模型输出 schema 仍不稳定，但全部被格式重试 + 修复回路正确接住，**最终画布核心对象齐全**（摆线/摆球/速度矢量/张力矢量/摆动弧/周期文本）。

## 三、D 场景残余失败定性（非应用 bug）

4 个 error 气泡均为同一模式：AI 单轮输出中多条命令的 `op` 字段使用了非法值（`Invalid discriminator value` ×4），触发格式重试与「自动重建」；重试后至少一轮成功完成绘制。schema 校验、格式重试、修复回路均按设计工作。可选缓解：`npm run prompt:iterate` 对复杂多对象场景做 few-shot 强化，或该场景引导用户使用 v4-pro 档。

## 四、回归基线

- `tsc --noEmit` 无错；eslint 0 error；单测 **225/225**；离线回放 **63/63**。
- 本轮无代码改动（纯模型切换测试）；上一轮修复记录（SafeCmd 左边界、Min/Max 知识层、E2E 前置清空）见 git 工作区。

## 五、可复现

```bash
npm run dev          # 终端 1（等 5173 就绪）
npx tsx tests/user-e2e.ts   # 终端 2
# 产物：tests/user-e2e/*.png + results.json
```
