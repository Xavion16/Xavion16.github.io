import { fit, type FitResult, type LastInput } from "@arion/fit-engine"
import type { FitCatalog, FitProduct, FitTwinProfile } from "./types"

/** Katalogdaki her ürün için uyum sonucu — TARAYICIDA çalışır, ölçüler sunucuya gitmez. */
export function scoreCatalog(profile: FitTwinProfile, catalog: FitCatalog): Map<string, FitResult> {
  const lasts = new Map(catalog.lasts.map((l) => [l.code, l]))
  const out = new Map<string, FitResult>()
  for (const p of catalog.products) {
    const r = scoreProduct(profile, p, lasts.get(p.last_code))
    if (r) out.set(p.handle, r)
  }
  return out
}

export function scoreProduct(
  profile: FitTwinProfile,
  product: Pick<FitProduct, "sizes" | "widths" | "category">,
  last: { code: string; category: string; rows: LastInput["rows"] } | undefined,
): FitResult | null {
  if (!last) return null
  return fit(
    profile,
    { code: last.code, category: product.category ?? last.category, rows: last.rows },
    { sizes: product.sizes, widths: product.widths },
  )
}
