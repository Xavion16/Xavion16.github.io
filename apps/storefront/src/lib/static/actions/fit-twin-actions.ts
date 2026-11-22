/**
 * STATİK YAYIN (GitHub Pages, DECISIONS #087): backend yok. next.config bu dosyayı gerçek
 * "use server" işleminin yerine koyar. Gerçek kayıt yapılmaz; gösterim amaçlı yanıt döner.
 */
import type { SaveResult } from "../../actions/fit-twin-actions"

export type { SaveResult }
/** Üye profili sunucuya kaydedilemez; misafir profili tarayıcıda zaten tutulur. */
export async function saveFitTwinAction(_profile: unknown, _consent: boolean): Promise<SaveResult> {
  return { ok: false, error: "auth" }
}
export async function deleteFitTwinAction(): Promise<{ ok: boolean }> {
  return { ok: true }
}
