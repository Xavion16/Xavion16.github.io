export type OrderEmailData = {
  id: string
  display_id: number
  email: string
  currency_code: string
  total: number | string
  subtotal: number | string
  shipping_total: number | string
  tax_total: number | string
  items?: Array<{
    title: string
    variant_title?: string | null
    quantity: number
    total: number | string
  } | null> | null
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    address_1?: string | null
    city?: string | null
    province?: string | null
  } | null
  shipping_methods?: Array<{ name: string } | null> | null
}

const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ENTITIES[c] ?? c)

/** İşlemsel sipariş e-postası (TR). Reklam içermez. */
export function renderOrderPlacedEmail(order: OrderEmailData): { subject: string; html: string } {
  const fmt = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: order.currency_code.toUpperCase(),
  })
  const money = (v: number | string) => fmt.format(Number(v))
  const rows = (order.items ?? [])
    .flatMap((i) => (i ? [i] : []))
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${esc(i.title)}<br><small style="color:#666">${esc(i.variant_title)}</small></td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${money(i.total)}</td>
      </tr>`,
    )
    .join("")
  const a = order.shipping_address
  const subject = `ARION siparişin alındı · #${order.display_id}`

  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${esc(subject)}</title></head>
<body style="margin:0;background:#f4f4f1;font-family:Arial,Helvetica,sans-serif;color:#0b0b0c">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <p style="margin:0;font-weight:900;letter-spacing:4px">ARION</p>
    <p style="margin:4px 0 0;font-size:11px;color:#c2361a;letter-spacing:2px">DEMO · GERÇEK SATIŞ DEĞİLDİR</p>
    <h1 style="font-size:28px;margin:28px 0 8px">Siparişin alındı.</h1>
    <p style="margin:0 0 24px;color:#46464d">Sipariş no: <strong>#${order.display_id}</strong></p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead><tr><th align="left">Ürün</th><th>Adet</th><th align="right">Tutar</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <table style="width:100%;margin-top:16px;font-size:14px">
      <tr><td>Ara toplam</td><td align="right">${money(order.subtotal)}</td></tr>
      <tr><td>Kargo (${esc(order.shipping_methods?.[0]?.name)})</td><td align="right">${money(order.shipping_total)}</td></tr>
      <tr><td style="color:#46464d">Dahil KDV</td><td align="right" style="color:#46464d">${money(order.tax_total)}</td></tr>
      <tr><td style="font-weight:700;padding-top:8px">Toplam (KDV dahil)</td><td align="right" style="font-weight:700;padding-top:8px">${money(order.total)}</td></tr>
    </table>
    <h2 style="font-size:16px;margin:28px 0 8px">Teslimat adresi</h2>
    <p style="margin:0;color:#46464d">${esc(a?.first_name)} ${esc(a?.last_name)}<br>${esc(a?.address_1)}<br>${esc(a?.city)} ${esc(a?.province)}</p>
    <p style="margin:28px 0 0;font-size:12px;color:#46464d">Cayma hakkını teslimden itibaren 14 gün içinde gerekçe göstermeden kullanabilirsin; iade kargo ücreti satıcıya aittir.
    Ön bilgilendirme formu ve mesafeli satış sözleşmesi Faz 3'te bu e-postaya PDF olarak eklenecek.</p>
  </div>
</body></html>`
  return { subject, html }
}
