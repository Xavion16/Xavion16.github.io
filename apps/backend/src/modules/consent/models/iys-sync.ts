import { model } from "@medusajs/framework/utils"

/** İleti Yönetim Sistemi senkronizasyon kaydı (Rapor §7.4). MVP: mock adapter. */
const IysSync = model.define("iys_sync", {
  id: model.id({ prefix: "iys" }).primaryKey(),
  channel: model.enum(["EPOSTA", "MESAJ"]),
  recipient: model.text(),
  status: model.enum(["ONAY", "RET"]),
  source: model.text(),
  mode: model.enum(["mock", "live"]),
  synced_at: model.dateTime(),
  response: model.text().nullable(),
})

export default IysSync
