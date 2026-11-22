"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { submitTicketAction, type TicketState } from "@/lib/actions/help-actions"
import { fieldClass } from "./tracking-form"

const TOPICS = ["size_fit", "order", "shipping", "return", "payment", "care", "kvkk", "other"] as const

export function TicketForm({ defaults }: { defaults: { full_name?: string; email?: string } }) {
  const t = useTranslations("help.ticket")
  const [state, action, pending] = useActionState<TicketState, FormData>(submitTicketAction, { ok: false })

  if (state.ok && state.ticket) {
    return (
      <p role="status" data-testid="ticket-success" className="glass rounded-[4px] p-6 text-lg font-semibold">
        {t("success", { ticket: state.ticket })}
      </p>
    )
  }
  return (
    <form action={action} className="glass grid gap-4 rounded-[4px] p-6 sm:grid-cols-2 sm:p-8">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="tk-topic" className="text-sm font-semibold">{t("topic")}</label>
        <select id="tk-topic" name="topic" required defaultValue={state.values?.topic ?? "size_fit"} className={fieldClass}>
          {TOPICS.map((tp) => (
            <option key={tp} value={tp}>{t(`topics.${tp}`)}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tk-name" className="text-sm font-semibold">{t("fullName")}</label>
        <input id="tk-name" name="full_name" required minLength={2} autoComplete="name" defaultValue={state.values?.full_name ?? defaults.full_name} className={fieldClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tk-email" className="text-sm font-semibold">{t("email")}</label>
        <input id="tk-email" name="email" type="email" required autoComplete="email" defaultValue={state.values?.email ?? defaults.email} className={fieldClass} />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="tk-order" className="text-sm font-semibold">{t("orderRef")}</label>
        <input id="tk-order" name="order_ref" defaultValue={state.values?.order_ref} className={fieldClass} />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="tk-msg" className="text-sm font-semibold">{t("message")}</label>
        <textarea id="tk-msg" name="message" required minLength={5} rows={5} defaultValue={state.values?.message} className="rounded-[4px] border border-white/20 bg-carbon p-4 text-white focus:border-white" />
      </div>
      {/* Nokta bazlı aydınlatma — onay kutusu YOK */}
      <p className="text-xs leading-relaxed text-smoke sm:col-span-2">
        {t("notice")}{" "}
        <Link href="/yasal/kvkk-aydinlatma" className="underline underline-offset-4 hover:text-white">KVKK</Link>
      </p>
      <div className="sm:col-span-2" aria-live="polite">
        {state.error ? <p role="alert" className="mb-3 text-sm text-ember">{t("error")}</p> : null}
        <button type="submit" disabled={pending} className={buttonClass({ size: "lg" })}>
          {t("submit")}
        </button>
      </div>
    </form>
  )
}
