import { atelierTimeline, ATELIER_STEPS, MAX_LEAD_TIME_DAYS } from "../atelier"
import { quoteRepair } from "../repairs"

describe("atelierTimeline", () => {
  const ordered = new Date("2026-11-01T10:00:00Z")

  it("7 adım, son adım teslim tarihinde", () => {
    const t = atelierTimeline(ordered, 21, ordered)
    expect(t.steps.map((s) => s.code)).toEqual([...ATELIER_STEPS])
    expect(new Date(t.due_at).getTime() - ordered.getTime()).toBe(21 * 86_400_000)
    expect(t.steps.every((s) => !s.done)).toBe(true)
    expect(t.steps[0]!.current).toBe(true)
  })

  it("zaman ilerledikçe adımlar tamamlanır, tek 'current' adım vardır", () => {
    const t = atelierTimeline(ordered, 21, new Date(ordered.getTime() + 10 * 86_400_000))
    const done = t.steps.filter((s) => s.done).length
    expect(done).toBeGreaterThan(1)
    expect(done).toBeLessThan(7)
    expect(t.steps.filter((s) => s.current)).toHaveLength(1)
    expect(t.steps[done]!.current).toBe(true)
  })

  it("teslim süresi 30 günü aşamaz (mesafeli satış)", () => {
    expect(atelierTimeline(ordered, 90, ordered).lead_time_days).toBe(MAX_LEAD_TIME_DAYS)
  })

  it("teslim tamamlandığında current yok", () => {
    const t = atelierTimeline(ordered, 21, new Date(ordered.getTime() + 40 * 86_400_000))
    expect(t.steps.every((s) => s.done && !s.current)).toBe(true)
  })
})

describe("quoteRepair", () => {
  it("dikişli yapıda taban değişimi yapıştırmadan ucuz", () => {
    const welt = quoteRepair("resole", "goodyear_welt")
    const cemented = quoteRepair("resole", "cemented")
    expect(welt.min).toBeLessThan(cemented.min)
    expect(welt.feasible).toBe(true)
  })

  it("vulkanize tabanda taban değişimi uygun değil", () => {
    expect(quoteRepair("resole", "vulcanized").feasible).toBe(false)
  })

  it("Geri Al – Yeniden Doğ ücret almaz, kredi verir", () => {
    const q = quoteRepair("recraft", null, 9)
    expect(q).toMatchObject({ min: 0, max: 0, feasible: true })
    expect(q.credit).toBe(670)
  })

  it("topuk tamiri yapıdan bağımsız", () => {
    expect(quoteRepair("heel", "cemented")).toEqual(quoteRepair("heel", "goodyear_welt"))
  })
})
