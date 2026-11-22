/** Statik yayın sepeti: tarayıcıda saklanır (DECISIONS #087). Satır kimliği = varyant kimliği. */
export type StaticLine = { variant_id: string; quantity: number }
export const STATIC_CART_KEY = "arion-cart"
export const STATIC_CART_EVENT = "arion-cart-change"

export function readStaticCart(): StaticLine[] {
  try {
    const raw = localStorage.getItem(STATIC_CART_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.filter((l): l is StaticLine => typeof l?.variant_id === "string" && typeof l?.quantity === "number")
      : []
  } catch {
    return []
  }
}

function write(lines: StaticLine[]) {
  try {
    localStorage.setItem(STATIC_CART_KEY, JSON.stringify(lines))
  } catch {
    // gizli pencere vb.: sepet yalnızca bu sayfada kalır
  }
  window.dispatchEvent(new Event(STATIC_CART_EVENT))
}

export function addToStaticCart(variantId: string, quantity: number) {
  const lines = readStaticCart()
  const line = lines.find((l) => l.variant_id === variantId)
  if (line) line.quantity = Math.min(10, line.quantity + quantity)
  else lines.push({ variant_id: variantId, quantity })
  write(lines)
}

export function updateStaticCart(variantId: string, quantity: number) {
  const lines = readStaticCart()
    .map((l) => (l.variant_id === variantId ? { ...l, quantity } : l))
    .filter((l) => l.quantity > 0)
  write(lines)
}

export function clearStaticCart() {
  write([])
}
