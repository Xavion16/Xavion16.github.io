import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createPricePreferencesWorkflow,
  updatePricePreferencesWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  deleteProductsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { LAST_MODULE } from "../modules/last"
import type LastModuleService from "../modules/last/service"
import { PRICE_HISTORY_MODULE } from "../modules/price-history"
import type PriceHistoryModuleService from "../modules/price-history/service"
import { PRODUCT_TECH_MODULE } from "../modules/product-tech"
import type ProductTechModuleService from "../modules/product-tech/service"
import {
  buildSizeTable,
  CATEGORIES,
  COLOR_CODES,
  LASTS,
  PRODUCTS,
  type ProductSeed,
} from "./data/arion-catalog"
import { seedWorkshop } from "./seed-workshop"

/**
 * ARION demo verisi. Tekrar çalıştırılabilir: ARION ürünlerini, kalıpları, teknik kayıtları
 * ve fiyat geçmişini silip yeniden oluşturur; bölge/kargo/depo varsa yeniden kullanır.
 *
 *   cd apps/backend && npx medusa exec ./src/scripts/seed-arion.ts
 */

const DAY_MS = 24 * 60 * 60 * 1000
const STARTER_HANDLES = ["t-shirt", "sweatshirt", "sweatpants", "shorts"]
/** Yeniden adlandırılan ürünlerin eski adresleri (DECISIONS #084): tekrar çalıştırmada temizlenir */
const LEGACY_HANDLES = [
  "pera-65-stiletto", "moda-45-blok-topuk", "kackar-su-gecirmez-bot", "uludag-termal-bot", "palandoken-chelsea",
  "ruzgar-kosu", "bogaz-gunluk-sneaker", "kadikoy-vulkanize", "galata-oxford", "beyoglu-loafer",
  "nisantasi-derby", "fidan-cirtli", "filiz-cocuk-botu",
  // ara sürüm adları (taş adları)
  "obsidyen-oxford", "akik-loafer", "kehribar-derby", "granit-chelsea", "bazalt-dag-botu",
  "grafit-termal-bot", "meteor-kosu", "mermer-sneaker", "cakil-vulkanize",
  // Türkçe ad sürümü (#084)
  "mehtap-stiletto", "safak-blok-topuk", "yakut-topuklu-cizme", "ayla-bilek-bot", "sirma-slingback", "inci-sandalet", "elmas-mule", "kaan-oxford", "tuna-loafer", "arda-derby", "kerem-chelsea", "doruk-dag-botu", "ayaz-termal-bot", "atlas-kosu", "ege-sneaker", "cinar-vulkanize", "serce-cirtli", "marti-cocuk-botu",
]
const REGION_NAME = "Türkiye"
const LOCATION_NAME = "İstanbul Atölye"

function variantsFor(p: ProductSeed) {
  const multiWidth = p.widths.length > 1
  return p.colors.flatMap((color) =>
    p.sizes.flatMap((size) =>
      p.widths.map((width) => {
        const options: Record<string, string> = { Renk: color, Numara: String(size) }
        if (multiWidth) options["Genişlik"] = width
        const code = `${p.handle.split("-").slice(0, 2).join("-").toUpperCase()}`
        return {
          title: multiWidth ? `${color} / ${size} / ${width}` : `${color} / ${size}`,
          sku: `ARN-${code}-${COLOR_CODES[color] ?? "XXX"}-${size}${multiWidth ? `-${width}` : ""}`,
          options,
          manage_inventory: true,
          prices: [{ currency_code: "try", amount: p.price }],
        }
      }),
    ),
  )
}

export default async function seedArion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const lasts: LastModuleService = container.resolve(LAST_MODULE)
  const techs: ProductTechModuleService = container.resolve(PRODUCT_TECH_MODULE)
  const history: PriceHistoryModuleService = container.resolve(PRICE_HISTORY_MODULE)

  // ── Mağaza, satış kanalı ─────────────────────────────────────────────
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "default_sales_channel_id", "supported_currencies.currency_code"],
  })
  const store = stores[0]
  if (!store?.default_sales_channel_id) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Mağaza / satış kanalı bulunamadı")
  }
  const salesChannelId = store.default_sales_channel_id

  // ── Bölge: Türkiye (TRY, KDV dahil fiyatlar) ─────────────────────────
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
    filters: { name: REGION_NAME },
  })
  let regionId = regions[0]?.id
  if (!regionId) {
    logger.info("Türkiye bölgesi oluşturuluyor…")
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: REGION_NAME,
            currency_code: "try",
            countries: ["tr"],
            payment_providers: ["pp_iyzico_iyzico"],
            automatic_taxes: true,
            is_tax_inclusive: true,
            metadata: {
              return_window_days: 14,
              free_returns: true,
              handling_days_min: 1,
              handling_days_max: 2,
              transit_days_min: 1,
              transit_days_max: 3,
            },
          },
        ],
      },
    })
    regionId = result[0]!.id
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: "tr",
          provider_id: "tp_system",
          default_tax_rate: { rate: 20, name: "KDV", code: "KDV" },
        },
      ],
    })
  }

  // Türkiye'de fiyatlar KDV DAHİL gösterilir (Rapor §7.3): hem para birimi hem bölge tercihi
  const pricing = container.resolve(Modules.PRICING)
  const wanted = [
    { attribute: "currency_code", value: "try" },
    { attribute: "region_id", value: regionId },
  ]
  for (const pref of wanted) {
    const [existing] = await pricing.listPricePreferences(pref)
    if (!existing) {
      await createPricePreferencesWorkflow(container).run({
        input: [{ ...pref, is_tax_inclusive: true }],
      })
    } else if (!existing.is_tax_inclusive) {
      await updatePricePreferencesWorkflow(container).run({
        input: { selector: { id: [existing.id] }, update: { is_tax_inclusive: true } },
      })
    }
  }

  const currencies = (store.supported_currencies ?? []).flatMap((c) => (c ? [c.currency_code] : []))
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "ARION",
        default_region_id: regionId,
        supported_currencies: [
          { currency_code: "try", is_default: true },
          ...currencies
            .filter((c) => c !== "try")
            .map((currency_code) => ({ currency_code, is_default: false })),
        ],
      },
    },
  })

  // ── Depo + kargo ─────────────────────────────────────────────────────
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
    filters: { name: LOCATION_NAME },
  })
  let locationId = locations[0]?.id
  if (!locationId) {
    logger.info("Depo ve kargo seçenekleri oluşturuluyor…")
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: LOCATION_NAME,
            address: { city: "İstanbul", country_code: "TR", address_1: "Örnek Mah. Atölye Sk. No:1 (DEMO)" },
          },
        ],
      },
    })
    locationId = result[0]!.id
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: locationId },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    })
    const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id"] })
    const fset = await fulfillment.createFulfillmentSets({
      name: "Türkiye teslimat",
      type: "shipping",
      service_zones: [{ name: "Türkiye", geo_zones: [{ country_code: "tr", type: "country" }] }],
    })
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: locationId },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fset.id },
    })
    const rules = [
      { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
      { attribute: "is_return", value: "false", operator: "eq" as const },
    ]
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standart Kargo",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fset.service_zones[0]!.id,
          shipping_profile_id: profiles[0]!.id,
          type: { label: "Standart", description: "2–4 iş günü (DEMO kargo)", code: "standard" },
          prices: [
            { currency_code: "try", amount: 89.9 },
            { region_id: regionId, amount: 89.9 },
          ],
          rules,
        },
        {
          name: "Hızlı Kargo",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fset.service_zones[0]!.id,
          shipping_profile_id: profiles[0]!.id,
          type: { label: "Hızlı", description: "Ertesi iş günü (DEMO kargo)", code: "express" },
          prices: [
            { currency_code: "try", amount: 149.9 },
            { region_id: regionId, amount: 149.9 },
          ],
          rules,
        },
      ],
    })
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: locationId, add: [salesChannelId] },
    })
  }

  // ── Eski ürünleri temizle (starter + önceki ARION seed'i) ─────────────
  const { data: oldProducts } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { handle: [...STARTER_HANDLES, ...LEGACY_HANDLES, ...PRODUCTS.map((p) => p.handle)] },
  })
  if (oldProducts.length) {
    // Demo siparişlerinin stok rezervasyonları ürün silmeyi engeller; demo verisi olduğu için temizlenir
    const inventory = container.resolve(Modules.INVENTORY)
    const reservations = await inventory.listReservationItems({}, { select: ["id"] })
    if (reservations.length) await inventory.deleteReservationItems(reservations.map((r) => r.id))
    logger.info(`${oldProducts.length} eski ürün siliniyor…`)
    await deleteProductsWorkflow(container).run({ input: { ids: oldProducts.map((p) => p.id) } })
  }
  const oldTech = await techs.listProductTeches({}, { select: ["id"] })
  if (oldTech.length) await techs.deleteProductTeches(oldTech.map((t) => t.id))
  const oldLasts = await lasts.listLasts({}, { select: ["id"] })
  if (oldLasts.length) await lasts.deleteLasts(oldLasts.map((l) => l.id))
  const oldHistory = await history.listPriceHistoryEntries({}, { select: ["id"] })
  if (oldHistory.length) await history.deletePriceHistoryEntries(oldHistory.map((h) => h.id))

  // ── Kategoriler ──────────────────────────────────────────────────────
  const { data: existingCats } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
    filters: { handle: CATEGORIES.map((c) => c.handle) },
  })
  const catIds = new Map(existingCats.map((c) => [c.handle, c.id]))
  const missingCats = CATEGORIES.filter((c) => !catIds.has(c.handle))
  if (missingCats.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missingCats.map((c) => ({
          name: c.name,
          handle: c.handle,
          is_active: true,
          rank: c.rank,
          metadata: { name_en: c.name_en },
        })),
      },
    })
    result.forEach((c) => catIds.set(c.handle, c.id))
  }

  // ── Kalıplar ─────────────────────────────────────────────────────────
  await lasts.createLasts(
    LASTS.map((l) => ({
      code: l.code,
      name: l.name,
      category: l.category,
      toe_shape: l.toe_shape,
      size_table: { rows: buildSizeTable(l) },
      notes: l.notes,
      is_demo: true,
    })),
  )
  logger.info(`${LASTS.length} kalıp oluşturuldu.`)

  // ── Ürünler ──────────────────────────────────────────────────────────
  const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id"] })
  const { result: created } = await createProductsWorkflow(container).run({
    input: {
      products: PRODUCTS.map((p) => {
        const options = [
          { title: "Renk", values: p.colors },
          { title: "Numara", values: p.sizes.map(String) },
          ...(p.widths.length > 1 ? [{ title: "Genişlik", values: p.widths }] : []),
        ]
        return {
          title: p.title,
          subtitle: p.subtitle,
          handle: p.handle,
          description: p.description,
          status: ProductStatus.PUBLISHED,
          category_ids: [catIds.get(p.category)!],
          shipping_profile_id: profiles[0]!.id,
          weight: p.weight,
          origin_country: "tr",
          material: p.materials[0]?.material,
          metadata: {
            title_en: p.title_en,
            description_en: p.description_en,
            name_story: p.story?.tr,
            name_story_en: p.story?.en,
            is_demo: true,
            last_code: p.last,
            made_to_order: p.made_to_order ?? false,
          },
          options,
          variants: variantsFor(p),
          sales_channels: [{ id: salesChannelId }],
        }
      }),
    },
  })
  logger.info(`${created.length} ürün oluşturuldu.`)

  // ── Teknik kayıtlar + link ───────────────────────────────────────────
  for (const product of created) {
    const seed = PRODUCTS.find((p) => p.handle === product.handle)!
    const tech = await techs.createProductTeches({
      last_code: seed.last,
      construction: seed.construction,
      heel: seed.heel ?? null,
      boot: seed.boot ?? null,
      materials: { items: seed.materials },
      weight_grams_pair: seed.weight,
      repairability_score: seed.repairability,
      test_metrics: { metrics: seed.metrics },
      is_made_to_order: seed.made_to_order ?? false,
      lead_time_days: seed.made_to_order ? 21 : null,
    })
    await link.create({
      [Modules.PRODUCT]: { product_id: product.id },
      [PRODUCT_TECH_MODULE]: { product_tech_id: tech.id },
    })
  }

  // ── Stok ─────────────────────────────────────────────────────────────
  const skus = created.flatMap((p) => (p.variants ?? []).flatMap((v) => (v.sku ? [v.sku] : [])))
  const { data: items } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku", "location_levels.location_id"],
    filters: { sku: skus },
  })
  const needLevels = items.filter(
    (i) => !(i.location_levels ?? []).some((l) => l?.location_id === locationId),
  )
  if (needLevels.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: needLevels.map((i, idx) => ({
          inventory_item_id: i.id,
          location_id: locationId!,
          stocked_quantity: 4 + ((idx * 7) % 21),
        })),
      },
    })
  }

  // ── Fiyat geçmişi (DEMO senaryoları dahil) ───────────────────────────
  const now = Date.now()
  const entries = created.flatMap((product) => {
    const seed = PRODUCTS.find((p) => p.handle === product.handle)!
    const steps = seed.history ?? [{ daysAgo: 60, price: seed.price }]
    return (product.variants ?? []).flatMap((v) =>
      steps.map((step, i) => {
        const next = steps[i + 1]
        return {
          variant_id: v.id,
          currency_code: "try",
          amount: step.price,
          valid_from: new Date(now - step.daysAgo * DAY_MS),
          valid_to: next ? new Date(now - next.daysAgo * DAY_MS) : null,
        }
      }),
    )
  })
  await history.createPriceHistoryEntries(entries)
  logger.info(`${entries.length} fiyat geçmişi kaydı oluşturuldu.`)

  await seedWorkshop(container)

  logger.info(
    `ARION seed tamamlandı: ${CATEGORIES.length} kategori, ${LASTS.length} kalıp, ${created.length} ürün, ${skus.length} varyant.`,
  )
}
