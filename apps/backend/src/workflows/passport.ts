import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { randomBytes } from "node:crypto"
import { quoteRepair, type RepairType } from "../lib/repairs"
import { PASSPORT_MODULE } from "../modules/passport"
import type PassportModuleService from "../modules/passport/service"

const rand = (n = 3) => randomBytes(n).toString("hex").toUpperCase()

// ── Pasaport oluşturma (admin) ───────────────────────────────────────────
export type CreatePassportInput = { product_id: string; variant_id?: string | null; craftsman_id?: string | null }

const createPassportStep = createStep(
  "create-passport",
  async (input: CreatePassportInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "handle", "product_tech.last_code", "variants.id", "variants.options.value", "variants.options.option.title"],
      filters: { id: input.product_id },
    })
    const product = data[0]
    if (!product) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Ürün bulunamadı")
    const variant = input.variant_id ? product.variants?.find((v) => v?.id === input.variant_id) : null
    if (input.variant_id && !variant) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Varyant bulunamadı")

    const opt = (title: string) => variant?.options?.find((o) => o?.option?.title === title)?.value ?? null
    const svc: PassportModuleService = container.resolve(PASSPORT_MODULE)
    const [lasting] = input.craftsman_id ? [] : await svc.listArtisans({ specialty: "lasting" }, { take: 1 })
    const craftsmanId: string | undefined = input.craftsman_id ?? lasting?.id
    if (!craftsmanId) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Usta kaydı yok")
    const passport = await svc.createPassports({
      code: await svc.nextCode(),
      product_id: product.id,
      product_handle: product.handle,
      variant_id: variant?.id ?? null,
      variant_options: { color: opt("Renk"), size: opt("Numara"), width: opt("Genişlik") ?? "M" },
      last_code: product.product_tech?.last_code ?? "-",
      craftsman_id: craftsmanId,
      produced_at: new Date(),
      batch: `PRT-${new Date().toISOString().slice(0, 7).replace("-", "")}`,
      dpp: null,
      is_demo: true,
    })
    return new StepResponse(passport, passport.id)
  },
  async (id, { container }) => {
    if (!id) return
    const svc: PassportModuleService = container.resolve(PASSPORT_MODULE)
    await svc.deletePassports(id)
  },
)

export const createPassportWorkflow = createWorkflow("create-passport", (input: CreatePassportInput) => {
  const passport = createPassportStep(input)
  return new WorkflowResponse(passport)
})

// ── Tamir / Geri Al talebi ───────────────────────────────────────────────
export type CreateRepairInput = {
  type: RepairType
  passport_code: string | null
  customer_id: string | null
  full_name: string
  email: string
  description: string
  /** base64 (data URL değil) + MIME; en fazla 3 */
  photos: Array<{ mime: "image/jpeg" | "image/png" | "image/webp"; base64: string }>
}

const uploadRepairPhotosStep = createStep(
  "upload-repair-photos",
  async (input: { photos: CreateRepairInput["photos"] }, { container }) => {
    if (!input.photos.length) return new StepResponse({ urls: [] as string[] }, [] as string[])
    const files = container.resolve(Modules.FILE)
    const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const
    const created = await files.createFiles(
      input.photos.map((p, i) => ({
        filename: `repairs/${Date.now()}-${rand(4)}-${i}.${ext[p.mime]}`,
        mimeType: p.mime,
        content: p.base64,
        access: "private" as const,
      })),
    )
    return new StepResponse({ urls: created.map((f) => f.url) }, created.map((f) => f.id))
  },
  async (ids, { container }) => {
    if (!ids?.length) return
    await container.resolve(Modules.FILE).deleteFiles(ids)
  },
)

const createRepairStep = createStep(
  "create-repair",
  async (input: CreateRepairInput & { photo_urls: string[] }, { container }) => {
    const svc: PassportModuleService = container.resolve(PASSPORT_MODULE)
    let construction: string | null = null
    let repairability: number | null = null
    if (input.passport_code) {
      const [passport] = await svc.listPassports({ code: input.passport_code })
      if (!passport) throw new MedusaError(MedusaError.Types.NOT_FOUND, "passport_not_found")
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { data } = await query.graph({
        entity: "product",
        fields: ["product_tech.construction", "product_tech.repairability_score"],
        filters: { id: passport.product_id },
      })
      construction = data[0]?.product_tech?.construction ?? null
      repairability = data[0]?.product_tech?.repairability_score ?? null
    }
    const quote = quoteRepair(input.type, construction, repairability)
    if (!quote.feasible) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "not_feasible")
    const repair = await svc.createRepairOrders({
      reference: `ARN-TMR-${rand()}`,
      passport_code: input.passport_code,
      customer_id: input.customer_id,
      full_name: input.full_name,
      email: input.email.toLowerCase(),
      type: input.type,
      description: input.description,
      photos: { items: input.photo_urls },
      status: "received",
      quote_min: quote.min,
      quote_max: quote.max,
      credit_amount: quote.credit,
      // Ücretsiz gönderim kodu (mock kargo)
      shipping_code: `ARN-KRG-${rand(4)}`,
      public_note: null,
      completed_at: null,
    })
    return new StepResponse(repair, repair.id)
  },
  async (id, { container }) => {
    if (!id) return
    const svc: PassportModuleService = container.resolve(PASSPORT_MODULE)
    await svc.deleteRepairOrders(id)
  },
)

const notifyRepairStep = createStep(
  "notify-repair",
  async (input: { email: string; reference: string; shipping_code: string }, { container }) => {
    await container.resolve(Modules.NOTIFICATION).createNotifications({
      to: input.email,
      channel: "email",
      template: "repair-created",
      content: {
        subject: `Tamir talebin alındı · ${input.reference}`,
        html: `<p>Talep no: <strong>${input.reference}</strong></p><p>Ücretsiz gönderim kodun: <strong>${input.shipping_code}</strong> (DEMO kargo).</p><p>ARION · DEMO</p>`,
      },
      data: { reference: input.reference },
    })
    return new StepResponse(null)
  },
)

export const createRepairWorkflow = createWorkflow("create-repair", (input: CreateRepairInput) => {
  const uploaded = uploadRepairPhotosStep({ photos: input.photos })
  const repairInput = transform({ input, uploaded }, ({ input, uploaded }) => ({ ...input, photo_urls: uploaded.urls }))
  const repair = createRepairStep(repairInput)
  notifyRepairStep({ email: input.email, reference: repair.reference, shipping_code: repair.shipping_code })
  return new WorkflowResponse(repair)
})

// ── Tamir durumu güncelleme (admin) ──────────────────────────────────────
export type UpdateRepairInput = {
  id: string
  status?: "received" | "in_repair" | "completed" | "cancelled"
  public_note?: string | null
}

const updateRepairStep = createStep(
  "update-repair",
  async (input: UpdateRepairInput, { container }) => {
    const svc: PassportModuleService = container.resolve(PASSPORT_MODULE)
    const before = await svc.retrieveRepairOrder(input.id)
    const updated = await svc.updateRepairOrders({
      id: input.id,
      ...(input.status ? { status: input.status } : {}),
      ...(input.public_note !== undefined ? { public_note: input.public_note } : {}),
      ...(input.status === "completed" && !before.completed_at ? { completed_at: new Date() } : {}),
    })
    return new StepResponse(updated, {
      id: before.id,
      status: before.status,
      public_note: before.public_note,
      completed_at: before.completed_at,
    })
  },
  async (prev, { container }) => {
    if (!prev) return
    const svc: PassportModuleService = container.resolve(PASSPORT_MODULE)
    await svc.updateRepairOrders(prev)
  },
)

export const updateRepairWorkflow = createWorkflow("update-repair", (input: UpdateRepairInput) => {
  const repair = updateRepairStep(input)
  return new WorkflowResponse(repair)
})
