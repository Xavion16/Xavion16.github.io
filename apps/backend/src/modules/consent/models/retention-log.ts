import { model } from "@medusajs/framework/utils"

/** Saklama-imha işlemlerinin kaydı (Rapor §7.1.7 — imha log'u). */
const RetentionLog = model.define("retention_log", {
  id: model.id({ prefix: "rlog" }).primaryKey(),
  rule: model.text(),
  action: model.enum(["delete", "anonymize", "destroy"]),
  affected: model.number(),
  ran_at: model.dateTime(),
  note: model.text().nullable(),
})

export default RetentionLog
