import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound, redirect } from "next/navigation"
import { buttonClass } from "@/components/ui/button"
import { getPathname, Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { logoutAction } from "@/lib/actions/account-actions"
import { formatMoney } from "@/lib/format"
import { getCustomer, listMyOrders } from "@/lib/medusa/customer"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: PageProps<"/[locale]/hesabim">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "shop.account" })
  return { title: t("title"), robots: { index: false } }
}

export default async function AccountPage({ params }: PageProps<"/[locale]/hesabim">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const customer = await getCustomer()
  if (!customer) redirect(getPathname({ href: "/hesabim/giris", locale }))
  const t = await getTranslations("shop.account")
  const orders = await listMyOrders()
  const dateFmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { dateStyle: "medium" })

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-ember">{t("title")}</p>
          <h1 className="condensed mt-3 text-display">
            {t("hello", { name: customer.first_name ?? customer.email })}
          </h1>
          <p className="mt-2 text-smoke">{customer.email}</p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className={buttonClass({ variant: "glass" })}>
            {t("logout")}
          </button>
        </form>
      </div>

      <section aria-labelledby="siparislerim" className="mt-12">
        <h2 id="siparislerim" className="condensed text-4xl">{t("orders")}</h2>
        {orders.length === 0 ? (
          <p className="mt-6 text-smoke">{t("noOrders")}</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={{ pathname: "/siparis/[id]", params: { id: o.id } }}
                  className="glass flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5 hover:border-white/40"
                >
                  <span className="font-bold">{t("orderNo", { no: o.display_id ?? "" })}</span>
                  <span className="text-sm text-smoke">{o.created_at ? dateFmt.format(new Date(o.created_at)) : ""}</span>
                  <span className="font-semibold">{formatMoney(Number(o.total ?? 0), locale)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
