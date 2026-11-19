import type { Locale } from "./types"

/**
 * Çerez kategorileri ve envanteri (Rapor §7.1.4, KVKK Çerez Uygulamaları Hakkında Rehber).
 * Çerez politikasındaki tablo BURADAN otomatik üretilir; yeni çerez eklenince önce buraya yazılır.
 */

export type CookieCategory =
  "necessary" | "functional" | "analytics" | "marketing"

export const COOKIE_CATEGORIES: Record<
  CookieCategory,
  {
    required: boolean
    name: Record<Locale, string>
    description: Record<Locale, string>
  }
> = {
  necessary: {
    required: true,
    name: { tr: "Zorunlu", en: "Strictly necessary" },
    description: {
      tr: "Sitenin çalışması için gereklidir: oturum, sepet, güvenlik ve çerez tercihinin kendisi. Açık rıza aranmaz; kapatılamaz.",
      en: "Required for the site to work: session, cart, security and your cookie choice itself. No consent is needed; they cannot be switched off.",
    },
  },
  functional: {
    required: false,
    name: { tr: "İşlevsel", en: "Functional" },
    description: {
      tr: "Tercihlerini (ör. son görüntülenen ürünler) hatırlayarak deneyimi kişiselleştirir.",
      en: "Remembers your preferences (e.g. recently viewed products) to personalise your experience.",
    },
  },
  analytics: {
    required: false,
    name: { tr: "Analitik", en: "Analytics" },
    description: {
      tr: "Sitenin nasıl kullanıldığını toplu olarak ölçer. Yalnızca açık rızanla yüklenir.",
      en: "Measures how the site is used, in aggregate. Loaded only with your explicit consent.",
    },
  },
  marketing: {
    required: false,
    name: { tr: "Pazarlama", en: "Marketing" },
    description: {
      tr: "İlgi alanına göre reklam göstermek ve kampanya etkinliğini ölçmek için. Yalnızca açık rızanla yüklenir.",
      en: "Used to show relevant ads and measure campaigns. Loaded only with your explicit consent.",
    },
  },
}

export type CookieEntry = {
  name: string
  provider: string
  category: CookieCategory
  party: "first" | "third"
  duration: Record<Locale, string>
  purpose: Record<Locale, string>
}

export const COOKIE_INVENTORY: CookieEntry[] = [
  {
    name: "arion_consent",
    provider: "ARION",
    category: "necessary",
    party: "first",
    duration: { tr: "6 ay", en: "6 months" },
    purpose: {
      tr: "Çerez tercihini saklar.",
      en: "Stores your cookie choice.",
    },
  },
  {
    name: "arion_aid",
    provider: "ARION",
    category: "necessary",
    party: "first",
    duration: { tr: "6 ay", en: "6 months" },
    purpose: {
      tr: "Rıza kaydını ispat edebilmek için rastgele, kimliksiz tanımlayıcı.",
      en: "Random, non-identifying ID used to evidence your consent record.",
    },
  },
  {
    name: "_arion_cart",
    provider: "ARION",
    category: "necessary",
    party: "first",
    duration: { tr: "7 gün", en: "7 days" },
    purpose: { tr: "Sepetini tutar.", en: "Keeps your cart." },
  },
  {
    name: "_arion_jwt",
    provider: "ARION",
    category: "necessary",
    party: "first",
    duration: { tr: "7 gün", en: "7 days" },
    purpose: { tr: "Üye oturumunu sürdürür.", en: "Keeps you signed in." },
  },
  {
    name: "NEXT_LOCALE",
    provider: "ARION",
    category: "necessary",
    party: "first",
    duration: { tr: "Oturum", en: "Session" },
    purpose: { tr: "Dil seçimini hatırlar.", en: "Remembers your language." },
  },
  {
    name: "arion_recent",
    provider: "ARION",
    category: "functional",
    party: "first",
    duration: { tr: "30 gün", en: "30 days" },
    purpose: {
      tr: "Son görüntülenen ürünler (DEMO).",
      en: "Recently viewed products (DEMO).",
    },
  },
  {
    name: "arion_metrics",
    provider: "ARION (demo analitik)",
    category: "analytics",
    party: "first",
    duration: { tr: "13 ay", en: "13 months" },
    purpose: {
      tr: "Sayfa görüntüleme ölçümü (DEMO uç noktası; üçüncü tarafa veri gitmez).",
      en: "Page view measurement (DEMO endpoint; no data goes to third parties).",
    },
  },
  {
    name: "arion_ads",
    provider: "Örnek reklam ağı (DEMO)",
    category: "marketing",
    party: "third",
    duration: { tr: "90 gün", en: "90 days" },
    purpose: {
      tr: "Kampanya ölçümü (DEMO; gerçek reklam ağı bağlı değil).",
      en: "Campaign measurement (DEMO; no real ad network connected).",
    },
  },
]

/** Çerez tercihinin metin sürümü — değişirse kullanıcıdan yeniden tercih istenir. */
export const COOKIE_POLICY_VERSION = "1.0.0"
