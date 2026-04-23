import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { definePolicy, self, unsafeInline } from "csp-toolkit";
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
      policy: definePolicy({
        styleSrcElem: [self, unsafeInline],
      }),
      build: {
        sri: true,
      },
    }) as PluginOption,
  ],
  preview: {
    port: 4002,
  },
  server: {
    port: 3002,
  },
});
