import { expect, test } from "@playwright/test";

test("choosing the left leg redraws the step for the left side", async ({ page }) => {
  await page.goto("/glossary/croise-derriere");
  const studio = page.getByText(/^Facing \d/);
  await expect(studio).toHaveText("Facing 2 · standing on L · R leg to 6");
  await expect(page.getByText("Right leg extended behind")).toBeVisible();

  await page.getByRole("radio", { name: "Left" }).click();

  await expect(page.getByRole("radio", { name: "Left" })).toHaveAttribute("aria-checked", "true");
  await expect(studio).toHaveText("Facing 8 · standing on R · L leg to 4");
  await expect(page.getByText("Left leg extended behind")).toBeVisible();
});

test("the choice carries over to the next step page", async ({ page }) => {
  await page.goto("/glossary/croise-derriere");
  await page.getByRole("radio", { name: "Left" }).click();
  await page.goto("/glossary/croise-devant");
  await expect(page.getByRole("radio", { name: "Left" })).toHaveAttribute("aria-checked", "true");
});

for (const slug of ["first-position", "arms-third-position"]) {
  test(`${slug} has no working-leg toggle`, async ({ page }) => {
    await page.goto(`/glossary/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("radiogroup", { name: "Working leg" })).toHaveCount(0);
  });
}
