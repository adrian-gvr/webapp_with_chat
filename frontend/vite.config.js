import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  server: {
    host: true,
    port: 5175,
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
  preview: {
    host: true,
    port: 10000,
    allowedHosts: ["webapp-with-chat-1.onrender.com"],
  },
});
