import { getTranslations } from "next-intl/server"
import { ArrowIcon, buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

export default async function NotFound() {
  const t = await getTranslations("notFound")
  return (
    <section className="relative -mt-[76px] overflow-hidden pt-[76px]">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="orb orb-ember top-0 right-1/4 size-[460px] opacity-55" />
        <div className="tech-grid absolute inset-0" />
      </div>
      <p
        aria-hidden="true"
        className="condensed outline-text pointer-events-none absolute inset-x-0 bottom-0 text-center text-[clamp(10rem,40vw,34rem)] leading-none"
      >
        404
      </p>
      <div className="relative mx-auto max-w-[1440px] px-4 py-28 sm:px-8 md:py-40">
        <p className="font-mono text-sm text-ember">404</p>
        <h1 className="condensed mt-4 text-display">{t("title")}</h1>
        <p className="mt-6 max-w-xl text-lg text-smoke">{t("body")}</p>
        <Link href="/" className={buttonClass({ size: "lg", className: "mt-10" })}>
          {t("back")}
          <ArrowIcon />
        </Link>
      </div>
    </section>
  )
}
