"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { updateStaticCart } from "@/lib/static/cart"
import { DiscountBox, OrderSummary, subtotalOf, useDiscount, useMoney, useStaticLines, type StaticCatalog } from "./static-order"

/**
 * Statik yayın sepeti (DECISIONS #087, #092): satırlar tarayıcıdan, ürün bilgisi derleme anındaki katalogdan.
 * İndirim kodu burada uygulanır; "Ödemeye geç" demo ödeme sayfasına götürür.
 */
export function StaticCartView({ catalog }: { catalog: StaticCatalog }) {
  const t = useTranslations("shop")
  const money = useMoney()
  const lines = useStaticLines(catalog)
  const subtotal = subtotalOf(lines, catalog)
  const d = useDiscount(subtotal)

  if (!lines.length) {
    return (
      <div className="mt-10">
        <p className="text-lg text-smoke">{t("cart.empty")}</p>
        <Link href="/koleksiyon" className={buttonClass({ size: "lg", className: "mt-6" })}>
          {t("cart.emptyCta")}
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
                  <button type="button" aria-label={t("cart.decrease")} onClick={() => updateStaticCart(l.variant_id, l.quantity - 1)} className="grid size-9 place-items-center rounded-[2px] border border-chalk/20">
                    −
                  </button>
                  <span className="min-w-6 text-center tabular-nums">{l.quantity}</span>
                  <button type="button" aria-label={t("cart.increase")} onClick={() => updateStaticCart(l.variant_id, Math.min(10, l.quantity + 1))} className="grid size-9 place-items-center rounded-[2px] border border-chalk/20">
                    +
                  </button>
                  <button type="button" onClick={() => updateStaticCart(l.variant_id, 0)} className="ml-3 text-sm text-smoke underline underline-offset-4 hover:text-chalk">
                    {t("cart.remove")}
                  </button>
                </span>
              </span>
              <span className="tabular-nums">{v.price != null ? money(v.price * l.quantity) : "—"}</span>
            </li>
          )
        })}
      </ul>
      <aside className="glass h-fit space-y-6 rounded-[4px] p-6">
        <DiscountBox d={d} />
        <OrderSummary lines={lines} catalog={catalog} shipping={0} discount={d.amount} />
        <Link href="/odeme" className={buttonClass({ size: "lg", className: "w-full" })} data-testid="static-checkout">
          {t("cart.checkout")}
        </Link>
        <p className="text-xs leading-relaxed text-smoke">{t("staticCart.demoNote")}</p>
      </aside>
    </div>
  )
}
