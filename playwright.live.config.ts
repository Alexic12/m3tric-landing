import { defineConfig, devices } from "@playwright/test";

/** Post-deploy suite against the live staging distribution (SPEC §13). No webServer: the site is already up. */
export const LIVE_URL = process.env.LIVE_URL ?? "https://d21guxd9tjai7a.cloudfront.net";

export default defineConfig({
  testDir: "./tests/live",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 3,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  // A dedicated output dir: Playwright empties it on start and must not touch test-results/ of the local suite.
  outputDir: "test-results/live-output",
  reporter: [["list"], ["json", { outputFile: "test-results/live-results.json" }]],
  use: {
    baseURL: LIVE_URL,
    locale: "es-CO",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
