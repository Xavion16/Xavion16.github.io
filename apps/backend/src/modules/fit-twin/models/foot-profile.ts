import { model } from "@medusajs/framework/utils"

/**
 * Ayak İkizi (Rapor §6.1, §9.3) — özel nitelikli veri gibi korunur.
 * Ölçüler YALNIZCA şifreli (`sealed`) tutulur; düz metin sütun yoktur. Misafir profili hiç saklanmaz.
 * Silme kalıcıdır (soft delete değil): bkz. FitTwinModuleService.purge.
 */
const FootProfile = model.define("foot_profile", {
  id: model.id({ prefix: "foot" }).primaryKey(),
  customer_id: model.text().unique(),
  /** AES-256-GCM: { lengthMm, ballWidthMm, girthMm?, archType, preference, method } */
  sealed: model.text(),
  /** Kaydı mümkün kılan açık rıza metninin sürümü */
  consent_version: model.text(),
})

export default FootProfile
