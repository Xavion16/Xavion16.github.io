import "server-only"
import { cache } from "react"
import { sdk } from "@/lib/medusa/client"
import { getAuthHeaders } from "@/lib/medusa/cookies"
import type { FitCatalog, FitTwinProfile } from "./types"

export const getFitCatalog = cache(async (): Promise<FitCatalog> => {
  try {
    return await sdk.client.fetch<FitCatalog>("/store/arion/fit-catalog", { method: "GET" })
  } catch {
    return { lasts: [], products: [] }
  }
})

/** Üyenin kayıtlı Ayak İkizi (şifresi backend'de çözülür). Misafirde hiçbir istek atılmaz. */
export const getMemberFitTwin = cache(async (): Promise<FitTwinProfile | null> => {
  const headers = await getAuthHeaders()
  if (!headers.authorization) return null
  try {
    const { profile } = await sdk.client.fetch<{ profile: FitTwinProfile }>("/store/arion/me/fit-twin", {
      method: "GET",
      headers,
    })
    return profile
  } catch {
    return null
  }
})
