import "server-only"
import Medusa from "@medusajs/js-sdk"

export const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

/** Sunucu tarafı Medusa istemcisi. Publishable key olmadan store API'leri anlaşılmaz hata verir. */
export const sdk = new Medusa({
  baseUrl: BACKEND_URL,
  debug: false,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  // Sunucuda token ASLA istemci belleğinde tutulmaz (kullanıcılar arası sızıntı olmasın);
  // her istekte httpOnly çerezden okunup başlık olarak geçilir.
  auth: { type: "jwt", jwtTokenStorageMethod: "nostore" },
})
