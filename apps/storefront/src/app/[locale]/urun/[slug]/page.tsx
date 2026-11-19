import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getFormatter, getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { ShoeDrawing } from "@/components/illustrations/shoe-drawings"
import { Price } from "@/components/shop/price"
import { ProductCard } from "@/components/shop/product-card"
import { VariantPicker, type PickerVariant } from "@/components/shop/variant-picker"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { CATEGORY_GRADIENT, isCategoryKey } from "@/lib/category-style"
import {
  getPriceReferences,
  getProduct,
  getProductDetails,
  listProducts,
  minPrice,
  productDescription,
  productTitle,
} from "@/lib/medusa/catalog"
import { localizedAlternates } from "@/lib/metadata"

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
  const unit = (u: string) => units[u] ?? u

  return (
    <>
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 pt-6 pb-20 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Görsel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="breadcrumb" className="mb-4 text-sm text-smoke">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link href="/koleksiyon" className="hover:text-white">
                  {(await getTranslations("shop.collection"))("eyebrow")}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={{ pathname: "/koleksiyon/[kategori]", params: { kategori: category } }}
                  className="hover:text-white"
                >
                  {categoryName}
                </Link>
              </li>
            </ol>
          </nav>
          <div
            className={`relative grid aspect-[4/3.4] place-items-center overflow-hidden rounded-[36px] bg-gradient-to-br ${CATEGORY_GRADIENT[category]}`}
          >
            <span aria-hidden="true" className="tech-grid absolute inset-0 opacity-60" />
            <ShoeDrawing
              category={category}
              className="float-y relative w-[84%] -rotate-6 text-white drop-shadow-[0_0_30px_rgb(255_255_255/0.35)]"
            />
            <span className="demo-badge glass absolute bottom-5 left-5 border-0 px-3 py-1 text-white">
              DEMO
            </span>
          </div>
        </div>

        {/* Bilgi + satın alma */}
        <div>
          <p className="eyebrow text-ember">{categoryName}</p>
          <h1 className="condensed mt-3 text-headline">{productTitle(product, locale)}</h1>
          {locale === "tr" && product.subtitle ? (
            <p className="mt-2 text-lg text-smoke">{product.subtitle}</p>
          ) : null}
          <Price amount={amount} reference={cheapest} size="lg" className="mt-6" />
          <p className="mt-5 leading-relaxed text-smoke">{productDescription(product, locale)}</p>

          <div className="glass mt-8 rounded-[28px] p-5 sm:p-6">
            <VariantPicker options={options} variants={variants} />
          </div>

          <ul className="mt-6 space-y-2 text-sm text-smoke">
            {tech?.is_made_to_order && tech.lead_time_days ? (
              <li className="font-semibold text-white">{t("madeToOrder", { days: tech.lead_time_days })}</li>
            ) : null}
            <li>{t("returns")}</li>
            <li>{t("shippingInfo")}</li>
          </ul>
        </div>
      </div>

      {tech ? (
        <div className="bg-chalk text-ink">
          <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-20 sm:px-8 lg:grid-cols-2">
            {/* Teknik yapı */}
            <section aria-labelledby="teknik" className="rounded-[28px] bg-white p-6 sm:p-8">
              <h2 id="teknik" className="condensed text-4xl">{t("sections.tech")}</h2>
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
            <section aria-labelledby="dayaniklilik" className="rounded-[28px] bg-ink p-6 text-white sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <h2 id="dayaniklilik" className="condensed text-4xl">{t("sections.durability")}</h2>
                <span className="demo-badge mt-2 text-ember">DEMO</span>
              </div>
              <ul className="mt-6 space-y-3">
                {metrics.map((m) => (
                  <li key={m.key} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
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
            </section>

            {/* Kalıp + numara tablosu */}
            {last ? (
              <section aria-labelledby="kalip" className="rounded-[28px] bg-white p-6 sm:p-8 lg:col-span-2">
                <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
                  <div>
                    <h2 id="kalip" className="condensed text-4xl">
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
                    <div className="mt-4 overflow-x-auto rounded-2xl border border-ink/10">
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

