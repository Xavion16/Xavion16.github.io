import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { customerId } from "../../../../lib/request-meta"
import { createDataSubjectRequestWorkflow } from "../../../../workflows/kvkk"

const Body = z.object({
  type: z.enum(["info", "export", "correct", "delete", "object", "other"]),
  full_name: z.string().trim().min(3).max(120),
  email: z.email().max(200),
  details: z.string().trim().max(2000).optional(),
})

/**
 * POST /store/arion/data-requests — KVKK m.11 ilgili kişi başvurusu.
 * Referans numarası ve 30 günlük yanıt tarihi döner; yöneticinin KVKK kuyruğuna düşer.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: "Lütfen formdaki alanları kontrol et" })
    return
  }
  const { result } = await createDataSubjectRequestWorkflow(req.scope).run({
    input: {
      type: parsed.data.type,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      customer_id: customerId(req),
      details: parsed.data.details ?? null,
      notify: true,
    },
  })
  res.status(201).json({ reference: result.reference, due_at: result.due_at })
}
