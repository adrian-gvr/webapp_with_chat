import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiTarget = `http://127.0.0.1:${process.env.API_PORT || 5001}`;

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  server: {
    host: true,
    port: 5175,
    proxy: {
      "/api": apiTarget,
      "/uploads": apiTarget,
      "/socket.io": { target: apiTarget, ws: true },
    },
  },
  preview: {
    host: true,
    port: 10000,
    allowedHosts: ["webapp-with-chat-1.onrender.com"],
  },
});
