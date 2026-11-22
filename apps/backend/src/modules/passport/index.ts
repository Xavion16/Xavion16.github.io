import { Module } from "@medusajs/framework/utils"
import PassportModuleService from "./service"

export const PASSPORT_MODULE = "passport"

export default Module(PASSPORT_MODULE, { service: PassportModuleService })
