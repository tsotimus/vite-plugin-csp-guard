import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type PluginOption } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import csp from "vite-plugin-csp-guard";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), csp({
    dev: {
      run: true,
    },
    features: {
      mpa: true,
    },
  }) as PluginOption],
});
