import type { Locale } from "@/i18n/routing"

/** Medusa v2 tutarları ana birimdedir (3490 = 3.490 TL). Fiyatlar KDV dahildir. */
export function formatMoney(amount: number, locale: Locale, currency = "try"): string {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
