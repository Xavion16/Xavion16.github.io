import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Select, Table, Text, toast } from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

/**
 * Destek operasyonu (Rapor §8.3): bilet kuyruğu + SLA (ilk yanıt hedefi 4 saat),
 * iade/cayma kuyruğu + para iadesi son tarihi (bildirimden itibaren 14 gün).
 */
type Ticket = {
  id: string
  ticket_no: string
  channel: "form" | "chat" | "email" | "phone"
  topic: string
  full_name: string
  email: string
  status: "open" | "pending" | "resolved"
  created_at: string
  first_response_at: string | null
  external_ref: string | null
}

type ReturnReq = {
  id: string
  return_no: string
  order_display_id: number
  reason: "fit" | "dislike" | "defective" | "wrong_item"
  path: "withdrawal" | "defect" | "exchange"
  return_code: string
  status: "requested" | "in_transit" | "received" | "refunded" | "rejected"
  refund_due_at: string | null
  created_at: string
}

const SLA_HOURS = 4
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

const PATH_LABEL: Record<ReturnReq["path"], string> = { withdrawal: "Cayma", defect: "Ayıplı mal", exchange: "Değişim" }
const RSTATUS: Record<ReturnReq["status"], string> = {
  requested: "Talep alındı",
  in_transit: "Kargoda",
  received: "Teslim alındı",
  refunded: "İade edildi",
  rejected: "Reddedildi",
}

const SupportPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [returns, setReturns] = useState<ReturnReq[]>([])
  const [fitCount, setFitCount] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  const load = useCallback(async () => {
    const r = await fetch("/admin/arion/support", { credentials: "include" })
    const d = (await r.json()) as { tickets: Ticket[]; returns: ReturnReq[]; fit_feedback_count: number }
    setTickets(d.tickets)
    setReturns(d.returns)
    setFitCount(d.fit_feedback_count)
    setNow(Date.now())
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const post = async (url: string, body: unknown) => {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) toast.success("Güncellendi")
    else toast.error("Güncellenemedi")
    void load()
  }

  const open = tickets.filter((t) => t.status !== "resolved")
  const breached = open.filter((t) => !t.first_response_at && now - new Date(t.created_at).getTime() > SLA_HOURS * HOUR)

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="grid grid-cols-3 gap-4 p-6">
        <div>
          <Text size="small" className="text-ui-fg-subtle">Açık bilet</Text>
          <Heading level="h2">{open.length}</Heading>
        </div>
        <div>
          <Text size="small" className="text-ui-fg-subtle">SLA aşımı (ilk yanıt &gt; {SLA_HOURS} sa)</Text>
          <Heading level="h2">{breached.length}</Heading>
        </div>
        <div>
          <Text size="small" className="text-ui-fg-subtle">Uyum geri bildirimi (anonim)</Text>
          <Heading level="h2">{fitCount}</Heading>
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h1">Destek biletleri</Heading>
          <Button variant="secondary" size="small" onClick={() => void load()}>Yenile</Button>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Bilet</Table.HeaderCell>
              <Table.HeaderCell>Kanal / konu</Table.HeaderCell>
              <Table.HeaderCell>Müşteri</Table.HeaderCell>
              <Table.HeaderCell>İlk yanıt SLA</Table.HeaderCell>
              <Table.HeaderCell>Durum</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {tickets.map((t) => {
              const ageH = (now - new Date(t.created_at).getTime()) / HOUR
              return (
                <Table.Row key={t.id}>
                  <Table.Cell className="font-mono">{t.ticket_no}</Table.Cell>
                  <Table.Cell>
                    {t.channel === "chat" ? "Areion → temsilci" : t.channel} · {t.topic}
                  </Table.Cell>
                  <Table.Cell>
                    {t.full_name}
                    <br />
                    <span className="text-ui-fg-subtle">{t.email}</span>
                  </Table.Cell>
                  <Table.Cell>
                    {t.first_response_at ? (
                      <Badge color="green">Yanıtlandı</Badge>
                    ) : (
                      <Badge color={ageH > SLA_HOURS ? "red" : ageH > SLA_HOURS / 2 ? "orange" : "green"}>
                        {ageH > SLA_HOURS ? `${Math.floor(ageH - SLA_HOURS)} sa aşıldı` : `${Math.max(0, Math.ceil(SLA_HOURS - ageH))} sa kaldı`}
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <Select value={t.status} onValueChange={(v) => void post(`/admin/arion/support/tickets/${t.id}`, { status: v, responded: true })}>
                        <Select.Trigger className="w-32">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="open">Açık</Select.Item>
                          <Select.Item value="pending">Beklemede</Select.Item>
                          <Select.Item value="resolved">Çözüldü</Select.Item>
                        </Select.Content>
                      </Select>
                      {!t.first_response_at ? (
                        <Button size="small" variant="transparent" onClick={() => void post(`/admin/arion/support/tickets/${t.id}`, { status: "pending", responded: true })}>
                          Yanıtlandı işaretle
                        </Button>
                      ) : null}
                    </div>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">İade / cayma kuyruğu</Heading>
          <Text size="small" className="text-ui-fg-subtle">Para iadesi cayma bildiriminden itibaren en geç 14 gün içinde yapılmalıdır.</Text>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Talep</Table.HeaderCell>
              <Table.HeaderCell>Sipariş</Table.HeaderCell>
              <Table.HeaderCell>Yol</Table.HeaderCell>
              <Table.HeaderCell>İade kodu</Table.HeaderCell>
              <Table.HeaderCell>Para iadesi</Table.HeaderCell>
              <Table.HeaderCell>Durum</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {returns.map((r) => {
              const left = r.refund_due_at ? Math.ceil((new Date(r.refund_due_at).getTime() - now) / DAY) : null
              const done = r.status === "refunded" || r.status === "rejected"
              return (
                <Table.Row key={r.id}>
                  <Table.Cell className="font-mono">{r.return_no}</Table.Cell>
                  <Table.Cell>#{r.order_display_id}</Table.Cell>
                  <Table.Cell>{PATH_LABEL[r.path]}</Table.Cell>
                  <Table.Cell className="font-mono">{r.return_code}</Table.Cell>
                  <Table.Cell>
                    {left === null || done ? (
                      "—"
                    ) : (
                      <Badge color={left <= 3 ? "red" : left <= 7 ? "orange" : "green"}>
                        {left < 0 ? `${-left} gün gecikti` : `${left} gün`}
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Select value={r.status} onValueChange={(v) => void post(`/admin/arion/support/returns/${r.id}`, { status: v })}>
                      <Select.Trigger className="w-36">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {(Object.keys(RSTATUS) as ReturnReq["status"][]).map((s) => (
                          <Select.Item key={s} value={s}>{RSTATUS[s]}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({ label: "Destek" })

export default SupportPage
