"use client"

import { useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import type { FaqCategory } from "@/content/faq"

export type FaqView = { id: string; category: FaqCategory; q: string; a: string }

/** Türkçe duyarlı normalizasyon: İ/ı, ş, ğ, ü, ö, ç eşitlenir (aramada "iade" = "İADE"). */
function norm(s: string, locale: string) {
  return s
    .toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-GB")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
}

/** SSS + tam metin arama (Rapor §8.2). JS kapalıyken de tüm SSS okunabilir (details/summary). */
export function FaqSearch({ items, categories }: { items: FaqView[]; categories: Record<FaqCategory, string> }) {
  const t = useTranslations("help")
  const locale = useLocale()
  const [q, setQ] = useState("")

  const filtered = useMemo(() => {
    const terms = norm(q, locale).split(/\s+/).filter((w) => w.length > 1)
    if (!terms.length) return items
    return items.filter((i) => {
      const hay = norm(`${i.q} ${i.a} ${categories[i.category]}`, locale)
      return terms.every((w) => hay.includes(w))
    })
  }, [q, items, categories, locale])

  const groups = (Object.keys(categories) as FaqCategory[])
    .map((c) => ({ c, list: filtered.filter((i) => i.category === c) }))
    .filter((g) => g.list.length)

  return (
    <div>
      <label htmlFor="faq-search" className="sr-only">
        {t("searchLabel")}
      </label>
      <input
        id="faq-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="glass min-h-14 w-full rounded-[2px] px-6 text-lg text-white placeholder:text-smoke"
      />
      <p className="mt-3 text-sm text-smoke" aria-live="polite">
        {q ? (filtered.length ? t("results", { count: filtered.length }) : t("noResults")) : ""}
      </p>

      <div className="mt-8 space-y-10">
        {groups.map(({ c, list }) => (
          <section key={c} aria-labelledby={`faq-${c}`}>
            <h2 id={`faq-${c}`} className="condensed text-3xl">
              {categories[c]}
            </h2>
            <ul className="mt-4 space-y-2">
              {list.map((i) => (
                <li key={i.id}>
                  <details className="glass group rounded-[4px] p-5" open={Boolean(q)}>
                    <summary className="cursor-pointer list-none font-semibold">
                      <span className="flex items-start justify-between gap-4">
                        {i.q}
                        <span aria-hidden="true" className="text-ember transition-transform group-open:rotate-45">
                          +
                        </span>
                      </span>
                    </summary>
                    <p className="mt-3 leading-relaxed text-smoke">{i.a}</p>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
