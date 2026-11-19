import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { referencePricesForVariants } from "../../../../../../lib/price-reference"
import { LAST_MODULE } from "../../../../../../modules/last"
import type LastModuleService from "../../../../../../modules/last/service"

/**
 * GET /store/arion/products/:handle/details
 * Ürün sayfası için ARION'a özel veriler: teknik özellikler, Dayanıklılık Kartı metrikleri,
 * kalıp ölçü tablosu ve varyant bazında yasal referans fiyat (price_history'den).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "variants.id", "product_tech.*"],
    filters: { handle: req.params.handle, status: "published" },
  })
  const product = data[0]
  if (!product) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Ürün bulunamadı")
  }

  const tech = product.product_tech ?? null
  let last = null
  if (tech?.last_code) {
    const lasts: LastModuleService = req.scope.resolve(LAST_MODULE)
    const [found] = await lasts.listLasts({ code: tech.last_code })
    last = found ?? null
  }

  const variantIds = (product.variants ?? []).flatMap((v) => (v ? [v.id] : []))
  const priceReferences = await referencePricesForVariants(req.scope, variantIds)

  res.json({ tech, last, price_references: priceReferences })
}
