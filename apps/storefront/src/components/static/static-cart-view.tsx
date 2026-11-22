"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { clearStaticCart, readStaticCart, STATIC_CART_EVENT, updateStaticCart, type StaticLine } from "@/lib/static/cart"

export type StaticVariant = { title: string; handle: string; options: string; price: number | null; image: string | null }

/**
 * Statik yayın sepeti (DECISIONS #087): satırlar tarayıcıdan, ürün bilgisi derleme anındaki katalogdan.
 * Ödeme gerçek değildir; "Siparişi tamamla" yalnızca demo onayı gösterir ve sepeti boşaltır.
 */
export function StaticCartView({
  catalog,
  labels,
  locale,
}: {
  catalog: Record<string, StaticVariant>
  labels: Record<"title" | "empty" | "emptyCta" | "remove" | "decrease" | "increase" | "subtotal" | "shipping" | "shippingFree" | "total" | "checkout" | "demoNote" | "doneTitle" | "doneBody" | "continue", string>
  locale: "tr" | "en"
}) {
  const [lines, setLines] = useState<StaticLine[]>([])
  const [done, setDone] = useState(false)
  useEffect(() => {
    const sync = () => setLines(readStaticCart().filter((l) => catalog[l.variant_id]))
    sync()
    window.addEventListener(STATIC_CART_EVENT, sync)
    return () => window.removeEventListener(STATIC_CART_EVENT, sync)
  }, [catalog])

  const money = (n: number) =>
    new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-GB", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n)
  const subtotal = lines.reduce((s, l) => s + (catalog[l.variant_id]?.price ?? 0) * l.quantity, 0)

  if (done) {
    return (
      <div className="mt-10 max-w-xl rounded-[4px] border border-ember/40 p-6" role="status" data-testid="static-order-done">
        <p className="font-display text-3xl italic">{labels.doneTitle}</p>
        <p className="mt-3 leading-relaxed text-smoke">{labels.doneBody}</p>
        <Link href="/koleksiyon" className={buttonClass({ size: "lg", className: "mt-6" })}>
          {labels.continue}
        </Link>
      </div>
    )
  }

  if (!lines.length) {
    return (
      <div className="mt-10">
        <p className="text-lg text-smoke">{labels.empty}</p>
        <Link href="/koleksiyon" className={buttonClass({ size: "lg", className: "mt-6" })}>
          {labels.emptyCta}
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <ul className="border-t border-chalk/15">
        {lines.map((l) => {
          const v = catalog[l.variant_id]!
          return (
            <li key={l.variant_id} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 border-b border-chalk/15 py-5">
              <span className="relative block aspect-[4/5] overflow-hidden rounded-[2px] bg-void">
                {v.image ? <Image src={v.image} alt="" fill sizes="88px" className="object-cover" /> : null}
              </span>
              <span>
                <Link href={{ pathname: "/urun/[slug]", params: { slug: v.handle } }} className="font-medium hover:underline">
                  {v.title}
                </Link>
                <span className="mt-1 block text-sm text-smoke">{v.options}</span>
                <span className="mt-3 flex items-center gap-2">
                  <button type="button" aria-label={labels.decrease} onClick={() => updateStaticCart(l.variant_id, l.quantity - 1)} className="grid size-9 place-items-center rounded-[2px] border border-chalk/20">
                    −
                  </button>
                  <span className="min-w-6 text-center tabular-nums">{l.quantity}</span>
                  <button type="button" aria-label={labels.increase} onClick={() => updateStaticCart(l.variant_id, Math.min(10, l.quantity + 1))} className="grid size-9 place-items-center rounded-[2px] border border-chalk/20">
                    +
                  </button>
                  <button type="button" onClick={() => updateStaticCart(l.variant_id, 0)} className="ml-3 text-sm text-smoke underline underline-offset-4 hover:text-chalk">
                    {labels.remove}
                  </button>
                </span>
              </span>
              <span className="tabular-nums">{v.price != null ? money(v.price * l.quantity) : "—"}</span>
            </li>
          )
        })}
      </ul>
      <aside className="h-fit rounded-[4px] border border-chalk/15 p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-smoke">{labels.subtotal}</dt>
            <dd className="tabular-nums">{money(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-smoke">{labels.shipping}</dt>
            <dd>{labels.shippingFree}</dd>
          </div>
          <div className="flex justify-between border-t border-chalk/15 pt-3 text-base font-medium">
            <dt>{labels.total}</dt>
            <dd className="tabular-nums">{money(subtotal)}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => {
            clearStaticCart()
            setDone(true)
          }}
          className={buttonClass({ size: "lg", className: "mt-6 w-full" })}
          data-testid="static-checkout"
        >
          {labels.checkout}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-smoke">{labels.demoNote}</p>
      </aside>
    </div>
  )
}
