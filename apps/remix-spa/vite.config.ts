import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, PluginOption } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import csp from "vite-plugin-csp-guard";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
      ssr: false,
    }),
    tsconfigPaths() as PluginOption,
    csp({
      dev: {
        run: true,
      },
      features: {
        mpa: true,
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
