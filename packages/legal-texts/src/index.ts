import {
  COOKIE_CATEGORIES,
  COOKIE_INVENTORY,
  COOKIE_POLICY_VERSION,
  type CookieCategory,
} from "./cookies"
import { CONSENT_PURPOSES, CONSENT_TEXTS } from "./consents"
import { buildDistanceSalesContract, buildPreContractInfo } from "./contracts"
import { EN_DOCS } from "./texts/en"
import { TR_PRIVACY } from "./texts/tr-privacy"
import { TR_TERMS } from "./texts/tr-terms"
import type { LegalDoc, LegalSlug, Locale } from "./types"

export * from "./config"
export * from "./consents"
export * from "./contracts"
export * from "./cookies"
export * from "./types"
export * from "./cart-input"
export { contentHash } from "./hash"
import { contentHash } from "./hash"

export const LEGAL_SLUGS: LegalSlug[] = [
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
]

const TR_DOCS: Record<string, LegalDoc> = { ...TR_PRIVACY, ...TR_TERMS }

function withCookieTables(doc: LegalDoc, locale: Locale): LegalDoc {
  const tr = locale === "tr"
  const order: CookieCategory[] = [
    "necessary",
    "functional",
    "analytics",
    "marketing",
  ]
  return {
    ...doc,
    version: `${doc.version}+c${COOKIE_POLICY_VERSION}`,
    sections: [
      ...doc.sections,
      {
        heading: tr ? "Çerez kategorileri" : "Cookie categories",
        items: order.map(
          (c) =>
            `${COOKIE_CATEGORIES[c].name[locale]}: ${COOKIE_CATEGORIES[c].description[locale]}`,
        ),
      },
      {
        heading: tr ? "Çerez envanteri" : "Cookie inventory",
        table: {
          columns: tr
            ? ["Ad", "Sağlayıcı", "Kategori", "Amaç", "Süre", "Taraf"]
            : ["Name", "Provider", "Category", "Purpose", "Duration", "Party"],
          rows: COOKIE_INVENTORY.map((c) => [
            c.name,
            c.provider,
            COOKIE_CATEGORIES[c.category].name[locale],
            c.purpose[locale],
            c.duration[locale],
            c.party === "first"
              ? tr
                ? "Birinci taraf"
                : "First party"
              : tr
                ? "Üçüncü taraf"
                : "Third party",
          ]),
        },
      },
    ],
  }
}

function withConsentTexts(doc: LegalDoc, locale: Locale): LegalDoc {
  return {
    ...doc,
    sections: CONSENT_PURPOSES.map((p) => ({
      heading: `${CONSENT_TEXTS[p].label[locale]} (v${CONSENT_TEXTS[p].version})`,
      paragraphs: [CONSENT_TEXTS[p].text[locale]],
    })),
  }
}

/** Yayındaki yasal metni döndürür. Dinamik sözleşmeler şablon (boş sipariş) olarak gelir. */
export function getLegalDoc(slug: LegalSlug, locale: Locale): LegalDoc {
  if (slug === "on-bilgilendirme") return buildPreContractInfo({}, locale)
  if (slug === "mesafeli-satis") return buildDistanceSalesContract({}, locale)
  const base = (locale === "tr" ? TR_DOCS : EN_DOCS)[slug] ?? TR_DOCS[slug]
  if (!base) throw new Error(`Yasal metin bulunamadı: ${slug}`)
  if (slug === "cerez-politikasi") return withCookieTables(base, locale)
  if (slug === "acik-riza") return withConsentTexts(base, locale)
  return base
}

/** Tüm yayındaki metinlerin sürüm listesi (yönetim/denetim için). */
export function legalVersions(locale: Locale = "tr") {
  return LEGAL_SLUGS.map((slug) => {
    const doc = getLegalDoc(slug, locale)
    return {
      key: slug,
      version: doc.version,
      updatedAt: doc.updatedAt,
      hash: contentHash(doc),
    }
  })
}
