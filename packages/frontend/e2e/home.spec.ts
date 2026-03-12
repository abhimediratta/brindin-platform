import { test, expect } from "@playwright/test";

test("homepage loads successfully", async ({ page }) => {
  await page.goto("/");

  // Screenshot after initial page load
  await page.screenshot({ path: "e2e/.results/homepage-loaded.png" });

  await expect(page).toHaveTitle(/.+/);
});

test("homepage has visible content", async ({ page }) => {
  await page.goto("/");

  const body = page.locator("body");
  await expect(body).toBeVisible();

  // Screenshot showing the rendered page content
  await page.screenshot({
    path: "e2e/.results/homepage-content.png",
    fullPage: true,
  });
});
