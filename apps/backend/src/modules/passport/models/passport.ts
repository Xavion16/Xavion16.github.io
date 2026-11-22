import { model } from "@medusajs/framework/utils"

/**
 * Ayakkabı Pasaportu (Rapor §6.4). Ürüne aittir, sahibine DEĞİL: kişisel veri içermez.
 * `dpp` alanı AB Dijital Ürün Pasaportu'na genişleme içindir.
 */
const Passport = model
  .define("passport", {
    id: model.id({ prefix: "pass" }).primaryKey(),
    /** ARN-2026-000123 */
    code: model.text().unique(),
    product_id: model.text(),
    product_handle: model.text(),
    variant_id: model.text().nullable(),
    /** Üretim anındaki seçenekler: { color, size, width } */
    variant_options: model.json(),
    last_code: model.text(),
    craftsman_id: model.text(),
    produced_at: model.dateTime(),
    batch: model.text().nullable(),
    /** AB DPP genişlemesi: { gtin?, carbon_kg?, recycled_share?, ... } */
    dpp: model.json().nullable(),
    is_demo: model.boolean().default(true),
  })
  .indexes([{ on: ["product_id"] }])

export default Passport
