import { Modules } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { randomBytes } from "node:crypto"
import { getChatwootAdapter } from "../lib/chatwoot"
import { getShippingAdapter } from "../lib/shipping"
import { SUPPORT_MODULE } from "../modules/support"
import type SupportModuleService from "../modules/support/service"

const year = () => new Date().getFullYear()
const rand = () => randomBytes(3).toString("hex").toUpperCase()

// ── Destek talebi ────────────────────────────────────────────────────────
export type CreateTicketInput = {
  channel: "form" | "chat"
  topic: "size_fit" | "order" | "shipping" | "return" | "payment" | "care" | "kvkk" | "other"
  message: string
  full_name: string
  email: string
  customer_id: string | null
  order_ref: string | null
  transcript: Array<{ role: "user" | "assistant"; text: string }> | null
}

const createTicketStep = createStep(
  "create-ticket",
  async (input: CreateTicketInput, { container }) => {
    const svc: SupportModuleService = container.resolve(SUPPORT_MODULE)
    const ticket = await svc.createSupportTickets({
      ticket_no: `ARN-DST-${year()}-${rand()}`,
      channel: input.channel,
      topic: input.topic,
      message: input.message,
      full_name: input.full_name,
      email: input.email.toLowerCase(),
      customer_id: input.customer_id,
      order_ref: input.order_ref,
      status: "open",
      transcript: input.transcript ? { messages: input.transcript } : null,
    })
    return new StepResponse({ id: ticket.id, ticket_no: ticket.ticket_no }, ticket.id)
  },
  async (id, { container }) => {
    if (!id) return
    const svc: SupportModuleService = container.resolve(SUPPORT_MODULE)
    await svc.deleteSupportTickets(id)
  },
)

const syncChatwootStep = createStep(
  "sync-chatwoot",
  async (input: { id: string; ticket_no: string; ticket: CreateTicketInput }, { container }) => {
    const ref = await getChatwootAdapter().createConversation({
      ticket_no: input.ticket_no,
      name: input.ticket.full_name,
      email: input.ticket.email,
      topic: input.ticket.topic,
      message: input.ticket.message,
      transcript: input.ticket.transcript,
    })
    const svc: SupportModuleService = container.resolve(SUPPORT_MODULE)
    await svc.updateSupportTickets({ id: input.id, external_ref: ref.external_ref })
    return new StepResponse(ref)
  },
)

const notifyTicketStep = createStep(
  "notify-ticket",
  async (input: { ticket_no: string; email: string }, { container }) => {
    const notifications = container.resolve(Modules.NOTIFICATION)
    await notifications.createNotifications({
      to: input.email,
      channel: "email",
      template: "support-ticket-created",
      content: {
        subject: `Talebin alındı · ${input.ticket_no}`,
        html: `<p>Talebin alındı. Talep no: <strong>${input.ticket_no}</strong>.</p><p>Mesai saatlerinde ortalama ilk yanıt süremiz 4 saattir (DEMO).</p><p>ARION · DEMO</p>`,
      },
      data: { ticket_no: input.ticket_no },
    })
    return new StepResponse(null)
  },
)

export const createSupportTicketWorkflow = createWorkflow(
  "create-support-ticket",
  (input: CreateTicketInput) => {
    const ticket = createTicketStep(input)
    syncChatwootStep({ id: ticket.id, ticket_no: ticket.ticket_no, ticket: input })
    notifyTicketStep({ ticket_no: ticket.ticket_no, email: input.email })
    return new WorkflowResponse(ticket)
  },
)

// ── İade talebi ──────────────────────────────────────────────────────────
export type CreateReturnInput = {
  order_id: string
  order_display_id: number
  email: string
  items: Array<{ line_id: string; title: string; variant: string | null; quantity: number; product_handle: string | null }>
  reason: "fit" | "dislike" | "defective" | "wrong_item"
  path: "withdrawal" | "defect" | "exchange"
  defect_remedy: "terminate" | "discount" | "repair" | "replace" | null
  exchange_note: string | null
  fit_result: "small" | "large" | "narrow" | "wide" | "other" | null
  within_withdrawal: boolean
  delivered_at: string
  withdrawal_deadline: string
  refund_due_at: string | null
}

const createReturnStep = createStep(
  "create-return",
  async (input: CreateReturnInput, { container }) => {
    const svc: SupportModuleService = container.resolve(SUPPORT_MODULE)
    const return_no = `ARN-RET-${year()}-${rand()}`
    const label = getShippingAdapter().createReturnLabel({ return_no })
    const rr = await svc.createReturnRequests({
      return_no,
      order_id: input.order_id,
      order_display_id: input.order_display_id,
      email: input.email.toLowerCase(),
      items: { items: input.items },
      reason: input.reason,
      path: input.path,
      defect_remedy: input.defect_remedy,
      exchange_note: input.exchange_note,
      within_withdrawal: input.within_withdrawal,
      delivered_at: new Date(input.delivered_at),
      withdrawal_deadline: new Date(input.withdrawal_deadline),
      return_code: label.return_code,
      status: "requested",
      refund_due_at: input.refund_due_at ? new Date(input.refund_due_at) : null,
    })
    return new StepResponse(
      { id: rr.id, return_no, return_code: label.return_code, carrier: label.carrier, refund_due_at: input.refund_due_at },
      rr.id,
    )
  },
  async (id, { container }) => {
    if (!id) return
    const svc: SupportModuleService = container.resolve(SUPPORT_MODULE)
    await svc.deleteReturnRequests(id)
  },
)

/** Uyum kaynaklı iadeler fit-engine'e ANONİM geri besleme olarak kaydedilir. */
const recordFitFeedbackStep = createStep(
  "record-fit-feedback",
  async (input: CreateReturnInput, { container }) => {
    if (input.reason !== "fit" || !input.fit_result) return new StepResponse(0)
    const svc: SupportModuleService = container.resolve(SUPPORT_MODULE)
    const rows = input.items.flatMap((i) =>
      i.product_handle
        ? [{ product_handle: i.product_handle, variant_title: i.variant ?? "", result: input.fit_result! }]
        : [],
    )
    if (rows.length) await svc.createFitFeedbacks(rows)
    return new StepResponse(rows.length)
  },
)

const notifyReturnStep = createStep(
  "notify-return",
  async (input: { email: string; return_no: string; return_code: string; carrier: string }, { container }) => {
    const notifications = container.resolve(Modules.NOTIFICATION)
    await notifications.createNotifications({
      to: input.email,
      channel: "email",
      template: "return-created",
      content: {
        subject: `İade talebin alındı · ${input.return_no}`,
        html: `<p>İade talebin alındı: <strong>${input.return_no}</strong>.</p><p>Ücretsiz iade kargo kodun: <strong>${input.return_code}</strong> (${input.carrier}). İade kargo ücreti ARION'a aittir.</p><p>ARION · DEMO</p>`,
      },
      data: { return_no: input.return_no },
    })
    return new StepResponse(null)
  },
)

export const createReturnRequestWorkflow = createWorkflow(
  "create-return-request",
  (input: CreateReturnInput) => {
    const rr = createReturnStep(input)
    recordFitFeedbackStep(input)
    notifyReturnStep({ email: input.email, return_no: rr.return_no, return_code: rr.return_code, carrier: rr.carrier })
    return new WorkflowResponse(rr)
  },
)

// ── Yönetici güncellemeleri ──────────────────────────────────────────────
export type UpdateTicketInput = { id: string; status: "open" | "pending" | "resolved"; responded: boolean }

const updateTicketStep = createStep(
  "update-ticket",
  async (input: UpdateTicketInput, { container }) => {
    const svc: SupportModuleService = container.resolve(SUPPORT_MODULE)
    const before = await svc.retrieveSupportTicket(input.id)
    const now = new Date()
    const updated = await svc.updateSupportTickets({
      id: input.id,
      status: input.status,
      first_response_at: before.first_response_at ?? (input.responded ? now : null),
      resolved_at: input.status === "resolved" ? now : null,
    })
    return new StepResponse(updated, {
      id: before.id,
      status: before.status,
      first_response_at: before.first_response_at,
      resolved_at: before.resolved_at,
    })
  },
  async (prev, { container }) => {
    if (!prev) return
    const svc: SupportModuleService = container.resolve(SUPPORT_MODULE)
    await svc.updateSupportTickets(prev)
  },
)

export const updateSupportTicketWorkflow = createWorkflow(
  "update-support-ticket",
  (input: UpdateTicketInput) => new WorkflowResponse(updateTicketStep(input)),
)

export type UpdateReturnInput = {
  id: string
  status: "requested" | "in_transit" | "received" | "refunded" | "rejected"
}

const updateReturnStep = createStep(
  "update-return",
  async (input: UpdateReturnInput, { container }) => {
    const svc: SupportModuleService = container.resolve(SUPPORT_MODULE)
    const before = await svc.retrieveReturnRequest(input.id)
    const updated = await svc.updateReturnRequests({
      id: input.id,
      status: input.status,
      refunded_at: input.status === "refunded" ? new Date() : null,
    })
    return new StepResponse(updated, { id: before.id, status: before.status, refunded_at: before.refunded_at })
  },
  async (prev, { container }) => {
    if (!prev) return
    const svc: SupportModuleService = container.resolve(SUPPORT_MODULE)
    await svc.updateReturnRequests(prev)
  },
)

export const updateReturnRequestWorkflow = createWorkflow(
  "update-return-request",
  (input: UpdateReturnInput) => new WorkflowResponse(updateReturnStep(input)),
)
