import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

/**
 * Statik yayın (GitHub Pages, DECISIONS #087): `NEXT_PUBLIC_ARION_STATIC=1` ile derlenir
 * (scripts/static-export.mjs). Yalnızca *.static.tsx sarmalayıcıları sayfa sayılır; sunucu işlemleri
 * tarayıcıda çalışan gösterim sürümleriyle değiştirilir; backend yanıtları snapshot/'tan okunur.
 */
const STATIC = process.env.NEXT_PUBLIC_ARION_STATIC === "1"
const ACTIONS = ["account", "areion", "cart", "consent", "fit-twin", "help", "repair"] as const

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Strict TS: derleme tip hatasında durur (starter'daki ignoreBuildErrors kaldırıldı).
  // Statik derlemede rota tipleri ayrı klasörde üretildiği için tip denetimi burada atlanır;
  // aynı kod normal derlemede ve `tsc --noEmit` ile denetlenir (DECISIONS #087).
  typescript: { ignoreBuildErrors: STATIC },
  poweredByHeader: false,
  // Saf TS paketleri doğrudan derlenir
  transpilePackages: ["@arion/ai-guard", "@arion/fit-engine"],
  // PDF üretimi font dosyasını require.resolve ile bulur; paket Node tarafından doğrudan yüklenmeli
  serverExternalPackages: ["@arion/legal-texts", "pdf-lib", "@pdf-lib/fontkit"],
  images: {
    unoptimized: STATIC,
    // images.unsplash.com: eski DEMO görselleri (lib/imagery.ts)
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Tamir talebi en fazla 3 fotoğraf taşır (istemcide küçültülür; her biri ≤ 1,5 MB)
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  ...(STATIC
    ? {
        output: "export" as const,
        // Geliştirme sunucusunun .next klasörüyle çakışmasın
        distDir: ".next-static",
        trailingSlash: true,
        pageExtensions: ["static.tsx", "static.ts"],
        turbopack: {
          resolveAlias: Object.fromEntries(
            ACTIONS.map((a) => [`@/lib/actions/${a}-actions`, `./src/lib/static/actions/${a}-actions.ts`]),
          ),
        },
      }
    : {}),
}

export default withNextIntl(nextConfig)
