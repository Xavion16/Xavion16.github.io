import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { customerId } from "../../../../lib/request-meta"
import { REPAIR_TYPES } from "../../../../lib/repairs"
import { createRepairWorkflow } from "../../../../workflows/passport"

const MAX_PHOTO_BYTES = 1_500_000

const Body = z.object({
  type: z.enum(REPAIR_TYPES),
  passport_code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^ARN-\d{4}-\d{6}$/)
    .nullable()
    .optional(),
  full_name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  description: z.string().trim().min(5).max(2000),
  photos: z
    .array(
      z.object({
        mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
        base64: z
          .string()
          .regex(/^[A-Za-z0-9+/]+=*$/)
          .refine((s) => (s.length * 3) / 4 <= MAX_PHOTO_BYTES, "too_large"),
      }),
    )
    .max(3)
    .default([]),
})

/** POST /store/arion/repairs — tamir talebi ya da Geri Al – Yeniden Doğ (Rapor §6.6). Üyelik isteğe bağlı. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: "invalid" })
    return
  }
  const { result, errors } = await createRepairWorkflow(req.scope).run({
    input: {
      ...parsed.data,
      passport_code: parsed.data.passport_code ?? null,
      customer_id: customerId(req),
    },
    throwOnError: false,
  })
  if (errors.length) {
    const msg = String(errors[0]?.error?.message ?? "")
    if (msg.includes("passport_not_found")) {
      res.status(404).json({ message: "passport_not_found" })
      return
    }
    if (msg.includes("not_feasible")) {
      res.status(422).json({ message: "not_feasible" })
      return
    }
    res.status(500).json({ message: "error" })
    return
  }
  res.json({
    reference: result.reference,
    shipping_code: result.shipping_code,
    quote: { min: result.quote_min, max: result.quote_max, credit: result.credit_amount },
  })
}
