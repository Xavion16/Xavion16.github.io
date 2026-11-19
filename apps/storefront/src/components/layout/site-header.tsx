import { getTranslations } from "next-intl/server"
import { Logo } from "@/components/brand/logo"
import { ArrowIcon, buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { cartItemCount, getCart } from "@/lib/medusa/cart"
import { getCustomer } from "@/lib/medusa/customer"
import { LanguageSwitcher } from "./language-switcher"
import { MainNav } from "./main-nav"

export async function SiteHeader() {
  const t = await getTranslations()
  const [cart, customer] = await Promise.all([getCart(), getCustomer()])
  const count = cartItemCount(cart)

  return (
    <>
      <a
        href="#icerik"
        className="sr-only z-[70] rounded-full bg-white px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t("nav.skip")}
      </a>

      <aside aria-label={t("demo.label")} className="bg-carbon text-smoke">
        <p className="mx-auto flex max-w-[1440px] items-center justify-center gap-3 px-4 py-2 text-center text-xs sm:px-8">
          <span className="demo-badge text-ember">{t("demo.label")}</span>
          <span>{t("demo.text")}</span>
        </p>
      </aside>

      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
        <div className="glass relative mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 rounded-full pr-2 pl-5 sm:pl-6">
          <Link href="/" aria-label={t("nav.home")} className="rounded-full py-2">
            <Logo />
          </Link>
          <MainNav />
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher className="hidden lg:block" />
            <Link
              href={customer ? "/hesabim" : "/hesabim/giris"}
              aria-label={t("shop.nav.account")}
              className="grid size-11 place-items-center rounded-full hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
              </svg>
            </Link>
            <Link
              href="/sepet"
              aria-label={t("shop.nav.cartCount", { count })}
              className="relative grid size-11 place-items-center rounded-full hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5" aria-hidden="true">
                <path d="M5 8h14l-1.2 12H6.2L5 8Z" strokeLinejoin="round" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
              </svg>
              {count > 0 ? (
                <span
                  aria-hidden="true"
                  data-testid="cart-count"
                  className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-ember px-1 text-[0.65rem] font-bold text-ink"
                >
                  {count}
                </span>
              ) : null}
            </Link>
            <Link
              href="/ayak-ikizi"
              className={buttonClass({ size: "md", className: "hidden sm:inline-flex" })}
            >
              {t("nav.fitTwin")}
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
