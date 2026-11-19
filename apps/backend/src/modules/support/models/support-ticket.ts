import { model } from "@medusajs/framework/utils"

/** Destek talebi (Rapor §8). Chatwoot konuşmasıyla external_ref üzerinden eşlenir. */
const SupportTicket = model
  .define("support_ticket", {
    id: model.id({ prefix: "stk" }).primaryKey(),
    ticket_no: model.text().unique(),
    channel: model.enum(["form", "chat", "email", "phone"]),
    topic: model.enum(["size_fit", "order", "shipping", "return", "payment", "care", "kvkk", "other"]),
    message: model.text(),
    full_name: model.text(),
    email: model.text(),
    customer_id: model.text().nullable(),
    order_ref: model.text().nullable(),
    status: model.enum(["open", "pending", "resolved"]).default("open"),
    /** Maskelenmiş sohbet dökümü (AI'dan devredilen konuşmalar) */
    transcript: model.json().nullable(),
    external_ref: model.text().nullable(),
    first_response_at: model.dateTime().nullable(),
    resolved_at: model.dateTime().nullable(),
  })
  .indexes([{ on: ["status", "created_at"] }, { on: ["email"] }])

export default SupportTicket
