import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { LAST_MODULE } from "../../../../modules/last"
import type LastModuleService from "../../../../modules/last/service"

/**
 * GET /store/arion/fit-catalog — uyum motoru için katalog: kalıp ölçü tabloları + ürün başına kalıp,
 * satılan numara ve genişlikler. Skor TARAYICIDA hesaplanır; ayak ölçüleri sunucuya gelmez (Rapor §6.1).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "title",
      "thumbnail",
      "categories.handle",
      "options.title",
      "options.values.value",
      "product_tech.last_code",
    ],
    filters: { status: "published" },
  })
  const lastsSvc: LastModuleService = req.scope.resolve(LAST_MODULE)
  const lasts = await lastsSvc.listLasts({})

  const values = (p: (typeof data)[number], title: string) =>
    p.options?.find((o) => o?.title === title)?.values?.flatMap((v) => (v?.value ? [v.value] : [])) ?? []

  res.setHeader("Cache-Control", "public, max-age=300")
  res.json({
    lasts: lasts.map((l) => ({
      code: l.code,
      name: l.name,
      category: l.category,
      rows: (l.size_table as { rows: unknown[] }).rows,
    })),
    products: data.flatMap((p) =>
      p.product_tech?.last_code
        ? [
            {
              id: p.id,
              handle: p.handle,
              title: p.title,
              thumbnail: p.thumbnail,
              category: p.categories?.[0]?.handle ?? null,
              last_code: p.product_tech.last_code,
              sizes: values(p, "Numara").map(Number).sort((a, b) => a - b),
              widths: values(p, "Genişlik").length ? values(p, "Genişlik") : ["M"],
            },
          ]
        : [],
    ),
  })
}
