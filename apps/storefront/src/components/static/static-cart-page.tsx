import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { productGallery } from "@/lib/imagery"
import { listProducts, productTitle } from "@/lib/medusa/catalog"
import { StaticCartView, type StaticVariant } from "./static-cart-view"

/** Statik yayının sepet sayfası (DECISIONS #087): katalog derleme anında, sepet tarayıcıda. */
export default async function StaticCartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("shop.cart")
  const ts = await getTranslations("shop.staticCart")
  const products = await listProducts({})

  const catalog: Record<string, StaticVariant> = {}
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

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8">
      <h1 className="condensed text-headline">{t("title")}</h1>
      <StaticCartView
        catalog={catalog}
        locale={locale}
        labels={{
          title: t("title"),
          empty: t("empty"),
          emptyCta: t("emptyCta"),
          remove: t("remove"),
          decrease: t("decrease"),
          increase: t("increase"),
          subtotal: t("subtotal"),
          shipping: t("shipping"),
          shippingFree: ts("shippingFree"),
          total: t("total"),
          checkout: ts("checkout"),
          demoNote: ts("demoNote"),
          doneTitle: ts("doneTitle"),
          doneBody: ts("doneBody"),
          continue: t("continue"),
        }}
      />
    </div>
  )
}
