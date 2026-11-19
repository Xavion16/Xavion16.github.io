// Next.js 16: "middleware" → "proxy" olarak yeniden adlandırıldı.
import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  // API, Next iç dosyaları ve uzantılı statik dosyalar hariç tüm yollar
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
}
