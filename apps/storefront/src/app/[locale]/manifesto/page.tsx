import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { ShoeDrawing } from "@/components/illustrations/shoe-drawings"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { localizedAlternates } from "@/lib/metadata"
import { CATEGORY_KEYS, type CategoryKey } from "@/lib/site"
import { VoiceQuote } from "@/components/brand/voice-quote"

const PARAGRAPHS = ["p1", "p2", "p3"] as const
const PRINCIPLES = ["fit", "explain", "repair", "measure"] as const
const PRINCIPLE_ACCENT = ["text-ember", "text-tide", "text-moss", "text-white"] as const

const CATEGORY_DOT: Record<CategoryKey, string> = {
  topuklu: "from-[#d9b770] to-[#1a150e]",
  "kislik-bot": "from-[#8a6a46] to-[#110d09]",
  sneaker: "from-[#d6d8db] to-[#15140f]",
  klasik: "from-[#c9a253] to-[#120e08]",
  cocuk: "from-[#e6d6b8] to-[#1d1812]",
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/manifesto">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "manifesto" })
  return {
    title: t("title"),
    description: t("lead"),
    alternates: localizedAlternates("/manifesto", locale),
  }
}

export default async function ManifestoPage({
  params,
}: PageProps<"/[locale]/manifesto">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations("manifesto")
  const tc = await getTranslations("home.categories.items")
  const otherLang = locale === "tr" ? "en" : "tr"

  return (
    <article>
      <header className="relative -mt-[76px] overflow-hidden pt-[76px]">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="orb orb-ember -top-20 right-0 size-[480px] opacity-70" />
          <div className="orb orb-tide bottom-0 -left-32 size-[420px] opacity-50" />
          <div className="tech-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        </div>
        <div className="relative mx-auto max-w-[1440px] px-4 pt-20 pb-20 sm:px-8 md:pt-28 md:pb-28">
          <p className="eyebrow text-ember">{t("eyebrow")}</p>
          <h1 className="condensed mt-4 text-mega">{t("title")}</h1>
          <p className="glass mt-10 max-w-3xl rounded-[4px] p-6 text-xl leading-snug font-semibold sm:p-8 sm:text-2xl">
            {t("lead")}
          </p>
        </div>
      </header>

      <div className="bg-chalk text-ink">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-20 sm:px-8 md:py-28 lg:grid-cols-[1fr_1.4fr]">
          <VoiceQuote
            quote={t("quote")}
            lang={otherLang}
            src={`/audio/manifesto-quote-${otherLang}.mp3`}
            labels={{ listen: t("listen"), stop: t("stop") }}
          />
          <div className="space-y-8 text-xl leading-relaxed md:text-2xl">
            {PARAGRAPHS.map((p) => (
              <p key={p} className="font-medium">
                {t(`paragraphs.${p}`)}
              </p>
            ))}
          </div>
        </div>
      </div>

      <section aria-labelledby="ilke-baslik" className="relative overflow-hidden">
        <div aria-hidden="true" className="orb orb-moss top-0 right-1/4 size-[420px] opacity-40" />
        <div className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-8 md:py-28">
          <h2 id="ilke-baslik" className="condensed text-display">
            {t("principlesTitle")}
          </h2>
          <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((key, i) => (
              <li key={key} className="glass flex flex-col rounded-[4px] p-6">
                <span className={`condensed text-6xl ${PRINCIPLE_ACCENT[i]}`}>0{i + 1}</span>
                <h3 className="condensed mt-8 text-3xl">{t(`principles.${key}.title`)}</h3>
                <p className="mt-3 leading-relaxed text-smoke">{t(`principles.${key}.body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="kategori-manifesto" className="bg-carbon">
        <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 md:py-28">
          <h2 id="kategori-manifesto" className="condensed text-display">
            {t("categoriesTitle")}
          </h2>
          <ul className="mt-12 grid gap-3">
            {CATEGORY_KEYS.map((key) => (
              <li
                key={key}
                className="grid items-center gap-6 rounded-[4px] border border-white/10 bg-white/[0.03] p-4 sm:p-6 md:grid-cols-[240px_1fr_1.5fr]"
              >
                <div
                  className={`grid aspect-[2/1] place-items-center rounded-[4px] bg-gradient-to-br ${CATEGORY_DOT[key]} p-3`}
                >
                  <ShoeDrawing category={key} className="w-full text-white" />
                </div>
                <div>
                  <h3 className="condensed text-4xl">{tc(`${key}.name`)}</h3>
                  <p className="mt-1 font-semibold text-ember">{tc(`${key}.manifesto`)}</p>
                </div>
                <p className="leading-relaxed text-smoke">{t(`categories.${key}`)}</p>
              </li>
            ))}
          </ul>

          <Link href="/" className={buttonClass({ variant: "light", size: "lg", className: "mt-14" })}>
            {t("back")}
          </Link>
        </div>
      </section>
    </article>
  )
}
