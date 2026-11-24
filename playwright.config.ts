import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev:e2e",
    url: "http://localhost:3100",
    reuseExistingServer: false,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
