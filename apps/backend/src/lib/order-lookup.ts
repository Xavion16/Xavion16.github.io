import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export type LookedUpOrder = {
  id: string
  display_id: number
  email: string
  created_at: string
  metadata: Record<string, unknown> | null
  customer_id: string | null
  items: Array<{ id: string; title: string; variant_title: string | null; quantity: number; product_handle: string | null }>
}

/**
 * Giriş gerektirmeyen sipariş doğrulama: sipariş no + e-posta BİRLİKTE eşleşmeli (Rapor §8.2).
 * Eşleşmezse hangi alanın yanlış olduğu söylenmez (kayıt sızdırmamak için).
 */
export async function findOrderByNumberAndEmail(
  container: MedusaContainer,
  orderNo: string,
  email: string,
): Promise<LookedUpOrder | null> {
  const displayId = Number(orderNo.replace(/^#/, "").trim())
  if (!Number.isInteger(displayId) || displayId <= 0) return null
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "created_at",
      "metadata",
      "customer_id",
      "items.id",
      "items.title",
      "items.product_title",
      "items.variant_title",
      "items.quantity",
      "items.product_handle",
    ],
    // E-postaya göre daralt, numarayı kodda karşılaştır (display_id tip uyumsuzluğundan kaçınır)
    filters: { email: [email.trim(), email.trim().toLowerCase()] },
    pagination: { take: 200, order: { created_at: "DESC" } },
  })
  const order = data.find((o) => Number(o.display_id) === displayId)
  if (!order || (order.email ?? "").toLowerCase() !== email.trim().toLowerCase()) return null
  return {
    id: order.id,
    display_id: Number(order.display_id),
    email: order.email as string,
    created_at: new Date(order.created_at as unknown as string).toISOString(),
    metadata: (order.metadata as Record<string, unknown> | null) ?? null,
    customer_id: (order.customer_id as string | null) ?? null,
    items: (order.items ?? []).flatMap((i) =>
      i
        ? [
            {
              id: i.id,
              title: (i.product_title as string | null) ?? i.title,
              variant_title: (i.variant_title as string | null) ?? null,
              quantity: Number(i.quantity),
              product_handle: (i.product_handle as string | null) ?? null,
            },
          ]
        : [],
    ),
  }
}
