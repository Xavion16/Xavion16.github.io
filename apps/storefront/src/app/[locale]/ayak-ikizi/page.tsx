import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { ComingSoon } from "@/components/layout/coming-soon"
import { routing } from "@/i18n/routing"
import { localizedAlternates } from "@/lib/metadata"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/ayak-ikizi">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "placeholder" })
  return {
    title: t("fitTwinTitle"),
    alternates: localizedAlternates("/ayak-ikizi", locale),
  }
}

export default async function Page({ params }: PageProps<"/[locale]/ayak-ikizi">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("placeholder")
  const phase = locale === "tr" ? "Faz 5" : "Phase 5"
  return <ComingSoon title={t("fitTwinTitle")} body={t("body", { phase })} />
}
