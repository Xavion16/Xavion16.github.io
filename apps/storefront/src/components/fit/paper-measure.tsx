"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { buttonClass } from "@/components/ui/button"
import { measureFromPoints, type Pt } from "@/lib/fit/homography"

/**
 * A4 kâğıt yöntemi (deneysel): fotoğraf YALNIZCA tarayıcıda, <canvas> üzerinde işlenir.
 * Dosya hiçbir yere yüklenmez; bileşen kapanınca nesne URL'si serbest bırakılır.
 * Kullanıcı 8 noktayı işaretler → homografi ile milimetre.
 */
export function PaperMeasure({ onResult }: { onResult: (m: { lengthMm: number; ballWidthMm: number }) => void }) {
  const t = useTranslations("fit.paper")
  const labels = t.raw("pointLabels") as string[]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [points, setPoints] = useState<Pt[]>([])
  const urlRef = useRef<string | null>(null)

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    },
    [],
  )

  useEffect(() => {
    const c = canvasRef.current
    if (!c || !img) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    ctx.drawImage(img, 0, 0)
    const r = Math.max(6, Math.round(img.naturalWidth / 120))
    points.forEach((p, i) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fillStyle = i < 4 ? "#3D7BFF" : i < 6 ? "#FF5A36" : "#2BD47D"
      ctx.fill()
      ctx.lineWidth = r / 3
      ctx.strokeStyle = "#fff"
      ctx.stroke()
    })
    if (points.length >= 4) {
      ctx.beginPath()
      points.slice(0, 4).forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
      ctx.closePath()
      ctx.strokeStyle = "#3D7BFF"
      ctx.lineWidth = r / 2
      ctx.stroke()
    }
  }, [img, points])

  function onFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    const url = URL.createObjectURL(file)
    urlRef.current = url
    const im = new Image()
    im.onload = () => {
      setImg(im)
      setPoints([])
    }
    im.src = url
  }

  function onClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const c = canvasRef.current
    if (!c || points.length >= 8) return
    const rect = c.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * c.width
    const y = ((e.clientY - rect.top) / rect.height) * c.height
    setPoints((p) => [...p, { x, y }])
  }

  const result = points.length === 8 ? measureFromPoints(points) : null

  return (
    <div className="space-y-4">
      <p className="text-smoke">{t("intro")}</p>
      <p className="rounded-[4px] border border-moss/40 bg-moss/10 p-3 text-sm text-white">{t("local")}</p>
      <label className={buttonClass({ variant: "glass" })}>
        {t("choose")}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => onFile(e.target.files?.[0])}
          data-testid="paper-file"
        />
      </label>
      {img ? (
        <>
          <p className="text-sm text-smoke">{t("instructions")}</p>
          <p aria-live="polite" className="font-semibold text-white">
            {result
              ? t("done", { length: result.lengthMm, width: result.ballWidthMm })
              : t("next", { label: labels[points.length] ?? "" })}
          </p>
          <canvas
            ref={canvasRef}
            onClick={onClick}
            aria-label={t("canvasLabel")}
            className="max-h-[70vh] w-full cursor-crosshair rounded-[4px] border border-white/15 object-contain"
          />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={buttonClass({ variant: "glass" })} onClick={() => setPoints([])}>
              {t("reset")}
            </button>
            {result ? (
              <button type="button" className={buttonClass({})} onClick={() => onResult(result)}>
                {t("use")}
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}
