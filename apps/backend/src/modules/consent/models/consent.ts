import { model } from "@medusajs/framework/utils"

/**
 * Rıza kaydı (Rapor §7.1.3) — YALNIZCA EKLENİR (append-only). Geri çekme de yeni satırdır (granted=false).
 * Güncel durum = amaç başına en son satır. Böylece "ne zaman, hangi metne, hangi kanaldan" ispatlanabilir.
 */
const Consent = model
  .define("consent", {
    id: model.id({ prefix: "cons" }).primaryKey(),
    subject_type: model.enum(["customer", "anonymous"]),
    /** customer_id ya da rastgele anonim tanımlayıcı (arion_aid çerezi) */
    subject_ref: model.text(),
    /** marketing_email | marketing_sms | fit_twin | ai_chat_transfer | cookie_functional | cookie_analytics | cookie_marketing */
    purpose: model.text(),
    granted: model.boolean(),
    text_version: model.text(),
    channel: model.enum(["cookie_banner", "register", "account", "checkout", "other"]),
    ip: model.text().nullable(),
    user_agent: model.text().nullable(),
  })
  .indexes([{ on: ["subject_ref", "purpose", "created_at"] }])

export default Consent
