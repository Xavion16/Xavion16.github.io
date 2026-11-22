import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { passportLabelPdf } from "../../../../../../lib/passport-label"
import { PASSPORT_MODULE } from "../../../../../../modules/passport"
import type PassportModuleService from "../../../../../../modules/passport/service"

/** GET /admin/arion/passports/:code/label — QR etiket PDF'i (Rapor §6.4). */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const svc: PassportModuleService = req.scope.resolve(PASSPORT_MODULE)
  const code = String(req.params.code ?? "").toUpperCase()
  const [passport] = await svc.listPassports({ code })
  if (!passport) {
    res.status(404).json({ message: "Pasaport bulunamadı" })
    return
  }
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "product", fields: ["title"], filters: { id: passport.product_id } })
  const base = process.env.STOREFRONT_URL ?? "http://localhost:8000"
  const opts = (passport.variant_options ?? {}) as { color?: string; size?: string; width?: string }
  const pdf = await passportLabelPdf([
    {
      code: passport.code,
      url: `${base}/tr/pasaport/${passport.code}`,
      product: data[0]?.title ?? passport.product_handle,
      options: opts,
      produced_at: passport.produced_at,
      last_code: passport.last_code,
    },
  ])
  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", `inline; filename="${passport.code}.pdf"`)
  res.send(Buffer.from(pdf))
}
