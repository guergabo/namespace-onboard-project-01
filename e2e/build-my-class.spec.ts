import { expect, test } from "@playwright/test";

test("build a class from the form, then swap one step", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Build my class" }).first().click();
  await page.getByRole("button", { name: "Beginner" }).click();
  await page.getByRole("button", { name: "Turns" }).click();
  await page.getByRole("button", { name: "15 min" }).click();
  await page.getByRole("button", { name: /Build my class/ }).click();

  const result = page.locator("#your-class");
  await expect(result.getByRole("heading", { level: 2 })).toHaveText(/Beginner · Turns · 15 min/i);
  await expect(result.getByRole("heading", { name: "Turns", exact: true })).toBeVisible();

  const names = () => result.locator("li a[href^='/glossary/']").allTextContents();
  const before = await names();
  const swap = result.getByRole("link", { name: /^Swap / }).nth(1);
  const swapped = (await swap.getAttribute("aria-label"))!.replace(/^Swap (.*) for another step$/, "$1");
  await swap.click();

  await expect.poll(names).not.toContain(swapped);
  const after = await names();
  expect(after.filter((name) => !before.includes(name))).toHaveLength(1);
});
