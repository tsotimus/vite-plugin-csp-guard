import { test, expect } from "@playwright/test";
import { sriTest } from "@repo/testing";

// SRI tests - only run in preview (build) mode since SRI is a build-time feature
test.describe("SRI integrity", () => {
  sriTest();

  test("Modulepreload links have integrity", async ({ page }) => {
    await page.goto("/");

    const modulepreloadLinks = page.locator('link[rel="modulepreload"]');
    const count = await modulepreloadLinks.count();

    // With lazy-loaded Home and Home2, we expect at least 1 modulepreload link (one per chunk)
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < count; i++) {
      const link = modulepreloadLinks.nth(i);
      const integrity = await link.getAttribute("integrity");
      const href = await link.getAttribute("href");
      expect(integrity, `Modulepreload link ${href} should have integrity`).not.toBeNull();
      expect(integrity).toMatch(/^sha256-/);
    }
  });

  test("No integrity errors when loading lazy chunks", async ({ page }) => {
    const integrityErrors: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (
        msg.type() === "error" &&
        (text.includes("integrity") || text.includes("SRI") || text.includes("Failed to load"))
      ) {
        integrityErrors.push(text);
      }
    });

    await page.goto("/");

    // Wait for lazy components to load
    await expect(
      page.getByRole("heading", { name: "Home 2", exact: true })
    ).toBeVisible({ timeout: 5000 });

    expect(
      integrityErrors,
      `Expected no integrity-related errors, got: ${integrityErrors.join("; ")}`
    ).toHaveLength(0);
  });
});
