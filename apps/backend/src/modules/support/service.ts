import { MedusaService } from "@medusajs/framework/utils"
import FitFeedback from "./models/fit-feedback"
import ReturnRequest from "./models/return-request"
import SupportTicket from "./models/support-ticket"

class SupportModuleService extends MedusaService({ SupportTicket, ReturnRequest, FitFeedback }) {}

export default SupportModuleService
