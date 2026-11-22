"use client"

import { useTranslations } from "next-intl"
import { useEffect, useSyncExternalStore } from "react"

type Skin = "gold" | "glass"
const KEY = "arion-skin"
const EVENT = "arion-skin-change"

// Görünüm durumu <html data-skin> özniteliğinde yaşar; bileşen onu dış kaynak olarak okur
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}
const read = (): Skin => (document.documentElement.dataset.skin === "glass" ? "glass" : "gold")

function apply(skin: Skin) {
  const root = document.documentElement
  if (skin === "glass") root.dataset.skin = "glass"
  else delete root.dataset.skin
  try {
    sessionStorage.setItem(KEY, skin)
  } catch {
    // gizli pencere vb.: seçim yalnızca bu sayfada kalır
  }
  window.dispatchEvent(new Event(EVENT))
}

/**
 * DENEME (DECISIONS #079): Altın ↔ Cam görünüm anahtarı.
 * Seçim yalnızca bu sekmede (sessionStorage) tutulur; çerez yazılmaz, sunucuya gitmez.
 * `?skin=glass` / `?skin=gold` adres parametresi de çalışır.
 * Geri almak: bu dosya, layout.tsx'teki iki satır ve styles/skin-glass.css silinir.
 */
export function SkinSwitch() {
  const t = useTranslations("skin")
  const skin = useSyncExternalStore(subscribe, read, () => "gold" as Skin)

  useEffect(() => {
    const param = new URLSearchParams(location.search).get("skin")
    let stored: string | null = null
    try {
      stored = sessionStorage.getItem(KEY)
    } catch {
      stored = null
    }
    apply(param === "glass" || param === "gold" ? param : stored === "glass" ? "glass" : "gold")
  }, [])

  return (
    // aside: sayfa bölgesi (landmark) içinde olmalı, yoksa axe "region" kuralı düşer
    <aside
      aria-label={t("label")}
      className="fixed bottom-20 left-4 z-[74] flex items-center gap-1 rounded-[2px] border border-chalk/20 bg-void/80 p-1 text-[0.68rem] font-medium tracking-[0.12em] uppercase backdrop-blur sm:bottom-6 sm:left-16"
      data-testid="skin-switch"
    >
      {(["gold", "glass"] as const).map((k) => (
        <button
          key={k}
          type="button"
          aria-pressed={skin === k}
          onClick={() => apply(k)}
          className={
            skin === k
              ? "min-h-9 rounded-[2px] bg-ember px-3 text-ink"
              : "min-h-9 rounded-[2px] px-3 text-chalk/80 hover:text-chalk"
          }
        >
          {t(k)}
        </button>
      ))}
    </aside>
  )
}
