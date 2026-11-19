"use client"

import { useEffect, useId, useRef, useState, useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { ManeMark } from "@/components/brand/mane-mark"
import { buttonClass } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { acceptAiConsentAction, handoffAction } from "@/lib/actions/areion-actions"
import { cn } from "@/lib/utils"
import { OPEN_AREION_EVENT } from "./open-button"

type Msg = { role: "user" | "assistant"; text: string; sources?: Array<{ title: string; url?: string }> }

/**
 * Areion — AI ayakkabı danışmanı (Rapor §6.7). Her zaman yapay zekâ olduğunu söyler;
 * yurt dışı aktarım için ayrı açık rıza alınmadan tek mesaj bile gönderilmez.
 */
export function AreionChat({
  consented,
  consentText,
  defaults,
}: {
  consented: boolean
  consentText: string
  defaults: { full_name?: string; email?: string }
}) {
  const t = useTranslations("areion")
  const locale = useLocale() as "tr" | "en"
  const [open, setOpen] = useState(false)
  const [hasConsent, setHasConsent] = useState(consented)
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
    if (hasConsent) inputRef.current?.focus()
    return () => window.removeEventListener("keydown", onKey)
  }, [open, hasConsent])

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    const next: Msg[] = [...messages, { role: "user", text }]
    setMessages(next)
    setInput("")
    setBusy(true)
    try {
      const res = await fetch("/api/areion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locale,
          // İlk karşılama mesajı modele gönderilmez
          messages: next.slice(1).map(({ role, text: m }) => ({ role, text: m })),
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as { reply: string; handoff: boolean; sources: Msg["sources"] }
      setMessages((m) => [...m, { role: "assistant", text: data.reply, sources: data.sources }])
      if (data.handoff) setShowHandoff(true)
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: t("error") }])
      setShowHandoff(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 bottom-4 z-[75] inline-flex min-h-14 items-center gap-2 rounded-full bg-ember px-5 font-bold text-ink shadow-[0_10px_30px_-10px_rgb(255_90_54/0.8)] hover:bg-white sm:right-6 sm:bottom-6"
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
          className="glass fixed right-3 bottom-24 z-[76] flex max-h-[min(640px,calc(100dvh-8rem))] w-[min(420px,calc(100vw-1.5rem))] flex-col rounded-[28px] bg-[rgb(16_16_20/0.94)] sm:right-6"
        >
          <header className="flex items-center gap-3 border-b border-white/10 p-4">
            <span className="grid size-10 place-items-center rounded-full bg-ember text-ink">
              <ManeMark className="size-6" strokeWidth={5} />
            </span>
            <div>
              <p className="font-bold">{t("title")}</p>
              <p className="text-xs text-smoke">{t("subtitle")} · Gemini</p>
            </div>
          </header>
          <p className="border-b border-white/10 px-4 py-2 text-xs text-smoke" data-testid="ai-disclosure">
            {t("disclosure")}
          </p>

          {!hasConsent ? (
            <div className="overflow-y-auto p-4 text-sm" data-testid="ai-consent">
              <p className="font-bold">{t("consentTitle")}</p>
              <p className="mt-2 leading-relaxed text-smoke">{consentText}</p>
              <Link href="/yasal/kvkk-aydinlatma" className="mt-2 inline-block underline underline-offset-4">
                {t("privacy")}
              </Link>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const r = await acceptAiConsentAction()
                      if (r.ok) setHasConsent(true)
                    })
                  }
                  className={buttonClass({ variant: "light" })}
                >
                  {t("consentAccept")}
                </button>
                <button type="button" onClick={() => { setHasConsent(false); setShowHandoff(true) }} className={buttonClass({ variant: "glass" })}>
                  {t("consentDecline")}
                </button>
              </div>
            </div>
          ) : null}

          <ol ref={listRef} className={cn("flex-1 space-y-3 overflow-y-auto p-4", !hasConsent && !showHandoff && "hidden")} aria-live="polite">
            {hasConsent
              ? messages.map((m, i) => (
                  <li key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      data-role={m.role}
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line",
                        m.role === "user" ? "bg-white text-ink" : "bg-white/[0.07] text-white",
                      )}
                    >
                      <span className="sr-only">{m.role === "user" ? "Sen: " : "Areion: "}</span>
                      {m.text}
                      {m.sources?.length ? (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {m.sources.map((s) =>
                            s.url ? (
                              <li key={s.url}>
                                <Link
                                  href={{ pathname: "/urun/[slug]", params: { slug: s.url.split("/").pop() ?? "" } }}
                                  className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white hover:text-ink"
                                >
                                  {s.title}
                                </Link>
                              </li>
                            ) : null,
                          )}
                        </ul>
                      ) : null}
                    </div>
                  </li>
                ))
              : null}
            {busy ? <li className="text-xs text-smoke">{t("thinking")}</li> : null}

            {showHandoff && !ticket ? (
              <li>
                <form
                  className="space-y-2 rounded-2xl border border-white/15 p-3"
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
                    <input name="full_name" required minLength={2} defaultValue={defaults.full_name} className="mt-1 min-h-11 w-full rounded-xl border border-white/20 bg-carbon px-3 text-sm text-white" />
                  </label>
                  <label className="block text-xs">
                    {t("handoffEmail")}
                    <input name="email" type="email" required defaultValue={defaults.email} className="mt-1 min-h-11 w-full rounded-xl border border-white/20 bg-carbon px-3 text-sm text-white" />
                  </label>
                  <button type="submit" disabled={pending} className={buttonClass({ variant: "light", className: "w-full" })}>
                    {t("handoffSubmit")}
                  </button>
                  <p className="text-[0.7rem] text-smoke">{t("masked")}</p>
                </form>
              </li>
            ) : null}
            {ticket ? (
              <li role="status" data-testid="handoff-done" className="rounded-2xl bg-moss/15 p-3 text-sm">
                {t("handoffDone", { ticket })}
              </li>
            ) : null}
          </ol>

          {hasConsent ? (
            <form
              className="flex items-center gap-2 border-t border-white/10 p-3"
              onSubmit={(e) => {
                e.preventDefault()
                void send()
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
                maxLength={1000}
                placeholder={t("placeholder")}
                className="min-h-11 flex-1 rounded-full border border-white/20 bg-carbon px-4 text-sm text-white placeholder:text-smoke"
              />
              <button type="submit" disabled={busy || !input.trim()} className={buttonClass({ size: "md" })}>
                {t("send")}
              </button>
            </form>
          ) : null}
          {hasConsent && !showHandoff && !ticket ? (
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
