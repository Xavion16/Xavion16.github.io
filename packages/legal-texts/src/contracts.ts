import { CONSUMER, SELLER } from "./config"
import type { LegalDoc, Locale } from "./types"

/**
 * Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi — sipariş özetiyle DİNAMİK doldurulur
 * (6502 s.K. m.48, Mesafeli Sözleşmeler Yönetmeliği m.5–6). Şablon metni değişirse sürüm artırılır.
 * Bağlayıcı metin Türkçedir; İngilizce sürüm bilgilendirme amaçlı çeviridir.
 */
export const PRE_CONTRACT_VERSION = "1.0.1"
export const DISTANCE_SALES_VERSION = "1.0.1"

export type ContractItem = {
  title: string
  variant: string
  quantity: number
  unitPrice: number
  total: number
  /** Atölyede üretilen standart model (cayma hakkı VARDIR) */
  madeToOrder?: boolean
  leadDays?: number | null
  /** Ölçüye özel üretim (cayma hakkı istisnası) — Faz 5'te Ayak İkizi ile */
  customMade?: boolean
}

export type ContractInput = {
  buyer?: {
    name: string
    email: string
    address: string
    phone?: string | null
  }
  items?: ContractItem[]
  subtotal?: number
  shipping?: number
  shippingMethod?: string
  tax?: number
  total?: number
  orderRef?: string
  date?: Date
}

const money = (v: number | undefined, locale: Locale) =>
  v === undefined
    ? locale === "tr"
      ? "(sipariş sırasında doldurulur)"
      : "(filled in at checkout)"
    : new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-GB", {
        style: "currency",
        currency: "TRY",
      }).format(v)

function itemsTable(input: ContractInput, locale: Locale) {
  const tr = locale === "tr"
  const rows = (input.items ?? []).map((i) => [
    i.title,
    i.variant,
    String(i.quantity),
    money(i.unitPrice, locale),
    money(i.total, locale),
  ])
  return {
    columns: tr
      ? [
          "Ürün",
          "Özellik (renk/numara/genişlik)",
          "Adet",
          "Birim fiyat (KDV dahil)",
          "Tutar",
        ]
      : [
          "Product",
          "Options (colour/size/width)",
          "Qty",
          "Unit price (VAT incl.)",
          "Amount",
        ],
    rows: rows.length
      ? rows
      : [[tr ? "(sepet içeriği)" : "(cart contents)", "", "", "", ""]],
  }
}

function deliveryText(input: ContractInput, locale: Locale): string {
  const made = (input.items ?? []).filter((i) => i.madeToOrder && i.leadDays)
  const maxLead = Math.max(0, ...made.map((i) => i.leadDays ?? 0))
  if (locale === "tr") {
    return made.length
      ? `Atölyede üretilen ürünler için tahmini üretim süresi ${maxLead} gündür; teslim, sipariş tarihinden itibaren en geç ${CONSUMER.maxDeliveryDays} gün içinde yapılır.`
      : `Stoktaki ürünler 1–2 iş günü içinde kargoya verilir; teslim, sipariş tarihinden itibaren en geç ${CONSUMER.maxDeliveryDays} gün içinde yapılır.`
  }
  return made.length
    ? `Atelier-made items have an estimated production time of ${maxLead} days; delivery takes place within ${CONSUMER.maxDeliveryDays} days of the order at the latest.`
    : `In-stock items ship within 1–2 business days; delivery takes place within ${CONSUMER.maxDeliveryDays} days of the order at the latest.`
}

function complaintParagraphs(locale: Locale): string[] {
  const limit = CONSUMER.arbitrationLimitTry.toLocaleString(
    locale === "tr" ? "tr-TR" : "en-GB",
  )
  return locale === "tr"
    ? [
        `Şikâyet ve itirazlarını ${SELLER.email} adresine iletebilirsin.`,
        `${CONSUMER.arbitrationLimitYear} yılı için ${limit} TL'ye kadar olan uyuşmazlıklarda yerleşim yerindeki veya tüketici işleminin yapıldığı yerdeki Tüketici Hakem Heyeti'ne başvurabilirsin (Tüketici Bilgi Sistemi / e-Devlet: ${CONSUMER.complaintPortal}).`,
        "Bu parasal sınırı aşan uyuşmazlıklarda Tüketici Mahkemesi'nde dava açmadan önce arabulucuya başvurmak zorunludur (dava şartı arabuluculuk, 6502 s.K. m.73/A).",
      ]
    : [
        `You can send complaints and objections to ${SELLER.email}.`,
        `For disputes up to TRY ${limit} (${CONSUMER.arbitrationLimitYear}), you can apply to the Consumer Arbitration Committee where you live or where the transaction took place (Consumer Information System / e-Devlet: ${CONSUMER.complaintPortal}).`,
        "For disputes above this limit, applying to a mediator is mandatory before filing a lawsuit at the Consumer Court (mandatory mediation, Law No. 6502 Art. 73/A).",
      ]
}

function withdrawalItems(input: ContractInput, locale: Locale): string[] {
  const custom = (input.items ?? []).some((i) => i.customMade)
  const tr = locale === "tr"
  const base = tr
    ? [
        `Ürünü teslim aldığın tarihten itibaren ${CONSUMER.withdrawalDays} gün içinde hiçbir gerekçe göstermeden ve cezai şart ödemeden cayma hakkın vardır.`,
        "Cayma bildirimini Hesabım > Siparişlerim üzerinden, iade sihirbazıyla ya da yazılı olarak (e-posta/KEP) iletebilirsin.",
        "Cayma halinde İADE KARGO ÜCRETİ SATICIYA AİTTİR; tüketiciye yüklenmez. Sistem ücretsiz iade kargo kodu üretir.",
        `Ödediğin toplam bedel, cayma bildiriminin satıcıya ulaşmasından itibaren en geç ${CONSUMER.refundDays} gün içinde, ödemede kullandığın yöntemle iade edilir.`,
        "Ürünü cayma bildiriminden itibaren 10 gün içinde geri göndermelisin. Olağan kullanım dışındaki kullanım nedeniyle oluşan değer kaybından tüketici sorumludur.",
      ]
    : [
        `You have the right to withdraw within ${CONSUMER.withdrawalDays} days of receiving the goods, without giving any reason and without penalty.`,
        "You can give notice of withdrawal via Account > Orders, the returns wizard, or in writing (email/KEP).",
        "If you withdraw, RETURN SHIPPING IS PAID BY THE SELLER and is not charged to you. The system generates a free return shipping code.",
        `The total amount you paid is refunded within ${CONSUMER.refundDays} days of your notice reaching the seller, using your original payment method.`,
        "You must send the goods back within 10 days of your notice. You are liable for any loss of value caused by use beyond normal handling.",
      ]
  const exception = tr
    ? custom
      ? "DİKKAT: Sepetindeki ölçüye özel üretilen ürün(ler) için Mesafeli Sözleşmeler Yönetmeliği m.15/1-ç uyarınca cayma hakkı YOKTUR. Gönüllü Uyum Garantisi kapsamında bir kez ücretsiz düzeltme ya da yeniden üretim yapılır."
      : "Kişiye özel (ölçüye göre) üretilen ürünlerde cayma hakkı istisnası vardır (Yönetmelik m.15/1-ç). Bu siparişte ölçüye özel ürün YOKTUR; atölyede üretilen standart numaralı modeller dahil tüm ürünlerde cayma hakkın geçerlidir."
    : custom
      ? "NOTE: For the made-to-measure item(s) in your cart, the right of withdrawal does NOT apply (Regulation Art. 15/1-ç). Under our voluntary Fit Guarantee, one free adjustment or remake is provided."
      : "Goods made to the consumer's personal specifications are exempt from the right of withdrawal (Regulation Art. 15/1-ç). This order contains no made-to-measure items; your right of withdrawal applies to all items, including atelier-made standard sizes."
  return [...base, exception]
}

function sellerTable(locale: Locale) {
  const tr = locale === "tr"
  return {
    columns: tr ? ["Satıcı", "Bilgi"] : ["Seller", "Details"],
    rows: [
      [tr ? "Unvan" : "Name", SELLER.title],
      [tr ? "Adres" : "Address", SELLER.address],
      [tr ? "Telefon" : "Phone", SELLER.phone],
      [tr ? "E-posta" : "Email", SELLER.email],
      ["KEP", SELLER.kep],
      ["MERSİS", SELLER.mersis],
    ],
  }
}

function totalsTable(input: ContractInput, locale: Locale) {
  const tr = locale === "tr"
  return {
    columns: tr ? ["Kalem", "Tutar"] : ["Line", "Amount"],
    rows: [
      [
        tr ? "Ara toplam (KDV dahil)" : "Subtotal (VAT incl.)",
        money(input.subtotal, locale),
      ],
      [
        `${tr ? "Kargo" : "Shipping"}${input.shippingMethod ? ` (${input.shippingMethod})` : ""}`,
        money(input.shipping, locale),
      ],
      [
        tr ? "Vergiler dahil toplam" : "Total incl. taxes",
        money(input.total, locale),
      ],
      [tr ? "İçerdiği KDV" : "Of which VAT", money(input.tax, locale)],
    ],
  }
}

function buyerParagraph(input: ContractInput, locale: Locale): string {
  const b = input.buyer
  if (!b)
    return locale === "tr"
      ? "Alıcı bilgileri sipariş sırasında doldurulur."
      : "Buyer details are filled in at checkout."
  return `${b.name} · ${b.email}${b.phone ? ` · ${b.phone}` : ""} · ${b.address}`
}

export function buildPreContractInfo(
  input: ContractInput,
  locale: Locale,
): LegalDoc {
  const tr = locale === "tr"
  return {
    key: "on-bilgilendirme",
    version: PRE_CONTRACT_VERSION,
    updatedAt: "2026-11-19",
    title: tr ? "Ön Bilgilendirme Formu" : "Pre-Contract Information Form",
    intro: tr
      ? "Mesafeli sözleşme kurulmadan önce, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca aşağıdaki konularda bilgilendiriliyorsun. Bu site bir DEMO'dur; gerçek satış yapılmaz."
      : "Before the distance contract is concluded, you are informed of the following under Consumer Protection Law No. 6502 and the Distance Contracts Regulation. This site is a DEMO; no real sale takes place.",
    sections: [
      {
        heading: tr ? "1. Satıcı bilgileri" : "1. Seller",
        table: sellerTable(locale),
      },
      {
        heading: tr ? "2. Alıcı" : "2. Buyer",
        paragraphs: [buyerParagraph(input, locale)],
      },
      {
        heading: tr
          ? "3. Malın temel nitelikleri ve fiyatı"
          : "3. Main characteristics and price",
        table: itemsTable(input, locale),
      },
      {
        heading: tr
          ? "4. Vergiler dahil toplam fiyat ve kargo ücreti"
          : "4. Total price incl. taxes and shipping",
        table: totalsTable(input, locale),
      },
      {
        heading: tr ? "5. Ödeme ve teslimat" : "5. Payment and delivery",
        paragraphs: [
          tr
            ? "Ödeme, ödeme kuruluşunun (iyzico) güvenli ödeme sayfasında kredi/banka kartıyla yapılır; kart bilgisi satıcıya iletilmez."
            : "Payment is made by card on the payment institution's (iyzico) secure page; card details are not shared with the seller.",
          deliveryText(input, locale),
        ],
      },
      {
        heading: tr ? "6. Cayma hakkı" : "6. Right of withdrawal",
        items: withdrawalItems(input, locale),
      },
      {
        heading: tr
          ? "7. Şikâyet ve itiraz yolları"
          : "7. Complaints and dispute resolution",
        paragraphs: complaintParagraphs(locale),
      },
    ],
  }
}

export function buildDistanceSalesContract(
  input: ContractInput,
  locale: Locale,
): LegalDoc {
  const tr = locale === "tr"
  const date = input.date
    ? new Intl.DateTimeFormat(tr ? "tr-TR" : "en-GB", {
        dateStyle: "long",
      }).format(input.date)
    : tr
      ? "(onay tarihi)"
      : "(date of acceptance)"
  return {
    key: "mesafeli-satis",
    version: DISTANCE_SALES_VERSION,
    updatedAt: "2026-11-19",
    title: tr ? "Mesafeli Satış Sözleşmesi" : "Distance Sales Agreement",
    intro: tr
      ? `İşbu sözleşme ${date} tarihinde elektronik ortamda kurulmuştur${input.orderRef ? ` (sipariş: ${input.orderRef})` : ""}. Bu site bir DEMO'dur.`
      : `This agreement was concluded electronically on ${date}${input.orderRef ? ` (order: ${input.orderRef})` : ""}. This site is a DEMO.`,
    sections: [
      {
        heading: tr ? "Madde 1 — Taraflar" : "Article 1 — Parties",
        table: sellerTable(locale),
        paragraphs: [buyerParagraph(input, locale)],
      },
      {
        heading: tr ? "Madde 2 — Konu" : "Article 2 — Subject",
        paragraphs: [
          tr
            ? "Sözleşmenin konusu, alıcının satıcıya ait internet sitesinden elektronik ortamda sipariş verdiği aşağıda nitelikleri ve satış fiyatı belirtilen malın satışı ve teslimidir."
            : "The subject of this agreement is the sale and delivery of the goods described below, ordered electronically by the buyer from the seller's website.",
        ],
        table: itemsTable(input, locale),
      },
      {
        heading: tr ? "Madde 3 — Bedel" : "Article 3 — Price",
        table: totalsTable(input, locale),
      },
      {
        heading: tr ? "Madde 4 — Teslimat" : "Article 4 — Delivery",
        paragraphs: [
          deliveryText(input, locale),
          tr
            ? "Mal, alıcının belirttiği teslimat adresine kargo ile teslim edilir. Teslimata kadar oluşan risk satıcıya aittir."
            : "Goods are delivered by courier to the address given by the buyer. Risk remains with the seller until delivery.",
        ],
      },
      {
        heading: tr
          ? "Madde 5 — Cayma hakkı"
          : "Article 5 — Right of withdrawal",
        items: withdrawalItems(input, locale),
      },
      {
        heading: tr ? "Madde 6 — Ayıplı mal" : "Article 6 — Defective goods",
        paragraphs: [
          tr
            ? "Malın ayıplı olması halinde alıcı 6502 s.K. m.11'deki seçimlik haklarını kullanabilir: sözleşmeden dönme, bedelden indirim, ücretsiz onarım veya ayıpsız misli ile değişim."
            : "If the goods are defective, the buyer may exercise the elective rights under Law No. 6502 Art. 11: termination, price reduction, free repair or replacement with a non-defective item.",
        ],
      },
      {
        heading: tr ? "Madde 7 — Uyuşmazlıklar" : "Article 7 — Disputes",
        paragraphs: complaintParagraphs(locale),
      },
      {
        heading: tr ? "Madde 8 — Yürürlük" : "Article 8 — Entry into force",
        paragraphs: [
          tr
            ? "Alıcı, ön bilgilendirme formunu okuyup bilgi sahibi olduğunu ve bu sözleşmeyi elektronik ortamda onayladığını kabul eder. Sözleşmenin ve ön bilgilendirme formunun bir örneği alıcıya e-postayla ve Hesabım sayfasında kalıcı olarak sunulur."
            : "The buyer confirms having read the pre-contract information form and accepts this agreement electronically. A copy of the agreement and the pre-contract information is provided by email and permanently in the account area.",
        ],
      },
    ],
  }
}
