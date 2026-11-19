import { describe, expect, it } from "vitest"
import { euSizeToLastLengthMm, lastLengthMmToEuSize } from "./units"

describe("birim dönüşümleri", () => {
  it("EU 42 ≈ 280 mm kalıp uzunluğu", () => {
    expect(euSizeToLastLengthMm(42)).toBe(280)
  })

  it("gidiş-dönüş aynı numarayı verir", () => {
    for (const size of [35, 38.5, 42, 46]) {
      expect(lastLengthMmToEuSize(euSizeToLastLengthMm(size))).toBe(size)
    }
  })

  it("geçersiz girdide hata fırlatır", () => {
    expect(() => euSizeToLastLengthMm(0)).toThrow(RangeError)
    expect(() => lastLengthMmToEuSize(Number.NaN)).toThrow(RangeError)
  })
})
