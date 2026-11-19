import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { findOrderByNumberAndEmail } from "../../../../../lib/order-lookup"
import { eligibility } from "../../../../../lib/returns"
import { getShippingAdapter } from "../../../../../lib/shipping"

const Body = z.object({ order_no: z.string().trim().min(1).max(20), email: z.email().max(200) })

/** POST /store/arion/returns/lookup — iade sihirbazı 1. adım: sipariş + cayma süresi durumu. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: "invalid" })
    return
  }
  const order = await findOrderByNumberAndEmail(req.scope, parsed.data.order_no, parsed.data.email)
  if (!order) {
    res.status(404).json({ code: "not_found" })
    return
  }
  const t = getShippingAdapter().track(order)
  const e = eligibility(new Date(t.expected_delivery_at), t.delivered_at !== null)
  res.json({
    order: { display_id: order.display_id, items: order.items },
    eligibility: {
      delivered: e.delivered,
      delivered_at: e.delivered_at.toISOString(),
      withdrawal_deadline: e.withdrawal_deadline.toISOString(),
      within_withdrawal: e.within_withdrawal,
      days_left: e.days_left,
    },
  })
}
