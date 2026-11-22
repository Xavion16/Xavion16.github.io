"use client"

import { useLocale, useTranslations } from "next-intl"
import { useId, useState, useTransition } from "react"
import { fieldClass } from "@/components/help/tracking-form"
import { buttonClass } from "@/components/ui/button"
import type { Locale } from "@/i18n/routing"
import { quoteRepairAction, submitRepairAction, type QuoteResult, type RepairSubmitResult } from "@/lib/actions/repair-actions"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

const TYPES = ["resole", "heel", "stitch", "clean", "recraft"] as const
type RepairType = (typeof TYPES)[number]
type Photo = { mime: "image/jpeg"; base64: string; preview: string }

/** Fotoğrafı tarayıcıda küçültür (en uzun kenar 1600 px, JPEG %82). EXIF konum verisi de böylece atılır. */
async function shrink(file: File): Promise<Photo | null> {
  if (!file.type.startsWith("image/")) return null
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  bmp.close()
  const url = canvas.toDataURL("image/jpeg", 0.82)
  return { mime: "image/jpeg", base64: url.split(",")[1] ?? "", preview: url }
}

export function RepairForm({ initialPassport, defaults }: { initialPassport?: string; defaults?: { name?: string; email?: string } }) {
  const t = useTranslations("lifetime.form")
  const tr = useTranslations("repair")
  const locale = useLocale() as Locale
  const [type, setType] = useState<RepairType>("resole")
  const [passport, setPassport] = useState(initialPassport ?? "")
  const [description, setDescription] = useState("")
  const [name, setName] = useState(defaults?.name ?? "")
  const [email, setEmail] = useState(defaults?.email ?? "")
  const [photos, setPhotos] = useState<Photo[]>([])
  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [result, setResult] = useState<RepairSubmitResult | null>(null)
  const [pending, start] = useTransition()
  const id = useId()
  const money = (n: number) => formatMoney(n, locale)

  async function addPhotos(files: FileList | null) {
    if (!files) return
    const next: Photo[] = []
    for (const f of Array.from(files).slice(0, 3 - photos.length)) {
      const p = await shrink(f)
      if (p) next.push(p)
    }
    setPhotos((cur) => [...cur, ...next].slice(0, 3))
  }

  function getQuote() {
    start(async () => setQuote(await quoteRepairAction(type, passport)))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await submitRepairAction({
        type,
        passport_code: passport,
        description,
        full_name: name,
        email,
        photos: photos.map(({ mime, base64 }) => ({ mime, base64 })),
      })
      setResult(res)
    })
  }

  if (result?.ok) {
    return (
      <div role="status" className="rounded-[4px] border border-moss/50 bg-moss/10 p-6" data-testid="repair-success">
        <p className="text-xl font-bold text-white">{t("success")}</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-smoke">{t("reference")}</dt>
            <dd className="font-mono text-lg text-white" data-testid="repair-reference">
              {result.reference}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-smoke">{t("shipping")}</dt>
            <dd className="font-mono text-lg text-white" data-testid="repair-shipping">
              {result.shipping_code}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-white">
          {result.quote.credit != null
            ? t("creditResult", { credit: money(result.quote.credit) })
            : t("quoteResult", { min: money(result.quote.min), max: money(result.quote.max) })}
        </p>
        <p className="mt-2 text-sm text-smoke">{t("shippingHint")}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-6" data-testid="repair-form">
      <fieldset>
        <legend className="font-semibold text-white">{t("type")}</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {TYPES.map((k) => (
            <label
              key={k}
              className={cn(
                "flex cursor-pointer flex-col gap-1 rounded-[4px] border p-4",
                type === k ? "border-ember bg-ember/10" : "border-white/15 hover:border-white/40",
              )}
            >
              <input
                type="radio"
                name="type"
                value={k}
                checked={type === k}
                onChange={() => {
                  setType(k)
                  setQuote(null)
                }}
                className="sr-only"
              />
              <span className="font-semibold text-white">{tr(`types.${k}`)}</span>
              <span className="text-sm text-smoke">{tr(`typeHints.${k}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-pass`} className="font-semibold text-white">
            {t("passport")}
          </label>
          <input
            id={`${id}-pass`}
            className={cn(fieldClass, "font-mono uppercase")}
            value={passport}
            onChange={(e) => {
              setPassport(e.target.value)
              setQuote(null)
            }}
            placeholder="ARN-2026-000123"
            aria-describedby={`${id}-pass-hint`}
          />
          <p id={`${id}-pass-hint`} className="text-xs text-smoke">
            {t("passportHint")}
          </p>
        </div>
        <div className="flex flex-col justify-start gap-2">
          <button type="button" onClick={getQuote} disabled={pending} className={cn(buttonClass({ variant: "glass" }), "self-start sm:mt-8")}>
            {t("quote")}
          </button>
          <p aria-live="polite" className="text-sm text-white" data-testid="repair-quote">
            {quote?.ok
              ? !quote.feasible
                ? t("notFeasible")
                : quote.credit != null
                  ? t("creditResult", { credit: money(quote.credit) })
                  : t("quoteResult", { min: money(quote.min), max: money(quote.max) })
              : quote?.error === "passport_not_found"
                ? t("passportNotFound")
                : null}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-desc`} className="font-semibold text-white">
          {t("description")}
        </label>
        <textarea
          id={`${id}-desc`}
          required
          minLength={5}
          maxLength={2000}
          rows={4}
          className={cn(fieldClass, "py-3")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-photos`} className="font-semibold text-white">
          {t("photos")}
        </label>
        <input
          id={`${id}-photos`}
          type="file"
          accept="image/*"
          multiple
          disabled={photos.length >= 3}
          onChange={(e) => void addPhotos(e.target.files)}
          className="text-sm text-smoke file:mr-3 file:min-h-11 file:rounded-[2px] file:border-0 file:bg-white file:px-4 file:font-semibold file:text-ink"
          aria-describedby={`${id}-photos-hint`}
        />
        <p id={`${id}-photos-hint`} className="text-xs text-smoke">
          {t("photosHint")}
        </p>
        {photos.length ? (
          <ul className="flex flex-wrap gap-3">
            {photos.map((p, i) => (
              <li key={p.preview.slice(-24) + i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- yerel önizleme (data URL) */}
                <img src={p.preview} alt="" className="size-24 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((cur) => cur.filter((_, j) => j !== i))}
                  className="absolute -top-2 -right-2 grid size-8 place-items-center rounded-full bg-ink text-white"
                  aria-label={t("removePhoto")}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-name`} className="font-semibold text-white">
            {t("name")}
          </label>
          <input
            id={`${id}-name`}
            required
            autoComplete="name"
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-email`} className="font-semibold text-white">
            {t("email")}
          </label>
          <input
            id={`${id}-email`}
            required
            type="email"
            autoComplete="email"
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <p className="text-xs text-smoke">{t("privacy")}</p>
      {result && !result.ok ? (
        <p role="alert" className="text-sm text-ember">
          {result.error === "passport_not_found"
            ? t("passportNotFound")
            : result.error === "not_feasible"
              ? t("notFeasible")
              : t("error")}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={buttonClass({})} data-testid="repair-submit">
        {pending ? t("sending") : t("submit")}
      </button>
    </form>
  )
}
