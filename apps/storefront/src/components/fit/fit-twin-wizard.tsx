"use client"

import { band, validateProfile, type ProfileError } from "@arion/fit-engine"
import { useTranslations } from "next-intl"
import { useId, useMemo, useState, useTransition } from "react"
import { ScoreDial } from "@/components/fit/score-dial"
import { fieldClass } from "@/components/help/tracking-form"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { deleteFitTwinAction, saveFitTwinAction } from "@/lib/actions/fit-twin-actions"
import { scoreCatalog } from "@/lib/fit/score"
import type { FitCatalog, FitTwinProfile } from "@/lib/fit/types"
import { cn } from "@/lib/utils"
import { useFitTwin } from "./fit-twin-provider"
import { MeasureIllustration } from "./measure-illustration"
import { PaperMeasure } from "./paper-measure"
import { ReasonList } from "./reason-list"

const STEPS = ["method", "length", "width", "arch", "preference", "result"] as const
type Step = (typeof STEPS)[number]

type Draft = {
  method: "manual" | "paper"
  lengthMm: string
  ballWidthMm: string
  girthMm: string
  archType: FitTwinProfile["archType"]
  preference: FitTwinProfile["preference"]
}

function toDraft(p: FitTwinProfile | null): Draft {
  return {
    method: p?.method ?? "manual",
    lengthMm: p ? String(p.lengthMm) : "",
    ballWidthMm: p ? String(p.ballWidthMm) : "",
    girthMm: p?.girthMm ? String(p.girthMm) : "",
    archType: p?.archType ?? "normal",
    preference: p?.preference ?? "regular",
  }
}

function toProfile(d: Draft): FitTwinProfile {
  const num = (s: string) => Number(s.replace(",", "."))
  return {
    method: d.method,
    lengthMm: num(d.lengthMm),
    ballWidthMm: num(d.ballWidthMm),
    girthMm: d.girthMm.trim() ? num(d.girthMm) : null,
    archType: d.archType,
    preference: d.preference,
  }
}

export function FitTwinWizard({
  catalog,
  consent,
}: {
  catalog: FitCatalog
  consent: { label: string; text: string }
}) {
  const t = useTranslations("fit")
  const { profile, source, isMember, setGuestProfile, clearGuestProfile, setMemberProfile } = useFitTwin()
  const [step, setStep] = useState<Step>(profile ? "result" : "method")
  const [draft, setDraft] = useState<Draft>(() => toDraft(profile))
  const [errors, setErrors] = useState<ProfileError[]>([])
  const [consentChecked, setConsentChecked] = useState(false)
  const [status, setStatus] = useState<"idle" | "saved" | "consent_required" | "error" | "deleted">("idle")
  const [pending, start] = useTransition()
  const ids = { length: useId(), width: useId(), girth: useId(), consent: useId() }

  const idx = STEPS.indexOf(step)
  const current = toProfile(draft)
  const ranked = useMemo(() => {
    if (step !== "result") return []
    const scores = scoreCatalog(current, catalog)
    return catalog.products
      .flatMap((p) => {
        const r = scores.get(p.handle)
        return r ? [{ p, r }] : []
      })
      .sort((a, b) => b.r.score - a.r.score)
  }, [step, current, catalog])

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))

  function go(next: Step) {
    if (next === "width" || next === "arch" || next === "result") {
      const p = toProfile(draft)
      const errs = validateProfile(p).filter((e) =>
        next === "width" ? e === "length_range" : next === "arch" ? e !== "girth_range" || draft.girthMm !== "" : true,
      )
      if (errs.length) {
        setErrors(errs)
        return
      }
      if (next === "result") {
        setGuestProfile(p)
        setStatus("idle")
      }
    }
    setErrors([])
    setStep(next)
    requestAnimationFrame(() => document.getElementById("ayak-ikizi-adim")?.focus())
  }

  function save() {
    start(async () => {
      const res = await saveFitTwinAction(current, consentChecked)
      if (res.ok) {
        setMemberProfile(current)
        clearGuestProfile()
        setStatus("saved")
      } else setStatus(res.error === "consent_required" ? "consent_required" : "error")
    })
  }

  function remove() {
    if (!window.confirm(t("save.deleteConfirm"))) return
    start(async () => {
      const res = await deleteFitTwinAction()
      if (res.ok) {
        setMemberProfile(null)
        clearGuestProfile()
        setDraft(toDraft(null))
        setConsentChecked(false)
        setStatus("deleted")
        setStep("method")
      } else setStatus("error")
    })
  }

  const errorBox = errors.length ? (
    <div role="alert" className="rounded-[4px] border border-ember/60 bg-ember/10 p-4 text-sm text-white">
      {errors.map((e) => (
        <p key={e}>{t(`errors.${e}`)}</p>
      ))}
    </div>
  ) : null

  const choice = <V extends string>(
    name: string,
    value: V,
    selected: V,
    onSelect: (v: V) => void,
    title: string,
    hint: string,
  ) => (
    <label
      key={value}
      className={cn(
        "flex cursor-pointer flex-col gap-1 rounded-[4px] border p-4 transition-colors",
        selected === value ? "border-ember bg-ember/10" : "border-white/15 hover:border-white/40",
      )}
    >
      <input type="radio" name={name} value={value} checked={selected === value} onChange={() => onSelect(value)} className="sr-only" />
      <span className="font-semibold text-white">{title}</span>
      <span className="text-sm text-smoke">{hint}</span>
    </label>
  )

  return (
    <div className="glass rounded-[4px] p-6 sm:p-10" data-testid="fit-wizard">
      {/* İlerleme */}
      <ol className="flex flex-wrap gap-2" aria-label={t("progress", { current: idx + 1, total: STEPS.length })}>
        {STEPS.map((s, i) => (
          <li
            key={s}
            aria-current={s === step ? "step" : undefined}
            className={cn(
              "rounded-[2px] px-3 py-1 text-xs font-semibold",
              i < idx ? "bg-moss/20 text-moss" : s === step ? "bg-ember text-ink" : "bg-white/5 text-smoke",
            )}
          >
            {i + 1}. {t(`steps.${s}`)}
          </li>
        ))}
      </ol>

      <div id="ayak-ikizi-adim" tabIndex={-1} className="mt-8 space-y-6 outline-none">
        {step === "method" ? (
          <fieldset className="space-y-4">
            <legend className="condensed text-3xl text-white">{t("method.title")}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {choice("method", "manual", draft.method, (v) => set("method", v), t("method.manual"), t("method.manualHint"))}
              {choice("method", "paper", draft.method, (v) => set("method", v), t("method.paper"), t("method.paperHint"))}
            </div>
            {status === "deleted" ? (
              <p role="status" className="rounded-[4px] border border-moss/50 bg-moss/10 p-3 text-sm text-white">
                {t("save.deleted")}
              </p>
            ) : null}
          </fieldset>
        ) : null}

        {step === "length" ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
            <div className="space-y-5">
              <h2 className="condensed text-3xl text-white">{draft.method === "paper" ? t("paper.title") : t("length.title")}</h2>
              {draft.method === "paper" ? (
                <PaperMeasure
                  onResult={(m) => {
                    setDraft((d) => ({ ...d, lengthMm: String(m.lengthMm), ballWidthMm: String(m.ballWidthMm) }))
                  }}
                />
              ) : (
                <ol className="list-decimal space-y-2 pl-5 text-smoke">
                  {(t.raw("length.steps") as string[]).map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              )}
              <div className="flex flex-col gap-2">
                <label htmlFor={ids.length} className="font-semibold text-white">
                  {t("length.label")}
                </label>
                <input
                  id={ids.length}
                  inputMode="decimal"
                  className={cn(fieldClass, "max-w-48")}
                  value={draft.lengthMm}
                  onChange={(e) => set("lengthMm", e.target.value)}
                  aria-describedby={`${ids.length}-hint`}
                />
                <p id={`${ids.length}-hint`} className="text-sm text-smoke">
                  {t("length.hint")}
                </p>
              </div>
            </div>
            <MeasureIllustration kind="length" label={t("length.title")} />
          </div>
        ) : null}

        {step === "width" ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
            <div className="space-y-5">
              <h2 className="condensed text-3xl text-white">{t("width.title")}</h2>
              <ol className="list-decimal space-y-2 pl-5 text-smoke">
                {(t.raw("width.steps") as string[]).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <div className="flex flex-col gap-2">
                <label htmlFor={ids.width} className="font-semibold text-white">
                  {t("width.label")}
                </label>
                <input
                  id={ids.width}
                  inputMode="decimal"
                  className={cn(fieldClass, "max-w-48")}
                  value={draft.ballWidthMm}
                  onChange={(e) => set("ballWidthMm", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor={ids.girth} className="font-semibold text-white">
                  {t("width.girth")}
                </label>
                <input
                  id={ids.girth}
                  inputMode="decimal"
                  className={cn(fieldClass, "max-w-48")}
                  value={draft.girthMm}
                  onChange={(e) => set("girthMm", e.target.value)}
                  aria-describedby={`${ids.girth}-hint`}
                />
                <p id={`${ids.girth}-hint`} className="text-sm text-smoke">
                  {t("width.girthHint")}
                </p>
              </div>
            </div>
            <MeasureIllustration kind="width" label={t("width.title")} />
          </div>
        ) : null}

        {step === "arch" ? (
          <fieldset className="space-y-4">
            <legend className="condensed text-3xl text-white">{t("arch.title")}</legend>
            <p className="text-sm text-smoke">{t("arch.hint")}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(["flat", "normal", "high"] as const).map((v) =>
                choice("arch", v, draft.archType, (x) => set("archType", x), t(`arch.${v}`), t(`arch.${v}Hint`)),
              )}
            </div>
          </fieldset>
        ) : null}

        {step === "preference" ? (
          <fieldset className="space-y-4">
            <legend className="condensed text-3xl text-white">{t("preference.title")}</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {(["snug", "regular", "roomy"] as const).map((v) =>
                choice("pref", v, draft.preference, (x) => set("preference", x), t(`preference.${v}`), t(`preference.${v}Hint`)),
              )}
            </div>
          </fieldset>
        ) : null}

        {step === "result" ? (
          <div className="space-y-8" data-testid="fit-result">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="condensed text-4xl text-white">{t("result.title")}</h2>
                <p className="mt-2 font-mono text-smoke">
                  {t("result.summary", { length: current.lengthMm, width: current.ballWidthMm })}
                </p>
              </div>
              <button
                type="button"
                className={buttonClass({ variant: "glass" })}
                onClick={() => {
                  setDraft(toDraft(current))
                  setStep("length")
                }}
              >
                {t("result.edit")}
              </button>
            </div>

            <section aria-labelledby="oneriler">
              <h3 id="oneriler" className="text-xl font-bold text-white">
                {t("result.recommendations")}
              </h3>
              <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {ranked.slice(0, 6).map(({ p, r }) => (
                  <li key={p.handle} className="rounded-[4px] border border-white/10 bg-white/[0.04] p-5" data-testid="fit-reco">
                    <div className="flex items-center gap-4">
                      <ScoreDial score={r.score} label={t("result.scoreLabel")} className="size-20 shrink-0" />
                      <div>
                        <p className="font-bold text-white">{p.title}</p>
                        <p className="text-sm text-smoke">{t(`bands.${band(r.score)}`)}</p>
                        <p className="mt-1 font-mono text-sm text-white">
                          {t("result.size", { size: r.recommendedSize ?? "-", width: r.recommendedWidth ?? "" })}
                        </p>
                      </div>
                    </div>
                    <ReasonList reasons={r.reasons.slice(0, 2)} className="mt-4 text-smoke" />
                    <Link
                      href={{ pathname: "/urun/[slug]", params: { slug: p.handle } }}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ember hover:text-white"
                    >
                      {t("result.viewProduct")} 
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={{ pathname: "/koleksiyon", query: { uyum: "1" } }} className={cn(buttonClass({}), "mt-6")}>
                {t("result.browse")} 
              </Link>
            </section>

            {/* Saklama */}
            <section aria-labelledby="saklama" className="rounded-[4px] border border-white/10 bg-carbon/60 p-6">
              {!isMember ? (
                <>
                  <h3 id="saklama" className="text-lg font-bold text-white">
                    {t("save.guestTitle")}
                  </h3>
                  <p className="mt-2 text-sm text-smoke">{t("save.guestBody")}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/hesabim/giris" className={buttonClass({ variant: "glass" })}>
                      {t("save.signIn")}
                    </Link>
                    <button
                      type="button"
                      className={buttonClass({ variant: "glass" })}
                      onClick={() => {
                        clearGuestProfile()
                        setDraft(toDraft(null))
                        setStep("method")
                      }}
                    >
                      {t("save.clearGuest")}
                    </button>
                  </div>
                </>
              ) : source === "member" ? (
                <>
                  <h3 id="saklama" className="text-lg font-bold text-white">
                    {t("save.memberTitle")}
                  </h3>
                  <p role="status" className="mt-2 text-sm text-moss" data-testid="fit-saved">
                    {t("save.saved")}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" className={buttonClass({})} onClick={save} disabled={pending}>
                      {t("save.save")}
                    </button>
                    <button
                      type="button"
                      className={buttonClass({ variant: "glass" })}
                      onClick={remove}
                      disabled={pending}
                      data-testid="fit-delete"
                    >
                      {t("save.delete")}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 id="saklama" className="text-lg font-bold text-white">
                    {t("save.memberTitle")}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-smoke">{consent.text}</p>
                  <label htmlFor={ids.consent} className="mt-4 flex items-start gap-3 text-white">
                    <input
                      id={ids.consent}
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-1 size-5 accent-ember"
                      data-testid="fit-consent"
                    />
                    <span>{consent.label}</span>
                  </label>
                  <p className="mt-2 text-xs text-smoke">{t("save.consentHint")}</p>
                  <button type="button" className={cn(buttonClass({}), "mt-4")} onClick={save} disabled={pending} data-testid="fit-save">
                    {t("save.save")}
                  </button>
                  {status === "consent_required" ? (
                    <p role="alert" className="mt-3 text-sm text-ember">
                      {t("save.consentRequired")}
                    </p>
                  ) : null}
                </>
              )}
              {status === "error" ? (
                <p role="alert" className="mt-3 text-sm text-ember">
                  {t("save.error")}
                </p>
              ) : null}
            </section>
          </div>
        ) : null}

        {errorBox}

        {step !== "result" ? (
          <div className="flex flex-wrap gap-3 pt-2">
            {idx > 0 ? (
              <button type="button" className={buttonClass({ variant: "glass" })} onClick={() => go(STEPS[idx - 1]!)}>
                {t("back")}
              </button>
            ) : null}
            <button type="button" className={buttonClass({})} onClick={() => go(STEPS[idx + 1]!)} data-testid="fit-next">
              {t("next")} 
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
