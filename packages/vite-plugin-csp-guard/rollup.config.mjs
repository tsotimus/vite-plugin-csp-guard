import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import terser from "@rollup/plugin-terser";

export default defineConfig([
  {
    input: "src/index.ts", // Main plugin entry point
    output: [
      {
        file: "dist/index.esm.js",
        format: "esm",
        sourcemap: true, // Enable sourcemaps for debugging
      },
    ],
    external: ["lightningcss", "fsevents", "vite", "cheerio", "csp-toolkit"],
    plugins: [
      typescript({
        tsconfig: "tsconfig.json",
        declaration: true,
        declarationDir: "dist",
        include: ["src/**/*.ts"],
        sourceMap: true,
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
]);
