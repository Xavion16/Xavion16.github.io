import { contentHash, type LegalDoc } from "@arion/legal-texts"
import { getLocale, getTranslations } from "next-intl/server"
import type { Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

/** Sürümlü yasal metin görünümü. Başlık hiyerarşisi: h1 sayfa, h2 bölüm. */
export async function LegalDocView({
  doc,
  headingLevel = 1,
  compact = false,
  className,
}: {
  doc: LegalDoc
  headingLevel?: 1 | 2
  compact?: boolean
  className?: string
}) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations("legal")
  const date = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { dateStyle: "long" }).format(
    new Date(doc.updatedAt),
  )
  const Title = headingLevel === 1 ? "h1" : "h2"
  const Section = headingLevel === 1 ? "h2" : "h3"

  return (
    <article className={cn("text-ink", className)}>
      <Title className={cn("condensed", compact ? "text-2xl" : "text-headline")}>{doc.title}</Title>
      <p className="mt-3 font-mono text-xs text-ink-soft">
        {t("version", { version: doc.version, date })} · {t("hash")}: {contentHash(doc)}
      </p>
      {locale === "en" ? (
        <p className="mt-3 rounded-[4px] bg-ink/5 px-4 py-3 text-sm font-semibold">{t("binding")}</p>
      ) : null}
      {doc.intro ? <p className="mt-5 leading-relaxed">{doc.intro}</p> : null}

      {doc.sections.map((s, i) => (
        <section key={i} className={compact ? "mt-5" : "mt-8"}>
          {s.heading ? (
            <Section className={cn("font-bold", compact ? "text-base" : "text-xl")}>{s.heading}</Section>
          ) : null}
          {(s.paragraphs ?? []).map((p, j) => (
            <p key={j} className="mt-3 leading-relaxed">
              {p}
            </p>
          ))}
          {s.items?.length ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed marker:text-ember-ink">
              {s.items.map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ul>
          ) : null}
          {s.table ? (
            <div className="mt-4 overflow-x-auto rounded-[4px] border border-ink/10" tabIndex={0} role="region" aria-label={s.heading ?? doc.title}>
              <table className="w-full text-left text-sm">
                <thead className="bg-ink/5">
                  <tr>
                    {s.table.columns.map((c, j) => (
                      <th key={j} scope="col" className="px-3 py-2 font-semibold">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((row, j) => (
                    <tr key={j} className="border-t border-ink/10 align-top">
                      {row.map((cell, k) =>
                        k === 0 ? (
                          <th key={k} scope="row" className="px-3 py-2 font-semibold">
                            {cell}
                          </th>
                        ) : (
                          <td key={k} className="px-3 py-2">
                            {cell}
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ))}
    </article>
  )
}
