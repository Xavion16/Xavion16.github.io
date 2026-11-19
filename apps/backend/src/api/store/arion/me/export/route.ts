import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CONSENT_MODULE } from "../../../../../modules/consent"
import type ConsentModuleService from "../../../../../modules/consent/service"
import { createDataSubjectRequestWorkflow } from "../../../../../workflows/kvkk"

/**
 * GET /store/arion/me/export — "Verilerimi indir" (KVKK m.11, Rapor §7.1.5).
 * Üyenin kişisel verilerini makinece okunur JSON olarak döndürür ve talebi kayda geçirir.
 * Kart verisi zaten tutulmadığı için dışa aktarımda da yoktur.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const cid = req.auth_context.actor_id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const svc: ConsentModuleService = req.scope.resolve(CONSENT_MODULE)

  const [{ data: customers }, { data: orders }, consents, requests, acceptances] = await Promise.all([
    query.graph({
      entity: "customer",
      fields: ["id", "email", "first_name", "last_name", "phone", "created_at", "addresses.*"],
      filters: { id: cid },
    }),
    query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "created_at",
        "email",
        "total",
        "currency_code",
        "items.product_title",
        "items.variant_title",
        "items.quantity",
        "shipping_address.*",
      ],
      filters: { customer_id: cid },
    }),
    svc.listConsents({ subject_ref: cid }, { order: { created_at: "ASC" } }),
    svc.listDataSubjectRequests({ customer_id: cid }),
    svc.listLegalAcceptances({ customer_id: cid }),
  ])
  const customer = customers[0]
  const now = new Date()

  await createDataSubjectRequestWorkflow(req.scope).run({
    input: {
      type: "export",
      full_name: `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim() || "—",
      email: customer?.email ?? "",
      customer_id: cid,
      details: "Self-servis JSON dışa aktarım",
      resolve_immediately: { note: "Otomatik: veriler anında indirildi" },
      notify: false,
    },
  })

  res.setHeader("Content-Disposition", `attachment; filename="arion-verilerim-${now.toISOString().slice(0, 10)}.json"`)
  res.json({
    exported_at: now.toISOString(),
    controller: "ARION (DEMO)",
    note: "Kart bilgisi ARION tarafından tutulmaz. Ayak İkizi verisi Faz 5'te eklenecek.",
    customer,
    orders,
    consents: consents.map((c) => ({
      purpose: c.purpose,
      granted: c.granted,
      text_version: c.text_version,
      channel: c.channel,
      at: c.created_at,
    })),
    legal_acceptances: acceptances.map((a) => ({
      document: a.doc_key,
      version: a.doc_version,
      hash: a.doc_hash,
      order_id: a.order_id,
      accepted_at: a.accepted_at,
    })),
    data_requests: requests.map((r) => ({ reference: r.reference, type: r.type, status: r.status, received_at: r.received_at })),
  })
}
