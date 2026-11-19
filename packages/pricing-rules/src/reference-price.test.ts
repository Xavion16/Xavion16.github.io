import { describe, expect, it } from "vitest"
import {
  computeReferencePrice,
  DEFAULT_REFERENCE_DAYS,
  referenceDaysFromEnv,
  type PriceHistoryEntry,
} from "./reference-price"

const d = (iso: string) => new Date(`${iso}T00:00:00Z`)
const entry = (
  price: number,
  from: string,
  to: string | null,
): PriceHistoryEntry => ({
  price,
  validFrom: d(from),
  validTo: to ? d(to) : null,
})

describe("computeReferencePrice", () => {
  it("varsayılan pencere 10 gündür", () => {
    expect(DEFAULT_REFERENCE_DAYS).toBe(10)
  })

  it("geçmiş yoksa null döner", () => {
    expect(computeReferencePrice([], d("2026-11-19"))).toBeNull()
  })

  it("tek fiyat → indirim yok", () => {
    const r = computeReferencePrice(
      [entry(2000, "2026-09-01", null)],
      d("2026-11-19"),
    )
    expect(r).toEqual({
      currentPrice: 2000,
      referencePrice: null,
      discountPercent: null,
      discountStartedAt: null,
    })
  })

  it("basit indirim: önceki fiyat referans olur", () => {
    const r = computeReferencePrice(
      [
        entry(2500, "2026-09-01", "2026-11-15"),
        entry(2000, "2026-11-15", null),
      ],
      d("2026-11-19"),
    )
    expect(r?.referencePrice).toBe(2500)
    expect(r?.discountPercent).toBe(20)
    expect(r?.discountStartedAt).toEqual(d("2026-11-15"))
  })

  it("son 10 gündeki EN DÜŞÜK fiyat esas alınır (şişirilmiş fiyat hilesi engellenir)", () => {
    // 1.800 → indirimden 3 gün önce 3.000'e çıkarılmış → 2.000'e "indirim"
    const r = computeReferencePrice(
      [
        entry(1800, "2026-10-01", "2026-11-12"),
        entry(3000, "2026-11-12", "2026-11-15"),
        entry(2000, "2026-11-15", null),
      ],
      d("2026-11-19"),
    )
    // Pencerede 1.800 de var ve 2.000'den düşük → indirim sayılmaz
    expect(r?.referencePrice).toBeNull()
  })

  it("pencere dışındaki eski düşük fiyat sayılmaz", () => {
    const r = computeReferencePrice(
      [
        entry(1500, "2026-08-01", "2026-10-01"),
        entry(2500, "2026-10-01", "2026-11-15"),
        entry(2000, "2026-11-15", null),
      ],
      d("2026-11-19"),
    )
    expect(r?.referencePrice).toBe(2500)
  })

  it("pencere sınırı: tam 10 gün önce biten kayıt dahil değildir", () => {
    const r = computeReferencePrice(
      [
        entry(1000, "2026-10-01", "2026-11-05"), // başlangıçtan tam 10 gün önce bitiyor
        entry(2500, "2026-11-05", "2026-11-15"),
        entry(2000, "2026-11-15", null),
      ],
      d("2026-11-19"),
    )
    expect(r?.referencePrice).toBe(2500)
  })

  it("fiyat artışı indirim değildir", () => {
    const r = computeReferencePrice(
      [
        entry(2000, "2026-09-01", "2026-11-15"),
        entry(2400, "2026-11-15", null),
      ],
      d("2026-11-19"),
    )
    expect(r?.referencePrice).toBeNull()
    expect(r?.currentPrice).toBe(2400)
  })

  it("kademeli indirimde güncel kademeden önceki 10 günün en düşüğü esas alınır", () => {
    const r = computeReferencePrice(
      [
        entry(1000, "2026-09-01", "2026-11-10"),
        entry(800, "2026-11-10", "2026-11-15"),
        entry(600, "2026-11-15", null),
      ],
      d("2026-11-19"),
    )
    expect(r?.referencePrice).toBe(800)
    expect(r?.discountPercent).toBe(25)
  })

  it("gün sayısı parametriktir (mevzuat değişirse tek satır)", () => {
    const history = [
      entry(1500, "2026-10-20", "2026-11-01"),
      entry(2500, "2026-11-01", "2026-11-15"),
      entry(2000, "2026-11-15", null),
    ]
    expect(
      computeReferencePrice(history, d("2026-11-19"), 10)?.referencePrice,
    ).toBe(2500)
    // 30 günlük eski kuralda 1.500 pencereye girer → indirim yok
    expect(
      computeReferencePrice(history, d("2026-11-19"), 30)?.referencePrice,
    ).toBeNull()
  })

  it("geçersiz girdide hata fırlatır", () => {
    expect(() =>
      computeReferencePrice([entry(-1, "2026-01-01", null)]),
    ).toThrow(RangeError)
    expect(() =>
      computeReferencePrice([entry(1, "2026-02-01", "2026-01-01")]),
    ).toThrow(RangeError)
    expect(() => computeReferencePrice([], new Date(), 0)).toThrow(RangeError)
  })
})

describe("referenceDaysFromEnv", () => {
  it("geçerli değeri okur, geçersizde 10'a düşer", () => {
    expect(referenceDaysFromEnv("10")).toBe(10)
    expect(referenceDaysFromEnv("30")).toBe(30)
    expect(referenceDaysFromEnv(undefined)).toBe(10)
    expect(referenceDaysFromEnv("abc")).toBe(10)
    expect(referenceDaysFromEnv("-5")).toBe(10)
  })
})
