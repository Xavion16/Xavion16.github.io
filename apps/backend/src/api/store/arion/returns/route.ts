import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { findOrderByNumberAndEmail } from "../../../../lib/order-lookup"
import { decide, eligibility } from "../../../../lib/returns"
import { getShippingAdapter } from "../../../../lib/shipping"
import { createReturnRequestWorkflow } from "../../../../workflows/support"

const Body = z.object({
  order_no: z.string().trim().min(1).max(20),
  email: z.email().max(200),
  line_ids: z.array(z.string().regex(/^ordli_[A-Za-z0-9]+$/)).min(1).max(20),
  reason: z.enum(["fit", "dislike", "defective", "wrong_item"]),
  wants_exchange: z.boolean().default(false),
  defect_remedy: z.enum(["terminate", "discount", "repair", "replace"]).nullable().optional(),
  exchange_note: z.string().trim().max(500).nullable().optional(),
  fit_result: z.enum(["small", "large", "narrow", "wide", "other"]).nullable().optional(),
})

/**
 * POST /store/arion/returns — iade / cayma / ayıplı mal talebi.
 * Cayma süresi (14 gün) SUNUCUDA kontrol edilir; süre dolduysa 422 withdrawal_expired.
 * Her durumda iade kargo kodu ÜCRETSİZDİR (satıcı öder).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: "invalid" })
    return
  }
  const b = parsed.data
  const order = await findOrderByNumberAndEmail(req.scope, b.order_no, b.email)
  if (!order) {
    res.status(404).json({ code: "not_found" })
    return
  }
  const items = order.items.filter((i) => b.line_ids.includes(i.id))
  if (items.length !== b.line_ids.length) {
    res.status(400).json({ code: "invalid_items" })
    return
  }
  const t = getShippingAdapter().track(order)
  const elig = eligibility(new Date(t.expected_delivery_at), t.delivered_at !== null)
  const decision = decide(
    {
      reason: b.reason,
      wants_exchange: b.wants_exchange,
      defect_remedy: b.defect_remedy,
      exchange_note: b.exchange_note,
    },
    elig,
  )
  if (!decision.ok) {
    res.status(422).json({
      code: decision.code,
      message: decision.code,
      withdrawal_deadline: elig.withdrawal_deadline.toISOString(),
    })
    return
  }

  const { result } = await createReturnRequestWorkflow(req.scope).run({
    input: {
      order_id: order.id,
      order_display_id: order.display_id,
      email: order.email,
      items: items.map((i) => ({
        line_id: i.id,
        title: i.title,
        variant: i.variant_title,
        quantity: i.quantity,
        product_handle: i.product_handle,
      })),
      reason: b.reason,
      path: decision.path,
      defect_remedy: decision.path === "defect" ? (b.defect_remedy ?? null) : null,
      exchange_note: decision.path === "exchange" ? (b.exchange_note ?? null) : null,
      fit_result: b.reason === "fit" ? (b.fit_result ?? "other") : null,
      within_withdrawal: elig.within_withdrawal,
      delivered_at: elig.delivered_at.toISOString(),
      withdrawal_deadline: elig.withdrawal_deadline.toISOString(),
      refund_due_at: decision.refund_due_at?.toISOString() ?? null,
    },
  })
  res.status(201).json({ ...result, path: decision.path })
}
