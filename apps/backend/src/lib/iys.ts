import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { MedusaError } from "@medusajs/framework/utils"

/**
 * İleti Yönetim Sistemi (İYS) adapter'ı (Rapor §7.4). MVP'de mock: istekleri `.outbox/iys-*.json`
 * dosyasına yazar. Canlıda İYS API'sine (marka kodu, OAuth) bağlanan bir uygulama ile değiştirilir.
 */
export type IysChannel = "EPOSTA" | "MESAJ"
export type IysStatus = "ONAY" | "RET"

export type IysRecord = {
  channel: IysChannel
  recipient: string
  status: IysStatus
  /** İYS kaynak türü: web sitesi */
  source: "HS_WEB"
  consentDate: string
}

export interface IysAdapter {
  readonly mode: "mock" | "live"
  sync(record: IysRecord): Promise<{ ok: boolean; response: string }>
}

class MockIysAdapter implements IysAdapter {
  readonly mode = "mock" as const

  async sync(record: IysRecord) {
    const dir = path.resolve(process.cwd(), ".outbox")
    await mkdir(dir, { recursive: true })
    const file = `iys-${Date.now()}-${record.channel}-${record.status}.json`
    await writeFile(path.join(dir, file), JSON.stringify({ mock: true, ...record }, null, 2), "utf8")
    return { ok: true, response: `mock:${file}` }
  }
}

export function getIysAdapter(): IysAdapter {
  if (process.env.IYS_ADAPTER === "live") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "İYS live adapter henüz yok — IYS_ADAPTER=mock kullanın")
  }
  return new MockIysAdapter()
}
