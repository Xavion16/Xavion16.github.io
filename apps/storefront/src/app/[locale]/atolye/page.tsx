import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getFormatter, getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { getAtelier } from "@/lib/medusa/workshop"
import { localizedAlternates } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/atolye">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "atelier" })
  return { title: t("metaTitle"), description: t("metaDescription"), alternates: localizedAlternates("/atolye", locale) }
}

const STEPS = ["cutting", "closing", "lasting", "sole", "finishing", "qc", "shipping"] as const

/** Atölye (Rapor §5): ustalar, üretim süreci ve son çıkan çiftler (DEMO). */
export default async function AtelierPage({ params }: PageProps<"/[locale]/atolye">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("atelier")
  const format = await getFormatter()
  const specialties: Record<string, string> = (await getMessages()).passport.specialties
  const data = await getAtelier()

  return (
    <div className="relative -mt-[76px] overflow-hidden pt-[76px]">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="orb orb-ember -top-24 right-0 size-[480px] opacity-50" />
        <div className="tech-grid absolute inset-0 [mask-image:linear-gradient(black,transparent)]" />
      </div>
      <div className="relative mx-auto max-w-[1440px] px-4 pt-16 pb-24 sm:px-8 md:pt-24">
        <p className="eyebrow text-ember">{t("eyebrow")}</p>
        <h1 className="condensed mt-4 max-w-4xl text-display">{t("title")}</h1>
        <p className="mt-6 max-w-2xl text-lg text-smoke">{t("lead")}</p>

        <section aria-labelledby="adimlar" className="mt-16">
          <h2 id="adimlar" className="condensed text-headline">
            {t("steps")}
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s} className="glass rounded-[4px] p-6">
                <span className="font-mono text-sm text-ember">{String(i + 1).padStart(2, "0")}</span>
                <p className="condensed mt-2 text-3xl text-white">{t(`stepNames.${s}`)}</p>
                <p className="mt-3 text-sm leading-relaxed text-smoke">{t(`stepDescs.${s}`)}</p>
              </li>
            ))}
          </ol>
        </section>

        {data.artisans.length ? (
          <section aria-labelledby="ustalar" className="mt-16">
            <h2 id="ustalar" className="condensed text-headline">
              {t("artisans")}
            </h2>
            <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.artisans.map((a) => (
                <li key={a.name} className="rounded-[4px] border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-xl font-bold text-white">{a.name}</p>
                  <p className="mt-1 text-sm text-ember">
                    {specialties[a.specialty] ?? a.specialty} · {a.since_year}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-smoke">{a.bio[locale]}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {data.recent.length ? (
          <section aria-labelledby="son-ciftler" className="mt-16">
            <h2 id="son-ciftler" className="condensed text-headline">
              {t("recent")}
            </h2>
            <p className="mt-2 text-smoke">{t("recentHint")}</p>
            <ul className="mt-6 divide-y divide-white/10 rounded-[4px] border border-white/10">
              {data.recent.map((r) => (
                <li key={r.code} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <Link
                    href={{ pathname: "/pasaport/[kod]", params: { kod: r.code } }}
                    className="font-mono font-semibold text-ember hover:text-white"
                  >
                    {r.code}
                  </Link>
                  <span className="text-white">{r.product}</span>
                  <span className="text-sm text-smoke">
                    {format.dateTime(new Date(r.produced_at), { dateStyle: "medium" })}
                    {r.craftsman ? ` · ${r.craftsman}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <p className="mt-8 text-xs text-smoke">{t("demo")}</p>
      </div>
    </div>
  )
}
