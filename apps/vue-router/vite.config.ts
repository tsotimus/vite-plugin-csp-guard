import { defineConfig, PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import { definePolicy, self, data } from "csp-toolkit";
import csp from "vite-plugin-csp-guard";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    csp({
      policy: definePolicy({
        imgSrc: [self, data],
      }),
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
