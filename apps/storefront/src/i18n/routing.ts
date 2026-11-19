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
    "/atolye": { tr: "/atolye", en: "/atelier" },
    "/yasal/[slug]": { tr: "/yasal/[slug]", en: "/legal/[slug]" },
  },
})

export type Locale = (typeof routing.locales)[number]
export type AppPathname = keyof typeof routing.pathnames
