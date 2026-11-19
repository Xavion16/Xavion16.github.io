"use client"

import { useActionState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { CookiePrefsButton } from "@/components/consent/cookie-consent"
import { buttonClass } from "@/components/ui/button"
import { savePermissionsAction } from "@/lib/actions/consent-actions"

export type PermissionItem = {
  purpose: "marketing_email" | "marketing_sms" | "fit_twin" | "ai_chat_transfer"
  label: string
  text: string
  version: string
  granted: boolean
  at: string | null
}

/** Rızaları tek tek açıp kapatma (Rapor §7.1.3). Kutular yalnızca KAYITLI rıza varsa işaretli gelir. */
export function PermissionsForm({ items }: { items: PermissionItem[] }) {
  const t = useTranslations("shop.account.permissions")
  const tr = useTranslations("shop.account.registerForm")
  const locale = useLocale()
  const [state, action, pending] = useActionState(savePermissionsAction, { ok: false })
  const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { dateStyle: "medium", timeStyle: "short" })

  return (
    <form action={action} className="space-y-3">
      {items.map((it) => (
        <div key={it.purpose} className="glass rounded-3xl p-5">
          <div className="flex items-start justify-between gap-4">
            <label htmlFor={`perm-${it.purpose}`} className="font-semibold leading-snug">
              {it.label}
            </label>
            <input
              id={`perm-${it.purpose}`}
              name={it.purpose}
              type="checkbox"
              role="switch"
              defaultChecked={it.granted}
              className="mt-0.5 size-6 shrink-0 accent-[var(--color-ember)]"
            />
          </div>
          <p className="mt-2 text-xs text-smoke">
            {it.granted ? t("granted") : t("notGranted")} · v{it.version}
            {it.at ? ` · ${t("lastChange", { date: fmt.format(new Date(it.at)) })}` : ""}
          </p>
          {it.purpose === "fit_twin" ? <p className="mt-1 text-xs text-smoke">{t("fitTwinPhase")}</p> : null}
          <details className="mt-2 text-sm text-smoke">
            <summary className="cursor-pointer font-semibold text-white/90">{tr("readText")}</summary>
            <p className="mt-2 leading-relaxed">{it.text}</p>
          </details>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3 pt-2" aria-live="polite">
        <button type="submit" disabled={pending} className={buttonClass({ variant: "light", size: "lg" })}>
          {t("save")}
        </button>
        {state.saved ? <span className="text-sm font-semibold text-moss">{t("saved")}</span> : null}
        {state.ok === false && state.saved === false ? <span className="text-sm text-ember">{t("error")}</span> : null}
      </div>

      <div className="glass mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl p-5">
        <div>
          <p className="font-semibold">{t("cookies")}</p>
          <p className="text-sm text-smoke">{t("cookiesNote")}</p>
        </div>
        <CookiePrefsButton label={t("openCookies")} className={buttonClass({ variant: "glass" })} />
      </div>
    </form>
  )
}
