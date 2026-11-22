import type { CategoryKey } from "./site"

/**
 * Dayanıklılık Kartı — kategori öncelikleri (Rapor §6.3 "kategoriler arası karşılaştırma").
 * 3 = yüksek, 2 = orta, 1 = düşük. Aynı test, topuklu ile botta aynı önemde değildir.
 */
export const METRIC_KEYS = ["flex_cycles", "abrasion", "waterproof_hours", "slip_wet", "heel_stability", "weight"] as const
export type MetricKey = (typeof METRIC_KEYS)[number]

export const CATEGORY_PRIORITY: Record<CategoryKey, Record<MetricKey, 1 | 2 | 3>> = {
  topuklu: { flex_cycles: 2, abrasion: 1, waterproof_hours: 1, slip_wet: 3, heel_stability: 3, weight: 2 },
  "kislik-bot": { flex_cycles: 2, abrasion: 3, waterproof_hours: 3, slip_wet: 3, heel_stability: 1, weight: 1 },
  sneaker: { flex_cycles: 3, abrasion: 2, waterproof_hours: 1, slip_wet: 2, heel_stability: 1, weight: 3 },
  klasik: { flex_cycles: 2, abrasion: 3, waterproof_hours: 1, slip_wet: 2, heel_stability: 1, weight: 1 },
  cocuk: { flex_cycles: 3, abrasion: 3, waterproof_hours: 2, slip_wet: 3, heel_stability: 1, weight: 2 },
}

/** Karşılaştırmada gösterilecek "zıt" kategori */
export const CONTRAST: Record<CategoryKey, CategoryKey> = {
  topuklu: "kislik-bot",
  "kislik-bot": "topuklu",
  sneaker: "klasik",
  klasik: "sneaker",
  cocuk: "sneaker",
}
