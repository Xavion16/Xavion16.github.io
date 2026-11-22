import "server-only"
import Medusa from "@medusajs/js-sdk"
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

export const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

/**
 * Statik yayın (GitHub Pages, DECISIONS #087): backend olmadan derlenebilsin diye backend yanıtları
 * kaydedilip tekrar oynatılır.
 * - ARION_SNAPSHOT=record → backend'e gerçekten gidilir, yanıt `snapshot/` klasörüne yazılır.
 * - NEXT_PUBLIC_ARION_STATIC=1 (record değilse) → backend'e gidilmez, yanıt `snapshot/`'tan okunur.
 * Anahtar: yöntem + yol + sorgu + gövde özeti (host ve kimlik başlıkları dahil değil).
 */
const SNAPSHOT_DIR = path.join(process.cwd(), "snapshot")
const MODE = process.env.ARION_SNAPSHOT === "record" ? "record" : process.env.NEXT_PUBLIC_ARION_STATIC === "1" ? "replay" : "live"

type Stored = { status: number; body: string }

function keyFor(url: URL, method: string, body: unknown): string {
  const raw = `${method.toUpperCase()} ${url.pathname}${url.search} ${typeof body === "string" ? body : ""}`
  return createHash("sha1").update(raw).digest("hex")
}

if (MODE !== "live" && !(globalThis as { __arionSnapshot?: boolean }).__arionSnapshot) {
  ;(globalThis as { __arionSnapshot?: boolean }).__arionSnapshot = true
  const realFetch = globalThis.fetch.bind(globalThis)
  const backend = new URL(BACKEND_URL)
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url)
    if (url.host !== backend.host) return realFetch(input, init)
    const method = init?.method ?? (input instanceof Request ? input.method : "GET")
    const file = path.join(SNAPSHOT_DIR, `${keyFor(url, method, init?.body)}.json`)
    if (MODE === "record") {
      const res = await realFetch(input, init)
      const body = await res.text()
      mkdirSync(SNAPSHOT_DIR, { recursive: true })
      writeFileSync(file, JSON.stringify({ status: res.status, body } satisfies Stored))
      return new Response(body, { status: res.status, headers: { "content-type": "application/json" } })
    }
    // replay: kayıt yoksa "bulunamadı" (sayfa boş/yedek içerikle derlenir)
    const stored: Stored = existsSync(file)
      ? (JSON.parse(readFileSync(file, "utf8")) as Stored)
      : { status: 404, body: JSON.stringify({ type: "not_found", message: "snapshot" }) }
    return new Response(stored.body, { status: stored.status, headers: { "content-type": "application/json" } })
  }) as typeof fetch
}

/** Sunucu tarafı Medusa istemcisi. Publishable key olmadan store API'leri anlaşılmaz hata verir. */
export const sdk = new Medusa({
  baseUrl: BACKEND_URL,
  debug: false,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  // Sunucuda token ASLA istemci belleğinde tutulmaz (kullanıcılar arası sızıntı olmasın);
  // her istekte httpOnly çerezden okunup başlık olarak geçilir.
  auth: { type: "jwt", jwtTokenStorageMethod: "nostore" },
})
