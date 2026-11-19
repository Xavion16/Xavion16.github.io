import {
  buildDistanceSalesContract,
  buildPreContractInfo,
  cartToContractInput,
  type CartLike,
} from "@arion/legal-texts"
import { renderLegalPdf } from "@arion/legal-texts/pdf"
import { NextResponse, type NextRequest } from "next/server"
import { sdk } from "@/lib/medusa/client"
import { getAuthHeaders } from "@/lib/medusa/cookies"

/**
 * GET /api/belge/:order/(on-bilgilendirme|mesafeli-satis) — siparişin onaylanan sözleşmesini PDF olarak verir
 * (Rapor §7.2/4: "Hesabım > Siparişler altında kalıcı olarak sunulur").
 */
const DOCS = { "on-bilgilendirme": buildPreContractInfo, "mesafeli-satis": buildDistanceSalesContract } as const

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/belge/[order]/[doc]">) {
  const { order: orderId, doc } = await ctx.params
  if (!/^order_[A-Za-z0-9]+$/.test(orderId) || !(doc in DOCS)) {
    return NextResponse.json({ message: "Geçersiz belge" }, { status: 400 })
  }
  let order
  try {
    ;({ order } = await sdk.store.order.retrieve(
      orderId,
      {
        fields:
          "id,display_id,email,metadata,created_at,item_total,shipping_total,tax_total,total,*items,+items.product.metadata,*shipping_address,*shipping_methods",
      },
      await getAuthHeaders(),
    ))
  } catch {
    return NextResponse.json({ message: "Sipariş bulunamadı" }, { status: 404 })
  }
  const acc = (order.metadata as Record<string, unknown> | null)?.legal_acceptance as
    | { locale?: string; accepted_at?: string }
    | undefined
  const locale = acc?.locale === "en" ? "en" : "tr"
  const acceptedAt = new Date(acc?.accepted_at ?? order.created_at ?? Date.now())
  const orderRef = `#${order.display_id}`
  const input = { ...cartToContractInput(order as unknown as CartLike), orderRef, date: acceptedAt }
  const build = DOCS[doc as keyof typeof DOCS]
  const bytes = await renderLegalPdf(build(input, locale), { orderRef, acceptedAt, locale })

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${doc}-${order.display_id}.pdf"`,
      "cache-control": "private, no-store",
    },
  })
}
