"use client"

import { useFormatter, useTranslations } from "next-intl"
import { useEffect, useId, useState } from "react"
import { z } from "zod"
import { buttonClass } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Ürün yorumları (DECISIONS #093). Uydurma yorum gösterilmez: liste yalnızca bu tarayıcıda
 * yazılmış yorumlardan oluşur ve localStorage'da tutulur; hiçbir sunucuya gönderilmez.
 * Uyum markası olduğumuz için puanın yanında "kalıp nasıldı" (dar / tam / geniş) sorulur.
 */

const FITS = ["small", "true", "large"] as const
type Fit = (typeof FITS)[number]

const ReviewSchema = z.object({
  id: z.string().min(1).max(40),
  rating: z.number().int().min(1).max(5),
  fit: z.enum(FITS),
  size: z.string().max(8),
  name: z.string().trim().max(40),
  body: z.string().trim().min(10).max(600),
  createdAt: z.string().max(40),
})
type Review = z.infer<typeof ReviewSchema>

/** Örnek yorumlar (mesaj dosyasından): her zaman "Örnek" etiketiyle gösterilir, gerçek müşteri yorumu gibi sunulmaz. */
const SampleSchema = z.array(ReviewSchema.pick({ rating: true, fit: true, size: true, name: true, body: true }))
type Shown = Omit<Review, "id" | "createdAt"> & { id: string; createdAt: string | null; sample: boolean }

const key = (handle: string) => `arion-reviews:${handle}`

function readReviews(handle: string): Review[] {
  try {
    const parsed = z.array(ReviewSchema).safeParse(JSON.parse(localStorage.getItem(key(handle)) ?? "[]"))
    return parsed.success ? parsed.data : []
  } catch {
    return []
  }
}

function writeReviews(handle: string, list: Review[]) {
  try {
    localStorage.setItem(key(handle), JSON.stringify(list))
  } catch {
    /* depolama kapalıysa yorum yalnızca bu oturumda görünür */
  }
}

export function ProductReviews({ handle, sizes, samples: rawSamples }: { handle: string; sizes: string[]; samples?: unknown }) {
  const t = useTranslations("shop.reviews")
  const format = useFormatter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tarayıcı deposu yalnızca istemcide okunur
    setReviews(readReviews(handle))
  }, [handle])

  const save = (list: Review[]) => {
    setReviews(list)
    writeReviews(handle, list)
  }

  const parsedSamples = SampleSchema.safeParse(rawSamples ?? [])
  const samples: Shown[] = (parsedSamples.success ? parsedSamples.data : []).map((r, i) => ({ ...r, id: `sample-${i}`, createdAt: null, sample: true }))
  const shown: Shown[] = [...reviews.map((r) => ({ ...r, sample: false })), ...samples]
  const count = shown.length
  const avg = count ? shown.reduce((s, r) => s + r.rating, 0) / count : 0
  const fitCount = (f: Fit) => shown.filter((r) => r.fit === f).length

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
      {/* Özet */}
      <div className="glass h-fit rounded-[4px] p-6 sm:p-8" data-testid="reviews-summary">
        {count ? (
          <>
            <p className="flex items-end gap-3">
              <span className="font-display text-6xl tabular-nums">{format.number(avg, { maximumFractionDigits: 1, minimumFractionDigits: 1 })}</span>
              <span className="pb-2 text-smoke">/ 5</span>
            </p>
            <Stars value={Math.round(avg)} className="mt-2" label={t("ratingLabel", { value: format.number(avg, { maximumFractionDigits: 1 }) })} />
            <p className="mt-2 text-sm text-smoke">{samples.length ? t("countWithSamples", { count, samples: samples.length }) : t("count", { count })}</p>
            <div className="mt-6 space-y-2">
              <p className="text-xs font-medium tracking-[0.12em] text-smoke uppercase">{t("fitTitle")}</p>
              {FITS.map((f) => (
                <div key={f} className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3 text-sm">
                  <span>{t(`fit.${f}`)}</span>
                  <span className="h-1.5 rounded-full bg-chalk/10" aria-hidden="true">
                    <span className="block h-1.5 rounded-full bg-ember" style={{ width: `${(fitCount(f) / count) * 100}%` }} />
                  </span>
                  <span className="text-right text-smoke tabular-nums">{fitCount(f)}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="font-display text-3xl italic">{t("emptyTitle")}</p>
            <p className="mt-3 text-sm leading-relaxed text-smoke">{t("emptyBody")}</p>
          </>
        )}
        {!open ? (
          <button type="button" onClick={() => setOpen(true)} className={buttonClass({ className: "mt-8 w-full" })} data-testid="review-open">
            {t("write")}
          </button>
        ) : null}
        {samples.length ? <p className="mt-4 text-xs leading-relaxed text-smoke" data-testid="samples-note">{t("samplesNote")}</p> : null}
        <p className="mt-2 text-xs leading-relaxed text-smoke">{t("localNote")}</p>
      </div>

      {/* Form + liste */}
      <div>
        {open ? (
          <ReviewForm
            sizes={sizes}
            onCancel={() => setOpen(false)}
            onSubmit={(r) => {
              save([r, ...reviews])
              setOpen(false)
            }}
          />
        ) : null}
        {count ? (
          <ul className={cn("space-y-6", open && "mt-10")} data-testid="reviews-list">
            {shown.map((r) => (
              <li key={r.id} className="border-b border-chalk/15 pb-6" data-sample={r.sample || undefined}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Stars value={r.rating} label={t("ratingLabel", { value: r.rating })} />
                  {r.createdAt ? (
                    <time dateTime={r.createdAt} className="text-xs text-smoke">
                      {format.dateTime(new Date(r.createdAt), { day: "numeric", month: "long", year: "numeric" })}
                    </time>
                  ) : null}
                </div>
                <p className="mt-3 leading-relaxed whitespace-pre-line">{r.body}</p>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-smoke">
                  <span className="font-medium text-chalk">{r.name || t("anonymous")}</span>
                  {r.size ? <span>{t("sizeWorn", { size: r.size })}</span> : null}
                  <span>{t("fitWas", { fit: t(`fit.${r.fit}`) })}</span>
                  <span className="rounded-[2px] border border-chalk/20 px-1.5 text-[0.65rem] tracking-[0.12em] uppercase">{r.sample ? t("sample") : t("yourDevice")}</span>
                </p>
                {r.sample ? null : (
                  <button type="button" onClick={() => save(reviews.filter((x) => x.id !== r.id))} className="mt-3 text-xs text-smoke underline underline-offset-4 hover:text-chalk">
                    {t("delete")}
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : !open ? (
          <p className="text-smoke">{t("noneYet")}</p>
        ) : null}
      </div>
    </div>
  )
}

function ReviewForm({ sizes, onSubmit, onCancel }: { sizes: string[]; onSubmit: (r: Review) => void; onCancel: () => void }) {
  const t = useTranslations("shop.reviews")
  const uid = useId()
  const [rating, setRating] = useState(0)
  const [fit, setFit] = useState<Fit | null>(null)
  const [size, setSize] = useState("")
  const [name, setName] = useState("")
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const field = "mt-1 min-h-11 w-full rounded-[2px] border border-chalk/20 bg-carbon px-3 text-sm tracking-normal text-chalk normal-case"
  const labelCls = "block text-xs font-medium tracking-[0.08em] text-smoke uppercase"

  return (
    <form
      className="glass space-y-5 rounded-[4px] p-6 sm:p-8"
      data-testid="review-form"
      onSubmit={(e) => {
        e.preventDefault()
        const parsed = ReviewSchema.safeParse({
          id: `r${Date.now().toString(36)}`,
          rating,
          fit: fit ?? undefined,
          size,
          name,
          body,
          createdAt: new Date().toISOString(),
        })
        if (!parsed.success) {
          setError(!rating ? t("errors.rating") : !fit ? t("errors.fit") : t("errors.body"))
          return
        }
        onSubmit(parsed.data)
      }}
    >
      <fieldset>
        <legend className={labelCls}>{t("form.rating")}</legend>
        <div className="mt-2 flex gap-1" role="radiogroup" aria-label={t("form.rating")}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name={`${uid}-rating`} value={n} checked={rating === n} onChange={() => setRating(n)} className="peer sr-only" />
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-[2px] text-2xl peer-focus-visible:outline-2 peer-focus-visible:outline-ember",
                  n <= rating ? "text-ember" : "text-chalk/30 hover:text-chalk/60",
                )}
                aria-hidden="true"
              >
                ★
              </span>
              <span className="sr-only">{t("stars", { count: n })}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelCls}>{t("form.fit")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {FITS.map((f) => (
            <label key={f} className={cn("cursor-pointer rounded-[2px] border px-4 py-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ember", fit === f ? "border-ember text-chalk" : "border-chalk/20 text-smoke hover:border-chalk/40")}>
              <input type="radio" name={`${uid}-fit`} value={f} checked={fit === f} onChange={() => setFit(f)} className="sr-only" />
              {t(`fit.${f}`)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          {t("form.size")}
          <select value={size} onChange={(e) => setSize(e.target.value)} className={field}>
            <option value="">{t("form.sizeNone")}</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          {t("form.name")}
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="given-name" className={field} placeholder={t("form.namePlaceholder")} />
        </label>
      </div>

      <label className={labelCls}>
        {t("form.body")}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={10}
          maxLength={600}
          rows={5}
          className={cn(field, "py-2 leading-relaxed")}
          placeholder={t("form.bodyPlaceholder")}
        />
        <span className="mt-1 block text-right font-normal tracking-normal normal-case tabular-nums">{body.trim().length} / 600</span>
      </label>

      <p className="min-h-4 text-sm text-ember" aria-live="polite">
        {error ?? ""}
      </p>
      <p className="text-xs leading-relaxed text-smoke">{t("form.privacy")}</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onCancel} className={buttonClass({ variant: "glass" })}>
          {t("form.cancel")}
        </button>
        <button type="submit" className={buttonClass({})} data-testid="review-submit">
          {t("form.submit")}
        </button>
      </div>
    </form>
  )
}

function Stars({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <span className={cn("flex gap-0.5 text-lg", className)} role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? "text-ember" : "text-chalk/25"} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  )
}
