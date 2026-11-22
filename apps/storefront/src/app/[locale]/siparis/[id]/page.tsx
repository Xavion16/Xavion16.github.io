import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { CartTotals } from "@/components/shop/cart-totals"
import { AtelierTimeline } from "@/components/workshop/atelier-timeline"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { formatMoney } from "@/lib/format"
import { sdk } from "@/lib/medusa/client"
import { getAuthHeaders } from "@/lib/medusa/cookies"
import { getOrderAtelier } from "@/lib/medusa/workshop"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function OrderPage({ params }: PageProps<"/[locale]/siparis/[id]">) {
  const { locale, id } = await params
  if (!hasLocale(routing.locales, locale) || !/^order_[A-Za-z0-9]+$/.test(id)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("shop.order")

  let order
  try {
    ;({ order } = await sdk.store.order.retrieve(
      id,
      { fields: "*items,*shipping_address,*shipping_methods,+item_total" },
      await getAuthHeaders(),
    ))
  } catch {
    notFound()
  }
  const a = order.shipping_address
  const atelier = await getOrderAtelier(order.id)

  return (
    <div className="relative -mt-[76px] overflow-hidden pt-[76px]">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="orb orb-moss -top-24 right-0 size-[480px] opacity-55" />
        <div className="tech-grid absolute inset-0 [mask-image:linear-gradient(black,transparent)]" />
      </div>
      <div className="relative mx-auto max-w-[1100px] px-4 py-16 sm:px-8 md:py-24">
        <p className="eyebrow text-moss">{t("eyebrow")}</p>
        <h1 className="condensed mt-3 text-display">{t("title")}</h1>
        <p className="mt-4 text-lg">
          {t("number")}: <strong data-testid="order-number">#{order.display_id}</strong>
        </p>
        <p className="mt-1 text-smoke">{t("emailSent", { email: order.email ?? "" })}</p>
        <p className="mt-4 inline-flex rounded-[2px] border border-ember/60 px-4 py-1.5 text-xs text-ember">{t("demo")}</p>

        <AtelierTimeline data={atelier} />

        <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <section aria-labelledby="urunler" className="glass rounded-[4px] p-6">
            <h2 id="urunler" className="text-lg font-bold">{t("items")}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {(order.items ?? []).map((i) => (
                <li key={i.id} className="flex justify-between gap-4">
                  <span>
                    {i.product_title ?? i.title}
                    <span className="block text-xs text-smoke">
                      {i.variant_title} · ×{i.quantity}
                    </span>
                  </span>
                  <span className="font-semibold">{formatMoney(Number(i.total ?? 0), locale)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-white/15 pt-4">
              <CartTotals cart={order} />
            </div>
          </section>
          <div className="flex flex-col gap-6">
          <section aria-labelledby="belgeler" className="glass rounded-[4px] p-6">
            <h2 id="belgeler" className="text-lg font-bold">{t("documents")}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href={`/api/belge/${order.id}/on-bilgilendirme`} download className="font-semibold underline underline-offset-4 hover:text-ember">
                  {t("docPreContract")} (PDF)
                </a>
              </li>
              <li>
                <a href={`/api/belge/${order.id}/mesafeli-satis`} download className="font-semibold underline underline-offset-4 hover:text-ember">
                  {t("docDistanceSales")} (PDF)
                </a>
              </li>
            </ul>
          </section>
          <section aria-labelledby="adres" className="glass h-fit rounded-[4px] p-6">
            <h2 id="adres" className="text-lg font-bold">{t("address")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-smoke">
              {a?.first_name} {a?.last_name}
              <br />
              {a?.address_1}
              <br />
              {a?.province} / {a?.city}
            </p>
          </section>
          </div>
        </div>

        <Link href="/koleksiyon" className={buttonClass({ variant: "light", size: "lg", className: "mt-10" })}>
          {t("continue")}
        </Link>
      </div>
    </div>
  )
}
