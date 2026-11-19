import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"
import { z } from "zod"
import { getPathname } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { getCart, IYZICO_PROVIDER_ID } from "@/lib/medusa/cart"
import { sdk } from "@/lib/medusa/client"
import { getAuthHeaders, removeCartId } from "@/lib/medusa/cookies"

/**
 * Ödeme sayfasından dönüş.
 *  - GET  (mock): /api/odeme/iyzico-donus?token=…&result=success|failure — storefront simülasyon sayfasından.
 *  - POST (live): iyzico callback'i form verisiyle `token` gönderir. Bu siteler arası bir POST olduğu için
 *    sameSite=lax çerezler GELMEZ; bu yüzden aynı adrese GET ile 303 yönlendirip sepete orada erişiriz.
 * Sonuç burada KABUL EDİLMEZ: sepet tamamlanırken backend (authorizePayment) iyzico API'sinden doğrular.
 */

const TokenSchema = z.string().min(8).max(200)

async function currentLocale(): Promise<Locale> {
  const v = (await cookies()).get("NEXT_LOCALE")?.value
  return routing.locales.includes(v as Locale) ? (v as Locale) : routing.defaultLocale
}

async function finish(req: NextRequest, token: string, mockResult?: "success" | "failure") {
  const locale = await currentLocale()
  const checkout = new URL(getPathname({ href: "/odeme", locale }), req.url)
  const fail = (code: string) => {
    checkout.searchParams.set("hata", code)
    return NextResponse.redirect(checkout, 303)
  }

  const cart = await getCart()
  const session = cart?.payment_collection?.payment_sessions?.find(
    (s) => s.provider_id === IYZICO_PROVIDER_ID && s.data?.token === token,
  )
  if (!cart || !session || !cart.payment_collection) return fail("oturum")

  const headers = await getAuthHeaders()
  if (mockResult && session.data?.mode === "mock") {
    await sdk.client.fetch(
      `/store/payment-collections/${cart.payment_collection.id}/payment-sessions/${session.id}`,
      { method: "POST", body: { client_data: { mock_result: mockResult } }, headers },
    )
  }

  try {
    const result = await sdk.store.cart.complete(cart.id, {}, headers)
    if (result.type === "order") {
      await removeCartId()
      const done = getPathname({ href: { pathname: "/siparis/[id]", params: { id: result.order.id } }, locale })
      return NextResponse.redirect(new URL(done, req.url), 303)
    }
  } catch {
    // aşağıda hata sayfasına düşer
  }
  return fail("odeme-reddedildi")
}

export async function GET(req: NextRequest) {
  const token = TokenSchema.safeParse(req.nextUrl.searchParams.get("token"))
  const result = req.nextUrl.searchParams.get("result")
  if (!token.success || (result !== null && result !== "success" && result !== "failure")) {
    return NextResponse.json({ message: "Geçersiz istek" }, { status: 400 })
  }
  return finish(req, token.data, result ?? undefined)
}

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const token = TokenSchema.safeParse(form.get("token"))
  if (!token.success) return NextResponse.json({ message: "Geçersiz istek" }, { status: 400 })
  const back = new URL(req.nextUrl.pathname, req.url)
  back.searchParams.set("token", token.data)
  return NextResponse.redirect(back, 303)
}
