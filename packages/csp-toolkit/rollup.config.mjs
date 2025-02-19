import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import terser from "@rollup/plugin-terser";

export default defineConfig([
  {
    input: "src/index.ts", // Default entry point
    output: [
      {
        file: "dist/index.esm.js",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "dist/index.cjs.js",
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        tsconfig: "tsconfig.json",
        declaration: true,
        declarationDir: "dist/types", // Output declarations for default entry point here
        include: ["src/index.ts", "src/types.ts"],
        sourceMap: true,
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
  {
    input: "src/node.ts", // Secondary entry point for server
    output: [
      {
        file: "dist/node/node.esm.js",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "dist/node/node.cjs.js",
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        tsconfig: "tsconfig.json",
        declaration: true,
        declarationDir: "dist/node/types", // Separate declarations for server
        include: ["src/node.ts", "src/types.ts"], // Include node-specific types
        sourceMap: true,
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
]);