import { expect, test, type Page } from "@playwright/test"
import path from "node:path"

// Faz 1 kabul: Türkçe karakterler, TR ↔ EN geçişi, hreflang, mobil menü, ekran görüntüleri.
const SHOTS = path.resolve(__dirname, "../../docs/screenshots/faz-1")

test.describe("dil yönlendirmesi", () => {
  test("kök adres varsayılan dile (TR) yönlenir", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/tr$/)
    await expect(page.locator("html")).toHaveAttribute("lang", "tr")
  })

  test("çevrilmiş slug'lar çalışır", async ({ page }) => {
    await page.goto("/en/fit-twin")
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fit Twin")
  })
})

test.describe("Türkçe karakterler", () => {
  test("ğ ş İ ı ç ö ü doğru ve doğru fontla render edilir", async ({
    page,
  }) => {
    await page.goto("/tr")
    const h1 = page.getByRole("heading", { level: 1 })
    await expect(h1).toHaveText("Seni eve taşır.")

    // Başlık fontu Archivo (next/font, latin-ext alt kümesi) olmalı, yedek font değil
    await page.evaluate(() => document.fonts.ready)
    const family = await h1.evaluate((el) => getComputedStyle(el).fontFamily)
    expect(family).toMatch(/Archivo/i)
    const loaded = await page.evaluate(() =>
      [...document.fonts].some(
        (f) => /Archivo/i.test(f.family) && f.status === "loaded",
      ),
    )
    expect(loaded).toBe(true)

    // text-transform: uppercase + lang="tr" → "SENİ EVE TAŞIR." (noktalı büyük İ)
    const upper = await h1.evaluate((el) => (el as HTMLElement).innerText)
    expect(upper).toContain("SENİ EVE TAŞIR.")

    // İngilizce slogan lang="en" ile işaretli → "ARION" (noktasız), "ARİON" değil
    const slogan = page.getByText("Carried by Arion.").first()
    expect(
      await slogan.evaluate((el) => (el as HTMLElement).innerText),
    ).toContain("ARION")
  })
})

/** Mobilde dil seçici menünün içindedir: önce menüyü aç. */
async function switchLanguage(page: Page, isMobile: boolean, name: string) {
  if (isMobile)
    await page.getByRole("button", { name: /Menüyü aç|Open menu/ }).click()
  await page.getByRole("link", { name }).locator("visible=true").first().click()
}

test.describe("TR ↔ EN geçişi", () => {
  test("aynı sayfada dil değişir (manifesto)", async ({ page, isMobile }) => {
    await page.goto("/tr/manifesto")
    await switchLanguage(page, isMobile, "English")
    await expect(page).toHaveURL(/\/en\/manifesto$/)
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Manifesto",
    )

    await switchLanguage(page, isMobile, "Türkçe")
    await expect(page).toHaveURL(/\/tr\/manifesto$/)
  })

  test("dinamik yasal sayfada slug korunur", async ({ page, isMobile }) => {
    await page.goto("/tr/yasal/kunye")
    await switchLanguage(page, isMobile, "English")
    await expect(page).toHaveURL(/\/en\/legal\/imprint$/)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Imprint")
  })

  test("çevrilmiş slug'lı sayfada dil değişir (Ayak İkizi → Fit Twin)", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/tr/ayak-ikizi")
    await switchLanguage(page, isMobile, "English")
    await expect(page).toHaveURL(/\/en\/fit-twin$/)
  })
})

test("hreflang alternatifleri her sayfada var", async ({ page }) => {
  await page.goto("/tr/ayak-ikizi")
  const href = (lang: string) =>
    page
      .locator(`link[rel="alternate"][hreflang="${lang}"]`)
      .getAttribute("href")
  expect(await href("tr")).toMatch(/\/tr\/ayak-ikizi$/)
  expect(await href("en")).toMatch(/\/en\/fit-twin$/)
  expect(await href("x-default")).toMatch(/\/tr\/ayak-ikizi$/)
  expect(
    await page.locator('link[rel="canonical"]').getAttribute("href"),
  ).toMatch(/\/tr\/ayak-ikizi$/)
})

test("footer'da yasal linkler ve Çerez Tercihleri var", async ({ page }) => {
  await page.goto("/tr")
  const footer = page.getByRole("contentinfo")
  await expect(
    footer.getByRole("link", { name: "KVKK Aydınlatma Metni" }),
  ).toBeVisible()
  await expect(
    footer.getByRole("button", { name: "Çerez Tercihleri" }),
  ).toBeVisible()
  await expect(footer.getByRole("link", { name: "Künye" })).toBeVisible()
})

test("mobil menü klavye ve aria-expanded ile çalışır", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Sadece mobil görünüm")
  await page.goto("/tr")
  const toggle = page.getByRole("button", { name: "Menüyü aç" })
  await expect(toggle).toHaveAttribute("aria-expanded", "false")
  await toggle.click()
  await expect(
    page.getByRole("button", { name: "Menüyü kapat" }),
  ).toHaveAttribute("aria-expanded", "true")
  const nav = page.getByRole("navigation", { name: "Ana menü" })
  await expect(nav.getByRole("link", { name: "Manifesto" })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(nav).toBeHidden()
})

test.describe("ekran görüntüleri", () => {
  for (const url of ["/tr", "/en", "/tr/manifesto", "/en/manifesto"]) {
    test(`${url}`, async ({ page }, info) => {
      await page.emulateMedia({ reducedMotion: "reduce" })
      await page.goto(url)
      await page.evaluate(() => document.fonts.ready)
      const name = url.slice(1).replace(/\//g, "-")
      await page.screenshot({
        path: `${SHOTS}/${name}-${info.project.name}.png`,
        fullPage: true,
      })
    })
  }
})
