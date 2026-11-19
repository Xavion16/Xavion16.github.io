import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONSENT_MODULE } from "../../../../modules/consent"
import type ConsentModuleService from "../../../../modules/consent/service"

/** GET /admin/arion/data-requests — KVKK başvuru kuyruğu (son tarihe göre). */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const svc: ConsentModuleService = req.scope.resolve(CONSENT_MODULE)
  const status = typeof req.query.status === "string" ? req.query.status : undefined
  const open = ["received", "verifying", "in_progress"] as const
  const requests = await svc.listDataSubjectRequests(
    status === "all" ? {} : { status: [...open] },
    { order: { due_at: "ASC" }, take: 200 },
  )
  res.json({ data_requests: requests })
}
