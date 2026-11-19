import { getTranslations } from "next-intl/server"
import { Logo } from "@/components/brand/logo"
import { CookiePrefsButton } from "@/components/consent/cookie-consent"
import { Link } from "@/i18n/navigation"
import { LEGAL_SLUGS, legalHref } from "@/lib/site"

export async function SiteFooter() {
  const t = await getTranslations()
  const year = new Date().getFullYear()

  const linkClass =
    "inline-block py-1.5 text-smoke transition-colors hover:text-white"
  const headingClass = "text-sm font-bold tracking-wide text-white uppercase"

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-void">
      <div
        aria-hidden="true"
        className="orb orb-ember -bottom-40 -left-40 size-[420px] opacity-25"
      />
      <div className="relative mx-auto max-w-[1440px] px-4 pt-20 pb-10 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_2fr]">
          <div>
            <Logo />
            <p className="condensed mt-8 text-5xl leading-[0.9] text-white">
              {t("footer.slogan")}
            </p>
            <p className="eyebrow mt-4 text-smoke">{t("footer.tagline")}</p>
          </div>

          <div>
            <h2 className={headingClass}>{t("footer.explore")}</h2>
            <ul className="mt-5 text-sm">
              <li>
                <Link href="/koleksiyon" className={linkClass}>
                  {t("nav.collection")}
                </Link>
              </li>
              <li>
                <Link href="/ayak-ikizi" className={linkClass}>
                  {t("nav.fitTwin")}
                </Link>
              </li>
              <li>
                <Link href="/atolye" className={linkClass}>
                  {t("nav.atelier")}
                </Link>
              </li>
              <li>
                <Link href="/manifesto" className={linkClass}>
                  {t("nav.manifesto")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className={headingClass}>{t("footer.legal")}</h2>
            <ul className="mt-5 grid gap-x-8 text-sm sm:grid-cols-2">
              {LEGAL_SLUGS.map((slug) => (
                <li key={slug}>
                  <Link
                    href={legalHref(slug)}
                    className={linkClass}
                  >
                    {t(`legalPages.${slug}`)}
                  </Link>
                </li>
              ))}
              <li>
                <CookiePrefsButton
                  label={t("footer.cookiePrefs")}
                  className="mt-1 inline-flex rounded-full border border-white/25 px-4 py-2 font-semibold text-white transition-colors hover:bg-white hover:text-ink"
                />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-smoke md:flex-row md:items-center md:justify-between">
          <p>{t("footer.rights", { year })}</p>
          <p className="flex items-center gap-3">
            <span
              className="grid size-10 place-items-center rounded-lg border border-dashed border-white/30 font-mono text-[0.55rem]"
              aria-hidden="true"
            >
              QR
            </span>
            {t("footer.etbis")}
          </p>
          <p className="max-w-md">{t("footer.legalNote")}</p>
        </div>
      </div>
    </footer>
  )
}
