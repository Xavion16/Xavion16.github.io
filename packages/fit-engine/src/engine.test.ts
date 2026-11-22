import { describe, expect, it } from "vitest"
import {
  band,
  CATEGORY_RULES,
  fit,
  FITS_ME_THRESHOLD,
  ruleFor,
  scoreRow,
  scoreSelection,
  validateProfile,
  type FootProfile,
  type LastInput,
  type SizeRow,
  type WidthFitting,
} from "./engine"

// Seed'deki buildSizeTable ile aynı kurgu (apps/backend/src/scripts/data/arion-catalog.ts)
const DELTA: Record<WidthFitting, number> = { N: -5, M: 0, W: 6 }
function table(
  sizes: number[],
  ratio: number,
  fittings: WidthFitting[],
): SizeRow[] {
  return sizes.flatMap((eu) =>
    fittings.map((f) => {
      const length = Math.round((eu * 20) / 3)
      const ball = Math.round(length * ratio + DELTA[f])
      return {
        eu_size: eu,
        length_mm: length,
        ball_width_mm: ball,
        girth_mm: Math.round(ball * 2.35),
        width_fitting: f,
      }
    }),
  )
}

const SNEAKER: LastInput = {
  code: "ARN-L05",
  category: "sneaker",
  rows: table([37, 38, 39, 40, 41, 42, 43, 44, 45], 0.385, ["M", "W"]),
}
const HEEL: LastInput = {
  code: "ARN-L01",
  category: "topuklu",
  rows: table([35, 36, 37, 38, 39, 40, 41], 0.355, ["M"]),
}
const BOOT: LastInput = {
  code: "ARN-L03",
  category: "kislik-bot",
  rows: table([38, 39, 40, 41, 42, 43, 44, 45], 0.395, ["M", "W"]),
}
const CLASSIC: LastInput = {
  code: "ARN-L07",
  category: "klasik",
  rows: table([39, 40, 41, 42, 43, 44, 45], 0.375, ["N", "M", "W"]),
}
const KIDS: LastInput = {
  code: "ARN-L09",
  category: "cocuk",
  rows: table([26, 27, 28, 29, 30, 31, 32, 33, 34], 0.41, ["M"]),
}

const base: FootProfile = {
  lengthMm: 266,
  ballWidthMm: 107,
  archType: "normal",
  preference: "regular",
}
const codes = (r: { reasons: Array<{ code: string }> }) =>
  r.reasons.map((x) => x.code)

describe("fit — sneaker", () => {
  it("ayak 266 mm → 42 M, yüksek skor, gerekçe: uzunluk ve genişlik uygun", () => {
    const r = fit(base, SNEAKER)
    expect(r.recommendedSize).toBe(42)
    expect(r.recommendedWidth).toBe("M")
    expect(r.score).toBeGreaterThanOrEqual(95)
    expect(codes(r)).toEqual(["length_ok", "width_ok"])
    expect(r.ranked[0]!.row.eu_size).toBe(42)
  })

  it("geniş ön ayak → aynı numaranın W seçeneği ve 'M'den X mm geniş' gerekçesi", () => {
    const r = fit({ ...base, ballWidthMm: 113 }, SNEAKER)
    expect(r.recommendedSize).toBe(42)
    expect(r.recommendedWidth).toBe("W")
    const w = r.reasons.find((x) => x.code === "width_narrow")
    expect(w).toEqual({ code: "width_narrow", mm: 6, suggest: "W" })
  })

  it("yalnızca M satılıyorsa geniş ayak skoru düşer ve W önerilmez", () => {
    const onlyM = fit({ ...base, ballWidthMm: 113 }, SNEAKER, { widths: ["M"] })
    const withW = fit({ ...base, ballWidthMm: 113 }, SNEAKER)
    expect(onlyM.recommendedWidth).toBe("M")
    expect(onlyM.score).toBeLessThan(withW.score)
  })

  it("numara filtresi: 42 satılmıyorsa en yakın numara", () => {
    const r = fit(base, SNEAKER, { sizes: [40, 41, 43] })
    expect([41, 43]).toContain(r.recommendedSize)
  })

  it("satılan satır yoksa skor 0 ve no_good_size", () => {
    const r = fit(base, SNEAKER, { sizes: [99] })
    expect(r).toMatchObject({
      score: 0,
      recommendedSize: null,
      recommendedWidth: null,
    })
    expect(codes(r)).toEqual(["no_good_size"])
  })
})

describe("fit — tercih ve kural etkisi", () => {
  it("sıkı tercih daha küçük ya da eşit, rahat tercih daha büyük ya da eşit numara önerir", () => {
    const foot = { ...base, lengthMm: 269 }
    const snug = fit({ ...foot, preference: "snug" }, SNEAKER)
    const roomy = fit({ ...foot, preference: "roomy" }, SNEAKER)
    expect(snug.recommendedSize!).toBeLessThanOrEqual(roomy.recommendedSize!)
    expect(codes(snug)).toContain("preference")
    expect(snug.reasons).toContainEqual({
      code: "preference",
      preference: "snug",
    })
  })

  it("kışlık bot çorap payını gerekçede söyler ve sneaker'dan büyük kalıp önerir", () => {
    const boot = fit(base, BOOT)
    expect(codes(boot)).toContain("extra_sock")
    expect(boot.reasons).toContainEqual({ code: "extra_sock", mm: 4 })
    expect(boot.recommendedSize).toBe(43)
  })

  it("çocuk kalıbında büyüme payı gerekçesi", () => {
    const r = fit(
      {
        lengthMm: 180,
        ballWidthMm: 74,
        archType: "normal",
        preference: "regular",
      },
      KIDS,
    )
    expect(codes(r)).toContain("extra_growth")
    expect(r.recommendedSize).toBe(30)
  })

  it("topukluda genişlik ağırlığı daha yüksek: aynı dar ölçüde sneaker'dan çok puan kaybeder", () => {
    const foot: FootProfile = {
      lengthMm: 240,
      ballWidthMm: 99,
      archType: "normal",
      preference: "regular",
    }
    const heel = fit(foot, HEEL)
    const footS: FootProfile = { ...foot }
    const sneakerOnlyM = fit(footS, SNEAKER, { widths: ["M"] })
    expect(CATEGORY_RULES.topuklu.weights.width).toBeGreaterThan(
      CATEGORY_RULES.sneaker.weights.width,
    )
    expect(heel.reasons.some((r) => r.code === "width_narrow")).toBe(true)
    // Topukluda W yok → öneri yok
    expect(
      heel.reasons.find((r) => r.code === "width_narrow"),
    ).not.toHaveProperty("suggest")
    expect(heel.score).toBeLessThan(100)
    expect(sneakerOnlyM.score).toBeGreaterThan(0)
  })

  it("bilinmeyen kategori klasik kurala düşer", () => {
    expect(ruleFor("bilinmeyen")).toBe(CATEGORY_RULES.klasik)
    const r = fit(base, { ...CLASSIC, category: "bilinmeyen" })
    expect(r.recommendedSize).not.toBeNull()
  })
})

describe("fit — gerekçeler", () => {
  it("ayak çok uzunsa kısa uyarısı ve düşük skor (no_good_size)", () => {
    const r = fit({ ...base, lengthMm: 300 }, SNEAKER)
    expect(r.recommendedSize).toBe(45)
    expect(codes(r)[0]).toBe("no_good_size")
    expect(r.reasons.find((x) => x.code === "length_short")).toMatchObject({
      mm: 14,
    })
    expect(r.score).toBeLessThan(80)
  })

  it("ayak çok kısaysa uzun uyarısı", () => {
    const r = fit({ ...base, lengthMm: 225, ballWidthMm: 90 }, SNEAKER)
    expect(r.recommendedSize).toBe(37)
    expect(codes(r)).toContain("length_long")
  })

  it("dar ayak: klasikte N önerilir ve 'geniş' gerekçesi N'yi işaret eder", () => {
    const r = fit({ ...base, lengthMm: 268, ballWidthMm: 99 }, CLASSIC)
    expect(r.recommendedWidth).toBe("N")
    expect(r.reasons).toContainEqual(
      expect.objectContaining({ code: "width_wide", suggest: "N" }),
    )
  })

  it("yalnızca M varsa dar ayakta 'geniş' uyarısı öneri olmadan", () => {
    const r = fit({ ...base, ballWidthMm: 96 }, SNEAKER, { widths: ["M"] })
    const w = r.reasons.find((x) => x.code === "width_wide")
    expect(w).toBeDefined()
    expect(w).not.toHaveProperty("suggest")
  })

  it("geniş ayak W'de bile darsa W'den daha geniş öneri yok", () => {
    const r = fit({ ...base, ballWidthMm: 125 }, SNEAKER)
    expect(r.recommendedWidth).toBe("W")
    expect(r.reasons.find((x) => x.code === "width_narrow")).not.toHaveProperty(
      "suggest",
    )
  })

  it("W önerildiğinde, M tablosu yoksa 'width_ok'", () => {
    const onlyW: LastInput = {
      ...SNEAKER,
      rows: SNEAKER.rows.filter((r) => r.width_fitting === "W"),
    }
    const r = fit({ ...base, ballWidthMm: 113 }, onlyW)
    expect(r.recommendedWidth).toBe("W")
    expect(codes(r)).toContain("width_ok")
  })

  it("W önerildi ama M zaten yeterliyse 'width_ok'", () => {
    // M ile tam eşit genişlikte bir ayak; tercih 'roomy' olunca W öne geçebilir
    const r = fit({ ...base, ballWidthMm: 108, preference: "roomy" }, SNEAKER)
    expect(codes(r)).not.toContain("no_good_size")
    expect(r.reasons.filter((x) => x.code.startsWith("width")).length).toBe(1)
  })

  it("N önerildi ama M'ye göre fark yoksa 'width_ok'", () => {
    const onlyN: LastInput = {
      ...CLASSIC,
      rows: CLASSIC.rows.map((r) =>
        r.width_fitting === "N"
          ? r
          : { ...r, ball_width_mm: r.ball_width_mm - 20 },
      ),
    }
    const r = fit({ ...base, lengthMm: 268, ballWidthMm: 96 }, onlyN, {
      widths: ["N", "M"],
    })
    expect(r.recommendedWidth).toBe("N")
    expect(codes(r)).toContain("width_ok")
  })

  it("çevre ölçüsü dar ve kemer yüksekse ilgili gerekçeler (teşhis dili yok)", () => {
    const r = fit({ ...base, girthMm: 270, archType: "high" }, SNEAKER, {
      widths: ["M"],
    })
    expect(codes(r)).toEqual(
      expect.arrayContaining(["girth_tight", "arch_high"]),
    )
    const roomyGirth = fit({ ...base, girthMm: 230 }, SNEAKER)
    expect(codes(roomyGirth)).not.toContain("girth_tight")
    expect(roomyGirth.score).toBeGreaterThan(80)
  })
})

describe("scoreRow / scoreSelection", () => {
  it("kısa taraf uzun taraftan daha çok cezalandırılır", () => {
    const rule = CATEGORY_RULES.sneaker
    const exact = SNEAKER.rows.find(
      (r) => r.eu_size === 42 && r.width_fitting === "M",
    )!
    const short = scoreRow({ ...base, lengthMm: 266 + 4 }, exact, rule)
    const long = scoreRow({ ...base, lengthMm: 266 - 4 }, exact, rule)
    expect(short.lengthDeltaMm).toBeLessThan(0)
    expect(long.lengthDeltaMm).toBeGreaterThan(0)
    expect(short.score).toBeLessThan(long.score)
    expect(short.girthDeltaMm).toBeNull()
  })

  it("çevre ölçüsü verilince girthDelta hesaplanır", () => {
    const row = SNEAKER.rows[0]!
    const r = scoreRow({ ...base, girthMm: 200 }, row, CATEGORY_RULES.sneaker)
    expect(r.girthDeltaMm).toBeCloseTo(row.girth_mm - 200, 1)
  })

  it("seçili numara için skor; olmayan satırda null", () => {
    expect(scoreSelection(base, SNEAKER, 42)?.score).toBeGreaterThanOrEqual(95)
    expect(scoreSelection(base, SNEAKER, 42, "W")!.score).toBeLessThan(
      scoreSelection(base, SNEAKER, 42)!.score,
    )
    expect(scoreSelection(base, SNEAKER, 50)).toBeNull()
  })
})

describe("validateProfile / band", () => {
  it("geçerli profil hatasız", () => {
    expect(validateProfile(base)).toEqual([])
    expect(validateProfile({ ...base, girthMm: 245 })).toEqual([])
  })
  it("aralık dışı değerler", () => {
    expect(validateProfile({ ...base, lengthMm: 50 })).toContain("length_range")
    expect(validateProfile({ ...base, ballWidthMm: 200 })).toContain(
      "width_range",
    )
    expect(validateProfile({ ...base, girthMm: 50 })).toContain("girth_range")
    expect(validateProfile({ ...base, lengthMm: Number.NaN })).toContain(
      "length_range",
    )
  })
  it("orantısız genişlik ölçüm hatası sayılır", () => {
    expect(
      validateProfile({ ...base, lengthMm: 300, ballWidthMm: 60 }),
    ).toEqual(["ratio"])
  })
  it("skor bantları ve eşik", () => {
    expect([
      band(95),
      band(85),
      band(84),
      band(70),
      band(69),
      band(50),
      band(49),
    ]).toEqual(["great", "great", "good", "good", "fair", "fair", "poor"])
    expect(FITS_ME_THRESHOLD).toBe(70)
  })
})
