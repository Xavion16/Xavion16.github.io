/**
 * STATİK YAYIN (GitHub Pages, DECISIONS #087): backend yok. next.config bu dosyayı gerçek
 * "use server" işleminin yerine koyar. Gerçek kayıt yapılmaz; gösterim amaçlı yanıt döner.
 */
import type { ActionState } from "../../actions/cart-actions"
import { addToStaticCart, updateStaticCart } from "../cart"

export type { ActionState }

export async function addToCartAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const id = String(form.get("variant_id") ?? "")
  if (!id) return { ok: false, error: "selectVariant" }
  addToStaticCart(id, Number(form.get("quantity") ?? 1) || 1)
  return { ok: true }
}

export async function updateLineAction(form: FormData): Promise<void> {
  updateStaticCart(String(form.get("line_id") ?? ""), Number(form.get("quantity") ?? 0))
}

export async function saveAddressAction(_prev: ActionState, _form: FormData): Promise<ActionState> {
  return { ok: true }
}
export async function setShippingAction(_form: FormData): Promise<void> {}
export async function startPaymentAction(): Promise<void> {}
export async function acceptAndPayAction(_form: FormData): Promise<void> {}
