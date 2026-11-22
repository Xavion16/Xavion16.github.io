import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { buildStaticCatalog } from "./static-catalog"
import { StaticCheckoutView } from "./static-checkout-view"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale: hasLocale(routing.locales, locale) ? locale : "tr", namespace: "shop.staticCheckout" })
  return { title: t("title"), robots: { index: false, follow: false } }
}

/** Statik yayının demo ödeme sayfası (DECISIONS #092) */
export default async function StaticCheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("shop.staticCheckout")
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8">
      <p className="eyebrow text-ember">{t("eyebrow")}</p>
      <h1 className="condensed mt-3 text-headline">{t("title")}</h1>
      <StaticCheckoutView catalog={await buildStaticCatalog(locale)} />
    </div>
  )
}
