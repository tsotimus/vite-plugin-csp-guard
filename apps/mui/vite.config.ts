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
        styleSrcElem: [self, "https://fonts.googleapis.com", unsafeInline],
        fontSrc: [self, "https://fonts.gstatic.com"],
      }),
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
