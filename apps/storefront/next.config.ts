import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Strict TS: derleme tip hatasında durur (starter'daki ignoreBuildErrors kaldırıldı).
  typescript: { ignoreBuildErrors: false },
  poweredByHeader: false,
  // PDF üretimi font dosyasını require.resolve ile bulur; paket Node tarafından doğrudan yüklenmeli
  // Saf TS paketleri doğrudan derlenir
  transpilePackages: ["@arion/ai-guard"],
  serverExternalPackages: ["@arion/legal-texts", "pdf-lib", "@pdf-lib/fontkit"],
  images: {
    remotePatterns: [{ protocol: "http", hostname: "localhost" }],
  },
}

export default withNextIntl(nextConfig)
