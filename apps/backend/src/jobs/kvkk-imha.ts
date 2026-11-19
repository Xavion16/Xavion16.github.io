import { readdir, rm, stat } from "node:fs/promises"
import path from "node:path"
import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { CONSENT_MODULE } from "../modules/consent"
import type ConsentModuleService from "../modules/consent/service"

/**
 * Periyodik saklama-imha işi (Rapor §7.1.7; docs/legal/saklama-imha.md).
 * Her kural çalıştığında retention_log'a kayıt düşer (imha log'u).
 */
const DAY = 24 * 60 * 60 * 1000

export const RETENTION_RULES = {
  abandonedCartDays: 90,
  consentTechnicalDataDays: 365,
  outboxDays: 30,
} as const

export async function runRetention(container: MedusaContainer, now = new Date()) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const svc: ConsentModuleService = container.resolve(CONSENT_MODULE)
  const results: Array<{ rule: string; action: "delete" | "anonymize" | "destroy"; affected: number; note: string }> = []

  // 1) Terk edilmiş (tamamlanmamış) sepetler — adres/e-posta içerebilir
  const cartModule = container.resolve(Modules.CART)
  const cutoffCart = new Date(now.getTime() - RETENTION_RULES.abandonedCartDays * DAY)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: staleCarts } = await query.graph({
    entity: "cart",
    fields: ["id", "completed_at"],
    filters: { updated_at: { $lt: cutoffCart.toISOString() } },
    pagination: { take: 500 },
  })
  const oldCarts = staleCarts.filter((c) => !c.completed_at)
  if (oldCarts.length) await cartModule.deleteCarts(oldCarts.map((c) => c.id))
  results.push({
    rule: "terk-edilmis-sepet",
    action: "delete",
    affected: oldCarts.length,
    note: `${RETENTION_RULES.abandonedCartDays} günden eski tamamlanmamış sepetler`,
  })

  // 2) Rıza kayıtlarındaki IP/UA — rıza ispatı için kayıt kalır, teknik veri anonimleşir
  const cutoffConsent = new Date(now.getTime() - RETENTION_RULES.consentTechnicalDataDays * DAY)
  const oldConsents = await svc.listConsents(
    { created_at: { $lt: cutoffConsent }, ip: { $ne: null } },
    { select: ["id"], take: 1000 },
  )
  if (oldConsents.length) {
    await svc.updateConsents(oldConsents.map((c) => ({ id: c.id, ip: null, user_agent: null })))
  }
  results.push({
    rule: "riza-teknik-veri",
    action: "anonymize",
    affected: oldConsents.length,
    note: `${RETENTION_RULES.consentTechnicalDataDays} günü geçen rıza kayıtlarında IP/UA silindi`,
  })

  // 3) Geliştirme e-posta kutusu (.outbox) — kişisel veri içerir
  const dir = path.resolve(process.cwd(), ".outbox")
  let destroyed = 0
  for (const f of await readdir(dir).catch(() => [] as string[])) {
    const p = path.join(dir, f)
    const s = await stat(p).catch(() => null)
    if (s && now.getTime() - s.mtimeMs > RETENTION_RULES.outboxDays * DAY) {
      await rm(p, { force: true })
      destroyed++
    }
  }
  results.push({
    rule: "outbox-eposta",
    action: "destroy",
    affected: destroyed,
    note: `${RETENTION_RULES.outboxDays} günden eski e-posta dosyaları`,
  })

  await svc.createRetentionLogs(results.map((r) => ({ ...r, ran_at: now })))
  logger.info(`[kvkk-imha] ${results.map((r) => `${r.rule}=${r.affected}`).join(", ")}`)
  return results
}

export default async function kvkkImhaJob(container: MedusaContainer) {
  await runRetention(container)
}

export const config = {
  name: "kvkk-imha",
  // Her gece 03:30
  schedule: "30 3 * * *",
}
