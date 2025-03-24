import { defineConfig, PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import csp from "vite-plugin-csp-guard";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    csp({
      policy: {
        "img-src": ["'self'", "data:"],
      },
      build: {
        sri: true,
        outlierSupport: ["vue-router"],
      },
      debug: true,
    }) as PluginOption,
  ],
  preview: {
    port: 4020,
  },
  server: {
    port: 3020,
  },
});
