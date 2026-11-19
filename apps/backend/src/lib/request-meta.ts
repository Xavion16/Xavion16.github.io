import type { MedusaRequest } from "@medusajs/framework/http"

/** Rıza/onay kaydına konacak teknik bilgiler (Rapor §7.1.3: IP/UA). */
export function requestMeta(req: MedusaRequest): { ip: string | null; user_agent: string | null } {
  const fwd = req.headers["x-forwarded-for"]
  const ip = (typeof fwd === "string" ? fwd.split(",")[0]?.trim() : undefined) ?? req.ip ?? null
  const ua = req.headers["user-agent"]
  return { ip: ip ?? null, user_agent: typeof ua === "string" ? ua.slice(0, 300) : null }
}

/** auth_context yalnızca customer token'ı geçerliyse dolar. */
export function customerId(req: MedusaRequest): string | null {
  const ctx = (req as MedusaRequest & { auth_context?: { actor_id?: string; actor_type?: string } }).auth_context
  return ctx?.actor_type === "customer" && ctx.actor_id ? ctx.actor_id : null
}
