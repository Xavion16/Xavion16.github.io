/**
 * Areion güvenlik katmanı (Rapor §6.7, §7.1.6). LLM'e GİTMEDEN önce çalışır:
 *  - Kişisel veri maskeleme (yurt dışı aktarımı en aza indirmek için)
 *  - Sağlık sorusu tespiti → model çağrılmaz, sabit güvenli yönlendirme döner
 *  - Kart verisi tespiti → asla istenmez/işlenmez
 */
export type Locale = "tr" | "en"

const PATTERNS: Array<{ re: RegExp; label: Record<Locale, string> }> = [
  // IBAN önce (içinde uzun rakam dizisi var)
  {
    re: /\bTR\d{2}[ ]?(?:\d{4}[ ]?){5}\d{2}\b/gi,
    label: { tr: "[IBAN]", en: "[IBAN]" },
  },
  // Kart numarası: 13–19 rakam, boşluk/tire ile gruplanmış olabilir
  {
    re: /\b(?:\d[ -]?){12,18}\d\b/g,
    label: { tr: "[kart no]", en: "[card no]" },
  },
  {
    re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    label: { tr: "[e-posta]", en: "[email]" },
  },
  // TR cep telefonu: +90 / 0 / doğrudan 5xx
  {
    re: /(?:\+90[ -]?|0)?5\d{2}[ -]?\d{3}[ -]?\d{2}[ -]?\d{2}\b/g,
    label: { tr: "[telefon]", en: "[phone]" },
  },
  // TCKN: 11 hane, 0 ile başlamaz
  { re: /\b[1-9]\d{10}\b/g, label: { tr: "[kimlik no]", en: "[ID no]" } },
]

/** Metindeki kişisel verileri maskeleyerek döndürür. */
export function maskPII(text: string, locale: Locale = "tr"): string {
  return PATTERNS.reduce((acc, p) => acc.replace(p.re, p.label[locale]), text)
}

const CARD_RE =
  /\b(?:\d[ -]?){12,18}\d\b|\bcvv\b|\bcvc\b|son kullanma tarihi|güvenlik kodu|security code/i

export function containsCardData(text: string): boolean {
  return CARD_RE.test(text)
}

function norm(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
}

/** Sağlık/teşhis/tedavi içeren sorular (norm edilmiş anahtar kelimeler). */
const HEALTH_TERMS = [
  // TR
  "agri",
  "agriyor",
  "sizi",
  "halluks",
  "valgus",
  "bunyon",
  "duz taban",
  "topuk dikeni",
  "plantar",
  "fasiit",
  "diyabet",
  "seker hasta",
  "odem",
  "sislik",
  "sisiyor",
  "kirik",
  "burkul",
  "iltihap",
  "enfeksiyon",
  "mantar",
  "tirnak batmasi",
  "doktor",
  "hekim",
  "tedavi",
  "ilac",
  "ortopedi",
  "fizik tedavi",
  "romatizma",
  "gut hastal",
  "hamile",
  "nasir",
  "yara",
  // EN
  "pain",
  "hurt",
  "bunion",
  "hallux",
  "flat feet",
  "flat foot",
  "fasciitis",
  "heel spur",
  "diabet",
  "swelling",
  "swollen",
  "injur",
  "fracture",
  "sprain",
  "doctor",
  "treatment",
  "medication",
  "orthoped",
  "arthritis",
  "pregnan",
]

export function isHealthQuestion(text: string): boolean {
  const t = ` ${norm(text)} `
  return HEALTH_TERMS.some((term) => t.includes(term))
}

export const SAFE_REPLIES = {
  health: {
    tr: "Sağlıkla ilgili konularda tavsiye veremem ve teşhis koyamam; ben bir yapay zekâ asistanıyım. Ağrı, şişlik ya da ayak yapınla ilgili bir endişen varsa bir hekime ya da ortopedi uzmanına danışmanı öneririm. Ayakkabı uyumu, numara ve kalıp seçimi konusunda ise memnuniyetle yardım ederim. İstersen seni bir temsilcimize de bağlayabilirim.",
    en: "I can't give health advice or make a diagnosis; I'm an AI assistant. If you have pain, swelling or a concern about your feet, please consult a doctor or an orthopaedic specialist. I'm happy to help with fit, sizing and last choice. I can also connect you to one of our team if you like.",
  },
  card: {
    tr: "Lütfen kart bilgilerini sohbette paylaşma — ARION kart bilgisi istemez ve saklamaz. Ödeme yalnızca ödeme kuruluşunun güvenli sayfasında yapılır. Mesajındaki numaraları gizledim.",
    en: "Please don't share card details in chat — ARION never asks for or stores card data. Payment happens only on the payment institution's secure page. I've hidden the numbers in your message.",
  },
} as const
