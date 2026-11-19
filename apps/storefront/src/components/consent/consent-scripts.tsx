"use client"

import Script from "next/script"
import { useEffect } from "react"
import { usePathname } from "@/i18n/navigation"

export type ClientChoice = { functional: boolean; analytics: boolean; marketing: boolean } | null

function expire(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`
}

/**
 * Rızaya bağlı script/çerez yükleyici (Rapor §7.1.4). Rıza yoksa script DOM'a hiç eklenmez;
 * rıza geri alınırsa ilgili çerezler silinir.
 */
export function ConsentScripts({ choice }: { choice: ClientChoice }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!choice?.analytics) expire("arion_metrics")
    if (!choice?.marketing) expire("arion_ads")
    if (!choice?.functional) {
      expire("arion_recent")
      return
    }
    // İşlevsel: son görüntülenen ürün (yalnızca rıza varsa)
    if (pathname.startsWith("/urun/")) {
      const slug = window.location.pathname.split("/").pop() ?? ""
      document.cookie = `arion_recent=${encodeURIComponent(slug)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`
    }
  }, [choice, pathname])

  return (
    <>
      {choice?.analytics ? <Script src="/demo/analytics.js" strategy="afterInteractive" /> : null}
      {choice?.marketing ? <Script src="/demo/pixel.js" strategy="afterInteractive" /> : null}
    </>
  )
}
