import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Select, Table, Text, toast } from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

/**
 * KVKK Talepleri kuyruğu (Rapor §7.1.5, §8.3): son tarihe kalan gün sayacı, durum güncelleme,
 * imha log'u ve imha işini elle çalıştırma.
 */
type Dsr = {
  id: string
  reference: string
  type: "info" | "export" | "correct" | "delete" | "object" | "other"
  status: "received" | "verifying" | "in_progress" | "resolved" | "rejected"
  full_name: string
  email: string
  details: string | null
  received_at: string
  due_at: string
}

type RetentionLog = { id: string; rule: string; action: string; affected: number; ran_at: string; note: string | null }

const TYPE_LABEL: Record<Dsr["type"], string> = {
  info: "Bilgi talebi",
  export: "Verilerimi indir",
  correct: "Düzeltme",
  delete: "Silme",
  object: "İtiraz",
  other: "Diğer",
}

const STATUS_LABEL: Record<Dsr["status"], string> = {
  received: "Alındı",
  verifying: "Kimlik doğrulama",
  in_progress: "İşlemde",
  resolved: "Sonuçlandı",
  rejected: "Reddedildi",
}

const DAY = 24 * 60 * 60 * 1000

function daysLeft(due: string, now: number): number {
  return Math.ceil((new Date(due).getTime() - now) / DAY)
}

const KvkkPage = () => {
  const [rows, setRows] = useState<Dsr[]>([])
  const [logs, setLogs] = useState<RetentionLog[]>([])
  const [scope, setScope] = useState<"open" | "all">("open")
  const [now] = useState(() => Date.now())

  const load = useCallback(async () => {
    const [r, l] = await Promise.all([
      fetch(`/admin/arion/data-requests${scope === "all" ? "?status=all" : ""}`, { credentials: "include" }),
      fetch("/admin/arion/retention", { credentials: "include" }),
    ])
    setRows(((await r.json()) as { data_requests: Dsr[] }).data_requests)
    setLogs(((await l.json()) as { retention_logs: RetentionLog[] }).retention_logs)
  }, [scope])

  useEffect(() => {
    void load()
  }, [load])

  const updateStatus = async (id: string, status: Dsr["status"]) => {
    const res = await fetch(`/admin/arion/data-requests/${id}`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) toast.success("Durum güncellendi")
    else toast.error("Güncellenemedi")
    void load()
  }

  const runRetention = async () => {
    const res = await fetch("/admin/arion/retention", { method: "POST", credentials: "include" })
    if (res.ok) toast.success("İmha işi çalıştırıldı")
    void load()
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h1">KVKK Talepleri</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              KVKK m.11 başvuruları — yasal yanıt süresi 30 gün.
            </Text>
          </div>
          <Select value={scope} onValueChange={(v) => setScope(v as "open" | "all")}>
            <Select.Trigger className="w-40">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="open">Açık talepler</Select.Item>
              <Select.Item value="all">Tümü</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Referans</Table.HeaderCell>
              <Table.HeaderCell>Tür</Table.HeaderCell>
              <Table.HeaderCell>Başvuran</Table.HeaderCell>
              <Table.HeaderCell>Kalan süre</Table.HeaderCell>
              <Table.HeaderCell>Durum</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((r) => {
              const left = daysLeft(r.due_at, now)
              const open = r.status !== "resolved" && r.status !== "rejected"
              return (
                <Table.Row key={r.id}>
                  <Table.Cell className="font-mono">{r.reference}</Table.Cell>
                  <Table.Cell>{TYPE_LABEL[r.type]}</Table.Cell>
                  <Table.Cell>
                    {r.full_name}
                    <br />
                    <span className="text-ui-fg-subtle">{r.email}</span>
                  </Table.Cell>
                  <Table.Cell>
                    {open ? (
                      <Badge color={left <= 5 ? "red" : left <= 10 ? "orange" : "green"}>
                        {left < 0 ? `${-left} gün gecikti` : `${left} gün`}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Select value={r.status} onValueChange={(v) => void updateStatus(r.id, v as Dsr["status"])}>
                      <Select.Trigger className="w-44">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {(Object.keys(STATUS_LABEL) as Dsr["status"][]).map((s) => (
                          <Select.Item key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
        {rows.length === 0 ? (
          <Text className="px-6 py-4 text-ui-fg-subtle">Bekleyen başvuru yok.</Text>
        ) : null}
      </Container>

      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h2">Saklama ve İmha Kaydı</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              kvkk-imha işi her gece 03:30'da çalışır.
            </Text>
          </div>
          <Button variant="secondary" onClick={() => void runRetention()}>
            Şimdi çalıştır
          </Button>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Zaman</Table.HeaderCell>
              <Table.HeaderCell>Kural</Table.HeaderCell>
              <Table.HeaderCell>İşlem</Table.HeaderCell>
              <Table.HeaderCell>Etkilenen</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {logs.slice(0, 15).map((l) => (
              <Table.Row key={l.id}>
                <Table.Cell>{new Date(l.ran_at).toLocaleString("tr-TR")}</Table.Cell>
                <Table.Cell>{l.note ?? l.rule}</Table.Cell>
                <Table.Cell>{l.action}</Table.Cell>
                <Table.Cell>{l.affected}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({ label: "KVKK Talepleri" })

export default KvkkPage
