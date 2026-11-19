"use client"

import { useState, type ReactNode } from "react"
import { useTranslations } from "next-intl"
import { ArrowIcon, buttonClass } from "@/components/ui/button"
import { acceptAndPayAction } from "@/lib/actions/cart-actions"

/**
 * Ödeme adımı (Rapor §7.2): iki metin ayrı ayrı onaylanmadan "Siparişi Onayla ve Öde" PASİFTİR.
 * Kutular önceden işaretli değildir. Metinler sepet bilgileriyle doldurulmuş olarak gösterilir.
 */
export function LegalAcceptance({
  preContract,
  distanceSales,
  hashes,
}: {
  preContract: ReactNode
  distanceSales: ReactNode
  hashes: { pre: string; dist: string }
}) {
  const t = useTranslations("shop.checkout")
  const [pre, setPre] = useState(false)
  const [dist, setDist] = useState(false)
  const ready = pre && dist

  const box = "mt-3 max-h-72 overflow-y-auto rounded-2xl bg-white p-5 text-sm focus-visible:outline-ember"
  return (
    <form action={acceptAndPayAction} className="mt-6 space-y-6">
      <input type="hidden" name="pre_contract_hash" value={hashes.pre} />
      <input type="hidden" name="distance_sales_hash" value={hashes.dist} />

      <div>
        <div className={box} tabIndex={0} role="region" aria-label={t("preContractBox")} data-testid="pre-contract">
          {preContract}
        </div>
        <div className="mt-3 flex items-start gap-3">
          <input
            id="accept_pre_contract"
            name="accept_pre_contract"
            type="checkbox"
            checked={pre}
            onChange={(e) => setPre(e.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-[var(--color-ember)]"
          />
          <label htmlFor="accept_pre_contract" className="text-sm leading-relaxed">
            {t("acceptPreContract")}
          </label>
        </div>
      </div>

      <div>
        <div className={box} tabIndex={0} role="region" aria-label={t("distanceSalesBox")} data-testid="distance-sales">
          {distanceSales}
        </div>
        <div className="mt-3 flex items-start gap-3">
          <input
            id="accept_distance_sales"
            name="accept_distance_sales"
            type="checkbox"
            checked={dist}
            onChange={(e) => setDist(e.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-[var(--color-ember)]"
          />
          <label htmlFor="accept_distance_sales" className="text-sm leading-relaxed">
            {t("acceptDistanceSales")}
          </label>
        </div>
      </div>

      <p className="text-sm text-smoke">{t("payNote")}</p>
      <p id="pay-hint" className="text-xs text-smoke" aria-live="polite">
        {ready ? "" : t("acceptBothHint")}
      </p>
      <button
        type="submit"
        disabled={!ready}
        aria-describedby="pay-hint"
        className={buttonClass({ size: "lg", className: "w-full sm:w-auto" })}
      >
        {t("pay")}
        <ArrowIcon />
      </button>
    </form>
  )
}
