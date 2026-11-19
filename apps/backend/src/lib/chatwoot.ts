import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

/**
 * Chatwoot adapter'ı (Rapor §8.1). Canlıda: Chatwoot API ile kişi + konuşma oluşturur
 * (self-host tercih edilir — veri kontrolü bizde, yurt dışı aktarım yok).
 * MVP: mock — konuşmayı `.outbox/chatwoot-*.json` dosyasına yazar.
 */
export type ChatwootConversationInput = {
  ticket_no: string
  name: string
  email: string
  topic: string
  message: string
  transcript?: Array<{ role: "user" | "assistant"; text: string }> | null
}

export interface ChatwootAdapter {
  readonly mode: "mock" | "live"
  createConversation(input: ChatwootConversationInput): Promise<{ external_ref: string }>
}

class MockChatwootAdapter implements ChatwootAdapter {
  readonly mode = "mock" as const

  async createConversation(input: ChatwootConversationInput) {
    const dir = path.resolve(process.cwd(), ".outbox")
    await mkdir(dir, { recursive: true })
    const ref = `mock-conv-${input.ticket_no}`
    await writeFile(
      path.join(dir, `chatwoot-${Date.now()}-${input.ticket_no}.json`),
      JSON.stringify({ mock: true, inbox: "ARION Destek", conversation: ref, ...input }, null, 2),
      "utf8",
    )
    return { external_ref: ref }
  }
}

export function getChatwootAdapter(): ChatwootAdapter {
  return new MockChatwootAdapter()
}
