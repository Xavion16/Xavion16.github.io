"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { ArrowIcon, buttonClass } from "@/components/ui/button"
import { saveAddressAction, type ActionState } from "@/lib/actions/cart-actions"
import { cn } from "@/lib/utils"

export type AddressDefaults = {
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  address_1?: string
  city?: string
  province?: string
  postal_code?: string
}

type Field = {
  name: keyof AddressDefaults
  label: "email" | "firstName" | "lastName" | "phone" | "address" | "city" | "province" | "postalCode"
  type?: string
  autoComplete: string
  required?: boolean
  wide?: boolean
}

const FIELDS: Field[] = [
  { name: "email", label: "email", type: "email", autoComplete: "email", required: true, wide: true },
  { name: "first_name", label: "firstName", autoComplete: "given-name", required: true },
  { name: "last_name", label: "lastName", autoComplete: "family-name", required: true },
  { name: "phone", label: "phone", type: "tel", autoComplete: "tel", wide: true },
  { name: "address_1", label: "address", autoComplete: "street-address", required: true, wide: true },
  { name: "city", label: "city", autoComplete: "address-level1", required: true },
  { name: "province", label: "province", autoComplete: "address-level2", required: true },
  { name: "postal_code", label: "postalCode", autoComplete: "postal-code" },
]

export function AddressForm({ defaults }: { defaults: AddressDefaults }) {
  const t = useTranslations("shop.checkout")
  const [state, action, pending] = useActionState<ActionState, FormData>(saveAddressAction, { ok: false })

  return (
    <form action={action} noValidate className="grid gap-4 sm:grid-cols-2">
      {FIELDS.map((f) => {
        const invalid = Boolean(state.fieldErrors?.[f.name])
        const id = `addr-${f.name}`
        return (
          <div key={f.name} className={cn("flex flex-col gap-1.5", f.wide && "sm:col-span-2")}>
            <label htmlFor={id} className="text-sm font-semibold">
              {t(f.label)}
              {f.required ? <span aria-hidden="true" className="text-ember"> *</span> : null}
            </label>
            <input
              id={id}
              name={f.name}
              type={f.type ?? "text"}
              autoComplete={f.autoComplete}
              required={f.required}
              defaultValue={defaults[f.name] ?? ""}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? `${id}-err` : undefined}
              className={cn(
                "min-h-12 rounded-2xl border bg-carbon px-4 text-white placeholder:text-smoke",
                invalid ? "border-ember" : "border-white/20 focus:border-white",
              )}
            />
            {invalid ? (
              <p id={`${id}-err`} className="text-xs text-ember">
                {t("fieldInvalid")}
              </p>
            ) : null}
          </div>
        )
      })}
      <div className="sm:col-span-2" aria-live="polite">
        {state.error ? (
          <p role="alert" className="mb-3 text-sm text-ember">
            {t(`errors.${state.error === "noCart" ? "noCart" : "invalidAddress"}`)}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className={buttonClass({ variant: "light", size: "lg" })}>
          {t("saveAddress")}
          <ArrowIcon />
        </button>
      </div>
    </form>
  )
}
