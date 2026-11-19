import {
  authenticate,
  configureStoreSearch,
  defineMiddlewares,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DISTANCE_SALES_VERSION, PRE_CONTRACT_VERSION } from "@arion/legal-texts"

/**
 * Hukuki koruma (Rapor §7.2): Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi onaylanmadan
 * sipariş OLUŞTURULAMAZ. Storefront'taki pasif butona ek olarak sunucu tarafında zorlanır.
 */
async function requireLegalAcceptance(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: ["id", "metadata"],
    filters: { id: req.params.id },
  })
  const meta = data[0]?.metadata as Record<string, unknown> | null | undefined
  const acc = meta?.legal_acceptance as
    | { pre_contract?: { version?: string }; distance_sales?: { version?: string } }
    | undefined
  const ok =
    acc?.pre_contract?.version === PRE_CONTRACT_VERSION &&
    acc?.distance_sales?.version === DISTANCE_SALES_VERSION
  if (!ok) {
    res.status(400).json({
      type: "not_allowed",
      code: "legal_acceptance_required",
      message: "Ön bilgilendirme formu ve mesafeli satış sözleşmesi onaylanmadan sipariş verilemez.",
    })
    return
  }
  next()
}

export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/store/search",
      middlewares: [configureStoreSearch({ allowed_indexes: { product: true } })],
    },
    {
      method: ["POST"],
      matcher: "/store/carts/:id/complete",
      middlewares: [requireLegalAcceptance],
    },
    // Üye girişi isteğe bağlı: varsa rıza müşteriye, yoksa anonim tanımlayıcıya yazılır
    {
      matcher: "/store/arion/consents",
      method: ["POST"],
      middlewares: [authenticate("customer", ["bearer", "session"], { allowUnauthenticated: true })],
    },
    {
      matcher: "/store/arion/data-requests",
      method: ["POST"],
      middlewares: [authenticate("customer", ["bearer", "session"], { allowUnauthenticated: true })],
    },
    {
      matcher: "/store/arion/carts/:id/legal-acceptance",
      method: ["POST"],
      middlewares: [authenticate("customer", ["bearer", "session"], { allowUnauthenticated: true })],
    },
    {
      matcher: "/store/arion/support-tickets",
      method: ["POST"],
      middlewares: [authenticate("customer", ["bearer", "session"], { allowUnauthenticated: true })],
    },
    // Yalnızca üyeler
    {
      matcher: "/store/arion/me*",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
  ],
})
