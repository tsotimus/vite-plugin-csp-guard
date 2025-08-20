import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import csp from "vite-plugin-csp-guard";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react() as PluginOption,
    csp({
      dev: {
        run: true,
        outlierSupport: ["tailwind"],
      },
      build: {
        sri: true,
      },
    }) as PluginOption,
  ],
  preview: {
    port: 4003,
  },
  server: {
    port: 3003,
  },
});
