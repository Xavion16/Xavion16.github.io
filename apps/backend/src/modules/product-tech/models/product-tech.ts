import { model } from "@medusajs/framework/utils"

/**
 * Kategoriye özel teknik özellikler — product.metadata yerine tipli tablo (Rapor §9.3).
 * Ürünle module link üzerinden bağlanır (src/links/product-tech.ts).
 */
const ProductTech = model.define("product_tech", {
  id: model.id({ prefix: "ptech" }).primaryKey(),
  last_code: model.text(),
  construction: model.enum(["cemented", "goodyear_welt", "blake", "vulcanized"]),
  /** { height_mm, type, shank: "steel"|"composite"|"none", pitch_deg } — sadece topuklu */
  heel: model.json().nullable(),
  /** { waterproof_hours, membrane, insulation_rating, lug_depth_mm } — sadece bot */
  boot: model.json().nullable(),
  /** { items: Array<{ part, material, origin }> } */
  materials: model.json(),
  weight_grams_pair: model.number(),
  /** 0–10 */
  repairability_score: model.number(),
  /** Dayanıklılık Kartı: { metrics: Array<{ key, value, unit, method, is_demo }> } (Rapor §6.3) */
  test_metrics: model.json(),
  is_made_to_order: model.boolean().default(false),
  lead_time_days: model.number().nullable(),
})

export default ProductTech
