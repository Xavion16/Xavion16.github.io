import { expect, type Page } from "@playwright/test"

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
  await page
    .getByRole("group", { name: /^Renk/ })
    .getByRole("radio", { name: opts.color, exact: true })
    .check({ force: true })
  if (opts.width) {
    await page
      .getByRole("group", { name: /^Genişlik/ })
      .getByRole("radio", { name: opts.width, exact: true })
      .check({ force: true })
  }
  const add = page.getByRole("button", { name: "Sepete ekle" })
  for (const size of opts.sizes) {
    await page
      .getByRole("group", { name: /^Numara/ })
      .getByRole("radio", { name: size, exact: true })
      .check({ force: true })
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
