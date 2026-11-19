import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { ComingSoon } from "@/components/layout/coming-soon"
import { routing } from "@/i18n/routing"
import { localizedAlternates } from "@/lib/metadata"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/koleksiyon">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "placeholder" })
  return {
    title: t("collectionTitle"),
    alternates: localizedAlternates("/koleksiyon", locale),
  }
}

export default async function Page({ params }: PageProps<"/[locale]/koleksiyon">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("placeholder")
  const phase = locale === "tr" ? "Faz 2" : "Phase 2"
  return <ComingSoon title={t("collectionTitle")} body={t("body", { phase })} />
}
