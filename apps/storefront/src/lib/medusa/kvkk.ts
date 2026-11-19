import "server-only"
import { sdk } from "./client"
import { getAuthHeaders } from "./cookies"

export type ConsentState = Record<string, { granted: boolean; version: string; at: string }>
export type MyDataRequest = {
  reference: string
  type: "info" | "export" | "correct" | "delete" | "object" | "other"
  status: "received" | "verifying" | "in_progress" | "resolved" | "rejected"
  received_at: string
  due_at: string
  resolved_at: string | null
}

export async function getMyConsents(): Promise<ConsentState> {
  const headers = await getAuthHeaders()
  if (!headers.authorization) return {}
  try {
    const { current } = await sdk.client.fetch<{ current: ConsentState }>("/store/arion/me/consents", { headers })
    return current
  } catch {
    return {}
  }
}

export async function getMyDataRequests(): Promise<MyDataRequest[]> {
  const headers = await getAuthHeaders()
  if (!headers.authorization) return []
  try {
    const { data_requests } = await sdk.client.fetch<{ data_requests: MyDataRequest[] }>(
      "/store/arion/me/data-requests",
      { headers },
    )
    return data_requests
  } catch {
    return []
  }
}
