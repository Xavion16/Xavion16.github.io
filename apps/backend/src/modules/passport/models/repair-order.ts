import { model } from "@medusajs/framework/utils"

/**
 * Tamir / Geri Al – Yeniden Doğ talebi (Rapor §6.6). Tamamlanan kayıtlar pasaportun tamir geçmişine düşer
 * (pasaport sayfasında yalnızca tür, tarih ve açıklama görünür — kişi bilgisi görünmez).
 */
const RepairOrder = model
  .define("repair_order", {
    id: model.id({ prefix: "rpr" }).primaryKey(),
    /** ARN-TMR-XXXXXX */
    reference: model.text().unique(),
    passport_code: model.text().nullable(),
    customer_id: model.text().nullable(),
    full_name: model.text(),
    email: model.text(),
    type: model.enum(["resole", "heel", "stitch", "clean", "recraft"]),
    description: model.text(),
    /** { items: string[] } — /static/repairs altındaki dosya yolları */
    photos: model.json(),
    status: model.enum(["received", "in_repair", "completed", "cancelled"]).default("received"),
    quote_min: model.number(),
    quote_max: model.number(),
    /** Geri Al – Yeniden Doğ: indirim kredisi (TL) */
    credit_amount: model.number().nullable(),
    shipping_code: model.text(),
    /** Pasaportta görünen kamuya açık not (kişi verisi içermez) */
    public_note: model.text().nullable(),
    completed_at: model.dateTime().nullable(),
  })
  .indexes([{ on: ["passport_code"] }, { on: ["email"] }])

export default RepairOrder
