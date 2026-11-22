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
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Choose by millimetre, not by size number.",
    )
  })
})

test.describe("Türkçe karakterler", () => {
  test("ğ ş İ ı ç ö ü doğru ve doğru fontla render edilir", async ({
    page,
  }) => {
    await page.goto("/tr")
    const h1 = page.getByRole("heading", { level: 1 })
    await expect(h1).toHaveText(/İstanbul atölyesinden kadın topukluları/)
    const title = page.getByRole("heading", { level: 2, name: "Gece senin." })
    await expect(title).toBeVisible()

    // Başlık fontu Bodoni Moda (next/font, latin-ext), yedek font değil (DECISIONS #070, #078)
    await page.evaluate(() => document.fonts.ready)
    const family = await title.evaluate((el) => getComputedStyle(el).fontFamily)
    expect(family).toMatch(/Bodoni/i)
    const loaded = await page.evaluate(() =>
      [...document.fonts].some(
        (f) => /Bodoni/i.test(f.family) && f.status === "loaded",
      ),
    )
    expect(loaded).toBe(true)

    // uppercase + lang="tr": "Kadın" → "KADIN" (noktasız I), "Ayak İkizi" → "AYAK İKİZİ" (noktalı İ)
    const eyebrow = page.getByText("Kadın · Topuklu").first()
    const upper = await eyebrow.evaluate((el) => (el as HTMLElement).innerText)
    expect(upper).toContain("KADIN")
    const nav = page
      .getByRole("navigation")
      .getByRole("link", { name: "Ayak İkizi" })
      .first()
    if (await nav.isVisible()) {
      expect(
        await nav.evaluate((el) => (el as HTMLElement).innerText),
      ).toContain("AYAK İKİZİ")
    }

    // İngilizce etiket lang="en" ile işaretli → "CRAFTED IN" (noktasız I), "CRAFTED İN" değil
    const tagline = page
      .getByRole("contentinfo")
      .getByText("Crafted in Türkiye.")
    const tag = await tagline.evaluate((el) => (el as HTMLElement).innerText)
    expect(tag).toContain("CRAFTED IN")
    expect(tag).not.toContain("İN")
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
  await expect(nav.getByRole("link", { name: "Kadın" })).toBeVisible()
  await expect(nav.getByRole("link", { name: "Erkek" })).toBeVisible()
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

// Açılış: bir taraf Kadın, bir taraf Erkek; üzerine gelinen taraf büyür (DECISIONS #078)
test("açılışta Kadın / Erkek ikiye bölünür, üzerine gelinen taraf genişler", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/tr")
  const women = page.locator("[data-side='women']")
  const men = page.locator("[data-side='men']")
  await expect(
    women.getByRole("heading", { name: "Gece senin." }),
  ).toBeVisible()
  await expect(
    men.getByRole("heading", { name: "Sessiz özgüven." }),
  ).toBeVisible()
  await expect(
    men.getByRole("link", { name: /Salonu keşfet/ }),
  ).toHaveAttribute("href", "/tr/koleksiyon/erkek")
  await expect(
    women.getByRole("link", { name: /Vitrini keşfet/ }),
  ).toHaveAttribute("href", "/tr/koleksiyon/topuklu")
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)

  const width = (l: typeof women) =>
    l.evaluate((el) => el.getBoundingClientRect().width)
  await men.hover()
  await expect
    .poll(async () => (await width(men)) - (await width(women)), {
      timeout: 5000,
    })
    .toBeGreaterThan(250)
  await women.hover()
  await expect
    .poll(async () => (await width(women)) - (await width(men)), {
      timeout: 5000,
    })
    .toBeGreaterThan(250)
})

// Cam görünümü kalıcı (DECISIONS #088): deneme anahtarı yok
test("site cam görünümüyle açılır, görünüm anahtarı yok", async ({ page }) => {
  await page.goto("/tr")
  await expect(page.locator("html")).toHaveAttribute("data-skin", "glass")
  await expect(page.getByTestId("skin-switch")).toHaveCount(0)
})
