import { Module } from "@medusajs/framework/utils"
import FitTwinModuleService from "./service"

export const FIT_TWIN_MODULE = "fit_twin"

export default Module(FIT_TWIN_MODULE, { service: FitTwinModuleService })
