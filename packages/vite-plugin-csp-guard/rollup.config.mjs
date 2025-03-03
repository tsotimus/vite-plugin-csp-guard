import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import terser from "@rollup/plugin-terser";

export default defineConfig(
  [
    {
      input: "src/index.ts", // Main plugin entry point
      output: [
        {
          file: "dist/index.esm.js",
          format: "esm",
          sourcemap: true, // Enable sourcemaps for debugging
        },
        {
          file: "dist/index.cjs.js",
          format: "cjs",
          sourcemap: true,
        },
      ],
      external: ["lightningcss", "fsevents", "vite", "cheerio", "csp-toolkit"],
      plugins: [
        typescript({
          tsconfig: "tsconfig.json",
          declaration: true,
          declarationDir: "dist",
          include: ["src/**/*.ts"],
          exclude: ["src/server/**/*.ts"],
          sourceMap: true,
        }),
        resolve(),
        commonjs(),
        terser(),
      ],
    },
    {
      input: "src/server/index.ts", // Use the server-specific entry point
      output: [
        {
          file: "dist/server/index.esm.js",
          format: "esm",
          sourcemap: true,
        },
        {
          file: "dist/server/index.cjs.js",
          format: "cjs",
          sourcemap: true,
        },
      ],
      external: ["lightningcss", "fsevents", "vite", "csp-toolkit", "csp-toolkit/server"],
      plugins: [
        typescript({
          tsconfig: "tsconfig.json",
          declaration: true,
          declarationDir: "dist/server/types",
          outDir: "dist/server",
          include: ["src/server/**/*.ts"],
          sourceMap: true,
        }),
        resolve(),
        commonjs(),
        terser(),
      ],
    },
  ]
);
