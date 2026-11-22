import type { Metadata } from "next"
import Image from "next/image"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { localizedAlternates } from "@/lib/metadata"

const VALUES = ["fit", "repair", "honest"] as const
const TEAM = [
  { key: "enes", initials: "EA" },
  { key: "kadir", initials: "KK" },
] as const

export async function generateMetadata({ params }: PageProps<"/[locale]/hakkimizda">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "about" })
  return { title: t("title"), description: t("lead"), alternates: localizedAlternates("/hakkimizda", locale) }
}

/** Hakkımızda (DECISIONS #090): ARION'un hikâyesi, değerleri ve proje ekibi. */
export default async function AboutPage({ params }: PageProps<"/[locale]/hakkimizda">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("about")

  return (
    <article>
      {/* Giriş */}
      <header className="mx-auto max-w-[1440px] px-4 pt-20 pb-16 sm:px-8 md:pt-28">
        <p className="eyebrow text-ember">{t("eyebrow")}</p>
        <h1 className="condensed mt-4 max-w-4xl text-display">{t.rich("title_rich", { em: (c) => <em>{c}</em> })}</h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-smoke md:text-xl">{t("lead")}</p>
      </header>

      {/* Hikâye: görsel + metin */}
      <section aria-labelledby="hikaye" className="border-y border-chalk/10">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-20 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-void">
            <Image
              src="/editorial/craft-dikis.webp"
              alt={t("storyImageAlt")}
              fill
              sizes="(min-width: 1024px) 45vw, 92vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="eyebrow text-ember">{t("story.eyebrow")}</p>
            <h2 id="hikaye" className="condensed mt-3 text-headline">
              {t.rich("story.title", { em: (c) => <em>{c}</em> })}
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-smoke">
              <p>{t("story.p1")}</p>
              <p>{t("story.p2")}</p>
              <p>{t("story.p3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Değerler */}
      <section aria-labelledby="degerler" className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8">
        <p className="eyebrow text-ember">{t("values.eyebrow")}</p>
        <h2 id="degerler" className="condensed mt-3 text-headline">
          {t("values.title")}
        </h2>
        <ol className="mt-10 border-t border-chalk/15">
          {VALUES.map((v, i) => (
            <li key={v} className="grid gap-2 border-b border-chalk/15 py-6 md:grid-cols-[4rem_1fr_1.4fr] md:gap-8">
              <span aria-hidden="true" className="condensed text-2xl text-ember">
                0{i + 1}
              </span>
              <h3 className="font-display text-2xl italic">{t(`values.items.${v}.title`)}</h3>
              <p className="leading-relaxed text-smoke md:pt-1">{t(`values.items.${v}.body`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Ekip */}
      <section aria-labelledby="ekip" className="bg-carbon">
        <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8 md:py-28">
          <p className="eyebrow text-ember">{t("team.eyebrow")}</p>
          <h2 id="ekip" className="condensed mt-3 text-headline">
            {t.rich("team.title", { em: (c) => <em>{c}</em> })}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-smoke">{t("team.lead")}</p>
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {TEAM.map((m) => (
              <li key={m.key} className="glass flex flex-col gap-6 rounded-[4px] p-6 sm:flex-row sm:items-center sm:p-8" data-testid={`team-${m.key}`}>
                <span
                  aria-hidden="true"
                  className="grid size-24 shrink-0 place-items-center rounded-full border border-ember/60 font-display text-4xl text-ember italic"
                >
                  {m.initials}
                </span>
                <div>
                  <p className="eyebrow text-ember">{t(`team.members.${m.key}.role`)}</p>
                  <h3 className="mt-2 font-display text-3xl">{t(`team.members.${m.key}.name`)}</h3>
                  <dl className="mt-3 space-y-1 text-sm text-smoke">
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="sr-only">{t("team.departmentLabel")}</dt>
                      <dd>{t(`team.members.${m.key}.department`)}</dd>
                    </div>
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="sr-only">{t("team.schoolLabel")}</dt>
                      <dd>{t(`team.members.${m.key}.school`)}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 leading-relaxed text-chalk/85">{t(`team.members.${m.key}.bio`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Kapanış */}
      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8">
        <p className="max-w-3xl font-display text-2xl leading-snug italic md:text-3xl">{t("closing.quote")}</p>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-smoke">{t("closing.note")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/koleksiyon" className={buttonClass({ size: "lg" })}>
            {t("closing.ctaCollection")}
          </Link>
          <Link href="/manifesto" className={buttonClass({ variant: "glass", size: "lg" })}>
            {t("closing.ctaManifesto")}
          </Link>
        </div>
      </section>
    </article>
  )
}
