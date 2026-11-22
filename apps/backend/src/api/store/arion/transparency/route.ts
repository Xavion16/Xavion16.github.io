import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PASSPORT_MODULE } from "../../../../modules/passport"
import type PassportModuleService from "../../../../modules/passport/service"
import { SUPPORT_MODULE } from "../../../../modules/support"
import type SupportModuleService from "../../../../modules/support/service"

const MONTH_MS = 30.44 * 86_400_000
const round1 = (n: number) => Math.round(n * 10) / 10

/**
 * GET /store/arion/transparency — Şeffaflık Paneli (Rapor §2.3): "iddia değil, veri".
 * Bütün değerler veritabanından o an hesaplanır; demo ortamında veriler demo siparişlerden gelir.
 * Kişisel veri dönmez, yalnızca toplamlar.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const support: SupportModuleService = req.scope.resolve(SUPPORT_MODULE)
  const passports: PassportModuleService = req.scope.resolve(PASSPORT_MODULE)

  const { metadata } = await query.graph({ entity: "order", fields: ["id"], pagination: { take: 1, skip: 0 } })
  const orderCount = metadata?.count ?? 0

  const returns = await support.listReturnRequests({}, { select: ["reason"] })
  const reasons: Record<string, number> = { fit: 0, dislike: 0, defective: 0, wrong_item: 0 }
  for (const r of returns) reasons[r.reason] = (reasons[r.reason] ?? 0) + 1

  const repairs = await passports.listRepairOrders({ status: "completed" }, { select: ["type", "passport_code", "completed_at"] })
  const repaired = repairs.filter((r) => r.type !== "recraft")
  const recrafted = repairs.filter((r) => r.type === "recraft")

  // Ortalama ayakkabı ömrü: tamir/geri alım kaydı olan pasaportlarda üretimden son kayda kadar geçen süre
  const codes = [...new Set(repairs.flatMap((r) => (r.passport_code ? [r.passport_code] : [])))]
  const produced = codes.length ? await passports.listPassports({ code: codes }, { select: ["code", "produced_at"] }) : []
  const lastEvent = new Map<string, number>()
  for (const r of repairs) {
    if (!r.passport_code || !r.completed_at) continue
    const t = new Date(r.completed_at).getTime()
    lastEvent.set(r.passport_code, Math.max(lastEvent.get(r.passport_code) ?? 0, t))
  }
  const lifetimes = produced.flatMap((p) => {
    const end = lastEvent.get(p.code)
    return end ? [(end - new Date(p.produced_at).getTime()) / MONTH_MS] : []
  })

  const tickets = await support.listSupportTickets(
    { first_response_at: { $ne: null } },
    { select: ["created_at", "first_response_at"] },
  )
  const responseHours = tickets.map(
    (t) => (new Date(t.first_response_at as Date).getTime() - new Date(t.created_at).getTime()) / 3_600_000,
  )

  res.json({
    generated_at: new Date().toISOString(),
    is_demo: true,
    returns: {
      orders: orderCount,
      count: returns.length,
      rate_pct: orderCount ? round1((returns.length / orderCount) * 100) : 0,
      reasons,
    },
    repairs: { completed: repaired.length },
    recraft: { completed: recrafted.length },
    lifetime: {
      avg_months: lifetimes.length ? round1(lifetimes.reduce((a, b) => a + b, 0) / lifetimes.length) : null,
      sample: lifetimes.length,
    },
    support: {
      avg_first_response_hours: responseHours.length
        ? round1(responseHours.reduce((a, b) => a + b, 0) / responseHours.length)
        : null,
      sample: responseHours.length,
    },
  })
}
