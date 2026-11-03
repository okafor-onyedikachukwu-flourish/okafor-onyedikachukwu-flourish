import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // In development the React app runs on Vite and the API on Express.
    proxy: { "/api": { target: "http://localhost:8787", changeOrigin: true } }
  },
  build: { target: "es2020", sourcemap: false }
});
