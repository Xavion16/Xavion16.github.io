import { expect, test, type Page } from "@playwright/test"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

/*
 * Faz 2 kabul:
 *  - Misafir ve üye olarak uçtan uca sandbox satın alma (iyzico mock modu).
 *  - Üstü çizili fiyat YALNIZCA price_history'den gelir (gerçek indirim gösterilir, şişirilmiş fiyat gösterilmez).
 *  - Sipariş e-postası üretilir (outbox).
 */
const SHOTS = path.resolve(__dirname, "../../docs/screenshots/faz-2")
const OUTBOX = path.resolve(__dirname, "../../apps/backend/.outbox")

const unique = (p: string) =>
  `${p}+${Date.now()}${Math.floor(Math.random() * 1000)}@example.test`

async function pick(page: Page, group: RegExp, value: string) {
  await page
    .getByRole("group", { name: group })
    .getByRole("radio", { name: value, exact: true })
    .check({ force: true })
}

async function addKackarToCart(page: Page) {
  await page.goto("/tr/urun/kackar-su-gecirmez-bot")
  await pick(page, /^Renk/, "Kahverengi")
  await pick(page, /^Numara/, "42")
  await pick(page, /^Genişlik/, "W")
  await page.getByRole("button", { name: "Sepete ekle" }).click()
  await expect(page.getByText("Sepete eklendi.")).toBeVisible()
  await expect(page.getByTestId("cart-count")).toHaveText("1")
}

async function fillAddressAndShip(page: Page, email?: string) {
  await page.goto("/tr/sepet")
  await page.getByRole("link", { name: "Ödemeye geç" }).click()
  await expect(page).toHaveURL(/\/tr\/odeme/)
  if (email)
    await page
      .getByRole("textbox", { name: "E-posta", exact: true })
      .fill(email)
  await page.getByRole("textbox", { name: "Ad", exact: true }).fill("Deniz")
  await page.getByRole("textbox", { name: "Soyad", exact: true }).fill("Yılmaz")
  await page
    .getByRole("textbox", { name: "Açık adres", exact: true })
    .fill("Örnek Mah. Test Sk. No:5 D:3")
  await page.getByRole("textbox", { name: "İl", exact: true }).fill("İstanbul")
  await page.getByRole("textbox", { name: "İlçe", exact: true }).fill("Kadıköy")
  await page.getByRole("button", { name: "Adresi kaydet ve devam et" }).click()
  await page.getByRole("button", { name: /Standart Kargo/ }).click()
  await expect(
    page.getByRole("button", { name: /Standart Kargo/ }),
  ).toHaveAttribute("aria-pressed", "true")
}

async function pay(page: Page, result: "success" | "failure") {
  await page.getByRole("button", { name: "Siparişi Onayla ve Öde" }).click()
  await expect(page).toHaveURL(/\/tr\/odeme\/simulasyon\?token=mock_/)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "3D Secure adımı",
  )
  await page
    .getByRole("link", {
      name: result === "success" ? "Ödemeyi onayla" : "Başarısız ödeme dene",
    })
    .click()
}

async function outboxHas(email: string): Promise<boolean> {
  for (let i = 0; i < 20; i++) {
    const files = await readdir(OUTBOX).catch(() => [] as string[])
    for (const f of files.filter((x) => x.includes("order-placed"))) {
      if (
        (await readFile(path.join(OUTBOX, f), "utf8")).includes(`to: ${email}`)
      )
        return true
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}

test.describe("indirim gösterimi (10 gün kuralı)", () => {
  test("gerçek indirim üstü çizili gösterilir, şişirilmiş fiyatta gösterilmez", async ({
    page,
  }) => {
    await page.goto("/tr/urun/bogaz-gunluk-sneaker")
    const del = page.locator("main del").first()
    await expect(del).toHaveText(/2\.790/)
    await expect(del).toHaveAttribute("aria-label", /son 10 günün en düşüğü/)
    await expect(page.getByText("%18 indirim").first()).toBeVisible()

    // Fiyat indirimden önce 3.990'a şişirildi → yasal referans 3.290 < 3.790 → üstü çizili YOK
    await page.goto("/tr/urun/palandoken-chelsea")
    await expect(page.locator("main h1")).toHaveText("Palandöken Chelsea")
    await expect(
      page.locator("main section, main > div").first().locator("del"),
    ).toHaveCount(0)
  })

  test("liste kartında indirim rozeti yalnızca gerçek indirimde", async ({
    page,
  }) => {
    await page.goto("/tr/koleksiyon/sneaker")
    const card = page.getByRole("link", { name: /Boğaz Günlük Sneaker/ })
    await expect(card.locator("del")).toHaveText(/2\.790/)
    await page.goto("/tr/koleksiyon/kislik-bot")
    await expect(
      page.getByRole("link", { name: /Palandöken Chelsea/ }).locator("del"),
    ).toHaveCount(0)
  })
})

test.describe("uçtan uca satın alma (iyzico sandbox/mock)", () => {
  test.describe.configure({ mode: "serial" })
  test.skip(({ isMobile }) => isMobile, "Satın alma akışı masaüstünde koşar")

  test("misafir olarak satın alma", async ({ page }) => {
    const email = unique("misafir")
    await addKackarToCart(page)
    await page.goto("/tr/sepet")
    await expect(page.getByText("Toplam (KDV dahil)")).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/sepet.png`, fullPage: true })

    await fillAddressAndShip(page, email)
    await page.screenshot({ path: `${SHOTS}/odeme.png`, fullPage: true })
    await pay(page, "success")

    await expect(page).toHaveURL(/\/tr\/siparis\/order_/)
    await expect(page.getByTestId("order-number")).toHaveText(/#\d+/)
    await expect(page.getByText(email)).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/siparis-onay.png`, fullPage: true })
    expect(await outboxHas(email), "sipariş e-postası outbox'a yazılmalı").toBe(
      true,
    )

    // Sepet tamamlandı → sayaç sıfırlandı
    await expect(page.getByTestId("cart-count")).toHaveCount(0)
  })

  test("üye olarak satın alma ve siparişin hesapta görünmesi", async ({
    page,
  }) => {
    const email = unique("uye")
    await page.goto("/tr/hesabim/kayit")
    await page.getByRole("textbox", { name: "Ad", exact: true }).fill("Ece")
    await page.getByRole("textbox", { name: "Soyad", exact: true }).fill("Kaya")
    await page
      .getByRole("textbox", { name: "E-posta", exact: true })
      .fill(email)
    await page.getByLabel("Şifre").fill("Arion-test-2026")
    await page.getByRole("button", { name: "Üyeliği oluştur" }).click()
    await expect(page).toHaveURL(/\/tr\/hesabim$/)
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Merhaba, Ece",
    )

    await addKackarToCart(page)
    await fillAddressAndShip(page) // e-posta üyelikten gelir
    await pay(page, "success")
    await expect(page).toHaveURL(/\/tr\/siparis\/order_/)
    const orderNo =
      (await page.getByTestId("order-number").textContent())?.trim() ?? ""

    await page.goto("/tr/hesabim")
    await expect(
      page.getByRole("link", { name: new RegExp(`Sipariş ${orderNo}`) }),
    ).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/hesabim.png`, fullPage: true })
    expect(await outboxHas(email)).toBe(true)
  })

  test("başarısız ödemede sipariş oluşmaz ve kullanıcı bilgilendirilir", async ({
    page,
  }) => {
    await addKackarToCart(page)
    await fillAddressAndShip(page, unique("ret"))
    await pay(page, "failure")
    await expect(page).toHaveURL(/\/tr\/odeme\?hata=odeme-reddedildi/)
    await expect(page.getByRole("alert")).toContainText("Ödeme onaylanmadı")
    // Sepet duruyor, tekrar denenebilir
    await expect(page.getByTestId("cart-count")).toHaveText("1")
  })
})

test.describe("katalog", () => {
  test("5 kategori ve en az 12 ürün", async ({ page }, info) => {
    await page.goto("/tr/koleksiyon")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Tüm ayakkabılar",
    )
    const nav = page.getByRole("navigation", { name: "Koleksiyon" })
    for (const c of ["Topuklu", "Kışlık Bot", "Sneaker", "Klasik", "Çocuk"]) {
      await expect(
        nav.getByRole("link", { name: c, exact: true }),
      ).toBeVisible()
    }
    const cards = page.locator("main ul li a[href*='/urun/']")
    expect(await cards.count()).toBeGreaterThanOrEqual(12)
    await page.screenshot({
      path: `${SHOTS}/koleksiyon-${info.project.name}.png`,
      fullPage: true,
    })
  })

  test("ürün sayfası: teknik yapı, Dayanıklılık Kartı (DEMO), kalıp tablosu", async ({
    page,
  }, info) => {
    await page.goto("/tr/urun/pera-65-stiletto")
    await expect(
      page.getByRole("heading", { name: "Teknik yapı" }),
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Dayanıklılık Kartı" }),
    ).toBeVisible()
    await expect(
      page
        .getByRole("region", { name: "Teknik yapı" })
        .getByText("Çelik", { exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: /Kalıp · Pera/ }),
    ).toBeVisible()
    await expect(page.getByRole("table")).toContainText("36")
    await expect(page.getByText("ARN-L01")).toBeVisible()
    await page.screenshot({
      path: `${SHOTS}/urun-${info.project.name}.png`,
      fullPage: true,
    })
  })

  test("EN dilinde ürün adı ve çevrilmiş yol", async ({ page }) => {
    await page.goto("/en/product/galata-oxford")
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Galata Oxford",
    )
    await expect(
      page.getByRole("button", { name: "Add to cart" }),
    ).toBeVisible()
  })
})
