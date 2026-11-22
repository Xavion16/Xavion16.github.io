import fontkit from "@pdf-lib/fontkit"
import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { PDFDocument, rgb } from "pdf-lib"
import QRCode from "qrcode"

const require_ = createRequire(__filename)
const MM = 72 / 25.4

export type LabelInput = {
  code: string
  url: string
  product: string
  options: { color?: string | null; size?: string | null; width?: string | null }
  produced_at: Date | string
  last_code: string
}

/**
 * Pasaport QR etiketi (Rapor §6.4): 70 × 40 mm, ayakkabı kutusu / dil içi etiket.
 * Türkçe karakterler için DejaVu Sans gömülür.
 */
export async function passportLabelPdf(items: LabelInput[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  const dir = path.join(path.dirname(require_.resolve("dejavu-fonts-ttf/package.json")), "ttf")
  const [regular, bold] = await Promise.all([
    readFile(path.join(dir, "DejaVuSans.ttf")).then((b) => pdf.embedFont(b, { subset: true })),
    readFile(path.join(dir, "DejaVuSans-Bold.ttf")).then((b) => pdf.embedFont(b, { subset: true })),
  ])
  pdf.setTitle("ARION Pasaport Etiketi")
  pdf.setProducer("ARION (DEMO)")

  for (const it of items) {
    const W = 70 * MM
    const H = 40 * MM
    const page = pdf.addPage([W, H])
    const ink = rgb(0.035, 0.035, 0.043)
    const qr = await QRCode.toBuffer(it.url, { errorCorrectionLevel: "M", margin: 0, width: 300 })
    const img = await pdf.embedPng(qr)
    const q = 30 * MM
    page.drawImage(img, { x: 4 * MM, y: (H - q) / 2, width: q, height: q })

    const x = 38 * MM
    let y = H - 7 * MM
    page.drawText("ARION", { x, y, size: 11, font: bold, color: ink })
    y -= 4.2 * MM
    page.drawText("Ayakkabı Pasaportu", { x, y, size: 6, font: regular, color: ink })
    y -= 5 * MM
    page.drawText(it.code, { x, y, size: 7.5, font: bold, color: rgb(0.76, 0.21, 0.1) })
    y -= 4 * MM
    const title = it.product.length > 26 ? `${it.product.slice(0, 25)}…` : it.product
    page.drawText(title, { x, y, size: 6, font: regular, color: ink })
    y -= 3.4 * MM
    const opts = [it.options.color, it.options.size ? `No ${it.options.size}` : null, it.options.width]
      .filter(Boolean)
      .join(" · ")
    page.drawText(opts, { x, y, size: 6, font: regular, color: ink })
    y -= 3.4 * MM
    page.drawText(`Kalıp ${it.last_code} · ${new Date(it.produced_at).toISOString().slice(0, 10)}`, {
      x,
      y,
      size: 6,
      font: regular,
      color: ink,
    })
    page.drawText("DEMO", { x: W - 12 * MM, y: 3 * MM, size: 6, font: bold, color: rgb(0.76, 0.21, 0.1) })
  }
  return pdf.save()
}
