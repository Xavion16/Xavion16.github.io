import { SELLER } from "@arion/legal-texts"
import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { OpenAreionButton } from "@/components/areion/open-button"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { localizedAlternates } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/iletisim">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "help.contact" })
  return { title: t("title"), alternates: localizedAlternates("/iletisim", locale) }
}

/** İletişim kanalları, çalışma saatleri, adres ve KEP (Rapor §5, §8.1). */
export default async function ContactPage({ params }: PageProps<"/[locale]/iletisim">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("help")
  const row = "flex flex-wrap justify-between gap-2 border-b border-white/10 py-3"
  return (
    <div className="mx-auto max-w-[900px] px-4 pt-14 pb-24 sm:px-8">
      <h1 className="condensed text-display">{t("contact.title")}</h1>
      <p className="mt-4 text-smoke">{t("contact.intro")}</p>
      <section aria-labelledby="kanallar" className="glass mt-10 rounded-[28px] p-6 sm:p-8">
        <h2 id="kanallar" className="text-lg font-bold">{t("contact.channels")}</h2>
        <dl className="mt-4 text-sm">
          <div className={row}><dt className="text-smoke">{t("contact.chat")}</dt><dd><OpenAreionButton className="font-semibold underline underline-offset-4">{t("quick.chat")}</OpenAreionButton></dd></div>
          <div className={row}><dt className="text-smoke">{t("contact.whatsapp")}</dt><dd>—</dd></div>
          <div className={row}><dt className="text-smoke">{t("contact.email")}</dt><dd>{SELLER.email}</dd></div>
          <div className={row}><dt className="text-smoke">{t("contact.phone")}</dt><dd>{SELLER.phone} · {t("hours")}</dd></div>
          <div className={row}><dt className="text-smoke">{t("contact.address")}</dt><dd>{SELLER.address}</dd></div>
          <div className="flex flex-wrap justify-between gap-2 py-3"><dt className="text-smoke">{t("contact.kep")}</dt><dd>{SELLER.kep}</dd></div>
        </dl>
        <Link href="/yardim/talep" className={buttonClass({ variant: "light", className: "mt-6" })}>{t("quick.ticket")}</Link>
      </section>
    </div>
  )
}
