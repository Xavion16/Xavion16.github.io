/**
 * İndirim referans fiyatı (Rapor §7.3 — Ticari Reklam ve Haksız Ticari Uygulamalar Yönetmeliği).
 *
 * 1 Ağustos 2026'dan itibaren: indirimli satışta "indirimden önceki fiyat" olarak,
 * indirimin başlangıcından önceki son N (=10) gün içinde uygulanan EN DÜŞÜK fiyat gösterilir.
 *
 * Kurallar:
 *  - Üstü çizili fiyat elle GİRİLMEZ; yalnızca fiyat geçmişinden hesaplanır.
 *  - İndirim başlangıcı = şu an geçerli fiyatın başladığı an.
 *  - Pencere: [başlangıç − N gün, başlangıç). Bu pencereyle kesişen her fiyat kaydı sayılır.
 *  - Referans fiyat şu anki fiyattan yüksek değilse indirim YOKTUR (üstü çizili fiyat gösterilmez).
 *  - Pencerede hiç kayıt yoksa indirim iddia edilemez (kanıt yok) → gösterilmez.
 */

export const DEFAULT_REFERENCE_DAYS = 10

const DAY_MS = 24 * 60 * 60 * 1000

export type PriceHistoryEntry = {
  /** Vergiler dahil fiyat (ana para birimi, örn. 2499.9 TRY) */
  price: number
  validFrom: Date
  /** null → hâlâ geçerli */
  validTo: Date | null
}

export type ReferencePriceResult = {
  currentPrice: number
  /** Üstü çizili gösterilecek fiyat; indirim yoksa null */
  referencePrice: number | null
  /** Tam sayıya yuvarlanmış indirim yüzdesi; indirim yoksa null */
  discountPercent: number | null
  /** İndirimin başlangıcı (şu anki fiyatın başladığı an) */
  discountStartedAt: Date | null
}

function isActiveAt(entry: PriceHistoryEntry, at: Date): boolean {
  const t = at.getTime()
  return (
    entry.validFrom.getTime() <= t &&
    (entry.validTo === null || entry.validTo.getTime() > t)
  )
}

function overlaps(entry: PriceHistoryEntry, from: Date, to: Date): boolean {
  const start = entry.validFrom.getTime()
  const end =
    entry.validTo === null ? Number.POSITIVE_INFINITY : entry.validTo.getTime()
  return start < to.getTime() && end > from.getTime()
}

function assertValid(entry: PriceHistoryEntry): void {
  if (!Number.isFinite(entry.price) || entry.price < 0) {
    throw new RangeError(`Geçersiz fiyat: ${entry.price}`)
  }
  if (
    entry.validTo !== null &&
    entry.validTo.getTime() <= entry.validFrom.getTime()
  ) {
    throw new RangeError("validTo, validFrom'dan sonra olmalı")
  }
}

/**
 * Bir varyantın fiyat geçmişinden, `now` anındaki fiyatı ve (varsa) yasal referans fiyatı hesaplar.
 * Geçerli kayıt bulunamazsa null döner.
 */
export function computeReferencePrice(
  history: readonly PriceHistoryEntry[],
  now: Date = new Date(),
  referenceDays: number = DEFAULT_REFERENCE_DAYS,
): ReferencePriceResult | null {
  if (!Number.isInteger(referenceDays) || referenceDays <= 0) {
    throw new RangeError(`Geçersiz gün sayısı: ${referenceDays}`)
  }
  history.forEach(assertValid)

  // Aynı anda birden fazla geçerli kayıt varsa en son başlayanı esas al
  const current = history
    .filter((e) => isActiveAt(e, now))
    .sort((a, b) => b.validFrom.getTime() - a.validFrom.getTime())[0]
  if (!current) return null

  const start = current.validFrom
  const windowFrom = new Date(start.getTime() - referenceDays * DAY_MS)
  const inWindow = history.filter(
    (e) => e !== current && overlaps(e, windowFrom, start),
  )

  const none: ReferencePriceResult = {
    currentPrice: current.price,
    referencePrice: null,
    discountPercent: null,
    discountStartedAt: null,
  }
  if (inWindow.length === 0) return none

  const lowest = Math.min(...inWindow.map((e) => e.price))
  if (lowest <= current.price) return none

  return {
    currentPrice: current.price,
    referencePrice: lowest,
    discountPercent: Math.round(((lowest - current.price) / lowest) * 100),
    discountStartedAt: start,
  }
}

/** Ortam değişkeninden gün sayısını okur (DISCOUNT_REFERENCE_DAYS); geçersizse varsayılan. */
export function referenceDaysFromEnv(value: string | undefined): number {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_REFERENCE_DAYS
}
