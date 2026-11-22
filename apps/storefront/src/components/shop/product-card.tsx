import type { HttpTypes } from "@medusajs/types"
import { getLocale, getTranslations } from "next-intl/server"
import Image from "next/image"
import { ShoeDrawing } from "@/components/illustrations/shoe-drawings"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import { CATEGORY_GRADIENT, isCategoryKey } from "@/lib/category-style"
import { productGallery } from "@/lib/imagery"
import { minPrice, productTitle, type PriceReference } from "@/lib/medusa/catalog"
import { COLOR_HEX } from "@/lib/product-colors"
import { Price } from "./price"

const SIZES = "(min-width: 1280px) 25vw, (min-width: 640px) 45vw, 92vw"

/**
 * Ürün kartı (DECISIONS #083): yan görünüm; üzerine gelince üstten görünüme yumuşak geçiş.
 * Altta renk noktaları; rozetler ince altın çizgili, küçük harfli.
 */
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
  const colorValues = (product.options?.find((o) => o.title === "Renk")?.values ?? []).map((v) => v.value)
  const madeToOrder = product.metadata?.made_to_order === true
  const gallery = productGallery(product.handle, colorValues)
  const title = productTitle(product, locale)
  const badge = "rounded-[2px] border border-ember/70 bg-void/70 px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.12em] text-ember uppercase backdrop-blur-sm"

  return (
    <Link
      href={{ pathname: "/urun/[slug]", params: { slug: product.handle } }}
      className="product-card group flex flex-col rounded-[4px] focus-visible:outline-offset-4"
    >
      <span
        className={`relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[4px] ${gallery ? "bg-void" : `bg-gradient-to-br ${CATEGORY_GRADIENT[category]}`}`}
      >
        {gallery ? (
          <>
            <Image
              src={gallery.main}
              alt={t("shotAlt", { name: title })}
              fill
              sizes={SIZES}
              className="object-cover transition-opacity duration-700 group-hover:opacity-0 motion-reduce:transition-none"
            />
            {/* Üzerine gelince: üstten görünüm */}
            <Image
              src={gallery.top}
              alt=""
              fill
              sizes={SIZES}
              className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 motion-reduce:transition-none"
            />
          </>
        ) : (
          <>
            <span aria-hidden="true" className="tech-grid absolute inset-0 opacity-50" />
            <ShoeDrawing
              category={category}
              className="relative w-[82%] text-white transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3"
            />
          </>
        )}
        {reference?.discountPercent && reference.referencePrice ? (
          <span className={`absolute top-3 left-3 ${badge}`}>−%{reference.discountPercent}</span>
        ) : null}
        {madeToOrder ? <span className={`absolute top-3 right-3 ${badge}`}>{t("madeToOrder")}</span> : null}
      </span>
      <span className="mt-4 flex flex-col gap-1 px-1">
        <span className="flex items-start justify-between gap-3">
          <span className="text-lg leading-tight font-medium underline-offset-4 group-hover:underline">{title}</span>
          {colorValues.length > 1 ? (
            <span role="img" className="mt-1.5 flex shrink-0 gap-1.5" aria-label={t("colors", { count: colorValues.length })}>
              {colorValues.map((c) => (
                <span
                  key={c}
                  title={c}
                  className="size-3 rounded-full border border-chalk/40"
                  style={{ backgroundColor: COLOR_HEX[c] ?? "transparent" }}
                />
              ))}
            </span>
          ) : null}
        </span>
        {locale === "tr" && product.subtitle ? <span className="text-sm text-smoke">{product.subtitle}</span> : null}
        <Price amount={minPrice(product)} reference={reference} className="mt-1" />
      </span>
    </Link>
  )
}
