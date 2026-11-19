import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { updateSupportTicketWorkflow } from "../../../../../../workflows/support"

const Body = z.object({ status: z.enum(["open", "pending", "resolved"]), responded: z.boolean().default(false) })

/** POST /admin/arion/support/tickets/:id — durum ve ilk yanıt (SLA). */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Geçersiz istek")
  const { result } = await updateSupportTicketWorkflow(req.scope).run({
    input: { id: req.params.id, ...parsed.data },
  })
  res.json({ ticket: result })
}
