import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { LAST_MODULE } from "../../../../../modules/last"
import type LastModuleService from "../../../../../modules/last/service"
import { PASSPORT_MODULE } from "../../../../../modules/passport"
import type PassportModuleService from "../../../../../modules/passport/service"

const CODE = /^ARN-\d{4}-\d{6}$/

/**
 * GET /store/arion/passports/:code — Ayakkabı Pasaportu (Rapor §6.4). Herkese açık; KİŞİSEL VERİ İÇERMEZ:
 * tamir geçmişinde yalnızca tür, tarih ve kamuya açık not döner (ad, e-posta, fotoğraf dönmez).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const code = String(req.params.code ?? "").toUpperCase()
  if (!CODE.test(code)) {
    res.status(404).json({ message: "not_found" })
    return
  }
  const svc: PassportModuleService = req.scope.resolve(PASSPORT_MODULE)
  const [passport] = await svc.listPassports({ code })
  if (!passport) {
    res.status(404).json({ message: "not_found" })
    return
  }
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["title", "handle", "thumbnail", "categories.handle", "categories.name", "product_tech.*"],
    filters: { id: passport.product_id },
  })
  const product = data[0]
  const lasts: LastModuleService = req.scope.resolve(LAST_MODULE)
  const [last] = await lasts.listLasts({ code: passport.last_code })
  const craftsman = await svc.retrieveArtisan(passport.craftsman_id).catch(() => null)
  const repairs = await svc.listRepairOrders(
    { passport_code: code, status: "completed" },
    { order: { completed_at: "ASC" }, select: ["type", "completed_at", "public_note"] },
  )
  const tech = product?.product_tech
  const category = product?.categories?.[0]

  res.json({
    passport: {
      code: passport.code,
      produced_at: passport.produced_at,
      batch: passport.batch,
      variant_options: passport.variant_options,
      dpp: passport.dpp,
      is_demo: passport.is_demo,
    },
    product: product
      ? {
          title: product.title,
          handle: product.handle,
          thumbnail: product.thumbnail,
          category: category ? { handle: category.handle, name: category.name } : null,
        }
      : null,
    tech: tech
      ? {
          construction: tech.construction,
          materials: tech.materials,
          weight_grams_pair: tech.weight_grams_pair,
          repairability_score: tech.repairability_score,
          test_metrics: tech.test_metrics,
        }
      : null,
    last: last ? { code: last.code, name: last.name, toe_shape: last.toe_shape } : null,
    craftsman: craftsman
      ? {
          name: craftsman.name,
          specialty: craftsman.specialty,
          bio: craftsman.bio,
          since_year: craftsman.since_year,
          is_demo: craftsman.is_demo,
        }
      : null,
    repairs: repairs.map((r) => ({ type: r.type, completed_at: r.completed_at, public_note: r.public_note })),
  })
}
