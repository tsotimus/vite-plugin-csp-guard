import type { PlopTypes } from "@turbo/gen";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

// Template options for create-vite
const VITE_TEMPLATES = {
  react: "react-ts",
  "react-swc": "react-swc-ts",
  vue: "vue-ts",
  preact: "preact-ts",
  svelte: "svelte-ts",
  solid: "solid-ts",
  vanilla: "vanilla-ts",
};

// Define schema for generator answers
const AnswersSchema = z.object({
  appName: z.string().min(1),
  template: z.string().min(1),
});

// Custom action to run create-vite
const createViteAppAction: PlopTypes.CustomActionFunction = async (answers) => {
  // Validate the answers
  try {
    const { appName, template } = AnswersSchema.parse(answers);

    const appsDir = path.resolve(process.cwd(), "apps");
    const newAppPath = path.join(appsDir, appName);

    // Check if directory already exists
    if (fs.existsSync(newAppPath)) {
      return `❌ Error: App directory already exists: ${newAppPath}`;
    }

    try {
      // Run create-vite
      console.log(
        `\n🚀 Creating a new Vite app: ${appName} with template: ${template}`
      );
      execSync(
        `cd ${appsDir} && npx create-vite@latest ${appName} --template ${template}`,
        {
          stdio: "inherit",
        }
      );

      return `✅ Successfully created Vite app: ${appName}`;
    } catch (error) {
      return `❌ Error: Failed to create Vite app: ${error instanceof Error ? error.message : String(error)}`;
    }
  } catch (error) {
    return `❌ Error validating input: ${error instanceof Error ? error.message : String(error)}`;
  }
};

// Custom action to update package.json with workspace dependencies
const updatePackageJsonAction: PlopTypes.CustomActionFunction = async (
  answers
) => {
  try {
    const { appName } = AnswersSchema.parse(answers);

    const appsDir = path.resolve(process.cwd(), "apps");
    const packageJsonPath = path.join(appsDir, appName, "package.json");

    try {
      // Read and parse package.json
      const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
      const packageJson = JSON.parse(packageJsonContent);

      // Update devDependencies
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        "@repo/eslint-config": "workspace:*",
        "@repo/typescript-config": "workspace:*",
      };

      // Write the updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      return "✅ Updated package.json with workspace dependencies";
    } catch (error) {
      return `❌ Error updating package.json: ${error instanceof Error ? error.message : String(error)}`;
    }
  } catch (error) {
    return `❌ Error validating input: ${error instanceof Error ? error.message : String(error)}`;
  }
};

// Custom action to create/update tsconfig.json
const updateTsConfigAction: PlopTypes.CustomActionFunction = async (
  answers
) => {
  try {
    const { appName } = AnswersSchema.parse(answers);

    const appsDir = path.resolve(process.cwd(), "apps");
    const tsConfigPath = path.join(appsDir, appName, "tsconfig.json");

    try {
      // Create a tsconfig.json that extends the workspace config
      const tsConfigContent = {
        extends: "@repo/typescript-config/vite.json",
        include: ["src"],
        exclude: ["node_modules"],
        compilerOptions: {
          baseUrl: ".",
        },
      };

      fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfigContent, null, 2));

      return "✅ Created tsconfig.json with workspace configuration";
    } catch (error) {
      return `❌ Error creating tsconfig.json: ${error instanceof Error ? error.message : String(error)}`;
    }
  } catch (error) {
    return `❌ Error validating input: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("vite-app", {
    description: "Create a new Vite application in the monorepo",
    prompts: [
      {
        type: "input",
        name: "appName",
        message: "What is the name of your app?",
        validate: (input: string) => {
          if (!input.trim()) {
            return "App name is required";
          }
          // Check if the app already exists
          const appsDir = path.resolve(process.cwd(), "apps");
          const newAppPath = path.join(appsDir, input);
          if (fs.existsSync(newAppPath)) {
            return `App directory already exists: ${input}`;
          }
          return true;
        },
      },
      {
        type: "list",
        name: "template",
        message: "Which template would you like to use?",
        choices: Object.entries(VITE_TEMPLATES).map(([name, value]) => ({
          name: `${name} (TypeScript)`,
          value: value,
        })),
      },
    ],
    actions: [
      createViteAppAction,
      updatePackageJsonAction,
      updateTsConfigAction,
      {
        type: "append",
        path: "{{turbo.paths.root}}/package.json",
        pattern: /"scripts": {/,
        template:
          '    "{{appName}}:dev": "turbo dev --filter={{appName}}",\n    "{{appName}}:build": "turbo build --filter={{appName}}",\n    "{{appName}}:preview": "turbo preview --filter={{appName}}",',
      },
      () => "🎉 Vite app successfully created in apps/{{appName}}!",
    ],
  });
}
