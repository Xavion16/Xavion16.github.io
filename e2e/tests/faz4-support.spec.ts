import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { addFirstInStock } from "./helpers"

/*
 * Faz 4 kabul (Rapor §12):
 *  - İade sihirbazı 14 günü aşan siparişte doğru uyarıyı verir (ayıplı mal yolu açık kalır).
 *  - AI, sağlık sorusunda tavsiye vermeyip yönlendirir.
 *  - Sohbet temsilciye devredilebilir.
 */
const BACKEND = process.env.BACKEND_URL ?? "http://localhost:9000"
const OUTBOX = path.resolve(__dirname, "../../apps/backend/.outbox")
const unique = (p: string) =>
  `${p}+${Date.now()}${Math.floor(Math.random() * 1000)}@example.test`

async function adminToken(request: APIRequestContext): Promise<string> {
  const env = await readFile(
    path.resolve(__dirname, "../../apps/backend/.env"),
    "utf8",
  )
  const email = /ARION_ADMIN_EMAIL=(.+)/.exec(env)?.[1]?.trim() ?? ""
  const password = /ARION_ADMIN_PASSWORD=(.+)/.exec(env)?.[1]?.trim() ?? ""
  const res = await request.post(`${BACKEND}/auth/user/emailpass`, {
    data: { email, password },
  })
  return ((await res.json()) as { token: string }).token
}

async function placeOrder(
  page: Page,
  email: string,
): Promise<{ id: string; no: string }> {
  await addFirstInStock(page, "kadikoy-vulkanize", {
    color: "Ekru",
    sizes: ["41", "42", "40", "43", "39", "44", "38", "45", "37"],
  })
  await page.goto("/tr/odeme")
  await page.getByRole("textbox", { name: "E-posta", exact: true }).fill(email)
  await page.getByRole("textbox", { name: "Ad", exact: true }).fill("Mert")
  await page.getByRole("textbox", { name: "Soyad", exact: true }).fill("Aydın")
  await page
    .getByRole("textbox", { name: "Açık adres", exact: true })
    .fill("Örnek Mah. İade Sk. No:7")
  await page.getByRole("textbox", { name: "İl", exact: true }).fill("İzmir")
  await page.getByRole("textbox", { name: "İlçe", exact: true }).fill("Konak")
  await page.getByRole("button", { name: "Adresi kaydet ve devam et" }).click()
  await page.getByRole("button", { name: /Standart Kargo/ }).click()
  await page
    .getByLabel("Ön Bilgilendirme Formu’nu okudum, bilgilendirildim.")
    .check()
  await page
    .getByLabel("Mesafeli Satış Sözleşmesi’ni okudum, onaylıyorum.")
    .check()
  await page.getByRole("button", { name: "Siparişi Onayla ve Öde" }).click()
  await page.getByRole("link", { name: "Ödemeyi onayla" }).click()
  await expect(page).toHaveURL(/\/tr\/siparis\/order_/)
  const id = /order_[A-Za-z0-9]+/.exec(page.url())![0]
  const no = ((await page.getByTestId("order-number").textContent()) ?? "")
    .replace("#", "")
    .trim()
  return { id, no }
}

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
      .fill("Galata Oxford pençe yenileme ne kadar sürer?")
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
    await page.getByRole("checkbox", { name: /Kadıköy Vulkanize/ }).check()
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

    await page.getByRole("checkbox", { name: /Kadıköy Vulkanize/ }).check()
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

test.describe("Areion AI danışman", () => {
  test("rıza olmadan sohbet API'si çalışmaz", async ({ request }) => {
    const res = await request.post("/api/areion", {
      data: { locale: "tr", messages: [{ role: "user", text: "Merhaba" }] },
    })
    expect(res.status()).toBe(403)
  })

  test("yapay zekâ olduğunu söyler; sağlık sorusunda tavsiye vermez; temsilciye devreder", async ({
    page,
  }, info) => {
    await page.goto("/tr")
    await page.getByRole("button", { name: "Areion'a sor" }).click()
    const chat = page.getByRole("dialog", { name: /Areion/ })
    await expect(chat.getByTestId("ai-disclosure")).toContainText(
      "yapay zekâ asistanıyım, insan değilim",
    )
    await expect(chat.getByTestId("ai-consent")).toBeVisible()
    await chat.getByRole("button", { name: "Kabul ediyorum, başla" }).click()

    await chat
      .getByRole("textbox")
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

    // Temsilciye devir: form + bilet numarası + Chatwoot (mock) konuşması
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
