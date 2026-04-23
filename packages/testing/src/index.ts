import { test, expect } from "@playwright/test";
import {CSPPolicy, policyToString} from "csp-toolkit"

type ElementColours = {
  headerColour: string;
  buttonColour: string;
}

/**
 * Generates a test suite to validate that HTML, JS and CSS are loaded in correctly
 * @param {string} title - The title of the application.
 * @param {ElementColours} colours - The colours of the header and button elements.
 */
export const genericTests = (title: string, {headerColour, buttonColour}: ElementColours) => {
  test("Index HTML Loaded", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(title);
  });

  test("Loaded main JS script", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(`text=${title}`)).toBeVisible();
  });

  test("Loaded CSS Styles", async ({ page }) => {
    await page.goto("/");

    const header = page.getByRole("heading", { name: title });
    const button = page.getByRole("button", {name: "count is"})
    await expect(header).toBeVisible();
    await expect(button).toBeVisible();

    const headerCol = await header.evaluate(
      (el) => window.getComputedStyle(el).color
    );

    const buttonCol = await button.evaluate(el => window.getComputedStyle(el).backgroundColor)

    expect(headerCol).toBe(headerColour);
    expect(buttonCol).toBe(buttonColour);
  });
}

/**
 * Generates a test to validate CSP policy in the meta tag.
 * @param {CSPPolicy} expectedPolicy - The expected CSP policy string to validate (ignoring SHA-256 hashes).
 */
export const cspGenerationTest = (expectedPolicy: CSPPolicy) => {
  test(`CSP validation`, async ({ page }) => {
    await page.goto("/");

    // Get the CSP meta tag content
    const metaTag = page.locator('meta[http-equiv="Content-Security-Policy"]');
    const content = await metaTag.getAttribute('content');

    // Remove all SHA-256 hashes from both the actual and expected policies
    const normalizeCsp = (csp: string | null) =>
      csp
        ?.replace(/'sha256-[^']+'/g, '') // Remove SHA-256 hashes
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

    const policyString = policyToString(expectedPolicy)

    const normalizedContent = normalizeCsp(content);
    const normalizedExpectedPolicy = normalizeCsp(policyString);

    // Validate that the normalized expected policy is part of the actual policy
    expect(normalizedContent).toContain(normalizedExpectedPolicy);
  });
};

/**
 * Generates a test to validate that SRI is enabled and working
 * @param scriptSelector - Optional selector for the main script (default: script[src*="/assets/"][type="module"])
 */
export const sriTest = (scriptSelector = 'script[src*="/assets/"][type="module"]') => {
  test("SRI is enabled and working", async ({ page }) => {
    await page.goto("/");

    const script = page.locator(scriptSelector).first();
    const integrity = await script.getAttribute("integrity");

    // Check if the integrity attribute is not null, ensuring SRI is enabled
    expect(integrity).not.toBe(null);
  });
};

/**
 * Generates a test to validate that the Vite Logo is being loaded and not blocked by the CSP
 */
export const viteLogoTest = () => {
  test("Vite logo is loaded", async ({ page }) => {
    await page.goto("/");
    const viteLogo = page.locator('img[alt="Vite logo"]');
    await expect(viteLogo).toBeVisible();
    const naturalWidth = await viteLogo.evaluate((img) => (img as HTMLImageElement).naturalWidth);
    expect(naturalWidth).toBeGreaterThan(1);
  });
}

/**
 * Generates a test to validate that JQuery is blocked by the CSP
 */
export const jQueryTest = () => {

  test("JQuery is blocked by CSP", async ({ page }) => {
    let cspViolationDetected = false;
    const expectedErrorMessage =
      "Refused to load the script 'https://code.jquery.com/jquery-3.7.1.slim.js' because it violates the following Content Security Policy directive:";

    // Listen for console events and check if the expected CSP violation error occurs
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        message.text().includes(expectedErrorMessage)
      ) {
        cspViolationDetected = true;
      }
    });

    await page.goto("/");

    // Assert that the CSP violation was detected
    expect(cspViolationDetected).toBe(true);
  });
}

/**
 * Generates a test to validate that the override flag is working in the plugin
 * @param title - The title of the application.
 */
export const overrideTest = (title: string) => {

  test("Override flag is working in plugin", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(`text=${title}`)).toBeVisible();

    // Get the meta tag and read the "font-src" attribute, which should contain the value "https://fonts.gstatic.com"
    const metaElement = page.locator(
      'meta[http-equiv="Content-Security-Policy"]'
    );

    const content = await metaElement.getAttribute("content");

    expect(content).toContain("font-src https://fonts.gstatic.com");
    expect(content).not.toContain("img-src");
  });

}

/**
 * Generate a test to validate that the inline script is blocked by the CSP
 * @param title - The title of the application.
 */
export const inlineScriptBlockedTest = (title: string) => {

  test("Inline script is blocked by CSP", async ({ page }) => {
    let cspViolationDetected = false;
    let inlineScriptExecuted = false;
    const expectedErrorMessage =
      "Refused to execute inline script because it violates the following Content Security Policy directive:";
    const inlineScriptLogMessage = "Inline script executed";

    // Listen for console events and check if the expected CSP violation error occurs
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        message.text().includes(expectedErrorMessage)
      ) {
        cspViolationDetected = true;
      }
      if (
        message.type() === "log" &&
        message.text().includes(inlineScriptLogMessage)
      ) {
        inlineScriptExecuted = true;
      }
    });

    await page.goto("/");
    await expect(page).toHaveTitle(title);
    await expect(page.locator("h3").textContent()).resolves.toBe("Home");

    // Assert that the CSP violation was detected
    expect(cspViolationDetected).toBe(true);
    // Assert that the inline script log message was not detected
    expect(inlineScriptExecuted).toBe(false);
  });
}
