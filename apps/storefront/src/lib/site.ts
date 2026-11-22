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

/** Yasal sayfanın next-intl yol anahtarı (dile göre çevrilmiş slug). */
export function legalHref<S extends LegalSlug>(slug: S): `/yasal/${S}` {
  return `/yasal/${slug}`
}

/** Kategori grupları (DECISIONS #070): Erkek = klasik + kışlık bot + sneaker. Kadın tarafı yalnızca topuklu. */
export const CATEGORY_GROUPS = { erkek: ["klasik", "kislik-bot", "sneaker"] } as const satisfies Record<string, readonly CategoryKey[]>
export type GroupKey = keyof typeof CATEGORY_GROUPS
export function isGroupKey(v: string | undefined | null): v is GroupKey {
  return v === "erkek"
}
