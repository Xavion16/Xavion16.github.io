import type { Metadata, Viewport } from "next"
import { Archivo, JetBrains_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { routing } from "@/i18n/routing"
import { SITE_URL } from "@/lib/site"
import "@/styles/globals.css"

// Türkçe karakterler (ğ, ş, İ, ı, ç, ö, ü) latin-ext alt kümesindedir — zorunlu.
// Archivo: değişken genişlik (wdth 62–125) ekseniyle hem sıkışık başlık hem gövde.
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
  display: "swap",
})

export const viewport: Viewport = {
  themeColor: "#09090b",
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

  return (
    <html
      lang={locale}
      className={`${archivo.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <div className="scroll-line" aria-hidden="true" />
        <NextIntlClientProvider>
          <SiteHeader />
          <main id="icerik" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
