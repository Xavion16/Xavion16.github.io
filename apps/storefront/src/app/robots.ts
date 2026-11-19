import type { MetadataRoute } from "next"

// Demo/ödev sitesi: arama motorlarına kapalı.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } }
}
