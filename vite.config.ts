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
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www\.geogebra\.org\/apps\//,
            handler: "CacheFirst",
            options: {
              cacheName: "ggb-sdk",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/cdn\.geogebra\.org\//,
            handler: "CacheFirst",
            options: {
              cacheName: "ggb-cdn",
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
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
