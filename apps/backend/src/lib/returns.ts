/**
 * İade / cayma / ayıplı mal kuralları (Rapor §7.2, §8.2). Saf fonksiyon — birim testli.
 */
export const WITHDRAWAL_DAYS = 14
export const REFUND_DAYS = 14
const DAY = 24 * 60 * 60 * 1000

export type ReturnReason = "fit" | "dislike" | "defective" | "wrong_item"
export type ReturnPath = "withdrawal" | "defect" | "exchange"
export type DefectRemedy = "terminate" | "discount" | "repair" | "replace"

export type Eligibility = {
  delivered: boolean
  /** Teslim tarihi; teslim edilmediyse beklenen teslim */
  delivered_at: Date
  withdrawal_deadline: Date
  within_withdrawal: boolean
  days_left: number
}

export function eligibility(deliveredAt: Date, delivered: boolean, now = new Date()): Eligibility {
  const deadline = new Date(deliveredAt.getTime() + WITHDRAWAL_DAYS * DAY)
  // Cayma hakkı teslimden önce de kullanılabilir; süre teslimden itibaren işler
  const within = !delivered || now.getTime() <= deadline.getTime()
  return {
    delivered,
    delivered_at: deliveredAt,
    withdrawal_deadline: deadline,
    within_withdrawal: within,
    days_left: Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / DAY)),
  }
}

export type Decision =
  | { ok: true; path: ReturnPath; refund_due_at: Date | null }
  | { ok: false; code: "withdrawal_expired" | "remedy_required" | "exchange_note_required" }

/**
 * Talebin hangi yola gideceğine karar verir.
 *  - Kusurlu/yanlış ürün → ayıplı mal yolu (14 güne bağlı değil), seçimlik hak zorunlu.
 *  - Diğer nedenler → cayma (14 gün). Süre dolduysa reddedilir.
 *  - Uyum nedeniyle değişim istenirse → değişim (cayma süresi içinde).
 */
export function decide(
  input: { reason: ReturnReason; wants_exchange: boolean; defect_remedy?: DefectRemedy | null; exchange_note?: string | null },
  elig: Eligibility,
  now = new Date(),
): Decision {
  const refundDue = new Date(now.getTime() + REFUND_DAYS * DAY)
  if (input.reason === "defective" || input.reason === "wrong_item") {
    if (!input.defect_remedy) return { ok: false, code: "remedy_required" }
    const refunds = input.defect_remedy === "terminate" || input.defect_remedy === "discount"
    return { ok: true, path: "defect", refund_due_at: refunds ? refundDue : null }
  }
  if (!elig.within_withdrawal) return { ok: false, code: "withdrawal_expired" }
  if (input.wants_exchange) {
    if (!input.exchange_note?.trim()) return { ok: false, code: "exchange_note_required" }
    return { ok: true, path: "exchange", refund_due_at: null }
  }
  return { ok: true, path: "withdrawal", refund_due_at: refundDue }
}
