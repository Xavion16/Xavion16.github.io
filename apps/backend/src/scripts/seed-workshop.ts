import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PASSPORT_MODULE } from "../modules/passport"
import type PassportModuleService from "../modules/passport/service"
import { SUPPORT_MODULE } from "../modules/support"
import type SupportModuleService from "../modules/support/service"

/**
 * Atölye demo verisi (Rapor §6.4–6.6, §2.3): ustalar, pasaportlar, tamamlanmış tamirler ve
 * Şeffaflık Paneli için örnek destek yanıt süreleri. Tamamı DEMO; kişiler kurgusaldır.
 * seed-arion.ts sonunda çağrılır (ürünler her seed'de yeniden oluştuğu için pasaportlar da yenilenir).
 */
const DAY = 86_400_000
const MONTH = 30.44 * DAY

const CRAFTSMEN = [
  { specialty: "cutting", name: "Selim Arslan", since_year: 1998, tr: "Deriyi damarına göre okur; kesimde fire payını en aza indirir.", en: "Reads leather by its grain and keeps cutting waste to a minimum." },
  { specialty: "closing", name: "Nazan Yıldız", since_year: 2004, tr: "Saya dikiminde çift iğne ve el dikişi uzmanı.", en: "Upper closing specialist, twin-needle and hand stitching." },
  { specialty: "lasting", name: "Hüseyin Demir", since_year: 1991, tr: "Sayayı kalıba elle çeker; ARION kalıplarının çoğunu o düzeltti.", en: "Lasts uppers by hand; refined most of the ARION lasts." },
  { specialty: "sole", name: "Emre Kaya", since_year: 2009, tr: "Goodyear ve Blake taban montajı; yeniden tabanlamaları o yapar.", en: "Goodyear and Blake sole attachment; handles all resoling." },
  { specialty: "finishing", name: "Derya Şahin", since_year: 2012, tr: "Boya, cila ve kenar finisajı.", en: "Dye, polish and edge finishing." },
  { specialty: "qc", name: "Mert Öztürk", since_year: 2015, tr: "Her çifti 24 noktalı kontrol listesiyle teslim alır.", en: "Signs off every pair with a 24-point checklist." },
]

/** Sabit pasaport kodları: demo senaryosu ARN-2026-000123 (Adrastus Oxford, tamir geçmişli) üzerinden anlatılır. */
const PASSPORTS: Array<{ code: string; handle: string; monthsAgo: number }> = [
  { code: "ARN-2026-000123", handle: "adrastus-oxford", monthsAgo: 10 },
  { code: "ARN-2024-000418", handle: "olympos-dag-botu", monthsAgo: 26 },
  { code: "ARN-2025-000207", handle: "zephyros-kosu", monthsAgo: 14 },
  { code: "ARN-2025-000311", handle: "selene-stiletto", monthsAgo: 12 },
  { code: "ARN-2024-000502", handle: "hephaistos-vulkanize", monthsAgo: 30 },
  { code: "ARN-2026-000140", handle: "boreas-termal-bot", monthsAgo: 3 },
]

const REPAIRS: Array<{
  code: string
  type: "resole" | "heel" | "stitch" | "clean" | "recraft"
  afterMonths: number
  note: string
  quote: [number, number]
  credit?: number
}> = [
  { code: "ARN-2026-000123", type: "clean", afterMonths: 4, note: "Bakım ve cila; deri nemlendirildi.", quote: [300, 500] },
  { code: "ARN-2026-000123", type: "resole", afterMonths: 9, note: "Goodyear taban değişimi; saya ve astar korundu.", quote: [950, 1450] },
  { code: "ARN-2024-000418", type: "stitch", afterMonths: 11, note: "Bilek dikişi yenilendi.", quote: [250, 450] },
  { code: "ARN-2024-000418", type: "resole", afterMonths: 22, note: "Diş derinliği azalan dış taban değiştirildi.", quote: [1190, 1810] },
  { code: "ARN-2025-000207", type: "clean", afterMonths: 8, note: "Derin temizlik.", quote: [300, 500] },
  { code: "ARN-2025-000311", type: "heel", afterMonths: 7, note: "Topuk ucu (kapak) yenilendi.", quote: [350, 600] },
  { code: "ARN-2024-000502", type: "recraft", afterMonths: 28, note: "Geri alındı; kauçuk taban geri dönüşüme, kanvas yeniden kullanıma ayrıldı.", quote: [0, 0], credit: 640 },
]

export async function seedWorkshop(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const svc: PassportModuleService = container.resolve(PASSPORT_MODULE)
  const support: SupportModuleService = container.resolve(SUPPORT_MODULE)

  // Önceki demo kayıtları
  const [oldRepairs, oldPassports, oldArtisans] = await Promise.all([
    svc.listRepairOrders({ email: "demo-musteri@arion.example" }),
    svc.listPassports({ is_demo: true }),
    svc.listArtisans({ is_demo: true }),
  ])
  if (oldRepairs.length) await svc.deleteRepairOrders(oldRepairs.map((r) => r.id))
  if (oldPassports.length) await svc.deletePassports(oldPassports.map((p) => p.id))
  if (oldArtisans.length) await svc.deleteArtisans(oldArtisans.map((a) => a.id))

  const artisans = await svc.createArtisans(
    CRAFTSMEN.map((c) => ({
      name: c.name,
      specialty: c.specialty,
      since_year: c.since_year,
      bio: { tr: c.tr, en: c.en },
      is_demo: true,
    })),
  )
  const lasting = artisans.find((a) => a.specialty === "lasting")!
  const sole = artisans.find((a) => a.specialty === "sole")!

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "product_tech.last_code", "variants.id", "variants.options.value", "variants.options.option.title"],
    filters: { handle: PASSPORTS.map((p) => p.handle) },
  })
  const now = Date.now()
  const passports = await svc.createPassports(
    PASSPORTS.flatMap((p, i) => {
      const product = products.find((x) => x.handle === p.handle)
      if (!product) return []
      const variant = product.variants?.[Math.min(i + 2, (product.variants?.length ?? 1) - 1)]
      const opt = (t: string) => variant?.options?.find((o) => o?.option?.title === t)?.value ?? null
      const produced = new Date(now - p.monthsAgo * MONTH)
      return [
        {
          code: p.code,
          product_id: product.id,
          product_handle: product.handle,
          variant_id: variant?.id ?? null,
          variant_options: { color: opt("Renk"), size: opt("Numara"), width: opt("Genişlik") ?? "M" },
          last_code: product.product_tech?.last_code ?? "-",
          craftsman_id: i % 2 === 0 ? lasting.id : sole.id,
          produced_at: produced,
          batch: `PRT-${produced.toISOString().slice(0, 7).replace("-", "")}`,
          dpp: { recycled_share_pct: 18 + i * 3, carbon_kg_demo: 9.5 + i, repairable: true },
          is_demo: true,
        },
      ]
    }),
  )

  await svc.createRepairOrders(
    REPAIRS.flatMap((r, i) => {
      const p = PASSPORTS.find((x) => x.code === r.code)
      if (!p || !passports.some((x) => x.code === r.code)) return []
      const completed = new Date(now - (p.monthsAgo - r.afterMonths) * MONTH)
      return [
        {
          reference: `ARN-TMR-DEMO${String(i + 1).padStart(2, "0")}`,
          passport_code: r.code,
          customer_id: null,
          full_name: "Demo Müşteri",
          email: "demo-musteri@arion.example",
          type: r.type,
          description: "DEMO kaydı",
          photos: { items: [] },
          status: "completed" as const,
          quote_min: r.quote[0],
          quote_max: r.quote[1],
          credit_amount: r.credit ?? null,
          shipping_code: `ARN-KRG-DEMO${i + 1}`,
          public_note: r.note,
          completed_at: completed,
        },
      ]
    }),
  )

  // Şeffaflık Paneli: örnek ilk yanıt süreleri (DEMO, çözülmüş talepler)
  const oldTickets = await support.listSupportTickets({ email: "demo-musteri@arion.example" })
  if (oldTickets.length) await support.deleteSupportTickets(oldTickets.map((t) => t.id))
  const hours = [1.2, 2.5, 3.1, 0.8, 4.4, 2.0]
  await support.createSupportTickets(
    hours.map((h, i) => {
      const created = new Date(now - (i + 2) * DAY)
      return {
        ticket_no: `ARN-DST-DEMO-${String(i + 1).padStart(2, "0")}`,
        channel: (i % 2 ? "chat" : "form") as "chat" | "form",
        topic: (["size_fit", "shipping", "care", "return", "order", "size_fit"] as const)[i]!,
        message: "DEMO kaydı",
        full_name: "Demo Müşteri",
        email: "demo-musteri@arion.example",
        customer_id: null,
        order_ref: null,
        status: "resolved" as const,
        transcript: null,
        external_ref: null,
        first_response_at: new Date(created.getTime() + h * 3_600_000),
        resolved_at: new Date(created.getTime() + (h + 20) * 3_600_000),
        created_at: created,
      }
    }),
  )

  logger.info(`Atölye: ${artisans.length} usta, ${passports.length} pasaport, ${REPAIRS.length} tamir kaydı (DEMO).`)
}

/** Tek başına: npx medusa exec ./src/scripts/seed-workshop.ts (ürünleri yeniden oluşturmadan) */
export default async function run({ container }: { container: MedusaContainer }) {
  await seedWorkshop(container)
}
