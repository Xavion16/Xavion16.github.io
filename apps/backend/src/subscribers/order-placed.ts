import {
  buildDistanceSalesContract,
  buildPreContractInfo,
  cartToContractInput,
  type CartLike,
} from "@arion/legal-texts"
import { renderLegalPdf } from "@arion/legal-texts/pdf"
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { renderOrderPlacedEmail, type OrderEmailData } from "../lib/emails/order-placed"
import { CONSENT_MODULE } from "../modules/consent"
import type ConsentModuleService from "../modules/consent/service"

/**
 * Sipariş e-postası (işlemsel ileti — ticari ileti onayı gerektirmez, içine reklam konmaz; Rapor §7.4).
 * Ön bilgilendirme formu ve mesafeli satış sözleşmesi PDF olarak eklenir (Rapor §7.2/4)
 * ve sepette alınan onay kayıtları siparişe bağlanır.
 */
export default async function orderPlacedHandler({ event, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notifications = container.resolve(Modules.NOTIFICATION)
  const consents: ConsentModuleService = container.resolve(CONSENT_MODULE)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const { data } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "customer_id",
      "metadata",
      "total",
      "subtotal",
      "item_total",
      "shipping_total",
      "tax_total",
      "created_at",
      "items.title",
      "items.product_title",
      "items.variant_title",
      "items.quantity",
      "items.unit_price",
      "items.total",
      "items.product.metadata",
      "shipping_address.*",
      "shipping_methods.name",
    ],
    filters: { id: event.data.id },
  })
  const order = data[0]
  if (!order?.email) return

  // Sepetteki onayı siparişe bağla
  const acc = (order.metadata as Record<string, unknown> | null)?.legal_acceptance as
    | { locale?: "tr" | "en"; accepted_at?: string }
    | undefined
  const locale = acc?.locale === "en" ? "en" : "tr"
  const cartId = (order.metadata as Record<string, unknown> | null)?.cart_id
  const pending = await consents.listLegalAcceptances(
    typeof cartId === "string" ? { cart_id: cartId } : { email: order.email, order_id: null },
    { order: { accepted_at: "DESC" }, take: 2 },
  )
  if (pending.length) {
    await consents.updateLegalAcceptances(
      pending.map((p) => ({ id: p.id, order_id: order.id, customer_id: order.customer_id ?? p.customer_id })),
    )
  }

  // Sözleşme PDF'leri (sipariş verisiyle doldurulmuş, onay tarihi ve sipariş no ile)
  const orderRef = `#${order.display_id}`
  const acceptedAt = acc?.accepted_at ? new Date(acc.accepted_at) : new Date(order.created_at as unknown as string)
  const input = { ...cartToContractInput(order as unknown as CartLike), orderRef, date: acceptedAt }
  let attachments: Array<{ content: string; filename: string; content_type: string }> = []
  try {
    const [pre, dist] = await Promise.all([
      renderLegalPdf(buildPreContractInfo(input, locale), { orderRef, acceptedAt, locale }),
      renderLegalPdf(buildDistanceSalesContract(input, locale), { orderRef, acceptedAt, locale }),
    ])
    attachments = [
      { content: Buffer.from(pre).toString("base64"), filename: `on-bilgilendirme-${order.display_id}.pdf`, content_type: "application/pdf" },
      { content: Buffer.from(dist).toString("base64"), filename: `mesafeli-satis-${order.display_id}.pdf`, content_type: "application/pdf" },
    ]
  } catch (e) {
    logger.warn(`Sözleşme PDF'i üretilemedi (${order.id}): ${(e as Error).message}`)
  }

  const { subject, html } = renderOrderPlacedEmail(order as unknown as OrderEmailData)
  await notifications.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-placed",
    content: { subject, html },
    attachments,
    data: { order_id: order.id },
  })
}

export const config: SubscriberConfig = { event: "order.placed" }
