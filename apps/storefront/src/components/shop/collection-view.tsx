import type { HttpTypes } from "@medusajs/types"
import { getLocale, getTranslations } from "next-intl/server"
import { ShoeDrawing } from "@/components/illustrations/shoe-drawings"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import { CATEGORY_GRADIENT, isCategoryKey } from "@/lib/category-style"
import { getPriceReferences, listCategories, listProducts } from "@/lib/medusa/catalog"
import { cn } from "@/lib/utils"
import { ProductCard } from "./product-card"

export type CollectionFilters = { numara?: string; genislik?: string }

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

  const categories = await listCategories(locale)
  const current = categoryHandle ? categories.find((c) => c.handle === categoryHandle) : undefined
  const all = await listProducts({ categoryId: current?.id })
  const products = all.filter((p) => matches(p, filters))
  const refs = await getPriceReferences(products.map((p) => p.id))

  const sizes = [...new Set(all.flatMap((p) => optionValues(p, "Numara")))]
    .map(Number)
    .sort((a, b) => a - b)
    .map(String)
  const categoryKey = current && isCategoryKey(current.handle) ? current.handle : null

  return (
    <>
      <header className="relative -mt-[76px] overflow-hidden pt-[76px]">
        <div aria-hidden="true" className="absolute inset-0">
          {categoryKey ? (
            <div className={`absolute inset-0 bg-gradient-to-br opacity-50 ${CATEGORY_GRADIENT[categoryKey]}`} />
          ) : (
            <div className="orb orb-ember -top-24 right-0 size-[460px] opacity-60" />
          )}
          <div className="tech-grid absolute inset-0 [mask-image:linear-gradient(black,transparent)]" />
        </div>
        <div className="relative mx-auto grid max-w-[1440px] items-end gap-8 px-4 pt-16 pb-12 sm:px-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow text-ember">{t("eyebrow")}</p>
            <h1 className="condensed mt-3 text-display">{current ? current.name : t("title")}</h1>
            {categoryKey ? (
              <div className="glass mt-6 max-w-2xl rounded-3xl p-5">
                <p className="text-sm font-bold text-white">
                  {t("manifesto")} · {th(`categories.items.${categoryKey}.manifesto`)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-smoke">{tm(categoryKey)}</p>
              </div>
            ) : null}
          </div>
          {categoryKey ? (
            <ShoeDrawing category={categoryKey} className="hidden w-full max-w-md justify-self-end text-white md:block" />
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-8">
        {/* Kategori sekmeleri */}
        <nav aria-label={t("eyebrow")} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-2 py-2">
            <li>
              <Link
                href="/koleksiyon"
                aria-current={!current ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold whitespace-nowrap",
                  !current ? "bg-white text-ink" : "hover:bg-white/10",
                )}
              >
                {t("all")}
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={{ pathname: "/koleksiyon/[kategori]", params: { kategori: c.handle } }}
                  aria-current={current?.id === c.id ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold whitespace-nowrap",
                    current?.id === c.id ? "bg-white text-ink" : "hover:bg-white/10",
                  )}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Filtreler: JS gerektirmeyen GET formu */}
        <form method="get" className="glass mt-4 flex flex-wrap items-end gap-4 rounded-3xl p-4">
          <label className="flex flex-col gap-1 text-xs font-semibold text-smoke">
            {t("size")}
            <select
              name="numara"
              defaultValue={filters.numara ?? ""}
              className="min-h-11 rounded-full border border-white/20 bg-carbon px-4 text-sm text-white"
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
          <button type="submit" className={buttonClass({ variant: "light" })}>
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

        {products.length === 0 ? (
          <p className="mt-16 text-center text-lg text-smoke">{t("empty")}</p>
        ) : (
          <ul className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} reference={refs[p.id]} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
