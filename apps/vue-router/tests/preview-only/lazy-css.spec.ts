import { test } from "@playwright/test";

// Vite loads a lazy route's CSS through the preload list of its import.
test("a lazy route loads its CSS", async ({ page }) => {
  const helloCss = page.waitForRequest(/\/assets\/Hello-[\w-]+\.css$/, {
    timeout: 5000,
  });
  await page.goto("/hello");
  await helloCss;
});
