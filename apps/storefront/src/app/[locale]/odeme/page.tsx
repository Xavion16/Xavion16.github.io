import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { AddressForm } from "@/components/shop/address-form"
import { CartTotals } from "@/components/shop/cart-totals"
import { ArrowIcon, buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { setShippingAction, startPaymentAction } from "@/lib/actions/cart-actions"
import { formatMoney } from "@/lib/format"
import { getCart } from "@/lib/medusa/cart"
import { localized } from "@/lib/medusa/catalog"
import { sdk } from "@/lib/medusa/client"
import { getAuthHeaders } from "@/lib/medusa/cookies"
import { getCustomer } from "@/lib/medusa/customer"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

const ERROR_CODES = ["eksik", "odeme-baslatilamadi", "oturum", "odeme-reddedildi"] as const

export async function generateMetadata({ params }: PageProps<"/[locale]/odeme">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "shop.checkout" })
  return { title: t("title"), robots: { index: false } }
}

export default async function CheckoutPage({ params, searchParams }: PageProps<"/[locale]/odeme">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("shop.checkout")
  const tc = await getTranslations("shop.cart")
  const sp = await searchParams
  const errorCode = ERROR_CODES.find((c) => c === sp.hata)
  const editAddress = sp.adim === "adres"

  const cart = await getCart()
  if (!cart || !cart.items?.length) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 pt-10 pb-24 sm:px-8">
        <h1 className="condensed text-display">{t("title")}</h1>
        <div className="glass mt-10 flex flex-col items-start gap-6 rounded-[28px] p-8">
          <p className="text-lg">{tc("empty")}</p>
          <Link href="/koleksiyon" className={buttonClass({ size: "lg" })}>
            {tc("emptyCta")}
            <ArrowIcon />
          </Link>
        </div>
      </div>
    )
  }

  const customer = await getCustomer()
  const a = cart.shipping_address
  const hasAddress = Boolean(cart.email && a?.address_1)
  const showAddressForm = !hasAddress || editAddress
  const selectedOption = cart.shipping_methods?.[0]?.shipping_option_id

  const shippingOptions = hasAddress
    ? (await sdk.store.fulfillment.listCartOptions({ cart_id: cart.id }, await getAuthHeaders())).shipping_options
    : []
  const hasShipping = Boolean(selectedOption)

  const stepClass = "glass rounded-[28px] p-6 sm:p-8"
  const stepTitle = (n: number, label: string, done: boolean) => (
    <h2 className="flex items-center gap-3 text-xl font-bold">
      <span
        aria-hidden="true"
        className={cn(
          "grid size-8 place-items-center rounded-full text-sm",
          done ? "bg-moss text-ink" : "border border-white/30",
        )}
      >
        {done ? "✓" : n}
      </span>
      {label}
    </h2>
  )

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-10 pb-24 sm:px-8">
      <h1 className="condensed text-display">{t("title")}</h1>

      {errorCode ? (
        <p role="alert" className="mt-6 rounded-2xl border border-ember/50 bg-ember/15 px-5 py-4 text-ember">
          {t(`errors.${errorCode}`)}
        </p>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          {/* 1 — Adres */}
          <section aria-labelledby="adim-1" className={stepClass}>
            <div id="adim-1">{stepTitle(1, t("step1"), hasAddress && !showAddressForm)}</div>
            {showAddressForm ? (
              <div className="mt-6">
                <AddressForm
                  defaults={{
                    email: cart.email ?? customer?.email ?? "",
                    first_name: a?.first_name ?? customer?.first_name ?? "",
                    last_name: a?.last_name ?? customer?.last_name ?? "",
                    phone: a?.phone ?? "",
                    address_1: a?.address_1 ?? "",
                    city: a?.city ?? "",
                    province: a?.province ?? "",
                    postal_code: a?.postal_code ?? "",
                  }}
                />
                <p className="mt-4 text-xs text-smoke">
                  {t("privacyNote")}{" "}
                  <Link
                    href={{ pathname: "/yasal/[slug]", params: { slug: "kvkk-aydinlatma" } }}
                    className="underline underline-offset-4 hover:text-white"
                  >
                    {t("privacyLink")}
                  </Link>
                </p>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-start justify-between gap-4 text-sm text-smoke">
                <p>
                  {cart.email}
                  <br />
                  {a?.first_name} {a?.last_name} · {a?.address_1}, {a?.province}/{a?.city}
                </p>
                <Link
                  href={{ pathname: "/odeme", query: { adim: "adres" } }}
                  className="min-h-11 content-center font-semibold text-white underline underline-offset-4"
                >
                  {t("edit")}
                </Link>
              </div>
            )}
          </section>

          {/* 2 — Kargo */}
          <section aria-labelledby="adim-2" className={cn(stepClass, !hasAddress && "opacity-60")}>
            <div id="adim-2">{stepTitle(2, t("step2"), hasShipping)}</div>
            {hasAddress && !showAddressForm ? (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {shippingOptions.map((o) => {
                  const active = o.id === selectedOption
                  return (
                    <li key={o.id}>
                      <form action={setShippingAction}>
                        <input type="hidden" name="option_id" value={o.id} />
                        <button
                          type="submit"
                          aria-pressed={active}
                          className={cn(
                            "flex w-full flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-colors",
                            active ? "border-white bg-white text-ink" : "border-white/20 hover:border-white",
                          )}
                        >
                          <span className="font-bold">{o.name}</span>
                          <span className={cn("text-sm", active ? "text-ink-soft" : "text-smoke")}>
                            {o.type?.description}
                          </span>
                          <span className="mt-1 font-semibold">
                            {formatMoney(Number(o.calculated_price?.calculated_amount ?? o.amount ?? 0), locale)}
                          </span>
                        </button>
                      </form>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </section>

          {/* 3 — Ödeme */}
          <section aria-labelledby="adim-3" className={cn(stepClass, !hasShipping && "opacity-60")}>
            <div id="adim-3">{stepTitle(3, t("step3"), false)}</div>
            {hasAddress && hasShipping && !showAddressForm ? (
              <form action={startPaymentAction} className="mt-6">
                <p className="text-sm text-smoke">{t("payNote")}</p>
                <p className="mt-2 text-xs text-smoke">{t("legalPhase3")}</p>
                <button type="submit" className={buttonClass({ size: "lg", className: "mt-6 w-full sm:w-auto" })}>
                  {t("pay")}
                  <ArrowIcon />
                </button>
              </form>
            ) : null}
          </section>
        </div>

        <aside aria-labelledby="ozet" className="glass h-fit rounded-[28px] p-6 lg:sticky lg:top-24">
          <h2 id="ozet" className="text-lg font-bold">{t("summary")}</h2>
          <ul className="mt-4 space-y-3 border-b border-white/15 pb-4 text-sm">
            {cart.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4">
                <span>
                  {localized(i.product_title ?? i.title, i.product?.metadata, "title_en", locale)}
                  <span className="block text-xs text-smoke">
                    {i.variant_title} · ×{i.quantity}
                  </span>
                </span>
                <span className="font-semibold">{formatMoney(Number(i.total ?? 0), locale)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <CartTotals cart={cart} />
          </div>
        </aside>
      </div>
    </div>
  )
}
