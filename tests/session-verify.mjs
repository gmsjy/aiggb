import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:5173", { waitUntil: "networkidle", timeout: 40000 });
await page.waitForSelector("#ggb-container canvas", { timeout: 40000 });
await page.waitForTimeout(2500);

// ① 首次加载：默认会话创建（且 StrictMode 防重 → 只 1 个）
const idx1 = await page.evaluate(async () => {
  const idb = await new Promise(res => {
    const req = indexedDB.open("aiggb", 3);
    req.onsuccess = () => {
      const tx = req.result.transaction("sessions", "readonly");
      const g = tx.objectStore("sessions").getAll();
      g.onsuccess = () => res(g.result.length);
    };
  });
  const ls = JSON.parse(localStorage.getItem("aiggb_sessions") || "{}");
  return { count: idb, hasCurrent: !!ls.currentId };
});
console.log("① 默认会话数(应=1):", idx1.count, "| currentId:", idx1.hasCurrent);

// ② 注入历史会话 + 更新索引
await page.evaluate(() => new Promise(resolve => {
  const req = indexedDB.open("aiggb", 3);
  req.onsuccess = () => {
    const tx = req.result.transaction("sessions", "readwrite");
    tx.objectStore("sessions").put({
      id: "s-verify-test", title: "单位圆验证会话", createdAt: Date.now(), updatedAt: Date.now(),
      domain: "general", agentMode: false, ggbAppName: "classic",
      messages: [
        { id: "u1", role: "user", content: "画一个单位圆，点 P 在圆上旋转" },
        { id: "a1", role: "assistant", payload: { explanation: "已绘制", commands: [{ op: "eval", cmd: "O = (0,0)" }], results: [] } },
      ],
      constructionLog: ["O = (0,0)"],
      canvasSnapshot: null,
    });
    tx.oncomplete = () => { req.result.close(); resolve(); };
  };
}));
await page.evaluate(() => {
  localStorage.setItem("aiggb_sessions", JSON.stringify({ currentId: "s-verify-test", index: [] }));
});

// ③ 刷新 → 消息恢复
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const bubbles = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".bubble-user, .bubble-assistant")).map(b => b.textContent.trim().slice(0, 30)));
console.log("③ 刷新后气泡:", JSON.stringify(bubbles));

// ④ 会话弹层：打开 → 列表包含注入会话 → 新建
await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll(".toolbar-actions button")).find(b => b.title.startsWith("会话"));
  btn?.click();
});
await page.waitForSelector(".session-list", { timeout: 5000 });
const items = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".session-item .session-title")).map(e => e.textContent));
console.log("④ 会话列表:", JSON.stringify(items));
await page.click("button.session-new");
await page.waitForTimeout(800);
const newTitle = await page.evaluate(() => {
  const ls = JSON.parse(localStorage.getItem("aiggb_sessions") || "{}");
  return ls.currentId;
});
console.log("⑤ 新建会话后 currentId 已更新:", newTitle !== "s-verify-test" ? "✅" : "❌");

const pass = idx1.count === 1 && idx1.hasCurrent && bubbles.some(t => t.includes("单位圆")) && items.some(t => t.includes("单位圆验证会话")) && newTitle !== "s-verify-test";
console.log(pass ? "PASS ✅ 会话功能端到端正常" : "FAIL ❌");
await browser.close();
process.exit(pass ? 0 : 1);
