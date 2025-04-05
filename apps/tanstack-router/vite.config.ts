import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import csp from "vite-plugin-csp-guard";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
      generatedRouteTree: "./src/routeTree.gen.ts",
      routesDirectory: "./src/routes",
    }),
    react(),
    csp({
      dev: {
        run: true,
      },
      build: {
        sri: true,
      },
    }) as PluginOption,
  ],
  server: {
    port: 3022,
  },
  preview: {
    port: 4022,
  },
});
