"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { z } from "zod"
import { getPathname } from "@/i18n/navigation"
import { getCart, getOrCreateCart, IYZICO_PROVIDER_ID } from "@/lib/medusa/cart"
import { sdk } from "@/lib/medusa/client"
import { getAuthHeaders } from "@/lib/medusa/cookies"

export type ActionState = { ok: boolean; error?: string; fieldErrors?: Record<string, string> }

const idSchema = (prefix: string) => z.string().regex(new RegExp(`^${prefix}_[A-Za-z0-9]+$`))

// ── Sepet ────────────────────────────────────────────────────────────────
const AddSchema = z.object({
  variant_id: idSchema("variant"),
  quantity: z.coerce.number().int().min(1).max(10),
})

export async function addToCartAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = AddSchema.safeParse({
    variant_id: form.get("variant_id"),
    quantity: form.get("quantity") ?? 1,
  })
  if (!parsed.success) return { ok: false, error: "selectVariant" }
  try {
    const cart = await getOrCreateCart()
    await sdk.store.cart.createLineItem(cart.id, parsed.data, {}, await getAuthHeaders())
  } catch {
    return { ok: false, error: "addFailed" }
  }
  revalidatePath("/", "layout")
  return { ok: true }
}

const UpdateSchema = z.object({
  line_id: idSchema("cali"),
  quantity: z.coerce.number().int().min(0).max(10),
})

export async function updateLineAction(form: FormData): Promise<void> {
  const parsed = UpdateSchema.safeParse({
    line_id: form.get("line_id"),
    quantity: form.get("quantity"),
  })
  const cart = await getCart()
  if (!parsed.success || !cart) return
  const headers = await getAuthHeaders()
  if (parsed.data.quantity === 0) {
    await sdk.store.cart.deleteLineItem(cart.id, parsed.data.line_id, {}, headers)
  } else {
    await sdk.store.cart.updateLineItem(
      cart.id,
      parsed.data.line_id,
      { quantity: parsed.data.quantity },
      {},
      headers,
    )
  }
  revalidatePath("/", "layout")
}

// ── Ödeme adımları ───────────────────────────────────────────────────────
const AddressSchema = z.object({
  email: z.email().max(200),
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^(\+90|0)?5\d{9}$/)
    .optional()
    .or(z.literal("")),
  address_1: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(60),
  province: z.string().trim().min(2).max(60),
  postal_code: z
    .string()
    .trim()
    .regex(/^\d{5}$/)
    .optional()
    .or(z.literal("")),
})

export async function saveAddressAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const raw = Object.fromEntries(
    ["email", "first_name", "last_name", "phone", "address_1", "city", "province", "postal_code"].map(
      (k) => [k, String(form.get(k) ?? "")],
    ),
  )
  const parsed = AddressSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "")
      if (key && !fieldErrors[key]) fieldErrors[key] = "invalid"
    }
    return { ok: false, error: "invalidAddress", fieldErrors }
  }
  const cart = await getCart()
  if (!cart) return { ok: false, error: "noCart" }

  const { email, ...address } = parsed.data
  const addr = {
    ...address,
    phone: address.phone || undefined,
    postal_code: address.postal_code || undefined,
    country_code: "tr",
  }
  await sdk.store.cart.update(
    cart.id,
    { email, shipping_address: addr, billing_address: addr },
    {},
    await getAuthHeaders(),
  )
  revalidatePath("/", "layout")
  // Kaydedince düzenleme modundan çık ve kargo adımına geç
  redirect(getPathname({ href: "/odeme", locale: await getLocale() }))
}

export async function setShippingAction(form: FormData): Promise<void> {
  const parsed = idSchema("so").safeParse(form.get("option_id"))
  const cart = await getCart()
  if (!parsed.success || !cart) return
  await sdk.store.cart.addShippingMethod(
    cart.id,
    { option_id: parsed.data },
    {},
    await getAuthHeaders(),
  )
  revalidatePath("/", "layout")
}

/**
 * iyzico Checkout Form oturumunu başlatır ve kullanıcıyı ödeme sayfasına yönlendirir.
 * Kart bilgisi ARION'a hiç gelmez (Rapor §9.1).
 */
export async function startPaymentAction(): Promise<void> {
  const locale = await getLocale()
  const cart = await getCart()
  const checkout = getPathname({ href: "/odeme", locale })
  if (!cart?.email || !cart.shipping_address || !cart.shipping_methods?.length) {
    redirect(`${checkout}?hata=eksik`)
  }
  const a = cart.shipping_address
  let pageUrl: string | undefined
  try {
    const { payment_collection } = await sdk.store.payment.initiatePaymentSession(
      cart,
      {
        provider_id: IYZICO_PROVIDER_ID,
        data: {
          email: cart.email,
          first_name: a.first_name,
          last_name: a.last_name,
          address_1: a.address_1,
          city: a.city,
          postal_code: a.postal_code,
          cart_id: cart.id,
          locale,
        },
      },
      {},
      await getAuthHeaders(),
    )
    const session = payment_collection.payment_sessions?.find(
      (s) => s.provider_id === IYZICO_PROVIDER_ID,
    )
    const url = session?.data?.payment_page_url
    pageUrl = typeof url === "string" ? url : undefined
  } catch {
    pageUrl = undefined
  }
  if (!pageUrl) redirect(`${checkout}?hata=odeme-baslatilamadi`)
  redirect(pageUrl)
}
