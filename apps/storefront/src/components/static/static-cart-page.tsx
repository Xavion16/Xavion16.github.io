import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { buildStaticCatalog } from "./static-catalog"
import { StaticCartView } from "./static-cart-view"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale: hasLocale(routing.locales, locale) ? locale : "tr", namespace: "shop.cart" })
  return { title: t("title"), robots: { index: false, follow: false } }
}

/** Statik yayının sepet sayfası (DECISIONS #087, #092): katalog derleme anında, sepet tarayıcıda. */
export default async function StaticCartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("shop.cart")
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8">
      <h1 className="condensed text-headline">{t("title")}</h1>
      <StaticCartView catalog={await buildStaticCatalog(locale)} />
    </div>
  )
}
