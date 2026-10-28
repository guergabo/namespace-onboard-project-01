import { expect, test } from "@playwright/test";

// Key pages render, each with a heading built from the seeded glossary.
const pages: [string, string][] = [
  ["/", "tendu"],
  ["/glossary", "Basic conceptions"],
  ["/glossary/category/jumps", "Close to the ground"],
  ["/glossary/battement-tendu", "How to do it"],
];

for (const [path, text] of pages) {
  test(`${path} renders`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: text, exact: true })).toBeVisible();
  });
}
