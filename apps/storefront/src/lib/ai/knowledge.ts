import "server-only"
import { CONSUMER, SELLER } from "@arion/legal-texts"
import { FAQ } from "@/content/faq"
import type { Locale } from "@/i18n/routing"
import { formatMoney } from "@/lib/format"
import { getProductDetails, listProducts, minPrice, productTitle } from "@/lib/medusa/catalog"

/**
 * Areion bilgi tabanı (RAG): SSS + ürün kataloğu + kalıp notları + temel politika.
 * Basit sözcük eşleştirmeli erişim (Türkçe normalize). Kişisel veri İÇERMEZ.
 */
export type Chunk = { id: string; source: "faq" | "product" | "policy"; text: string; url?: string }

function norm(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
}

const STOP = new Set(["ve", "ile", "bir", "bu", "mi", "mu", "mı", "ne", "nasil", "icin", "the", "and", "for", "is", "a", "to", "of", "my", "i"])

function tokens(s: string): string[] {
  return norm(s)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
}

let cache: { at: number; locale: Locale; chunks: Chunk[] } | null = null

export async function buildKnowledge(locale: Locale): Promise<Chunk[]> {
  if (cache && cache.locale === locale && Date.now() - cache.at < 5 * 60_000) return cache.chunks

  const chunks: Chunk[] = FAQ.map((f) => ({
    id: `faq:${f.id}`,
    source: "faq" as const,
    text: `${f.q[locale]} — ${f.a[locale]}`,
  }))

  chunks.push({
    id: "policy:core",
    source: "policy",
    text:
      locale === "tr"
        ? `Cayma hakkı ${CONSUMER.withdrawalDays} gün; iade kargo ücreti satıcıya ait; para iadesi ${CONSUMER.refundDays} gün içinde; teslim en geç ${CONSUMER.maxDeliveryDays} gün. İletişim: ${SELLER.email}. Fiyatlar KDV dahil. Site DEMO, gerçek satış yok.`
        : `Withdrawal right ${CONSUMER.withdrawalDays} days; return shipping paid by seller; refund within ${CONSUMER.refundDays} days; delivery within ${CONSUMER.maxDeliveryDays} days. Contact: ${SELLER.email}. Prices include VAT. DEMO site, no real sales.`,
  })

  try {
    const products = await listProducts({ limit: 50 })
    const details = await Promise.all(products.map((p) => getProductDetails(p.handle)))
    products.forEach((p, i) => {
      const d = details[i]
      const sizes = p.options?.find((o) => o.title === "Numara")?.values?.map((v) => v.value).join(", ")
      const widths = p.options?.find((o) => o.title === "Genişlik")?.values?.map((v) => v.value).join("/")
      const price = minPrice(p)
      const last = d?.last
      chunks.push({
        id: `product:${p.handle}`,
        source: "product",
        url: `/urun/${p.handle}`,
        text: [
          `${productTitle(p, locale)} (${p.categories?.[0]?.name ?? ""})`,
          p.subtitle ?? "",
          price !== null ? formatMoney(price, locale) : "",
          sizes ? `EU ${sizes}` : "",
          widths ? `${locale === "tr" ? "genişlik" : "width"} ${widths}` : "",
          d?.tech ? `${d.tech.construction}, ${d.tech.weight_grams_pair} g/${locale === "tr" ? "çift" : "pair"}, ${locale === "tr" ? "tamir edilebilirlik" : "repairability"} ${d.tech.repairability_score}/10` : "",
          last ? `${locale === "tr" ? "Kalıp" : "Last"} ${last.code} ${last.name}: ${last.notes ?? ""}` : "",
        ]
          .filter(Boolean)
          .join(" · "),
      })
    })
  } catch {
    // Katalog alınamazsa yalnızca SSS + politika ile devam
  }

  cache = { at: Date.now(), locale, chunks }
  return chunks
}

/** En alakalı parçalar (basit terim örtüşmesi + ürün adı eşleşmesine ağırlık). */
export function retrieve(chunks: Chunk[], question: string, k = 6): Chunk[] {
  const q = tokens(question)
  if (!q.length) return chunks.filter((c) => c.source === "policy")
  const scored = chunks.map((c) => {
    const t = tokens(c.text)
    const set = new Set(t)
    let score = 0
    for (const w of q) {
      if (set.has(w)) score += 2
      else if (t.some((x) => x.startsWith(w) || w.startsWith(x))) score += 1
    }
    return { c, score }
  })
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.c)
}
