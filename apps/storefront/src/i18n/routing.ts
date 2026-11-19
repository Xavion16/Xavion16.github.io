import { defineRouting } from "next-intl/routing"

/**
 * TR varsayılan, EN ikinci dil (Rapor 4.1).
 * URL slug'ları dile göre çevrilir: /tr/ayak-ikizi ↔ /en/fit-twin
 */
export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  localePrefix: "always",
  pathnames: {
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
    "/atolye": { tr: "/atolye", en: "/atelier" },
    "/yasal/[slug]": { tr: "/yasal/[slug]", en: "/legal/[slug]" },
  },
})

export type Locale = (typeof routing.locales)[number]
export type AppPathname = keyof typeof routing.pathnames
