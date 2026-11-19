import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"
import type {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"

type Options = { directory?: string }

/**
 * Geliştirme/demo e-posta sağlayıcısı: e-postayı göndermek yerine `.outbox/` klasörüne HTML dosyası yazar.
 * Kişisel veri uygulama loguna düşmez (sadece dosya adı loglanır). Klasör git'e girmez.
 * Canlıda SMTP/Resend adapter'ı ile değiştirilir (Rapor §9.1).
 */
class OutboxNotificationService extends AbstractNotificationProviderService {
  static identifier = "outbox"

  protected readonly logger: Logger
  protected readonly directory: string

  constructor({ logger }: { logger: Logger }, options: Options) {
    super()
    this.logger = logger
    this.directory = path.resolve(process.cwd(), options.directory ?? ".outbox")
  }

  async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    if (!notification?.to) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Alıcı yok")
    }
    const subject = notification.content?.subject ?? notification.template
    const html =
      notification.content?.html ??
      `<pre>${JSON.stringify(notification.data ?? {}, null, 2)}</pre>`

    const id = `${new Date().toISOString().replace(/[:.]/g, "-")}-${notification.template}`
    const safeTo = notification.to.replace(/[^a-z0-9@._-]/gi, "_")
    const file = path.join(this.directory, `${id}-${safeTo}.html`)

    await mkdir(this.directory, { recursive: true })
    await writeFile(
      file,
      `<!-- to: ${notification.to} | subject: ${subject} -->\n${html}`,
      "utf8",
    )
    // Ekler (ör. sözleşme PDF'leri) e-postanın yanına ayrı dosya olarak yazılır
    for (const att of notification.attachments ?? []) {
      const safeName = att.filename.replace(/[^a-z0-9._-]/gi, "_")
      await writeFile(path.join(this.directory, `${id}-${safeName}`), Buffer.from(att.content, "base64"))
    }
    this.logger.info(`[outbox] ${notification.template} → ${path.basename(file)}`)
    return { id }
  }
}

export default OutboxNotificationService
