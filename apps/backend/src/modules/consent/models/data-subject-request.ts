import { model } from "@medusajs/framework/utils"

/** KVKK m.11 ilgili kişi başvurusu — 30 gün yanıt süresi (Rapor §7.1.5). */
const DataSubjectRequest = model
  .define("data_subject_request", {
    id: model.id({ prefix: "dsr" }).primaryKey(),
    reference: model.text().unique(),
    type: model.enum(["info", "export", "correct", "delete", "object", "other"]),
    status: model.enum(["received", "verifying", "in_progress", "resolved", "rejected"]).default("received"),
    full_name: model.text(),
    email: model.text(),
    customer_id: model.text().nullable(),
    details: model.text().nullable(),
    received_at: model.dateTime(),
    due_at: model.dateTime(),
    resolved_at: model.dateTime().nullable(),
    resolution_note: model.text().nullable(),
  })
  .indexes([{ on: ["email"] }, { on: ["status", "due_at"] }])

export default DataSubjectRequest
