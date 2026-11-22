import type { HttpTypes } from "@medusajs/types"
import { getLocale, getTranslations } from "next-intl/server"
import { FitGrid } from "@/components/fit/fit-grid"
import Image from "next/image"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import { isCategoryKey } from "@/lib/category-style"
import { productShot } from "@/lib/imagery"
import { getFitCatalog } from "@/lib/fit/catalog"
import { getPriceReferences, listCategories, listProducts } from "@/lib/medusa/catalog"
import { CATEGORY_GROUPS, isGroupKey } from "@/lib/site"
import { cn } from "@/lib/utils"
import { ProductCard } from "./product-card"

export type CollectionFilters = { numara?: string; genislik?: string; uyum?: string }

function optionValues(p: HttpTypes.StoreProduct, title: string): string[] {
  return p.options?.find((o) => o.title === title)?.values?.map((v) => v.value) ?? []
}

function matches(p: HttpTypes.StoreProduct, f: CollectionFilters): boolean {
  if (f.numara && !optionValues(p, "Numara").includes(f.numara)) return false
  if (f.genislik === "W" && !optionValues(p, "Genişlik").includes("W")) return false
  return true
}

export async function CollectionView({
  categoryHandle,
  filters,
}: {
  categoryHandle?: string
  filters: CollectionFilters
}) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations("shop.collection")
  const th = await getTranslations("home")
  const tm = await getTranslations("manifesto.categories")

  // Starter seed kategorileri (Shirts, Merch…) gizlenir; yalnızca ARION ayakkabı kategorileri
  const categories = (await listCategories(locale)).filter((c) => isCategoryKey(c.handle))
  const group = isGroupKey(categoryHandle) ? categoryHandle : null
  const current = categoryHandle && !group ? categories.find((c) => c.handle === categoryHandle) : undefined
  const tg = await getTranslations("shop.collection.groups")
  const all = group
    ? (
        await Promise.all(
          CATEGORY_GROUPS[group].map((h) => {
            const c = categories.find((x) => x.handle === h)
            return c ? listProducts({ categoryId: c.id }) : Promise.resolve([])
          }),
        )
      ).flat()
    : await listProducts({ categoryId: current?.id })
  const products = all.filter((p) => matches(p, filters))
  const refs = await getPriceReferences(products.map((p) => p.id))
  const fitCatalog = await getFitCatalog()

  const sizes = [...new Set(all.flatMap((p) => optionValues(p, "Numara")))]
    .map(Number)
    .sort((a, b) => a - b)
    .map(String)
  const categoryKey = group ? "klasik" : current && isCategoryKey(current.handle) ? current.handle : null
  // Başlık görseli: kategorinin öncü ürününün stüdyo görseli (DECISIONS #080) — katalogla aynı dil
  const HEADER_SHOT: Record<string, string> = {
    topuklu: "selene-stiletto",
    erkek: "adrastus-oxford",
    klasik: "castor-loafer",
    "kislik-bot": "olympos-dag-botu",
    sneaker: "zephyros-kosu",
    cocuk: "iris-cirtli",
  }
  const headerShot = productShot(HEADER_SHOT[group ?? categoryKey ?? ""] ?? "herakles-chelsea")

  return (
    <>
      <header className="relative -mt-[76px] overflow-hidden pt-[76px]">
        {headerShot ? (
          <div className="absolute inset-y-0 right-0 w-full md:w-[52%]">
            <Image src={headerShot} alt="" fill priority sizes="(min-width: 768px) 52vw, 100vw" className="object-cover object-[50%_62%] opacity-50 md:opacity-100" />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-void)_0%,transparent_45%),linear-gradient(0deg,var(--color-void)_0%,transparent_40%)]" />
          </div>
        ) : null}
        <div className="relative mx-auto max-w-[1440px] px-4 pt-24 pb-14 sm:px-8 md:pt-36 md:pb-20">
          <p className="eyebrow text-ember">{t("eyebrow")}</p>
          <h1 className="condensed chrome-text mt-3 text-mega">{group ? tg(`${group}.name`) : current ? current.name : t("title")}</h1>
          {group ? (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-smoke">{tg(`${group}.manifesto`)}</p>
          ) : categoryKey ? (
            <div className="glass mt-6 max-w-2xl rounded-[4px] p-5">
              <p className="text-sm font-bold text-white">
                {t("manifesto")} · {th(`categories.items.${categoryKey}.manifesto`)}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-smoke">{tm(categoryKey)}</p>
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-8">
        {/* Kategori sekmeleri + filtreler; sayfayla birlikte kayar, sabit değil (DECISIONS #095) */}
        <div className="relative z-30 -mx-4 border-b border-chalk/10 bg-void/92 px-4 backdrop-blur-md sm:-mx-8 sm:px-8" data-testid="filter-bar">
        <nav aria-label={t("eyebrow")} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-6 pt-2">
            <li>
              <Link
                href="/koleksiyon"
                aria-current={!current && !group ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center border-b-2 text-[0.78rem] font-medium tracking-[0.12em] whitespace-nowrap uppercase transition-colors",
                  !current && !group ? "border-ember text-chalk" : "border-transparent text-chalk/60 hover:text-chalk",
                )}
              >
                {t("all")}
              </Link>
            </li>
            <li>
              <Link
                href={{ pathname: "/koleksiyon/[kategori]", params: { kategori: "erkek" } }}
                aria-current={group === "erkek" ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center border-b-2 text-[0.78rem] font-medium tracking-[0.12em] whitespace-nowrap uppercase transition-colors",
                  group === "erkek" ? "border-tide text-chalk" : "border-transparent text-tide/80 hover:text-tide",
                )}
              >
                {tg("erkek.tab")}
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={{ pathname: "/koleksiyon/[kategori]", params: { kategori: c.handle } }}
                  aria-current={current?.id === c.id ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center border-b-2 text-[0.78rem] font-medium tracking-[0.12em] whitespace-nowrap uppercase transition-colors",
                    current?.id === c.id ? "border-ember text-chalk" : "border-transparent text-chalk/60 hover:text-chalk",
                  )}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Filtreler: JS gerektirmeyen GET formu ("Bana uyanlar" tarayıcıda, FitGrid) */}
        <form method="get" className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3">
          <label className="flex items-center gap-2 text-[0.72rem] font-medium tracking-[0.12em] text-smoke uppercase">
            {t("size")}
            <select
              name="numara"
              defaultValue={filters.numara ?? ""}
              className="min-h-10 rounded-[2px] border border-chalk/20 bg-carbon px-3 text-sm tracking-normal text-chalk normal-case"
            >
              <option value="">{t("anySize")}</option>
              {sizes.map((s) => (
                <option key={s} value={s}>
                  EU {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              name="genislik"
              value="W"
              defaultChecked={filters.genislik === "W"}
              className="size-5 accent-[var(--color-ember)]"
            />
            {t("wide")}
          </label>
          <button type="submit" className={buttonClass({ variant: "glass" })}>
            {t("apply")}
          </button>
          {filters.numara || filters.genislik ? (
            <Link
              href={current ? { pathname: "/koleksiyon/[kategori]", params: { kategori: current.handle } } : "/koleksiyon"}
              className="min-h-11 content-center px-2 text-sm text-smoke underline underline-offset-4 hover:text-white"
            >
              {t("clear")}
            </Link>
          ) : null}
          <p className="ml-auto text-sm text-smoke" aria-live="polite">
            {t("results", { count: products.length })}
          </p>
        </form>
        </div>

        {products.length === 0 ? (
          <p className="mt-16 text-center text-lg text-smoke">{t("empty")}</p>
        ) : (
          <FitGrid
            catalog={fitCatalog}
            initialFitsMe={filters.uyum === "1"}
            items={products.map((p) => ({
              handle: p.handle,
              node: <ProductCard product={p} reference={refs[p.id]} />,
              sizes: optionValues(p, "Numara"),
              wide: optionValues(p, "Genişlik").includes("W"),
            }))}
          />
        )}
      </div>
    </>
  )
}
