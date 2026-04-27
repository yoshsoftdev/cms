import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const backendUrl = process.env.VITE_CMS_BACKEND_URL || "http://localhost:8080";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api/cms": {
        target: backendUrl,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/cms/, ""),
      },
    },
  },
});
