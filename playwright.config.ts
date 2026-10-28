import { defineConfig, devices } from "@playwright/test";

/** Browser tests against the production build; run `npm run build` first. */
export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // The standalone server the Docker image runs, on port 3100 so it never collides with a dev server
  // on 3000. It changes into its own directory, so the database path must be absolute.
  webServer: {
    command: "cp -r .next/static .next/standalone/.next/ && node .next/standalone/server.js",
    env: { PORT: "3100", DATABASE_PATH: `${process.cwd()}/data/tendu.db` },
    url: "http://localhost:3100",
    reuseExistingServer: false,
  },
});
