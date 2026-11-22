import { model } from "@medusajs/framework/utils"

/** Usta (Rapor §9.3). Demo verisi — gerçek kişi değildir. */
const Craftsman = model.define("craftsman", {
  id: model.id({ prefix: "usta" }).primaryKey(),
  name: model.text(),
  /** cutting | closing | lasting | sole | finishing | qc */
  specialty: model.text(),
  /** { tr, en } */
  bio: model.json(),
  since_year: model.number(),
  is_demo: model.boolean().default(true),
})

export default Craftsman
