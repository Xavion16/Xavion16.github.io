"use client"

import { useLocale, useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import type { ComponentProps } from "react"
import { Link, usePathname } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

const LABELS: Record<Locale, string> = { tr: "Türkçe", en: "English" }

/** Aynı sayfanın diğer dildeki karşılığına geçer (çevrilmiş slug'larla). */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const params = useParams<Record<string, string>>()
  const t = useTranslations("nav")

  // Dinamik sayfalarda (ürün, kategori, yasal, sipariş) parametreler korunur; slug'lar dile göre çevrilir
  const href = (
    pathname.includes("[") ? { pathname, params } : pathname
  ) as ComponentProps<typeof Link>["href"]

  return (
    <nav aria-label={t("language")} className={className}>
      <ul className="flex items-center gap-1 text-[0.72rem] font-medium tracking-[0.12em] uppercase">
        {routing.locales.map((l, i) => (
          <li key={l} className="flex items-center gap-1">
            {i > 0 && (
              <span aria-hidden="true" className="text-smoke">
                /
              </span>
            )}
            {l === locale ? (
              <span
                aria-current="true"
                lang={l}
                className="px-2 py-2 text-chalk underline decoration-ember underline-offset-[6px]"
              >
                {LABELS[l]}
              </span>
            ) : (
              <Link
                href={href}
                locale={l}
                hrefLang={l}
                lang={l}
                className={cn(
                  "px-2 py-2 text-smoke transition-colors hover:text-chalk",
                )}
              >
                {LABELS[l]}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
