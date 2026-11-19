import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SUPPORT_MODULE } from "../../../../modules/support"
import type SupportModuleService from "../../../../modules/support/service"

/** GET /admin/arion/support — bilet kuyruğu (SLA) ve iade kuyruğu (para iadesi son tarihi). */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const svc: SupportModuleService = req.scope.resolve(SUPPORT_MODULE)
  const [tickets, returns, feedback] = await Promise.all([
    svc.listSupportTickets({}, { order: { created_at: "DESC" }, take: 100 }),
    svc.listReturnRequests({}, { order: { created_at: "DESC" }, take: 100 }),
    svc.listFitFeedbacks({}, { take: 500 }),
  ])
  res.json({ tickets, returns, fit_feedback_count: feedback.length })
}
