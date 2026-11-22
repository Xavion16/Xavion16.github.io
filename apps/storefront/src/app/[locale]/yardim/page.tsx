import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { OpenAreionButton } from "@/components/areion/open-button"
import { FaqSearch } from "@/components/help/faq-search"
import { FAQ, FAQ_CATEGORIES, type FaqCategory } from "@/content/faq"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { localizedAlternates } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/yardim">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "help" })
  return { title: t("eyebrow"), alternates: localizedAlternates("/yardim", locale) }
}

export default async function HelpPage({ params }: PageProps<"/[locale]/yardim">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("help")

  const categories = Object.fromEntries(
    (Object.keys(FAQ_CATEGORIES) as FaqCategory[]).map((c) => [c, FAQ_CATEGORIES[c][locale]]),
  ) as Record<FaqCategory, string>
  const items = FAQ.map((f) => ({ id: f.id, category: f.category, q: f.q[locale], a: f.a[locale] }))

  const card = "glass flex flex-col gap-1 rounded-[4px] p-5 transition-colors hover:border-white/40"
  return (
    <div className="relative -mt-[76px] overflow-hidden pt-[76px]">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[520px]">
        <div className="orb orb-tide -top-24 right-0 size-[460px] opacity-50" />
        <div className="tech-grid absolute inset-0 [mask-image:linear-gradient(black,transparent)]" />
      </div>
      <div className="relative mx-auto max-w-[1100px] px-4 pt-14 pb-24 sm:px-8">
        <p className="eyebrow text-ember">{t("eyebrow")}</p>
        <h1 className="condensed mt-3 text-display">{t("title")}</h1>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <li>
            <Link href="/yardim/siparis-takip" className={card}>
              <span className="font-bold">{t("quick.tracking")}</span>
              <span className="text-sm text-smoke">{t("quick.trackingDesc")}</span>
            </Link>
          </li>
          <li>
            <Link href="/yardim/iade" className={card}>
              <span className="font-bold">{t("quick.returns")}</span>
              <span className="text-sm text-smoke">{t("quick.returnsDesc")}</span>
            </Link>
          </li>
          <li>
            <Link href="/yardim/talep" className={card}>
              <span className="font-bold">{t("quick.ticket")}</span>
              <span className="text-sm text-smoke">{t("quick.ticketDesc")}</span>
            </Link>
          </li>
          <li>
            <OpenAreionButton className={`${card} w-full text-left`}>
              <span className="font-bold">{t("quick.chat")}</span>
              <span className="text-sm text-smoke">{t("quick.chatDesc")}</span>
            </OpenAreionButton>
          </li>
        </ul>

        <div className="mt-14">
          <FaqSearch items={items} categories={categories} />
        </div>
      </div>
    </div>
  )
}
