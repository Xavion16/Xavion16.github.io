import type { Metadata } from "next"
import { getPathname } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { SITE_URL } from "./site"

type Href = Parameters<typeof getPathname>[0]["href"]

/**
 * Sayfanın canonical adresini ve her dil için hreflang alternatiflerini üretir (Rapor §4.1).
 * x-default → TR (varsayılan dil).
 */
export function localizedAlternates(
  href: Href,
  locale: Locale,
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {}
  for (const l of routing.locales) {
    languages[l] = new URL(getPathname({ href, locale: l }), SITE_URL).toString()
  }
  languages["x-default"] = languages[routing.defaultLocale] as string

  return {
    canonical: languages[locale],
    languages,
  }
}
