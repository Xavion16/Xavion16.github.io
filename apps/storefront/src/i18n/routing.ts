import { defineRouting } from "next-intl/routing"

/**
 * TR varsayılan, EN ikinci dil (Rapor 4.1).
 * URL slug'ları dile göre çevrilir: /tr/ayak-ikizi ↔ /en/fit-twin
 */
const PATHNAMES = {
    "/": "/",
    "/manifesto": "/manifesto",
    "/ayak-ikizi": { tr: "/ayak-ikizi", en: "/fit-twin" },
    "/koleksiyon": { tr: "/koleksiyon", en: "/collection" },
    "/koleksiyon/[kategori]": { tr: "/koleksiyon/[kategori]", en: "/collection/[kategori]" },
    "/urun/[slug]": { tr: "/urun/[slug]", en: "/product/[slug]" },
    "/sepet": { tr: "/sepet", en: "/cart" },
    "/odeme": { tr: "/odeme", en: "/checkout" },
    "/odeme/simulasyon": { tr: "/odeme/simulasyon", en: "/checkout/simulation" },
    "/siparis/[id]": { tr: "/siparis/[id]", en: "/order/[id]" },
    "/hesabim": { tr: "/hesabim", en: "/account" },
    "/hesabim/giris": { tr: "/hesabim/giris", en: "/account/login" },
    "/hesabim/kayit": { tr: "/hesabim/kayit", en: "/account/register" },
    "/hesabim/izinlerim": { tr: "/hesabim/izinlerim", en: "/account/permissions" },
    "/hesabim/veri-taleplerim": { tr: "/hesabim/veri-taleplerim", en: "/account/data-requests" },
    "/atolye": { tr: "/atolye", en: "/atelier" },
    "/pasaport/[kod]": { tr: "/pasaport/[kod]", en: "/passport/[kod]" },
    "/omur-plani": { tr: "/omur-plani", en: "/lifetime-plan" },
    "/seffaflik": { tr: "/seffaflik", en: "/transparency" },
    "/yardim": { tr: "/yardim", en: "/help" },
    "/yardim/siparis-takip": { tr: "/yardim/siparis-takip", en: "/help/order-tracking" },
    "/yardim/iade": { tr: "/yardim/iade", en: "/help/returns" },
    "/yardim/talep": { tr: "/yardim/talep", en: "/help/request" },
    "/iletisim": { tr: "/iletisim", en: "/contact" },
  "/hakkimizda": { tr: "/hakkimizda", en: "/about" },
    // Yasal sayfalar: her slug iki dilde de çevrilir (DECISIONS #020 kapandı)
    "/yasal/kvkk-aydinlatma": { tr: "/yasal/kvkk-aydinlatma", en: "/legal/privacy-notice" },
    "/yasal/gizlilik": { tr: "/yasal/gizlilik", en: "/legal/privacy-policy" },
    "/yasal/cerez-politikasi": { tr: "/yasal/cerez-politikasi", en: "/legal/cookie-policy" },
    "/yasal/acik-riza": { tr: "/yasal/acik-riza", en: "/legal/explicit-consent" },
    "/yasal/kvkk-basvuru": { tr: "/yasal/kvkk-basvuru", en: "/legal/data-request" },
    "/yasal/mesafeli-satis": { tr: "/yasal/mesafeli-satis", en: "/legal/distance-sales-agreement" },
    "/yasal/on-bilgilendirme": { tr: "/yasal/on-bilgilendirme", en: "/legal/pre-contract-information" },
    "/yasal/iade-politikasi": { tr: "/yasal/iade-politikasi", en: "/legal/returns-policy" },
    "/yasal/uyelik-sozlesmesi": { tr: "/yasal/uyelik-sozlesmesi", en: "/legal/membership-agreement" },
    "/yasal/kullanim-kosullari": { tr: "/yasal/kullanim-kosullari", en: "/legal/terms-of-use" },
    "/yasal/ticari-ileti": { tr: "/yasal/ticari-ileti", en: "/legal/commercial-messages" },
    "/yasal/kunye": { tr: "/yasal/kunye", en: "/legal/imprint" },
    "/yasal/erisilebilirlik": { tr: "/yasal/erisilebilirlik", en: "/legal/accessibility" },
} as const

/**
 * Statik yayında (GitHub Pages, DECISIONS #087) yol çevirisini yapacak bir sunucu katmanı yoktur:
 * İngilizce sayfalar da Türkçe yol adlarını kullanır (/en/urun/…). Anahtarlar ve tipler aynı kalır.
 */
const STATIC = process.env.NEXT_PUBLIC_ARION_STATIC === "1"
const pathnames = (
  STATIC ? Object.fromEntries(Object.keys(PATHNAMES).map((k) => [k, k])) : PATHNAMES
) as typeof PATHNAMES

export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  localePrefix: "always",
  pathnames,
})

export type Locale = (typeof routing.locales)[number]
export type AppPathname = keyof typeof routing.pathnames
