import "server-only"
import type { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import type { Locale } from "@/i18n/routing"
import { sdk } from "./client"

/** Ödev kapsamında satış Türkiye'ye yapılır (Rapor §4.1): tek bölge, TRY. */
export const getRegion = cache(async (): Promise<HttpTypes.StoreRegion> => {
  const { regions } = await sdk.store.region.list({ fields: "id,name,currency_code,*countries" })
  const tr = regions.find((r) => r.countries?.some((c) => c.iso_2 === "tr"))
  if (!tr) throw new Error("Türkiye bölgesi bulunamadı — backend seed çalıştırıldı mı? (seed-arion.ts)")
  return tr
})

export type Category = { id: string; handle: string; name: string; rank: number }

export const listCategories = cache(async (locale: Locale): Promise<Category[]> => {
  const { product_categories } = await sdk.store.category.list({
    fields: "id,handle,name,rank,metadata",
    limit: 50,
  })
  return product_categories
    .map((c) => ({
      id: c.id,
      handle: c.handle,
      name: localized(c.name, c.metadata, "name_en", locale),
      rank: c.rank ?? 0,
    }))
    .sort((a, b) => a.rank - b.rank)
})

const PRODUCT_FIELDS =
  "id,handle,title,subtitle,description,metadata,thumbnail,*categories,*options,*options.values,*variants,*variants.options,+variants.inventory_quantity,*variants.calculated_price"

export type ProductQuery = { categoryId?: string; limit?: number }

export const listProducts = cache(
  async ({ categoryId, limit = 50 }: ProductQuery = {}): Promise<HttpTypes.StoreProduct[]> => {
    const region = await getRegion()
    const { products } = await sdk.store.product.list({
      region_id: region.id,
      country_code: "tr",
      fields: PRODUCT_FIELDS,
      limit,
      ...(categoryId ? { category_id: [categoryId] } : {}),
    })
    return products
  },
)

export const getProduct = cache(async (handle: string): Promise<HttpTypes.StoreProduct | null> => {
  const region = await getRegion()
  const { products } = await sdk.store.product.list({
    handle,
    region_id: region.id,
    country_code: "tr",
    fields: PRODUCT_FIELDS,
    limit: 1,
  })
  return products[0] ?? null
})

// ── ARION özel uç noktaları ─────────────────────────────────────────────
export type PriceReference = {
  currentPrice: number
  referencePrice: number | null
  discountPercent: number | null
}

export type TestMetric = { key: string; value: number; unit: string; method: string; is_demo: boolean }
export type SizeRow = {
  eu_size: number
  length_mm: number
  ball_width_mm: number
  girth_mm: number
  width_fitting: "N" | "M" | "W"
}

export type ProductDetails = {
  tech: {
    last_code: string
    construction: "cemented" | "goodyear_welt" | "blake" | "vulcanized"
    heel: { height_mm: number; type: string; shank: string; pitch_deg: number } | null
    boot: { waterproof_hours: number; membrane: string; insulation_rating: string; lug_depth_mm: number } | null
    materials: { items: Array<{ part: string; material: string; origin: string }> }
    weight_grams_pair: number
    repairability_score: number
    test_metrics: { metrics: TestMetric[] }
    is_made_to_order: boolean
    lead_time_days: number | null
  } | null
  last: {
    code: string
    name: string
    toe_shape: string
    notes: string | null
    size_table: { rows: SizeRow[] }
  } | null
  price_references: Record<string, PriceReference & { variant_id: string }>
}

export const getProductDetails = cache(async (handle: string): Promise<ProductDetails | null> => {
  try {
    return await sdk.client.fetch<ProductDetails>(
      `/store/arion/products/${encodeURIComponent(handle)}/details`,
    )
  } catch {
    return null
  }
})

export async function getPriceReferences(
  productIds: string[],
): Promise<Record<string, PriceReference | null>> {
  if (productIds.length === 0) return {}
  const { price_references } = await sdk.client.fetch<{
    price_references: Record<string, PriceReference | null>
  }>("/store/arion/price-references", { query: { product_ids: productIds.join(",") } })
  return price_references
}

// ── Yardımcılar ─────────────────────────────────────────────────────────
export function localized(
  tr: string,
  metadata: Record<string, unknown> | null | undefined,
  key: string,
  locale: Locale,
): string {
  if (locale === "tr") return tr
  const v = metadata?.[key]
  return typeof v === "string" && v ? v : tr
}

export function productTitle(p: HttpTypes.StoreProduct, locale: Locale): string {
  return localized(p.title, p.metadata, "title_en", locale)
}

export function productDescription(p: HttpTypes.StoreProduct, locale: Locale): string {
  return localized(p.description ?? "", p.metadata, "description_en", locale)
}

/** En düşük güncel varyant fiyatı (KDV dahil). */
export function minPrice(p: HttpTypes.StoreProduct): number | null {
  const amounts = (p.variants ?? [])
    .map((v) => v.calculated_price?.calculated_amount)
    .filter((a): a is number => typeof a === "number")
  return amounts.length ? Math.min(...amounts) : null
}
