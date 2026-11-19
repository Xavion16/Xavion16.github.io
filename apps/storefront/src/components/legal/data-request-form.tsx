"use client"

import { useActionState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { ArrowIcon, buttonClass } from "@/components/ui/button"
import { submitDataRequestAction, type DsrState } from "@/lib/actions/consent-actions"

const TYPES = ["info", "export", "correct", "delete", "object", "other"] as const

export function DataRequestForm({ defaults }: { defaults: { full_name?: string; email?: string } }) {
  const t = useTranslations("legal.form")
  const locale = useLocale()
  const [state, action, pending] = useActionState<DsrState, FormData>(submitDataRequestAction, { ok: false })

  if (state.ok && state.reference && state.due_at) {
    const date = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { dateStyle: "long" }).format(
      new Date(state.due_at),
    )
    return (
      <p role="status" className="rounded-2xl bg-moss/15 p-5 font-semibold text-ink" data-testid="dsr-success">
        {t("success", { reference: state.reference, date })}
      </p>
    )
  }

  const field = "min-h-12 rounded-2xl border border-ink/20 bg-white px-4 text-ink focus:border-ink"
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="dsr-name" className="text-sm font-semibold">{t("fullName")}</label>
        <input id="dsr-name" name="full_name" required minLength={3} autoComplete="name" defaultValue={defaults.full_name} className={field} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="dsr-email" className="text-sm font-semibold">{t("email")}</label>
        <input id="dsr-email" name="email" type="email" required autoComplete="email" defaultValue={defaults.email} className={field} />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="dsr-type" className="text-sm font-semibold">{t("type")}</label>
        <select id="dsr-type" name="type" required defaultValue="info" className={field}>
          {TYPES.map((ty) => (
            <option key={ty} value={ty}>{t(`types.${ty}`)}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="dsr-details" className="text-sm font-semibold">{t("details")}</label>
        <textarea id="dsr-details" name="details" rows={4} maxLength={2000} className="rounded-2xl border border-ink/20 bg-white p-4 text-ink" />
      </div>
      {/* Aydınlatma bilgilendirmedir; onay kutusu konmaz (Rapor §7.1.2) */}
      <p className="text-xs leading-relaxed text-ink-soft sm:col-span-2">{t("notice")}</p>
      <div className="sm:col-span-2" aria-live="polite">
        {state.error ? <p role="alert" className="mb-3 text-sm font-semibold text-ember-ink">{t("error")}</p> : null}
        <button type="submit" disabled={pending} className={buttonClass({ variant: "dark", size: "lg" })}>
          {t("submit")}
          <ArrowIcon />
        </button>
      </div>
    </form>
  )
}
