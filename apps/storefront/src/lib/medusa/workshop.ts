import "server-only"
import { cache } from "react"
import { sdk } from "./client"
import type { TestMetric } from "./catalog"

export type PassportData = {
  passport: {
    code: string
    produced_at: string
    batch: string | null
    variant_options: { color?: string | null; size?: string | null; width?: string | null }
    dpp: { recycled_share_pct?: number; carbon_kg_demo?: number; repairable?: boolean } | null
    is_demo: boolean
  }
  product: { title: string; handle: string; thumbnail: string | null; category: { handle: string; name: string } | null } | null
  tech: {
    construction: string
    materials: { items: Array<{ part: string; material: string; origin: string }> }
    weight_grams_pair: number
    repairability_score: number
    test_metrics: { metrics: TestMetric[] }
  } | null
  last: { code: string; name: string; toe_shape: string } | null
  craftsman: { name: string; specialty: string; bio: { tr: string; en: string }; since_year: number; is_demo: boolean } | null
  repairs: Array<{ type: "resole" | "heel" | "stitch" | "clean" | "recraft"; completed_at: string; public_note: string | null }>
}

export const getPassport = cache(async (code: string): Promise<PassportData | null> => {
  if (!/^ARN-\d{4}-\d{6}$/i.test(code)) return null
  try {
    return await sdk.client.fetch<PassportData>(`/store/arion/passports/${encodeURIComponent(code.toUpperCase())}`, {
      method: "GET",
    })
  } catch {
    return null
  }
})

export type Transparency = {
  generated_at: string
  is_demo: boolean
  returns: { orders: number; count: number; rate_pct: number; reasons: Record<string, number> }
  repairs: { completed: number }
  recraft: { completed: number }
  lifetime: { avg_months: number | null; sample: number }
  support: { avg_first_response_hours: number | null; sample: number }
}

export async function getTransparency(): Promise<Transparency | null> {
  try {
    return await sdk.client.fetch<Transparency>("/store/arion/transparency", { method: "GET", cache: "no-store" })
  } catch {
    return null
  }
}

export type AtelierData = {
  artisans: Array<{ name: string; specialty: string; since_year: number; bio: { tr: string; en: string }; is_demo: boolean }>
  recent: Array<{ code: string; product: string; produced_at: string; craftsman: string | null }>
}

export async function getAtelier(): Promise<AtelierData> {
  try {
    return await sdk.client.fetch<AtelierData>("/store/arion/atelier", { method: "GET" })
  } catch {
    return { artisans: [], recent: [] }
  }
}

export type AtelierStep = {
  code: "cutting" | "closing" | "lasting" | "sole" | "finishing" | "qc" | "shipping"
  at: string
  done: boolean
  current: boolean
  craftsman: string | null
}
export type OrderAtelier = {
  items: Array<{ product_id: string; title: string; due_at: string; lead_time_days: number; steps: AtelierStep[] }>
}

export async function getOrderAtelier(orderId: string): Promise<OrderAtelier> {
  try {
    return await sdk.client.fetch<OrderAtelier>(`/store/arion/orders/${encodeURIComponent(orderId)}/atelier`, {
      method: "GET",
      cache: "no-store",
    })
  } catch {
    return { items: [] }
  }
}
