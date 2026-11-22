import "server-only"
import type { Locale } from "@/i18n/routing"
import { productGallery } from "@/lib/imagery"
import { listProducts, productTitle } from "@/lib/medusa/catalog"
import type { StaticCatalog } from "./static-order"

/** Statik sepet ve ödeme için varyant → ürün bilgisi (derleme anındaki katalogdan, DECISIONS #087) */
export async function buildStaticCatalog(locale: Locale): Promise<StaticCatalog> {
  const products = await listProducts({})
  const catalog: StaticCatalog = {}
  for (const p of products) {
    const colors = p.options?.find((o) => o.title === "Renk")?.values?.map((v) => v.value) ?? []
    const gallery = productGallery(p.handle, colors)
    for (const v of p.variants ?? []) {
      const color = v.options?.find((o) => o.option?.title === "Renk")?.value
      catalog[v.id] = {
        title: productTitle(p, locale),
        handle: p.handle,
        options: (v.options ?? []).map((o) => o.value).join(" · "),
        price: v.calculated_price?.calculated_amount ?? null,
        image: gallery ? ((color && gallery.byColor[color]) ?? gallery.main) : null,
      }
    }
  }
  return catalog
}
