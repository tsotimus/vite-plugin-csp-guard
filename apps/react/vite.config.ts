import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { definePolicy, none } from "csp-toolkit";
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
        fontSrc: ["https://fonts.gstatic.com"],
        connectSrc: ["*"],
        objectSrc: [none],
      }),
      build: {
        sri: {
          // Enable runtime that patches DOM methods to add integrity to dynamically created elements
          runtimePatchDynamicLinks: true,
          // Add modulepreload links with integrity for your lazy-loaded components
          preloadDynamicChunks: true,
          // Skip resources matching these patterns (example - you can customize)
          skipResources: [],
          // CORS setting for integrity attributes
          crossorigin: "anonymous",
        },
      },
      debug: true,
    }) as PluginOption,
  ],
  preview: {
    port: 4000,
  },
  server: {
    port: 3000,
  },
});
