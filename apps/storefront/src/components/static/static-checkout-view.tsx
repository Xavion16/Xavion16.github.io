"use client"

import { useTranslations } from "next-intl"
import { useState, type ReactNode } from "react"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { clearStaticCart } from "@/lib/static/cart"
import { writeDiscount } from "@/lib/static/discount"
import { cn } from "@/lib/utils"
import { DiscountBox, OrderSummary, subtotalOf, useDiscount, useMoney, useStaticLines, type StaticCatalog } from "./static-order"

type Step = 1 | 2 | 3
const SHIPPING = { standard: 0, express: 149 } as const
type Shipping = keyof typeof SHIPPING
type Contact = { email: string; name: string; phone: string; address: string; city: string; district: string }

/**
 * Demo ödeme (DECISIONS #092): iletişim/adres → kargo → ödeme. Hiçbir bilgi saklanmaz ya da gönderilmez.
 * KART VERİSİ İSTENMEZ: ödeme adımında yalnızca sabit, salt-okunur bir test kartı gösterilir (CLAUDE.md).
 * Sözleşme onay kutuları boş başlar; ikisi de işaretlenmeden ödeme onaylanamaz.
 */
export function StaticCheckoutView({ catalog }: { catalog: StaticCatalog }) {
  const t = useTranslations("shop.staticCheckout")
  const money = useMoney()
  const lines = useStaticLines(catalog)
  const subtotal = subtotalOf(lines, catalog)
  const d = useDiscount(subtotal)
  const [step, setStep] = useState<Step>(1)
  const [contact, setContact] = useState<Contact>({ email: "", name: "", phone: "", address: "", city: "", district: "" })
  const [shipping, setShipping] = useState<Shipping>("standard")
  const [accepted, setAccepted] = useState({ preContract: false, distance: false })
  const [orderNo, setOrderNo] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)

  if (orderNo) {
    return (
      <div className="glass mt-10 max-w-2xl rounded-[4px] p-6 sm:p-8" role="status" data-testid="static-order-done">
        <p className="eyebrow text-ember">{t("done.eyebrow")}</p>
        <p className="mt-3 font-display text-4xl italic">{t("done.title")}</p>
        <p className="mt-4 leading-relaxed text-smoke">{t("done.body", { name: contact.name.split(" ")[0] ?? "", email: contact.email })}</p>
        <p className="mt-6 text-sm">
          {t("done.orderNo")} <span className="font-medium text-ember tabular-nums">{orderNo}</span>
        </p>
        <Link href="/koleksiyon" className={buttonClass({ size: "lg", className: "mt-8" })}>
          {t("done.continue")}
        </Link>
      </div>
    )
  }

  if (!lines.length) {
    return (
      <div className="mt-10">
        <p className="text-lg text-smoke">{t("empty")}</p>
        <Link href="/koleksiyon" className={buttonClass({ size: "lg", className: "mt-6" })}>
          {t("emptyCta")}
        </Link>
      </div>
    )
  }

  const shippingCost = SHIPPING[shipping]
  const total = Math.max(0, subtotal - d.amount) + shippingCost
  const field = "mt-1 min-h-11 w-full rounded-[2px] border border-chalk/20 bg-carbon px-3 text-sm tracking-normal text-chalk normal-case"

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <div>
        {/* Adım göstergesi */}
        <ol className="mb-8 flex gap-6 border-b border-chalk/15 text-[0.72rem] font-medium tracking-[0.14em] uppercase" aria-label={t("stepsLabel")}>
          {([1, 2, 3] as const).map((s) => (
            <li
              key={s}
              aria-current={step === s ? "step" : undefined}
              className={cn("-mb-px border-b-2 pb-3", step === s ? "border-ember text-chalk" : step > s ? "border-transparent text-chalk/70" : "border-transparent text-chalk/40")}
            >
              {s}. {t(`steps.${s}`)}
            </li>
          ))}
        </ol>

        {step === 1 ? (
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              setStep(2)
            }}
            data-testid="step-contact"
          >
            <Field label={t("fields.email")} className="sm:col-span-2">
              <input type="email" required autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className={field} />
            </Field>
            <Field label={t("fields.name")}>
              <input required minLength={3} autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className={field} />
            </Field>
            <Field label={t("fields.phone")}>
              <input type="tel" required pattern="[0-9 +()-]{10,}" autoComplete="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className={field} />
            </Field>
            <Field label={t("fields.address")} className="sm:col-span-2">
              <input required minLength={8} autoComplete="street-address" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} className={field} />
            </Field>
            <Field label={t("fields.city")}>
              <input required autoComplete="address-level1" value={contact.city} onChange={(e) => setContact({ ...contact, city: e.target.value })} className={field} />
            </Field>
            <Field label={t("fields.district")}>
              <input required autoComplete="address-level2" value={contact.district} onChange={(e) => setContact({ ...contact, district: e.target.value })} className={field} />
            </Field>
            <p className="text-xs text-smoke sm:col-span-2">{t("privacy")}</p>
            <div className="sm:col-span-2">
              <button type="submit" className={buttonClass({ size: "lg" })}>
                {t("next")}
              </button>
            </div>
          </form>
        ) : null}

        {step === 2 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setStep(3)
            }}
            data-testid="step-shipping"
          >
            <fieldset className="space-y-3">
              <legend className="sr-only">{t("steps.2")}</legend>
              {(Object.keys(SHIPPING) as Shipping[]).map((s) => (
                <label key={s} className={cn("flex cursor-pointer items-center justify-between gap-4 rounded-[4px] border p-4", shipping === s ? "border-ember" : "border-chalk/20 hover:border-chalk/40")}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="shipping" value={s} checked={shipping === s} onChange={() => setShipping(s)} className="size-4 accent-[var(--color-ember)]" />
                    <span>
                      <span className="block font-medium">{t(`shipping.${s}.title`)}</span>
                      <span className="block text-sm text-smoke">{t(`shipping.${s}.eta`)}</span>
                    </span>
                  </span>
                  <span className="tabular-nums">{SHIPPING[s] ? money(SHIPPING[s]) : t("free")}</span>
                </label>
              ))}
            </fieldset>
            <p className="mt-4 text-sm text-smoke">{t("deliverTo", { name: contact.name, address: `${contact.address}, ${contact.district} / ${contact.city}` })}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => setStep(1)} className={buttonClass({ variant: "glass", size: "lg" })}>
                {t("back")}
              </button>
              <button type="submit" className={buttonClass({ size: "lg" })}>
                {t("next")}
              </button>
            </div>
          </form>
        ) : null}

        {step === 3 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!accepted.preContract || !accepted.distance) return
              setPaying(true)
              window.setTimeout(() => {
                clearStaticCart()
                writeDiscount(null)
                setOrderNo(`ARN-DEMO-${Math.floor(100000 + Math.random() * 900000)}`)
              }, 900)
            }}
            data-testid="step-payment"
          >
            {/* Sabit test kartı: kullanıcıdan kart bilgisi ALINMAZ */}
            <div className="rounded-[4px] border border-chalk/20 p-5">
              <p className="eyebrow text-ember">{t("card.title")}</p>
              <div className="mt-4 rounded-[8px] bg-[linear-gradient(135deg,#2a2318,#0f0d0a)] p-5 text-chalk shadow-[inset_0_1px_0_rgb(255_255_255/0.15)]" aria-label={t("card.aria")} role="img">
                <p className="font-display text-xl tracking-[0.18em] tabular-nums">4242 4242 4242 4242</p>
                <p className="mt-4 flex justify-between text-xs tracking-[0.14em] text-chalk/70 uppercase">
                  <span>ARION DEMO</span>
                  <span>12 / 30</span>
                </p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-smoke">{t("card.note")}</p>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <label className="flex items-start gap-3">
                <input type="checkbox" checked={accepted.preContract} onChange={(e) => setAccepted({ ...accepted, preContract: e.target.checked })} className="mt-0.5 size-4 accent-[var(--color-ember)]" required />
                <span>
                  {t.rich("accept.preContract", {
                    link: (c: ReactNode) => (
                      <Link href="/yasal/on-bilgilendirme" className="underline underline-offset-4">
                        {c}
                      </Link>
                    ),
                  })}
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" checked={accepted.distance} onChange={(e) => setAccepted({ ...accepted, distance: e.target.checked })} className="mt-0.5 size-4 accent-[var(--color-ember)]" required />
                <span>
                  {t.rich("accept.distance", {
                    link: (c: ReactNode) => (
                      <Link href="/yasal/mesafeli-satis" className="underline underline-offset-4">
                        {c}
                      </Link>
                    ),
                  })}
                </span>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => setStep(2)} className={buttonClass({ variant: "glass", size: "lg" })}>
                {t("back")}
              </button>
              <button type="submit" disabled={paying || !accepted.preContract || !accepted.distance} className={buttonClass({ size: "lg" })} data-testid="pay">
                {paying ? t("paying") : t("pay", { total: money(total) })}
              </button>
            </div>
          </form>
        ) : null}
      </div>

      <aside className="glass h-fit space-y-6 rounded-[4px] p-6 lg:sticky lg:top-24">
        <OrderSummary lines={lines} catalog={catalog} shipping={shippingCost} discount={d.amount} showLines />
        <DiscountBox d={d} />
        <p className="text-xs leading-relaxed text-smoke">{t("demoNote")}</p>
      </aside>
    </div>
  )
}

function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={cn("block text-xs font-medium tracking-[0.08em] text-smoke uppercase", className)}>
      {label}
      {children}
    </label>
  )
}
