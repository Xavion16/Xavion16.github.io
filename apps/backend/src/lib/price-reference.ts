import {
  computeReferencePrice,
  referenceDaysFromEnv,
  type ReferencePriceResult,
} from "@arion/pricing-rules"
import type { MedusaContainer } from "@medusajs/framework/types"
import { PRICE_HISTORY_MODULE } from "../modules/price-history"
import type PriceHistoryModuleService from "../modules/price-history/service"

export type VariantReference = ReferencePriceResult & { variant_id: string }

const CURRENCY = "try"

/**
 * Varyantların yasal referans fiyatlarını YALNIZCA price_history tablosundan hesaplar (Rapor §7.3).
 * Gün sayısı DISCOUNT_REFERENCE_DAYS ortam değişkeninden gelir (varsayılan 10).
 */
export async function referencePricesForVariants(
  container: MedusaContainer,
  variantIds: string[],
  now: Date = new Date(),
): Promise<Record<string, VariantReference>> {
  if (variantIds.length === 0) return {}
  const history: PriceHistoryModuleService = container.resolve(PRICE_HISTORY_MODULE)
  const entries = await history.listPriceHistoryEntries(
    { variant_id: variantIds, currency_code: CURRENCY },
    { order: { valid_from: "ASC" } },
  )
  const days = referenceDaysFromEnv(process.env.DISCOUNT_REFERENCE_DAYS)

  const byVariant = new Map<string, typeof entries>()
  for (const e of entries) {
    const list = byVariant.get(e.variant_id) ?? []
    list.push(e)
    byVariant.set(e.variant_id, list)
  }

  const out: Record<string, VariantReference> = {}
  for (const [variantId, list] of byVariant) {
    const result = computeReferencePrice(
      list.map((e) => ({
        price: Number(e.amount),
        validFrom: new Date(e.valid_from),
        validTo: e.valid_to ? new Date(e.valid_to) : null,
      })),
      now,
      days,
    )
    if (result) out[variantId] = { ...result, variant_id: variantId }
  }
  return out
}

/** Ürün düzeyi özet: en ucuz güncel varyantın referansı (liste kartları için). */
export function cheapestReference(
  refs: VariantReference[],
): Pick<ReferencePriceResult, "currentPrice" | "referencePrice" | "discountPercent"> | null {
  const sorted = [...refs].sort((a, b) => a.currentPrice - b.currentPrice)
  const first = sorted[0]
  if (!first) return null
  return {
    currentPrice: first.currentPrice,
    referencePrice: first.referencePrice,
    discountPercent: first.discountPercent,
  }
}
