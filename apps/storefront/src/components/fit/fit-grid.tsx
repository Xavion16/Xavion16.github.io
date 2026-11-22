"use client"

import { FITS_ME_THRESHOLD } from "@arion/fit-engine"
import { useTranslations } from "next-intl"
import { useEffect, useId, useMemo, useState, type ReactNode } from "react"
import { Link } from "@/i18n/navigation"
import { scoreCatalog } from "@/lib/fit/score"
import type { FitCatalog } from "@/lib/fit/types"
import { cn } from "@/lib/utils"
import { useFitTwin } from "./fit-twin-provider"

/**
 * Koleksiyon ızgarası + "Bana uyanlar" filtresi ve uyuma göre sıralama (Rapor §6.1 madde 4).
 * Kartlar sunucuda üretilir; skorlar tarayıcıda hesaplanır (ölçüler sunucuya gitmez).
 */
export function FitGrid({
  items,
  catalog,
  initialFitsMe,
}: {
  /** sizes/wide: statik yayında adres filtrelerinin tarayıcıda uygulanması için (DECISIONS #087) */
  items: Array<{ handle: string; node: ReactNode; sizes?: string[]; wide?: boolean }>
  catalog: FitCatalog
  initialFitsMe: boolean
}) {
  const t = useTranslations("fit.filter")
  const { profile } = useFitTwin()
  const [fitsMe, setFitsMe] = useState(initialFitsMe)
  // Izgara yoğunluğu: geniş (varsayılan) ya da sık (DECISIONS #083)
  const [dense, setDense] = useState(false)
  const id = useId()

  // Statik yayında sunucu adres parametresini göremez: numara/genişlik filtresi tarayıcıda uygulanır
  const [urlFilter, setUrlFilter] = useState<{ numara?: string; wide?: boolean }>({})
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ARION_STATIC !== "1") return
    const sp = new URLSearchParams(window.location.search)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- adres yalnızca istemcide okunur
    setUrlFilter({ numara: sp.get("numara") ?? undefined, wide: sp.get("genislik") === "W" })
  }, [])
  const filtered = useMemo(
    () =>
      items.filter(
        (i) => (!urlFilter.numara || (i.sizes ?? []).includes(urlFilter.numara)) && (!urlFilter.wide || i.wide === true),
      ),
    [items, urlFilter],
  )

  const scores = useMemo(() => (profile ? scoreCatalog(profile, catalog) : null), [profile, catalog])

  const shown = useMemo(() => {
    if (!scores || !fitsMe) return filtered
    return filtered
      .filter((i) => (scores.get(i.handle)?.score ?? 0) >= FITS_ME_THRESHOLD)
      .sort((a, b) => (scores.get(b.handle)?.score ?? 0) - (scores.get(a.handle)?.score ?? 0))
  }, [filtered, scores, fitsMe])

  function toggle(on: boolean) {
    setFitsMe(on)
    try {
      const url = new URL(window.location.href)
      if (on) url.searchParams.set("uyum", "1")
      else url.searchParams.delete("uyum")
      window.history.replaceState(null, "", url)
    } catch {
      /* yok sayılır */
    }
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        {profile ? (
          <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 font-semibold text-white">
            <input
              id={id}
              type="checkbox"
              checked={fitsMe}
              onChange={(e) => toggle(e.target.checked)}
              className="size-5 accent-[var(--color-moss)]"
              data-testid="fits-me"
            />
            {t("fitsMe")}
            <span className="text-sm font-normal text-smoke">{t("fitsMeHint", { threshold: FITS_ME_THRESHOLD })}</span>
          </label>
        ) : (
          <Link href="/ayak-ikizi" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ember underline-offset-4 hover:underline">
            {t("fitsMe")} · {t("needTwin")}
          </Link>
        )}
        <div role="group" aria-label={t("density")} className="flex gap-1" data-testid="grid-density">
          {([false, true] as const).map((d) => (
            <button
              key={String(d)}
              type="button"
              aria-pressed={dense === d}
              onClick={() => setDense(d)}
              className={cn(
                "min-h-10 rounded-[2px] border px-3 text-[0.68rem] font-medium tracking-[0.12em] uppercase",
                dense === d ? "border-ember text-chalk" : "border-chalk/15 text-chalk/60 hover:text-chalk",
              )}
            >
              {t(d ? "dense" : "wide")}
            </button>
          ))}
        </div>
      </div>

      {fitsMe && scores && shown.length === 0 ? (
        <p className="mt-16 text-center text-lg text-smoke">{t("none", { threshold: FITS_ME_THRESHOLD })}</p>
      ) : (
        <ul
          className={cn(
            "mt-8 grid",
            dense ? "grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          )}
          data-testid="product-grid"
        >
          {shown.map((i) => {
            const s = scores?.get(i.handle)?.score
            return (
              <li key={i.handle} className="relative" data-handle={i.handle}>
                {i.node}
                {s != null ? (
                  <span
                    className={cn(
                      "pointer-events-none absolute top-3 right-3 rounded-[2px] px-3 py-1 font-mono text-xs font-bold",
                      s >= FITS_ME_THRESHOLD ? "bg-moss text-ink" : "bg-ink/80 text-white",
                    )}
                    data-testid="fit-badge"
                  >
                    {t("badge", { score: s })}
                  </span>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
