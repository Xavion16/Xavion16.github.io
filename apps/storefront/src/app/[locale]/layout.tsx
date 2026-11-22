import type { Metadata, Viewport } from "next"
import { Bodoni_Moda, Jost } from "next/font/google"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { COOKIE_CATEGORIES, type CookieCategory } from "@arion/legal-texts"
import { AreionChat } from "@/components/areion/areion-chat"
import { getCustomer } from "@/lib/medusa/customer"
import { CookieConsent } from "@/components/consent/cookie-consent"
import { FitTwinProvider } from "@/components/fit/fit-twin-provider"
import { getMemberFitTwin } from "@/lib/fit/catalog"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { routing } from "@/i18n/routing"
import { readCookieChoice } from "@/lib/consent"
import { SITE_URL } from "@/lib/site"
import "@/styles/globals.css"
// Cam görünümü kalıcıdır (DECISIONS #088): stiller <html data-skin="glass"> altında tanımlı
import "@/styles/skin-glass.css"

// Türkçe karakterler (ğ, ş, İ, ı, ç, ö, ü) latin-ext alt kümesindedir — zorunlu.
// Kadife Gece: Bodoni Moda (başlık, didone) + Jost (gövde). DECISIONS #070, #077
const bodoni = Bodoni_Moda({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-bodoni",
  display: "swap",
})

// Jost: Futura çizgisinde geometrik sans; Bodoni ile moda dergisi eşleşmesi (DECISIONS #077)
const jost = Jost({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jost",
  display: "swap",
})


export const viewport: Viewport = {
  themeColor: "#0a0908",
  colorScheme: "dark",
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "meta" })

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    applicationName: "ARION",
    openGraph: {
      type: "website",
      siteName: "ARION",
      locale: locale === "tr" ? "tr_TR" : "en_GB",
      alternateLocale: locale === "tr" ? ["en_GB"] : ["tr_TR"],
    },
    twitter: { card: "summary_large_image" },
    // Demo/ödev sitesi: arama motorlarına açılmaz
    robots: { index: false, follow: false },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const choice = await readCookieChoice()
  const customer = await getCustomer()
  const memberFitTwin = customer ? await getMemberFitTwin() : null
  const order: CookieCategory[] = ["necessary", "functional", "analytics", "marketing"]
  const categories = order.map((key) => ({
    key,
    name: COOKIE_CATEGORIES[key].name[locale],
    description: COOKIE_CATEGORIES[key].description[locale],
  }))

  return (
    <html
      lang={locale}
      data-skin="glass"
      className={`${bodoni.variable} ${jost.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <div className="scroll-line" aria-hidden="true" />
        <NextIntlClientProvider>
          <FitTwinProvider initialMember={memberFitTwin} isMember={Boolean(customer)}>
          <SiteHeader />
          <main id="icerik" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter />
          <AreionChat
            defaults={{
              full_name: customer ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() : undefined,
              email: customer?.email ?? undefined,
            }}
          />
          <CookieConsent initial={choice} categories={categories} />
          </FitTwinProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
