import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
    watch: {
      ignored: [
        path.join(rootDir, "*.jpg"),
        path.join(rootDir, "*.jpeg"),
        path.join(rootDir, "*.png"),
        path.join(rootDir, "*.webp"),
        path.join(rootDir, "*.gif"),
        "**/Gemini_*.jpg",
        "**/WhatsApp*.*",
      ],
    },
  },
});
