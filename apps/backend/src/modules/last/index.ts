import { Module } from "@medusajs/framework/utils"
import LastModuleService from "./service"

export const LAST_MODULE = "last"

export default Module(LAST_MODULE, { service: LastModuleService })
