import { getLocale, getTranslations } from "next-intl/server"
import type { Locale } from "@/i18n/routing"
import { formatMoney } from "@/lib/format"
import type { PriceReference } from "@/lib/medusa/catalog"
import { cn } from "@/lib/utils"

/**
 * Fiyat gösterimi (Rapor §7.3). Üstü çizili fiyat YALNIZCA price_history'den gelen
 * `reference` ile gösterilir ve yalnızca güncel fiyattan yüksekse. Elle girilen "eski fiyat" yoktur.
 */
export async function Price({
  amount,
  reference,
  size = "md",
  tone = "dark",
  className,
}: {
  amount: number | null
  reference?: PriceReference | null
  size?: "md" | "lg"
  tone?: "dark" | "light"
  className?: string
}) {
  if (amount === null) return null
  const locale = (await getLocale()) as Locale
  const t = await getTranslations("shop.price")
  const ref =
    reference?.referencePrice && reference.referencePrice > amount ? reference : null

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1", className)}>
      <span
        className={cn(
          "font-bold tracking-tight",
          size === "lg" ? "text-3xl" : "text-lg",
          ref && (tone === "dark" ? "text-ember" : "text-ember-ink"),
        )}
      >
        {formatMoney(amount, locale)}
      </span>
      {ref?.referencePrice ? (
        <>
          <del
            className={cn("text-sm", tone === "dark" ? "text-smoke" : "text-ink-soft")}
            aria-label={t("before", { price: formatMoney(ref.referencePrice, locale) })}
            title={t("rule")}
          >
            {formatMoney(ref.referencePrice, locale)}
          </del>
          {ref.discountPercent ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-bold",
                tone === "dark" ? "bg-ember text-ink" : "bg-ink text-white",
              )}
            >
              {t("discount", { pct: ref.discountPercent })}
            </span>
          ) : null}
        </>
      ) : null}
      <span className={cn("text-xs", tone === "dark" ? "text-smoke" : "text-ink-soft")}>
        {t("vatIncluded")}
      </span>
    </p>
  )
}
