import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { runRetention } from "../../../../jobs/kvkk-imha"
import { CONSENT_MODULE } from "../../../../modules/consent"
import type ConsentModuleService from "../../../../modules/consent/service"

/** GET /admin/arion/retention — imha log'u. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const svc: ConsentModuleService = req.scope.resolve(CONSENT_MODULE)
  const logs = await svc.listRetentionLogs({}, { order: { ran_at: "DESC" }, take: 100 })
  res.json({ retention_logs: logs })
}

/** POST /admin/arion/retention — imha işini elle çalıştır (demo/denetim). */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const results = await runRetention(req.scope)
  res.json({ results })
}
