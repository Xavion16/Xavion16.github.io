"use server"

import { maskPII } from "@arion/ai-guard"
import { cookies } from "next/headers"
import { z } from "zod"
import { AI_CONSENT_COOKIE } from "@/lib/ai/config"
import { getOrCreateAnonId } from "@/lib/consent"
import { sdk } from "@/lib/medusa/client"
import { getAuthHeaders } from "@/lib/medusa/cookies"

/**
 * Areion açık rızası (yurt dışına aktarım — ai_chat_transfer, Rapor §7.1.6).
 * Backend'de rıza kaydı + tarayıcıda zorunlu httpOnly çerez.
 */
export async function acceptAiConsentAction(): Promise<{ ok: boolean }> {
  const anonymous_id = await getOrCreateAnonId()
  try {
    await sdk.client.fetch("/store/arion/consents", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: { channel: "other", anonymous_id, changes: { ai_chat_transfer: true } },
    })
  } catch {
    return { ok: false }
  }
  ;(await cookies()).set(AI_CONSENT_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 182,
  })
  return { ok: true }
}

const HandoffSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  locale: z.enum(["tr", "en"]),
  transcript: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(2000) })).max(40),
})

/** Sohbetten temsilciye devir: dökümü maskeleyip destek talebi + Chatwoot konuşması açar. */
export async function handoffAction(input: unknown): Promise<{ ok: boolean; ticket?: string }> {
  const parsed = HandoffSchema.safeParse(input)
  if (!parsed.success) return { ok: false }
  const { full_name, email, locale, transcript } = parsed.data
  const masked = transcript.map((m) => ({ role: m.role, text: maskPII(m.text, locale) }))
  const lastUser = [...masked].reverse().find((m) => m.role === "user")?.text ?? "Areion sohbetinden devir"
  try {
    const res = await sdk.client.fetch<{ ticket_no: string }>("/store/arion/support-tickets", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: {
        channel: "chat",
        topic: "other",
        message: lastUser.length >= 5 ? lastUser : "Areion sohbetinden temsilciye devir",
        full_name,
        email,
        transcript: masked,
      },
    })
    return { ok: true, ticket: res.ticket_no }
  } catch {
    return { ok: false }
  }
}
