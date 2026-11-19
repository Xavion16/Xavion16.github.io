import { getLegalDoc } from "@arion/legal-texts"
import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { LegalDocView } from "@/components/legal/legal-doc-view"
import { routing } from "@/i18n/routing"
import { localizedAlternates } from "@/lib/metadata"
import { isLegalSlug, LEGAL_SLUGS, legalHref } from "@/lib/site"

export const dynamicParams = false

export function generateStaticParams() {
  // kvkk-basvuru kendi sayfasında (form) — burada üretilmez
  return LEGAL_SLUGS.filter((s) => s !== "kvkk-basvuru").map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<"/[locale]/yasal/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale) || !isLegalSlug(slug)) return {}
  const doc = getLegalDoc(slug, locale)
  return { title: doc.title, alternates: localizedAlternates(legalHref(slug), locale) }
}

export default async function LegalPage({ params }: PageProps<"/[locale]/yasal/[slug]">) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale) || !isLegalSlug(slug)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("legal")
  const doc = getLegalDoc(slug, locale)
  const isTemplate = slug === "on-bilgilendirme" || slug === "mesafeli-satis"

  return (
    <div className="bg-chalk">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-8 md:py-20">
        <p className="eyebrow text-ember-ink">{t("eyebrow")}</p>
        {isTemplate ? (
          <p className="mt-3 rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink">{t("template")}</p>
        ) : null}
        <LegalDocView doc={doc} className="mt-4 rounded-[28px] bg-white p-6 sm:p-10" />
        <p className="mt-6 text-xs text-ink-soft">{t("lawyer")}</p>
      </div>
    </div>
  )
}
