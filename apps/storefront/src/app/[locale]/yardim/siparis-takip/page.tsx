import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { TrackingForm } from "@/components/help/tracking-form"
import { routing } from "@/i18n/routing"
import { localizedAlternates } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/yardim/siparis-takip">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "help.tracking" })
  return { title: t("title"), alternates: localizedAlternates("/yardim/siparis-takip", locale) }
}

export default async function TrackingPage({ params }: PageProps<"/[locale]/yardim/siparis-takip">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("help.tracking")
  return (
    <div className="mx-auto max-w-[1000px] px-4 pt-14 pb-24 sm:px-8">
      <h1 className="condensed text-display">{t("title")}</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-smoke">{t("intro")}</p>
      <div className="mt-10">
        <TrackingForm />
      </div>
    </div>
  )
}
