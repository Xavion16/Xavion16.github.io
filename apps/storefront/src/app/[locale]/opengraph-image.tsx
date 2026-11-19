import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"

export const alt = "ARION — Crafted in Türkiye"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const fontDir = join(process.cwd(), "node_modules/@fontsource/archivo/files")

// Satori woff kabul eder (woff2 değil). Türkçe karakterler için latin-ext dosyası da yüklenir.
async function loadFonts() {
  const files = [
    ["archivo-latin-900-normal.woff", 900],
    ["archivo-latin-ext-900-normal.woff", 900],
    ["archivo-latin-500-normal.woff", 500],
    ["archivo-latin-ext-500-normal.woff", 500],
  ] as const
  return Promise.all(
    files.map(async ([file, weight]) => ({
      name: "Archivo",
      data: await readFile(join(fontDir, file)),
      weight,
      style: "normal" as const,
    })),
  )
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale
  const t = await getTranslations({ locale, namespace: "home.hero" })
  const tm = await getTranslations({ locale, namespace: "meta" })

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#09090B",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(255,90,54,0.85), transparent 45%), radial-gradient(circle at 10% 90%, rgba(61,123,255,0.7), transparent 45%), radial-gradient(circle at 60% 110%, rgba(43,212,125,0.5), transparent 40%)",
          color: "#fff",
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
            <path d="M6 46C19 44 29 35 35 23C39 15 47 9 58 7" stroke="#FF5A36" strokeWidth="5" strokeLinecap="round" />
            <path d="M13 53C26 51 36 43 42 31C46 23 52 19 58 18" stroke="#FF5A36" strokeWidth="5" strokeLinecap="round" />
            <path d="M22 58C32 57 41 51 47 41C50 35 54 31 58 30" stroke="#FF5A36" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: 8 }}>ARION</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 130, fontWeight: 900, lineHeight: 0.9, letterSpacing: -4 }}>
            {t("title").toLocaleUpperCase(locale)}
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 34, fontWeight: 500, color: "#D4D4D8", maxWidth: 980 }}>
            {tm("ogTagline")}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "12px 24px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.1)",
            fontSize: 24,
            fontWeight: 500,
          }}
        >
          Crafted in Türkiye.
        </div>
      </div>
    ),
    { ...size, fonts: await loadFonts() },
  )
}
