import { MedusaService } from "@medusajs/framework/utils"
import PriceHistoryEntry from "./models/price-history-entry"

class PriceHistoryModuleService extends MedusaService({ PriceHistoryEntry }) {}

export default PriceHistoryModuleService
