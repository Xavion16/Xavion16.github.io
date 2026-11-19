import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound, redirect } from "next/navigation"
import { LoginForm } from "@/components/shop/auth-forms"
import { getPathname, Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { getCustomer } from "@/lib/medusa/customer"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: PageProps<"/[locale]/hesabim/giris">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "shop.account" })
  return { title: t("login"), robots: { index: false } }
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/hesabim/giris">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  if (await getCustomer()) redirect(getPathname({ href: "/hesabim", locale }))
  const t = await getTranslations("shop.account")
  const sp = await searchParams
  const next = typeof sp.next === "string" ? sp.next : undefined

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-8">
      <h1 className="condensed text-display">{t("login")}</h1>
      <div className="glass mt-8 rounded-[28px] p-6 sm:p-8">
        <LoginForm next={next} />
      </div>
      <p className="mt-6 text-sm text-smoke">
        {t("noAccount")}{" "}
        <Link href="/hesabim/kayit" className="font-semibold text-white underline underline-offset-4">
          {t("register")}
        </Link>
      </p>
    </div>
  )
}
