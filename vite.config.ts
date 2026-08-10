import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./", // 相对路径：兼容 GitHub Pages 子路径部署（https://gmsjy.github.io/aiggb/）
  plugins: [
    react(),
    // GeoGebra GWT 资源路径修正：web3d.nocache.js 可能从根路径加载
    // *.cache.js / deferredjs / clear.cache.gif，重写到 public/GeoGebra/HTML5/5.0/web3d/
    {
      name: "geogebra-gwt-assets",
      configureServer(server) {
        // Chrome 127+ 禁止 unload handler，GeoGebra 内部用到，加 header 允许
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Permissions-Policy", "unload=*");
          next();
        });
        const GGB_WEB3D = "/GeoGebra/HTML5/5.0/web3d";
        const GGB_5_0 = "/GeoGebra/HTML5/5.0"; // CSS 在 5.0/css/ 与 web3d 同级共享
        // GeoGebra web3d 子目录：GWT 编译后从 moduleBase 加载的资源树
        const GGB_SUBDIRS = ["js", "fonts", "html", "img", "deferredjs"];
        server.middlewares.use((_req, _res, next) => {
          const req = _req as unknown as { url?: string };
          const u = req.url;
          if (!u) return next();
          // *.cache.js / clear.cache.gif：GWT 编译产物
          if (/^\/[A-Z0-9]{32}\.cache\.js$/.test(u) || u === "/clear.cache.gif") {
            req.url = GGB_WEB3D + u;
          }
          // deferredjs/<hash>/<n>.cache.js：GWT 代码分片
          else if (/^\/deferredjs\/[A-Z0-9]{32}\/\d+\.cache\.js$/.test(u)) {
            req.url = GGB_WEB3D + u;
          }
          // GWT leftover fragments: web3d-0.js, web3d-1.js, ...
          else if (/^\/web3d-\d+\.js$/.test(u)) {
            req.url = GGB_WEB3D + u;
          }
          // sworker-locked.js: GeoGebra service worker（3D 模块可能注册）
          else if (u === "/sworker-locked.js") {
            req.url = GGB_WEB3D + u;
          }
          // css/：共享样式在 5.0/css/（与 web3d 同级，不在 web3d 内）
          else if (u.startsWith("/css/")) {
            req.url = GGB_5_0 + u;
          }
          // js/ fonts/ html/ img/：GeoGebra web3d 目录内资源
          else if (GGB_SUBDIRS.some(d => u!.startsWith("/" + d + "/"))) {
            req.url = GGB_WEB3D + u;
          }
          next();
        });
      },
    },
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
