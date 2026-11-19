import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { updateOrderWorkflow } from "@medusajs/medusa/core-flows"

const Body = z.object({ days_ago: z.number().int().min(0).max(365) })

/**
 * POST /admin/arion/demo/orders/:id/delivered — YALNIZCA DEMO/TEST: mock kargoda teslim tarihini geriye alır
 * (ör. "14 günü aşan sipariş" senaryosu). Yönetici yetkisi gerektirir.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) throw new MedusaError(MedusaError.Types.INVALID_DATA, "days_ago gerekli")
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "order", fields: ["id", "metadata"], filters: { id: req.params.id } })
  const order = data[0]
  if (!order) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Sipariş yok")
  const delivered = new Date(Date.now() - parsed.data.days_ago * 24 * 60 * 60 * 1000)
  await updateOrderWorkflow(req.scope).run({
    input: {
      id: order.id,
      user_id: req.auth_context.actor_id,
      metadata: {
        ...((order.metadata as Record<string, unknown> | null) ?? {}),
        demo_delivered_at: delivered.toISOString(),
      },
    },
  })
  res.json({ demo_delivered_at: delivered.toISOString() })
}
