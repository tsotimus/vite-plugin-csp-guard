import { defineConfig, PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import csp from "vite-plugin-csp-guard";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    csp({
      build: {
        sri: true,
      },
    }) as PluginOption,
  ],
});
