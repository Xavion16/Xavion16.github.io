import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PASSPORT_MODULE } from "../../../../modules/passport"
import type PassportModuleService from "../../../../modules/passport/service"

/**
 * GET /store/arion/atelier — Atölye sayfası: ustalar ve son üretilen çiftler ("canlı akış", DEMO).
 * Pasaportlar ürüne aittir; kişisel veri yoktur.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc: PassportModuleService = req.scope.resolve(PASSPORT_MODULE)
  const [artisans, passports] = await Promise.all([
    svc.listArtisans({}, { order: { since_year: "ASC" } }),
    svc.listPassports({}, { order: { produced_at: "DESC" }, take: 8 }),
  ])
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const ids = [...new Set(passports.map((p) => p.product_id))]
  const { data } = ids.length
    ? await query.graph({ entity: "product", fields: ["id", "title"], filters: { id: ids } })
    : { data: [] as Array<{ id: string; title: string }> }
  const titles = Object.fromEntries(data.map((p) => [p.id, p.title]))
  const names = Object.fromEntries(artisans.map((a) => [a.id, a.name]))

  res.json({
    artisans: artisans.map((a) => ({
      name: a.name,
      specialty: a.specialty,
      since_year: a.since_year,
      bio: a.bio,
      is_demo: a.is_demo,
    })),
    recent: passports.map((p) => ({
      code: p.code,
      product: titles[p.product_id] ?? p.product_handle,
      produced_at: p.produced_at,
      craftsman: names[p.craftsman_id] ?? null,
    })),
  })
}
