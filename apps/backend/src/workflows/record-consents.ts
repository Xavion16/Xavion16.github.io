import { CONSENT_TEXTS, COOKIE_POLICY_VERSION, type ConsentPurpose } from "@arion/legal-texts"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { getIysAdapter, type IysChannel } from "../lib/iys"
import { CONSENT_MODULE } from "../modules/consent"
import type ConsentModuleService from "../modules/consent/service"
import { FIT_TWIN_MODULE } from "../modules/fit-twin"
import type FitTwinModuleService from "../modules/fit-twin/service"

export const COOKIE_PURPOSES = ["cookie_functional", "cookie_analytics", "cookie_marketing"] as const
export type AnyPurpose = ConsentPurpose | (typeof COOKIE_PURPOSES)[number]

export type RecordConsentsInput = {
  subject_type: "customer" | "anonymous"
  subject_ref: string
  channel: "cookie_banner" | "register" | "account" | "checkout" | "other"
  changes: Partial<Record<AnyPurpose, boolean>>
  ip: string | null
  user_agent: string | null
}

function versionFor(purpose: AnyPurpose): string {
  if (purpose.startsWith("cookie_")) return COOKIE_POLICY_VERSION
  return CONSENT_TEXTS[purpose as ConsentPurpose].version
}

const IYS_CHANNEL: Partial<Record<AnyPurpose, IysChannel>> = {
  marketing_email: "EPOSTA",
  marketing_sms: "MESAJ",
}

/**
 * Rıza değişikliklerini kaydeder: yalnızca DURUMU DEĞİŞEN amaçlar için yeni satır ekler
 * (append-only). Pazarlama rızaları İYS'ye bildirilir.
 */
const recordConsentsStep = createStep(
  "record-consents",
  async (input: RecordConsentsInput, { container }) => {
    const svc: ConsentModuleService = container.resolve(CONSENT_MODULE)
    const current = await svc.currentConsents(input.subject_ref)
    const changed = Object.entries(input.changes).filter(
      ([purpose, granted]) =>
        typeof granted === "boolean" && (current[purpose]?.granted ?? false) !== granted,
    ) as Array<[AnyPurpose, boolean]>

    // Hiç kaydı olmayan çerez amaçları için "reddet" de ispat amaçlı kaydedilir
    const firstTimeCookies = Object.entries(input.changes).filter(
      ([purpose, granted]) => purpose.startsWith("cookie_") && granted === false && !current[purpose],
    ) as Array<[AnyPurpose, boolean]>

    const rows = [...changed, ...firstTimeCookies.filter(([p]) => !changed.some(([c]) => c === p))].map(
      ([purpose, granted]) => ({
        subject_type: input.subject_type,
        subject_ref: input.subject_ref,
        purpose,
        granted,
        text_version: versionFor(purpose),
        channel: input.channel,
        ip: input.ip,
        user_agent: input.user_agent,
      }),
    )
    const created = rows.length ? await svc.createConsents(rows) : []
    return new StepResponse({ created, changed }, created.map((c) => c.id))
  },
  async (ids, { container }) => {
    if (!ids?.length) return
    const svc: ConsentModuleService = container.resolve(CONSENT_MODULE)
    await svc.deleteConsents(ids)
  },
)

const syncIysStep = createStep(
  "sync-iys",
  async (
    input: { subject_type: string; subject_ref: string; changed: Array<[AnyPurpose, boolean]> },
    { container },
  ) => {
    const iysChanges = input.changed.filter(([p]) => IYS_CHANNEL[p])
    if (!iysChanges.length || input.subject_type !== "customer") return new StepResponse({ synced: 0 })

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "customer",
      fields: ["email", "phone"],
      filters: { id: input.subject_ref },
    })
    const customer = data[0]
    if (!customer) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Müşteri bulunamadı")

    const adapter = getIysAdapter()
    const svc: ConsentModuleService = container.resolve(CONSENT_MODULE)
    let synced = 0
    for (const [purpose, granted] of iysChanges) {
      const channel = IYS_CHANNEL[purpose]!
      const recipient = channel === "EPOSTA" ? customer.email : customer.phone
      if (!recipient) continue
      const status = granted ? "ONAY" : "RET"
      const res = await adapter.sync({
        channel,
        recipient,
        status,
        source: "HS_WEB",
        consentDate: new Date().toISOString(),
      })
      await svc.createIysSyncs({
        channel,
        recipient,
        status,
        source: "HS_WEB",
        mode: adapter.mode,
        synced_at: new Date(),
        response: res.response,
      })
      synced++
    }
    return new StepResponse({ synced })
  },
)

/** Ayak İkizi rızası geri alınırsa ölçüler kalıcı olarak silinir (Rapor §6.1). */
const purgeFitTwinOnRevokeStep = createStep(
  "purge-fit-twin-on-revoke",
  async (input: { subject_type: string; subject_ref: string; changed: Array<[AnyPurpose, boolean]> }, { container }) => {
    const revoked = input.changed.some(([p, g]) => p === "fit_twin" && !g)
    if (!revoked || input.subject_type !== "customer") return new StepResponse({ purged: 0 })
    const svc: FitTwinModuleService = container.resolve(FIT_TWIN_MODULE)
    return new StepResponse({ purged: await svc.purge(input.subject_ref) })
  },
)

export const recordConsentsWorkflow = createWorkflow(
  "record-consents",
  (input: RecordConsentsInput) => {
    const result = recordConsentsStep(input)
    syncIysStep({
      subject_type: input.subject_type,
      subject_ref: input.subject_ref,
      changed: result.changed,
    })
    purgeFitTwinOnRevokeStep({
      subject_type: input.subject_type,
      subject_ref: input.subject_ref,
      changed: result.changed,
    })
    return new WorkflowResponse(result)
  },
)
