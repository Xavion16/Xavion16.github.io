import { acceptanceDocs, type CartLike } from "@arion/legal-texts"
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { customerId, requestMeta } from "../../../../../../lib/request-meta"
import { recordLegalAcceptanceWorkflow } from "../../../../../../workflows/kvkk"

const Body = z.object({
  locale: z.enum(["tr", "en"]),
  pre_contract: z.literal(true),
  distance_sales: z.literal(true),
  /** Ekranda gösterilen metinlerin özeti; sunucunun hesapladığıyla eşleşmeli */
  pre_contract_hash: z.string().regex(/^[a-f0-9]{16}$/),
  distance_sales_hash: z.string().regex(/^[a-f0-9]{16}$/),
})

/**
 * POST /store/arion/carts/:id/legal-acceptance — Ön bilgilendirme + mesafeli satış onayı (Rapor §7.2).
 * Metinler SUNUCUDA sepetten yeniden üretilir; ekrandaki metnin hash'i eşleşmezse (sepet değişmiş)
 * onay reddedilir. Sürüm ve hash sepete ve LegalAcceptance kaydına yazılır.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = Body.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: "Her iki metnin de onaylanması gerekir" })
    return
  }
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "email",
      "metadata",
      "completed_at",
      "item_total",
      "shipping_total",
      "tax_total",
      "total",
      "items.product_title",
      "items.title",
      "items.variant_title",
      "items.quantity",
      "items.unit_price",
      "items.total",
      "items.product.metadata",
      "shipping_address.*",
      "shipping_methods.name",
    ],
    filters: { id: req.params.id },
  })
  const cart = data[0]
  if (!cart || cart.completed_at) {
    res.status(404).json({ message: "Sepet bulunamadı" })
    return
  }

  const docs = acceptanceDocs(cart as unknown as CartLike, parsed.data.locale)
  if (
    docs.pre_contract.hash !== parsed.data.pre_contract_hash ||
    docs.distance_sales.hash !== parsed.data.distance_sales_hash
  ) {
    res.status(409).json({
      code: "contract_changed",
      message: "Sepet değişti; lütfen güncel ön bilgilendirme formunu ve sözleşmeyi tekrar oku.",
    })
    return
  }

  await recordLegalAcceptanceWorkflow(req.scope).run({
    input: {
      cart_id: cart.id,
      cart_metadata: (cart.metadata as Record<string, unknown> | null) ?? {},
      docs,
      locale: parsed.data.locale,
      email: cart.email ?? null,
      customer_id: customerId(req),
      ...requestMeta(req),
    },
  })
  res.json({ accepted: docs })
}
