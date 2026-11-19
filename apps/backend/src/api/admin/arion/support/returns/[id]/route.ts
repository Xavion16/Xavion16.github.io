import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { updateReturnRequestWorkflow } from "../../../../../../workflows/support"

const Body = z.object({ status: z.enum(["requested", "in_transit", "received", "refunded", "rejected"]) })

/** POST /admin/arion/support/returns/:id — iade durumu. */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Geçersiz durum")
  const { result } = await updateReturnRequestWorkflow(req.scope).run({
    input: { id: req.params.id, status: parsed.data.status },
  })
  res.json({ return_request: result })
}
