import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { RepairForm } from "@/components/workshop/repair-form"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { getCustomer } from "@/lib/medusa/customer"
import { localizedAlternates } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/omur-plani">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "lifetime" })
  return { title: t("metaTitle"), description: t("metaDescription"), alternates: localizedAlternates("/omur-plani", locale) }
}

/** Ömür Planı (Rapor §6.6): bakım hatırlatıcıları, tamir talebi (ücret tahmini + gönderim kodu), Geri Al – Yeniden Doğ. */
export default async function LifetimePage({ params, searchParams }: PageProps<"/[locale]/omur-plani">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("lifetime")
  const sp = await searchParams
  const pasaport = typeof sp.pasaport === "string" && /^ARN-\d{4}-\d{6}$/i.test(sp.pasaport) ? sp.pasaport.toUpperCase() : undefined
  const customer = await getCustomer()

  return (
    <div className="relative -mt-[76px] overflow-hidden pt-[76px]">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="orb orb-ember -top-24 right-0 size-[460px] opacity-40" />
      </div>
      <div className="relative mx-auto max-w-[1440px] px-4 pt-16 pb-24 sm:px-8 md:pt-24">
        <p className="eyebrow text-ember">{t("eyebrow")}</p>
        <h1 className="condensed mt-4 max-w-4xl text-display">{t("title")}</h1>
        <p className="mt-6 max-w-2xl text-lg text-smoke">{t("lead")}</p>

        <div className="mt-12 grid gap-8 xl:grid-cols-[1fr_360px]">
          <section aria-labelledby="tamir" className="glass rounded-[4px] p-6 sm:p-10">
            <h2 id="tamir" className="condensed text-4xl text-white">
              {t("form.title")}
            </h2>
            <div className="mt-6">
              <RepairForm
                initialPassport={pasaport}
                defaults={{
                  name: customer ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() : undefined,
                  email: customer?.email ?? undefined,
                }}
              />
            </div>
          </section>
          <aside aria-labelledby="hatirlatici" className="glass h-fit rounded-[4px] p-6">
            <h2 id="hatirlatici" className="text-lg font-bold text-white">
              {t("reminders.title")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-smoke">{t("reminders.body")}</p>
            <Link href="/hesabim/izinlerim" className="mt-4 inline-block text-sm font-semibold text-ember hover:text-white">
              {t("reminders.manage")}
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
