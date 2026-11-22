/**
 * STATİK YAYIN (GitHub Pages, DECISIONS #087): backend yok. next.config bu dosyayı gerçek
 * "use server" işleminin yerine koyar. Gerçek kayıt yapılmaz; gösterim amaçlı yanıt döner.
 */
import type { ActionState } from "../../actions/cart-actions"

/** Üyelik gösterim amaçlıdır: giriş/kayıt her zaman "demo" uyarısıyla döner. */
export async function loginAction(_prev: ActionState, _form: FormData): Promise<ActionState> {
  return { ok: false, error: "demoOnly" }
}
export async function registerAction(_prev: ActionState, _form: FormData): Promise<ActionState> {
  return { ok: false, error: "demoOnly" }
}
export async function logoutAction(): Promise<void> {}
