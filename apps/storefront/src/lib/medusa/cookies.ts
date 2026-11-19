import "server-only"
import { cookies } from "next/headers"

/*
 * Zorunlu çerezler (oturum ve sepet) — açık rıza gerektirmez (Rapor §7.1.4).
 * httpOnly + sameSite=lax: ödeme sağlayıcısından dönüşte (çapraz site üst düzey yönlendirme) korunur.
 */
const JWT = "_arion_jwt"
const CART = "_arion_cart"
const WEEK = 60 * 60 * 24 * 7

const base = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = (await cookies()).get(JWT)?.value
  return token ? { authorization: `Bearer ${token}` } : {}
}

export async function setAuthToken(token: string) {
  ;(await cookies()).set(JWT, token, { ...base, maxAge: WEEK })
}

export async function removeAuthToken() {
  ;(await cookies()).set(JWT, "", { ...base, maxAge: -1 })
}

export async function getCartId(): Promise<string | undefined> {
  return (await cookies()).get(CART)?.value
}

export async function setCartId(id: string) {
  ;(await cookies()).set(CART, id, { ...base, maxAge: WEEK })
}

export async function removeCartId() {
  ;(await cookies()).set(CART, "", { ...base, maxAge: -1 })
}
