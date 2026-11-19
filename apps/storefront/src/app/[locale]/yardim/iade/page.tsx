import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { ReturnsWizard } from "@/components/help/returns-wizard"
import { routing } from "@/i18n/routing"
import { localizedAlternates } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/yardim/iade">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "help.returns" })
  return { title: t("title"), alternates: localizedAlternates("/yardim/iade", locale) }
}

export default async function ReturnsPage({ params }: PageProps<"/[locale]/yardim/iade">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("help.returns")
  return (
    <div className="mx-auto max-w-[1000px] px-4 pt-14 pb-24 sm:px-8">
      <h1 className="condensed text-display">{t("title")}</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-smoke">{t("intro")}</p>
      <div className="mt-10">
        <ReturnsWizard />
      </div>
    </div>
  )
}
