import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        "/api": "http://localhost:8787",
      },
    },
    plugins: [react()],
    base: "/",
    build: {
      outDir: path.resolve(__dirname, "../dist"),
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
