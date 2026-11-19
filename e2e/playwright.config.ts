import { defineConfig, devices } from "@playwright/test"

const STOREFRONT_URL = process.env.STOREFRONT_URL ?? "http://localhost:8000"
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:9000"

export default defineConfig({
  testDir: "./tests",
  outputDir: "./.results",
  fullyParallel: true,
  // Geliştirme sunucusu (next dev) paralel yükte yavaşlar; yerelde 3 işçi yeterli
  workers: process.env.CI ? undefined : 3,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "./.report" }]],
  timeout: 90_000,
  // Geliştirme sunucusu ilk istekte sayfayı derler; aksiyon/yönlendirme beklemeleri buna göre
  expect: { timeout: 20_000 },
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
