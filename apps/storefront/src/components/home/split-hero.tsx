"use client"

import Image from "next/image"
import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export type SplitSide = {
  key: "women" | "men"
  src: string
  alt: string
  /** object-position vb. kırpma sınıfı */
  crop?: string
  /** Başlık, metin ve düğmeler (sunucuda üretilir) */
  content: ReactNode
}

/**
 * Açılış: ikiye bölünmüş Kadın / Erkek sahnesi (DECISIONS #078).
 * - Masaüstünde imlecin üzerine geldiği taraf genişler, diğeri daralıp loşlaşır (klavye odağında da).
 * - Genişleyen tarafta ışık imleci izler ve görseli aydınlatır (CSS değişkenleri, rAF ile yumuşak takip).
 * - Dokunmatikte iki taraf alt alta, tam görünür; hareket azaltmada ışık sabit, geçiş yok.
 */
export function SplitHero({ sides, title }: { sides: [SplitSide, SplitSide]; title: string }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const stage = ref.current
    if (!stage) return
    const live = matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches
    if (!live) return
    stage.dataset.light = "follow"
    const panels = [...stage.querySelectorAll<HTMLElement>("[data-side]")]
    const state = panels.map(() => ({ x: 0.5, y: 0.55, tx: 0.5, ty: 0.55 }))
    let raf = 0
    const tick = () => {
      let moving = false
      panels.forEach((p, i) => {
        const s = state[i]!
        s.x += (s.tx - s.x) * 0.12
        s.y += (s.ty - s.y) * 0.12
        if (Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > 0.001) moving = true
        p.style.setProperty("--lx", `${(s.x * 100).toFixed(2)}%`)
        p.style.setProperty("--ly", `${(s.y * 100).toFixed(2)}%`)
      })
      raf = moving ? requestAnimationFrame(tick) : 0
    }
    const go = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const offs = panels.map((p, i) => {
      const move = (e: PointerEvent) => {
        const r = p.getBoundingClientRect()
        state[i]!.tx = (e.clientX - r.left) / r.width
        state[i]!.ty = (e.clientY - r.top) / r.height
        go()
      }
      const leave = () => {
        state[i]!.tx = 0.5
        state[i]!.ty = 0.55
        go()
      }
      p.addEventListener("pointermove", move)
      p.addEventListener("pointerleave", leave)
      return () => {
        p.removeEventListener("pointermove", move)
        p.removeEventListener("pointerleave", leave)
      }
    })
    return () => {
      cancelAnimationFrame(raf)
      offs.forEach((off) => off())
    }
  }, [])

  return (
    <section
      ref={ref}
      aria-labelledby="hero-baslik"
      data-light="still"
      className="split-hero relative flex flex-col bg-void md:h-[max(620px,calc(100svh-100px))] md:flex-row"
      data-testid="split-hero"
    >
      <h1 id="hero-baslik" className="sr-only">
        {title}
      </h1>
      {sides.map((side, i) => (
        <article
          key={side.key}
          data-side={side.key}
          aria-labelledby={`hero-${side.key}`}
          className={cn(
            "split-side relative isolate flex min-h-[78svh] flex-1 overflow-hidden md:min-h-0",
            i === 0 ? "md:border-r md:border-ember/30" : "",
          )}
        >
          <Image
            src={side.src}
            alt={side.alt}
            fill
            priority
            sizes="(min-width: 768px) 65vw, 100vw"
            // Mobilde görsel üst kısımda kalır, metin altta koyu zeminde (ayakkabının üstüne binmez)
            className={cn("split-img object-cover max-md:!h-[58%]", side.crop)}
          />
          {/* Işık: imleci izleyen aydınlık alan, dışı karanlık */}
          <span aria-hidden="true" className="split-light pointer-events-none absolute inset-0" />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void from-42% via-void/60 via-52% to-transparent to-62% md:from-void md:from-0% md:via-void/60 md:via-30% md:to-58%"
          />
          <div
            className={cn(
              "relative mt-auto flex w-full flex-col px-5 pt-24 pb-10 sm:px-10 md:pb-24 lg:px-14",
              i === 1 ? "md:items-end md:text-right" : "",
            )}
          >
            {side.content}
          </div>
        </article>
      ))}
    </section>
  )
}
