import { model } from "@medusajs/framework/utils"

/**
 * İade / cayma / ayıplı mal talebi (Rapor §8.2, §7.2).
 * Cayma: teslimden itibaren 14 gün, iade kargosu satıcıdan; para iadesi bildirimden itibaren 14 gün.
 * Ayıplı mal: 6502 s.K. m.11 seçimlik hakları (süre sınırı farklı; 14 güne bağlı değil).
 */
const ReturnRequest = model
  .define("return_request", {
    id: model.id({ prefix: "rreq" }).primaryKey(),
    return_no: model.text().unique(),
    order_id: model.text(),
    order_display_id: model.number(),
    email: model.text(),
    /** { items: Array<{ line_id, title, variant, quantity }> } */
    items: model.json(),
    reason: model.enum(["fit", "dislike", "defective", "wrong_item"]),
    path: model.enum(["withdrawal", "defect", "exchange"]),
    defect_remedy: model.enum(["terminate", "discount", "repair", "replace"]).nullable(),
    exchange_note: model.text().nullable(),
    within_withdrawal: model.boolean(),
    delivered_at: model.dateTime(),
    withdrawal_deadline: model.dateTime(),
    /** Ücretsiz iade kargo kodu (satıcı öder) */
    return_code: model.text(),
    status: model.enum(["requested", "in_transit", "received", "refunded", "rejected"]).default("requested"),
    refund_due_at: model.dateTime().nullable(),
    refunded_at: model.dateTime().nullable(),
  })
  .indexes([{ on: ["order_id"] }, { on: ["status", "refund_due_at"] }])

export default ReturnRequest
