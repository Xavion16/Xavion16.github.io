import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { buttonClass } from "@/components/ui/button"
import { routing } from "@/i18n/routing"
import { formatMoney } from "@/lib/format"
import { getCart, IYZICO_PROVIDER_ID } from "@/lib/medusa/cart"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { robots: { index: false, follow: false } }

/**
 * Ödeme sağlayıcı SİMÜLASYONU (yalnızca PAYMENT_ADAPTER=mock).
 * iyzico'nun 3D Secure sayfasının yerini tutar; marka taklidi yapmaz, kart bilgisi İSTEMEZ.
 */
export default async function PaymentSimulationPage({
  params,
  searchParams,
}: PageProps<"/[locale]/odeme/simulasyon">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("shop.simulation")
  const sp = await searchParams
  const token = typeof sp.token === "string" ? sp.token : ""

  const cart = await getCart()
  const session = cart?.payment_collection?.payment_sessions?.find(
    (s) => s.provider_id === IYZICO_PROVIDER_ID && s.data?.token === token,
  )
  if (!cart || !session || session.data?.mode !== "mock") notFound()

  const base = `/api/odeme/iyzico-donus?token=${encodeURIComponent(token)}`

  return (
    <div className="relative -mt-[76px] overflow-hidden pt-[76px]">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="orb orb-tide -top-20 right-0 size-[440px] opacity-55" />
        <div className="tech-grid absolute inset-0" />
      </div>
      <div className="relative mx-auto max-w-xl px-4 py-24 sm:px-8">
        <div className="glass rounded-[32px] p-8">
          <p className="eyebrow text-ember">{t("eyebrow")}</p>
          <h1 className="condensed mt-4 text-headline">{t("title")}</h1>
          <p className="mt-4 leading-relaxed text-smoke">{t("body")}</p>
          <dl className="mt-6 flex items-baseline justify-between rounded-2xl bg-white/5 p-4">
            <dt className="text-sm text-smoke">{t("amount")}</dt>
            <dd className="text-2xl font-bold">{formatMoney(Number(session.amount), locale)}</dd>
          </dl>
          <div className="mt-8 flex flex-col gap-3">
            {/* Düz link: tıklama üst düzey GET navigasyonudur, sepet çerezi taşınır */}
            <a href={`${base}&result=success`} className={buttonClass({ size: "lg" })}>
              {t("success")}
            </a>
            <a href={`${base}&result=failure`} className={buttonClass({ variant: "glass", size: "lg" })}>
              {t("failure")}
            </a>
          </div>
          <p className="mt-6 text-xs text-smoke">{t("liveNote")}</p>
        </div>
      </div>
    </div>
  )
}
