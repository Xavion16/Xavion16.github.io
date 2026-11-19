import "server-only"
import { COOKIE_POLICY_VERSION } from "@arion/legal-texts"
import { cookies } from "next/headers"
import { z } from "zod"

/**
 * Çerez tercihi (Rapor §7.1.4). `arion_consent` zorunlu çerezdir (tercihin kendisini saklar).
 * Politika sürümü değişirse tercih geçersiz sayılır ve banner yeniden gösterilir.
 */
export const CONSENT_COOKIE = "arion_consent"
export const ANON_COOKIE = "arion_aid"
const HALF_YEAR = 60 * 60 * 24 * 182

export type CookieChoice = { functional: boolean; analytics: boolean; marketing: boolean }

const Stored = z.object({
  v: z.string(),
  f: z.boolean(),
  a: z.boolean(),
  m: z.boolean(),
  t: z.number(),
})

export async function readCookieChoice(): Promise<CookieChoice | null> {
  const raw = (await cookies()).get(CONSENT_COOKIE)?.value
  if (!raw) return null
  try {
    const parsed = Stored.safeParse(JSON.parse(raw))
    if (!parsed.success || parsed.data.v !== COOKIE_POLICY_VERSION) return null
    return { functional: parsed.data.f, analytics: parsed.data.a, marketing: parsed.data.m }
  } catch {
    return null
  }
}

export async function writeCookieChoice(choice: CookieChoice) {
  const value = JSON.stringify({
    v: COOKIE_POLICY_VERSION,
    f: choice.functional,
    a: choice.analytics,
    m: choice.marketing,
    t: Date.now(),
  })
  ;(await cookies()).set(CONSENT_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: HALF_YEAR,
  })
}

/** Rıza kaydını ispat için rastgele, kimliksiz tanımlayıcı (zorunlu çerez). */
export async function getOrCreateAnonId(): Promise<string> {
  const jar = await cookies()
  const existing = jar.get(ANON_COOKIE)?.value
  if (existing && /^anon_[A-Za-z0-9_-]{16,64}$/.test(existing)) return existing
  const id = `anon_${crypto.randomUUID().replace(/-/g, "")}`
  jar.set(ANON_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: HALF_YEAR,
  })
  return id
}
