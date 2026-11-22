/**
 * STATİK YAYIN (GitHub Pages, DECISIONS #087): backend yok. next.config bu dosyayı gerçek
 * "use server" işleminin yerine koyar. Gerçek kayıt yapılmaz; gösterim amaçlı yanıt döner.
 */
import type { QuoteResult, RepairSubmitResult } from "../../actions/repair-actions"

export type { QuoteResult, RepairSubmitResult }
export async function quoteRepairAction(_type: string, _passportCode: string): Promise<QuoteResult> {
  return { ok: false, error: "generic" }
}
export async function submitRepairAction(_input: unknown): Promise<RepairSubmitResult> {
  return { ok: false, error: "generic" }
}
