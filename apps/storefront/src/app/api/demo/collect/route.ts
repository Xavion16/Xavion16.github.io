import { NextResponse, type NextRequest } from "next/server"

/** Demo analitik/pazarlama uç noktası: hiçbir veri saklamaz. Yalnızca rıza testleri için vardır. */
export function POST(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t")
  return new NextResponse(null, { status: t === "analytics" || t === "marketing" ? 204 : 400 })
}
