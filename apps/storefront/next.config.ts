import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Strict TS: derleme tip hatasında durur (starter'daki ignoreBuildErrors kaldırıldı).
  typescript: { ignoreBuildErrors: false },
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "http", hostname: "localhost" }],
  },
}

export default withNextIntl(nextConfig)
