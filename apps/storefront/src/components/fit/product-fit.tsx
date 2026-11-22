"use client"

import { band, type SizeRow, type WidthFitting } from "@arion/fit-engine"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { Link } from "@/i18n/navigation"
import { scoreProduct } from "@/lib/fit/score"
import { cn } from "@/lib/utils"
import { useFitTwin } from "./fit-twin-provider"
import { ReasonList } from "./reason-list"
import { ScoreDial } from "./score-dial"

/**
 * Ürün sayfası Uyum Skoru (Rapor §6.1): Ayak İkizi × bu ürünün kalıbı. Hesap tarayıcıda yapılır.
 * Ayak İkizi yoksa sihirbaza davet eder.
 */
export function ProductFit({
  last,
  category,
  sizes,
  widths,
}: {
  last: { code: string; category: string; rows: SizeRow[] }
  category: string
  sizes: number[]
  widths: WidthFitting[]
}) {
  const t = useTranslations("fit")
  const { profile, source } = useFitTwin()
  const result = useMemo(
    () => (profile ? scoreProduct(profile, { sizes, widths, category }, last) : null),
    [profile, sizes, widths, category, last],
  )

  if (!profile || !result) {
    return (
      <Link
        href="/ayak-ikizi"
        className="group flex items-center justify-between gap-4 rounded-[4px] border border-moss/40 bg-moss/10 p-5 transition-colors hover:border-moss"
        data-testid="product-fit-cta"
      >
        <span>
          <span className="block font-bold text-white">{t("product.cta")}</span>
          <span className="mt-1 block text-sm text-smoke">{t("product.ctaHint")}</span>
        </span>
      </Link>
    )
  }

  const width = result.recommendedWidth ?? "M"
  const bySize = result.ranked
    .filter((r) => r.row.width_fitting === width)
    .sort((a, b) => a.row.eu_size - b.row.eu_size)

  return (
    <section aria-labelledby="uyum" className="glass rounded-[4px] p-5 sm:p-6" data-testid="product-fit">
      <div className="flex items-center gap-5">
        <ScoreDial score={result.score} label={t("result.scoreLabel")} className="size-24 shrink-0" />
        <div>
          <h2 id="uyum" className="text-lg font-bold text-white">
            {t("product.title")} · {t(`bands.${band(result.score)}`)}
          </h2>
          <p className="mt-1 text-sm text-smoke">{t("product.fromTwin", { source: source ?? "guest" })}</p>
          <p className="mt-2 font-mono text-white" data-testid="product-fit-size">
            {t("product.recommended")}: <strong>{result.recommendedSize}</strong> · {t("product.widthLabel")}:{" "}
            <strong>{width}</strong>
          </p>
        </div>
      </div>
      <ReasonList reasons={result.reasons} className="mt-5 text-smoke" />
      <div className="mt-5">
        <p className="text-xs font-semibold tracking-wide text-smoke uppercase">{t("product.table")}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {bySize.map((r) => (
            <li
              key={r.row.eu_size}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-center font-mono text-xs",
                r.row.eu_size === result.recommendedSize ? "border-moss bg-moss/15 text-white" : "border-white/10 text-smoke",
              )}
            >
              <span className="block text-sm font-semibold">{r.row.eu_size}</span>
              {r.score}
            </li>
          ))}
        </ul>
      </div>
      <Link href="/ayak-ikizi" className="mt-4 inline-block text-sm font-semibold text-moss hover:text-white">
        {t("product.update")}
      </Link>
    </section>
  )
}
