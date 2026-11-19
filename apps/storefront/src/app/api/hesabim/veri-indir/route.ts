import { NextResponse } from "next/server"
import { sdk } from "@/lib/medusa/client"
import { getAuthHeaders } from "@/lib/medusa/cookies"

/** "Verilerimi indir" — üyenin kişisel verilerini JSON dosyası olarak verir (KVKK m.11). */
export async function GET() {
  const headers = await getAuthHeaders()
  if (!headers.authorization) return NextResponse.json({ message: "Giriş gerekli" }, { status: 401 })
  try {
    const data = await sdk.client.fetch<Record<string, unknown>>("/store/arion/me/export", { headers })
    const date = new Date().toISOString().slice(0, 10)
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="arion-verilerim-${date}.json"`,
        "cache-control": "no-store",
      },
    })
  } catch {
    return NextResponse.json({ message: "Dışa aktarım başarısız" }, { status: 502 })
  }
}
