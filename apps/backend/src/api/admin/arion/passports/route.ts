import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { PASSPORT_MODULE } from "../../../../modules/passport"
import type PassportModuleService from "../../../../modules/passport/service"
import { createPassportWorkflow } from "../../../../workflows/passport"

/** GET /admin/arion/passports — pasaportlar, ustalar ve ürün listesi (oluşturma formu için). */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const svc: PassportModuleService = req.scope.resolve(PASSPORT_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const [passports, craftsmen, repairs, { data: products }] = await Promise.all([
    svc.listPassports({}, { order: { created_at: "DESC" }, take: 200 }),
    svc.listArtisans({}),
    svc.listRepairOrders({}, { order: { created_at: "DESC" }, take: 100 }),
    query.graph({
      entity: "product",
      fields: ["id", "title", "handle", "variants.id", "variants.title"],
      filters: { status: "published" },
    }),
  ])
  const titles = Object.fromEntries(products.map((p) => [p.id, p.title]))
  res.json({
    passports: passports.map((p) => ({ ...p, product_title: titles[p.product_id] ?? p.product_handle })),
    craftsmen,
    repairs,
    products: products.map((p) => ({
      id: p.id,
      title: p.title,
      variants: (p.variants ?? []).flatMap((v) => (v ? [{ id: v.id, title: v.title }] : [])),
    })),
  })
}

const Body = z.object({
  product_id: z.string().startsWith("prod_"),
  variant_id: z.string().startsWith("variant_").nullable().optional(),
  craftsman_id: z.string().startsWith("usta_").nullable().optional(),
})

/** POST /admin/arion/passports — "Pasaport oluştur". */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: "Geçersiz istek" })
    return
  }
  const { result } = await createPassportWorkflow(req.scope).run({ input: parsed.data })
  res.json({ passport: result })
}
