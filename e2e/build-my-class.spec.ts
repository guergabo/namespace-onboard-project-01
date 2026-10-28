import { expect, test } from "@playwright/test";

const CLASS = "/class?level=beginner&goals=full-class&min=15&barre=1&travel=0&jumps=1&seed=1";

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
  const swap = result.getByRole("link", { name: /^Next alternative to / }).first();
  const swapped = (await swap.getAttribute("aria-label"))!.replace(/^Next alternative to /, "");
  await swap.click();

  await expect.poll(names).not.toContain(swapped);
  // Only that row changes; every other row keeps its step and its place.
  const after = await names();
  const row = before.indexOf(swapped);
  expect(after).toHaveLength(before.length);
  expect([...after.slice(0, row), ...after.slice(row + 1)]).toEqual([...before.slice(0, row), ...before.slice(row + 1)]);
});

test("class mode counts down, changes sides halfway through, and skips", async ({ page }) => {
  await page.clock.install();
  await page.goto(CLASS);
  await page.getByRole("button", { name: "Start class" }).click();
  const player = page.getByRole("dialog");

  // Demi-plié has no working leg, so no side.
  await expect(player.getByRole("heading", { level: 2 })).toHaveText("Demi-plié");
  await expect(player.getByText("Right side", { exact: true })).toHaveCount(0);

  // Skip on to the first step with a working leg; the barre always reaches battement tendu.
  const heading = player.getByRole("heading", { level: 2 });
  for (let i = 0; i < 4 && (await player.getByText("Right side", { exact: true }).count()) === 0; i++) {
    const name = await heading.textContent();
    await player.getByRole("button", { name: "Skip" }).click();
    await expect(heading).not.toHaveText(name!);
  }
  await expect(player.getByText("Right side", { exact: true })).toBeVisible();

  // Halfway through, the left side starts by itself.
  const [m, s] = (await player.getByLabel(/ left$/).textContent())!.split(":").map(Number);
  await page.clock.runFor(((m * 60 + s) / 2 + 1) * 1000);
  await expect(player.getByText("Left side", { exact: true })).toBeVisible();
  await expect(player.getByRole("status")).toHaveText("Change sides");

  await player.getByRole("button", { name: "Pause" }).click();
  await player.getByRole("button", { name: /End class/ }).click();
  await expect(player).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Resume class" })).toBeVisible();
});
