export type Locale = "tr" | "en"

export type LegalSection = {
  heading?: string
  paragraphs?: string[]
  items?: string[]
  /** Basit tablo (çerez envanteri, veri envanteri özeti vb.) */
  table?: { columns: string[]; rows: string[][] }
}

export type LegalDoc = {
  key: string
  /** Metin değişirse artırılır (LegalTextVersion — Rapor §9.3) */
  version: string
  updatedAt: string
  title: string
  intro?: string
  sections: LegalSection[]
}

export type LegalSlug =
  | "kvkk-aydinlatma"
  | "gizlilik"
  | "cerez-politikasi"
  | "acik-riza"
  | "kvkk-basvuru"
  | "mesafeli-satis"
  | "on-bilgilendirme"
  | "iade-politikasi"
  | "uyelik-sozlesmesi"
  | "kullanim-kosullari"
  | "ticari-ileti"
  | "kunye"
  | "erisilebilirlik"
