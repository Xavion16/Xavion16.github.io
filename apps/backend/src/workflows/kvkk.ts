import { DSR_RESPONSE_DAYS, type AcceptanceDocs } from "@arion/legal-texts"
import { Modules } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateCartWorkflow } from "@medusajs/medusa/core-flows"
import { randomBytes } from "node:crypto"
import { CONSENT_MODULE } from "../modules/consent"
import type ConsentModuleService from "../modules/consent/service"

const DAY = 24 * 60 * 60 * 1000

// ── KVKK m.11 başvurusu ──────────────────────────────────────────────────
export type CreateDsrInput = {
  type: "info" | "export" | "correct" | "delete" | "object" | "other"
  full_name: string
  email: string
  customer_id: string | null
  details: string | null
  /** Self-servis dışa aktarım gibi anında sonuçlananlar */
  resolve_immediately?: { note: string }
  notify: boolean
}

const createDsrStep = createStep(
  "create-dsr",
  async (input: CreateDsrInput, { container }) => {
    const svc: ConsentModuleService = container.resolve(CONSENT_MODULE)
    const now = new Date()
    const dsr = await svc.createDataSubjectRequests({
      reference: `ARN-KVKK-${now.getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`,
      type: input.type,
      status: input.resolve_immediately ? "resolved" : "received",
      full_name: input.full_name,
      email: input.email.toLowerCase(),
      customer_id: input.customer_id,
      details: input.details,
      received_at: now,
      due_at: input.resolve_immediately ? now : new Date(now.getTime() + DSR_RESPONSE_DAYS * DAY),
      resolved_at: input.resolve_immediately ? now : null,
      resolution_note: input.resolve_immediately?.note ?? null,
    })
    return new StepResponse({ reference: dsr.reference, email: dsr.email, due_at: dsr.due_at }, dsr.id)
  },
  async (id, { container }) => {
    if (!id) return
    const svc: ConsentModuleService = container.resolve(CONSENT_MODULE)
    await svc.deleteDataSubjectRequests(id)
  },
)

const notifyDsrStep = createStep(
  "notify-dsr",
  async (input: { reference: string; email: string; due_at: Date; notify: boolean }, { container }) => {
    if (!input.notify) return new StepResponse(null)
    const notifications = container.resolve(Modules.NOTIFICATION)
    await notifications.createNotifications({
      to: input.email,
      channel: "email",
      template: "kvkk-request-received",
      content: {
        subject: `KVKK başvurun alındı · ${input.reference}`,
        html: `<p>Başvurun alındı. Referans: <strong>${input.reference}</strong>.</p><p>En geç ${DSR_RESPONSE_DAYS} gün içinde yanıtlanacak (son tarih: ${new Date(input.due_at).toISOString().slice(0, 10)}). Kimliğini doğrulamak için seninle iletişime geçebiliriz.</p><p>ARION · DEMO</p>`,
      },
      data: { reference: input.reference },
    })
    return new StepResponse(null)
  },
)

export const createDataSubjectRequestWorkflow = createWorkflow(
  "create-data-subject-request",
  (input: CreateDsrInput) => {
    const dsr = createDsrStep(input)
    notifyDsrStep({ reference: dsr.reference, email: dsr.email, due_at: dsr.due_at, notify: input.notify })
    return new WorkflowResponse(dsr)
  },
)

// ── Başvuru durumu (yönetici) ────────────────────────────────────────────
export type UpdateDsrInput = {
  id: string
  status: "received" | "verifying" | "in_progress" | "resolved" | "rejected"
  resolution_note: string | null
}

const updateDsrStep = createStep(
  "update-dsr",
  async (input: UpdateDsrInput, { container }) => {
    const svc: ConsentModuleService = container.resolve(CONSENT_MODULE)
    const before = await svc.retrieveDataSubjectRequest(input.id)
    const done = input.status === "resolved" || input.status === "rejected"
    const updated = await svc.updateDataSubjectRequests({
      id: input.id,
      status: input.status,
      resolution_note: input.resolution_note,
      resolved_at: done ? new Date() : null,
    })
    return new StepResponse(updated, {
      id: before.id,
      status: before.status,
      resolution_note: before.resolution_note,
      resolved_at: before.resolved_at,
    })
  },
  async (prev, { container }) => {
    if (!prev) return
    const svc: ConsentModuleService = container.resolve(CONSENT_MODULE)
    await svc.updateDataSubjectRequests(prev)
  },
)

export const updateDataSubjectRequestWorkflow = createWorkflow(
  "update-data-subject-request",
  (input: UpdateDsrInput) => new WorkflowResponse(updateDsrStep(input)),
)

// ── Ön bilgilendirme + mesafeli satış onayı ──────────────────────────────
export type RecordAcceptanceInput = {
  cart_id: string
  cart_metadata: Record<string, unknown>
  docs: AcceptanceDocs
  locale: "tr" | "en"
  email: string | null
  customer_id: string | null
  ip: string | null
  user_agent: string | null
}

const recordAcceptanceStep = createStep(
  "record-acceptance",
  async (input: RecordAcceptanceInput, { container }) => {
    const svc: ConsentModuleService = container.resolve(CONSENT_MODULE)
    const now = new Date()
    const created = await svc.createLegalAcceptances(
      [input.docs.pre_contract, input.docs.distance_sales].map((d) => ({
        cart_id: input.cart_id,
        doc_key: d.key,
        doc_version: d.version,
        doc_hash: d.hash,
        locale: input.locale,
        email: input.email,
        customer_id: input.customer_id,
        accepted_at: now,
        ip: input.ip,
        user_agent: input.user_agent,
      })),
    )
    return new StepResponse(
      { accepted_at: now.toISOString() },
      created.map((c) => c.id),
    )
  },
  async (ids, { container }) => {
    if (!ids?.length) return
    const svc: ConsentModuleService = container.resolve(CONSENT_MODULE)
    await svc.deleteLegalAcceptances(ids)
  },
)

export const recordLegalAcceptanceWorkflow = createWorkflow(
  "record-legal-acceptance",
  (input: RecordAcceptanceInput) => {
    const acc = recordAcceptanceStep(input)
    const cartUpdate = transform({ input, acc }, ({ input, acc }) => ({
      id: input.cart_id,
      metadata: {
        ...input.cart_metadata,
        legal_acceptance: { ...input.docs, locale: input.locale, accepted_at: acc.accepted_at },
      },
    }))
    updateCartWorkflow.runAsStep({ input: cartUpdate })
    return new WorkflowResponse(acc)
  },
)
