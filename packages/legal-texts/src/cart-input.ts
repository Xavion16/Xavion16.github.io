import {
  buildDistanceSalesContract,
  buildPreContractInfo,
  type ContractInput,
} from "./contracts"
import { contentHash } from "./hash"
import type { Locale } from "./types"

/**
 * Sepetten sözleşme girdisi üretir. Storefront (ekranda gösterilen metin) ve backend (onay kaydı)
 * AYNI fonksiyonu kullanır; böylece içerik özeti (hash) birebir tutar.
 * Ürün adları bağlayıcı metin dili olan Türkçe tutulur.
 */
export type CartLike = {
  email?: string | null
  items?: Array<{
    product_title?: string | null
    title?: string | null
    variant_title?: string | null
    quantity: number | string
    unit_price: number | string
    total?: number | string | null
    product?: { metadata?: Record<string, unknown> | null } | null
  } | null> | null
  item_total?: number | string | null
  shipping_total?: number | string | null
  tax_total?: number | string | null
  total?: number | string | null
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    address_1?: string | null
    province?: string | null
    city?: string | null
    phone?: string | null
  } | null
  shipping_methods?: Array<{ name?: string | null } | null> | null
}

const n = (v: unknown) => Math.round(Number(v ?? 0) * 100) / 100

export function cartToContractInput(cart: CartLike): ContractInput {
  const a = cart.shipping_address
  return {
    buyer:
      cart.email && a
        ? {
            name: `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim(),
            email: cart.email,
            address: [a.address_1, `${a.province ?? ""}/${a.city ?? ""}`]
              .filter(Boolean)
              .join(", "),
            phone: a.phone ?? null,
          }
        : undefined,
    items: (cart.items ?? []).flatMap((i) =>
      i
        ? [
            {
              title: i.product_title ?? i.title ?? "",
              variant: i.variant_title ?? "",
              quantity: Number(i.quantity),
              unitPrice: n(i.unit_price),
              total: n(i.total ?? Number(i.unit_price) * Number(i.quantity)),
              madeToOrder: i.product?.metadata?.made_to_order === true,
              leadDays: i.product?.metadata?.made_to_order === true ? 21 : null,
              customMade: i.product?.metadata?.custom_made === true,
            },
          ]
        : [],
    ),
    subtotal: n(cart.item_total),
    shipping: n(cart.shipping_total),
    shippingMethod: cart.shipping_methods?.[0]?.name ?? undefined,
    tax: n(cart.tax_total),
    total: n(cart.total),
  }
}

export type AcceptanceDocs = {
  pre_contract: { key: "on-bilgilendirme"; version: string; hash: string }
  distance_sales: { key: "mesafeli-satis"; version: string; hash: string }
}

/** Onaylanan iki metnin sürüm + hash bilgisi (tarih/sipariş no hariç; onay ANINDAKİ metin). */
export function acceptanceDocs(cart: CartLike, locale: Locale): AcceptanceDocs {
  const input = cartToContractInput(cart)
  const pre = buildPreContractInfo(input, locale)
  const dist = buildDistanceSalesContract(input, locale)
  return {
    pre_contract: {
      key: "on-bilgilendirme",
      version: pre.version,
      hash: contentHash(pre),
    },
    distance_sales: {
      key: "mesafeli-satis",
      version: dist.version,
      hash: contentHash(dist),
    },
  }
}
