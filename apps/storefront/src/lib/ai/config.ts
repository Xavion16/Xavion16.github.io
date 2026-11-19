import "server-only"

/**
 * Areion model yapılandırması — model adı TEK yerde (Rapor §6.7).
 * Sağlayıcıdan bağımsız: Vercel AI SDK; şu an Google Gemini.
 * GEMINI_API_KEY yoksa ya da AI_CHAT_ADAPTER=mock ise mock yanıt (SSS'den) kullanılır.
 */
export const AREION = {
  provider: "google" as const,
  model: process.env.AREION_MODEL ?? "gemini-3.8-flash",
  temperature: 0.3,
  // Gemini 3.x "düşünen" modeldir; düşünme token'ları da bu bütçeden düşer
  maxOutputTokens: 1500,
  /** Kısa yanıtlar için düşük düşünme (gemini-3.8-flash "minimal" desteklemiyor) */
  thinkingLevel: "low" as const,
  maxHistory: 12,
}

export function areionMode(): "live" | "mock" {
  if (process.env.AI_CHAT_ADAPTER === "mock") return "mock"
  return process.env.GEMINI_API_KEY ? "live" : "mock"
}

export const AI_CONSENT_COOKIE = "arion_ai_consent"
