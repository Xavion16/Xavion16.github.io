import { expect, test, type Page } from "@playwright/test"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { Client } from "pg"
import { adminToken, BACKEND, placeOrder, unique } from "./helpers"

/*
 * Faz 5 kabul (Rapor §12):
 *  - Ayak İkizi misafir modunda hiçbir şey saklamıyor (sunucuya istek yok).
 *  - Üye modunda açık rıza olmadan kaydetmiyor.
 *  - Sil butonu veriyi gerçekten siliyor (DB testi).
 *  - Ürün stüdyo görseli mobilde ≤ 3 sn'de görünüyor (3D kaldırıldı, #081).
 */
const SHOTS = path.resolve(__dirname, "../../docs/screenshots/faz-5")
const GUEST_PROFILE = {
  method: "manual",
  lengthMm: 266,
  ballWidthMm: 113,
  girthMm: null,
  archType: "normal",
  preference: "regular",
}

async function db(): Promise<Client> {
  const env = await readFile(
    path.resolve(__dirname, "../../apps/backend/.env"),
    "utf8",
  )
  const url = /DATABASE_URL=(.+)/.exec(env)?.[1]?.trim()
  const c = new Client({ connectionString: url })
  await c.connect()
  return c
}

async function runWizard(page: Page, length = "266", width = "113") {
  await page.goto("/tr/ayak-ikizi")
  const next = page.getByTestId("fit-next")
  await next.click()
  await page.getByLabel("Uzunluk (mm)").fill(length)
  await next.click()
  await page.getByLabel("Genişlik (mm)").fill(width)
  await next.click()
  await next.click()
  await next.click()
  await expect(page.getByTestId("fit-result")).toBeVisible()
}

async function withGuestProfile(page: Page) {
  await page.addInitScript((p) => {
    window.sessionStorage.setItem("arion_fit_twin_guest", JSON.stringify(p))
  }, GUEST_PROFILE)
}

test.describe("Ayak İkizi", () => {
  test("misafir modunda ölçüler sunucuya gönderilmez, öneriler tarayıcıda hesaplanır", async ({
    page,
  }) => {
    const sent: string[] = []
    page.on("request", (r) => {
      if (r.method() !== "GET" || /fit-twin/.test(r.url()))
        sent.push(`${r.method()} ${r.url()}`)
    })
    await runWizard(page)
    const recos = page.getByTestId("fit-reco")
    await expect(recos.first()).toBeVisible()
    await expect(recos.first()).toContainText("Zephyros Koşu")
    await expect(recos.first()).toContainText("Önerilen: 42 W")
    await expect(recos.first()).toContainText("W (geniş) seçeneğini öneriyoruz")
    // Misafir: kayıt alanı yok, yalnızca "bu sekmede" bilgisi
    await expect(page.getByText("Bu sekmede saklanıyor")).toBeVisible()
    await expect(page.getByTestId("fit-save")).toHaveCount(0)
    expect(sent).toEqual([])
    await page.screenshot({
      path: `${SHOTS}/ayak-ikizi-sonuc.png`,
      fullPage: true,
    })
  })

  test("üye: rıza olmadan kaydetmez; rızayla şifreli kaydeder; sil gerçekten siler (DB)", async ({
    page,
  }) => {
    const email = unique("ikiz")
    await page.goto("/tr/hesabim/kayit")
    await page.getByRole("textbox", { name: "Ad", exact: true }).fill("Deniz")
    await page.getByRole("textbox", { name: "Soyad", exact: true }).fill("Ak")
    await page
      .getByRole("textbox", { name: "E-posta", exact: true })
      .fill(email)
    await page.getByLabel("Şifre").fill("Arion-test-2026")
    await page.getByLabel(/Üyelik Sözleşmesi/).check()
    await page.getByRole("button", { name: "Üyeliği oluştur" }).click()
    await expect(page).toHaveURL(/\/tr\/hesabim$/)

    const c = await db()
    try {
      const { rows } = await c.query<{ id: string }>(
        "select id from customer where email = $1 and deleted_at is null",
        [email],
      )
      const customerId = rows[0]!.id
      const count = async () =>
        Number(
          (
            await c.query(
              "select count(*) from foot_profile where customer_id = $1",
              [customerId],
            )
          ).rows[0].count,
        )

      await runWizard(page, "258", "101")
      // Rıza kutusu varsayılan işaretsiz
      await expect(page.getByTestId("fit-consent")).not.toBeChecked()
      await page.getByTestId("fit-save").click()
      await expect(
        page.getByRole("alert").filter({ hasText: "açık rıza" }),
      ).toBeVisible()
      expect(await count()).toBe(0)

      await page.getByTestId("fit-consent").check()
      await page.getByTestId("fit-save").click()
      await expect(page.getByTestId("fit-saved")).toBeVisible()
      await expect.poll(count).toBe(1)
      const sealed = (
        await c.query<{ sealed: string }>(
          "select sealed from foot_profile where customer_id = $1",
          [customerId],
        )
      ).rows[0]!.sealed
      // Ölçüler düz metin değil (AES-256-GCM)
      expect(sealed.startsWith("v1:")).toBe(true)
      expect(sealed).not.toContain("258")
      const consent = await c.query<{ granted: boolean }>(
        "select granted from consent where subject_ref = $1 and purpose = 'fit_twin' order by created_at desc limit 1",
        [customerId],
      )
      expect(consent.rows[0]!.granted).toBe(true)

      // Hesabım'da görünür (sunucuda şifresi çözülür)
      await page.goto("/tr/hesabim")
      await expect(page.getByTestId("account-fit-twin")).toContainText(
        "Uzunluk 258 mm",
      )

      // Sil → satır gerçekten kalkar (soft delete dahil hiçbir kayıt kalmaz) ve rıza geri alınır
      await page.goto("/tr/ayak-ikizi")
      page.once("dialog", (d) => void d.accept())
      await page.getByTestId("fit-delete").click()
      await expect(
        page.getByText("Ayak İkizin kalıcı olarak silindi."),
      ).toBeVisible()
      await expect.poll(count).toBe(0)
      const after = await c.query<{ granted: boolean }>(
        "select granted from consent where subject_ref = $1 and purpose = 'fit_twin' order by created_at desc limit 1",
        [customerId],
      )
      expect(after.rows[0]!.granted).toBe(false)
    } finally {
      await c.end()
    }
  })

  test("ürün sayfasında uyum skoru ve önerilen numara", async ({ page }) => {
    await page.goto("/tr/urun/zephyros-kosu")
    await expect(page.getByTestId("product-fit-cta")).toBeVisible()
    await withGuestProfile(page)
    await page.reload()
    await expect(page.getByTestId("product-fit")).toBeVisible()
    await expect(page.getByTestId("product-fit-size")).toContainText("42")
    await expect(page.getByTestId("product-fit-size")).toContainText("W")
  })

  test("koleksiyonda 'Bana uyanlar' filtresi ve uyuma göre sıralama", async ({
    page,
  }) => {
    await withGuestProfile(page)
    await page.goto("/tr/koleksiyon?uyum=1")
    await expect(page.getByTestId("fits-me")).toBeChecked()
    const grid = page.getByTestId("product-grid")
    await expect(grid.locator("[data-handle]").first()).toHaveAttribute(
      "data-handle",
      "zephyros-kosu",
    )
    const scores = await grid.getByTestId("fit-badge").allTextContents()
    const nums = scores.map((s) => Number(s.replace(/\D/g, "")))
    expect(nums.length).toBeGreaterThan(0)
    expect(nums.every((n) => n >= 70)).toBe(true)
    expect([...nums].sort((a, b) => b - a)).toEqual(nums)
    await page.getByTestId("fits-me").uncheck()
    await expect
      .poll(() => grid.locator("[data-handle]").count())
      .toBeGreaterThan(nums.length)
    await page.screenshot({ path: `${SHOTS}/koleksiyon-bana-uyanlar.png` })
  })
})

// 3D görünüm kaldırıldı (DECISIONS #081): ürün sahnesi stüdyo görselidir, anatomi metin olarak anlatılır
test.describe("Ürün sayfası: stüdyo görseli ve anatomi", () => {
  test("mobilde ürün görseli ≤ 3 sn'de görünür, 3D/AR yok", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const started = Date.now()
    await page.goto("/tr/urun/olympos-dag-botu", { waitUntil: "commit" })
    const stage = page.getByTestId("stage-photo")
    await expect(stage).toBeVisible({ timeout: 3000 })
    expect(Date.now() - started).toBeLessThanOrEqual(3000)
    await expect(stage.locator("img")).toHaveAttribute(
      "src",
      /olympos-dag-botu\.webp/,
    )
    await expect(page.locator("model-viewer, canvas")).toHaveCount(0)
    await expect(page.getByTestId("stage-ar")).toHaveCount(0)
  })

  test("Anatomi: katmanlar metin olarak anlatılır; dayanıklılık karşılaştırması görünür", async ({
    page,
  }) => {
    await page.goto("/tr/urun/olympos-dag-botu")
    const anatomy = page.locator("#anatomi")
    await expect(anatomy.getByText(/Şank/).first()).toBeVisible()
    await expect(anatomy.getByText(/membran/i).first()).toBeVisible()
    await expect(page.getByTestId("durability-compare")).toBeVisible()
  })
})

test.describe("Pasaport, Ömür Planı, Şeffaflık, Atölye", () => {
  test("pasaport sayfası tamir geçmişiyle açılır; bilinmeyen kod 404; admin QR PDF", async ({
    page,
    request,
  }) => {
    await page.goto("/tr/pasaport/ARN-2026-000123")
    await expect(page.getByTestId("passport-code")).toHaveText(
      "ARN-2026-000123",
    )
    await expect(page.getByTestId("repair-history")).toContainText(
      "Taban değişimi",
    )
    await expect(page.getByText("kişisel veri içermez")).toBeVisible()
    // Kişisel veri yok: demo müşteri adı/e-postası pasaportta görünmez
    await expect(page.getByText("demo-musteri@arion.example")).toHaveCount(0)
    await page.screenshot({ path: `${SHOTS}/pasaport.png`, fullPage: true })

    const res = await page.goto("/tr/pasaport/ARN-2026-999999")
    expect(res?.status()).toBe(404)

    const token = await adminToken(request)
    const pdf = await request.get(
      `${BACKEND}/admin/arion/passports/ARN-2026-000123/label`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    expect(pdf.status()).toBe(200)
    expect(pdf.headers()["content-type"]).toContain("application/pdf")
    expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-")
  })

  test("tamir talebi: ücret tahmini ve ücretsiz gönderim kodu", async ({
    page,
  }) => {
    await page.goto("/tr/omur-plani?pasaport=ARN-2026-000123")
    const form = page.getByTestId("repair-form")
    await expect(form.getByLabel("Pasaport kodu (isteğe bağlı)")).toHaveValue(
      "ARN-2026-000123",
    )
    await form.getByRole("button", { name: "Ücret tahmini al" }).click()
    await expect(page.getByTestId("repair-quote")).toContainText(
      "Tahmini ücret",
    )
    await form
      .getByLabel("Sorunu kısaca anlat")
      .fill("Ön taban aşındı, topukta dikiş açılmaya başladı.")
    await form.getByLabel("Ad soyad").fill("Ece Kaya")
    await form.getByLabel("E-posta").fill(unique("tamir"))
    await page.getByTestId("repair-submit").click()
    await expect(page.getByTestId("repair-success")).toBeVisible()
    await expect(page.getByTestId("repair-reference")).toHaveText(
      /^ARN-TMR-[0-9A-F]{6}$/,
    )
    await expect(page.getByTestId("repair-shipping")).toHaveText(
      /^ARN-KRG-[0-9A-F]{8}$/,
    )
  })

  test("Şeffaflık Paneli veritabanından hesaplanan metrikleri gösterir", async ({
    page,
  }) => {
    await page.goto("/tr/seffaflik")
    for (const id of ["iade", "tamir", "geri-al", "omur", "yanit"]) {
      await expect(page.getByTestId(`metric-${id}`)).toBeVisible()
    }
    await expect(page.getByTestId("metric-tamir")).toContainText(/\d/)
    await expect(page.getByText("DEMO ortamı")).toBeVisible()
  })

  test("atölyede üretilen siparişte 7 adımlı Atölye Takibi", async ({
    page,
  }) => {
    await placeOrder(page, unique("atolye"), {
      handle: "adrastus-oxford",
      color: "Siyah",
      width: "M",
      sizes: ["42", "41", "43", "40", "44"],
    })
    const tl = page.getByTestId("atelier-timeline")
    await expect(tl).toBeVisible()
    await expect(tl.getByRole("listitem")).toHaveCount(7)
    await expect(tl.locator("[aria-current=step]")).toHaveCount(1)
    await expect(tl).toContainText("Kalıba çekme")
  })

  test("Atölye sayfası ustaları ve son pasaportları listeler", async ({
    page,
  }) => {
    await page.goto("/tr/atolye")
    await expect(page.getByText("Hüseyin Demir", { exact: true })).toBeVisible()
    await page.getByRole("link", { name: "ARN-2026-000123" }).click()
    await expect(page.getByTestId("passport-code")).toHaveText(
      "ARN-2026-000123",
    )
  })
})
