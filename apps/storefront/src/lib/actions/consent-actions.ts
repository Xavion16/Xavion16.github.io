"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getOrCreateAnonId, writeCookieChoice } from "@/lib/consent"
import { sdk } from "@/lib/medusa/client"
import { getAuthHeaders } from "@/lib/medusa/cookies"

const ChoiceSchema = z.object({
  functional: z.boolean(),
  analytics: z.boolean(),
  marketing: z.boolean(),
})

/**
 * Çerez tercihini kaydeder: tarayıcıda zorunlu `arion_consent` çerezi + ispat için backend'de
 * rıza kaydı (amaç, metin sürümü, zaman, kanal, IP/UA). Kayıt başarısız olsa da tercih uygulanır.
 */
export async function saveCookieChoiceAction(input: unknown): Promise<{ ok: boolean }> {
  const parsed = ChoiceSchema.safeParse(input)
  if (!parsed.success) return { ok: false }
  const choice = parsed.data
  await writeCookieChoice(choice)

  const anonymous_id = await getOrCreateAnonId()
  try {
    await sdk.client.fetch("/store/arion/consents", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: {
        channel: "cookie_banner",
        anonymous_id,
        changes: {
          cookie_functional: choice.functional,
          cookie_analytics: choice.analytics,
          cookie_marketing: choice.marketing,
        },
      },
    })
  } catch {
    // Kayıt hatası tercihi geçersiz kılmaz; bir sonraki değişiklikte yeniden denenir
  }
  revalidatePath("/", "layout")
  return { ok: true }
}

const PurposeChanges = z
  .object({
    marketing_email: z.boolean(),
    marketing_sms: z.boolean(),
    fit_twin: z.boolean(),
    ai_chat_transfer: z.boolean(),
  })
  .partial()

/** Üye rızaları (İzinlerim sayfası / üyelik formu). Pazarlama rızaları İYS'ye bildirilir. */
export async function saveMemberConsentsAction(
  channel: "register" | "account",
  input: unknown,
): Promise<{ ok: boolean }> {
  const parsed = PurposeChanges.safeParse(input)
  const headers = await getAuthHeaders()
  if (!parsed.success || !headers.authorization || Object.keys(parsed.data).length === 0) {
    return { ok: false }
  }
  try {
    await sdk.client.fetch("/store/arion/consents", {
      method: "POST",
      headers,
      body: { channel, changes: parsed.data },
    })
  } catch {
    return { ok: false }
  }
  revalidatePath("/", "layout")
  return { ok: true }
}

const DsrSchema = z.object({
  type: z.enum(["info", "export", "correct", "delete", "object", "other"]),
  full_name: z.string().trim().min(3).max(120),
  email: z.email().max(200),
  details: z.string().trim().max(2000).optional(),
})

export type DsrState = { ok: boolean; reference?: string; due_at?: string; error?: boolean }

/** KVKK m.11 başvurusu → backend kuyruğu (30 gün sayacı). */
export async function submitDataRequestAction(_prev: DsrState, form: FormData): Promise<DsrState> {
  const parsed = DsrSchema.safeParse({
    type: form.get("type"),
    full_name: form.get("full_name"),
    email: form.get("email"),
    details: String(form.get("details") ?? "") || undefined,
  })
  if (!parsed.success) return { ok: false, error: true }
  try {
    const res = await sdk.client.fetch<{ reference: string; due_at: string }>("/store/arion/data-requests", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: parsed.data,
    })
    return { ok: true, reference: res.reference, due_at: res.due_at }
  } catch {
    return { ok: false, error: true }
  }
}

const MEMBER_PURPOSES = ["marketing_email", "marketing_sms", "fit_twin", "ai_chat_transfer"] as const

/** İzinlerim formu: her amacın son durumu gönderilir; backend yalnızca değişenleri kaydeder. */
export async function savePermissionsAction(
  _prev: { ok: boolean; saved?: boolean },
  form: FormData,
): Promise<{ ok: boolean; saved?: boolean }> {
  const changes = Object.fromEntries(MEMBER_PURPOSES.map((p) => [p, form.get(p) === "on"]))
  const res = await saveMemberConsentsAction("account", changes)
  return { ok: res.ok, saved: res.ok }
}
