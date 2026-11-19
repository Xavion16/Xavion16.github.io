import { MedusaService } from "@medusajs/framework/utils"
import Consent from "./models/consent"
import DataSubjectRequest from "./models/data-subject-request"
import IysSync from "./models/iys-sync"
import LegalAcceptance from "./models/legal-acceptance"
import RetentionLog from "./models/retention-log"

class ConsentModuleService extends MedusaService({
  Consent,
  DataSubjectRequest,
  LegalAcceptance,
  IysSync,
  RetentionLog,
}) {
  /** Amaç başına en güncel rıza durumu. */
  async currentConsents(subjectRef: string): Promise<Record<string, { granted: boolean; version: string; at: Date }>> {
    const rows = await this.listConsents({ subject_ref: subjectRef }, { order: { created_at: "ASC" } })
    const out: Record<string, { granted: boolean; version: string; at: Date }> = {}
    for (const r of rows) {
      out[r.purpose] = { granted: r.granted, version: r.text_version, at: new Date(r.created_at) }
    }
    return out
  }
}

export default ConsentModuleService
