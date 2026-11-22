import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { adminToken, BACKEND, placeOrder, unique } from "./helpers"

/*
 * Faz 4 kabul (Rapor §12):
 *  - İade sihirbazı 14 günü aşan siparişte doğru uyarıyı verir (ayıplı mal yolu açık kalır).
 *  - AI, sağlık sorusunda tavsiye vermeyip yönlendirir.
 *  - Sohbet temsilciye devredilebilir.
 */
const OUTBOX = path.resolve(__dirname, "../../apps/backend/.outbox")

async function lookup(page: Page, no: string, email: string) {
  await page.goto("/tr/yardim/iade")
  await page.getByLabel("Sipariş numarası").fill(no)
  await page.getByLabel("E-posta").fill(email)
  await page.getByRole("button", { name: "Siparişi bul" }).click()
}

test.describe("yardım merkezi", () => {
  test("SSS'de Türkçe duyarlı arama", async ({ page }, info) => {
    await page.goto("/tr/yardim")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Nasıl yardımcı olabiliriz?",
    )
    await page.getByLabel("Yardım merkezinde ara").fill("İADE KARGO")
    await expect(page.getByText(/\d+ sonuç/)).toBeVisible()
    await expect(page.getByText("Nasıl iade ederim?")).toBeVisible()
    await page.screenshot({
      path: `${path.resolve(__dirname, "../../docs/screenshots/faz-4")}/yardim-${info.project.name}.png`,
      fullPage: true,
    })
  })

  test("talep formu bilet numarası verir ve Chatwoot'a (mock) iletilir", async ({
    page,
  }) => {
    await page.goto("/tr/yardim/talep")
    await page.getByLabel("Konu").selectOption("care")
    await page.getByLabel("Ad soyad").fill("Ayşe Kara")
    await page.getByLabel("E-posta").fill(unique("talep"))
    await page
      .getByLabel("Mesajın")
      .fill("Adrastus Oxford pençe yenileme ne kadar sürer?")
    await page.getByRole("button", { name: "Talebi gönder" }).click()
    await expect(page.getByTestId("ticket-success")).toContainText(
      /ARN-DST-2026-[A-F0-9]{6}/,
    )
  })
})

test.describe("sipariş takibi ve iade sihirbazı", () => {
  test.describe.configure({ mode: "serial" })
  test.skip(({ isMobile }) => isMobile, "Masaüstünde koşar")

  const email = unique("iade")
  let order: { id: string; no: string }

  test("giriş yapmadan sipariş takibi", async ({ page }) => {
    order = await placeOrder(page, email)
    await page.goto("/tr/yardim/siparis-takip")
    await page.getByLabel("Sipariş numarası").fill(order.no)
    await page.getByLabel("E-posta").fill("yanlis@example.test")
    await page.getByRole("button", { name: "Siparişi bul" }).click()
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "eşleşen sipariş bulunamadı",
    )
    await page.getByLabel("E-posta").fill(email)
    await page.getByRole("button", { name: "Siparişi bul" }).click()
    await expect(page.getByTestId("tracking-result")).toContainText(
      "DEMO Kargo",
    )
    await expect(page.getByTestId("tracking-result")).toContainText(
      /DMK[A-F0-9]{10}/,
    )
  })

  test("14 gün içinde cayma: ücretsiz iade kodu ve para iadesi tarihi", async ({
    page,
  }) => {
    await lookup(page, order.no, email)
    await expect(
      page.getByText(
        /Siparişin henüz teslim edilmedi|Cayma süren devam ediyor/,
      ),
    ).toBeVisible()
    await page.getByRole("checkbox", { name: /Hephaistos Vulkanize/ }).check()
    await page.getByText("Beğenmedim", { exact: true }).click()
    await page.getByRole("button", { name: "Talebi oluştur" }).click()
    await expect(page.getByTestId("return-success")).toBeVisible()
    await expect(page.getByTestId("return-code")).toHaveText(
      /ARN-IADE-[A-F0-9]{8}/,
    )
    await expect(
      page.getByText("İade kargo ücreti ARION'a aittir.", { exact: false }),
    ).toBeVisible()
    await expect(page.getByText(/Para iadesi en geç:/)).toBeVisible()
  })

  test("14 günü aşan siparişte doğru uyarı; ayıplı mal yolu açık kalır", async ({
    page,
    request,
  }, info) => {
    const token = await adminToken(request)
    const res = await request.post(
      `${BACKEND}/admin/arion/demo/orders/${order.id}/delivered`,
      {
        headers: { authorization: `Bearer ${token}` },
        data: { days_ago: 20 },
      },
    )
    expect(res.ok()).toBe(true)

    await lookup(page, order.no, email)
    const warning = page.getByTestId("withdrawal-expired")
    await expect(warning).toContainText("14 günlük cayma süresi doldu")
    await expect(warning).toContainText("Kusurlu")

    await page.getByRole("checkbox", { name: /Hephaistos Vulkanize/ }).check()
    await page.getByText("Beğenmedim", { exact: true }).click()
    await expect(
      page.getByRole("button", { name: "Talebi oluştur" }),
    ).toBeDisabled()
    await page.screenshot({
      path: `${path.resolve(__dirname, "../../docs/screenshots/faz-4")}/iade-sure-doldu.png`,
      fullPage: true,
    })

    // Sunucu da reddeder (istemci atlatılsa bile)
    const pk = /NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=(pk_[a-f0-9]+)/.exec(
      await readFile(
        path.resolve(__dirname, "../../apps/storefront/.env.local"),
        "utf8",
      ),
    )?.[1]
    const direct = await request.post(`${BACKEND}/store/arion/returns/lookup`, {
      headers: { "x-publishable-api-key": pk ?? "" },
      data: { order_no: order.no, email },
    })
    const items = (
      (await direct.json()) as { order: { items: Array<{ id: string }> } }
    ).order.items
    const rejected = await request.post(`${BACKEND}/store/arion/returns`, {
      headers: { "x-publishable-api-key": pk ?? "" },
      data: {
        order_no: order.no,
        email,
        line_ids: [items[0]!.id],
        reason: "dislike",
        wants_exchange: false,
      },
    })
    expect(rejected.status()).toBe(422)
    expect(((await rejected.json()) as { code: string }).code).toBe(
      "withdrawal_expired",
    )

    // Ayıplı mal: seçimlik hak seçilince talep oluşur
    await page.getByText("Kusurlu", { exact: true }).click()
    await expect(page.getByTestId("defect-path")).toBeVisible()
    await page.getByLabel("Ayıpsız misliyle değişim").check()
    await expect(
      page.getByRole("button", { name: "Talebi oluştur" }),
    ).toBeEnabled()
    await page.getByRole("button", { name: "Talebi oluştur" }).click()
    await expect(page.getByTestId("return-success")).toContainText(
      "Onarım / değişim talebin alındı",
    )
    void info
  })
})

// Areion gösterim amaçlıdır (DECISIONS #087): yapay zekâ bağlantısı yok, yanıtlar hazır metinlerdir
test.describe("Areion gösterim danışmanı", () => {
  test("yapay zekâ API'si kaldırıldı", async ({ request }) => {
    const res = await request.post("/api/areion", {
      data: { locale: "tr", messages: [{ role: "user", text: "Merhaba" }] },
    })
    expect(res.status()).toBe(404)
  })

  test("gösterim amaçlı olduğunu söyler; sağlık sorusunda tavsiye vermez; konu sorusunda bağlantı verir; temsilciye devreder", async ({
    page,
  }, info) => {
    await page.goto("/tr")
    await page.getByRole("button", { name: "Areion'a sor" }).click()
    const chat = page.getByRole("dialog", { name: /Areion/ })
    await expect(chat.getByTestId("ai-disclosure")).toContainText(
      "yapay zekâ ya da dış servis kullanılmaz",
    )

    await chat
      .getByRole("textbox", { name: /Sorunu yaz/ })
      .fill("Halluks valgusum var, ağrıyor. Hangi ayakkabıyı almalıyım?")
    await chat.getByRole("button", { name: "Gönder" }).click()
    const reply = chat.locator("[data-role=assistant]").last()
    await expect(reply).toContainText(
      "Sağlıkla ilgili konularda tavsiye veremem",
    )
    await expect(reply).toContainText("hekime")
    await expect(reply).not.toContainText(
      /halluks valgusunuz var|teşhis edildi/i,
    )

    await chat
      .getByRole("textbox", { name: /Sorunu yaz/ })
      .fill("41 mi 42 mi almalıyım?")
    await chat.getByRole("button", { name: "Gönder" }).click()
    await expect(
      chat
        .locator("[data-role=assistant]")
        .last()
        .getByRole("link", { name: "Ayak İkizi'ni aç" }),
    ).toBeVisible()

    // Temsilciye devir: form + bilet numarası (backend'de gerçek talep açılır)
    const form = chat.getByTestId("handoff-form")
    await expect(form).toBeVisible()
    await form.getByLabel("Ad soyad").fill("Zeynep Er")
    await form.getByLabel("E-posta").fill(unique("devir"))
    await form.getByRole("button", { name: "Temsilciye ilet" }).click()
    await expect(chat.getByTestId("handoff-done")).toContainText(
      /ARN-DST-2026-[A-F0-9]{6}/,
    )
    await page.screenshot({
      path: `${path.resolve(__dirname, "../../docs/screenshots/faz-4")}/areion-${info.project.name}.png`,
    })

    const files = await readdir(OUTBOX)
    expect(files.some((f) => f.startsWith("chatwoot-"))).toBe(true)
  })
})
