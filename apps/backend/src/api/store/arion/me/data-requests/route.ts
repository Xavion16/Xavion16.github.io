import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONSENT_MODULE } from "../../../../../modules/consent"
import type ConsentModuleService from "../../../../../modules/consent/service"

/** GET /store/arion/me/data-requests — üyenin KVKK başvuruları. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const svc: ConsentModuleService = req.scope.resolve(CONSENT_MODULE)
  const requests = await svc.listDataSubjectRequests(
    { customer_id: req.auth_context.actor_id },
    {
      order: { received_at: "DESC" },
      select: ["reference", "type", "status", "received_at", "due_at", "resolved_at"],
    },
  )
  res.json({ data_requests: requests })
}
