import type { MedusaContainer } from "@medusajs/framework/types"
import { snapshotPricesWorkflow } from "../workflows/snapshot-prices"

/** Güvenlik ağı: fiyat değişikliği bir olayla yakalanamadıysa saatlik kontrol. */
export default async function priceHistorySnapshotJob(container: MedusaContainer) {
  await snapshotPricesWorkflow(container).run({ input: {} })
}

export const config = {
  name: "arion-price-history-snapshot",
  schedule: "15 * * * *",
}
