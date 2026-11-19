import "server-only"
import type { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { sdk } from "./client"
import { getAuthHeaders } from "./cookies"

export const getCustomer = cache(async (): Promise<HttpTypes.StoreCustomer | null> => {
  const headers = await getAuthHeaders()
  if (!headers.authorization) return null
  try {
    const { customer } = await sdk.store.customer.retrieve({ fields: "id,email,first_name,last_name" }, headers)
    return customer
  } catch {
    return null
  }
})

export async function listMyOrders(): Promise<HttpTypes.StoreOrder[]> {
  const headers = await getAuthHeaders()
  if (!headers.authorization) return []
  const { orders } = await sdk.store.order.list(
    { fields: "id,display_id,created_at,total,currency_code,status,*items", order: "-created_at", limit: 20 },
    headers,
  )
  return orders
}
