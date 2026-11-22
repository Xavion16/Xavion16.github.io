import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { requestMeta } from "../../../../../lib/request-meta"
import { FIT_TWIN_MODULE } from "../../../../../modules/fit-twin"
import type FitTwinModuleService from "../../../../../modules/fit-twin/service"
import { purgeFitTwinWorkflow, saveFitTwinWorkflow } from "../../../../../workflows/fit-twin"
import { recordConsentsWorkflow } from "../../../../../workflows/record-consents"

/** Ölçü aralıkları fit-engine PROFILE_LIMITS ile aynı. */
const Profile = z
  .object({
    lengthMm: z.number().min(100).max(340),
    ballWidthMm: z.number().min(40).max(140),
    girthMm: z.number().min(120).max(340).nullable().optional(),
    archType: z.enum(["flat", "normal", "high"]),
    preference: z.enum(["snug", "regular", "roomy"]),
    method: z.enum(["manual", "paper"]),
  })
  .refine((p) => p.ballWidthMm / p.lengthMm >= 0.28 && p.ballWidthMm / p.lengthMm <= 0.5, "ratio")

const Body = z.object({
  profile: Profile,
  /** Bu istekle açık rıza veriliyorsa true (kutu varsayılan işaretsiz) */
  consent: z.boolean(),
})

/** GET /store/arion/me/fit-twin — kendi Ayak İkizi (şifresi çözülmüş). */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const svc: FitTwinModuleService = req.scope.resolve(FIT_TWIN_MODULE)
  const profile = await svc.getProfile(req.auth_context.actor_id)
  if (!profile) {
    res.status(404).json({ message: "not_found" })
    return
  }
  res.json({ profile })
}

/** POST — kaydet/güncelle. Geçerli açık rıza yoksa 403 ve HİÇBİR ŞEY yazılmaz. */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: "invalid" })
    return
  }
  const customer_id = req.auth_context.actor_id
  if (parsed.data.consent) {
    await recordConsentsWorkflow(req.scope).run({
      input: {
        subject_type: "customer",
        subject_ref: customer_id,
        channel: "account",
        changes: { fit_twin: true },
        ...requestMeta(req),
      },
    })
  }
  const { errors } = await saveFitTwinWorkflow(req.scope).run({
    input: { customer_id, profile: parsed.data.profile },
    throwOnError: false,
  })
  if (errors.length) {
    res.status(403).json({ message: "consent_required" })
    return
  }
  res.json({ saved: true })
}

/** DELETE — "Ayak İkizimi sil": kalıcı silme + rızanın geri alınması. */
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const customer_id = req.auth_context.actor_id
  const { result } = await purgeFitTwinWorkflow(req.scope).run({ input: { customer_id } })
  await recordConsentsWorkflow(req.scope).run({
    input: {
      subject_type: "customer",
      subject_ref: customer_id,
      channel: "account",
      changes: { fit_twin: false },
      ...requestMeta(req),
    },
  })
  res.json({ deleted: result.deleted })
}
