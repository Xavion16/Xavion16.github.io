import type { HttpTypes } from "@medusajs/types"
import { getLocale, getTranslations } from "next-intl/server"
import { ShoeDrawing } from "@/components/illustrations/shoe-drawings"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import { CATEGORY_GRADIENT, isCategoryKey } from "@/lib/category-style"
import { minPrice, productTitle, type PriceReference } from "@/lib/medusa/catalog"
import { Price } from "./price"

export async function ProductCard({
  product,
  reference,
}: {
  product: HttpTypes.StoreProduct
  reference: PriceReference | null | undefined
}) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations("shop.collection")
  const handle = product.categories?.[0]?.handle
  const category = isCategoryKey(handle) ? handle : "sneaker"
  const colors = product.options?.find((o) => o.title === "Renk")?.values?.length ?? 0
  const madeToOrder = product.metadata?.made_to_order === true

  return (
    <Link
      href={{ pathname: "/urun/[slug]", params: { slug: product.handle } }}
      className="group flex flex-col rounded-[28px] focus-visible:outline-offset-4"
    >
      <span
        className={`relative grid aspect-square place-items-center overflow-hidden rounded-[28px] bg-gradient-to-br ${CATEGORY_GRADIENT[category]}`}
      >
        <span aria-hidden="true" className="tech-grid absolute inset-0 opacity-50" />
        <ShoeDrawing
          category={category}
          className="relative w-[82%] text-white transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3"
        />
        {reference?.discountPercent && reference.referencePrice ? (
          <span className="absolute top-4 left-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink">
            −%{reference.discountPercent}
          </span>
        ) : null}
        {madeToOrder ? (
          <span className="glass absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold text-white">
            {t("madeToOrder")}
          </span>
        ) : null}
      </span>
      <span className="mt-4 flex flex-col gap-1 px-1">
        <span className="text-lg leading-tight font-bold group-hover:underline">
          {productTitle(product, locale)}
        </span>
        <span className="text-sm text-smoke">
          {[locale === "tr" ? product.subtitle : null, colors > 1 ? t("colors", { count: colors }) : null]
            .filter(Boolean)
            .join(" · ")}
        </span>
        <Price amount={minPrice(product)} reference={reference} className="mt-1" />
      </span>
    </Link>
  )
}
