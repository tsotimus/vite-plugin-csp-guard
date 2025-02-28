import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

const APPS = [
  {
    url: "http://localhost:3000",
    command: `pnpm r:dev`,
    testDir: "./apps/react/tests",
    name: "React - Dev",
    testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4000",
    command: `pnpm r:preview`,
    testDir: "./apps/react/tests",
    name: "React - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
  {
    url: "http://localhost:3001",
    command: `pnpm mui:dev`,
    testDir: "./apps/mui/tests",
    name: "Mui - Dev",
    testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4001",
    command: `pnpm mui:preview`,
    testDir: "./apps/mui/tests",
    name: "Mui - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
  {
    url: "http://localhost:3002",
    command: `pnpm em:dev`,
    testDir: "./apps/emotion/tests",
    name: "Emotion - Dev",
    testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4002",
    command: `pnpm em:preview`,
    testDir: "./apps/emotion/tests",
    name: "Emotion - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
  {
    url: "http://localhost:3003",
    command: `pnpm tailwind:dev`,
    testDir: "./apps/tailwind/tests",
    name: "Tailwind - Dev",
    testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4003",
    command: `pnpm tailwind:preview`,
    testDir: "./apps/tailwind/tests",
    name: "Tailwind - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
  {
    url: "http://localhost:3004",
    command: `pnpm scss:dev`,
    testDir: "./apps/scss/tests",
    name: "Scss - Dev",
    testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4004",
    command: `pnpm scss:preview`,
    testDir: "./apps/scss/tests",
    name: "Scss - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
  {
    url: "http://localhost:3005",
    command: `pnpm less:dev`,
    testDir: "./apps/less/tests",
    name: "Less - Dev",
    testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4005",
    command: `pnpm less:preview`,
    testDir: "./apps/less/tests",
    name: "Less - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
  {
    url: "http://localhost:3006",
    command: `pnpm stylus:dev`,
    testDir: "./apps/stylus/tests",
    name: "Stylus - Dev",
    testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4006",
    command: `pnpm stylus:preview`,
    testDir: "./apps/stylus/tests",
    name: "Stylus - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
  {
    url: "http://localhost:3007",
    command: `pnpm vue:dev`,
    testDir: "./apps/vue-app/tests",
    name: "Vue - Dev",
    testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4007",
    command: `pnpm vue:preview`,
    testDir: "./apps/vue-app/tests",
    name: "Vue - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
  {
    url: "http://localhost:3008",
    command: `pnpm sv:dev`,
    testDir: "./apps/svelte-app/tests",
    name: "Svelte - Dev",
    testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4008",
    command: `pnpm sv:preview`,
    testDir: "./apps/svelte-app/tests",
    name: "Svelte - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
  {
    url: "http://localhost:3009",
    command: `pnpm pr:dev`,
    testDir: "./apps/preact-app/tests",
    name: "Preact - Dev",
    testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4009",
    command: `pnpm pr:preview`,
    testDir: "./apps/preact-app/tests",
    name: "Preact - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
  {
    url: "http://localhost:3010",
    command: `pnpm solid:dev`,
    testDir: "./apps/solid-app/tests",
    name: "Solid - Dev",
    testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4010",
    command: `pnpm solid:preview`,
    testDir: "./apps/solid-app/tests",
    name: "Solid - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
  {
    url: "http://localhost:3011",
    command: `pnpm v4:dev`,
    testDir: "./apps/vite4/tests",
    name: "Vite4 - Dev",
    testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4011",
    command: `pnpm v4:preview`,
    testDir: "./apps/vite4/tests",
    name: "Vite4 - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
  {
    url: "http://localhost:3012",
    command: `pnpm v5:dev`,
    testDir: "./apps/vite5/tests",
    name: "Vite5 - Dev",
    testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4012",
    command: `pnpm v5:preview`,
    testDir: "./apps/vite5/tests",
    name: "Vite5 - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
  {
    url: "http://localhost:3013",
    command: `pnpm v6:dev`,
    testDir: "./apps/vite6/tests",
    name: "Vite6 - Dev",
   testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4013",
    command: `pnpm v6:preview`,
    testDir: "./apps/vite6/tests",
    name: "Vite6 - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
  {
    url: "http://localhost:3014",
    command: `pnpm tailwind4:dev`,
    testDir: "./apps/tailwind4/tests",
    name: "Tailwind4 - Dev",
    testMatch: [
      /^(?!.*\/preview-only\/).*\.spec\.ts$/, // Exclude any file inside the preview-only folder
    ],
  },
  {
    url: "http://localhost:4014",
    command: `pnpm tailwind4:preview`,
    testDir: "./apps/tailwind4/tests",
    name: "Tailwind4 - Build",
    testMatch: [
      /^(?!.*\/dev-only\/).*\.spec\.ts$/, // Exclude any file inside the dev-only folder
    ],
  },
];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  name: "React Tests",
  outputDir: "test-results",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  testMatch: ".*(test|spec).(ts)",
  build: {
    external: ['**/*index.js'],
  },

  /* Configure projects for major browsers */
  projects: APPS.map((app) => {
    return {
      name: app.name,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: app.url,
      },
      testDir: app.testDir,
      testMatch: app.testMatch,
    };
  }),

  /* Run your local dev server before starting the tests */
  webServer: APPS.map((app) => {
    return {
      command: app.command,
      url: app.url,
      timeout: 60 * 1000, // 60 seconds
      reuseExistingServer: !process.env.CI,
    };
  }),
});
