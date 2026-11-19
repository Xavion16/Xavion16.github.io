import { CONSENT_TEXTS } from "@arion/legal-texts"
import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound, redirect } from "next/navigation"
import { AccountNav } from "@/components/account/account-nav"
import { PermissionsForm, type PermissionItem } from "@/components/account/permissions-form"
import { getPathname } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { getCustomer } from "@/lib/medusa/customer"
import { getMyConsents } from "@/lib/medusa/kvkk"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: PageProps<"/[locale]/hesabim/izinlerim">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "shop.account.permissions" })
  return { title: t("title"), robots: { index: false } }
}

const PURPOSES = ["marketing_email", "marketing_sms", "fit_twin", "ai_chat_transfer"] as const

export default async function PermissionsPage({ params }: PageProps<"/[locale]/hesabim/izinlerim">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  if (!(await getCustomer())) redirect(getPathname({ href: "/hesabim/giris", locale }))
  const t = await getTranslations("shop.account.permissions")
  const current = await getMyConsents()

  const items: PermissionItem[] = PURPOSES.map((p) => ({
    purpose: p,
    label: CONSENT_TEXTS[p].label[locale],
    text: CONSENT_TEXTS[p].text[locale],
    version: CONSENT_TEXTS[p].version,
    granted: current[p]?.granted ?? false,
    at: current[p]?.at ?? null,
  }))

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-8">
      <AccountNav current="/hesabim/izinlerim" />
      <h1 className="condensed mt-8 text-display">{t("title")}</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-smoke">{t("intro")}</p>
      <div className="mt-8">
        <PermissionsForm items={items} />
      </div>
    </div>
  )
}
