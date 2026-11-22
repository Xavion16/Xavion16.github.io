import type { FootProfile, SizeRow, WidthFitting } from "@arion/fit-engine"

/** Uyum kataloğu (backend /store/arion/fit-catalog) — ayak ölçüsü içermez. */
export type FitLast = { code: string; name: string; category: string; rows: SizeRow[] }
export type FitProduct = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  category: string | null
  last_code: string
  sizes: number[]
  widths: WidthFitting[]
}
export type FitCatalog = { lasts: FitLast[]; products: FitProduct[] }

export type FitTwinProfile = FootProfile & { method: "manual" | "paper" }
export type FitTwinSource = "guest" | "member"
