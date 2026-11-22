import { getTranslations } from "next-intl/server"
import { ManeMark } from "@/components/brand/mane-mark"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

/** Henüz yazılmamış bölümler için dürüst yer tutucu (kırık link yerine). */
export async function ComingSoon({ title, body }: { title: string; body: string }) {
  const t = await getTranslations("placeholder")
  return (
    <section className="relative -mt-[76px] overflow-hidden pt-[76px]">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="orb orb-tide -top-20 right-0 size-[440px] opacity-60" />
        <div className="orb orb-ember bottom-0 left-0 size-[380px] opacity-45" />
        <div className="tech-grid absolute inset-0" />
      </div>
      <div className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-8 md:py-36">
        <div className="glass max-w-3xl rounded-[4px] p-8 sm:p-12">
          <p className="eyebrow inline-flex items-center gap-2 text-moss">
            <ManeMark className="size-5" strokeWidth={5} />
            {t("eyebrow")}
          </p>
          <h1 className="condensed mt-5 text-display">{title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-smoke">{body}</p>
          <Link href="/" className={buttonClass({ variant: "light", className: "mt-10" })}>
            {t("back")}
          </Link>
        </div>
      </div>
    </section>
  )
}
