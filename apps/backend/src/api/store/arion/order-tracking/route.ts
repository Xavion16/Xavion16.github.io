import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { findOrderByNumberAndEmail } from "../../../../lib/order-lookup"
import { getShippingAdapter } from "../../../../lib/shipping"

const Body = z.object({ order_no: z.string().trim().min(1).max(20), email: z.email().max(200) })

/** POST /store/arion/order-tracking — giriş gerektirmeyen sipariş takibi (sipariş no + e-posta). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: "invalid", message: "Sipariş no ve e-posta gerekli" })
    return
  }
  const order = await findOrderByNumberAndEmail(req.scope, parsed.data.order_no, parsed.data.email)
  if (!order) {
    res.status(404).json({ code: "not_found", message: "Bu bilgilerle eşleşen sipariş bulunamadı" })
    return
  }
  const tracking = getShippingAdapter().track(order)
  res.json({
    order: {
      display_id: order.display_id,
      created_at: order.created_at,
      items: order.items.map(({ title, variant_title, quantity }) => ({ title, variant_title, quantity })),
    },
    tracking,
  })
}
