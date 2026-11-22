import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound, redirect } from "next/navigation"
import { AccountNav } from "@/components/account/account-nav"
import { buttonClass } from "@/components/ui/button"
import { getPathname, Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { getCustomer } from "@/lib/medusa/customer"
import { getMyDataRequests } from "@/lib/medusa/kvkk"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: PageProps<"/[locale]/hesabim/veri-taleplerim">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "shop.account.dataRequests" })
  return { title: t("title"), robots: { index: false } }
}

export default async function DataRequestsPage({ params }: PageProps<"/[locale]/hesabim/veri-taleplerim">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  if (!(await getCustomer())) redirect(getPathname({ href: "/hesabim/giris", locale }))
  const t = await getTranslations("shop.account.dataRequests")
  const requests = await getMyDataRequests()
  const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { dateStyle: "medium" })

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-8">
      <AccountNav current="/hesabim/veri-taleplerim" />
      <h1 className="condensed mt-8 text-display">{t("title")}</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-smoke">{t("intro")}</p>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <div className="glass rounded-[4px] p-6">
          {/* Düz bağlantı: dosya indirme */}
          <a href="/api/hesabim/veri-indir" download className={buttonClass({ variant: "light" })}>
            {t("download")}
          </a>
          <p className="mt-3 text-sm text-smoke">{t("downloadNote")}</p>
        </div>
        <div className="glass rounded-[4px] p-6">
          <Link href="/yasal/kvkk-basvuru" className={buttonClass({ variant: "glass" })}>
            {t("newRequest")}
          </Link>
        </div>
      </div>

      <section aria-labelledby="basvurular" className="mt-10">
        <h2 id="basvurular" className="sr-only">
          {t("title")}
        </h2>
        {requests.length === 0 ? (
          <p className="text-smoke">{t("none")}</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => (
              <li key={r.reference} className="glass flex flex-wrap items-center justify-between gap-3 rounded-[4px] p-5">
                <span className="font-mono text-sm font-semibold">{r.reference}</span>
                <span className="text-sm">{t(`types.${r.type}`)}</span>
                <span className="rounded-[2px] bg-white/10 px-3 py-1 text-xs font-semibold">{t(`statuses.${r.status}`)}</span>
                <span className="text-xs text-smoke">{t("due", { date: fmt.format(new Date(r.due_at)) })}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
