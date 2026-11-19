import { describe, expect, it } from "vitest"
import { containsCardData, isHealthQuestion, maskPII } from "./index"

describe("maskPII", () => {
  it("e-posta, telefon, TCKN, kart ve IBAN maskelenir", () => {
    const text =
      "Ben Deniz, deniz@example.test, 0532 123 45 67, TC 12345678901, kart 4111 1111 1111 1111, IBAN TR33 0006 1005 1978 6457 8413 26"
    const out = maskPII(text)
    expect(out).not.toMatch(/deniz@example\.test/)
    expect(out).not.toMatch(/0532/)
    expect(out).not.toMatch(/12345678901/)
    expect(out).not.toMatch(/4111/)
    expect(out).not.toMatch(/TR33/)
    expect(out).toContain("[e-posta]")
    expect(out).toContain("[telefon]")
    expect(out).toContain("[kart no]")
    expect(out).toContain("[IBAN]")
  })

  it("numara ve fiyat gibi kısa sayıları bozmaz", () => {
    expect(maskPII("42 numara 4.990 TL, sipariş #12")).toBe(
      "42 numara 4.990 TL, sipariş #12",
    )
  })
})

describe("isHealthQuestion", () => {
  it.each([
    "Halluks valgusum var, hangi ayakkabı iyi gelir?",
    "Topuğum çok ağrıyor ne yapmalıyım",
    "Düz taban için tavsiye verir misin?",
    "I have plantar fasciitis, which shoe should I buy?",
    "My bunion hurts",
  ])("sağlık sorusu: %s", (q) => expect(isHealthQuestion(q)).toBe(true))

  it.each([
    "41 mi 42 mi almalıyım?",
    "Kışlık bot su geçirmez mi?",
    "Which size should I order?",
  ])("sağlık sorusu değil: %s", (q) => expect(isHealthQuestion(q)).toBe(false))
})

describe("containsCardData", () => {
  it("kart numarası ve CVV tespit edilir", () => {
    expect(containsCardData("kartım 4111-1111-1111-1111")).toBe(true)
    expect(containsCardData("cvv kodu 123")).toBe(true)
    expect(containsCardData("42 numara var mı")).toBe(false)
  })
})
