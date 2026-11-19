import { model } from "@medusajs/framework/utils"

/**
 * Fiyat geçmişi (Rapor §7.3). Üstü çizili "eski fiyat" YALNIZCA bu tablodan hesaplanır;
 * yönetim panelinde elle girilen bir "eski fiyat" alanı yoktur.
 */
const PriceHistoryEntry = model
  .define("price_history_entry", {
    id: model.id({ prefix: "phist" }).primaryKey(),
    variant_id: model.text(),
    currency_code: model.text(),
    amount: model.bigNumber(),
    valid_from: model.dateTime(),
    valid_to: model.dateTime().nullable(),
  })
  .indexes([{ on: ["variant_id", "currency_code", "valid_from"] }])

export default PriceHistoryEntry
