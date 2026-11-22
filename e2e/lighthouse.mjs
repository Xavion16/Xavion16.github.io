// Lighthouse erişilebilirlik ölçümü (Faz 1 kabulü: ≥ 95). Kullanım: pnpm e2e:lighthouse
// Chrome yolu: CHROME_PATH ya da Playwright'ın kurduğu Chromium.
import { chromium } from "@playwright/test"
import * as chromeLauncher from "chrome-launcher"
import lighthouse from "lighthouse"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const BASE = process.env.STOREFRONT_URL ?? "http://localhost:8000"
const MIN = Number(process.env.LH_MIN_A11Y ?? 95)
const PAGES = [
  "/tr",
  "/en",
  "/tr/manifesto",
  "/tr/koleksiyon",
  "/tr/urun/kackar-su-gecirmez-bot",
  "/tr/sepet",
  "/tr/hesabim/kayit",
  "/tr/yasal/kvkk-basvuru",
  "/tr/yasal/on-bilgilendirme",
  "/tr/yardim",
  "/tr/yardim/iade",
  "/tr/ayak-ikizi",
  "/tr/pasaport/ARN-2026-000123",
  "/tr/omur-plani",
  "/tr/seffaflik",
  "/tr/atolye",
]
const here = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(here, "../docs/screenshots/faz-1")

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH ?? chromium.executablePath(),
  chromeFlags: ["--headless=new", "--no-sandbox"],
})

const rows = []
let failed = false
try {
  for (const formFactor of ["mobile", "desktop"]) {
    for (const p of PAGES) {
      const result = await lighthouse(`${BASE}${p}`, {
        port: chrome.port,
        onlyCategories: ["accessibility", "best-practices", "seo"],
        formFactor,
        screenEmulation:
          formFactor === "desktop"
            ? {
                mobile: false,
                width: 1350,
                height: 940,
                deviceScaleFactor: 1,
                disabled: false,
              }
            : undefined,
        logLevel: "error",
      })
      const c = result.lhr.categories
      const score = (k) => Math.round((c[k]?.score ?? 0) * 100)
      const a11y = score("accessibility")
      if (a11y < MIN) failed = true
      const failing = Object.values(result.lhr.audits)
        .filter(
          (a) =>
            a.score === 0 &&
            result.lhr.categories.accessibility.auditRefs.some(
              (r) => r.id === a.id,
            ),
        )
        .map((a) => a.id)
      rows.push({
        formFactor,
        page: p,
        a11y,
        bestPractices: score("best-practices"),
        seo: score("seo"),
        failing: failing.join(","),
      })
    }
  }
} finally {
  chrome.kill()
}

console.table(rows)
await mkdir(outDir, { recursive: true })
await writeFile(
  path.join(outDir, "lighthouse.json"),
  JSON.stringify(rows, null, 2),
)
if (failed) {
  console.error(`✖ Erişilebilirlik skoru ${MIN} altında olan sayfa var.`)
  process.exit(1)
}
console.log(`✔ Bütün sayfalarda erişilebilirlik ≥ ${MIN}`)
