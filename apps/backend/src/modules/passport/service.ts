import { MedusaService } from "@medusajs/framework/utils"
import Craftsman from "./models/craftsman"
import Passport from "./models/passport"
import RepairOrder from "./models/repair-order"

class PassportModuleService extends MedusaService({ Artisan: Craftsman, Passport, RepairOrder }) {
  /** Yılın sıradaki pasaport kodu: ARN-2026-000123 */
  async nextCode(year = new Date().getFullYear()): Promise<string> {
    const prefix = `ARN-${year}-`
    const rows = await this.listPassports({ code: { $like: `${prefix}%` } }, { select: ["code"] })
    const max = rows.reduce((m, r) => Math.max(m, Number(r.code.slice(prefix.length)) || 0), 0)
    return `${prefix}${String(max + 1).padStart(6, "0")}`
  }
}

export default PassportModuleService
