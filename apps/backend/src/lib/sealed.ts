import { MedusaError } from "@medusajs/framework/utils"
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto"

/**
 * Hassas veriyi (Ayak İkizi ölçüleri) uygulama katmanında şifreler — AES-256-GCM (Rapor §6.1).
 * Anahtar: FIT_TWIN_KEY (32 bayt, base64). Yoksa yalnızca geliştirmede COOKIE_SECRET'tan türetilir.
 * Biçim: "v1:<iv>:<tag>:<şifreli>" (base64url).
 */
const VERSION = "v1"

function key(): Buffer {
  const raw = process.env.FIT_TWIN_KEY
  if (raw) {
    const k = Buffer.from(raw, "base64")
    if (k.length !== 32) throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "FIT_TWIN_KEY 32 bayt (base64) olmalı")
    return k
  }
  if (process.env.NODE_ENV === "production") throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "FIT_TWIN_KEY tanımlı değil")
  return scryptSync(process.env.COOKIE_SECRET ?? "arion-dev", "arion-fit-twin", 32)
}

export function seal(value: unknown): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key(), iv)
  const data = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), data.toString("base64url")].join(":")
}

export function unseal<T>(sealed: string): T {
  const [version, iv, tag, data] = sealed.split(":")
  if (version !== VERSION || !iv || !tag || !data) throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Geçersiz şifreli veri")
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"))
  decipher.setAuthTag(Buffer.from(tag, "base64url"))
  const plain = Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()])
  return JSON.parse(plain.toString("utf8")) as T
}
