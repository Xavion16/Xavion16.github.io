import fontkit from "@pdf-lib/fontkit"
import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib"
import { contentHash } from "./hash"
import type { LegalDoc } from "./types"

/**
 * Yasal metni (ön bilgilendirme, mesafeli satış vb.) PDF'e çevirir.
 * Türkçe karakterler (ğ, ş, İ, ı) için DejaVu Sans gömülür.
 */

const require_ = createRequire(__filename)
let fontCache: { regular: Uint8Array; bold: Uint8Array } | null = null

async function loadFonts() {
  if (fontCache) return fontCache
  const dir = path.join(
    path.dirname(require_.resolve("dejavu-fonts-ttf/package.json")),
    "ttf",
  )
  const [regular, bold] = await Promise.all([
    readFile(path.join(dir, "DejaVuSans.ttf")),
    readFile(path.join(dir, "DejaVuSans-Bold.ttf")),
  ])
  fontCache = { regular, bold }
  return fontCache
}

const A4 = { w: 595.28, h: 841.89 }
const M = 50
const INK = rgb(0.043, 0.043, 0.047)
const SOFT = rgb(0.27, 0.27, 0.3)

class Writer {
  page: PDFPage
  y = A4.h - M
  constructor(
    private pdf: PDFDocument,
    private font: PDFFont,
    private bold: PDFFont,
    private footer: string,
  ) {
    this.page = this.newPage()
  }

  private newPage(): PDFPage {
    const p = this.pdf.addPage([A4.w, A4.h])
    p.drawText(this.footer, {
      x: M,
      y: 24,
      size: 7,
      font: this.font,
      color: SOFT,
    })
    this.y = A4.h - M
    return p
  }

  private ensure(h: number) {
    if (this.y - h < M) this.page = this.newPage()
  }

  private wrap(
    text: string,
    size: number,
    font: PDFFont,
    width: number,
  ): string[] {
    const lines: string[] = []
    for (const para of text.split("\n")) {
      let line = ""
      for (const word of para.split(/\s+/)) {
        const next = line ? `${line} ${word}` : word
        if (font.widthOfTextAtSize(next, size) > width && line) {
          lines.push(line)
          line = word
        } else line = next
      }
      lines.push(line)
    }
    return lines
  }

  text(
    t: string,
    opts: {
      size?: number
      bold?: boolean
      color?: ReturnType<typeof rgb>
      indent?: number
      gap?: number
    } = {},
  ) {
    const size = opts.size ?? 9.5
    const font = opts.bold ? this.bold : this.font
    const x = M + (opts.indent ?? 0)
    for (const line of this.wrap(t, size, font, A4.w - M - x)) {
      this.ensure(size + 4)
      this.page.drawText(line, {
        x,
        y: this.y - size,
        size,
        font,
        color: opts.color ?? INK,
      })
      this.y -= size + 4
    }
    this.y -= opts.gap ?? 4
  }

  table(columns: string[], rows: string[][]) {
    const width = A4.w - 2 * M
    const colW = width / columns.length
    const size = 7.5
    const drawRow = (cells: string[], bold: boolean) => {
      const wrapped = cells.map((c) =>
        this.wrap(c, size, bold ? this.bold : this.font, colW - 6),
      )
      const h = Math.max(...wrapped.map((w) => w.length)) * (size + 3) + 6
      this.ensure(h)
      wrapped.forEach((lines, i) =>
        lines.forEach((l, j) =>
          this.page.drawText(l, {
            x: M + i * colW + 3,
            y: this.y - 4 - (j + 1) * (size + 3) + 3,
            size,
            font: bold ? this.bold : this.font,
            color: INK,
          }),
        ),
      )
      this.y -= h
      this.page.drawLine({
        start: { x: M, y: this.y },
        end: { x: M + width, y: this.y },
        thickness: 0.4,
        color: SOFT,
      })
    }
    drawRow(columns, true)
    rows.forEach((r) => drawRow(r, false))
    this.y -= 8
  }
}

export async function renderLegalPdf(
  doc: LegalDoc,
  meta: { orderRef?: string; acceptedAt?: Date; locale: "tr" | "en" },
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  const fonts = await loadFonts()
  const font = await pdf.embedFont(fonts.regular, { subset: true })
  const bold = await pdf.embedFont(fonts.bold, { subset: true })
  pdf.setTitle(doc.title)
  pdf.setAuthor("ARION (DEMO)")
  pdf.setLanguage(meta.locale === "tr" ? "tr-TR" : "en-GB")

  const hash = contentHash(doc)
  const footer = `ARION · ${doc.title} · v${doc.version} · ${hash}${meta.orderRef ? ` · ${meta.orderRef}` : ""} · DEMO`
  const w = new Writer(pdf, font, bold, footer)

  w.text("ARION", { size: 14, bold: true, gap: 2 })
  w.text(
    meta.locale === "tr"
      ? "DEMO — gerçek satış değildir"
      : "DEMO — not a real sale",
    { size: 7, color: rgb(0.76, 0.21, 0.1), gap: 12 },
  )
  w.text(doc.title, { size: 18, bold: true, gap: 6 })
  const metaLine = [
    `${meta.locale === "tr" ? "Sürüm" : "Version"} ${doc.version}`,
    `hash ${hash}`,
    meta.orderRef
      ? `${meta.locale === "tr" ? "Sipariş" : "Order"} ${meta.orderRef}`
      : null,
    meta.acceptedAt
      ? `${meta.locale === "tr" ? "Onay" : "Accepted"} ${meta.acceptedAt.toISOString()}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ")
  w.text(metaLine, { size: 8, color: SOFT, gap: 10 })
  if (doc.intro) w.text(doc.intro, { gap: 10 })

  for (const s of doc.sections) {
    if (s.heading) w.text(s.heading, { size: 11, bold: true, gap: 4 })
    for (const p of s.paragraphs ?? []) w.text(p)
    for (const item of s.items ?? []) w.text(`• ${item}`, { indent: 8, gap: 2 })
    if (s.table) w.table(s.table.columns, s.table.rows)
    w.text("", { gap: 4 })
  }

  return pdf.save()
}
