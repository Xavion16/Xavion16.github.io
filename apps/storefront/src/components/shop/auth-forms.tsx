"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { ArrowIcon, buttonClass } from "@/components/ui/button"
import { loginAction, registerAction } from "@/lib/actions/account-actions"
import type { ActionState } from "@/lib/actions/cart-actions"
import { cn } from "@/lib/utils"

const inputClass = (invalid: boolean) =>
  cn(
    "min-h-12 rounded-2xl border bg-carbon px-4 text-white",
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
            {t("errors.invalidCredentials")}
          </p>
        ) : null}
      </div>
      <button type="submit" disabled={pending} className={buttonClass({ size: "lg" })}>
        {t("submitLogin")}
        <ArrowIcon />
      </button>
    </form>
  )
}

export function RegisterForm() {
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
      <div aria-live="polite">
        {state.error ? (
          <p role="alert" className="text-sm text-ember">
            {t(`errors.${state.error === "registerFailed" ? "registerFailed" : "invalidRegister"}`)}
          </p>
        ) : null}
      </div>
      <button type="submit" disabled={pending} className={buttonClass({ size: "lg" })}>
        {t("submitRegister")}
        <ArrowIcon />
      </button>
    </form>
  )
}
