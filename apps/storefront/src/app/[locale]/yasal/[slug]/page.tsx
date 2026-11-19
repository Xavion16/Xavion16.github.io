import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { ComingSoon } from "@/components/layout/coming-soon"
import { routing } from "@/i18n/routing"
import { localizedAlternates } from "@/lib/metadata"
import { isLegalSlug, LEGAL_SLUGS } from "@/lib/site"

export const dynamicParams = false

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/yasal/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale) || !isLegalSlug(slug)) return {}
  const t = await getTranslations({ locale, namespace: "legalPages" })
  return {
    title: t(slug),
    alternates: localizedAlternates({ pathname: "/yasal/[slug]", params: { slug } }, locale),
  }
}

export default async function LegalPlaceholder({
  params,
}: PageProps<"/[locale]/yasal/[slug]">) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale) || !isLegalSlug(slug)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations()
  return <ComingSoon title={t(`legalPages.${slug}`)} body={t("placeholder.legalBody")} />
}
