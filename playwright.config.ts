import { defineConfig, devices } from "@playwright/test";

/** Browser tests against the production build; run `npm run build` first. */
export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Port 3100, so it never collides with a dev server on 3000.
  webServer: { command: "npm run start -- -p 3100", url: "http://localhost:3100", reuseExistingServer: false },
});
