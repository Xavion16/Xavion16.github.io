"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { z } from "zod"
import { getPathname } from "@/i18n/navigation"
import { sdk } from "@/lib/medusa/client"
import { getCartId, removeAuthToken, setAuthToken } from "@/lib/medusa/cookies"
import type { ActionState } from "./cart-actions"

const LoginSchema = z.object({
  email: z.email().max(200),
  password: z.string().min(8).max(200),
})

const RegisterSchema = LoginSchema.extend({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
})

async function transferCart(token: string) {
  const cartId = await getCartId()
  if (!cartId) return
  try {
    await sdk.store.cart.transferCart(cartId, {}, { authorization: `Bearer ${token}` })
  } catch {
    // Sepet aktarılamazsa misafir sepeti olduğu gibi kalır
  }
}

async function loginWith(email: string, password: string): Promise<string | null> {
  const res = await sdk.auth.login("customer", "emailpass", { email, password })
  return typeof res === "string" ? res : null
}

export async function loginAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = LoginSchema.safeParse({ email: form.get("email"), password: form.get("password") })
  if (!parsed.success) return { ok: false, error: "invalidCredentials" }
  let token: string | null = null
  try {
    token = await loginWith(parsed.data.email, parsed.data.password)
  } catch {
    token = null
  }
  if (!token) return { ok: false, error: "invalidCredentials" }
  await setAuthToken(token)
  await transferCart(token)
  revalidatePath("/", "layout")
  const next = String(form.get("next") ?? "")
  const locale = await getLocale()
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : getPathname({ href: "/hesabim", locale }))
}

export async function registerAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = RegisterSchema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
    first_name: form.get("first_name"),
    last_name: form.get("last_name"),
  })
  const acceptedMembership = form.get("accept_membership") === "on"
  if (!parsed.success || !acceptedMembership) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.success ? [] : parsed.error.issues) {
      const key = String(issue.path[0] ?? "")
      if (key && !fieldErrors[key]) fieldErrors[key] = "invalid"
    }
    if (!acceptedMembership) fieldErrors.accept_membership = "required"
    return { ok: false, error: "invalidRegister", fieldErrors }
  }
  const { email, password, first_name, last_name } = parsed.data
  // Açık rızalar: yalnızca kullanıcı kutuyu kendisi işaretlediyse (varsayılan hayır)
  const marketing = {
    marketing_email: form.get("marketing_email") === "on",
    marketing_sms: form.get("marketing_sms") === "on",
  }
  try {
    const regToken = await sdk.auth.register("customer", "emailpass", { email, password })
    await sdk.store.customer.create(
      { email, first_name, last_name },
      {},
      { authorization: `Bearer ${regToken}` },
    )
  } catch {
    return { ok: false, error: "registerFailed" }
  }
  const token = await loginWith(email, password).catch(() => null)
  if (!token) return { ok: false, error: "registerFailed" }
  await setAuthToken(token)
  await transferCart(token)
  if (marketing.marketing_email || marketing.marketing_sms) {
    // Rıza + İYS kaydı (yalnızca verilenler; verilmeyenler için kayıt "hiç rıza yok" demektir)
    await sdk.client
      .fetch("/store/arion/consents", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        body: {
          channel: "register",
          changes: Object.fromEntries(Object.entries(marketing).filter(([, v]) => v)),
        },
      })
      .catch(() => undefined)
  }
  revalidatePath("/", "layout")
  const locale = await getLocale()
  redirect(getPathname({ href: "/hesabim", locale }))
}

export async function logoutAction(): Promise<void> {
  await removeAuthToken()
  revalidatePath("/", "layout")
  const locale = await getLocale()
  redirect(getPathname({ href: "/", locale }))
}
