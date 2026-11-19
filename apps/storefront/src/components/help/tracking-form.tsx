"use client"

import { useActionState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { ArrowIcon, buttonClass } from "@/components/ui/button"
import { trackOrderAction, type TrackState } from "@/lib/actions/help-actions"
import { cn } from "@/lib/utils"

export const fieldClass = "min-h-12 rounded-2xl border border-white/20 bg-carbon px-4 text-white focus:border-white"

export function TrackingForm() {
  const t = useTranslations("help.tracking")
  const locale = useLocale()
  const [state, action, pending] = useActionState<TrackState, FormData>(trackOrderAction, { status: "idle" })
  const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { dateStyle: "medium" })

  return (
    <div>
      <form action={action} className="glass grid gap-4 rounded-[28px] p-6 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="trk-no" className="text-sm font-semibold">{t("orderNo")}</label>
          <input id="trk-no" name="order_no" required inputMode="numeric" placeholder="#12" defaultValue={state.values?.order_no} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="trk-email" className="text-sm font-semibold">{t("email")}</label>
          <input id="trk-email" name="email" type="email" required autoComplete="email" defaultValue={state.values?.email} className={fieldClass} />
        </div>
        <button type="submit" disabled={pending} className={buttonClass({ size: "lg" })}>
          {t("submit")}
          <ArrowIcon />
        </button>
      </form>

      <div aria-live="polite" className="mt-8">
        {state.status === "not_found" || state.status === "invalid" ? (
          <p role="alert" className="rounded-2xl bg-ember/15 px-5 py-4 text-ember">{t("notFound")}</p>
        ) : null}
        {state.status === "found" && state.tracking && state.order ? (
          <section className="glass rounded-[28px] p-6" data-testid="tracking-result">
            <div className="flex flex-wrap justify-between gap-4 text-sm">
              <p>
                <span className="text-smoke">{t("carrier")}:</span> <strong>{state.tracking.carrier}</strong>
              </p>
              <p>
                <span className="text-smoke">{t("trackingNo")}:</span>{" "}
                <strong className="font-mono">{state.tracking.tracking_no}</strong>
              </p>
            </div>
            <ol className="mt-6 grid gap-3 sm:grid-cols-4">
              {state.tracking.steps.map((s) => (
                <li
                  key={s.code}
                  aria-current={s.code === state.tracking?.status ? "step" : undefined}
                  className={cn("rounded-2xl border p-4", s.done ? "border-moss/60 bg-moss/10" : "border-white/10")}
                >
                  <p className="font-semibold">{t(`steps.${s.code}`)}</p>
                  <p className="text-xs text-smoke">{s.done ? fmt.format(new Date(s.at)) : "—"}</p>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-smoke">{t("expected", { date: fmt.format(new Date(state.tracking.expected_delivery_at)) })}</p>
            <ul className="mt-4 space-y-1 text-sm">
              {state.order.items.map((i, k) => (
                <li key={k}>
                  {i.title} <span className="text-smoke">· {i.variant_title} · ×{i.quantity}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-smoke">{t("demo")}</p>
          </section>
        ) : null}
      </div>
    </div>
  )
}
