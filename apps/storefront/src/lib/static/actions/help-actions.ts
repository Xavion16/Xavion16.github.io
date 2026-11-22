/**
 * STATİK YAYIN (GitHub Pages, DECISIONS #087): backend yok. next.config bu dosyayı gerçek
 * "use server" işleminin yerine koyar. Gerçek kayıt yapılmaz; gösterim amaçlı yanıt döner.
 */
import type { ReturnLookup, ReturnResult, TicketState, TrackState, TrackingStep } from "../../actions/help-actions"

export type { ReturnLookup, ReturnResult, TicketState, TrackState, TrackingStep }
const values = (form: FormData) => ({ order_no: String(form.get("order_no") ?? ""), email: String(form.get("email") ?? "") })

export async function trackOrderAction(_prev: TrackState, form: FormData): Promise<TrackState> {
  return { status: "not_found", values: values(form) }
}
export async function submitTicketAction(_prev: TicketState, _form: FormData): Promise<TicketState> {
  return { ok: true, ticket: "TKT-DEMO-" + Math.floor(1000 + Math.random() * 9000) }
}
export async function lookupReturnAction(_prev: ReturnLookup, form: FormData): Promise<ReturnLookup> {
  return { status: "not_found", ...values(form) }
}
export async function submitReturnAction(_prev: ReturnResult, _form: FormData): Promise<ReturnResult> {
  return { ok: false, error: "generic" }
}
