"use client"

import { useActionState, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { addToCartAction, type ActionState } from "@/lib/actions/cart-actions"
import { cn } from "@/lib/utils"

export type PickerOption = { title: string; values: string[] }
export type PickerVariant = { id: string; options: Record<string, string>; stock: number | null }

const OPTION_LABEL: Record<string, "color" | "size" | "width"> = {
  Renk: "color",
  Numara: "size",
  Genişlik: "width",
}

export function VariantPicker({
  options,
  variants,
  onSelectionChange,
  swatches,
  formId,
}: {
  options: PickerOption[]
  variants: PickerVariant[]
  /** Seçim değişince (ör. galerinin rengi) */
  onSelectionChange?: (selected: Record<string, string>) => void
  /** Renk adı → hex (renk örneği noktası) */
  swatches?: Record<string, string>
  /** Form kimliği: sayfadaki başka bir düğme (mobil sepet çubuğu) aynı formu gönderebilsin */
  formId?: string
}) {
  const t = useTranslations("shop")
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    // Tek değerli seçenekler (ör. tek renk) baştan seçili gelsin
    const init: Record<string, string> = {}
    for (const o of options) if (o.values.length === 1 && o.values[0]) init[o.title] = o.values[0]
    return init
  })
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addToCartAction, {
    ok: false,
  })

  const variant = useMemo(
    () =>
      options.every((o) => selected[o.title])
        ? variants.find((v) => options.every((o) => v.options[o.title] === selected[o.title]))
        : undefined,
    [options, variants, selected],
  )

  /** Bu değer, diğer seçimlerle birlikte stokta bir varyant oluşturuyor mu? */
  const available = (title: string, value: string) =>
    variants.some(
      (v) =>
        v.options[title] === value &&
        Object.entries(selected).every(([k, sv]) => k === title || v.options[k] === sv) &&
        (v.stock === null || v.stock > 0),
    )

  const stock = variant?.stock ?? null
  const soldOut = variant !== undefined && stock !== null && stock <= 0

  return (
    <form id={formId} action={formAction} className="flex flex-col gap-6">
      {options.map((o) => {
        const key = OPTION_LABEL[o.title] ?? "size"
        return (
          <fieldset key={o.title}>
            <legend className="text-sm font-bold">
              {t(`product.${key}`)}
              {selected[o.title] ? (
                <span className="ml-2 font-normal text-smoke">{selected[o.title]}</span>
              ) : null}
            </legend>
            {key === "width" ? <p className="mt-1 text-xs text-smoke">{t("product.widthHelp")}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {o.values.map((value) => {
                const id = `${o.title}-${value}`
                const ok = available(o.title, value)
                return (
                  <label key={value} htmlFor={id} className="relative">
                    <input
                      id={id}
                      type="radio"
                      name={`opt-${o.title}`}
                      value={value}
                      checked={selected[o.title] === value}
                      onChange={() => {
                        const next = { ...selected, [o.title]: value }
                        setSelected(next)
                        onSelectionChange?.(next)
                      }}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "inline-flex min-h-11 min-w-14 cursor-pointer items-center justify-center rounded-[2px] border px-4 text-sm font-semibold transition-colors",
                        "border-white/20 peer-hover:border-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ember",
                        "peer-checked:border-white peer-checked:bg-white peer-checked:text-ink",
                        !ok && "text-smoke line-through decoration-1",
                      )}
                    >
                      {key === "color" && swatches?.[value] ? (
                        <span
                          aria-hidden="true"
                          className="mr-2 size-3.5 rounded-full border border-white/40"
                          style={{ backgroundColor: swatches[value] }}
                        />
                      ) : null}
                      {value}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )
      })}

      <input type="hidden" name="variant_id" value={variant?.id ?? ""} />
      <input type="hidden" name="quantity" value="1" />

      <p className="min-h-5 text-sm" aria-live="polite">
        {variant
          ? soldOut
            ? <span className="text-ember">{t("product.outOfStock")}</span>
            : stock !== null && stock <= 5
              ? <span className="text-ember">{t("product.lowStock", { count: stock })}</span>
              : <span className="text-moss">{t("product.inStock")}</span>
          : null}
      </p>

      <button
        type="submit"
        disabled={pending || !variant || soldOut}
        className={buttonClass({ size: "lg", className: "w-full" })}
      >
        {pending ? t("product.adding") : t("product.addToCart")}
      </button>
      {!variant ? <p className="-mt-3 text-xs text-smoke">{t("product.selectVariant")}</p> : null}

      <div aria-live="polite" className="min-h-6">
        {state.ok ? (
          <p className="flex items-center justify-between gap-3 rounded-[4px] bg-moss/15 px-4 py-3 text-sm">
            <span className="font-semibold text-moss">{t("product.added")}</span>
            <Link href="/sepet" className="font-semibold underline underline-offset-4">
              {t("product.goToCart")}
            </Link>
          </p>
        ) : state.error ? (
          <p role="alert" className="rounded-[4px] bg-ember/15 px-4 py-3 text-sm text-ember">
            {t(`errors.${state.error === "selectVariant" ? "selectVariant" : "addFailed"}`)}
          </p>
        ) : null}
      </div>
    </form>
  )
}
