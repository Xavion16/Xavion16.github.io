"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { loginAction, registerAction } from "@/lib/actions/account-actions"
import type { ActionState } from "@/lib/actions/cart-actions"
import { cn } from "@/lib/utils"

const inputClass = (invalid: boolean) =>
  cn(
    "min-h-12 rounded-[4px] border bg-carbon px-4 text-white",
    invalid ? "border-ember" : "border-white/20 focus:border-white",
  )

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  hint,
  invalid,
}: {
  name: string
  label: string
  type?: string
  autoComplete: string
  hint?: string
  invalid: boolean
}) {
  const id = `auth-${name}`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={invalid || undefined}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={inputClass(invalid)}
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-smoke">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("shop.account")
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, { ok: false })
  const invalid = state.error === "invalidCredentials"
  return (
    <form action={action} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field name="email" label={t("email")} type="email" autoComplete="email" invalid={invalid} />
      <Field name="password" label={t("password")} type="password" autoComplete="current-password" invalid={invalid} />
      <div aria-live="polite">
        {state.error ? (
          <p role="alert" className="text-sm text-ember">
            {state.error === "demoOnly" ? t("errors.demoOnly") : t("errors.invalidCredentials")}
          </p>
        ) : null}
      </div>
      <button type="submit" disabled={pending} className={buttonClass({ size: "lg" })}>
        {t("submitLogin")}
      </button>
    </form>
  )
}

export type RegisterConsent = { purpose: "marketing_email" | "marketing_sms"; label: string; text: string }

export function RegisterForm({ consents }: { consents: RegisterConsent[] }) {
  const t = useTranslations("shop.account")
  const [state, action, pending] = useActionState<ActionState, FormData>(registerAction, { ok: false })
  const bad = (k: string) => Boolean(state.fieldErrors?.[k])
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="first_name" label={t("firstName")} autoComplete="given-name" invalid={bad("first_name")} />
        <Field name="last_name" label={t("lastName")} autoComplete="family-name" invalid={bad("last_name")} />
      </div>
      <Field name="email" label={t("email")} type="email" autoComplete="email" invalid={bad("email")} />
      <Field
        name="password"
        label={t("password")}
        type="password"
        autoComplete="new-password"
        hint={t("passwordHint")}
        invalid={bad("password")}
      />

      {/* Sözleşme onayı (zorunlu) — aydınlatma değil, sözleşmenin kurulması */}
      <div className="flex items-start gap-3">
        <input
          id="accept_membership"
          name="accept_membership"
          type="checkbox"
          required
          aria-invalid={bad("accept_membership") || undefined}
          className="mt-0.5 size-5 shrink-0 accent-[var(--color-ember)]"
        />
        <label htmlFor="accept_membership" className="text-sm leading-relaxed">
          {t.rich("registerForm.membership", {
            link: () => (
              <Link href="/yasal/uyelik-sozlesmesi" target="_blank" className="font-semibold underline underline-offset-4">
                {t("registerForm.membershipLink")}
              </Link>
            ),
          })}
        </label>
      </div>

      {/* Açık rızalar: AYRI kutular, hiçbiri önceden işaretli değil, üyeliğin ön koşulu değil (Rapor §7.1.3, §7.4) */}
      <fieldset className="rounded-[4px] border border-white/15 p-4">
        <legend className="px-1 text-sm font-semibold">{t("registerForm.marketingTitle")}</legend>
        <ul className="mt-2 space-y-3">
          {consents.map((c) => (
            <li key={c.purpose} className="flex items-start gap-3">
              <input
                id={`consent-${c.purpose}`}
                name={c.purpose}
                type="checkbox"
                defaultChecked={false}
                className="mt-0.5 size-5 shrink-0 accent-[var(--color-ember)]"
              />
              <div className="text-sm leading-relaxed">
                <label htmlFor={`consent-${c.purpose}`}>{c.label}</label>
                <details className="mt-1 text-xs text-smoke">
                  <summary className="cursor-pointer underline underline-offset-4">{t("registerForm.readText")}</summary>
                  <p className="mt-2">{c.text}</p>
                </details>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-smoke">{t("registerForm.marketingNote")}</p>
      </fieldset>

      <div aria-live="polite">
        {state.error ? (
          <p role="alert" className="text-sm text-ember">
            {state.error === "demoOnly"
              ? t("errors.demoOnly")
              : state.fieldErrors?.accept_membership
                ? t("registerForm.membershipRequired")
                : t(`errors.${state.error === "registerFailed" ? "registerFailed" : "invalidRegister"}`)}
          </p>
        ) : null}
      </div>
      <button type="submit" disabled={pending} className={buttonClass({ size: "lg" })}>
        {t("submitRegister")}
      </button>
    </form>
  )
}
