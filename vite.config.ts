import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./", // 相对路径：兼容 GitHub Pages 子路径部署（https://gmsjy.github.io/aiggb/）
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: "auto",
      manifest: {
        name: "AiGGB · AI 驱动的 GeoGebra 动图生成器",
        short_name: "AiGGB",
        description: "用自然语言生成可交互的数学与物理动态图像",
        theme_color: "#1e88e5",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "any",
        lang: "zh-CN",
        start_url: "./",
        scope: "./",
        icons: [
          { src: "favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          // 若生产环境需要安装到桌面，请按 README 指引补充以下 PNG（替换或新增）：
          // { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          // { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          // { src: "icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        // GGB 引擎（~116MB）不进 SW 预缓存（会导致 SW 巨大），走 runtimeCaching CacheFirst
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}"],
        globIgnores: ["**/GeoGebra/**"],
        navigateFallback: "index.html",
        runtimeCaching: [
          // 本地 GeoGebra 库：首次访问后缓存，离线可用
          {
            urlPattern: ({ url }) => /\/GeoGebra\//.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "ggb-local",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // AI provider 请求不缓存（涉及密钥与即时性）
          {
            urlPattern: ({ url }) => /\/v1\/chat\/completions$/.test(url.pathname),
            handler: "NetworkOnly"
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  server: { port: 5173, open: true },
  build: {
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes("node_modules")) {
            if (/[\\/]react(-dom)?[\\/]/.test(id) || /[\\/]zustand[\\/]/.test(id)) return "vendor";
            if (/react-markdown|remark-|rehype-|katex/.test(id)) return "markdown";
          }
          return undefined;
        }
      }
    }
  }
});
