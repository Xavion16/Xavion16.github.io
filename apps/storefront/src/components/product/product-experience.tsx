"use client"

import type { SizeRow, WidthFitting } from "@arion/fit-engine"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { ProductFit } from "@/components/fit/product-fit"
import { VariantPicker, type PickerOption, type PickerVariant } from "@/components/shop/variant-picker"
import { buttonClass } from "@/components/ui/button"
import type { ProductGallery } from "@/lib/imagery"
import { COLOR_HEX } from "@/lib/product-colors"
import { cn } from "@/lib/utils"

type Props = {
  category: string
  name: string
  gradient: string
  /** Stüdyo galerisi; yoksa `fallback` (çizim) gösterilir */
  gallery: ProductGallery | null
  fallback: ReactNode
  /** Görsel alt metinleri (sunucuda çevrilir) */
  alts: { side: string; top: string }
  /** Mobil sepet çubuğunda gösterilen biçimlenmiş fiyat */
  priceLabel: string | null
  /** Başlık, fiyat, açıklama (sunucuda üretilir) */
  header: ReactNode
  /** Satın alma bilgileri listesi (sunucuda) */
  footer: ReactNode
  options: PickerOption[]
  variants: PickerVariant[]
  fit: { last: { code: string; category: string; rows: SizeRow[] }; sizes: number[]; widths: WidthFitting[] } | null
}

const FORM_ID = "urun-formu"

/**
 * Ürün sayfası (DECISIONS #083): solda galeri (yan + üstten görünüm, renk seçimine göre değişen ana görsel,
 * masaüstünde fareyle yakınlaştırma), sağda satın alma paneli; mobilde altta sabit "Sepete ekle" çubuğu.
 */
export function ProductExperience(props: Props) {
  const t = useTranslations("shop.product.viewer")
  const tp = useTranslations("shop.product")
  const colorTitle = props.options.find((o) => o.title === "Renk")
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [view, setView] = useState<"side" | "top">("side")
  const color = selected.Renk ?? colorTitle?.values[0] ?? null
  const g = props.gallery
  const sideSrc = g ? ((color && g.byColor[color]) ?? g.main) : null
  const complete = props.options.every((o) => o.values.length === 1 || selected[o.title])

  // Mobil çubuk: asıl "Sepete ekle" düğmesi görünmüyorken çıkar
  const buyRef = useRef<HTMLDivElement>(null)
  const [showBar, setShowBar] = useState(false)
  useEffect(() => {
    const el = buyRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShowBar(!(e?.isIntersecting ?? true)), { rootMargin: "0px 0px -10% 0px" })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    const root = document.documentElement
    if (showBar) root.dataset.buybar = "on"
    else delete root.dataset.buybar
    return () => {
      delete root.dataset.buybar
    }
  }, [showBar])

  // Üstten görünüm yalnızca ilk (varsayılan) renkte çekildi: başka renk seçiliyse yanlış renk göstermemek için gizlenir
  const isDefaultColor = !colorTitle || color === colorTitle.values[0]
  const images = g && sideSrc
    ? [
        { key: "side" as const, src: sideSrc, alt: props.alts.side, label: t("viewSide") },
        ...(isDefaultColor ? [{ key: "top" as const, src: g.top, alt: props.alts.top, label: t("viewTop") }] : []),
      ]
    : []
  const current = images.find((i) => i.key === view) ?? images[0]

  return (
    <div className="mx-auto grid max-w-[1600px] gap-8 px-4 pt-4 pb-16 sm:px-8 xl:grid-cols-[1.55fr_1fr]">
      <section aria-labelledby="sahne-baslik" className="xl:sticky xl:top-24 xl:self-start">
        <h2 id="sahne-baslik" className="sr-only">
          {t("stageTitle")}
        </h2>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          {images.length > 1 ? (
            <ul className="flex gap-2 sm:flex-col" aria-label={t("thumbs")}>
              {images.map((img) => (
                <li key={img.key}>
                  <button
                    type="button"
                    onClick={() => setView(img.key)}
                    aria-pressed={view === img.key}
                    aria-label={img.label}
                    className={cn(
                      "relative block aspect-[4/5] w-16 overflow-hidden rounded-[2px] border transition-colors sm:w-20",
                      view === img.key ? "border-ember" : "border-chalk/15 hover:border-chalk/50",
                    )}
                    data-testid={`thumb-${img.key}`}
                  >
                    <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div
            className={cn(
              // Genişlik akıştan gelir, yükseklik 4:5 oranından; ekran yüksekliğini aşmasın diye genişlik sınırlanır
              "relative grid aspect-[4/5] w-full max-w-[calc(80vh*0.8)] place-items-center overflow-hidden rounded-[4px] bg-gradient-to-br sm:flex-1",
              props.gradient,
            )}
            data-testid="stage-photo"
          >
            {current ? <ZoomImage key={current.src} src={current.src} alt={current.alt} /> : props.fallback}
          </div>
        </div>
      </section>

      {/* Satın alma paneli */}
      <div>
        {props.header}
        <div ref={buyRef} className="glass mt-8 rounded-[4px] p-5 sm:p-6">
          <VariantPicker
            formId={FORM_ID}
            options={props.options}
            variants={props.variants}
            swatches={COLOR_HEX}
            onSelectionChange={(s) => {
              setSelected(s)
              if (s.Renk !== selected.Renk) setView("side")
            }}
          />
        </div>
        {props.fit ? (
          <div className="mt-6">
            <ProductFit last={props.fit.last} category={props.category} sizes={props.fit.sizes} widths={props.fit.widths} />
          </div>
        ) : null}
        {props.footer}
      </div>

      {/* Mobil sabit sepet çubuğu */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[72] flex items-center justify-between gap-4 border-t border-chalk/15 bg-void/95 px-4 py-3 backdrop-blur transition-[transform,visibility] lg:hidden",
          // Gizliyken görünmez: odaklanamaz, erişilebilirlik ağacından çıkar
          showBar ? "visible translate-y-0" : "invisible translate-y-full",
        )}
        data-testid="buy-bar"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{props.name}</p>
          {props.priceLabel ? <p className="text-sm text-ember">{props.priceLabel}</p> : null}
        </div>
        {complete ? (
          <button type="submit" form={FORM_ID} className={buttonClass({ size: "md" })}>
            {tp("addToCart")}
          </button>
        ) : (
          <button
            type="button"
           
            onClick={() => buyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className={buttonClass({ size: "md" })}
          >
            {tp("chooseSize")}
          </button>
        )}
      </div>
    </div>
  )
}

/** Masaüstünde (fare) üzerine gelince imleç noktasından 2× yakınlaştırır; dokunmatikte sabit. */
function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const style: CSSProperties = zoom
    ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
    : { transform: "scale(1)" }
  return (
    <div
      className="absolute inset-0 [@media(hover:hover)]:cursor-zoom-in"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return
        const r = e.currentTarget.getBoundingClientRect()
        setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
      }}
      onPointerLeave={() => setZoom(null)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(min-width: 1280px) 50vw, 100vw"
        className="gallery-in object-cover transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={style}
      />
    </div>
  )
}
