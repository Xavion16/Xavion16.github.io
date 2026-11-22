"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { sdk } from "@/lib/medusa/client"
import { getAuthHeaders } from "@/lib/medusa/cookies"

/** Ölçü aralıkları @arion/fit-engine PROFILE_LIMITS ile aynı. */
const ProfileSchema = z.object({
  lengthMm: z.number().min(100).max(340),
  ballWidthMm: z.number().min(40).max(140),
  girthMm: z.number().min(120).max(340).nullable().optional(),
  archType: z.enum(["flat", "normal", "high"]),
  preference: z.enum(["snug", "regular", "roomy"]),
  method: z.enum(["manual", "paper"]),
})

export type SaveResult = { ok: boolean; error?: "consent_required" | "auth" | "invalid" | "generic" }

/** Üye: Ayak İkizi'ni şifreli kaydet. Açık rıza kutusu işaretli değilse ve önceden rıza yoksa backend 403 döner. */
export async function saveFitTwinAction(profile: unknown, consent: boolean): Promise<SaveResult> {
  const parsed = ProfileSchema.safeParse(profile)
  if (!parsed.success) return { ok: false, error: "invalid" }
  const headers = await getAuthHeaders()
  if (!headers.authorization) return { ok: false, error: "auth" }
  try {
    await sdk.client.fetch("/store/arion/me/fit-twin", {
      method: "POST",
      headers,
      body: { profile: parsed.data, consent: consent === true },
    })
    revalidatePath("/", "layout")
    return { ok: true }
  } catch (e) {
    const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status: unknown }).status) : 0
    return { ok: false, error: status === 403 ? "consent_required" : "generic" }
  }
}

/** "Ayak İkizimi sil" — kalıcı silme + rızanın geri alınması. */
export async function deleteFitTwinAction(): Promise<{ ok: boolean }> {
  const headers = await getAuthHeaders()
  if (!headers.authorization) return { ok: false }
  try {
    await sdk.client.fetch("/store/arion/me/fit-twin", { method: "DELETE", headers })
    revalidatePath("/", "layout")
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
