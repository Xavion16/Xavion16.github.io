import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { quoteRepair, REPAIR_TYPES } from "../../../../../lib/repairs"
import { PASSPORT_MODULE } from "../../../../../modules/passport"
import type PassportModuleService from "../../../../../modules/passport/service"

const Query = z.object({
  type: z.enum(REPAIR_TYPES),
  passport_code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^ARN-\d{4}-\d{6}$/)
    .optional(),
})

/** GET /store/arion/repairs/quote — talep göndermeden ücret tahmini (DEMO). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const parsed = Query.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ message: "invalid" })
    return
  }
  let construction: string | null = null
  let repairability: number | null = null
  let product: string | null = null
  if (parsed.data.passport_code) {
    const svc: PassportModuleService = req.scope.resolve(PASSPORT_MODULE)
    const [passport] = await svc.listPassports({ code: parsed.data.passport_code })
    if (!passport) {
      res.status(404).json({ message: "passport_not_found" })
      return
    }
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "product",
      fields: ["title", "product_tech.construction", "product_tech.repairability_score"],
      filters: { id: passport.product_id },
    })
    construction = data[0]?.product_tech?.construction ?? null
    repairability = data[0]?.product_tech?.repairability_score ?? null
    product = data[0]?.title ?? null
  }
  res.json({ quote: quoteRepair(parsed.data.type, construction, repairability), construction, product })
}
