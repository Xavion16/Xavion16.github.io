import { PDFDocument } from "pdf-lib"
import { passportLabelPdf } from "../passport-label"

describe("passportLabelPdf", () => {
  it("70×40 mm, Türkçe karakterli etiket üretir", async () => {
    const bytes = await passportLabelPdf([
      {
        code: "ARN-2026-000123",
        url: "http://localhost:8000/tr/pasaport/ARN-2026-000123",
        product: "Adrastus Oxford — Çift dikişli, İğne ışık şğü",
        options: { color: "Siyah", size: "41", width: "M" },
        produced_at: new Date("2026-01-19"),
        last_code: "ARN-L07",
      },
    ])
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-")
    const doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBe(1)
    const { width, height } = doc.getPage(0).getSize()
    expect(Math.round((width / 72) * 25.4)).toBe(70)
    expect(Math.round((height / 72) * 25.4)).toBe(40)
  })
})
