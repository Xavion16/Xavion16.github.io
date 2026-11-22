/**
 * STATİK YAYIN (GitHub Pages, DECISIONS #087): backend yok. next.config bu dosyayı gerçek
 * "use server" işleminin yerine koyar. Gerçek kayıt yapılmaz; gösterim amaçlı yanıt döner.
 */
import type { DsrState } from "../../actions/consent-actions"

export type { DsrState }
const CHOICE_KEY = "arion-cookie-choice"

/** Çerez tercihi yalnızca bu tarayıcıda saklanır (sunucu yok). */
export async function saveCookieChoiceAction(input: unknown): Promise<{ ok: boolean }> {
  try {
    localStorage.setItem(CHOICE_KEY, JSON.stringify(input))
  } catch {
    // gizli pencere vb.
  }
  return { ok: true }
}
export async function saveMemberConsentsAction(_channel: "register" | "account", _input: unknown): Promise<{ ok: boolean }> {
  return { ok: true }
}
export async function submitDataRequestAction(_prev: DsrState, _form: FormData): Promise<DsrState> {
  const due = new Date(Date.now() + 30 * 864e5).toISOString()
  return { ok: true, reference: "KVKK-DEMO-" + Math.floor(1000 + Math.random() * 9000), due_at: due }
}
export async function savePermissionsAction(_prev: { ok: boolean; saved?: boolean }, _form: FormData): Promise<{ ok: boolean; saved?: boolean }> {
  return { ok: true, saved: true }
}
