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
        "connect-src": ["*"],
        "object-src": ["'none'"],
      },
      build: {
        sri: {
          runtimePatchDynamicLinks: true,
          preloadDynamicChunks: true,
          skipResources: [],
          crossorigin: "anonymous",
        },
      },
      debug: true,
    }) as PluginOption,
  ],
  preview: {
    port: 4011,
  },
  server: {
    port: 3011,
  },
});
