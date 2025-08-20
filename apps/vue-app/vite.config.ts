import { defineConfig, PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import csp from "vite-plugin-csp-guard";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue() as PluginOption,
    csp({
      dev: { run: true, outlierSupport: ["vue"] },
      build: { sri: true },
    }) as PluginOption,
  ],
  preview: {
    port: 4007,
  },
  server: {
    port: 3007,
  },
});
