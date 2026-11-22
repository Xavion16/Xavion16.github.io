import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { getTransparency } from "@/lib/medusa/workshop"
import { localizedAlternates } from "@/lib/metadata"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: PageProps<"/[locale]/seffaflik">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "transparency" })
  return { title: t("metaTitle"), description: t("metaDescription"), alternates: localizedAlternates("/seffaflik", locale) }
}

const REASONS = ["fit", "dislike", "defective", "wrong_item"] as const

/** Şeffaflık Paneli (Rapor §2.3): değerler her açılışta veritabanından hesaplanır. */
export default async function TransparencyPage({ params }: PageProps<"/[locale]/seffaflik">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("transparency")
  const format = await getFormatter()
  const data = await getTransparency()

  const card = (id: string, title: string, value: string, how: string) => (
    <section aria-labelledby={id} className="glass flex flex-col rounded-[4px] p-6" data-testid={`metric-${id}`}>
      <div className="flex items-start justify-between gap-3">
        <h2 id={id} className="text-sm font-bold tracking-wide text-smoke uppercase">
          {title}
        </h2>
        <span className="demo-badge text-ember">DEMO</span>
      </div>
      <p className="condensed mt-4 text-6xl text-white">{value}</p>
      <p className="mt-auto pt-4 text-sm text-smoke">{how}</p>
    </section>
  )

  const reasonsTotal = data ? Object.values(data.returns.reasons).reduce((a, b) => a + b, 0) : 0

  return (
    <div className="relative -mt-[76px] overflow-hidden pt-[76px]">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="orb orb-tide -top-24 right-0 size-[480px] opacity-50" />
        <div className="orb orb-moss bottom-0 -left-40 size-[420px] opacity-30" />
      </div>
      <div className="relative mx-auto max-w-[1440px] px-4 pt-16 pb-24 sm:px-8 md:pt-24">
        <p className="eyebrow text-tide">{t("eyebrow")}</p>
        <h1 className="condensed mt-4 text-display">{t("title")}</h1>
        <p className="mt-6 max-w-2xl text-lg text-smoke">{t("lead")}</p>
        <p className="mt-4 max-w-2xl rounded-[4px] border border-ember/40 bg-ember/10 p-3 text-sm text-white">{t("demo")}</p>

        {data ? (
          <>
            <p className="mt-6 text-xs text-smoke">
              {t("generated", { date: format.dateTime(new Date(data.generated_at), { dateStyle: "medium", timeStyle: "short" }) })}
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {card(
                "iade",
                t("returnRate"),
                `%${format.number(data.returns.rate_pct)}`,
                t("returnRateHow", { returns: data.returns.count, orders: data.returns.orders }),
              )}
              <section aria-labelledby="nedenler" className="glass rounded-[4px] p-6 xl:col-span-2">
                <h2 id="nedenler" className="text-sm font-bold tracking-wide text-smoke uppercase">
                  {t("reasons")}
                </h2>
                <ul className="mt-5 space-y-3">
                  {REASONS.map((r) => {
                    const n = data.returns.reasons[r] ?? 0
                    const pct = reasonsTotal ? Math.round((n / reasonsTotal) * 100) : 0
                    return (
                      <li key={r}>
                        <div className="flex justify-between text-sm">
                          <span className="text-white">{t(`reasonLabels.${r}`)}</span>
                          <span className="font-mono text-smoke">
                            {n} · %{pct}
                          </span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-white/10" aria-hidden="true">
                          <div className="h-2 rounded-full bg-tide" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
              {card("tamir", t("repaired"), format.number(data.repairs.completed), t("repairedHow"))}
              {card("geri-al", t("recrafted"), format.number(data.recraft.completed), t("recraftedHow"))}
              {card(
                "omur",
                t("lifetime"),
                data.lifetime.avg_months != null ? t("lifetimeValue", { months: format.number(data.lifetime.avg_months) }) : t("noData"),
                t("lifetimeHow", { n: data.lifetime.sample }),
              )}
              {card(
                "yanit",
                t("response"),
                data.support.avg_first_response_hours != null
                  ? t("responseValue", { hours: format.number(data.support.avg_first_response_hours) })
                  : t("noData"),
                t("responseHow", { n: data.support.sample }),
              )}
            </div>
          </>
        ) : (
          <p className="mt-10 text-smoke">{t("noData")}</p>
        )}
      </div>
    </div>
  )
}
