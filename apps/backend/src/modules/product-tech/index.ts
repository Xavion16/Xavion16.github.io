import { Module } from "@medusajs/framework/utils"
import ProductTechModuleService from "./service"

export const PRODUCT_TECH_MODULE = "product_tech"

export default Module(PRODUCT_TECH_MODULE, { service: ProductTechModuleService })
