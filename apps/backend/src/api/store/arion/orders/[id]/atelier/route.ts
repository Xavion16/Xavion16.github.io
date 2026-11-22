import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { atelierTimeline, STEP_SPECIALTY } from "../../../../../../lib/atelier"
import { PASSPORT_MODULE } from "../../../../../../modules/passport"
import type PassportModuleService from "../../../../../../modules/passport/service"

/**
 * GET /store/arion/orders/:id/atelier — "Atölyede üretilir" kalemler için zaman çizelgesi (Rapor §6.5).
 * Sipariş kimliği tahmin edilemez (order_…); yanıtta kişisel veri yoktur.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "order",
    fields: ["id", "created_at", "items.product_id"],
    filters: { id: req.params.id },
  })
  const order = data[0]
  if (!order) {
    res.status(404).json({ message: "not_found" })
    return
  }
  const productIds = [...new Set((order.items ?? []).flatMap((i) => (i?.product_id ? [i.product_id] : [])))]
  if (!productIds.length) {
    res.json({ items: [] })
    return
  }
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "product_tech.is_made_to_order", "product_tech.lead_time_days"],
    filters: { id: productIds },
  })
  const svc: PassportModuleService = req.scope.resolve(PASSPORT_MODULE)
  const craftsmen = await svc.listArtisans({})
  const bySpecialty: Record<string, string> = Object.fromEntries(craftsmen.map((c) => [c.specialty, c.name]))

  const items = products.flatMap((p) => {
    const lead = p.product_tech?.is_made_to_order ? p.product_tech.lead_time_days : null
    if (!lead) return []
    const t = atelierTimeline(order.created_at as Date, lead)
    return [
      {
        product_id: p.id,
        title: p.title,
        due_at: t.due_at,
        lead_time_days: t.lead_time_days,
        steps: t.steps.map((s) => ({ ...s, craftsman: bySpecialty[STEP_SPECIALTY[s.code]] ?? null })),
      },
    ]
  })
  res.json({ items })
}
