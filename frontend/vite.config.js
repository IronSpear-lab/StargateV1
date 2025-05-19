import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    cors: {
      origin: "*",
    },
    hmr: {
      clientPort: 443,
    },
    proxy: {
      "/api": {
        target: "http://0.0.0.0:8001",
        changeOrigin: true,
      },
    },
    allowedHosts: ["3eabe322-11fd-420e-9b72-6dc9b22d9093-00-2gpr7cql4w25w.kirk.replit.dev", "code-download-app-tunnel-cu9vdyo7.devinapps.com", "code-download-app-tunnel-30272owc.devinapps.com", "code-download-app-tunnel-xq4liwg0.devinapps.com", "code-download-app-tunnel-l3g2n03p.devinapps.com", "code-download-app-tunnel-7j4p227l.devinapps.com"]
  },
});
