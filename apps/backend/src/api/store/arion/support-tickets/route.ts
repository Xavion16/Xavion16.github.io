import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { customerId } from "../../../../lib/request-meta"
import { createSupportTicketWorkflow } from "../../../../workflows/support"

const Body = z.object({
  channel: z.enum(["form", "chat"]).default("form"),
  topic: z.enum(["size_fit", "order", "shipping", "return", "payment", "care", "kvkk", "other"]),
  message: z.string().trim().min(5).max(4000),
  full_name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  order_ref: z.string().trim().max(30).nullable().optional(),
  /** AI'dan devredilen konuşma — storefront'ta maskelenmiş olarak gelir */
  transcript: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(2000) }))
    .max(40)
    .nullable()
    .optional(),
})

/** POST /store/arion/support-tickets — talep/şikâyet formu ya da sohbetten temsilciye devir. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: "invalid" })
    return
  }
  const { result } = await createSupportTicketWorkflow(req.scope).run({
    input: {
      ...parsed.data,
      order_ref: parsed.data.order_ref ?? null,
      transcript: parsed.data.transcript ?? null,
      customer_id: customerId(req),
    },
  })
  res.status(201).json({ ticket_no: result.ticket_no })
}
