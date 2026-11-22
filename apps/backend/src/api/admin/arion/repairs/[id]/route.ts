import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { updateRepairWorkflow } from "../../../../../workflows/passport"

const Body = z.object({
  status: z.enum(["received", "in_repair", "completed", "cancelled"]).optional(),
  /** Pasaportta görünür — kişi bilgisi yazılmamalı */
  public_note: z.string().trim().max(300).nullable().optional(),
})

/** POST /admin/arion/repairs/:id — tamir durumunu güncelle; "completed" pasaportun tamir geçmişine düşer. */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: "Geçersiz istek" })
    return
  }
  const { result } = await updateRepairWorkflow(req.scope).run({ input: { id: req.params.id!, ...parsed.data } })
  res.json({ repair: result })
}
