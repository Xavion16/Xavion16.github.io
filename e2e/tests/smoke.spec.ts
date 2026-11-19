import { expect, test } from "@playwright/test"

// Faz 0 kabul testi: backend (admin) ve storefront ayakta mı?
// (Faz 0 ekran görüntüleri docs/screenshots/faz-0 altında arşivdir; burada yeniden üretilmez.)
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:9000"

test("backend sağlık ucu yanıt veriyor", async ({ request }) => {
  const res = await request.get(`${BACKEND_URL}/health`)
  expect(res.ok()).toBeTruthy()
})

test("Medusa Admin giriş sayfası açılıyor", async ({ page }) => {
  await page.goto(`${BACKEND_URL}/app`)
  await expect(
    page.getByRole("button", { name: /continue|devam/i }),
  ).toBeVisible()
})

test("storefront ana sayfası açılıyor", async ({ page }) => {
  const res = await page.goto("/")
  expect(res?.status()).toBeLessThan(400)
  await expect(page.locator("body")).toBeVisible()
})
