"use client"

import { useTranslations } from "next-intl"
import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react"
import { Link } from "@/i18n/navigation"
import { saveCookieChoiceAction } from "@/lib/actions/consent-actions"
import { cn } from "@/lib/utils"
import { ConsentScripts, type ClientChoice } from "./consent-scripts"

export const OPEN_PREFS_EVENT = "arion:open-cookie-prefs"

type Category = { key: "necessary" | "functional" | "analytics" | "marketing"; name: string; description: string }

/**
 * Çerez banner'ı + tercih merkezi (KVKK Çerez Rehberi, Rapor §7.1.4):
 *  - "Tümünü Kabul Et" ve "Tümünü Reddet" EŞİT görünürlükte (aynı stil, aynı boyut).
 *  - "Devam ederek kabul etmiş sayılırsınız" yok; seçim yapılmadan isteğe bağlı çerez yüklenmez.
 *  - Tercih merkezinde hiçbir kategori önceden işaretli değil (zorunlu hariç, kapatılamaz).
 */
export function CookieConsent({
  initial,
  categories,
}: {
  initial: ClientChoice
  categories: Category[]
}) {
  const t = useTranslations("cookies")
  const [choice, setChoice] = useState<ClientChoice>(initial)
  const [draft, setDraft] = useState({
    functional: initial?.functional ?? false,
    analytics: initial?.analytics ?? false,
    marketing: initial?.marketing ?? false,
  })
  const [pending, startTransition] = useTransition()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const bannerTitleId = useId()

  const openPrefs = useCallback(() => {
    setDraft({
      functional: choice?.functional ?? false,
      analytics: choice?.analytics ?? false,
      marketing: choice?.marketing ?? false,
    })
    dialogRef.current?.showModal()
  }, [choice])

  // Statik yayında sunucu çerezi okunamaz: tercih bu tarayıcıda saklanır (DECISIONS #087)
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ARION_STATIC !== "1" || initial !== null) return
    try {
      const raw = localStorage.getItem("arion-cookie-choice")
      // eslint-disable-next-line react-hooks/set-state-in-effect -- tarayıcı deposu yalnızca istemcide okunur
      if (raw) setChoice(JSON.parse(raw) as NonNullable<ClientChoice>)
    } catch {
      // gizli pencere vb.
    }
  }, [initial])

  useEffect(() => {
    const handler = () => openPrefs()
    window.addEventListener(OPEN_PREFS_EVENT, handler)
    return () => window.removeEventListener(OPEN_PREFS_EVENT, handler)
  }, [openPrefs])

  const save = (next: NonNullable<ClientChoice>) => {
    setChoice(next)
    dialogRef.current?.close()
    startTransition(async () => {
      await saveCookieChoiceAction(next)
    })
  }

  const btn =
    "inline-flex min-h-11 flex-1 items-center justify-center rounded-[2px] px-5 text-sm font-semibold transition-colors sm:flex-none"

  return (
    <>
      <ConsentScripts choice={choice} />

      {choice === null ? (
        <section
          role="region"
          aria-labelledby={bannerTitleId}
          className="glass fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-3xl rounded-[4px] bg-[rgb(14_12_10/0.94)] p-5 sm:inset-x-6 sm:p-6"
        >
          <h2 id={bannerTitleId} className="text-lg font-bold">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-smoke">
            {t("body")}{" "}
            <Link
              href="/yasal/cerez-politikasi"
              className="font-semibold text-white underline underline-offset-4"
            >
              {t("policy")}
            </Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {/* Kabul ve Ret AYNI görsel ağırlıkta */}
            <button
              type="button"
              disabled={pending}
              onClick={() => save({ functional: true, analytics: true, marketing: true })}
              className={cn(btn, "bg-white text-ink hover:bg-ember")}
            >
              {t("acceptAll")}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => save({ functional: false, analytics: false, marketing: false })}
              className={cn(btn, "bg-white text-ink hover:bg-ember")}
            >
              {t("rejectAll")}
            </button>
            <button
              type="button"
              onClick={openPrefs}
              className={cn(btn, "border border-white/30 text-white hover:bg-white/10")}
            >
              {t("manage")}
            </button>
          </div>
        </section>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="glass m-auto w-[min(640px,calc(100vw-2rem))] rounded-[4px] bg-[rgb(14_12_10/0.96)] p-0 text-white backdrop:bg-black/70"
      >
        <form
          method="dialog"
          className="p-6 sm:p-8"
          onSubmit={(e) => {
            e.preventDefault()
            save(draft)
          }}
        >
          <h2 id={titleId} className="condensed text-3xl">
            {t("prefsTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-smoke">{t("prefsIntro")}</p>
          <ul className="mt-6 space-y-3">
            {categories.map((c) => {
              const id = `cookie-${c.key}`
              return (
                <li key={c.key} className="rounded-[4px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <label htmlFor={id} className="font-semibold">
                      {c.name}
                    </label>
                    {c.key === "necessary" ? (
                      <span className="text-xs text-smoke">{t("alwaysOn")}</span>
                    ) : (
                      <input
                        id={id}
                        type="checkbox"
                        role="switch"
                        name={c.key}
                        checked={draft[c.key]}
                        onChange={(e) => setDraft((d) => ({ ...d, [c.key]: e.target.checked }))}
                        aria-describedby={`${id}-desc`}
                        className="size-6 shrink-0 accent-[var(--color-ember)]"
                      />
                    )}
                  </div>
                  <p id={`${id}-desc`} className="mt-1 text-sm leading-relaxed text-smoke">
                    {c.description}
                  </p>
                </li>
              )
            })}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="submit" disabled={pending} className={cn(btn, "bg-white text-ink hover:bg-ember")}>
              {t("save")}
            </button>
            <button
              type="button"
              onClick={() => save({ functional: true, analytics: true, marketing: true })}
              className={cn(btn, "border border-white/30 hover:bg-white/10")}
            >
              {t("acceptAll")}
            </button>
            <button
              type="button"
              onClick={() => save({ functional: false, analytics: false, marketing: false })}
              className={cn(btn, "border border-white/30 hover:bg-white/10")}
            >
              {t("rejectAll")}
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="ml-auto min-h-11 px-3 text-sm text-smoke underline underline-offset-4 hover:text-white"
            >
              {t("close")}
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}

/** Footer'daki "Çerez Tercihleri" — her sayfadan tercih merkezini açar. */
export function CookiePrefsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PREFS_EVENT))}
      className={className}
    >
      {label}
    </button>
  )
}
