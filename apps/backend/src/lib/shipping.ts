import { createHash } from "node:crypto"

/**
 * Kargo adapter'ı (Rapor §9.4). MVP: mock — takip numarası üretir, durumu sipariş zamanından simüle eder.
 * Demo/test için `order.metadata.demo_delivered_at` teslim tarihini ezer (yalnızca admin demo uç noktası yazar).
 */
export type TrackingStep = { code: "created" | "shipped" | "in_transit" | "delivered"; at: string; done: boolean }

export type Tracking = {
  carrier: string
  tracking_no: string
  status: TrackingStep["code"]
  steps: TrackingStep[]
  delivered_at: string | null
  /** Teslim edilmemişse beklenen teslim (cayma süresi hesabı için de kullanılır) */
  expected_delivery_at: string
}

export interface ShippingAdapter {
  readonly mode: "mock" | "live"
  track(order: { id: string; created_at: Date | string; metadata?: Record<string, unknown> | null }, now?: Date): Tracking
  createReturnLabel(input: { return_no: string }): { return_code: string; carrier: string }
}

const DAY = 24 * 60 * 60 * 1000

class MockShippingAdapter implements ShippingAdapter {
  readonly mode = "mock" as const

  track(order: { id: string; created_at: Date | string; metadata?: Record<string, unknown> | null }, now = new Date()): Tracking {
    const created = new Date(order.created_at)
    const override = order.metadata?.demo_delivered_at
    const deliveredAt =
      typeof override === "string" ? new Date(override) : new Date(created.getTime() + 3 * DAY)
    const shippedAt = new Date(Math.min(created.getTime() + 1 * DAY, deliveredAt.getTime()))
    const transitAt = new Date(Math.min(created.getTime() + 2 * DAY, deliveredAt.getTime()))
    const t = now.getTime()
    const steps: TrackingStep[] = [
      { code: "created", at: created.toISOString(), done: true },
      { code: "shipped", at: shippedAt.toISOString(), done: t >= shippedAt.getTime() },
      { code: "in_transit", at: transitAt.toISOString(), done: t >= transitAt.getTime() },
      { code: "delivered", at: deliveredAt.toISOString(), done: t >= deliveredAt.getTime() },
    ]
    const status = [...steps].reverse().find((s) => s.done)?.code ?? "created"
    return {
      carrier: "DEMO Kargo",
      tracking_no: `DMK${createHash("sha1").update(order.id).digest("hex").slice(0, 10).toUpperCase()}`,
      status,
      steps,
      delivered_at: status === "delivered" ? deliveredAt.toISOString() : null,
      expected_delivery_at: deliveredAt.toISOString(),
    }
  }

  createReturnLabel(input: { return_no: string }) {
    const code = createHash("sha1").update(input.return_no).digest("hex").slice(0, 8).toUpperCase()
    return { return_code: `ARN-IADE-${code}`, carrier: "DEMO Kargo (ücretsiz, satıcı öder)" }
  }
}

export function getShippingAdapter(): ShippingAdapter {
  return new MockShippingAdapter()
}
