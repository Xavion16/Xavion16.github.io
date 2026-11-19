import { createHash } from "node:crypto"
import type { LegalDoc } from "./types"

/** Metnin içerik özeti (LegalTextVersion.contentHash) — kabul kayıtlarına bağlanır. */
export function contentHash(doc: LegalDoc): string {
  return createHash("sha256")
    .update(JSON.stringify(doc))
    .digest("hex")
    .slice(0, 16)
}
