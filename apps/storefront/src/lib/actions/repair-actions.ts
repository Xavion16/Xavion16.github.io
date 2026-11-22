"use server"

import { z } from "zod"
import { sdk } from "@/lib/medusa/client"
import { getAuthHeaders } from "@/lib/medusa/cookies"

const TYPES = ["resole", "heel", "stitch", "clean", "recraft"] as const
const Code = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^ARN-\d{4}-\d{6}$/)

function statusOf(e: unknown): number {
  return typeof e === "object" && e !== null && "status" in e ? Number((e as { status: unknown }).status) : 0
}

export type QuoteResult =
  | { ok: true; min: number; max: number; credit: number | null; feasible: boolean; product: string | null }
  | { ok: false; error: "passport_not_found" | "invalid" | "generic" }

export async function quoteRepairAction(type: string, passportCode: string): Promise<QuoteResult> {
  const t = z.enum(TYPES).safeParse(type)
  const code = passportCode.trim() ? Code.safeParse(passportCode) : null
  if (!t.success || (code && !code.success)) return { ok: false, error: "invalid" }
  const qs = new URLSearchParams({ type: t.data, ...(code?.success ? { passport_code: code.data } : {}) })
  try {
    const res = await sdk.client.fetch<{
      quote: { min: number; max: number; credit: number | null; feasible: boolean }
      product: string | null
    }>(`/store/arion/repairs/quote?${qs.toString()}`, { method: "GET" })
    return { ok: true, ...res.quote, product: res.product }
  } catch (e) {
    return { ok: false, error: statusOf(e) === 404 ? "passport_not_found" : "generic" }
  }
}

const RepairSchema = z.object({
  type: z.enum(TYPES),
  passport_code: z.union([Code, z.literal("")]).transform((v) => v || null),
  description: z.string().trim().min(5).max(2000),
  full_name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  photos: z
    .array(z.object({ mime: z.enum(["image/jpeg", "image/png", "image/webp"]), base64: z.string().max(2_100_000) }))
    .max(3),
})

export type RepairSubmitResult =
  | { ok: true; reference: string; shipping_code: string; quote: { min: number; max: number; credit: number | null } }
  | { ok: false; error: "invalid" | "passport_not_found" | "not_feasible" | "generic" }

/** Tamir / Geri Al talebi. Fotoğraflar istemcide küçültülmüş base64 olarak gelir; Zod ile doğrulanır. */
export async function submitRepairAction(input: unknown): Promise<RepairSubmitResult> {
  const parsed = RepairSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }
  try {
    const res = await sdk.client.fetch<{
      reference: string
      shipping_code: string
      quote: { min: number; max: number; credit: number | null }
    }>("/store/arion/repairs", { method: "POST", headers: await getAuthHeaders(), body: parsed.data })
    return { ok: true, ...res }
  } catch (e) {
    const s = statusOf(e)
    return { ok: false, error: s === 404 ? "passport_not_found" : s === 422 ? "not_feasible" : s === 400 ? "invalid" : "generic" }
  }
}
