import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRICE_HISTORY_MODULE } from "../../modules/price-history"
import type PriceHistoryModuleService from "../../modules/price-history/service"

export type SnapshotInput = { variant_ids?: string[] }

type VariantPriceRow = {
  id: string
  prices?: Array<{
    amount: number | string
    currency_code: string
    min_quantity?: number | null
    max_quantity?: number | null
    rules_count?: number | null
  } | null> | null
}

const CURRENCY = "try"

/**
 * Varyantların güncel taban TRY fiyatını price_history'ye işler:
 * fiyat değiştiyse açık kaydı kapatır (valid_to = şimdi) ve yenisini açar.
 */
export const snapshotVariantPricesStep = createStep(
  "snapshot-variant-prices",
  async (input: SnapshotInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const history: PriceHistoryModuleService = container.resolve(PRICE_HISTORY_MODULE)

    const { data } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "prices.amount",
        "prices.currency_code",
        "prices.min_quantity",
        "prices.max_quantity",
        "prices.rules_count",
      ],
      filters: input.variant_ids?.length ? { id: input.variant_ids } : {},
    })

    const now = new Date()
    let opened = 0
    for (const variant of data as VariantPriceRow[]) {
      const base = (variant.prices ?? []).find(
        (p) =>
          p !== null &&
          p.currency_code === CURRENCY &&
          !p.min_quantity &&
          !p.max_quantity &&
          !p.rules_count,
      )
      if (!base) continue
      const amount = Number(base.amount)

      const [open] = await history.listPriceHistoryEntries(
        { variant_id: variant.id, currency_code: CURRENCY, valid_to: null },
        { order: { valid_from: "DESC" }, take: 1 },
      )
      if (open && Number(open.amount) === amount) continue
      if (open) {
        await history.updatePriceHistoryEntries({ id: open.id, valid_to: now })
      }
      await history.createPriceHistoryEntries({
        variant_id: variant.id,
        currency_code: CURRENCY,
        amount,
        valid_from: now,
        valid_to: null,
      })
      opened++
    }
    return new StepResponse({ opened })
  },
)
