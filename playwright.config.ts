import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? "line" : "list",
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "https://naqlk.com",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], browserName: "firefox" },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], browserName: "firefox" },
    },
  ],
});
