# Vite Plugin CSP Guard

<!-- BEGIN BADGES -->

[![npm version](https://img.shields.io/npm/v/vite-plugin-csp-guard)](https://www.npmjs.com/package/vite-plugin-csp-guard)
[![npm downloads](https://img.shields.io/npm/dt/vite-plugin-csp-guard)](https://www.npmjs.com/package/vite-plugin-csp-guard)
[![npm weekly downloads](https://img.shields.io/npm/dw/vite-plugin-csp-guard)](https://www.npmjs.com/package/vite-plugin-csp-guard)
[![License](https://img.shields.io/npm/l/vite-plugin-csp-guard)](https://github.com/tsotimus/vite-plugin-csp-guard/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/tsotimus/vite-plugin-csp-guard?style=social)](https://github.com/tsotimus/vite-plugin-csp-guard)

<!-- END BADGES -->

This is a monorepo for the Vite Plugin CSP Guard.

## What's inside?

All the apps under `/apps` are used to test the plugin.

All the packages under `/packages` include the packages im building, as well as some utilities.

- [Vite Plugin CSP Guard](https://npmjs.com/package/vite-plugin-csp-guard)

## Documentation you might be looking for

Vite Plugin CSP Guard - [Available here](https://vite-csp.tsotne.co.uk)

## Getting Started

`corepack enable`
`pnpm install`

## Adding New Vite Applications

To create a new Vite application in the monorepo, use the custom Turborepo generator:

```bash
npx turbo gen vite-app
```

This generator will:

1. Create a new Vite application using your selected framework in the `apps` directory
2. Connect it to the monorepo's shared TypeScript and ESLint configurations
3. Add convenient scripts to the root package.json

See [the generator documentation](./turbo/generators/README.md) for more details.

### Contributing -- Coming Soon
