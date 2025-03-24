# Turborepo Vite App Generator

This generator creates a new Vite application in your Turborepo monorepo's `apps` directory. It leverages `create-vite` under the hood and then configures the project to work with your shared workspace configurations.

## Features

- Creates a new Vite application in the `apps` directory
- Connects to your monorepo's shared ESLint and TypeScript configurations
- Adds convenient scripts to the root package.json
- Supports multiple frontend frameworks with TypeScript

## Usage

From your repository root, run:

```bash
npx turbo gen vite-app
```

Follow the prompts to:

1. Enter a name for your new app
2. Select a framework template

## Available Templates

- React (TypeScript)
- React with SWC (TypeScript)
- Vue (TypeScript)
- Preact (TypeScript)
- Svelte (TypeScript)
- Solid (TypeScript)
- Vanilla (TypeScript)

## What Happens Behind the Scenes

1. Runs `create-vite` to scaffold a new app in the `apps` directory
2. Updates package.json to use workspace dependencies
3. Creates a tsconfig.json that extends the shared config
4. Updates the root package.json with new scripts for your app

## After Creation

After creating your app, you can start it with:

```bash
pnpm <app-name>:dev
```

Or build it with:

```bash
pnpm <app-name>:build
```
