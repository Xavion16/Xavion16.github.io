import { CONSENT_TEXTS } from "@arion/legal-texts"
import { MedusaError } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { CONSENT_MODULE } from "../modules/consent"
import type ConsentModuleService from "../modules/consent/service"
import { FIT_TWIN_MODULE } from "../modules/fit-twin"
import type FitTwinModuleService from "../modules/fit-twin/service"
import type { FootProfileData } from "../modules/fit-twin/service"

/**
 * Ayak İkizi kaydı (Rapor §6.1): yalnızca GEÇERLİ `fit_twin` açık rızası varsa yazılır.
 * Rıza kaydı bu iş akışından önce `recordConsentsWorkflow` ile alınır; burada yeniden doğrulanır.
 */
const requireFitTwinConsentStep = createStep(
  "require-fit-twin-consent",
  async (input: { customer_id: string }, { container }) => {
    const consents: ConsentModuleService = container.resolve(CONSENT_MODULE)
    const current = await consents.currentConsents(input.customer_id)
    const c = current.fit_twin
    if (!c?.granted || c.version !== CONSENT_TEXTS.fit_twin.version) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "consent_required")
    }
    return new StepResponse({ version: c.version })
  },
)

type SaveInput = { customer_id: string; profile: FootProfileData }

const saveProfileStep = createStep(
  "save-profile",
  async (input: SaveInput & { consent_version: string }, { container }) => {
    const svc: FitTwinModuleService = container.resolve(FIT_TWIN_MODULE)
    const [before] = await svc.listFootProfiles({ customer_id: input.customer_id })
    await svc.saveProfile(input.customer_id, input.profile, input.consent_version)
    return new StepResponse({ saved: true }, { customer_id: input.customer_id, before })
  },
  async (comp, { container }) => {
    if (!comp) return
    const svc: FitTwinModuleService = container.resolve(FIT_TWIN_MODULE)
    if (comp.before) {
      await svc.updateFootProfiles({ id: comp.before.id, sealed: comp.before.sealed, consent_version: comp.before.consent_version })
    } else {
      await svc.purge(comp.customer_id)
    }
  },
)

export const saveFitTwinWorkflow = createWorkflow("save-fit-twin", (input: SaveInput) => {
  const consent = requireFitTwinConsentStep({ customer_id: input.customer_id })
  const result = saveProfileStep({ customer_id: input.customer_id, profile: input.profile, consent_version: consent.version })
  return new WorkflowResponse(result)
})

/** "Ayak İkizimi sil": kalıcı silme. Geri alınamaz (telafi adımı yok — bilinçli). */
export const purgeFootProfileStep = createStep("purge-foot-profile", async (input: { customer_id: string }, { container }) => {
  const svc: FitTwinModuleService = container.resolve(FIT_TWIN_MODULE)
  const deleted = await svc.purge(input.customer_id)
  return new StepResponse({ deleted })
})

export const purgeFitTwinWorkflow = createWorkflow("purge-fit-twin", (input: { customer_id: string }) => {
  const result = purgeFootProfileStep(input)
  return new WorkflowResponse(result)
})
