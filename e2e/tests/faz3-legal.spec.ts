import { expect, test, type Page, type Request } from "@playwright/test"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { addFirstInStock, rejectCookies } from "./helpers"

/*
 * Faz 3 kabul (Rapor §12):
 *  - "Tümünü reddet" seçildiğinde hiçbir analitik/pazarlama isteği atılmaz (network kanıtı).
 *  - Hiçbir rıza kutusu varsayılan işaretli değildir.
 *  - Ödeme butonu ön bilgilendirme + mesafeli satış onayı olmadan pasiftir (ve backend de reddeder).
 *  - Ön bilgilendirmede arabuluculuk bilgisi ve iade kargo ücretinin satıcıya ait olduğu yazar.
 */
const SHOTS = path.resolve(__dirname, "../../docs/screenshots/faz-3")
const OUTBOX = path.resolve(__dirname, "../../apps/backend/.outbox")
const BACKEND = process.env.BACKEND_URL ?? "http://localhost:9000"

// Bu dosyadaki testler çerez tercihi YAPILMAMIŞ ziyaretçiyle başlar
test.use({ storageState: { cookies: [], origins: [] } })

const isTracking = (r: Request) =>
  /\/demo\/(analytics|pixel)\.js|\/api\/demo\/collect/.test(r.url())
const unique = (p: string) =>
  `${p}+${Date.now()}${Math.floor(Math.random() * 1000)}@example.test`

async function publishableKey(): Promise<string> {
  const env = await readFile(
    path.resolve(__dirname, "../../apps/storefront/.env.local"),
    "utf8",
  )
  return (
    /NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=(pk_[a-f0-9]+)/.exec(env)?.[1] ?? ""
  )
}

async function browse(page: Page) {
  for (const url of [
    "/tr",
    "/tr/koleksiyon",
    "/tr/urun/adrastus-oxford",
    "/tr/manifesto",
  ]) {
    await page.goto(url)
    await page.waitForLoadState("networkidle")
  }
}

test.describe("çerez banner'ı ve koşullu script yükleme", () => {
  test("Tümünü Reddet → hiçbir analitik/pazarlama isteği atılmaz", async ({
    page,
    context,
  }, info) => {
    const tracking: string[] = []
    page.on("request", (r) => {
      if (isTracking(r)) tracking.push(r.url())
    })

    await page.goto("/tr")
    const banner = page.getByRole("region", { name: "Çerez tercihin" })
    await expect(banner).toBeVisible()
    // Rıza verilmeden önce de hiçbir izleme isteği yok
    await page.waitForLoadState("networkidle")
    expect(tracking).toEqual([])
    await page.screenshot({
      path: `${SHOTS}/cerez-banner-${info.project.name}.png`,
    })

    await banner.getByRole("button", { name: "Tümünü Reddet" }).click()
    await expect(banner).toBeHidden()
    await browse(page)

    expect(tracking, "reddedildikten sonra izleme isteği olmamalı").toEqual([])
    const names = (await context.cookies()).map((c) => c.name)
    expect(names).not.toContain("arion_metrics")
    expect(names).not.toContain("arion_ads")
    expect(names).toContain("arion_consent")
  })

  test("Tümünü Kabul Et → analitik ve pazarlama script'leri yüklenir (kontrol testi)", async ({
    page,
  }) => {
    const tracking: string[] = []
    page.on("request", (r) => {
      if (isTracking(r)) tracking.push(r.url())
    })
    await page.goto("/tr")
    await page
      .getByRole("region", { name: "Çerez tercihin" })
      .getByRole("button", { name: "Tümünü Kabul Et" })
      .click()
    await page.goto("/tr/koleksiyon")
    await page.waitForLoadState("networkidle")
    expect(tracking.some((u) => u.includes("/demo/analytics.js"))).toBe(true)
    expect(tracking.some((u) => u.includes("/demo/pixel.js"))).toBe(true)
  })

  test("Kabul ve Ret butonları eşit görünürlükte", async ({ page }) => {
    await page.goto("/tr")
    const banner = page.getByRole("region", { name: "Çerez tercihin" })
    const accept = banner.getByRole("button", { name: "Tümünü Kabul Et" })
    const reject = banner.getByRole("button", { name: "Tümünü Reddet" })
    const style = (el: typeof accept) =>
      el.evaluate((n) => {
        const s = getComputedStyle(n)
        return [
          s.backgroundColor,
          s.color,
          s.fontSize,
          s.fontWeight,
          (n as HTMLElement).offsetHeight,
        ].join("|")
      })
    expect(await style(accept)).toBe(await style(reject))
  })

  test("tercih merkezinde hiçbir kategori önceden işaretli değil; footer'dan her an açılır", async ({
    page,
    context,
  }, info) => {
    await page.goto("/tr")
    await page.getByRole("button", { name: "Tercihleri Yönet" }).click()
    const dialog = page.getByRole("dialog", { name: "Çerez tercihleri" })
    await expect(dialog).toBeVisible()
    const switches = dialog.getByRole("switch")
    await expect(switches).toHaveCount(3)
    for (const s of await switches.all()) await expect(s).not.toBeChecked()
    await page.screenshot({
      path: `${SHOTS}/cerez-tercihleri-${info.project.name}.png`,
    })

    // Yalnızca analitiği seç → kaydet → banner kaybolur, footer'dan tekrar açılınca seçim korunur
    await dialog.getByRole("switch", { name: "Analitik" }).check()
    await dialog.getByRole("button", { name: "Seçimlerimi kaydet" }).click()
    await expect(
      page.getByRole("region", { name: "Çerez tercihin" }),
    ).toBeHidden()
    // Sunucu aksiyonu çerezi yazana kadar bekle
    await expect
      .poll(async () =>
        (await context.cookies()).some((c) => c.name === "arion_consent"),
      )
      .toBe(true)
    await page.reload()
    await page
      .getByRole("contentinfo")
      .getByRole("button", { name: "Çerez Tercihleri" })
      .click()
    await expect(dialog.getByRole("switch", { name: "Analitik" })).toBeChecked()
    await expect(
      dialog.getByRole("switch", { name: "Pazarlama" }),
    ).not.toBeChecked()
  })
})

test.describe("rıza kutuları", () => {
  test("üyelik formunda pazarlama rızaları ayrı ve işaretsiz; sözleşme onayı zorunlu", async ({
    page,
  }) => {
    await page.goto("/tr/hesabim/kayit")
    const boxes = page.locator("main input[type=checkbox]")
    expect(await boxes.count()).toBeGreaterThanOrEqual(3)
    for (const b of await boxes.all()) await expect(b).not.toBeChecked()
    await expect(
      page.getByLabel(
        "Kampanya ve yeniliklerden e-posta ile haberdar olmak istiyorum.",
      ),
    ).toBeVisible()
    await expect(
      page.getByLabel(
        "Kampanya ve yeniliklerden SMS ile haberdar olmak istiyorum.",
      ),
    ).toBeVisible()
  })

  test("KVKK başvuru ve aydınlatma noktalarında onay kutusu yok", async ({
    page,
  }) => {
    for (const url of [
      "/tr/yasal/kvkk-basvuru",
      "/tr/yasal/kvkk-aydinlatma",
      "/tr/hesabim/giris",
    ]) {
      await page.goto(url)
      await expect(page.locator("main input[type=checkbox]")).toHaveCount(0)
    }
  })

  test("üyelikte verilen pazarlama rızası İzinlerim'de görünür, İYS'ye bildirilir ve geri alınabilir", async ({
    page,
  }) => {
    test.skip(test.info().project.name === "mobile", "Masaüstünde koşar")
    const email = unique("riza")
    await page.goto("/tr/hesabim/kayit")
    await page.getByRole("button", { name: "Tümünü Reddet" }).click()
    await page.getByRole("textbox", { name: "Ad", exact: true }).fill("Selin")
    await page
      .getByRole("textbox", { name: "Soyad", exact: true })
      .fill("Demir")
    await page
      .getByRole("textbox", { name: "E-posta", exact: true })
      .fill(email)
    await page.getByLabel("Şifre").fill("Arion-test-2026")
    await page.getByLabel(/Üyelik Sözleşmesi/).check()
    await page
      .getByLabel(
        "Kampanya ve yeniliklerden e-posta ile haberdar olmak istiyorum.",
      )
      .check()
    await page.getByRole("button", { name: "Üyeliği oluştur" }).click()
    await expect(page).toHaveURL(/\/tr\/hesabim$/)

    await page.goto("/tr/hesabim/izinlerim")
    const emailSwitch = page.getByRole("switch", {
      name: /e-posta ile haberdar/,
    })
    const smsSwitch = page.getByRole("switch", { name: /SMS ile haberdar/ })
    await expect(emailSwitch).toBeChecked()
    await expect(smsSwitch).not.toBeChecked()

    const iys = await readdir(OUTBOX).catch(() => [] as string[])
    expect(
      iys.some((f) => f.startsWith("iys-") && f.includes("EPOSTA-ONAY")),
    ).toBe(true)

    await emailSwitch.uncheck()
    await page.getByRole("button", { name: "Değişiklikleri kaydet" }).click()
    await expect(page.getByText("İzinlerin güncellendi.")).toBeVisible()
    await page.reload()
    await expect(
      page.getByRole("switch", { name: /e-posta ile haberdar/ }),
    ).not.toBeChecked()

    // Verilerimi indir: rıza geçmişi dahil JSON
    await page.goto("/tr/hesabim/veri-taleplerim")
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: "Verilerimi indir (JSON)" }).click(),
    ])
    const json = JSON.parse(
      await readFile((await download.path())!, "utf8"),
    ) as {
      customer: { email: string }
      consents: Array<{ purpose: string; granted: boolean }>
    }
    expect(json.customer.email).toBe(email)
    expect(
      json.consents
        .filter((c) => c.purpose === "marketing_email")
        .map((c) => c.granted),
    ).toEqual([true, false])
  })
})

test.describe("ödeme adımındaki yasal onaylar", () => {
  test.skip(({ isMobile }) => isMobile, "Masaüstünde koşar")

  test("onaylar olmadan ödeme butonu pasif; ön bilgilendirmede zorunlu bilgiler var", async ({
    page,
  }) => {
    await page.goto("/tr")
    await rejectCookies(page)
    await addFirstInStock(page, "castor-loafer", {
      color: "Bordo",
      sizes: ["42", "43", "41", "44", "40", "45", "39"],
    })

    await page.goto("/tr/odeme")
    await page
      .getByRole("textbox", { name: "E-posta", exact: true })
      .fill(unique("onay"))
    await page.getByRole("textbox", { name: "Ad", exact: true }).fill("Ali")
    await page.getByRole("textbox", { name: "Soyad", exact: true }).fill("Can")
    await page
      .getByRole("textbox", { name: "Açık adres", exact: true })
      .fill("Örnek Mah. Deneme Sk. No:1")
    await page.getByRole("textbox", { name: "İl", exact: true }).fill("Ankara")
    await page
      .getByRole("textbox", { name: "İlçe", exact: true })
      .fill("Çankaya")
    await page
      .getByRole("button", { name: "Adresi kaydet ve devam et" })
      .click()
    await page.getByRole("button", { name: /Standart Kargo/ }).click()

    const pay = page.getByRole("button", { name: "Siparişi Onayla ve Öde" })
    const pre = page.getByLabel(
      "Ön Bilgilendirme Formu’nu okudum, bilgilendirildim.",
    )
    const dist = page.getByLabel(
      "Mesafeli Satış Sözleşmesi’ni okudum, onaylıyorum.",
    )
    await expect(pre).not.toBeChecked()
    await expect(dist).not.toBeChecked()
    await expect(pay).toBeDisabled()

    const preBox = page.getByTestId("pre-contract")
    await expect(preBox).toContainText("arabulucuya başvurmak zorunludur")
    await expect(preBox).toContainText("İADE KARGO ÜCRETİ SATICIYA AİTTİR")
    await expect(preBox).toContainText("Castor Loafer")
    await expect(preBox).toContainText("Ali Can")
    await expect(page.getByTestId("distance-sales")).toContainText(
      "Mesafeli Satış Sözleşmesi",
    )
    await page.screenshot({
      path: `${SHOTS}/odeme-yasal-onay.png`,
      fullPage: true,
    })

    await pre.check()
    await expect(pay).toBeDisabled()
    await dist.check()
    await expect(pay).toBeEnabled()

    // Uçtan uca: onayla → öde → sipariş + PDF belgeleri
    await pay.click()
    await page.getByRole("link", { name: "Ödemeyi onayla" }).click()
    await expect(page).toHaveURL(/\/tr\/siparis\/order_/)
    const pdf = page.getByRole("link", {
      name: /Ön Bilgilendirme Formu \(PDF\)/,
    })
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      pdf.click(),
    ])
    const bytes = await readFile((await download.path())!)
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-")
    await page.screenshot({
      path: `${SHOTS}/siparis-belgeler.png`,
      fullPage: true,
    })
  })

  test("backend onaysız sepeti tamamlamayı reddeder", async ({ request }) => {
    const pk = await publishableKey()
    const headers = { "x-publishable-api-key": pk }
    const regions = (await (
      await request.get(`${BACKEND}/store/regions`, { headers })
    ).json()) as {
      regions: Array<{ id: string; currency_code: string }>
    }
    const tr = regions.regions.find((r) => r.currency_code === "try")!
    const cart = (await (
      await request.post(`${BACKEND}/store/carts`, {
        headers,
        data: { region_id: tr.id },
      })
    ).json()) as {
      cart: { id: string }
    }
    const res = await request.post(
      `${BACKEND}/store/carts/${cart.cart.id}/complete`,
      { headers },
    )
    expect(res.status()).toBe(400)
    expect(((await res.json()) as { code: string }).code).toBe(
      "legal_acceptance_required",
    )
  })
})

test.describe("yasal sayfalar ve KVKK başvurusu", () => {
  test("KVKK başvurusu referans numarası ve 30 günlük son tarih döner", async ({
    page,
  }) => {
    await page.goto("/tr/yasal/kvkk-basvuru")
    await page.getByRole("button", { name: "Tümünü Reddet" }).click()
    await page.getByLabel("Ad soyad").fill("Deniz Yılmaz")
    await page.getByLabel("E-posta").fill(unique("kvkk"))
    await page.getByLabel("Talep türü").selectOption("delete")
    await page.getByRole("button", { name: "Başvuruyu gönder" }).click()
    await expect(page.getByTestId("dsr-success")).toContainText(
      /ARN-KVKK-2026-[A-F0-9]{6}/,
    )
  })

  test("çerez politikası envanteri otomatik üretilir; EN sayfada bağlayıcı dil notu var", async ({
    page,
  }) => {
    await page.goto("/tr/yasal/cerez-politikasi")
    for (const c of [
      "arion_consent",
      "arion_aid",
      "_arion_cart",
      "arion_metrics",
      "arion_ads",
    ]) {
      await expect(
        page.getByRole("main").getByText(c, { exact: true }),
      ).toBeVisible()
    }
    await page.goto("/en/legal/cookie-policy")
    await expect(
      page.getByText("The Turkish text is legally binding."),
    ).toBeVisible()
    await page.goto("/en/legal/imprint")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Imprint")
  })
})
