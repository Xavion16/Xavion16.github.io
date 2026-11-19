import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { snapshotPricesWorkflow } from "../workflows/snapshot-prices"

/** Ürün ya da varyant güncellendiğinde fiyat geçmişini güncel tut. */
export default async function priceChangedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  let variantIds: string[] = [event.data.id]
  if (event.name === "product.updated") {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "product",
      fields: ["variants.id"],
      filters: { id: event.data.id },
    })
    variantIds = (data[0]?.variants ?? []).flatMap((v) => (v ? [v.id] : []))
  }
  if (variantIds.length) {
    await snapshotPricesWorkflow(container).run({ input: { variant_ids: variantIds } })
  }
}

export const config: SubscriberConfig = {
  event: ["product.updated", "product-variant.updated"],
}
