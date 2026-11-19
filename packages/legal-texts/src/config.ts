/**
 * Yasal metinlerde kullanılan sabitler. Mevzuat değişirse TEK yerden güncellenir.
 * ⚠️ Satıcı bilgileri ÖRNEKTİR (ödev projesi). Ticari lansmandan önce avukat kontrolü gerekir.
 */

export const SELLER = {
  title: "ARION Ayakkabı Teknolojileri A.Ş. (örnek unvan)",
  brand: "ARION",
  mersis: "0000-0000-0000-0000 (örnek)",
  taxOffice: "Kadıköy Vergi Dairesi (örnek)",
  taxNumber: "0000000000 (örnek)",
  tradeRegistry: "İstanbul Ticaret Sicili Müdürlüğü, sicil no 000000 (örnek)",
  address: "Örnek Mah. Atölye Sk. No:1, 34000 Kadıköy/İstanbul (örnek)",
  phone: "+90 216 000 00 00 (örnek)",
  email: "destek@arion.example",
  kvkkEmail: "kvkk@arion.example",
  kep: "arion@hs00.kep.tr (örnek)",
  etbis: "ETBİS kayıt no: örnek",
  website: "arion.example",
} as const

export const CONSUMER = {
  /** Cayma süresi (gün) — 6502 s.K. m.48, Mesafeli Sözleşmeler Yönetmeliği m.9 */
  withdrawalDays: 14,
  /** Para iadesi süresi (gün) — cayma bildiriminin ulaşmasından itibaren */
  refundDays: 14,
  /** Azami teslim süresi (gün) */
  maxDeliveryDays: 30,
  /** 1 Ocak 2026'dan itibaren cayma halinde iade kargo ücreti tüketiciye yüklenemez */
  sellerPaysReturnShipping: true,
  /** Tüketici hakem heyeti parasal sınırı — her yıl güncellenir (Rapor §7.2) */
  arbitrationLimitTry: 186_000,
  arbitrationLimitYear: 2026,
  complaintPortal: "https://tuketici.ticaret.gov.tr",
} as const

export const DISCOUNT_REFERENCE_DAYS = 10

/** KVKK m.11 başvurularına yanıt süresi (gün) */
export const DSR_RESPONSE_DAYS = 30
