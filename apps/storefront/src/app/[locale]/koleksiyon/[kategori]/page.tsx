import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { CollectionView } from "@/components/shop/collection-view"
import { routing } from "@/i18n/routing"
import { isCategoryKey } from "@/lib/category-style"
import { localizedAlternates } from "@/lib/metadata"

type Props = PageProps<"/[locale]/koleksiyon/[kategori]">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, kategori } = await params
  if (!hasLocale(routing.locales, locale) || !isCategoryKey(kategori)) return {}
  const t = await getTranslations({ locale, namespace: "home.categories.items" })
  return {
    title: t(`${kategori}.name`),
    description: t(`${kategori}.manifesto`),
    alternates: localizedAlternates(
      { pathname: "/koleksiyon/[kategori]", params: { kategori } },
      locale,
    ),
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, kategori } = await params
  if (!hasLocale(routing.locales, locale) || !isCategoryKey(kategori)) notFound()
  setRequestLocale(locale)
  const sp = await searchParams
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined)
  return (
    <CollectionView
      categoryHandle={kategori}
      filters={{ numara: one(sp.numara), genislik: one(sp.genislik) }}
    />
  )
}
