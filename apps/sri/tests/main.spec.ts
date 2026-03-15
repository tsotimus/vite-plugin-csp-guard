import { test, expect } from "@playwright/test";

const APP_TITLE = "SRI Test App";

test("Index HTML Loaded", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(APP_TITLE);
});

test("Loaded main content", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(`text=${APP_TITLE}`)).toBeVisible();
});

test("Lazy-loaded Home component renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h3", { hasText: "Home" })).toBeVisible();
});

test("Lazy-loaded Home2 component renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h3", { hasText: "Home 2" })).toBeVisible();
});

test("Home2 click counter works", async ({ page }) => {
  await page.goto("/");
  const button = page.getByRole("button", { name: /Clicked \d+ times/ });
  await expect(button).toBeVisible();
  await button.click();
  await expect(page.getByRole("button", { name: "Clicked 1 times" })).toBeVisible();
});
