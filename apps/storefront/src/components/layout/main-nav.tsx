"use client"

import { useTranslations } from "next-intl"
import { useEffect, useId, useState } from "react"
import { Link, usePathname } from "@/i18n/navigation"
import type { AppPathname } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LanguageSwitcher } from "./language-switcher"

const ITEMS = [
  { href: "/koleksiyon", key: "collection" },
  { href: "/ayak-ikizi", key: "fitTwin" },
  { href: "/atolye", key: "atelier" },
  { href: "/manifesto", key: "manifesto" },
] as const satisfies ReadonlyArray<{ href: AppPathname; key: string }>

export function MainNav() {
  const t = useTranslations("nav")
  const pathname = usePathname()
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
        className="order-last inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold md:hidden"
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
        <span>{open ? t("menuClose") : t("menuOpen")}</span>
      </button>

      <nav
        id={menuId}
        aria-label={t("primary")}
        className={cn(
          "md:static md:block md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none",
          open
            ? "glass absolute inset-x-0 top-[calc(100%+0.5rem)] rounded-3xl p-4"
            : "hidden",
        )}
      >
        <ul className="flex flex-col md:flex-row md:items-center md:gap-1">
          {ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-full px-4 py-3 text-lg font-semibold md:py-2 md:text-sm",
                    "transition-colors hover:bg-white/10",
                    active && "bg-white text-ink hover:bg-white",
                  )}
                >
                  {t(item.key)}
                </Link>
              </li>
            )
          })}
        </ul>
        <LanguageSwitcher className="mt-3 border-t border-white/15 pt-3 lg:hidden" />
      </nav>
    </div>
  )
}
