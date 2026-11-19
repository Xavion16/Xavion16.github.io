import { decide, eligibility } from "../returns"

const DAY = 24 * 60 * 60 * 1000
const now = new Date("2026-11-19T12:00:00Z")
const ago = (d: number) => new Date(now.getTime() - d * DAY)

describe("cayma süresi (14 gün)", () => {
  it("teslimden 10 gün sonra cayma hakkı devam eder", () => {
    const e = eligibility(ago(10), true, now)
    expect(e.within_withdrawal).toBe(true)
    expect(e.days_left).toBe(4)
  })

  it("teslimden 20 gün sonra cayma süresi dolmuştur", () => {
    const e = eligibility(ago(20), true, now)
    expect(e.within_withdrawal).toBe(false)
    expect(e.days_left).toBe(0)
  })

  it("teslimden önce de cayma kullanılabilir", () => {
    const e = eligibility(new Date(now.getTime() + 2 * DAY), false, now)
    expect(e.within_withdrawal).toBe(true)
  })
})

describe("talep kararı", () => {
  const expired = eligibility(ago(20), true, now)
  const open = eligibility(ago(3), true, now)

  it("14 günü aşan siparişte cayma reddedilir (withdrawal_expired)", () => {
    expect(decide({ reason: "dislike", wants_exchange: false }, expired, now)).toEqual({
      ok: false,
      code: "withdrawal_expired",
    })
  })

  it("14 gün geçse de ayıplı mal yolu açıktır; seçimlik hak zorunludur", () => {
    expect(decide({ reason: "defective", wants_exchange: false }, expired, now)).toEqual({
      ok: false,
      code: "remedy_required",
    })
    const d = decide({ reason: "defective", wants_exchange: false, defect_remedy: "replace" }, expired, now)
    expect(d).toMatchObject({ ok: true, path: "defect", refund_due_at: null })
  })

  it("cayma: para iadesi bildirimden itibaren 14 gün", () => {
    const d = decide({ reason: "dislike", wants_exchange: false }, open, now)
    expect(d.ok && d.path).toBe("withdrawal")
    expect(d.ok && d.refund_due_at?.getTime()).toBe(now.getTime() + 14 * DAY)
  })

  it("uyum nedeniyle değişim: not zorunlu, para iadesi yok", () => {
    expect(decide({ reason: "fit", wants_exchange: true }, open, now)).toEqual({
      ok: false,
      code: "exchange_note_required",
    })
    expect(decide({ reason: "fit", wants_exchange: true, exchange_note: "42 → 43" }, open, now)).toEqual({
      ok: true,
      path: "exchange",
      refund_due_at: null,
    })
  })
})
