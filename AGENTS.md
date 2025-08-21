# Description

This is a monorepo for the vite-plugin-csp-guard package.

Everything inside apps folder is a vite app that is used for testing purposes for the vite-plugin-csp-guard package.

We use pnpm.

Use `pnpm p:build` to build the vite-plugin-csp-guard package.

Use `pnpm build` to build everything inside apps folder apart from our docs app.

Look inside the root package.json for specific script commands for specific apps. E.g. `pnpm mui:build` will build the vite app that tests the mui integration of the vite-plugin-csp-guard package.
