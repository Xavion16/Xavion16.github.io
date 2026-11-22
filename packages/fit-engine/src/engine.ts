// ARION uyum motoru — Ayak İkizi × Kalıp (Rapor §6.1).
// Saf TypeScript, yan etkisiz. Her zaman milimetreyle çalışır; numara yalnızca çıktıdır.
// Sağlık teşhisi DİLİ KULLANILMAZ: gerekçeler yalnızca ölçü farkını anlatır.

export type WidthFitting = "N" | "M" | "W"
export type ArchType = "flat" | "normal" | "high"
export type FitPreference = "snug" | "regular" | "roomy"
export type FitCategory =
  "topuklu" | "kislik-bot" | "sneaker" | "klasik" | "cocuk"

export type FootProfile = {
  /** Topuktan en uzun parmak ucuna, mm */
  lengthMm: number
  /** Ön ayağın en geniş yeri, mm */
  ballWidthMm: number
  /** Ön ayak çevresi (opsiyonel), mm */
  girthMm?: number | null
  archType: ArchType
  preference: FitPreference
}

export type SizeRow = {
  eu_size: number
  length_mm: number
  ball_width_mm: number
  girth_mm: number
  width_fitting: WidthFitting
}

export type LastInput = {
  code: string
  category: string
  rows: SizeRow[]
}

export type CategoryRule = {
  /** Kalıp uzunluğu − ayak uzunluğu için ideal pay (mm): parmak payı (+ çorap / büyüme payı) */
  allowanceMm: number
  /** Kalıp ön ayak genişliği − ayak genişliği için ideal fark (mm) */
  ballDeltaMm: number
  /** Skordaki ağırlıklar (toplam 1) */
  weights: { length: number; width: number; girth: number }
  /** Ek pay açıklaması (gerekçede gösterilir) */
  extra?: "sock" | "growth"
}

/**
 * Kategori kuralları. Topukluda ayak öne kaydığı için ön ayak genişliği daha ağır basar;
 * kışlık botta kalın çorap payı, çocukta büyüme payı uzunluğa eklenir.
 */
export const CATEGORY_RULES: Record<FitCategory, CategoryRule> = {
  topuklu: {
    allowanceMm: 10,
    ballDeltaMm: 0,
    weights: { length: 0.35, width: 0.5, girth: 0.15 },
  },
  "kislik-bot": {
    allowanceMm: 17,
    ballDeltaMm: 2,
    weights: { length: 0.55, width: 0.3, girth: 0.15 },
    extra: "sock",
  },
  sneaker: {
    allowanceMm: 14,
    ballDeltaMm: 1,
    weights: { length: 0.55, width: 0.35, girth: 0.1 },
  },
  klasik: {
    allowanceMm: 12,
    ballDeltaMm: 0,
    weights: { length: 0.5, width: 0.35, girth: 0.15 },
  },
  cocuk: {
    allowanceMm: 17,
    ballDeltaMm: 2,
    weights: { length: 0.7, width: 0.25, girth: 0.05 },
    extra: "growth",
  },
}

const DEFAULT_RULE: CategoryRule = CATEGORY_RULES.klasik

/** Tercih payları: sıkı ↔ rahat */
const PREFERENCE_SHIFT: Record<
  FitPreference,
  { length: number; width: number }
> = {
  snug: { length: -2, width: -1 },
  regular: { length: 0, width: 0 },
  roomy: { length: 2, width: 2 },
}

/** Kısa/dar taraf uzun/geniş taraftan daha çok cezalandırılır (sıkan ayakkabı iade edilir). */
const PENALTY = {
  lengthShort: 7,
  lengthLong: 3.5,
  widthNarrow: 6,
  widthWide: 3,
  girth: 1.5,
}

export const PROFILE_LIMITS = {
  lengthMm: { min: 100, max: 340 },
  ballWidthMm: { min: 40, max: 140 },
  girthMm: { min: 120, max: 340 },
} as const

export type ProfileError =
  "length_range" | "width_range" | "girth_range" | "ratio"

/** Ölçüler makul aralıkta mı? (Saf doğrulama — arayüz ayrıca Zod kullanır.) */
export function validateProfile(p: FootProfile): ProfileError[] {
  const errors: ProfileError[] = []
  const inRange = (v: number, r: { min: number; max: number }) =>
    Number.isFinite(v) && v >= r.min && v <= r.max
  if (!inRange(p.lengthMm, PROFILE_LIMITS.lengthMm)) errors.push("length_range")
  if (!inRange(p.ballWidthMm, PROFILE_LIMITS.ballWidthMm))
    errors.push("width_range")
  if (p.girthMm != null && !inRange(p.girthMm, PROFILE_LIMITS.girthMm))
    errors.push("girth_range")
  if (!errors.length) {
    const ratio = p.ballWidthMm / p.lengthMm
    // Genişlik uzunluğun %28–%50'si dışında ise büyük olasılıkla ölçüm hatası
    if (ratio < 0.28 || ratio > 0.5) errors.push("ratio")
  }
  return errors
}

export function ruleFor(category: string): CategoryRule {
  return (
    (CATEGORY_RULES as Record<string, CategoryRule>)[category] ?? DEFAULT_RULE
  )
}

export type Reason =
  | { code: "length_ok" }
  | { code: "length_short"; mm: number }
  | { code: "length_long"; mm: number }
  | { code: "width_ok" }
  | { code: "width_narrow"; mm: number; suggest?: WidthFitting }
  | { code: "width_wide"; mm: number; suggest?: WidthFitting }
  | { code: "girth_tight"; mm: number }
  | { code: "extra_sock"; mm: number }
  | { code: "extra_growth" }
  | { code: "arch_high" }
  | { code: "preference"; preference: Exclude<FitPreference, "regular"> }
  | { code: "no_good_size" }

export type RowScore = {
  row: SizeRow
  score: number
  /** Kırpılmamış skor: sıralama için (bütün satırlar 0'a düştüğünde de en yakın numara bulunur) */
  raw: number
  /** (kalıp − ayak) − ideal pay; negatif = kısa */
  lengthDeltaMm: number
  /** (kalıp − ayak) − ideal fark; negatif = dar */
  widthDeltaMm: number
  girthDeltaMm: number | null
}

const round1 = (n: number) => Math.round(n * 10) / 10
const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n))

/** Tek bir numara × genişlik satırı için 0–100 skor. */
export function scoreRow(
  profile: FootProfile,
  row: SizeRow,
  rule: CategoryRule,
): RowScore {
  const shift = PREFERENCE_SHIFT[profile.preference]
  const lengthDelta =
    row.length_mm - profile.lengthMm - (rule.allowanceMm + shift.length)
  const widthDelta =
    row.ball_width_mm - profile.ballWidthMm - (rule.ballDeltaMm + shift.width)

  const lengthPenalty =
    lengthDelta < 0
      ? -lengthDelta * PENALTY.lengthShort
      : lengthDelta * PENALTY.lengthLong
  const widthPenalty =
    widthDelta < 0
      ? -widthDelta * PENALTY.widthNarrow
      : widthDelta * PENALTY.widthWide

  let girthDelta: number | null = null
  let girthScore = 100
  if (profile.girthMm != null) {
    // Yüksek kemerde üst yüzey hacmi önemlidir → çevre payı biraz artar
    const archExtra = profile.archType === "high" ? 4 : 0
    girthDelta = row.girth_mm - profile.girthMm - archExtra
    girthScore =
      girthDelta < 0
        ? clamp(100 + girthDelta * PENALTY.girth * 2)
        : clamp(100 - girthDelta * PENALTY.girth)
  }

  const { length: wl, width: ww, girth: wg } = rule.weights
  // Çevre ölçüsü yoksa ağırlığı uzunluk ve genişliğe dağıtılır
  const total = profile.girthMm != null ? 1 : wl + ww
  const girthPart = profile.girthMm != null ? wg * girthScore : 0
  const score =
    (wl / total) * clamp(100 - lengthPenalty) +
    (ww / total) * clamp(100 - widthPenalty) +
    girthPart
  const raw =
    (wl / total) * (100 - lengthPenalty) +
    (ww / total) * (100 - widthPenalty) +
    girthPart

  return {
    row,
    score: Math.round(clamp(score)),
    raw: round1(raw),
    lengthDeltaMm: round1(lengthDelta),
    widthDeltaMm: round1(widthDelta),
    girthDeltaMm: girthDelta == null ? null : round1(girthDelta),
  }
}

export type FitResult = {
  score: number
  recommendedSize: number | null
  recommendedWidth: WidthFitting | null
  reasons: Reason[]
  /** Skora göre sıralı tüm satırlar (en iyi önce) */
  ranked: RowScore[]
}

export type FitOptions = {
  /** Ürünün sattığı numaralar (yoksa tablodaki tümü) */
  sizes?: number[]
  /** Ürünün sattığı genişlikler (yoksa tablodaki tümü) */
  widths?: WidthFitting[]
}

/** Bir satırın ölçü farklarını açıklanabilir gerekçelere çevirir. */
export function explain(
  profile: FootProfile,
  best: RowScore,
  rule: CategoryRule,
  available: SizeRow[],
): Reason[] {
  const reasons: Reason[] = []
  const L = best.lengthDeltaMm
  if (L < -2) reasons.push({ code: "length_short", mm: Math.round(-L) })
  else if (L > 4) reasons.push({ code: "length_long", mm: Math.round(L) })
  else reasons.push({ code: "length_ok" })

  const W = best.widthDeltaMm
  const sameSize = available.filter((r) => r.eu_size === best.row.eu_size)
  const wider = sameSize.find((r) => r.ball_width_mm > best.row.ball_width_mm)
  const narrower = sameSize.find(
    (r) => r.ball_width_mm < best.row.ball_width_mm,
  )
  if (W < -2) {
    reasons.push({
      code: "width_narrow",
      mm: Math.round(-W),
      ...(wider ? { suggest: wider.width_fitting } : {}),
    })
  } else if (W > 4) {
    reasons.push({
      code: "width_wide",
      mm: Math.round(W),
      ...(narrower ? { suggest: narrower.width_fitting } : {}),
    })
  } else if (best.row.width_fitting !== "M" && W >= -2) {
    // Önerilen satır zaten geniş/dar ise, M'ye göre farkı söyle
    const m = sameSize.find((r) => r.width_fitting === "M")
    if (m) {
      const mDelta = round1(
        m.ball_width_mm - profile.ballWidthMm - rule.ballDeltaMm,
      )
      if (best.row.width_fitting === "W" && mDelta < 0) {
        reasons.push({
          code: "width_narrow",
          mm: Math.round(-mDelta),
          suggest: "W",
        })
      } else if (best.row.width_fitting === "N" && mDelta > 0) {
        reasons.push({
          code: "width_wide",
          mm: Math.round(mDelta),
          suggest: "N",
        })
      } else reasons.push({ code: "width_ok" })
    } else reasons.push({ code: "width_ok" })
  } else reasons.push({ code: "width_ok" })

  if (best.girthDeltaMm != null && best.girthDeltaMm < -3) {
    reasons.push({ code: "girth_tight", mm: Math.round(-best.girthDeltaMm) })
  }
  if (rule.extra === "sock") reasons.push({ code: "extra_sock", mm: 4 })
  if (rule.extra === "growth") reasons.push({ code: "extra_growth" })
  if (profile.archType === "high") reasons.push({ code: "arch_high" })
  if (profile.preference !== "regular")
    reasons.push({ code: "preference", preference: profile.preference })
  return reasons
}

/** Ana fonksiyon: profil × kalıp → skor, önerilen numara/genişlik, gerekçeler. */
export function fit(
  profile: FootProfile,
  last: LastInput,
  opts: FitOptions = {},
): FitResult {
  const rule = ruleFor(last.category)
  const available = last.rows.filter(
    (r) =>
      (!opts.sizes || opts.sizes.includes(r.eu_size)) &&
      (!opts.widths || opts.widths.includes(r.width_fitting)),
  )
  if (!available.length) {
    return {
      score: 0,
      recommendedSize: null,
      recommendedWidth: null,
      reasons: [{ code: "no_good_size" }],
      ranked: [],
    }
  }
  const ranked = available
    .map((row) => scoreRow(profile, row, rule))
    .sort(
      (a, b) =>
        b.raw - a.raw ||
        // eşitlikte: M genişlik, sonra kısa değil uzun tarafta kalan
        Number(b.row.width_fitting === "M") -
          Number(a.row.width_fitting === "M") ||
        Math.abs(a.lengthDeltaMm) - Math.abs(b.lengthDeltaMm),
    )
  const best = ranked[0]!
  const reasons = explain(profile, best, rule, available)
  if (best.score < 50) reasons.unshift({ code: "no_good_size" })
  return {
    score: best.score,
    recommendedSize: best.row.eu_size,
    recommendedWidth: best.row.width_fitting,
    reasons,
    ranked,
  }
}

/** Seçili numara × genişlik için skor (ürün sayfasında seçim değiştikçe). */
export function scoreSelection(
  profile: FootProfile,
  last: LastInput,
  size: number,
  width: WidthFitting = "M",
): RowScore | null {
  const row = last.rows.find(
    (r) => r.eu_size === size && r.width_fitting === width,
  )
  return row ? scoreRow(profile, row, ruleFor(last.category)) : null
}

export type FitBand = "great" | "good" | "fair" | "poor"
export function band(score: number): FitBand {
  if (score >= 85) return "great"
  if (score >= 70) return "good"
  if (score >= 50) return "fair"
  return "poor"
}

/** "Bana uyanlar" eşiği */
export const FITS_ME_THRESHOLD = 70
