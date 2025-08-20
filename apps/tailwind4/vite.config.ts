import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import csp from "vite-plugin-csp-guard";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react() as PluginOption,
    tailwindcss() as PluginOption,
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
    port: 4014,
  },
  server: {
    port: 3014,
  },
});
