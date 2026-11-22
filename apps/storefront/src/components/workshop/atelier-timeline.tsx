import { getFormatter, getTranslations } from "next-intl/server"
import type { OrderAtelier } from "@/lib/medusa/workshop"
import { cn } from "@/lib/utils"

/** Atölye Takibi (Rapor §6.5): "Atölyede üretilir" kalemler için adım adım zaman çizelgesi. */
export async function AtelierTimeline({ data }: { data: OrderAtelier }) {
  if (!data.items.length) return null
  const t = await getTranslations("atelier")
  const format = await getFormatter()
  const d = (s: string) => format.dateTime(new Date(s), { dateStyle: "medium" })

  return (
    <section aria-labelledby="atolye-takibi" className="glass mt-8 rounded-[4px] p-6 sm:p-8" data-testid="atelier-timeline">
      <h2 id="atolye-takibi" className="condensed text-4xl text-white">
        {t("timeline.title")}
      </h2>
      {data.items.map((item) => (
        <div key={item.product_id} className="mt-6">
          <p className="font-bold text-white">{item.title}</p>
          <p className="mt-1 text-sm text-smoke">{t("timeline.lead", { date: d(item.due_at), days: item.lead_time_days })}</p>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {item.steps.map((s) => (
              <li
                key={s.code}
                aria-current={s.current ? "step" : undefined}
                className={cn(
                  "rounded-[4px] border p-3 text-sm",
                  s.current ? "border-ember bg-ember/10" : s.done ? "border-moss/40 bg-moss/10" : "border-white/10",
                )}
              >
                <p className="font-semibold text-white">{t(`stepNames.${s.code}`)}</p>
                <p className="mt-1 text-xs text-smoke">
                  {s.current ? t("timeline.current") : s.done ? t("timeline.done") : t("timeline.planned")} · {d(s.at)}
                </p>
                {s.craftsman && s.code !== "shipping" ? (
                  <p className="mt-1 text-xs text-white/80">{t("timeline.by", { name: s.craftsman })}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ))}
      <p className="mt-4 text-xs text-smoke">{t("timeline.note")}</p>
    </section>
  )
}
