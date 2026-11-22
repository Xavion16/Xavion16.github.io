import { CONSENT_TEXTS } from "@arion/legal-texts"
import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { FitTwinWizard } from "@/components/fit/fit-twin-wizard"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { getFitCatalog } from "@/lib/fit/catalog"
import { localizedAlternates } from "@/lib/metadata"
import { legalHref } from "@/lib/site"

export async function generateMetadata({ params }: PageProps<"/[locale]/ayak-ikizi">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "fit.meta" })
  return {
    title: t("title"),
    description: t("description"),
    alternates: localizedAlternates("/ayak-ikizi", locale),
  }
}

/** Ayak İkizi sihirbazı (Rapor §6.1). Skor tarayıcıda hesaplanır; misafir ölçüleri sunucuya gitmez. */
export default async function FitTwinPage({ params }: PageProps<"/[locale]/ayak-ikizi">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("fit")
  const catalog = await getFitCatalog()

  return (
    <div className="relative -mt-[76px] overflow-hidden pt-[76px]">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="orb orb-moss -top-24 right-0 size-[460px] opacity-50" />
        <div className="orb orb-tide bottom-40 -left-40 size-[420px] opacity-40" />
      </div>
      <div className="relative mx-auto max-w-[1440px] px-4 pt-16 pb-24 sm:px-8 md:pt-24">
        <p className="eyebrow text-moss">{t("eyebrow")}</p>
        <h1 className="condensed mt-4 max-w-4xl text-display">{t("title")}</h1>
        <p className="mt-6 max-w-2xl text-lg text-smoke">{t("lead")}</p>

        <div className="mt-12 grid gap-8 xl:grid-cols-[1fr_340px]">
          <FitTwinWizard
            catalog={catalog}
            consent={{ label: CONSENT_TEXTS.fit_twin.label[locale], text: CONSENT_TEXTS.fit_twin.text[locale] }}
          />
          <aside className="glass h-fit rounded-[4px] p-6 text-sm leading-relaxed" aria-labelledby="ayak-gizlilik">
            <h2 id="ayak-gizlilik" className="text-lg font-bold text-white">
              {t("privacy.title")}
            </h2>
            <p className="mt-3 text-smoke">{t("privacy.guest")}</p>
            <p className="mt-3 text-smoke">{t("privacy.member")}</p>
            <p className="mt-3 text-smoke">{t("privacy.noAi")}</p>
            <Link href={legalHref("kvkk-aydinlatma")} className="mt-4 inline-block font-semibold text-ember underline-offset-4 hover:underline">
              {t("privacy.notice")}
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
