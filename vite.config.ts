import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    // Allow overriding port via PORT env var (useful when 8080 is in use)
    port: Number(process.env.PORT) || 8080,
    // Allow serving files from project root (index.html) as well as client/shared
    fs: {
      allow: ["./", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react(),
    expressPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icon.svg"],
      manifest: {
        name: "AgriVerse - Smart Farming",
        short_name: "AgriVerse",
        description: "AI-powered sustainable farming assistant",
        theme_color: "#16a34a",
        icons: [
          {
            src: "icon.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      const { createServer } = await import("./server");
      const app = createServer();
      server.middlewares.use(app);
    },
  };
}
