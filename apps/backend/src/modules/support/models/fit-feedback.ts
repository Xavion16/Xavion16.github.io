import { model } from "@medusajs/framework/utils"

/**
 * Uyum geri bildirimi — ANONİM (Rapor §8.2: uyum kaynaklı iadeler fit-engine'e geri besleme).
 * Sipariş ya da müşteri kimliği TUTULMAZ; yalnızca ürün, varyant ve sonuç.
 */
const FitFeedback = model.define("fit_feedback", {
  id: model.id({ prefix: "fitfb" }).primaryKey(),
  product_handle: model.text(),
  variant_title: model.text(),
  result: model.enum(["small", "large", "narrow", "wide", "other"]),
})

export default FitFeedback
