"use server"

import { z } from "zod"
import { sdk } from "@/lib/medusa/client"
import { getAuthHeaders } from "@/lib/medusa/cookies"

/** Medusa js-sdk FetchError: status alanı taşır. */
function statusOf(e: unknown): number | undefined {
  return typeof e === "object" && e !== null && "status" in e ? Number((e as { status: unknown }).status) : undefined
}

const OrderSchema = z.object({
  order_no: z.string().trim().min(1).max(20),
  email: z.email().max(200),
})

// ── Sipariş takibi ───────────────────────────────────────────────────────
export type TrackingStep = { code: "created" | "shipped" | "in_transit" | "delivered"; at: string; done: boolean }
export type TrackState = {
  status: "idle" | "found" | "not_found" | "invalid"
  /** React 19 form sıfırlamasında girilen değerler korunsun */
  values?: { order_no: string; email: string }
  order?: { display_id: number; items: Array<{ title: string; variant_title: string | null; quantity: number }> }
  tracking?: { carrier: string; tracking_no: string; status: TrackingStep["code"]; steps: TrackingStep[]; expected_delivery_at: string }
}

export async function trackOrderAction(_prev: TrackState, form: FormData): Promise<TrackState> {
  const values = { order_no: String(form.get("order_no") ?? ""), email: String(form.get("email") ?? "") }
  const parsed = OrderSchema.safeParse(values)
  if (!parsed.success) return { status: "invalid", values }
  try {
    const res = await sdk.client.fetch<Required<Pick<TrackState, "order" | "tracking">>>("/store/arion/order-tracking", {
      method: "POST",
      body: parsed.data,
    })
    return { status: "found", values, ...res }
  } catch {
    return { status: "not_found", values }
  }
}

// ── Talep formu ──────────────────────────────────────────────────────────
const TicketSchema = z.object({
  topic: z.enum(["size_fit", "order", "shipping", "return", "payment", "care", "kvkk", "other"]),
  full_name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  order_ref: z.string().trim().max(30).optional(),
  message: z.string().trim().min(5).max(4000),
})

export type TicketState = { ok: boolean; ticket?: string; error?: boolean; values?: Record<string, string> }

export async function submitTicketAction(_prev: TicketState, form: FormData): Promise<TicketState> {
  const values = Object.fromEntries(
    ["topic", "full_name", "email", "order_ref", "message"].map((k) => [k, String(form.get(k) ?? "")]),
  )
  const parsed = TicketSchema.safeParse({
    topic: form.get("topic"),
    full_name: form.get("full_name"),
    email: form.get("email"),
    order_ref: String(form.get("order_ref") ?? "") || undefined,
    message: form.get("message"),
  })
  if (!parsed.success) return { ok: false, error: true, values }
  try {
    const res = await sdk.client.fetch<{ ticket_no: string }>("/store/arion/support-tickets", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: { channel: "form", ...parsed.data },
    })
    return { ok: true, ticket: res.ticket_no }
  } catch {
    return { ok: false, error: true, values }
  }
}

// ── İade sihirbazı ───────────────────────────────────────────────────────
export type ReturnLookup = {
  status: "idle" | "found" | "not_found" | "invalid"
  order_no?: string
  email?: string
  order?: { display_id: number; items: Array<{ id: string; title: string; variant_title: string | null; quantity: number }> }
  eligibility?: { delivered: boolean; delivered_at: string; withdrawal_deadline: string; within_withdrawal: boolean; days_left: number }
}

export async function lookupReturnAction(_prev: ReturnLookup, form: FormData): Promise<ReturnLookup> {
  const values = { order_no: String(form.get("order_no") ?? ""), email: String(form.get("email") ?? "") }
  const parsed = OrderSchema.safeParse(values)
  if (!parsed.success) return { status: "invalid", ...values }
  try {
    const res = await sdk.client.fetch<Required<Pick<ReturnLookup, "order" | "eligibility">>>(
      "/store/arion/returns/lookup",
      { method: "POST", body: parsed.data },
    )
    return { status: "found", order_no: parsed.data.order_no, email: parsed.data.email, ...res }
  } catch {
    return { status: "not_found", ...values }
  }
}

const ReturnSchema = z.object({
  order_no: z.string().trim().min(1).max(20),
  email: z.email().max(200),
  line_ids: z.array(z.string().regex(/^ordli_[A-Za-z0-9]+$/)).min(1),
  reason: z.enum(["fit", "dislike", "defective", "wrong_item"]),
  wants_exchange: z.boolean(),
  defect_remedy: z.enum(["terminate", "discount", "repair", "replace"]).optional(),
  exchange_note: z.string().trim().max(500).optional(),
  fit_result: z.enum(["small", "large", "narrow", "wide", "other"]).optional(),
})

export type ReturnResult = {
  ok: boolean
  error?: "withdrawal_expired" | "remedy_required" | "exchange_note_required" | "generic"
  return_no?: string
  return_code?: string
  carrier?: string
  refund_due_at?: string | null
  path?: "withdrawal" | "defect" | "exchange"
}

export async function submitReturnAction(_prev: ReturnResult, form: FormData): Promise<ReturnResult> {
  const parsed = ReturnSchema.safeParse({
    order_no: form.get("order_no"),
    email: form.get("email"),
    line_ids: form.getAll("line_ids").map(String),
    reason: form.get("reason"),
    wants_exchange: form.get("wants_exchange") === "on",
    defect_remedy: form.get("defect_remedy") || undefined,
    exchange_note: String(form.get("exchange_note") ?? "") || undefined,
    fit_result: form.get("fit_result") || undefined,
  })
  if (!parsed.success) return { ok: false, error: "generic" }
  try {
    const res = await sdk.client.fetch<Omit<ReturnResult, "ok">>("/store/arion/returns", {
      method: "POST",
      body: parsed.data,
    })
    return { ok: true, ...res }
  } catch (e) {
    if (statusOf(e) === 422) {
      const msg = String((e as { message?: unknown }).message ?? "")
      const code = (["withdrawal_expired", "remedy_required", "exchange_note_required"] as const).find((c) =>
        msg.includes(c),
      )
      return { ok: false, error: code ?? "withdrawal_expired" }
    }
    return { ok: false, error: "generic" }
  }
}
