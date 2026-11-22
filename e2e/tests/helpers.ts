import { expect, type APIRequestContext, type Page } from "@playwright/test"
import { readFile } from "node:fs/promises"
import path from "node:path"

export const BACKEND = process.env.BACKEND_URL ?? "http://localhost:9000"
export const unique = (p: string) =>
  `${p}+${Date.now()}${Math.floor(Math.random() * 1000)}@example.test`

/** Backend .env'deki ARION_ADMIN_* ile yönetici token'ı. */
export async function adminToken(request: APIRequestContext): Promise<string> {
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

/** Misafir olarak (mock ödeme) sipariş verir; sipariş id ve numarasını döner. */
export async function placeOrder(
  page: Page,
  email: string,
  product: {
    handle: string
    color: string
    width?: string
    sizes: string[]
  } = {
    handle: "hephaistos-vulkanize",
    color: "Ekru",
    sizes: ["41", "42", "40", "43", "39", "44", "38", "45", "37"],
  },
): Promise<{ id: string; no: string }> {
  await addFirstInStock(page, product.handle, product)
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

/**
 * Satın alma testleri için: verilen renk (ve varsa genişlik) ile STOKTA olan ilk numarayı seçer
 * ve sepete ekler. Testler her çalıştığında stok azaldığından sabit numara kullanılmaz.
 */
export async function addFirstInStock(
  page: Page,
  handle: string,
  opts: { color: string; width?: string; sizes: string[] },
): Promise<string> {
  await page.goto(`/tr/urun/${handle}`)
  await pick(page, /^Renk/, opts.color)
  if (opts.width) {
    await pick(page, /^Genişlik/, opts.width)
  }
  // Mobil sepet çubuğunda da aynı adlı düğme var (DECISIONS #083): asıl formdakini seç
  const add = page
    .locator("#urun-formu")
    .getByRole("button", { name: "Sepete ekle" })
  for (const size of opts.sizes) {
    await pick(page, /^Numara/, size)
    if (await add.isEnabled()) {
      await add.click()
      await expect(page.getByText("Sepete eklendi.")).toBeVisible()
      return size
    }
  }
  throw new Error(
    `${handle} için stokta numara kalmadı — seed'i yeniden çalıştırın`,
  )
}

/** Çerez banner'ında "Tümünü Reddet" — sunucu aksiyonu tercih çerezini yazana kadar bekler. */
export async function rejectCookies(page: Page) {
  await page
    .getByRole("region", { name: "Çerez tercihin" })
    .getByRole("button", { name: "Tümünü Reddet" })
    .click()
  await expect
    .poll(async () =>
      (await page.context().cookies()).some((c) => c.name === "arion_consent"),
    )
    .toBe(true)
}

/**
 * Görsel olarak gizli (sr-only) radyo seçimi. Koordinatlı "force" tıklama, sayfanın sağ altındaki
 * Areion düğmesine denk gelebiliyor; DOM click React onChange'i tetikler. Hidrasyon öncesi tıklama
 * geri alınabileceği için seçili olana dek tekrarlanır.
 */
export async function pick(page: Page, group: RegExp, name: string) {
  const fieldset = page.getByRole("group", { name: group })
  const radio = fieldset.getByRole("radio", { name, exact: true })
  // Seçili değer legend'da yalnızca React state'inden çizilir: hidrasyonun tuttuğunun kanıtı
  // (native "checked" hidrasyon öncesi de true olur, sonra React tarafından geri alınır)
  const legend = fieldset.locator("legend")
  // Hidrasyon öncesi tıklama native radyoyu işaretler; işaretli radyoya ikinci tıklama "change" üretmez
  // ve React seçimi hiç görmez. Önce React'in girdiye bağlandığını (__reactProps$…) bekle.
  await expect
    .poll(
      () =>
        radio.evaluate((el) =>
          Object.keys(el).some((k) => k.startsWith("__reactProps$")),
        ),
      { timeout: 60_000 },
    )
    .toBe(true)
  await radio.evaluate((el) => (el as HTMLInputElement).click())
  await expect(legend).toContainText(name)
  await expect(radio).toBeChecked()
}
