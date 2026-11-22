import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getFormatter, getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { ShoeDrawing } from "@/components/illustrations/shoe-drawings"
import { ProductExperience } from "@/components/product/product-experience"
import { Price } from "@/components/shop/price"
import { ProductCard } from "@/components/shop/product-card"
import { type PickerVariant } from "@/components/shop/variant-picker"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { CATEGORY_GRADIENT, isCategoryKey } from "@/lib/category-style"
import { CATEGORY_PRIORITY, CONTRAST, METRIC_KEYS } from "@/lib/durability"
import {
  getPriceReferences,
  getProduct,
  getProductDetails,
  listProducts,
  minPrice,
  productDescription,
  productNameStory,
  productTitle,
} from "@/lib/medusa/catalog"
import { localizedAlternates } from "@/lib/metadata"
import { productGallery } from "@/lib/imagery"

type Props = PageProps<"/[locale]/urun/[slug]">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const product = await getProduct(slug)
  if (!product) return {}
  return {
    title: productTitle(product, locale),
    description: productDescription(product, locale),
    alternates: localizedAlternates({ pathname: "/urun/[slug]", params: { slug } }, locale),
  }
}

/** Yaklaşık yetişkin numara karşılıkları (gösterim amaçlı). */
const toUk = (eu: number) => Math.round((eu - 33.5) * 2) / 2
const toUs = (eu: number) => toUk(eu) + 1

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const [product, details] = await Promise.all([getProduct(slug), getProductDetails(slug)])
  if (!product) notFound()

  const t = await getTranslations("shop.product")
  const format = await getFormatter()
  const handle = product.categories?.[0]?.handle
  const category = isCategoryKey(handle) ? handle : "sneaker"
  const categoryName = product.categories?.[0]?.name ?? ""

  // Varyant seçici verisi
  const optionTitleById = new Map((product.options ?? []).map((o) => [o.id, o.title]))
  const ORDER = ["Renk", "Numara", "Genişlik"]
  const options = [...(product.options ?? [])]
    .sort((a, b) => ORDER.indexOf(a.title) - ORDER.indexOf(b.title))
    .map((o) => ({
    title: o.title,
    values: (o.values ?? [])
      .map((v) => v.value)
      .sort((a, b) => (o.title === "Numara" ? Number(a) - Number(b) : 0)),
  }))
  const variants: PickerVariant[] = (product.variants ?? []).map((v) => ({
    id: v.id,
    options: Object.fromEntries(
      (v.options ?? []).flatMap((ov) => {
        const title = ov.option?.title ?? (ov.option_id ? optionTitleById.get(ov.option_id) : undefined)
        return title ? [[title, ov.value]] : []
      }),
    ),
    stock: v.manage_inventory === false ? null : (v.inventory_quantity ?? null),
  }))

  const amount = minPrice(product)
  const refs = Object.values(details?.price_references ?? {})
  const cheapest = refs.sort((a, b) => a.currentPrice - b.currentPrice)[0] ?? null

  const tech = details?.tech
  const gallery = productGallery(product.handle, options.find((o) => o.title === "Renk")?.values ?? [])
  const tc = await getTranslations("shop.collection")
  const priceLabel = amount != null ? format.number(amount, { style: "currency", currency: "TRY", maximumFractionDigits: 0 }) : null
  const last = details?.last
  const metrics = tech?.test_metrics.metrics ?? []
  const isKids = category === "cocuk"
  const sizeRows = (last?.size_table.rows ?? []).filter((r) =>
    options.find((o) => o.title === "Numara")?.values.includes(String(r.eu_size)),
  )

  const related = (await listProducts({ categoryId: product.categories?.[0]?.id }))
    .filter((p) => p.id !== product.id)
    .slice(0, 3)
  const relatedRefs = await getPriceReferences(related.map((p) => p.id))

  // Dinamik anahtarlar: sözlükten güvenli okuma (bilinmeyen değer olduğu gibi gösterilir)
  const pm = (await getMessages()).shop.product
  const units: Record<string, string> = pm.units
  const shanks: Record<string, string> = pm.shankValues
  const toes: Record<string, string> = pm.toeShapes
  const metricLabels: Record<string, string> = pm.metrics
  const meanings: Record<string, string> = pm.durability.meanings
  const td = await getTranslations("shop.product.durability")
  const tCat = await getTranslations("home.categories.items")
  const contrast = CONTRAST[category]
  const unit = (u: string) => units[u] ?? u
  const tp = await getTranslations("shop.product.page")
  const tv = await getTranslations("shop.product.viewer")
  const layerMsgs: Record<string, { name: string; desc: string }> = pm.viewer.layers
  const layerLabels = Object.fromEntries(Object.entries(layerMsgs).map(([k, v]) => [k, v.name]))
  const layerDescs = Object.fromEntries(Object.entries(layerMsgs).map(([k, v]) => [k, v.desc]))

  return (
    <>
      <nav aria-label="breadcrumb" className="mx-auto max-w-[1600px] px-4 pt-6 text-sm text-smoke sm:px-8">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/koleksiyon" className="hover:text-white">
              {(await getTranslations("shop.collection"))("eyebrow")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={{ pathname: "/koleksiyon/[kategori]", params: { kategori: category } }} className="hover:text-white">
              {categoryName}
            </Link>
          </li>
        </ol>
      </nav>

      <ProductExperience
        category={category}
        name={productTitle(product, locale)}
        // Stüdyo görselinin fonu sahnenin zemini olur
        gradient={gallery ? "from-[#0a0908] to-[#0a0908]" : CATEGORY_GRADIENT[category]}
        gallery={gallery}
        alts={{
          side: tc("shotAlt", { name: productTitle(product, locale) }),
          top: tc("shotTopAlt", { name: productTitle(product, locale) }),
        }}
        priceLabel={priceLabel}
        fallback={
          <ShoeDrawing
            category={category}
            className="float-y relative w-[78%] -rotate-6 text-white drop-shadow-[0_0_30px_rgb(255_255_255/0.35)]"
          />
        }
        header={
          <>
            <p className="eyebrow text-ember">{categoryName}</p>
            <h1 className="condensed mt-3 text-headline">{productTitle(product, locale)}</h1>
            {productNameStory(product, locale) ? (
              <p className="mt-2 font-display text-lg text-ember/90 italic" data-testid="name-story">
                {productNameStory(product, locale)}
              </p>
            ) : null}
            {locale === "tr" && product.subtitle ? <p className="mt-2 text-lg text-smoke">{product.subtitle}</p> : null}
            <Price amount={amount} reference={cheapest} size="lg" className="mt-6" />
            <p className="mt-5 leading-relaxed text-smoke">{productDescription(product, locale)}</p>
          </>
        }
        footer={
          <ul className="mt-6 space-y-2 text-sm text-smoke">
            {tech?.is_made_to_order && tech.lead_time_days ? (
              <li className="font-semibold text-white">{t("madeToOrder", { days: tech.lead_time_days })}</li>
            ) : null}
            <li>{t("returns")}</li>
            <li>{t("shippingInfo")}</li>
          </ul>
        }
        options={options}
        variants={variants}
        fit={
          last
            ? {
                last: { code: last.code, category: last.category, rows: last.size_table.rows },
                sizes: (options.find((o) => o.title === "Numara")?.values ?? []).map(Number),
                widths: (options.find((o) => o.title === "Genişlik")?.values ?? ["M"]).filter(
                  (w): w is "N" | "M" | "W" => w === "N" || w === "M" || w === "W",
                ),
              }
            : null
        }
      />

      {/* Bu sayfada */}
      <nav aria-label={tp("onThisPage")} className="sticky top-[76px] z-20 border-y border-white/10 bg-void/85 backdrop-blur">
        <ul className="mx-auto flex max-w-[1600px] gap-2 overflow-x-auto px-4 py-3 sm:px-8">
          {[
            ["anatomi", tp("anatomy")],
            ...(tech ? [["teknik", t("sections.tech")], ["dayaniklilik", t("sections.durability")]] : []),
            ...(last ? [["kalip", t("sections.last")]] : []),
            ["omur", tp("lifetime")],
          ].map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="inline-flex min-h-11 items-center rounded-[2px] border border-white/15 px-4 text-sm font-semibold whitespace-nowrap hover:bg-white hover:text-ink">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Anatomi hikâyesi */}
      <section id="anatomi" aria-labelledby="anatomi-baslik" className="scroll-mt-36 mx-auto max-w-[1600px] px-4 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow text-ember">{tp("anatomy")}</p>
            <h2 id="anatomi-baslik" className="condensed mt-3 text-headline">{tv(`stories.${category}.title`)}</h2>
            <p className="mt-4 text-smoke">{tp("anatomyLead")}</p>
            <ul className="mt-6 space-y-3">
              {(tv.raw(`stories.${category}.points`) as string[]).map((p) => (
                <li key={p} className="flex gap-3 text-white/90">
                  <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-ember" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {Object.keys(layerLabels)
              .filter((k) => (STAGE_LAYERS[category] ?? []).includes(k))
              .map((k) => (
                <li key={k} className="glass rounded-[4px] p-5">
                  <p className="font-bold text-white">{layerLabels[k]}</p>
                  <p className="mt-2 text-sm leading-relaxed text-smoke">{layerDescs[k]}</p>
                </li>
              ))}
          </ul>
        </div>
      </section>

      {tech ? (
        <div className="bg-chalk text-ink">
          <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-20 sm:px-8 lg:grid-cols-2">
            {/* Teknik yapı */}
            <section id="teknik-bolum" aria-labelledby="teknik" className="scroll-mt-36 rounded-[4px] bg-white p-6 sm:p-8">
              <h2 id="teknik" className="condensed scroll-mt-40 text-4xl">{t("sections.tech")}</h2>
              <dl className="mt-6 divide-y divide-ink/10">
                <Row label={t("construction.label")} value={t(`construction.${tech.construction}`)} />
                {tech.heel ? (
                  <>
                    <Row label={t("heelHeight")} value={`${tech.heel.height_mm} mm`} />
                    <Row
                      label={t("shank")}
                      value={shanks[tech.heel.shank] ?? tech.heel.shank}
                    />
                  </>
                ) : null}
                {tech.boot ? (
                  <>
                    <Row label={t("waterproof")} value={`${tech.boot.waterproof_hours} ${unit("saat")}`} />
                    <Row label={t("lugDepth")} value={`${tech.boot.lug_depth_mm} mm`} />
                    <Row label={t("insulation")} value={tech.boot.insulation_rating} />
                  </>
                ) : null}
                <Row label={t("weight")} value={`${format.number(tech.weight_grams_pair)} ${unit("g/çift")}`} />
                <Row label={t("repairability")} value={`${tech.repairability_score}/10`} />
              </dl>
              <h3 className="mt-8 text-sm font-bold">{t("materials")}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {tech.materials.items.map((m) => (
                  <li key={m.part} className="flex flex-wrap justify-between gap-2">
                    <span className="font-semibold">{m.part}</span>
                    <span className="text-ink-soft">
                      {m.material} · {m.origin}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Dayanıklılık Kartı */}
            <section aria-labelledby="dayaniklilik" className="rounded-[4px] bg-ink p-6 text-white sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <h2 id="dayaniklilik" className="condensed scroll-mt-40 text-4xl">{t("sections.durability")}</h2>
                <span className="demo-badge mt-2 text-ember">DEMO</span>
              </div>
              <ul className="mt-6 space-y-3">
                {metrics.map((m) => (
                  <li key={m.key} className="rounded-[4px] border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm font-semibold">
                        {metricLabels[m.key] ?? m.key}
                      </span>
                      <span className="condensed text-3xl text-moss">
                        {format.number(m.value)}{" "}
                        {/* Birim büyük harfe çevrilmez: "μ" büyük harfte Yunanca "M" olur */}
                        <span className="font-sans text-base font-semibold tracking-normal text-smoke normal-case">
                          {unit(m.unit)}
                        </span>
                      </span>
                    </div>
                    {meanings[m.key] ? (
                      <p className="mt-1 text-sm text-smoke">
                        <span className="sr-only">{td("whatItMeans")} </span>
                        {meanings[m.key]}
                      </p>
                    ) : null}
                    <details className="mt-2 text-sm text-smoke">
                      <summary className="cursor-pointer font-semibold text-white/90 hover:text-white">
                        {t("howMeasured")}
                      </summary>
                      <p className="mt-2 leading-relaxed">{m.method}</p>
                    </details>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-smoke">{t("demoNote")}</p>

              {/* Kategoriler arası karşılaştırma */}
              <div className="mt-6 rounded-[4px] border border-white/10 p-4" data-testid="durability-compare">
                <h3 className="text-sm font-bold">{td("compareTitle")}</h3>
                <p className="mt-1 text-xs text-smoke">{td("compareLead")}</p>
                <table className="mt-3 w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-smoke">
                      <th scope="col" className="py-1 font-semibold">
                        <span className="sr-only">{t("sections.durability")}</span>
                      </th>
                      <th scope="col" className="py-1 font-semibold">{tCat(`${category}.name`)}</th>
                      <th scope="col" className="py-1 font-semibold">{tCat(`${contrast}.name`)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {METRIC_KEYS.map((k) => (
                      <tr key={k} className="border-t border-white/10">
                        <th scope="row" className="py-1.5 pr-2 font-normal text-white/90">{metricLabels[k] ?? k}</th>
                        {[CATEGORY_PRIORITY[category][k], CATEGORY_PRIORITY[contrast][k]].map((v, i) => (
                          <td key={i} className="py-1.5">
                            <span
                              role="img"
                              aria-label={td(`priority.${v === 3 ? "high" : v === 2 ? "medium" : "low"}`)}
                              className="inline-flex gap-1"
                            >
                              {[1, 2, 3].map((d) => (
                                <span
                                  key={d}
                                  aria-hidden="true"
                                  className={`size-2 rounded-full ${d <= v ? (i === 0 ? "bg-moss" : "bg-tide") : "bg-white/15"}`}
                                />
                              ))}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Kalıp + numara tablosu */}
            {last ? (
              <section aria-labelledby="kalip" className="rounded-[4px] bg-white p-6 sm:p-8 lg:col-span-2">
                <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
                  <div>
                    <h2 id="kalip" className="condensed scroll-mt-40 text-4xl">
                      {t("sections.last")} · {last.name}
                    </h2>
                    <dl className="mt-6 divide-y divide-ink/10">
                      <Row label={t("lastCode")} value={last.code} mono />
                      <Row
                        label={t("toeShape")}
                        value={toes[last.toe_shape] ?? last.toe_shape}
                      />
                    </dl>
                    {last.notes ? <p className="mt-6 text-sm leading-relaxed text-ink-soft">{last.notes}</p> : null}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{t("sections.sizeChart")}</h3>
                    <div className="mt-4 overflow-x-auto rounded-[4px] border border-ink/10">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-chalk font-mono text-xs">
                          <tr>
                            <th scope="col" className="px-3 py-2">{t("eu")}</th>
                            {!isKids ? <th scope="col" className="px-3 py-2">{t("uk")}</th> : null}
                            {!isKids ? <th scope="col" className="px-3 py-2">{t("us")}</th> : null}
                            <th scope="col" className="px-3 py-2">{t("fitting")}</th>
                            <th scope="col" className="px-3 py-2">{t("lengthMm")}</th>
                            <th scope="col" className="px-3 py-2">{t("ballWidthMm")}</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono">
                          {sizeRows.map((r) => (
                            <tr key={`${r.eu_size}-${r.width_fitting}`} className="border-t border-ink/10">
                              <th scope="row" className="px-3 py-2 font-bold">{r.eu_size}</th>
                              {!isKids ? <td className="px-3 py-2">{toUk(r.eu_size)}</td> : null}
                              {!isKids ? <td className="px-3 py-2">{toUs(r.eu_size)}</td> : null}
                              <td className="px-3 py-2">{r.width_fitting}</td>
                              <td className="px-3 py-2">{r.length_mm}</td>
                              <td className="px-3 py-2">{r.ball_width_mm}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-xs text-ink-soft">{t("chartNote")}</p>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Ömür: pasaport + tamir */}
      <section id="omur" aria-labelledby="omur-baslik" className="scroll-mt-36 mx-auto max-w-[1600px] px-4 py-20 sm:px-8">
        <div className="glass grid gap-8 rounded-[4px] p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow text-moss">{tp("lifetime")}</p>
            <h2 id="omur-baslik" className="condensed mt-3 text-headline">{tp("lifetimeTitle")}</h2>
            <p className="mt-4 max-w-xl text-smoke">{tp("lifetimeBody")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={{ pathname: "/pasaport/[kod]", params: { kod: "ARN-2026-000123" } }} className={buttonClass({})}>
                {tp("passportSample")} 
              </Link>
              <Link href="/omur-plani" className={buttonClass({ variant: "glass" })}>
                {tp("lifetimePlan")}
              </Link>
            </div>
          </div>
          {tech ? (
            <div className="self-center">
              <p className="text-sm font-semibold text-smoke">{tp("repairability")}</p>
              <p className="condensed mt-2 text-7xl text-moss">
                {tech.repairability_score}
                <span className="text-3xl text-smoke">/10</span>
              </p>
              <div className="mt-3 h-2 rounded-full bg-white/10" aria-hidden="true">
                <div className="h-2 rounded-full bg-moss" style={{ width: `${tech.repairability_score * 10}%` }} />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {related.length ? (
        <section aria-labelledby="ilgili" className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8">
          <h2 id="ilgili" className="condensed text-headline">{t("related")}</h2>
          <ul className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} reference={relatedRefs[p.id]} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 py-3 text-sm">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={mono ? "font-mono font-semibold" : "font-semibold"}>{value}</dd>
    </div>
  )
}


/** Kategori modelinde bulunan katmanlar (scripts/lib/sdf-shoe.ts ile aynı) */
const STAGE_LAYERS: Record<string, string[]> = {
  sneaker: ["outsole", "midsole", "insole", "lining", "upper", "tongue", "laces", "accent"],
  klasik: ["outsole", "midsole", "shank", "insole", "lining", "upper", "tongue", "laces", "heel"],
  "kislik-bot": ["outsole", "midsole", "shank", "insole", "lining", "membrane", "upper"],
  topuklu: ["outsole", "midsole", "shank", "insole", "lining", "upper", "heel"],
  cocuk: ["outsole", "midsole", "insole", "lining", "upper", "tongue", "straps"],
}
