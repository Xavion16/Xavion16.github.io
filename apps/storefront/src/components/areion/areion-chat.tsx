"use client"

import { useEffect, useId, useRef, useState, useTransition } from "react"
import { useLocale, useMessages, useTranslations } from "next-intl"
import { ManeMark } from "@/components/brand/mane-mark"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { handoffAction } from "@/lib/actions/areion-actions"
import { cn } from "@/lib/utils"
import { OPEN_AREION_EVENT } from "./open-button"

type Topic = "health" | "size" | "returns" | "shipping" | "repair" | "heels" | "men" | "kids" | "fallback"
type LinkKey = "fitTwin" | "returns" | "help" | "lifetime" | "heels" | "men" | "kids"
type Msg = { role: "user" | "assistant"; text: string; link?: LinkKey }

/** Hazır yanıt konuları ve anahtar kelimeleri (küçük harf, TR + EN). Sıra önemlidir: ilk eşleşen kazanır. */
const TOPICS: Array<{ topic: Exclude<Topic, "fallback">; words: string[]; link?: LinkKey }> = [
  // Sağlık soruları her zaman önce yakalanır: tavsiye/teşhis yok, hekime yönlendirme (CLAUDE.md)
  { topic: "health", words: ["ağrı", "acı", "halluks", "nasır", "diyabet", "şiş", "hekim", "doktor", "pain", "bunion", "diabet", "swollen", "doctor", "medical"] },
  { topic: "size", words: ["numara", "beden", "kalıp", "dar", "geniş", "size", "fit", "wide", "narrow", "41", "42", "38", "39", "40"], link: "fitTwin" },
  { topic: "returns", words: ["iade", "değişim", "cayma", "return", "exchange", "refund"], link: "returns" },
  { topic: "shipping", words: ["kargo", "teslim", "sipariş", "nerede", "shipping", "delivery", "order", "track"], link: "help" },
  { topic: "repair", words: ["tamir", "taban", "pençe", "onarım", "pasaport", "repair", "resole", "passport"], link: "lifetime" },
  { topic: "heels", words: ["topuk", "stiletto", "çizme", "sandalet", "kadın", "heel", "boot", "sandal", "women"], link: "heels" },
  { topic: "men", words: ["erkek", "oxford", "loafer", "derby", "chelsea", "men", "klasik"], link: "men" },
  { topic: "kids", words: ["çocuk", "bebek", "okul", "kid", "child", "school"], link: "kids" },
]

function pick(text: string): { topic: Topic; link?: LinkKey } {
  const q = text.toLocaleLowerCase("tr")
  const hit = TOPICS.find((t) => t.words.some((w) => q.includes(w)))
  return hit ? { topic: hit.topic, link: hit.link } : { topic: "fallback" }
}

/**
 * Areion — gösterim amaçlı danışman (DECISIONS #087). Yapay zekâ bağlantısı kaldırıldı:
 * yanıtlar konuya göre seçilen hazır metinlerdir, hiçbir mesaj bir servise gönderilmez.
 */
export function AreionChat({ defaults }: { defaults: { full_name?: string; email?: string } }) {
  const t = useTranslations("areion")
  const replies = (useMessages() as { areion: { replies: Record<Topic, string> } }).areion.replies
  const locale = useLocale() as "tr" | "en"
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: t("greeting") }])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [showHandoff, setShowHandoff] = useState(false)
  const [ticket, setTicket] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const panelId = useId()
  const listRef = useRef<HTMLOListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(OPEN_AREION_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_AREION_EVENT, onOpen)
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, busy, showHandoff, ticket])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    inputRef.current?.focus()
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  function send() {
    const text = input.trim()
    if (!text || busy) return
    setMessages((m) => [...m, { role: "user", text }])
    setInput("")
    setBusy(true)
    const { topic, link } = pick(text)
    // Kısa bir "yazıyor" anı: hazır yanıt olduğu belli olmasın diye değil, okunabilirlik için
    window.setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: replies[topic], link }])
      if (topic === "fallback" || topic === "health") setShowHandoff(true)
      setBusy(false)
    }, 450)
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        data-testid="areion-launcher"
        className="fixed right-4 bottom-4 z-[75] inline-flex min-h-12 items-center gap-2 rounded-[2px] border border-chalk/25 bg-carbon px-4 text-[0.72rem] font-medium tracking-[0.14em] text-chalk uppercase shadow-[0_12px_30px_-12px_rgb(0_0_0/0.8)] hover:border-ember sm:right-6 sm:bottom-6"
      >
        <ManeMark className="size-6" strokeWidth={5} />
        <span>{open ? t("close") : t("open")}</span>
      </button>

      {open ? (
        <section
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-label={`${t("title")} — ${t("subtitle")}`}
          className="glass fixed right-3 bottom-24 z-[76] flex max-h-[min(640px,calc(100dvh-8rem))] w-[min(420px,calc(100vw-1.5rem))] flex-col rounded-[4px] bg-[rgb(14_12_10/0.96)] sm:right-6"
        >
          <header className="flex items-center gap-3 border-b border-white/10 p-4">
            <span className="grid size-10 place-items-center rounded-full bg-ember text-ink">
              <ManeMark className="size-6" strokeWidth={5} />
            </span>
            <div>
              <p className="font-bold">{t("title")}</p>
              <p className="text-xs text-smoke">{t("subtitle")}</p>
            </div>
          </header>
          <p className="border-b border-white/10 px-4 py-2 text-xs text-smoke" data-testid="ai-disclosure">
            {t("disclosure")}
          </p>

          <ol ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((m, i) => (
              <li key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  data-role={m.role}
                  className={cn(
                    "max-w-[85%] rounded-[4px] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line",
                    m.role === "user" ? "bg-white text-ink" : "bg-white/[0.07] text-white",
                  )}
                >
                  <span className="sr-only">{m.role === "user" ? "Sen: " : "Areion: "}</span>
                  {m.text}
                  {m.link ? <ReplyLink to={m.link} label={t(`links.${m.link}`)} /> : null}
                </div>
              </li>
            ))}
            {busy ? <li className="text-xs text-smoke">{t("thinking")}</li> : null}

            {showHandoff && !ticket ? (
              <li>
                <form
                  className="space-y-2 rounded-[4px] border border-white/15 p-3"
                  data-testid="handoff-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    startTransition(async () => {
                      const r = await handoffAction({
                        full_name: String(fd.get("full_name") ?? ""),
                        email: String(fd.get("email") ?? ""),
                        locale,
                        transcript: messages.slice(1).map(({ role, text }) => ({ role, text })),
                      })
                      if (r.ok && r.ticket) setTicket(r.ticket)
                    })
                  }}
                >
                  <p className="text-sm font-semibold">{t("handoff")}</p>
                  <label className="block text-xs">
                    {t("handoffName")}
                    <input name="full_name" required minLength={2} defaultValue={defaults.full_name} className="mt-1 min-h-11 w-full rounded-[2px] border border-white/20 bg-carbon px-3 text-sm text-white" />
                  </label>
                  <label className="block text-xs">
                    {t("handoffEmail")}
                    <input name="email" type="email" required defaultValue={defaults.email} className="mt-1 min-h-11 w-full rounded-[2px] border border-white/20 bg-carbon px-3 text-sm text-white" />
                  </label>
                  <button type="submit" disabled={pending} className={buttonClass({ variant: "light", className: "w-full" })}>
                    {t("handoffSubmit")}
                  </button>
                </form>
              </li>
            ) : null}
            {ticket ? (
              <li role="status" data-testid="handoff-done" className="rounded-[4px] bg-moss/15 p-3 text-sm">
                {t("handoffDone", { ticket })}
              </li>
            ) : null}
          </ol>

          <form
            className="flex items-center gap-2 border-t border-white/10 p-3"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <label htmlFor={`${panelId}-input`} className="sr-only">
              {t("placeholder")}
            </label>
            <input
              id={`${panelId}-input`}
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder={t("placeholder")}
              className="min-h-11 flex-1 rounded-[2px] border border-white/20 bg-carbon px-4 text-sm text-white placeholder:text-smoke"
            />
            <button type="submit" disabled={busy || !input.trim()} className={buttonClass({ size: "md" })}>
              {t("send")}
            </button>
          </form>
          {!showHandoff && !ticket ? (
            <button
              type="button"
              onClick={() => setShowHandoff(true)}
              className="mx-3 mb-3 min-h-11 text-left text-xs text-smoke underline underline-offset-4 hover:text-white"
            >
              {t("handoff")}
            </button>
          ) : null}
        </section>
      ) : null}
    </>
  )
}

function ReplyLink({ to, label }: { to: LinkKey; label: string }) {
  const cls = "mt-2 inline-flex rounded-[2px] bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white hover:text-ink"
  switch (to) {
    case "fitTwin":
      return <Link href="/ayak-ikizi" className={cls}>{label}</Link>
    case "returns":
      return <Link href="/yardim/iade" className={cls}>{label}</Link>
    case "help":
      return <Link href="/yardim" className={cls}>{label}</Link>
    case "lifetime":
      return <Link href="/omur-plani" className={cls}>{label}</Link>
    case "heels":
      return <Link href={{ pathname: "/koleksiyon/[kategori]", params: { kategori: "topuklu" } }} className={cls}>{label}</Link>
    case "men":
      return <Link href={{ pathname: "/koleksiyon/[kategori]", params: { kategori: "erkek" } }} className={cls}>{label}</Link>
    case "kids":
      return <Link href={{ pathname: "/koleksiyon/[kategori]", params: { kategori: "cocuk" } }} className={cls}>{label}</Link>
  }
}
