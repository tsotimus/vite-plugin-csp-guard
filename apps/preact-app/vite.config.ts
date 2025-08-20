import { defineConfig, PluginOption } from "vite";
import preact from "@preact/preset-vite";
import csp from "vite-plugin-csp-guard";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact() as PluginOption,
    csp({
      dev: {
        run: true,
      },
      build: {
        sri: true,
      },
    }) as PluginOption,
  ],
  preview: {
    port: 4009,
  },
  server: {
    port: 3009,
  },
});
