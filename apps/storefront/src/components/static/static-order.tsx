"use client"

import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import { useEffect, useState } from "react"
import { readStaticCart, STATIC_CART_EVENT, type StaticLine } from "@/lib/static/cart"
import { checkDiscount, discountAmount, readDiscount, writeDiscount, type Discount } from "@/lib/static/discount"

export type StaticVariant = { title: string; handle: string; options: string; price: number | null; image: string | null }
export type StaticCatalog = Record<string, StaticVariant>

/** Tarayıcı sepetindeki, katalogda karşılığı olan satırlar */
export function useStaticLines(catalog: StaticCatalog): StaticLine[] {
  const [lines, setLines] = useState<StaticLine[]>([])
  useEffect(() => {
    const sync = () => setLines(readStaticCart().filter((l) => catalog[l.variant_id]))
    sync()
    window.addEventListener(STATIC_CART_EVENT, sync)
    return () => window.removeEventListener(STATIC_CART_EVENT, sync)
  }, [catalog])
  return lines
}

export function subtotalOf(lines: StaticLine[], catalog: StaticCatalog): number {
  return lines.reduce((s, l) => s + (catalog[l.variant_id]?.price ?? 0) * l.quantity, 0)
}

export function useMoney() {
  const locale = useLocale()
  return (n: number) =>
    new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-GB", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n)
}

/** Uygulanmış indirim kodu (tarayıcıda saklanır, sepet değişince yeniden doğrulanır) */
export function useDiscount(subtotal: number) {
  const [code, setCode] = useState<string | null>(null)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tarayıcı deposu yalnızca istemcide okunur
    setCode(readDiscount())
  }, [])
  const check = code ? checkDiscount(code, subtotal) : null
  const discount: Discount | null = check?.ok ? check.discount : null
  return {
    code,
    discount,
    amount: discountAmount(discount, subtotal),
    /** Kod sepet tutarı düştüğü için artık geçerli değilse uyarı */
    stale: check !== null && !check.ok,
    apply(raw: string) {
      const r = checkDiscount(raw, subtotal)
      if (r.ok) {
        writeDiscount(r.discount.code)
        setCode(r.discount.code)
      }
      return r
    },
    clear() {
      writeDiscount(null)
      setCode(null)
    },
  }
}

/** İndirim kodu kutusu */
export function DiscountBox({ d }: { d: ReturnType<typeof useDiscount> }) {
  const t = useTranslations("shop.discount")
  const money = useMoney()
  const [value, setValue] = useState("")
  const [msg, setMsg] = useState<string | null>(null)

  if (d.discount) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-[2px] border border-ember/50 px-3 py-2 text-sm" data-testid="discount-applied">
        <span>
          <span className="font-medium text-ember">{d.discount.code}</span>{" "}
          <span className="text-smoke">{d.discount.kind === "percent" ? t("percentOff", { value: d.discount.value }) : t("fixedOff", { value: money(d.discount.value) })}</span>
        </span>
        <button type="button" onClick={d.clear} className="text-xs text-smoke underline underline-offset-4 hover:text-chalk">
          {t("remove")}
        </button>
      </div>
    )
  }
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!value.trim()) return
        const r = d.apply(value)
        setMsg(r.ok ? null : r.reason === "minimum" ? t("minimum", { min: money(r.min ?? 0) }) : t("unknown"))
        if (r.ok) setValue("")
      }}
    >
      <label htmlFor="discount-code" className="text-xs font-medium tracking-[0.12em] text-smoke uppercase">
        {t("label")}
      </label>
      <div className="flex gap-2">
        <input
          id="discount-code"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          placeholder={t("placeholder")}
          className="min-h-11 min-w-0 flex-1 rounded-[2px] border border-chalk/20 bg-carbon px-3 text-sm uppercase placeholder:normal-case"
        />
        <button type="submit" className="min-h-11 rounded-[2px] border border-chalk/40 px-4 text-[0.72rem] font-medium tracking-[0.14em] uppercase hover:bg-chalk hover:text-ink">
          {t("apply")}
        </button>
      </div>
      <p className="min-h-4 text-xs text-ember" aria-live="polite">
        {msg ?? (d.stale ? t("stale") : "")}
      </p>
      <p className="text-xs text-smoke">{t("hint")}</p>
    </form>
  )
}

/** Sipariş özeti: satırlar (isteğe bağlı), ara toplam, indirim, kargo, toplam */
export function OrderSummary({
  lines,
  catalog,
  shipping,
  discount,
  showLines = false,
}: {
  lines: StaticLine[]
  catalog: StaticCatalog
  shipping: number
  discount: number
  showLines?: boolean
}) {
  const t = useTranslations("shop")
  const money = useMoney()
  const subtotal = subtotalOf(lines, catalog)
  return (
    <div>
      {showLines ? (
        <ul className="mb-5 space-y-3 border-b border-chalk/15 pb-5">
          {lines.map((l) => {
            const v = catalog[l.variant_id]!
            return (
              <li key={l.variant_id} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 text-sm">
                <span className="relative block aspect-[4/5] overflow-hidden rounded-[2px] bg-void">
                  {v.image ? <Image src={v.image} alt="" fill sizes="56px" className="object-cover" /> : null}
                  <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-ember text-[0.65rem] font-bold text-ink">{l.quantity}</span>
                </span>
                <span>
                  <span className="block font-medium">{v.title}</span>
                  <span className="block text-xs text-smoke">{v.options}</span>
                </span>
                <span className="tabular-nums">{money((v.price ?? 0) * l.quantity)}</span>
              </li>
            )
          })}
        </ul>
      ) : null}
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-smoke">{t("cart.subtotal")}</dt>
          <dd className="tabular-nums">{money(subtotal)}</dd>
        </div>
        {discount > 0 ? (
          <div className="flex justify-between text-ember" data-testid="discount-line">
            <dt>{t("discount.line")}</dt>
            <dd className="tabular-nums">−{money(discount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="text-smoke">{t("cart.shipping")}</dt>
          <dd className="tabular-nums">{shipping > 0 ? money(shipping) : t("staticCart.shippingFree")}</dd>
        </div>
        <div className="flex justify-between border-t border-chalk/15 pt-3 text-base font-medium">
          <dt>{t("cart.total")}</dt>
          <dd className="tabular-nums" data-testid="order-total">
            {money(Math.max(0, subtotal - discount) + shipping)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
