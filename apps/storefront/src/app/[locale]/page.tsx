import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { ManeMark } from "@/components/brand/mane-mark"
import { ScoreDial } from "@/components/fit/score-dial"
import { FootDiagram } from "@/components/illustrations/foot-diagram"
import { ShoeDrawing } from "@/components/illustrations/shoe-drawings"
import { ArrowIcon, buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { localizedAlternates } from "@/lib/metadata"
import { CATEGORY_KEYS, type CategoryKey } from "@/lib/site"

const MYTH_ROWS = ["carrier", "earthWater", "speed", "immortal", "speaking"] as const
const FIT_STEPS = ["measure", "match", "explain"] as const
const MARQUEE = ["m1", "m2", "m3", "m4", "m5", "m6"] as const
const ATELIER_STEPS = [
  "cutting",
  "upper",
  "lasting",
  "sole",
  "finishing",
  "qc",
  "shipping",
] as const

/** Kategori kartı renkleri: mitten gelen palet (hız, Poseidon, Demeter, deri, çocuk). */
const CATEGORY_GRADIENT: Record<CategoryKey, string> = {
  topuklu: "from-[#ff5a36] via-[#e0283f] to-[#5c0a24]",
  "kislik-bot": "from-[#3d7bff] via-[#2348c9] to-[#0a1446]",
  sneaker: "from-[#2bd47d] via-[#12925a] to-[#06331f]",
  klasik: "from-[#d59457] via-[#8a4f22] to-[#2c160a]",
  cocuk: "from-[#b18cff] via-[#d94f9a] to-[#4a0f3d]",
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  return { alternates: localizedAlternates("/", locale) }
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations("home")
  const format = await getFormatter()

  const metrics = [
    {
      key: "fitReturns",
      value: format.number(0.068, { style: "percent", maximumFractionDigits: 1 }),
      accent: "text-ember",
    },
    { key: "repaired", value: format.number(1284), accent: "text-moss" },
    {
      key: "lifespan",
      value: `${format.number(31)} ${t("promises.units.months")}`,
      accent: "text-tide",
    },
    {
      key: "firstResponse",
      value: `${format.number(4)} ${t("promises.units.minutes")}`,
      accent: "text-white",
    },
  ] as const

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative -mt-[76px] overflow-hidden pt-[76px]">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="orb orb-ember -top-24 -right-20 size-[520px]" />
          <div className="orb orb-tide top-1/3 -left-40 size-[480px] opacity-60" />
          <div className="orb orb-moss -bottom-40 right-1/4 size-[420px] opacity-50" />
          <div className="tech-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        </div>

        <p
          aria-hidden="true"
          className="condensed outline-text pointer-events-none absolute right-0 bottom-[-0.12em] left-0 text-center text-[clamp(8rem,28vw,26rem)] leading-none select-none"
        >
          ARION
        </p>

        <div className="relative mx-auto grid min-h-[min(92dvh,900px)] max-w-[1440px] items-center gap-10 px-4 pt-16 pb-24 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="rise-in">
            <p className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
              <span className="size-2 rounded-full bg-moss" aria-hidden="true" />
              {t("hero.badge")}
            </p>
            <h1 className="condensed mt-6 text-mega">{t("hero.title")}</h1>
            <p className="mt-6 text-xl font-semibold text-white sm:text-2xl">
              {t("hero.kicker")}
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-smoke sm:text-lg">
              {t("hero.lead")}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/ayak-ikizi" className={buttonClass({ size: "lg" })}>
                {t("hero.ctaFitTwin")}
                <ArrowIcon />
              </Link>
              <Link href="/manifesto" className={buttonClass({ variant: "glass", size: "lg" })}>
                {t("hero.ctaManifesto")}
              </Link>
            </div>
            <p className="mt-8 font-mono text-xs text-smoke">{t("hero.pronunciation")}</p>
          </div>

          {/* Ürün sahnesi: parlayan çizim + yüzen cam kartlar */}
          <div className="rise-in-late relative mx-auto aspect-square w-full max-w-[560px]">
            <div
              aria-hidden="true"
              className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.14),transparent_65%)]"
            />
            <div aria-hidden="true" className="float-y absolute inset-0 grid place-items-center">
              <ShoeDrawing
                category="sneaker"
                className="w-[112%] -rotate-[9deg] text-white drop-shadow-[0_0_24px_rgb(255_90_54/0.55)]"
              />
            </div>

            <div className="glass absolute bottom-[4%] left-0 flex items-center gap-4 rounded-3xl p-4 pr-6 sm:left-[2%]">
              <ScoreDial score={87} label={t("hero.cardTitle")} className="size-20" />
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold text-smoke">
                  {t("hero.cardTitle")}
                  <span className="demo-badge text-ember">DEMO</span>
                </p>
                <p className="mt-1 text-lg font-bold">{t("hero.cardSize")}</p>
                <p className="font-mono text-xs text-moss">{t("hero.cardReason")}</p>
              </div>
            </div>

            <p className="glass absolute top-[6%] right-0 rounded-full px-4 py-2 text-xs font-semibold">
              {t("hero.chipCrafted")}
            </p>
            <p className="glass absolute top-[30%] left-0 hidden items-center gap-2 rounded-full px-4 py-2 font-mono text-xs sm:inline-flex">
              {t("hero.chipLast")}
            </p>
            <p className="glass absolute right-[2%] bottom-[30%] hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold sm:inline-flex">
              {t("hero.chipRepair")}
              <span className="font-mono text-moss">9/10</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Kayan bant ───────────────────────────────────────── */}
      <section aria-label={t("marquee.label")} className="overflow-hidden bg-ember py-4 text-ink">
        <ul className="sr-only">
          {MARQUEE.map((k) => (
            <li key={k}>{t(`marquee.${k}`)}</li>
          ))}
        </ul>
        <div aria-hidden="true" className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {MARQUEE.map((k) => (
                <span key={k} className="condensed flex items-center gap-8 pr-8 text-3xl">
                  {t(`marquee.${k}`)}
                  <ManeMark className="size-6" strokeWidth={5} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Kategoriye göre keşfet ───────────────────────────── */}
      <section aria-labelledby="kategori-baslik" className="bg-chalk text-ink">
        <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8 md:py-28">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-ember-ink">{t("categories.eyebrow")}</p>
              <h2 id="kategori-baslik" className="condensed mt-3 text-display">
                {t("categories.title")}
              </h2>
            </div>
            <p className="max-w-md leading-relaxed text-ink-soft">{t("categories.intro")}</p>
          </div>

          <ul className="-mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
            {CATEGORY_KEYS.map((key, i) => (
              <li key={key} className="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-auto">
                <Link
                  href="/koleksiyon"
                  className={`group relative flex aspect-[3/4] flex-col overflow-hidden rounded-[28px] bg-gradient-to-br ${CATEGORY_GRADIENT[key]} text-white transition-transform duration-300 hover:-translate-y-1.5`}
                >
                  <span aria-hidden="true" className="tech-grid absolute inset-0 opacity-60" />
                  <span
                    aria-hidden="true"
                    className="condensed absolute top-4 left-5 text-6xl text-white/25"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="relative grid flex-1 place-items-center px-4">
                    <ShoeDrawing
                      category={key}
                      className="w-full text-white transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3"
                    />
                  </span>
                  <span className="glass relative m-3 flex items-end justify-between gap-3 rounded-2xl p-4">
                    <span>
                      <span className="condensed block text-3xl leading-none">
                        {t(`categories.items.${key}.name`)}
                      </span>
                      <span className="mt-1 block text-sm text-white/85">
                        {t(`categories.items.${key}.manifesto`)}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-ink transition-colors group-hover:bg-ember"
                    >
                      <ArrowIcon />
                    </span>
                  </span>
                </Link>
                <p className="mt-3 px-1 font-mono text-[0.7rem] leading-relaxed text-ink-soft">
                  {t(`categories.items.${key}.points`)}
                  <span className="block pt-1 text-ember-ink">{t("categories.soon")}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Ayak İkizi ───────────────────────────────────────── */}
      <section aria-labelledby="ayak-baslik" className="relative overflow-hidden">
        <div aria-hidden="true" className="orb orb-tide top-10 -right-32 size-[520px] opacity-55" />
        <div aria-hidden="true" className="orb orb-moss bottom-0 left-1/4 size-[360px] opacity-35" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-4 py-24 sm:px-8 md:py-32 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow text-moss">{t("fitTwin.eyebrow")}</p>
            <h2 id="ayak-baslik" className="condensed mt-4 text-display">
              {t("fitTwin.title")}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-smoke">{t("fitTwin.body")}</p>

            <ol className="mt-10 grid gap-3 sm:grid-cols-3">
              {FIT_STEPS.map((step, i) => (
                <li key={step} className="glass rounded-3xl p-5">
                  <span className="condensed text-4xl text-moss">0{i + 1}</span>
                  <p className="mt-3 text-sm leading-relaxed">{t(`fitTwin.steps.${step}`)}</p>
                </li>
              ))}
            </ol>

            <p className="mt-6 flex max-w-2xl gap-3 text-sm leading-relaxed text-smoke">
              <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-moss" />
              {t("fitTwin.privacy")}
            </p>
            <Link href="/ayak-ikizi" className={buttonClass({ size: "lg", className: "mt-8" })}>
              {t("fitTwin.cta")}
              <ArrowIcon />
            </Link>
          </div>

          <div className="glass relative mx-auto w-full max-w-[440px] rounded-[32px] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-smoke">Fit Twin · L/W</p>
              <span className="demo-badge text-ember">DEMO</span>
            </div>
            <FootDiagram className="mx-auto mt-4 h-auto w-[78%] text-white" />
            <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white/5 p-4">
              <ScoreDial score={87} label={t("fitTwin.sampleLabel")} className="size-20" />
              <div>
                <p className="text-sm font-semibold">{t("fitTwin.sampleLabel")}</p>
                <p className="mt-1 font-mono text-xs text-moss">{t("fitTwin.sampleReason")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── İsmin hikâyesi ───────────────────────────────────── */}
      <section aria-labelledby="mit-baslik" className="bg-carbon">
        <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 md:py-32">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div>
              <p className="eyebrow text-ember">{t("myth.eyebrow")}</p>
              <h2 id="mit-baslik" className="condensed mt-4 text-headline">
                {t("myth.title")}
              </h2>
            </div>
            <p className="leading-relaxed text-smoke">{t("myth.body")}</p>
          </div>

          <dl className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {MYTH_ROWS.map((row, i) => (
              <div
                key={row}
                className="group flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-ember/60 hover:bg-white/[0.06]"
              >
                <span aria-hidden="true" className="font-mono text-xs text-ember">
                  0{i + 1}
                </span>
                <dt className="mt-6 text-lg leading-snug font-bold">{t(`myth.rows.${row}.myth`)}</dt>
                <dd className="mt-auto pt-6 text-sm leading-relaxed text-smoke">
                  {t(`myth.rows.${row}.promise`)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Atölye ───────────────────────────────────────────── */}
      <section aria-labelledby="atolye-baslik" className="bg-chalk text-ink">
        <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 md:py-32">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="eyebrow text-ember-ink">{t("atelier.eyebrow")}</p>
              <h2 id="atolye-baslik" className="condensed mt-3 text-display">
                {t("atelier.title")}
              </h2>
            </div>
            <p className="max-w-md leading-relaxed text-ink-soft">{t("atelier.body")}</p>
          </div>

          <ol className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {ATELIER_STEPS.map((step, i) => (
              <li
                key={step}
                className="flex aspect-square flex-col justify-between rounded-3xl bg-white p-5 shadow-[0_10px_30px_-18px_rgb(11_11_12/0.4)] transition-transform hover:-translate-y-1"
              >
                <span className="condensed text-5xl text-ember-ink">{i + 1}</span>
                <span className="text-base leading-tight font-bold">{t(`atelier.steps.${step}`)}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Ölçülebilir sözler ───────────────────────────────── */}
      <section aria-labelledby="soz-baslik" className="relative overflow-hidden">
        <div aria-hidden="true" className="orb orb-ember -top-32 left-1/3 size-[460px] opacity-35" />
        <div className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-8 md:py-32">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="eyebrow text-moss">{t("promises.eyebrow")}</p>
              <h2 id="soz-baslik" className="condensed mt-3 text-display">
                {t("promises.title")}
              </h2>
            </div>
            <p className="leading-relaxed text-smoke">
              {t("promises.body")}{" "}
              <span className="font-semibold text-white">{t("promises.demoNote")}</span>
            </p>
          </div>
          <dl className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.key} className="glass flex flex-col rounded-3xl p-6">
                <dt className="flex items-start justify-between gap-3 text-sm text-smoke">
                  {t(`promises.metrics.${m.key}`)}
                  <span className="demo-badge text-ember">DEMO</span>
                </dt>
                <dd className={`condensed mt-8 text-6xl ${m.accent}`}>{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Kapanış ──────────────────────────────────────────── */}
      <section className="bg-ember text-ink">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-10 px-4 py-20 sm:px-8 md:py-28 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xl font-bold">{t("closing.title")}</p>
            <p className="mt-1 text-xl font-medium">{t("closing.body")}</p>
            {/* İngilizce slogan: lang="en" olmazsa TR büyük harf kuralı "ARİON" üretir */}
            <p lang="en" className="condensed mt-6 text-mega">
              {t("closing.slogan")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/ayak-ikizi" className={buttonClass({ variant: "dark", size: "lg" })}>
              {t("closing.cta")}
              <ArrowIcon />
            </Link>
            <Link href="/manifesto" className={buttonClass({ variant: "outline", size: "lg" })}>
              {t("closing.ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
