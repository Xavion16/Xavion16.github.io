import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { updateDataSubjectRequestWorkflow } from "../../../../../workflows/kvkk"

const Body = z.object({
  status: z.enum(["received", "verifying", "in_progress", "resolved", "rejected"]),
  resolution_note: z.string().trim().max(2000).optional(),
})

/** POST /admin/arion/data-requests/:id — başvuru durumunu güncelle (yönetici işlemi audit'e düşer). */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Geçersiz durum")
  const { result } = await updateDataSubjectRequestWorkflow(req.scope).run({
    input: {
      id: req.params.id,
      status: parsed.data.status,
      resolution_note: parsed.data.resolution_note ?? null,
    },
  })
  res.json({ data_request: result })
}
