import "server-only"
import type { HttpTypes } from "@medusajs/types"
import { sdk } from "./client"
import { getAuthHeaders, getCartId, setCartId } from "./cookies"
import { getRegion } from "./catalog"

export const IYZICO_PROVIDER_ID = "pp_iyzico_iyzico"

const CART_FIELDS =
  "*items,*items.variant,*items.variant.options,*items.product,+items.product.metadata,*items.product.categories,*shipping_address,*shipping_methods,*payment_collection,*payment_collection.payment_sessions,*region"

export async function getCart(): Promise<HttpTypes.StoreCart | null> {
  const id = await getCartId()
  if (!id) return null
  try {
    const { cart } = await sdk.store.cart.retrieve(id, { fields: CART_FIELDS }, await getAuthHeaders())
    // Tamamlanmış sepet tekrar kullanılmaz
    return cart.completed_at ? null : cart
  } catch {
    return null
  }
}

export async function getOrCreateCart(): Promise<HttpTypes.StoreCart> {
  const existing = await getCart()
  if (existing) return existing
  const region = await getRegion()
  const { cart } = await sdk.store.cart.create(
    { region_id: region.id },
    { fields: CART_FIELDS },
    await getAuthHeaders(),
  )
  await setCartId(cart.id)
  return cart
}

export function cartItemCount(cart: HttpTypes.StoreCart | null): number {
  return (cart?.items ?? []).reduce((n, i) => n + i.quantity, 0)
}
