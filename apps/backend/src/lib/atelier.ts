/**
 * Atölye Takibi (Rapor §6.5): "Atölyede üretilir" siparişlerde zaman çizelgesi.
 * Kesim → Saya dikimi → Kalıba çekme → Taban montajı → Finisaj → Kalite kontrol → Kargo.
 * Adım tarihleri teslim süresine (lead_time_days) orantılı dağıtılır. Mesafeli satışta teslim ≤ 30 gün (§7.2).
 */
export const ATELIER_STEPS = ["cutting", "closing", "lasting", "sole", "finishing", "qc", "shipping"] as const
export type AtelierStepCode = (typeof ATELIER_STEPS)[number]

/** Toplam sürenin adımlara dağılımı (göreli ağırlık) */
const WEIGHTS: Record<AtelierStepCode, number> = {
  cutting: 2,
  closing: 4,
  lasting: 4,
  sole: 3,
  finishing: 2,
  qc: 1,
  shipping: 1,
}

/** Adımı yürüten ustalık alanı */
export const STEP_SPECIALTY: Record<AtelierStepCode, string> = {
  cutting: "cutting",
  closing: "closing",
  lasting: "lasting",
  sole: "sole",
  finishing: "finishing",
  qc: "qc",
  shipping: "qc",
}

export const MAX_LEAD_TIME_DAYS = 30

export type AtelierStep = { code: AtelierStepCode; at: string; done: boolean; current: boolean }

export function atelierTimeline(
  orderedAt: Date | string,
  leadTimeDays: number,
  now: Date = new Date(),
): { steps: AtelierStep[]; due_at: string; lead_time_days: number } {
  const days = Math.min(Math.max(1, Math.round(leadTimeDays)), MAX_LEAD_TIME_DAYS)
  const start = new Date(orderedAt).getTime()
  const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)
  let acc = 0
  const raw = ATELIER_STEPS.map((code) => {
    acc += WEIGHTS[code]
    const at = new Date(start + (acc / total) * days * 86_400_000)
    return { code, at: at.toISOString(), done: at.getTime() <= now.getTime() }
  })
  const firstOpen = raw.findIndex((s) => !s.done)
  const steps = raw.map((s, i) => ({ ...s, current: i === firstOpen }))
  return { steps, due_at: raw[raw.length - 1]!.at, lead_time_days: days }
}
