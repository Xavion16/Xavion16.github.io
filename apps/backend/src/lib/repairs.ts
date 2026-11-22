/**
 * Ömür Planı (Rapor §6.6): tamir ücret tahmini ve "Geri Al – Yeniden Doğ" kredisi. Tutarlar DEMO (TL, KDV dahil).
 */
export const REPAIR_TYPES = ["resole", "heel", "stitch", "clean", "recraft"] as const
export type RepairType = (typeof REPAIR_TYPES)[number]

const BASE: Record<RepairType, [number, number]> = {
  resole: [950, 1450],
  heel: [350, 600],
  stitch: [250, 450],
  clean: [300, 500],
  recraft: [0, 0],
}

/** Goodyear/Blake dikişli yapı yeniden tabanlanabilir; yapıştırma (cemented) taban değişimi daha pahalıdır. */
const CONSTRUCTION_FACTOR: Record<string, number> = {
  goodyear_welt: 1,
  blake: 1.05,
  cemented: 1.25,
  vulcanized: 1.4,
}

export type RepairQuote = { min: number; max: number; credit: number | null; feasible: boolean }

export function quoteRepair(type: RepairType, construction?: string | null, repairability?: number | null): RepairQuote {
  if (type === "recraft") {
    // Eski çift geri alınır; karşılığında indirim kredisi. Tamir edilebilirlik yüksekse kredi artar.
    const credit = 400 + Math.round(Math.min(10, Math.max(0, repairability ?? 5)) * 30)
    return { min: 0, max: 0, credit, feasible: true }
  }
  const factor = type === "resole" ? (CONSTRUCTION_FACTOR[construction ?? ""] ?? 1.2) : 1
  // Vulkanize tabanlarda taban değişimi pratik değildir
  const feasible = !(type === "resole" && construction === "vulcanized")
  const [lo, hi] = BASE[type]
  const round = (n: number) => Math.round(n / 10) * 10
  return { min: round(lo * factor), max: round(hi * factor), credit: null, feasible }
}
