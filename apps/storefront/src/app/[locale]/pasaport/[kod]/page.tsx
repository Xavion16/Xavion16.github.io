import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import {
  getFormatter,
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"
import { notFound } from "next/navigation"
import { ShoeDrawing } from "@/components/illustrations/shoe-drawings"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { CATEGORY_GRADIENT, isCategoryKey } from "@/lib/category-style"
import { getPassport } from "@/lib/medusa/workshop"
import { localizedAlternates } from "@/lib/metadata"

type Props = PageProps<"/[locale]/pasaport/[kod]">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, kod } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "passport" })
  return {
    title: t("metaTitle", { code: kod.toUpperCase() }),
    robots: { index: false },
    alternates: localizedAlternates(
      { pathname: "/pasaport/[kod]", params: { kod } },
      locale,
    ),
  }
}

/** Ayakkabı Pasaportu (Rapor §6.4) — QR ile açılır. Ürüne aittir; kişisel veri içermez. */
export default async function PassportPage({ params }: Props) {
  const { locale, kod } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const data = await getPassport(kod)
  if (!data) notFound()
  const t = await getTranslations("passport")
  const tr = await getTranslations("repair")
  const tp = await getTranslations("shop.product")
  const format = await getFormatter()
  const messages = await getMessages()
  const metricLabels: Record<string, string> = messages.shop.product.metrics
  const units: Record<string, string> = messages.shop.product.units
  const care: Record<string, string[]> = messages.passport.careByCategory
  const specialties: Record<string, string> = messages.passport.specialties
  const constructions: Record<string, string> =
    messages.shop.product.construction

  const { passport, product, tech, last, craftsman, repairs } = data
  const catHandle = product?.category?.handle ?? "sneaker"
  const category = isCategoryKey(catHandle) ? catHandle : "sneaker"
  const opts = passport.variant_options
  const date = (d: string) =>
    format.dateTime(new Date(d), { dateStyle: "long" })

  return (
    <div
      className="mx-auto max-w-[1200px] px-4 pt-10 pb-24 sm:px-8"
      data-testid="passport-page"
    >
      <header
        className={`relative overflow-hidden rounded-[4px] bg-gradient-to-br p-6 sm:p-10 ${CATEGORY_GRADIENT[category]}`}
      >
        <span
          aria-hidden="true"
          className="tech-grid absolute inset-0 opacity-50"
        />
        <div className="relative grid items-center gap-8 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eyebrow text-white/90">{t("eyebrow")}</p>
            <h1
              className="mt-3 font-mono text-3xl font-bold text-white sm:text-5xl"
              data-testid="passport-code"
            >
              {passport.code}
            </h1>
            <p className="condensed mt-4 text-4xl text-white">
              {product?.title}
            </p>
            {passport.is_demo ? (
              <span className="demo-badge glass mt-4 inline-block border-0 px-3 py-1 text-white">
                DEMO
              </span>
            ) : null}
            <p className="mt-4 max-w-md text-sm text-white/90">
              {t("privacy")}
            </p>
          </div>
          <ShoeDrawing
            category={category}
            className="w-full max-w-sm justify-self-end -rotate-6 text-white"
          />
        </div>
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section aria-labelledby="kimlik" className="glass rounded-[4px] p-6">
          <h2 id="kimlik" className="sr-only">
            {t("product")}
          </h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-smoke">{t("product")}</dt>
              <dd className="mt-1 font-semibold text-white">
                {product?.title}
              </dd>
            </div>
            <div>
              <dt className="text-smoke">{t("last")}</dt>
              <dd className="mt-1 font-semibold text-white">
                {last ? `${last.name} · ${last.code}` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-smoke">{t("options")}</dt>
              <dd className="mt-1 font-semibold text-white">
                {[opts.color, opts.size ? `EU ${opts.size}` : null, opts.width]
                  .filter(Boolean)
                  .join(" · ")}
              </dd>
            </div>
            <div>
              <dt className="text-smoke">{t("produced")}</dt>
              <dd className="mt-1 font-semibold text-white">
                {date(passport.produced_at)}
              </dd>
            </div>
            {passport.batch ? (
              <div>
                <dt className="text-smoke">{t("batch")}</dt>
                <dd className="mt-1 font-mono text-white">{passport.batch}</dd>
              </div>
            ) : null}
            {tech ? (
              <div>
                <dt className="text-smoke">{tp("construction.label")}</dt>
                <dd className="mt-1 font-semibold text-white">
                  {constructions[tech.construction] ?? tech.construction}
                </dd>
              </div>
            ) : null}
          </dl>
          {product ? (
            <Link
              href={{
                pathname: "/urun/[slug]",
                params: { slug: product.handle },
              }}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ember hover:text-white"
            >
              {t("viewProduct")} 
            </Link>
          ) : null}
        </section>

        {craftsman ? (
          <section aria-labelledby="usta" className="glass rounded-[4px] p-6">
            <h2
              id="usta"
              className="text-sm font-bold tracking-wide text-smoke uppercase"
            >
              {t("craftsman")}
            </h2>
            <p className="condensed mt-3 text-3xl text-white">
              {craftsman.name}
            </p>
            <p className="mt-1 text-sm text-smoke">
              {specialties[craftsman.specialty] ?? craftsman.specialty} ·{" "}
              {t("since", { year: craftsman.since_year })}
            </p>
            <p className="mt-4 leading-relaxed text-white/90">
              {craftsman.bio[locale]}
            </p>
          </section>
        ) : null}

        {tech ? (
          <section
            aria-labelledby="malzeme"
            className="glass rounded-[4px] p-6"
          >
            <h2 id="malzeme" className="text-lg font-bold text-white">
              {t("materials")}
            </h2>
            <ul className="mt-4 divide-y divide-white/10 text-sm">
              {tech.materials.items.map((m) => (
                <li key={m.part} className="flex justify-between gap-4 py-2">
                  <span className="text-smoke">{m.part}</span>
                  <span className="text-right text-white">
                    {m.material}{" "}
                    <span className="text-smoke">· {m.origin}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tech ? (
          <section aria-labelledby="test" className="glass rounded-[4px] p-6">
            <div className="flex items-start justify-between">
              <h2 id="test" className="text-lg font-bold text-white">
                {t("tests")}
              </h2>
              <span className="demo-badge text-ember">DEMO</span>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {tech.test_metrics.metrics.map((m) => (
                <li
                  key={m.key}
                  className="rounded-[4px] border border-white/10 p-3"
                >
                  <span className="block text-smoke">
                    {metricLabels[m.key] ?? m.key}
                  </span>
                  <span className="mt-1 block font-mono text-lg text-moss">
                    {format.number(m.value)}{" "}
                    <span className="text-xs text-smoke">
                      {units[m.unit] ?? m.unit}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          aria-labelledby="tamir-gecmisi"
          className="glass rounded-[4px] p-6 md:col-span-2"
        >
          <h2 id="tamir-gecmisi" className="text-lg font-bold text-white">
            {t("repairs")}
          </h2>
          {repairs.length ? (
            <ol
              className="mt-5 space-y-4 border-l border-white/15 pl-6"
              data-testid="repair-history"
            >
              {repairs.map((r, i) => (
                <li key={`${r.completed_at}-${i}`} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-[29px] size-3 rounded-full bg-moss"
                  />
                  <p className="font-semibold text-white">
                    {tr(`types.${r.type}`)}
                  </p>
                  <p className="text-sm text-smoke">{date(r.completed_at)}</p>
                  {r.public_note ? (
                    <p className="mt-1 text-sm text-white/90">
                      {r.public_note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-smoke">{t("noRepairs")}</p>
          )}
          <Link
            href={{
              pathname: "/omur-plani",
              query: { pasaport: passport.code },
            }}
            className={`${buttonClass({})} mt-6`}
          >
            {t("repairCta")} 
          </Link>
        </section>

        <section aria-labelledby="bakim" className="glass rounded-[4px] p-6">
          <h2 id="bakim" className="text-lg font-bold text-white">
            {t("care")}
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/90">
            {(care[category] ?? []).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="omur-sonu"
          className="glass rounded-[4px] p-6"
        >
          <h2 id="omur-sonu" className="text-lg font-bold text-white">
            {t("recycle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/90">
            {t("recycleBody")}
          </p>
          {passport.dpp ? (
            <>
              <p className="mt-4 text-xs font-semibold tracking-wide text-smoke uppercase">
                {t("dpp")} · DEMO
              </p>
              <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
                {passport.dpp.recycled_share_pct != null ? (
                  <div>
                    <dt className="text-smoke">{t("dppRecycled")}</dt>
                    <dd className="font-mono text-white">
                      %{passport.dpp.recycled_share_pct}
                    </dd>
                  </div>
                ) : null}
                {passport.dpp.carbon_kg_demo != null ? (
                  <div>
                    <dt className="text-smoke">{t("dppCarbon")}</dt>
                    <dd className="font-mono text-white">
                      {format.number(passport.dpp.carbon_kg_demo)} kg CO₂e
                    </dd>
                  </div>
                ) : null}
              </dl>
            </>
          ) : null}
        </section>
      </div>
    </div>
  )
}
