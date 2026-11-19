import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { customerId, requestMeta } from "../../../../lib/request-meta"
import { recordConsentsWorkflow } from "../../../../workflows/record-consents"

const Body = z.object({
  channel: z.enum(["cookie_banner", "register", "account", "checkout", "other"]),
  /** Üye değilse: arion_aid çerezindeki rastgele tanımlayıcı */
  anonymous_id: z
    .string()
    .regex(/^anon_[A-Za-z0-9_-]{16,64}$/)
    .optional(),
  changes: z
    .object({
      marketing_email: z.boolean(),
      marketing_sms: z.boolean(),
      fit_twin: z.boolean(),
      ai_chat_transfer: z.boolean(),
      cookie_functional: z.boolean(),
      cookie_analytics: z.boolean(),
      cookie_marketing: z.boolean(),
    })
    .partial()
    .refine((o) => Object.keys(o).length > 0, "En az bir amaç gerekli"),
})

/**
 * POST /store/arion/consents — rıza ver / geri al (Rapor §7.1.3).
 * Üye girişi varsa rıza müşteriye, yoksa anonim tanımlayıcıya kaydedilir.
 * Pazarlama rızaları anonim olarak verilemez (İYS için kimlik gerekir).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: "Geçersiz rıza isteği" })
    return
  }
  const cid = customerId(req)
  const { channel, anonymous_id, changes } = parsed.data
  if (!cid) {
    const forbidden = (["marketing_email", "marketing_sms", "fit_twin"] as const).filter(
      (p) => changes[p] !== undefined,
    )
    if (forbidden.length || !anonymous_id) {
      res.status(400).json({ message: "Bu rıza için üye girişi gerekir" })
      return
    }
  }

  const { result } = await recordConsentsWorkflow(req.scope).run({
    input: {
      subject_type: cid ? "customer" : "anonymous",
      subject_ref: cid ?? anonymous_id!,
      channel,
      changes,
      ...requestMeta(req),
    },
  })
  res.json({ recorded: result.created.length })
}
