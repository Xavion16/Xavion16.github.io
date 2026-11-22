import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Input, Select, Table, Text, toast } from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

/**
 * Atölye (Rapor §6.4–6.6): "Pasaport oluştur" + QR etiket PDF'i, tamir / Geri Al kuyruğu.
 * Tamir "Tamamlandı" yapılınca pasaportun herkese açık tamir geçmişine düşer (yalnızca tür, tarih, not).
 */
type Passport = {
  id: string
  code: string
  product_title: string
  variant_options: { color?: string | null; size?: string | null; width?: string | null }
  last_code: string
  produced_at: string
  is_demo: boolean
}
type Artisan = { id: string; name: string; specialty: string }
type Product = { id: string; title: string; variants: Array<{ id: string; title: string }> }
type Repair = {
  id: string
  reference: string
  passport_code: string | null
  type: "resole" | "heel" | "stitch" | "clean" | "recraft"
  status: "received" | "in_repair" | "completed" | "cancelled"
  quote_min: number
  quote_max: number
  credit_amount: number | null
  shipping_code: string
  public_note: string | null
  created_at: string
  photos: { items: string[] }
}

const TYPE: Record<Repair["type"], string> = {
  resole: "Taban değişimi",
  heel: "Topuk",
  stitch: "Dikiş",
  clean: "Bakım/temizlik",
  recraft: "Geri Al – Yeniden Doğ",
}
const STATUS: Record<Repair["status"], string> = {
  received: "Alındı",
  in_repair: "Tamirde",
  completed: "Tamamlandı",
  cancelled: "İptal",
}
const SPECIALTY: Record<string, string> = {
  cutting: "Kesim",
  closing: "Saya dikimi",
  lasting: "Kalıba çekme",
  sole: "Taban",
  finishing: "Finisaj",
  qc: "Kalite kontrol",
}

const AtolyePage = () => {
  const [passports, setPassports] = useState<Passport[]>([])
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [productId, setProductId] = useState("")
  const [variantId, setVariantId] = useState("")
  const [artisanId, setArtisanId] = useState("")
  const [notes, setNotes] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    const r = await fetch("/admin/arion/passports", { credentials: "include" })
    const d = (await r.json()) as { passports: Passport[]; craftsmen: Artisan[]; products: Product[]; repairs: Repair[] }
    setPassports(d.passports)
    setArtisans(d.craftsmen)
    setProducts(d.products)
    setRepairs(d.repairs)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const variants = useMemo(() => products.find((p) => p.id === productId)?.variants ?? [], [products, productId])

  async function create() {
    if (!productId) return
    const r = await fetch("/admin/arion/passports", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, variant_id: variantId || null, craftsman_id: artisanId || null }),
    })
    if (!r.ok) {
      toast.error("Pasaport oluşturulamadı")
      return
    }
    const d = (await r.json()) as { passport: { code: string } }
    toast.success(`Pasaport oluşturuldu: ${d.passport.code}`)
    window.open(`/admin/arion/passports/${d.passport.code}/label`, "_blank", "noopener")
    await load()
  }

  async function updateRepair(id: string, body: { status?: Repair["status"]; public_note?: string | null }) {
    const r = await fetch(`/admin/arion/repairs/${id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!r.ok) toast.error("Güncellenemedi")
    else toast.success("Güncellendi")
    await load()
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h1">Pasaport oluştur</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Her çifte benzersiz kod (ARN-YYYY-NNNNNN) ve QR etiket. Pasaport ürüne aittir; kişisel veri içermez.
          </Text>
        </div>
        <div className="grid gap-3 px-6 py-4 md:grid-cols-4">
          <Select value={productId} onValueChange={(v) => { setProductId(v); setVariantId("") }}>
            <Select.Trigger aria-label="Ürün"><Select.Value placeholder="Ürün seç" /></Select.Trigger>
            <Select.Content>
              {products.map((p) => <Select.Item key={p.id} value={p.id}>{p.title}</Select.Item>)}
            </Select.Content>
          </Select>
          <Select value={variantId} onValueChange={setVariantId} disabled={!variants.length}>
            <Select.Trigger aria-label="Varyant"><Select.Value placeholder="Varyant (isteğe bağlı)" /></Select.Trigger>
            <Select.Content>
              {variants.map((v) => <Select.Item key={v.id} value={v.id}>{v.title}</Select.Item>)}
            </Select.Content>
          </Select>
          <Select value={artisanId} onValueChange={setArtisanId}>
            <Select.Trigger aria-label="Usta"><Select.Value placeholder="Usta (varsayılan: kalıba çekme)" /></Select.Trigger>
            <Select.Content>
              {artisans.map((a) => (
                <Select.Item key={a.id} value={a.id}>{a.name} · {SPECIALTY[a.specialty] ?? a.specialty}</Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Button onClick={() => void create()} disabled={!productId}>Oluştur ve etiketi aç</Button>
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Pasaportlar ({passports.length})</Heading>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Kod</Table.HeaderCell>
              <Table.HeaderCell>Ürün</Table.HeaderCell>
              <Table.HeaderCell>Seçenek</Table.HeaderCell>
              <Table.HeaderCell>Kalıp</Table.HeaderCell>
              <Table.HeaderCell>Üretim</Table.HeaderCell>
              <Table.HeaderCell>Etiket</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {passports.map((p) => (
              <Table.Row key={p.id}>
                <Table.Cell className="font-mono">{p.code} {p.is_demo ? <Badge size="2xsmall">DEMO</Badge> : null}</Table.Cell>
                <Table.Cell>{p.product_title}</Table.Cell>
                <Table.Cell>{[p.variant_options.color, p.variant_options.size, p.variant_options.width].filter(Boolean).join(" · ")}</Table.Cell>
                <Table.Cell>{p.last_code}</Table.Cell>
                <Table.Cell>{new Date(p.produced_at).toLocaleDateString("tr-TR")}</Table.Cell>
                <Table.Cell>
                  <a className="text-ui-fg-interactive underline" href={`/admin/arion/passports/${p.code}/label`} target="_blank" rel="noopener noreferrer">QR PDF</a>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Tamir ve Geri Al kuyruğu</Heading>
          <Text size="small" className="text-ui-fg-subtle">Kamuya açık nota kişi bilgisi yazma: pasaport sayfasında görünür.</Text>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Talep</Table.HeaderCell>
              <Table.HeaderCell>Tür</Table.HeaderCell>
              <Table.HeaderCell>Pasaport</Table.HeaderCell>
              <Table.HeaderCell>Tahmin</Table.HeaderCell>
              <Table.HeaderCell>Durum</Table.HeaderCell>
              <Table.HeaderCell>Kamuya açık not</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {repairs.map((r) => (
              <Table.Row key={r.id}>
                <Table.Cell className="font-mono">{r.reference}<br /><span className="text-ui-fg-subtle">{r.shipping_code}</span></Table.Cell>
                <Table.Cell>{TYPE[r.type]}{r.photos.items.length ? ` · ${r.photos.items.length} foto` : ""}</Table.Cell>
                <Table.Cell className="font-mono">{r.passport_code ?? "—"}</Table.Cell>
                <Table.Cell>{r.type === "recraft" ? `Kredi ${r.credit_amount ?? 0} TL` : `${r.quote_min}–${r.quote_max} TL`}</Table.Cell>
                <Table.Cell>
                  <Select value={r.status} onValueChange={(v) => void updateRepair(r.id, { status: v as Repair["status"] })}>
                    <Select.Trigger aria-label={`${r.reference} durumu`}><Select.Value /></Select.Trigger>
                    <Select.Content>
                      {(Object.keys(STATUS) as Repair["status"][]).map((s) => <Select.Item key={s} value={s}>{STATUS[s]}</Select.Item>)}
                    </Select.Content>
                  </Select>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Input
                      size="small"
                      aria-label={`${r.reference} notu`}
                      defaultValue={r.public_note ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                    />
                    <Button size="small" variant="secondary" onClick={() => void updateRepair(r.id, { public_note: notes[r.id] ?? r.public_note })}>
                      Kaydet
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({ label: "Atölye" })

export default AtolyePage
