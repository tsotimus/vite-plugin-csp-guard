import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import csp from "vite-plugin-hash-csp";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    csp({
      runOnDev: true,
    }),
  ],
  preview: {
    port: 4004,
  },
  server: {
    port: 3004,
  },
});
