#!/usr/bin/env node
/**
 * Statik yayın derlemesi (GitHub Pages, DECISIONS #087).
 *
 *   node scripts/static-export.mjs            → snapshot/'tan okuyarak derler (backend gerekmez)
 *   node scripts/static-export.mjs --record   → çalışan backend'den snapshot/'u yeniden kaydeder
 *
 * Adımlar: (1) yayına girecek sayfalar için *.static.tsx sarmalayıcıları üretir, (2) Next'i
 * NEXT_PUBLIC_ARION_STATIC=1 ile derler (output: export → out/), (3) kök yönlendirmesi, 404 ve
 * .nojekyll ekler, (4) sarmalayıcıları siler.
 */
import { spawnSync } from "node:child_process"
import { copyFileSync, existsSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const APP = path.join(ROOT, "src/app/[locale]")
const RECORD = process.argv.includes("--record")

/** Passport demo kodları (backend seed-workshop.ts ile aynı) */
const PASSPORTS = ["ARN-2026-000123", "ARN-2024-000418", "ARN-2025-000207", "ARN-2025-000311", "ARN-2024-000502", "ARN-2026-000140"]
const CATEGORIES = ["topuklu", "kislik-bot", "sneaker", "klasik", "cocuk", "erkek"]

/**
 * Yayına girecek rotalar. `params`: dinamik parçalar için generateStaticParams gövdesi.
 * `component`: sayfa yerine kullanılacak statik bileşen (ör. tarayıcı sepeti).
 * Hesap paneli, ödeme, sipariş ve API uçları gerçek oturum/sepet gerektirdiği için yayına girmez.
 */
const ROUTES = [
  { file: "layout" },
  { file: "not-found" },
  { file: "page" },
  { file: "koleksiyon/page" },
  { file: "koleksiyon/[kategori]/page", params: `return ${JSON.stringify(CATEGORIES.map((kategori) => ({ kategori })))}` },
  {
    file: "urun/[slug]/page",
    imports: `import { listProducts } from "@/lib/medusa/catalog"`,
    params: `return (await listProducts({})).map((p) => ({ slug: p.handle }))`,
  },
  { file: "pasaport/[kod]/page", params: `return ${JSON.stringify(PASSPORTS.map((kod) => ({ kod })))}` },
  { file: "manifesto/page" },
  { file: "ayak-ikizi/page" },
  { file: "atolye/page" },
  { file: "omur-plani/page" },
  { file: "seffaflik/page" },
  { file: "yardim/page" },
  { file: "yardim/siparis-takip/page" },
  { file: "yardim/iade/page" },
  { file: "yardim/talep/page" },
  { file: "iletisim/page" },
  { file: "hakkimizda/page" },
  { file: "yasal/[slug]/page" },
  { file: "yasal/kvkk-basvuru/page" },
  { file: "hesabim/giris/page" },
  { file: "hesabim/kayit/page" },
  { file: "sepet/page", component: "@/components/static/static-cart-page" },
]

const wrappers = []

function exportsOf(src) {
  const has = (re) => re.test(src)
  return {
    generateMetadata: has(/export (async )?function generateMetadata\b/),
    metadata: has(/export const metadata\b/),
    viewport: has(/export const viewport\b/),
    generateStaticParams: has(/export (async )?function generateStaticParams\b/),
  }
}

function prepare() {
  for (const r of ROUTES) {
    const source = path.join(APP, `${r.file}.tsx`)
    if (!existsSync(source)) throw new Error(`Rota bulunamadı: ${r.file}`)
    const ex = exportsOf(readFileSync(source, "utf8"))
    const base = `./${path.basename(r.file)}`
    const lines = ["// OTOMATİK ÜRETİLDİ — scripts/static-export.mjs (statik yayın sarmalayıcısı, commit edilmez)"]
    if (r.imports) lines.push(r.imports)
    lines.push(r.component ? `export { default } from "${r.component}"` : `export { default } from "${base}"`)
    const named = []
    if (ex.generateMetadata) named.push("generateMetadata")
    if (ex.metadata) named.push("metadata")
    if (ex.viewport) named.push("viewport")
    if (ex.generateStaticParams && !r.params) named.push("generateStaticParams")
    if (named.length) lines.push(`export { ${named.join(", ")} } from "${base}"`)
    if (r.params) lines.push(`export async function generateStaticParams() {\n  ${r.params}\n}`)
    if (r.file !== "not-found") {
      lines.push(`export const dynamic = "force-static"`)
      if (r.params || ex.generateStaticParams) lines.push(`export const dynamicParams = false`)
    }
    const out = path.join(APP, `${r.file}.static.tsx`)
    writeFileSync(out, lines.join("\n") + "\n")
    wrappers.push(out)
  }
}

function cleanup() {
  for (const w of wrappers) rmSync(w, { force: true })
}

/**
 * Next 16 statik export, ön yükleme parçalarını klasör içine yazar (__next.$d$locale/__PAGE__.txt)
 * ama istemci noktalı tek dosya adıyla ister (__next.$d$locale.__PAGE__.txt). Düz adlı kopyalar üretilir.
 */
function flattenSegments(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith("__next.")) {
      const walk = (d, prefix) => {
        for (const e of readdirSync(d, { withFileTypes: true })) {
          const p = path.join(d, e.name)
          if (e.isDirectory()) walk(p, `${prefix}.${e.name}`)
          else copyFileSync(p, path.join(dir, `${prefix}.${e.name}`))
        }
      }
      walk(full, entry.name)
    } else flattenSegments(full)
  }
}

function finish() {
  // distDir özelleştirilince Next statik çıktıyı o klasöre yazar; yayın klasörü out/ olur
  const out = path.join(ROOT, "out")
  rmSync(out, { recursive: true, force: true })
  renameSync(path.join(ROOT, ".next-static"), out)
  // Kök: varsayılan dile yönlendir (sunucu yok, meta + JS yönlendirme)
  const redirect = (to) => `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>ARION</title>
<meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=${to}">
<script>location.replace(${JSON.stringify(to)} + location.hash)</script></head>
<body style="background:#0a0908;color:#efe7d8;font-family:sans-serif"><a href="${to}">ARION</a></body></html>\n`
  writeFileSync(path.join(out, "index.html"), redirect("/tr/"))
  // 404: Türkçe "bulunamadı" sayfası varsa onu kullan, yoksa ana sayfaya yönlendir
  const nf = path.join(out, "tr", "404.html")
  writeFileSync(path.join(out, "404.html"), existsSync(nf) ? readFileSync(nf) : redirect("/tr/"))
  flattenSegments(out)
  // GitHub Pages'in Jekyll işlemesi _next/ klasörünü gizlemesin
  writeFileSync(path.join(out, ".nojekyll"), "")
}

// Next derleme sırasında next-env.d.ts'yi kendi tip klasörüne yönlendirir; geliştirme sürümü korunur
const NEXT_ENV = path.join(ROOT, "next-env.d.ts")
const nextEnvBackup = existsSync(NEXT_ENV) ? readFileSync(NEXT_ENV, "utf8") : null

try {
  prepare()
  const env = { ...process.env, NEXT_PUBLIC_ARION_STATIC: "1", ...(RECORD ? { ARION_SNAPSHOT: "record" } : {}) }
  rmSync(path.join(ROOT, ".next-static"), { recursive: true, force: true })
  const res = spawnSync("pnpm", ["exec", "next", "build"], { cwd: ROOT, env, stdio: "inherit", shell: true })
  if (res.status !== 0) throw new Error(`next build başarısız (çıkış ${res.status})`)
  finish()
  console.log("\nStatik site hazır → apps/storefront/out")
} finally {
  cleanup()
  if (nextEnvBackup !== null) writeFileSync(NEXT_ENV, nextEnvBackup)
}
