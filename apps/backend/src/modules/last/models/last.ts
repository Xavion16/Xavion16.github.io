import { model } from "@medusajs/framework/utils"

/**
 * Kalıp (Last): ayakkabının şekillendirildiği form ve milimetrik ölçü tablosu (Rapor §9.3).
 * Uyum motoru numarayla değil, bu tablodaki milimetrelerle çalışır.
 */
const Last = model.define("last", {
  id: model.id({ prefix: "last" }).primaryKey(),
  code: model.text().unique(),
  name: model.text(),
  category: model.text(),
  toe_shape: model.enum(["round", "almond", "square", "pointed"]),
  /** { rows: Array<{ eu_size, length_mm, ball_width_mm, girth_mm, width_fitting: "N"|"M"|"W" }> } */
  size_table: model.json(),
  notes: model.text().nullable(),
  is_demo: model.boolean().default(true),
})

export default Last
