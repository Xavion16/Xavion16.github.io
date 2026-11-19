import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { TicketForm } from "@/components/help/ticket-form"
import { routing } from "@/i18n/routing"
import { getCustomer } from "@/lib/medusa/customer"
import { localizedAlternates } from "@/lib/metadata"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: PageProps<"/[locale]/yardim/talep">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "help.ticket" })
  return { title: t("title"), alternates: localizedAlternates("/yardim/talep", locale) }
}

export default async function TicketPage({ params }: PageProps<"/[locale]/yardim/talep">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("help.ticket")
  const c = await getCustomer()
  return (
    <div className="mx-auto max-w-[900px] px-4 pt-14 pb-24 sm:px-8">
      <h1 className="condensed text-display">{t("title")}</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-smoke">{t("intro")}</p>
      <div className="mt-10">
        <TicketForm
          defaults={{
            full_name: c ? `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() : undefined,
            email: c?.email ?? undefined,
          }}
        />
      </div>
    </div>
  )
}
