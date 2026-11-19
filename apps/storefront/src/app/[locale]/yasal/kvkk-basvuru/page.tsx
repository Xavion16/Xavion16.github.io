import { getLegalDoc } from "@arion/legal-texts"
import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { DataRequestForm } from "@/components/legal/data-request-form"
import { LegalDocView } from "@/components/legal/legal-doc-view"
import { routing } from "@/i18n/routing"
import { getCustomer } from "@/lib/medusa/customer"
import { localizedAlternates } from "@/lib/metadata"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: PageProps<"/[locale]/yasal/kvkk-basvuru">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  return {
    title: getLegalDoc("kvkk-basvuru", locale).title,
    alternates: localizedAlternates("/yasal/kvkk-basvuru", locale),
  }
}

/** KVKK m.11 ilgili kişi başvuru formu (Rapor §7.1.5). */
export default async function DataRequestPage({ params }: PageProps<"/[locale]/yasal/kvkk-basvuru">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("legal")
  const customer = await getCustomer()

  return (
    <div className="bg-chalk text-ink">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-8 md:py-20">
        <p className="eyebrow text-ember-ink">{t("eyebrow")}</p>
        <LegalDocView doc={getLegalDoc("kvkk-basvuru", locale)} className="mt-4 rounded-[28px] bg-white p-6 sm:p-10" />
        <section aria-labelledby="dsr-form" className="mt-6 rounded-[28px] bg-white p-6 sm:p-10">
          <h2 id="dsr-form" className="condensed text-3xl">{t("form.title")}</h2>
          <div className="mt-6">
            <DataRequestForm
              defaults={{
                full_name: customer ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() : undefined,
                email: customer?.email ?? undefined,
              }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
