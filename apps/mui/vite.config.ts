import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import csp from "vite-plugin-csp-guard";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react() as PluginOption,
    csp({
      algorithm: "sha256",
      dev: {
        run: true,
      },
      policy: {
        "style-src-elem": [
          "'self'",
          "https://fonts.googleapis.com",
          "'unsafe-inline'",
        ],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
      },
      build: {
        sri: true,
      },
    }) as PluginOption,
  ],
  preview: {
    port: 4001,
  },
  server: {
    port: 3001,
  },
});
