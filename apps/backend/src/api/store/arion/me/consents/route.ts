import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONSENT_MODULE } from "../../../../../modules/consent"
import type ConsentModuleService from "../../../../../modules/consent/service"

/** GET /store/arion/me/consents — üyenin amaç başına güncel rıza durumu ve geçmişi. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const svc: ConsentModuleService = req.scope.resolve(CONSENT_MODULE)
  const cid = req.auth_context.actor_id
  const [current, history] = await Promise.all([
    svc.currentConsents(cid),
    svc.listConsents(
      { subject_ref: cid },
      { order: { created_at: "DESC" }, take: 50, select: ["purpose", "granted", "text_version", "channel", "created_at"] },
    ),
  ])
  res.json({ current, history })
}
