import { getLocale, getTranslations } from "next-intl/server"
import type { Locale } from "@/i18n/routing"
import { formatMoney } from "@/lib/format"

/** Sepet/sipariş toplamları. Fiyatlar KDV dahildir; KDV ayrıca bilgi olarak gösterilir (Rapor §7.3). */
export async function CartTotals({
  cart,
}: {
  cart: {
    item_total?: number | null
    shipping_total?: number | null
    tax_total?: number | null
    total?: number | null
    currency_code: string
    shipping_methods?: unknown[] | null
  }
}) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations("shop.cart")
  const money = (v: number | null | undefined) => formatMoney(Number(v ?? 0), locale, cart.currency_code)
  const hasShipping = (cart.shipping_methods?.length ?? 0) > 0

  return (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-smoke">{t("subtotal")}</dt>
        <dd className="font-semibold">{money(cart.item_total)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-smoke">{t("shipping")}</dt>
        <dd className="font-semibold">{hasShipping ? money(cart.shipping_total) : t("shippingAtCheckout")}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-white/15 pt-3 text-base">
        <dt className="font-bold">{t("total")}</dt>
        <dd className="font-bold">{money(cart.total)}</dd>
      </div>
      <div className="flex justify-between gap-4 text-xs text-smoke">
        <dt>{t("vat")}</dt>
        <dd>{money(cart.tax_total)}</dd>
      </div>
    </dl>
  )
}
