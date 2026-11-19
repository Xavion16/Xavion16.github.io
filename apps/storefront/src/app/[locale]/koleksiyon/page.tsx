import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { CollectionView } from "@/components/shop/collection-view"
import { routing } from "@/i18n/routing"
import { localizedAlternates } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/koleksiyon">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "shop.collection" })
  return { title: t("title"), alternates: localizedAlternates("/koleksiyon", locale) }
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/[locale]/koleksiyon">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const sp = await searchParams
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined)
  return <CollectionView filters={{ numara: one(sp.numara), genislik: one(sp.genislik) }} />
}
