import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { ShoeDrawing } from "@/components/illustrations/shoe-drawings"
import { CartTotals } from "@/components/shop/cart-totals"
import { ArrowIcon, buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { updateLineAction } from "@/lib/actions/cart-actions"
import { CATEGORY_GRADIENT, isCategoryKey } from "@/lib/category-style"
import { formatMoney } from "@/lib/format"
import { getCart } from "@/lib/medusa/cart"
import { localized } from "@/lib/medusa/catalog"
import { localizedAlternates } from "@/lib/metadata"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: PageProps<"/[locale]/sepet">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "shop.cart" })
  return { title: t("title"), alternates: localizedAlternates("/sepet", locale), robots: { index: false } }
}

export default async function CartPage({ params }: PageProps<"/[locale]/sepet">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("shop.cart")
  const cart = await getCart()
  const items = cart?.items ?? []

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-10 pb-24 sm:px-8">
      <h1 className="condensed text-display">{t("title")}</h1>

      {!cart || items.length === 0 ? (
        <div className="glass mt-10 flex flex-col items-start gap-6 rounded-[28px] p-8">
          <p className="text-lg">{t("empty")}</p>
          <Link href="/koleksiyon" className={buttonClass({ size: "lg" })}>
            {t("emptyCta")}
            <ArrowIcon />
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <ul className="space-y-3">
            {items.map((item) => {
              const cat = item.product?.categories?.[0]?.handle
              const category = isCategoryKey(cat) ? cat : "sneaker"
              const title = localized(item.product_title ?? item.title, item.product?.metadata, "title_en", locale)
              return (
                <li key={item.id} className="glass flex gap-4 rounded-[28px] p-4">
                  <div
                    className={`grid size-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br sm:size-28 ${CATEGORY_GRADIENT[category]}`}
                  >
                    <ShoeDrawing category={category} className="w-[85%] text-white" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Link
                      href={{ pathname: "/urun/[slug]", params: { slug: item.product_handle ?? "" } }}
                      className="font-bold hover:underline"
                    >
                      {title}
                    </Link>
                    <p className="text-sm text-smoke">{item.variant_title}</p>
                    <p className="text-sm font-semibold">{formatMoney(item.unit_price, locale)}</p>
                    <form action={updateLineAction} className="mt-auto flex items-center gap-2 pt-2">
                      <input type="hidden" name="line_id" value={item.id} />
                      <button
                        name="quantity"
                        value={item.quantity - 1}
                        aria-label={t("decrease")}
                        className="grid size-11 place-items-center rounded-full border border-white/20 text-lg hover:bg-white/10"
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center font-mono" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        name="quantity"
                        value={item.quantity + 1}
                        aria-label={t("increase")}
                        className="grid size-11 place-items-center rounded-full border border-white/20 text-lg hover:bg-white/10"
                      >
                        +
                      </button>
                      <button
                        name="quantity"
                        value={0}
                        className="ml-auto min-h-11 px-3 text-sm text-smoke underline underline-offset-4 hover:text-white"
                      >
                        {t("remove")}
                      </button>
                    </form>
                  </div>
                  <p className="hidden font-bold sm:block">{formatMoney(Number(item.total ?? 0), locale)}</p>
                </li>
              )
            })}
          </ul>

          <aside className="glass h-fit rounded-[28px] p-6 lg:sticky lg:top-24">
            <CartTotals cart={cart} />
            <Link href="/odeme" className={buttonClass({ size: "lg", className: "mt-6 w-full" })}>
              {t("checkout")}
              <ArrowIcon />
            </Link>
            <Link
              href="/koleksiyon"
              className="mt-4 block text-center text-sm text-smoke underline underline-offset-4 hover:text-white"
            >
              {t("continue")}
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}
