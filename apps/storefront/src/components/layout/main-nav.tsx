"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { useEffect, useId, useState } from "react"
import { useParams } from "next/navigation"
import { Link, usePathname } from "@/i18n/navigation"
import type { AppPathname } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LanguageSwitcher } from "./language-switcher"

// Kadın (yalnızca topuklu) · Erkek (Salon) · Çocuk ayrı dünyalar (DECISIONS #070)
type Item = { key: "women" | "men" | "kids" | "fitTwin" | "atelier" | "about"; href: AppPathname; kategori?: string }
const ITEMS: ReadonlyArray<Item> = [
  { key: "women", href: "/koleksiyon/[kategori]", kategori: "topuklu" },
  { key: "men", href: "/koleksiyon/[kategori]", kategori: "erkek" },
  { key: "kids", href: "/koleksiyon/[kategori]", kategori: "cocuk" },
  { key: "fitTwin", href: "/ayak-ikizi" },
  { key: "atelier", href: "/atolye" },
  { key: "about", href: "/hakkimizda" },
]

/** Masaüstü mega menü içeriği (DECISIONS #083): kategoriler + öne çıkan ürünler */
type MegaLink = { label: "allWomen" | "allMen" | "classic" | "boots" | "sneakers"; kategori: string }
type MegaProduct = { slug: string; name: string; src: string }
const MEGA: Partial<Record<Item["key"], { links: MegaLink[]; products: MegaProduct[] }>> = {
  women: {
    links: [{ label: "allWomen", kategori: "topuklu" }],
    products: [
      { slug: "artemis-topuklu-cizme", name: "Artemis Topuklu Çizme", src: "/products/artemis-topuklu-cizme.webp" },
      { slug: "aurea-slingback", name: "Aurea Slingback", src: "/products/aurea-slingback.webp" },
      { slug: "selene-stiletto", name: "Selene Stiletto", src: "/products/selene-stiletto.webp" },
    ],
  },
  men: {
    links: [
      { label: "allMen", kategori: "erkek" },
      { label: "classic", kategori: "klasik" },
      { label: "boots", kategori: "kislik-bot" },
      { label: "sneakers", kategori: "sneaker" },
    ],
    products: [
      { slug: "adrastus-oxford", name: "Adrastus Oxford", src: "/products/adrastus-oxford.webp" },
      { slug: "castor-loafer", name: "Castor Loafer", src: "/products/castor-loafer.webp" },
      { slug: "herakles-chelsea", name: "Herakles Chelsea", src: "/products/herakles-chelsea.webp" },
    ],
  },
}

export function MainNav() {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const params = useParams<{ kategori?: string }>()
  const [open, setOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div className="flex items-center md:static">
      <button
        type="button"
        className="order-last inline-flex min-h-11 items-center gap-2 px-3 text-sm md:hidden"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true" className="flex w-5 flex-col gap-1.5">
          <span
            className={cn(
              "h-0.5 w-full rounded bg-white transition-transform",
              open && "translate-y-[4px] rotate-45",
            )}
          />
          <span
            className={cn(
              "h-0.5 w-full rounded bg-white transition-transform",
              open && "-translate-y-[4px] -rotate-45",
            )}
          />
        </span>
        <span className="max-sm:sr-only">{open ? t("menuClose") : t("menuOpen")}</span>
      </button>

      <nav
        id={menuId}
        aria-label={t("primary")}
        className={cn(
          "md:static md:block md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none",
          open
            ? "absolute inset-x-0 top-full border-b border-chalk/10 bg-void p-4"
            : "hidden",
        )}
      >
        <ul className="flex flex-col md:flex-row md:items-center md:gap-1">
          {ITEMS.map((item) => {
            const active = item.kategori ? params.kategori === item.kategori : pathname === item.href
            const mega = MEGA[item.key]
            return (
              <li key={item.key} className={cn(mega && "group/mega md:flex md:h-16 md:items-center")}>
                <Link
                  href={
                    item.kategori
                      ? { pathname: "/koleksiyon/[kategori]", params: { kategori: item.kategori } }
                      : (item.href as Exclude<AppPathname, `${string}[${string}`>)
                  }
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "relative block px-4 py-3 text-lg md:px-3 md:py-2 md:text-[0.78rem] md:font-medium md:tracking-[0.12em] md:uppercase",
                    "text-chalk/80 transition-colors hover:text-chalk",
                    // Etkin sayfa: hap dolgu yerine ince alt çizgi
                    "after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-ember after:transition-transform hover:after:scale-x-100",
                    active && "text-chalk after:scale-x-100",
                  )}
                >
                  {t(item.key)}
                </Link>
                {mega ? (
                  // Yalnızca masaüstü; üzerine gelince ya da klavye odağında açılır
                  <div className="pointer-events-none absolute inset-x-0 top-full hidden border-b border-chalk/10 bg-void/97 opacity-0 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)] backdrop-blur-md transition-opacity duration-200 group-focus-within/mega:pointer-events-auto group-focus-within/mega:opacity-100 group-hover/mega:pointer-events-auto group-hover/mega:opacity-100 md:block">
                    <div className="mx-auto grid max-w-[1440px] grid-cols-[14rem_1fr] gap-10 px-8 py-8">
                      <ul className="flex flex-col gap-3 border-r border-chalk/10 pr-8">
                        {mega.links.map((l) => (
                          <li key={l.kategori}>
                            <Link
                              href={{ pathname: "/koleksiyon/[kategori]", params: { kategori: l.kategori } }}
                              className="font-display text-xl italic text-chalk/85 hover:text-ember"
                            >
                              {t(`mega.${l.label}`)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <ul className="grid grid-cols-3 gap-5">
                        {mega.products.map((p) => (
                          <li key={p.src}>
                            <Link href={{ pathname: "/urun/[slug]", params: { slug: p.slug } }} className="group/p block">
                              <span className="relative block aspect-[4/3] overflow-hidden rounded-[4px] bg-void">
                                <Image src={p.src} alt="" fill sizes="20vw" className="object-cover object-[50%_62%] transition-transform duration-700 group-hover/p:scale-[1.04]" />
                              </span>
                              <span className="mt-2 block text-[0.72rem] font-medium tracking-[0.12em] text-chalk/85 uppercase group-hover/p:text-chalk">
                                {p.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
        <LanguageSwitcher className="mt-3 border-t border-white/15 pt-3 lg:hidden" />
      </nav>
    </div>
  )
}
