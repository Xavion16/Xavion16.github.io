export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000"

/** Footer ve yasal yönlendirmelerde kullanılan sayfa anahtarları (Rapor §5). */
export const LEGAL_SLUGS = [
  "kvkk-aydinlatma",
  "gizlilik",
  "cerez-politikasi",
  "acik-riza",
  "kvkk-basvuru",
  "mesafeli-satis",
  "on-bilgilendirme",
  "iade-politikasi",
  "uyelik-sozlesmesi",
  "kullanim-kosullari",
  "ticari-ileti",
  "kunye",
  "erisilebilirlik",
] as const

export type LegalSlug = (typeof LEGAL_SLUGS)[number]

export function isLegalSlug(value: string): value is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(value)
}

export const CATEGORY_KEYS = [
  "topuklu",
  "kislik-bot",
  "sneaker",
  "klasik",
  "cocuk",
] as const

export type CategoryKey = (typeof CATEGORY_KEYS)[number]
