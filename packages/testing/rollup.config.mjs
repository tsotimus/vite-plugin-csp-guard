import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts', // Assuming your main entry is index.ts
  output: [
    {
      file: 'dist/index.js',
      format: 'esm', // Can be 'cjs' or 'esm' depending on your requirements
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve(),
    typescript(
      {
        tsconfig: "tsconfig.json",
        declaration: true,
        declarationDir: "dist",
        include: ["src/**/*.ts"],
        sourceMap: true,
      }
    ),
  ],
  external: [
    'react',
    'vite',
    "@playwright/test",
  ],
};