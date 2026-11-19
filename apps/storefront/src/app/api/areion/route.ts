import { containsCardData, isHealthQuestion, maskPII, SAFE_REPLIES } from "@arion/ai-guard"
import { createGoogle } from "@ai-sdk/google"
import { generateText } from "ai"
import { cookies, headers } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { routing, type Locale } from "@/i18n/routing"
import { AI_CONSENT_COOKIE, AREION, areionMode } from "@/lib/ai/config"
import { buildKnowledge, retrieve, type Chunk } from "@/lib/ai/knowledge"
import { listMyOrders } from "@/lib/medusa/customer"

/**
 * POST /api/areion — AI danışman (Rapor §6.7).
 * Akış: rıza kontrolü → hız sınırı → sağlık/kart koruması (model ÇAĞRILMAZ) → kişisel veri maskeleme
 * → RAG bağlamı → Gemini → emin değilse [[DEVRET]] → temsilciye devir önerisi.
 * Ayak İkizi verisi bu uç noktaya hiç gelmez ve modele gönderilmez.
 */
const Body = z.object({
  locale: z.enum(["tr", "en"]),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().trim().min(1).max(1000) }))
    .min(1)
    .max(30),
})

type Reply = {
  reply: string
  handoff: boolean
  sources: Array<{ title: string; url?: string }>
  mode: "live" | "mock" | "guard"
  guard?: "health" | "card"
}

// Basit IP başına hız sınırı (dev/demo). Faz 7'de kalıcı rate-limit.
const hits = new Map<string, number[]>()
function rateLimited(key: string): boolean {
  const now = Date.now()
  const list = (hits.get(key) ?? []).filter((t) => now - t < 60_000)
  list.push(now)
  hits.set(key, list)
  return list.length > 20
}

function systemPrompt(locale: Locale, context: Chunk[], orders: string | null): string {
  const ctx = context.map((c, i) => `[${i + 1}] ${c.text}`).join("\n")
  if (locale === "tr") {
    return `Sen ARION'un yapay zekâ ayakkabı danışmanı Areion'sun. Adını mitteki konuşabilen at Arion'dan alırsın.
KURALLAR:
1. Bir yapay zekâ olduğunu bil; insan gibi davranma, kişisel deneyim iddia etme.
2. Yalnızca BAĞLAM'daki bilgilere dayan. Bilmediğin bir şeyi uydurma. Emin değilsen ya da konu bağlamda yoksa yanıtının SONUNA tam olarak [[DEVRET]] yaz ve temsilciye bağlanmayı öner.
3. Sağlık tavsiyesi, teşhis ya da tedavi önerisi VERME; ayak rahatsızlığı adlandırma.
4. Kart bilgisi, şifre, kimlik numarası İSTEME.
5. "En iyi", "en rahat" gibi kanıtsız üstünlük iddiası kullanma. Teknik değerler DEMO'dur.
6. Numara önerisinde milimetre ve kalıp notlarını kullan; ön ayak genişse aynı numaranın W seçeneğini öner. Ayak ölçüsü sorma zorunluluğu yoktur; kullanıcı verirse kullan.
7. En fazla 5 kısa cümle. Sıcak, bilgili, küçümsemeyen bir ayakkabı ustası gibi konuş; "sen" diye hitap et. Türkçe yanıt ver. Markdown, yıldız (**) ya da madde işareti kullanma; düz metin yaz.
8. Ürün önerirken ürün adını bağlamdaki gibi aynen yaz.
9. Sipariş durumu yalnızca SİPARİŞLER bölümünde varsa söylenir; yoksa Yardım > Sipariş Takibi sayfasını öner.

BAĞLAM:
${ctx || "(ilgili bilgi bulunamadı)"}

SİPARİŞLER:
${orders ?? "(kullanıcı giriş yapmamış; sipariş bilgisi yok)"}`
  }
  return `You are Areion, ARION's AI shoe advisor, named after Arion, the speaking horse of myth.
RULES:
1. You are an AI; never pretend to be human or claim personal experience.
2. Use ONLY the CONTEXT. Never invent facts. If unsure or the topic isn't in the context, end your reply with exactly [[DEVRET]] and offer to connect a human agent.
3. Never give health advice, diagnoses or treatment suggestions; never name foot conditions.
4. Never ask for card details, passwords or ID numbers.
5. No unsupported superlatives ("the best", "the most comfortable"). Technical values are DEMO.
6. For sizing, use millimetres and last notes; for a wide forefoot suggest the W option in the same size.
7. At most 5 short sentences, warm and knowledgeable like a shoemaker, never condescending. Answer in English. No markdown, asterisks or bullet points; plain text only.
8. When recommending products, write the product name exactly as in the context.
9. Only state order status if it appears under ORDERS; otherwise suggest Help > Order Tracking.

CONTEXT:
${ctx || "(no relevant information found)"}

ORDERS:
${orders ?? "(user is not signed in; no order information)"}`
}

/**
 * Mock/yedek yanıt (model yoksa ya da sağlayıcı hata verirse): eşleşen ürünün kalıp bilgisi + en uygun SSS.
 * Yeni bilgi ÜRETMEZ; yalnızca bilgi tabanındaki metni aktarır.
 */
function mockReply(locale: Locale, context: Chunk[], faqTop: Chunk | undefined): Pick<Reply, "reply" | "handoff"> {
  const product = context.find((c) => c.source === "product")
  const parts: string[] = []
  if (product) {
    const lastNote = product.text.split(" · ").find((p) => /^(Kalıp|Last) /.test(p))
    const line = `${product.text.split(" · ")[0]}${lastNote ? ` — ${lastNote}` : ""}`
    parts.push(/[.!?]$/.test(line) ? line : `${line}.`)
  }
  const faq = faqTop ?? context.find((c) => c.source === "faq")
  if (faq) parts.push(faq.text.split(" — ")[1] ?? faq.text)
  if (!parts.length) {
    return {
      reply:
        locale === "tr"
          ? "Bu konuda elimde net bilgi yok. Seni bir temsilcimize bağlayabilirim."
          : "I don't have clear information on this. I can connect you to one of our team.",
      handoff: true,
    }
  }
  return { reply: parts.join("\n\n"), handoff: false }
}

export async function POST(req: NextRequest) {
  const jar = await cookies()
  if (jar.get(AI_CONSENT_COOKIE)?.value !== "1") {
    return NextResponse.json({ error: "consent_required" }, { status: 403 })
  }
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
  if (rateLimited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 })

  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 })
  const locale: Locale = routing.locales.includes(parsed.data.locale) ? parsed.data.locale : "tr"
  const history = parsed.data.messages.slice(-AREION.maxHistory)
  const last = history[history.length - 1]!
  if (last.role !== "user") return NextResponse.json({ error: "invalid" }, { status: 400 })

  // 1) Deterministik korumalar — model çağrılmaz
  if (isHealthQuestion(last.text)) {
    return NextResponse.json<Reply>({ reply: SAFE_REPLIES.health[locale], handoff: true, sources: [], mode: "guard", guard: "health" })
  }
  if (containsCardData(last.text)) {
    return NextResponse.json<Reply>({ reply: SAFE_REPLIES.card[locale], handoff: false, sources: [], mode: "guard", guard: "card" })
  }

  // 2) Bağlam (RAG) — kişisel veri içermez
  const knowledge = await buildKnowledge(locale)
  const question = history
    .filter((m) => m.role === "user")
    .slice(-2)
    .map((m) => m.text)
    .join(" ")
  const context = retrieve(knowledge, question)
  const faqTop = retrieve(
    knowledge.filter((c) => c.source === "faq"),
    question,
    1,
  )[0]
  const sources = context
    .filter((c) => c.source === "product" && c.url)
    .slice(0, 3)
    .map((c) => ({ title: c.text.split(" (")[0] ?? c.text, url: c.url }))

  // 3) Doğrulanmış oturumda sipariş özeti (yalnızca no, tarih, tutar — adres/e-posta YOK)
  let orders: string | null = null
  try {
    const list = await listMyOrders()
    if (list.length) {
      orders = list
        .slice(0, 3)
        .map((o) => `#${o.display_id} · ${new Date(o.created_at ?? "").toISOString().slice(0, 10)} · ${o.status ?? ""}`)
        .join("\n")
    }
  } catch {
    orders = null
  }

  if (areionMode() === "mock") {
    return NextResponse.json<Reply>({ ...mockReply(locale, context, faqTop), sources, mode: "mock" })
  }

  // 4) Kişisel veri maskeleme → Gemini (yurt dışı aktarım; ayrı açık rıza alındı)
  try {
    const google = createGoogle({ apiKey: process.env.GEMINI_API_KEY })
    const { text } = await generateText({
      model: google(AREION.model),
      system: systemPrompt(locale, context, orders),
      messages: history.map((m) => ({ role: m.role, content: maskPII(m.text, locale) })),
      temperature: AREION.temperature,
      maxOutputTokens: AREION.maxOutputTokens,
      providerOptions: { google: { thinkingConfig: { thinkingLevel: AREION.thinkingLevel } } },
    })
    const handoff = text.includes("[[DEVRET]]")
    const reply = text.replace("[[DEVRET]]", "").trim()
    return NextResponse.json<Reply>({ reply: reply || mockReply(locale, context, faqTop).reply, handoff, sources, mode: "live" })
  } catch {
    return NextResponse.json<Reply>({ ...mockReply(locale, context, faqTop), handoff: true, sources, mode: "mock" })
  }
}
