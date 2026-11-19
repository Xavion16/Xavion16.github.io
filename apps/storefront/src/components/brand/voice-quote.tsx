"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  quote: string
  lang: string
  src: string
  labels: { listen: string; stop: string; voice: string }
}

const BARS = [0, 1, 2, 3, 4]

/**
 * Manifesto alıntı kutusu: fare üstüne gelince alıntının seslendirmesini çalar; çalarken kutu
 * öne çıkar, ses dalgası çubukları oynar, altta ilerleme çizgisi dolar.
 * Buton klavye için ve tarayıcı otomatik oynatmayı engellediğinde (sayfaya hiç tıklanmamışsa) çalışır.
 * Ses yapay zekâ ile üretildi → etiket her zaman görünür. Hareketler prefers-reduced-motion'da durur.
 */
export function VoiceQuote({ quote, lang, src, labels }: Props) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const a = new Audio(src)
    a.preload = "auto"
    const onPlay = () => setPlaying(true)
    const onStop = () => setPlaying(false)
    const onEnd = () => {
      setPlaying(false)
      setProgress(0)
    }
    const onTime = () => setProgress(a.duration ? a.currentTime / a.duration : 0)
    a.addEventListener("play", onPlay)
    a.addEventListener("pause", onStop)
    a.addEventListener("ended", onEnd)
    a.addEventListener("timeupdate", onTime)
    audio.current = a
    return () => {
      a.pause()
      a.removeEventListener("play", onPlay)
      a.removeEventListener("pause", onStop)
      a.removeEventListener("ended", onEnd)
      a.removeEventListener("timeupdate", onTime)
      audio.current = null
    }
  }, [src])

  function play() {
    const a = audio.current
    if (!a || !a.paused) return
    if (a.ended || a.currentTime >= a.duration) a.currentTime = 0
    a.play().catch(() => {
      /* etkileşim öncesi otomatik oynatma engeli — butonla çalınabilir */
    })
  }

  function toggle() {
    const a = audio.current
    if (!a) return
    if (a.paused) {
      play()
    } else {
      a.pause()
      a.currentTime = 0
      setProgress(0)
    }
  }

  return (
    <figure
      onMouseEnter={play}
      data-testid="voice-quote"
      data-playing={playing ? "true" : "false"}
      className={`voice-quote relative self-start overflow-hidden rounded-3xl bg-ink p-8 text-white lg:sticky lg:top-28 ${
        playing ? "is-playing" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span aria-hidden="true" className="condensed block text-7xl leading-none text-ember">
          “
        </span>
        <span aria-hidden="true" className="mt-2 flex h-8 items-end gap-1">
          {BARS.map((i) => (
            <span key={i} className="voice-bar" style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </span>
      </div>
      <blockquote lang={lang} className="voice-quote-text text-lg leading-relaxed font-semibold">
        <p>{quote}</p>
      </blockquote>

      <figcaption className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-semibold transition-colors hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          <span aria-hidden="true">{playing ? "■" : "▶"}</span>
          {playing ? labels.stop : labels.listen}
        </button>
        <span className="text-xs font-semibold tracking-wide text-smoke uppercase">{labels.voice}</span>
      </figcaption>

      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-1 bg-ember"
        style={{ width: `${progress * 100}%`, transition: "width 0.25s linear" }}
      />
    </figure>
  )
}
