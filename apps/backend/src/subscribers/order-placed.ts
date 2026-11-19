import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { renderOrderPlacedEmail, type OrderEmailData } from "../lib/emails/order-placed"

/**
 * Sipariş e-postası (işlemsel ileti — ticari ileti onayı gerektirmez, içine reklam konmaz; Rapor §7.4).
 */
export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notifications = container.resolve(Modules.NOTIFICATION)

  const { data } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "total",
      "subtotal",
      "shipping_total",
      "tax_total",
      "items.title",
      "items.variant_title",
      "items.quantity",
      "items.total",
      "shipping_address.first_name",
      "shipping_address.last_name",
      "shipping_address.address_1",
      "shipping_address.city",
      "shipping_address.province",
      "shipping_methods.name",
    ],
    filters: { id: event.data.id },
  })
  const order = data[0] as unknown as OrderEmailData | undefined
  if (!order?.email) return

  const { subject, html } = renderOrderPlacedEmail(order)
  await notifications.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-placed",
    content: { subject, html },
    data: { order_id: order.id },
  })
}

export const config: SubscriberConfig = { event: "order.placed" }
