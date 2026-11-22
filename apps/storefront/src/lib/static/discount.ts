/**
 * Statik yayın (DECISIONS #092): demo indirim kodları. Yalnızca tarayıcıda hesaplanır;
 * üstü çizili ürün fiyatı değildir (o yalnızca price_history'den gelir), sepet toplamına uygulanan kupondur.
 */
export type Discount = { code: string; kind: "percent" | "fixed"; value: number; min: number }

const CODES: Record<string, Omit<Discount, "code">> = {
  ARION10: { kind: "percent", value: 10, min: 0 },
  SCU20: { kind: "percent", value: 20, min: 2000 },
  HOSGELDIN: { kind: "fixed", value: 250, min: 1500 },
}

export const DISCOUNT_KEY = "arion-discount"

export type DiscountCheck = { ok: true; discount: Discount } | { ok: false; reason: "unknown" | "minimum"; min?: number }

export function checkDiscount(raw: string, subtotal: number): DiscountCheck {
  const code = raw.trim().toLocaleUpperCase("tr").replace(/İ/g, "I")
  const found = CODES[code]
  if (!found) return { ok: false, reason: "unknown" }
  if (subtotal < found.min) return { ok: false, reason: "minimum", min: found.min }
  return { ok: true, discount: { code, ...found } }
}

/** İndirim tutarı (ara toplamı aşamaz, kuruşa yuvarlanır) */
export function discountAmount(d: Discount | null, subtotal: number): number {
  if (!d || subtotal < d.min) return 0
  const v = d.kind === "percent" ? (subtotal * d.value) / 100 : d.value
  return Math.min(subtotal, Math.round(v))
}

export function readDiscount(): string | null {
  try {
    return localStorage.getItem(DISCOUNT_KEY)
  } catch {
    return null
  }
}

export function writeDiscount(code: string | null) {
  try {
    if (code) localStorage.setItem(DISCOUNT_KEY, code)
    else localStorage.removeItem(DISCOUNT_KEY)
  } catch {
    // gizli pencere vb.
  }
}
