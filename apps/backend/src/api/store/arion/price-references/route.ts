import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { cheapestReference, referencePricesForVariants } from "../../../../lib/price-reference"

const QuerySchema = z.object({
  product_ids: z
    .string()
    .transform((s) =>
      s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().regex(/^prod_[A-Za-z0-9]+$/)).min(1).max(100)),
})

/**
 * GET /store/arion/price-references?product_ids=prod_1,prod_2
 * Liste kartları için ürün başına (en ucuz varyantın) referans fiyatı.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const parsed = QuerySchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ message: "product_ids geçersiz" })
    return
  }
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "variants.id"],
    filters: { id: parsed.data.product_ids },
  })

  const allVariantIds = data.flatMap((p) => (p.variants ?? []).flatMap((v) => (v ? [v.id] : [])))
  const refs = await referencePricesForVariants(req.scope, allVariantIds)

  const out: Record<string, ReturnType<typeof cheapestReference>> = {}
  for (const p of data) {
    const list = (p.variants ?? []).flatMap((v) => {
      const ref = v ? refs[v.id] : undefined
      return ref ? [ref] : []
    })
    out[p.id] = cheapestReference(list)
  }
  res.json({ price_references: out })
}
