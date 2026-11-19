import { expect, test } from "@playwright/test"
import path from "node:path"

// Faz 0 kabul testi: backend (admin) ve storefront ayakta mı?
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:9000"
const SHOTS = path.resolve(__dirname, "../../docs/screenshots/faz-0")

test("backend sağlık ucu yanıt veriyor", async ({ request }) => {
  const res = await request.get(`${BACKEND_URL}/health`)
  expect(res.ok()).toBeTruthy()
})

test("Medusa Admin giriş sayfası açılıyor", async ({ page }, info) => {
  await page.goto(`${BACKEND_URL}/app`)
  await expect(
    page.getByRole("button", { name: /continue|devam/i }),
  ).toBeVisible()
  await page.screenshot({
    path: `${SHOTS}/admin-${info.project.name}.png`,
    fullPage: true,
  })
})

test("storefront ana sayfası açılıyor", async ({ page }, info) => {
  const res = await page.goto("/")
  expect(res?.status()).toBeLessThan(400)
  await expect(page.locator("body")).toBeVisible()
  await page.screenshot({
    path: `${SHOTS}/storefront-${info.project.name}.png`,
    fullPage: true,
  })
})
