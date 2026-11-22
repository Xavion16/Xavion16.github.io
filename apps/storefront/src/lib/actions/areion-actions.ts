"use server"

import { maskPII } from "@arion/ai-guard"
import { z } from "zod"
import { sdk } from "@/lib/medusa/client"
import { getAuthHeaders } from "@/lib/medusa/cookies"


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
