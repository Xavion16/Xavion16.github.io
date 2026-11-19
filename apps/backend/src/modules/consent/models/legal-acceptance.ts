import { model } from "@medusajs/framework/utils"

/**
 * Ön bilgilendirme / mesafeli satış onayı (Rapor §7.2). Metin sürümü ve içerik özeti (hash)
 * siparişe bağlanır; böylece müşterinin TAM OLARAK hangi metni onayladığı ispatlanır.
 */
const LegalAcceptance = model
  .define("legal_acceptance", {
    id: model.id({ prefix: "lacc" }).primaryKey(),
    cart_id: model.text(),
    order_id: model.text().nullable(),
    doc_key: model.text(),
    doc_version: model.text(),
    doc_hash: model.text(),
    locale: model.text(),
    email: model.text().nullable(),
    customer_id: model.text().nullable(),
    accepted_at: model.dateTime(),
    ip: model.text().nullable(),
    user_agent: model.text().nullable(),
  })
  .indexes([{ on: ["cart_id"] }, { on: ["order_id"] }])

export default LegalAcceptance
