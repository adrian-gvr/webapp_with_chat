import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5175,
    proxy: {
      "/api": "http://localhost:5001",
      "/uploads": "http://localhost:5001",
    },
  },
  preview: {
    host: true,
    port: 10000,
    allowedHosts: ["webapp-with-chat-1.onrender.com"],
  },
});
