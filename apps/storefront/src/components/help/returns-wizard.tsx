"use client"

import { useActionState, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { ArrowIcon, buttonClass } from "@/components/ui/button"
import {
  lookupReturnAction,
  submitReturnAction,
  type ReturnLookup,
  type ReturnResult,
} from "@/lib/actions/help-actions"
import { cn } from "@/lib/utils"
import { fieldClass } from "./tracking-form"

const REASONS = ["fit", "dislike", "defective", "wrong_item"] as const
const REMEDIES = ["terminate", "discount", "repair", "replace"] as const
const FIT_RESULTS = ["small", "large", "narrow", "wide", "other"] as const
type Reason = (typeof REASONS)[number]

/**
 * İade sihirbazı (Rapor §8.2): sipariş → ürün + neden → sonuç.
 * "Kusurlu"/"Yanlış ürün" seçilirse AYIPLI MAL yolu açılır (seçimlik haklar). 14 gün kontrolü sunucuda da yapılır.
 */
export function ReturnsWizard() {
  const t = useTranslations("help.returns")
  const locale = useLocale()
  const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { dateStyle: "long" })
  const [lookup, lookupAction, looking] = useActionState<ReturnLookup, FormData>(lookupReturnAction, { status: "idle" })
  const [result, submitAction, submitting] = useActionState<ReturnResult, FormData>(submitReturnAction, { ok: false })
  const [reason, setReason] = useState<Reason | null>(null)
  const [exchange, setExchange] = useState(false)

  const elig = lookup.eligibility
  const isDefect = reason === "defective" || reason === "wrong_item"
  const blocked = Boolean(elig && !elig.within_withdrawal && reason !== null && !isDefect)

  if (result.ok && result.return_no) {
    return (
      <section role="status" data-testid="return-success" className="glass rounded-[28px] p-6 sm:p-8">
        <h2 className="condensed text-4xl">{t("successTitle")}</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-smoke">{t("returnNo")}</dt>
            <dd className="font-mono text-lg font-bold">{result.return_no}</dd>
          </div>
          <div>
            <dt className="text-sm text-smoke">{t("returnCode")}</dt>
            <dd className="font-mono text-lg font-bold text-moss" data-testid="return-code">{result.return_code}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm">{result.carrier} · {t("sellerPays")}</p>
        <p className="mt-2 text-sm text-smoke">
          {result.refund_due_at
            ? t("refundDue", { date: fmt.format(new Date(result.refund_due_at)) })
            : result.path === "exchange"
              ? t("exchangeDone")
              : t("repairDone")}
        </p>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1 — Sipariş */}
      <form action={lookupAction} className="glass grid gap-4 rounded-[28px] p-6 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
        <h2 className="text-lg font-bold sm:col-span-3">1 · {t("step1")}</h2>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ret-no" className="text-sm font-semibold">{t("orderNo")}</label>
          <input id="ret-no" name="order_no" required inputMode="numeric" defaultValue={lookup.order_no} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ret-email" className="text-sm font-semibold">{t("email")}</label>
          <input id="ret-email" name="email" type="email" required autoComplete="email" defaultValue={lookup.email} className={fieldClass} />
        </div>
        <button type="submit" disabled={looking} className={buttonClass({ variant: "light", size: "lg" })}>
          {t("find")}
        </button>
        <div className="sm:col-span-3" aria-live="polite">
          {lookup.status === "not_found" || lookup.status === "invalid" ? (
            <p role="alert" className="text-ember">{t("notFound")}</p>
          ) : null}
        </div>
      </form>

      {lookup.status === "found" && lookup.order && elig ? (
        <form action={submitAction} className="glass space-y-6 rounded-[28px] p-6 sm:p-8">
          <input type="hidden" name="order_no" value={lookup.order_no} />
          <input type="hidden" name="email" value={lookup.email} />
          <h2 className="text-lg font-bold">2 · {t("step2")}</h2>

          {elig.within_withdrawal ? (
            <p className="rounded-2xl bg-moss/10 px-4 py-3 text-sm">
              {elig.delivered
                ? t("withinWindow", { days: elig.days_left, date: fmt.format(new Date(elig.withdrawal_deadline)) })
                : t("notDelivered")}
            </p>
          ) : (
            <div role="alert" data-testid="withdrawal-expired" className="rounded-2xl border border-ember/60 bg-ember/15 p-4">
              <p className="font-bold text-ember">{t("expiredTitle")}</p>
              <p className="mt-1 text-sm">
                {t("expired", {
                  date: fmt.format(new Date(elig.delivered_at)),
                  deadline: fmt.format(new Date(elig.withdrawal_deadline)),
                })}
              </p>
            </div>
          )}

          <fieldset>
            <legend className="text-sm font-semibold">{t("items")}</legend>
            <ul className="mt-3 space-y-2">
              {lookup.order.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <input id={`li-${i.id}`} type="checkbox" name="line_ids" value={i.id} className="size-5 accent-[var(--color-ember)]" />
                  <label htmlFor={`li-${i.id}`}>
                    {i.title} <span className="text-smoke">· {i.variant_title} · ×{i.quantity}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold">{t("reason")}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <label key={r} className="relative">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    required
                    onChange={() => setReason(r)}
                    className="peer sr-only"
                  />
                  <span className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-white/20 px-4 text-sm font-semibold peer-checked:bg-white peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-ember">
                    {t(`reasons.${r}`)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {isDefect ? (
            <fieldset className="rounded-2xl border border-white/15 p-4" data-testid="defect-path">
              <legend className="px-1 text-sm font-semibold">{t("defectTitle")}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {REMEDIES.map((m) => (
                  <label key={m} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                    <input type="radio" name="defect_remedy" value={m} required className="size-5 accent-[var(--color-ember)]" />
                    {t(`remedies.${m}`)}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {reason === "fit" ? (
            <div className="space-y-4 rounded-2xl border border-white/15 p-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fit-result" className="text-sm font-semibold">{t("fitResult")}</label>
                <select id="fit-result" name="fit_result" defaultValue="other" className={fieldClass}>
                  {FIT_RESULTS.map((f) => (
                    <option key={f} value={f}>{t(`fitResults.${f}`)}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="wants_exchange" checked={exchange} onChange={(e) => setExchange(e.target.checked)} className="size-5 accent-[var(--color-ember)]" />
                {t("wantsExchange")}
              </label>
              {exchange ? (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ex-note" className="text-sm font-semibold">{t("exchangeNote")}</label>
                  <input id="ex-note" name="exchange_note" required className={fieldClass} />
                  <p className="text-xs text-smoke">{t("exchangeHint")}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <p className="text-xs leading-relaxed text-smoke">{t("notice")}</p>

          <div aria-live="polite">
            {result.error ? (
              <p role="alert" className="mb-3 text-sm text-ember">{t(`errors.${result.error}`)}</p>
            ) : null}
            <button
              type="submit"
              disabled={submitting || blocked}
              className={cn(buttonClass({ size: "lg" }))}
            >
              {t("submit")}
              <ArrowIcon />
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
