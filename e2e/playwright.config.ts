import { defineConfig, devices } from "@playwright/test"

const STOREFRONT_URL = process.env.STOREFRONT_URL ?? "http://localhost:8000"
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:9000"

export default defineConfig({
  testDir: "./tests",
  outputDir: "./.results",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "./.report" }]],
  timeout: 60_000,
  use: {
    baseURL: STOREFRONT_URL,
    locale: "tr-TR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  metadata: { backendUrl: BACKEND_URL },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
})
