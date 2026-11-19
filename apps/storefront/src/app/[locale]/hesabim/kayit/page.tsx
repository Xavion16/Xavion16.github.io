import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound, redirect } from "next/navigation"
import { RegisterForm } from "@/components/shop/auth-forms"
import { getPathname, Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { getCustomer } from "@/lib/medusa/customer"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: PageProps<"/[locale]/hesabim/kayit">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "shop.account" })
  return { title: t("register"), robots: { index: false } }
}

export default async function RegisterPage({ params }: PageProps<"/[locale]/hesabim/kayit">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  if (await getCustomer()) redirect(getPathname({ href: "/hesabim", locale }))
  const t = await getTranslations("shop.account")
  const tc = await getTranslations("shop.checkout")

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-8">
      <h1 className="condensed text-display">{t("register")}</h1>
      <div className="glass mt-8 rounded-[28px] p-6 sm:p-8">
        <RegisterForm />
        {/* Aydınlatma bilgilendirmedir, onay kutusu ile ALINMAZ (Rapor §7.1.2) */}
        <p className="mt-5 text-xs leading-relaxed text-smoke">
          {t("privacyNote")}{" "}
          <Link
            href={{ pathname: "/yasal/[slug]", params: { slug: "kvkk-aydinlatma" } }}
            className="underline underline-offset-4 hover:text-white"
          >
            {tc("privacyLink")}
          </Link>
        </p>
        <p className="mt-2 text-xs text-smoke">{t("consentPhase3")}</p>
      </div>
      <p className="mt-6 text-sm text-smoke">
        {t("haveAccount")}{" "}
        <Link href="/hesabim/giris" className="font-semibold text-white underline underline-offset-4">
          {t("login")}
        </Link>
      </p>
    </div>
  )
}
