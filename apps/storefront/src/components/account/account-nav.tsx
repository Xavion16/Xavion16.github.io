import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

const ITEMS = [
  { href: "/hesabim", key: "overview" },
  { href: "/hesabim/izinlerim", key: "permissions" },
  { href: "/hesabim/veri-taleplerim", key: "dataRequests" },
] as const

export async function AccountNav({ current }: { current: (typeof ITEMS)[number]["href"] }) {
  const t = await getTranslations("shop.account.nav")
  return (
    <nav aria-label={t("label")} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-2 py-2">
        {ITEMS.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              aria-current={current === i.href ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-[2px] border border-white/20 px-5 text-sm font-semibold whitespace-nowrap",
                current === i.href ? "bg-white text-ink" : "hover:bg-white/10",
              )}
            >
              {t(i.key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
