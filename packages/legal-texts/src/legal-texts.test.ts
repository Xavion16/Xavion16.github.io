import { describe, expect, it } from "vitest"
import {
  buildDistanceSalesContract,
  buildPreContractInfo,
  CONSENT_PURPOSES,
  CONSENT_TEXTS,
  CONSUMER,
  contentHash,
  COOKIE_INVENTORY,
  getLegalDoc,
  LEGAL_SLUGS,
  type ContractInput,
  type LegalDoc,
} from "./index"
import { renderLegalPdf } from "./pdf"

const flat = (doc: LegalDoc) =>
  [
    doc.title,
    doc.intro ?? "",
    ...doc.sections.flatMap((s) => [
      s.heading ?? "",
      ...(s.paragraphs ?? []),
      ...(s.items ?? []),
      ...(s.table ? [...s.table.columns, ...s.table.rows.flat()] : []),
    ]),
  ].join("\n")

const order: ContractInput = {
  buyer: {
    name: "Deniz Yılmaz",
    email: "deniz@example.test",
    address: "Kadıköy/İstanbul",
  },
  items: [
    {
      title: "Kaçkar Su Geçirmez Bot",
      variant: "Kahverengi / 42 / W",
      quantity: 1,
      unitPrice: 4990,
      total: 4990,
    },
  ],
  subtotal: 4990,
  shipping: 89.9,
  shippingMethod: "Standart Kargo",
  tax: 846.65,
  total: 5079.9,
  orderRef: "#12",
  date: new Date("2026-11-19T10:00:00Z"),
}

describe("Ön Bilgilendirme Formu (Rapor §7.2 kabul kriterleri)", () => {
  const text = flat(buildPreContractInfo(order, "tr"))

  it("arabuluculuk (dava şartı) bilgisini içerir", () => {
    expect(text).toMatch(/arabulucuya başvurmak zorunludur/)
    expect(text).toMatch(/dava şartı arabuluculuk/)
  })

  it("iade kargo ücretinin satıcıya ait olduğunu yazar", () => {
    expect(text).toMatch(/İADE KARGO ÜCRETİ SATICIYA AİTTİR/)
  })

  it("tüketici hakem heyeti sınırını config'ten yazar", () => {
    expect(text).toContain(CONSUMER.arbitrationLimitTry.toLocaleString("tr-TR"))
  })

  it("14 gün cayma, 30 gün teslim ve vergiler dahil toplamı içerir", () => {
    expect(text).toMatch(/14 gün/)
    expect(text).toMatch(/en geç 30 gün/)
    expect(text).toMatch(/Vergiler dahil toplam/)
    expect(text).toMatch(/5\.079,90/)
  })

  it("satıcı kimliği ve alıcı bilgisi dinamik dolar", () => {
    expect(text).toContain("ARION Ayakkabı Teknolojileri")
    expect(text).toContain("Deniz Yılmaz")
    expect(text).toContain("Kaçkar Su Geçirmez Bot")
  })

  it("ölçüye özel ürün varsa cayma istisnasını AÇIKÇA yazar, yoksa olmadığını belirtir", () => {
    expect(text).toMatch(/ölçüye özel ürün YOKTUR/)
    const custom = flat(
      buildPreContractInfo(
        { ...order, items: [{ ...order.items![0]!, customMade: true }] },
        "tr",
      ),
    )
    expect(custom).toMatch(/cayma hakkı YOKTUR/)
  })

  it("İngilizce çeviri de aynı zorunlu bilgileri taşır", () => {
    const en = flat(buildPreContractInfo(order, "en"))
    expect(en).toMatch(/mediator is mandatory/)
    expect(en).toMatch(/RETURN SHIPPING IS PAID BY THE SELLER/)
  })
})

describe("Mesafeli Satış Sözleşmesi", () => {
  it("sipariş referansı ve tarihle dolar", () => {
    const text = flat(buildDistanceSalesContract(order, "tr"))
    expect(text).toContain("#12")
    expect(text).toMatch(/19 Kasım 2026/)
  })
})

describe("yasal metin kayıt defteri", () => {
  it("her slug için TR ve EN metin vardır", () => {
    for (const slug of LEGAL_SLUGS) {
      for (const locale of ["tr", "en"] as const) {
        const doc = getLegalDoc(slug, locale)
        expect(doc.title.length).toBeGreaterThan(3)
        expect(doc.version).toMatch(/^\d+\.\d+\.\d+/)
      }
    }
  })

  it("çerez politikası envanteri otomatik üretir (her çerez tabloda)", () => {
    const text = flat(getLegalDoc("cerez-politikasi", "tr"))
    for (const c of COOKIE_INVENTORY) expect(text).toContain(c.name)
  })

  it("açık rıza sayfası her amacı ayrı ve sürümlü listeler", () => {
    const doc = getLegalDoc("acik-riza", "tr")
    expect(doc.sections).toHaveLength(CONSENT_PURPOSES.length)
    for (const p of CONSENT_PURPOSES)
      expect(CONSENT_TEXTS[p].version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it("içerik özeti deterministiktir ve metin değişince değişir", () => {
    const a = getLegalDoc("kunye", "tr")
    expect(contentHash(a)).toBe(contentHash(getLegalDoc("kunye", "tr")))
    expect(contentHash({ ...a, intro: "değişti" })).not.toBe(contentHash(a))
  })

  it("Ayak İkizi rıza metni sağlık teşhisi yapılmayacağını ve AI'a aktarılmayacağını söyler", () => {
    expect(CONSENT_TEXTS.fit_twin.text.tr).toMatch(
      /yapay zekâ hizmetlerine aktarılmayacağını/,
    )
    expect(CONSENT_TEXTS.fit_twin.text.tr).toMatch(
      /sağlık teşhisi amacıyla kullanılmayacağını/,
    )
  })
})

describe("PDF", () => {
  it("Türkçe karakterli PDF üretir", async () => {
    const bytes = await renderLegalPdf(buildPreContractInfo(order, "tr"), {
      orderRef: "#12",
      locale: "tr",
    })
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-")
    expect(bytes.length).toBeGreaterThan(5000)
  }, 20_000)
})
