import { MedusaService } from "@medusajs/framework/utils"
import { seal, unseal } from "../../lib/sealed"
import FootProfile from "./models/foot-profile"

export type FootProfileData = {
  lengthMm: number
  ballWidthMm: number
  girthMm?: number | null
  archType: "flat" | "normal" | "high"
  preference: "snug" | "regular" | "roomy"
  method: "manual" | "paper"
}

class FitTwinModuleService extends MedusaService({ FootProfile }) {
  async getProfile(customerId: string): Promise<(FootProfileData & { updated_at: Date }) | null> {
    const [row] = await this.listFootProfiles({ customer_id: customerId })
    if (!row) return null
    return { ...unseal<FootProfileData>(row.sealed), updated_at: new Date(row.updated_at) }
  }

  async saveProfile(customerId: string, data: FootProfileData, consentVersion: string) {
    const sealed = seal(data)
    const [existing] = await this.listFootProfiles({ customer_id: customerId })
    if (existing) {
      return this.updateFootProfiles({ id: existing.id, sealed, consent_version: consentVersion })
    }
    return this.createFootProfiles({ customer_id: customerId, sealed, consent_version: consentVersion })
  }

  /** Kalıcı silme — satır veritabanından kaldırılır (soft delete DEĞİL). */
  async purge(customerId: string): Promise<number> {
    const rows = await this.listFootProfiles({ customer_id: customerId }, { withDeleted: true })
    if (rows.length) await this.deleteFootProfiles(rows.map((r) => r.id))
    return rows.length
  }
}

export default FitTwinModuleService
