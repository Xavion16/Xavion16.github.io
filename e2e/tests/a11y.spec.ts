import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

// WCAG 2.2 AA hedefi (Rapor §7.7). Kritik sayfalarda 0 ihlal beklenir.
const PAGES = [
  "/tr",
  "/en",
  "/tr/manifesto",
  "/en/manifesto",
  "/tr/ayak-ikizi",
  "/tr/yasal/kvkk-aydinlatma",
  "/tr/olmayan-sayfa",
  "/tr/koleksiyon",
  "/tr/koleksiyon/topuklu",
  "/tr/urun/kackar-su-gecirmez-bot",
  "/en/product/bogaz-gunluk-sneaker",
  "/tr/sepet",
  "/tr/odeme",
  "/tr/hesabim/giris",
  "/tr/hesabim/kayit",
  "/tr/yasal/kvkk-basvuru",
  "/tr/yasal/cerez-politikasi",
  "/en/legal/pre-contract-information",
]

for (const url of PAGES) {
  test(`axe: ${url}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto(url)
    await page.evaluate(() => document.fonts.ready)

    const results = await new AxeBuilder({ page })
      .withTags([
        "wcag2a",
        "wcag2aa",
        "wcag21a",
        "wcag21aa",
        "wcag22aa",
        "best-practice",
      ])
      .analyze()

    const summary = results.violations.map(
      (v) =>
        `${v.impact} · ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`,
    )
    expect(summary, summary.join("\n")).toEqual([])
  })
}
