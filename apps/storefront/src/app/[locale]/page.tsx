import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { SplitHero } from "@/components/home/split-hero"
import { ProductCard } from "@/components/shop/product-card"
import { ScoreDial } from "@/components/fit/score-dial"
import { FootDiagram } from "@/components/illustrations/foot-diagram"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { productShot } from "@/lib/imagery"
import { getPriceReferences, listProducts, minPrice } from "@/lib/medusa/catalog"
import { localizedAlternates } from "@/lib/metadata"

const SALON_HANDLES = ["adrastus-oxford", "pollux-derby", "castor-loafer"] as const
// Dünya kartları: her dünyanın öncü ürününün stüdyo görseli (DECISIONS #081)
const WORLDS = [
  { key: "women", kategori: "topuklu", shot: "selene-stiletto" },
  { key: "men", kategori: "erkek", shot: "adrastus-oxford" },
  { key: "kids", kategori: "cocuk", shot: "iris-cirtli" },
] as const

const MYTH_ROWS = ["carrier", "earthWater", "speed", "immortal", "speaking"] as const
const FIT_STEPS = ["measure", "match", "explain"] as const
const MARQUEE = ["m1", "m2", "m3", "m4", "m5", "m6"] as const
// Atölye şeridi: el işi görselleri (DECISIONS #083)
const CRAFT = [
  { step: "cutting", src: "/editorial/craft-kesim.webp" },
  { step: "upper", src: "/editorial/craft-dikis.webp" },
  { step: "lasting", src: "/editorial/craft-kalip.webp" },
  { step: "finishing", src: "/editorial/craft-cila.webp" },
] as const
const ATELIER_STEPS = [
  "cutting",
  "upper",
  "lasting",
  "sole",
  "finishing",
  "qc",
  "shipping",
] as const


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
  const tk = await getTranslations("home.kadife")
  const all = await listProducts({})
  const salon = SALON_HANDLES.flatMap((h) => all.filter((p) => p.handle === h))
  const salonRefs = await getPriceReferences(salon.map((p) => p.id))
  const priceOf = (handle: string) => {
    const p = all.find((x) => x.handle === handle)
    const amount = p ? minPrice(p) : null
    return amount != null ? format.number(amount, { style: "currency", currency: "TRY", maximumFractionDigits: 0 }) : null
  }
  // Topuklu vitrini: iki model × iki renk, katalogla aynı stüdyo görselleri (DECISIONS #081)
  const ROOM_TILES = [
    { key: "stiletto", src: "/products/selene-stiletto.webp", slug: "selene-stiletto" },
    { key: "cizme", src: "/products/artemis-topuklu-cizme.webp", slug: "artemis-topuklu-cizme" },
    { key: "slingback", src: "/products/aurea-slingback.webp", slug: "aurea-slingback" },
    { key: "bot", src: "/products/hera-bilek-bot.webp", slug: "hera-bilek-bot" },
  ] as const

  const metrics = [
    {
      key: "fitReturns",
      value: format.number(0.068, { style: "percent", maximumFractionDigits: 1 }),
      accent: "text-ember",
    },
    { key: "repaired", value: format.number(1284), accent: "text-chalk" },
    {
      key: "lifespan",
      value: `${format.number(31)} ${t("promises.units.months")}`,
      accent: "text-tide",
    },
    {
      key: "firstResponse",
      value: `${format.number(4)} ${t("promises.units.minutes")}`,
      accent: "text-chalk",
    },
  ] as const

  return (
    <>
      {/* ── Açılış: Kadın | Erkek (üzerine gelinen taraf büyür, DECISIONS #078) ── */}
      <SplitHero
        title={tk("split.title")}
        sides={[
          {
            key: "women",
            src: "/editorial/hero-women.webp",
            alt: tk("hero.imageAlt"),
            crop: "object-[50%_100%]",
            content: (
              <>
                <p className="eyebrow text-ember">{tk("hero.eyebrow")}</p>
                <h2 id="hero-women" className="condensed chrome-text mt-3 pb-[0.08em] text-display">
                  {tk.rich("hero.title", { em: (c) => <em>{c}</em> })}
                </h2>
                <div className="split-collapse">
                  <p className="max-w-sm pt-4 text-base leading-relaxed text-chalk/85">{tk("hero.lead")}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={ { pathname: "/koleksiyon/[kategori]", params: { kategori: "topuklu" } }} className={buttonClass({ size: "lg" })}>
                    {tk("hero.cta")}
                  </Link>
                  <Link href={ { pathname: "/urun/[slug]", params: { slug: "selene-stiletto" } }} className={buttonClass({ variant: "glass", size: "lg", className: "split-reveal" })}>
                    {tk("hero.ctaAlt")}
                  </Link>
                </div>
              </>
            ),
          },
          {
            key: "men",
            src: "/editorial/hero-men.webp",
            alt: tk("heroMen.imageAlt"),
            crop: "object-[50%_100%]",
            content: (
              <>
                <p className="eyebrow text-tide">{tk("heroMen.eyebrow")}</p>
                <h2 id="hero-men" className="condensed chrome-text mt-3 pb-[0.08em] text-display [&_em]:text-tide">
                  {tk.rich("heroMen.title", { em: (c) => <em>{c}</em> })}
                </h2>
                <div className="split-collapse">
                  <p className="max-w-sm pt-4 text-base leading-relaxed text-chalk/85">{tk("heroMen.lead")}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={ { pathname: "/koleksiyon/[kategori]", params: { kategori: "erkek" } }} className={buttonClass({ size: "lg" })}>
                    {tk("heroMen.cta")}
                  </Link>
                  <Link href={"/atolye"} className={buttonClass({ variant: "glass", size: "lg", className: "split-reveal" })}>
                    {tk("heroMen.ctaAlt")}
                  </Link>
                </div>
              </>
            ),
          },
        ]}
      />

      {/* ── Hizmet şeridi: hareketsiz, ince altın çizgilerle (kayan bant kaldırıldı, DECISIONS #083) ── */}
      <section aria-label={t("marquee.label")} className="border-y border-ember/25 bg-void">
        <ul className="mx-auto grid max-w-[1440px] grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {MARQUEE.map((k) => (
            <li
              key={k}
              lang={k === "m1" ? "en" : undefined}
              className="border-chalk/10 px-4 py-5 text-center text-[0.72rem] font-medium tracking-[0.14em] text-chalk/85 uppercase not-last:border-r max-sm:even:border-r-0 sm:max-lg:[&:nth-child(3n)]:border-r-0"
            >
              {t(`marquee.${k}`)}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Kırmızı Vitrin: kadın (yalnızca topuklu) ───────────────── */}
      <section aria-labelledby="oda-baslik" className="velvet-bg py-24 md:py-36">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="grid items-end gap-8 md:grid-cols-2">
            <div>
              <p className="eyebrow text-ember">{tk("room.eyebrow")}</p>
              <h2 id="oda-baslik" className="condensed chrome-text mt-4 text-display">
                {tk.rich("room.title", { em: (c) => <em>{c}</em> })}
              </h2>
            </div>
            <p className="max-w-lg text-lg leading-relaxed text-smoke md:justify-self-end">{tk("room.lead")}</p>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {ROOM_TILES.map((tile) => (
              <Link
                key={tile.key}
                href={{ pathname: "/urun/[slug]", params: { slug: tile.slug } }}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[4px] bg-void"
              >
                <Image
                  src={tile.src}
                  alt={tk("room.tileAlt", { name: tk(`room.tiles.${tile.key}`) })}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-4 bottom-3 flex flex-wrap items-end justify-between gap-x-3 sm:bottom-4">
                  <span className="font-display text-lg leading-tight italic sm:text-2xl">{tk(`room.tiles.${tile.key}`)}</span>
                  <span className="text-xs text-chalk/85 sm:text-sm">{priceOf(tile.slug)}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={{ pathname: "/koleksiyon/[kategori]", params: { kategori: "topuklu" } }} className={buttonClass({ size: "lg" })}>
              {tk("room.cta")}
            </Link>
            <Link href={{ pathname: "/urun/[slug]", params: { slug: "artemis-topuklu-cizme" } }} className={buttonClass({ variant: "glass", size: "lg" })}>
              {tk("room.see3d")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Kadife Salon: erkek ─────────────────────────────────── */}
      <section aria-labelledby="salon-baslik" className="bg-carbon py-24 md:py-36">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.25fr]">
            <div>
              <p className="eyebrow text-tide">{tk("salon.eyebrow")}</p>
              <h2 id="salon-baslik" className="condensed chrome-text mt-4 text-display [&_em]:text-tide">
                {tk.rich("salon.title", { em: (c) => <em>{c}</em> })}
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-smoke">{tk("salon.lead")}</p>
              <Link href={{ pathname: "/koleksiyon/[kategori]", params: { kategori: "erkek" } }} className={`${buttonClass({ variant: "glass", size: "lg" })} mt-8`}>
                {tk("salon.cta")}
              </Link>
            </div>
            <div className="relative aspect-[5/4] overflow-hidden rounded-[4px] bg-void">
              <Image src="/editorial/men-trio.webp" alt={tk("salon.imageAlt")} fill sizes="(min-width: 1024px) 55vw, 92vw" className="object-cover" />
            </div>
          </div>
          {salon.length ? (
            <ul className="mt-16 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {salon.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} reference={salonRefs[p.id]} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {/* ── Üç dünya ─────────────────────────────────────────────── */}
      <section aria-labelledby="dunya-baslik" className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8">
        <h2 id="dunya-baslik" className="condensed text-headline">{tk.rich("explore.title", { em: (c) => <em>{c}</em> })}</h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {WORLDS.map((w) => (
            <li key={w.key}>
              <Link href={{ pathname: "/koleksiyon/[kategori]", params: { kategori: w.kategori } }} className="group relative block aspect-[4/5] overflow-hidden rounded-[4px] bg-void">
                <Image src={productShot(w.shot) ?? ""} alt="" fill sizes="(min-width: 768px) 30vw, 92vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-void/90 to-transparent to-60%" />
                <span className="absolute inset-x-5 bottom-5">
                  <span className="font-display block text-4xl">{tk(`explore.${w.key}`)}</span>
                  <span className="text-sm text-smoke">{tk(`explore.${w.key}Sub`)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-smoke">{tk("credit")}</p>
      </section>

      {/* ── Ayak İkizi ───────────────────────────────────────── */}
      <section aria-labelledby="ayak-baslik" className="bg-void">
        <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-4 py-24 sm:px-8 md:py-32 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow text-ember">{t("fitTwin.eyebrow")}</p>
            <h2 id="ayak-baslik" className="condensed mt-4 text-display">
              {t("fitTwin.title")}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-smoke">{t("fitTwin.body")}</p>

            <ol className="mt-10 border-t border-chalk/15">
              {FIT_STEPS.map((step, i) => (
                <li key={step} className="grid grid-cols-[4rem_1fr] items-baseline gap-4 border-b border-chalk/15 py-5">
                  <span className="condensed text-3xl text-ember">0{i + 1}</span>
                  <p className="leading-relaxed">{t(`fitTwin.steps.${step}`)}</p>
                </li>
              ))}
            </ol>

            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-smoke">{t("fitTwin.privacy")}</p>
            <Link href="/ayak-ikizi" className={buttonClass({ size: "lg", className: "mt-8" })}>
              {t("fitTwin.cta")}
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-[440px] rounded-[4px] border border-chalk/15 bg-carbon p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-smoke">Fit Twin · L/W</p>
              <span className="demo-badge text-ember">DEMO</span>
            </div>
            <FootDiagram className="mx-auto mt-4 h-auto w-[78%] text-ember" />
            <div className="mt-4 flex items-center gap-4 border-t border-chalk/15 pt-4">
              <ScoreDial score={87} label={t("fitTwin.sampleLabel")} className="size-20" />
              <div>
                <p className="text-sm font-semibold">{t("fitTwin.sampleLabel")}</p>
                <p className="mt-1 font-mono text-xs text-smoke">{t("fitTwin.sampleReason")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── İsmin hikâyesi: numaralı, çizgili satırlar ─────────── */}
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

          <dl className="mt-14 border-t border-chalk/15">
            {MYTH_ROWS.map((row, i) => (
              <div key={row} className="grid gap-2 border-b border-chalk/15 py-6 md:grid-cols-[4rem_1fr_1.2fr] md:gap-8">
                <span aria-hidden="true" className="condensed text-2xl text-ember">
                  0{i + 1}
                </span>
                <dt className="font-display text-2xl leading-snug italic">{t(`myth.rows.${row}.myth`)}</dt>
                <dd className="leading-relaxed text-smoke md:pt-1">{t(`myth.rows.${row}.promise`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Atölye: el işi görselleri (DECISIONS #083) ──────────── */}
      <section aria-labelledby="atolye-baslik" className="velvet-bg">
        <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 md:py-32">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="eyebrow text-ember">{t("atelier.eyebrow")}</p>
              <h2 id="atolye-baslik" className="condensed mt-3 text-display">
                {t("atelier.title")}
              </h2>
            </div>
            <p className="max-w-md leading-relaxed text-smoke">{t("atelier.body")}</p>
          </div>

          <ol tabIndex={0} aria-label={t("atelier.title")} className="-mx-4 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {CRAFT.map((c, i) => (
              <li key={c.step} className="w-[78%] shrink-0 snap-start sm:w-auto">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-void">
                  <Image src={c.src} alt={t(`atelier.craftAlt.${c.step}`)} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 78vw" className="object-cover" />
                </div>
                <p className="mt-4 flex items-baseline gap-3">
                  <span className="condensed text-2xl text-ember">0{i + 1}</span>
                  <span className="font-display text-xl italic">{t(`atelier.steps.${c.step}`)}</span>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-smoke">{t(`atelier.stepDesc.${c.step}`)}</p>
              </li>
            ))}
          </ol>

          <p className="mt-10 border-t border-chalk/15 pt-6 text-sm text-smoke">
            {ATELIER_STEPS.map((step) => t(`atelier.steps.${step}`)).join("  ·  ")}
            <Link href="/atolye" className="ml-4 font-medium text-chalk underline underline-offset-4 hover:text-ember">
              {t("atelier.more")}
            </Link>
          </p>
        </div>
      </section>

      {/* ── Ölçülebilir sözler: büyük rakamlı çizgili tablo ───────── */}
      <section aria-labelledby="soz-baslik" className="bg-void">
        <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 md:py-32">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="eyebrow text-ember">{t("promises.eyebrow")}</p>
              <h2 id="soz-baslik" className="condensed mt-3 text-display">
                {t("promises.title")}
              </h2>
            </div>
            <p className="leading-relaxed text-smoke">
              {t("promises.body")} <span className="font-semibold text-chalk">{t("promises.demoNote")}</span>
            </p>
          </div>
          <dl className="mt-14 grid border-t border-chalk/15 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.key} className="flex flex-col-reverse gap-3 border-b border-chalk/15 py-8 sm:px-6 sm:first:pl-0 lg:border-r lg:last:border-r-0">
                <dt className="flex items-center gap-3 text-sm text-smoke">
                  {t(`promises.metrics.${m.key}`)}
                  <span className="demo-badge text-ember">DEMO</span>
                </dt>
                <dd className={`condensed text-6xl ${m.accent}`}>{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Kapanış ──────────────────────────────────────────── */}
      <section className="border-t border-ember/25 bg-carbon">
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
            <Link href="/ayak-ikizi" className={buttonClass({ size: "lg" })}>
              {t("closing.cta")}
            </Link>
            <Link href="/manifesto" className={buttonClass({ variant: "glass", size: "lg" })}>
              {t("closing.ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
