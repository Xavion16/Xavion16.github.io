import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import ProductTechModule from "../modules/product-tech"

// Her ürünün en fazla bir teknik kaydı vardır.
export default defineLink(ProductModule.linkable.product, ProductTechModule.linkable.productTech)
