/**
 * STATİK YAYIN (GitHub Pages, DECISIONS #087): backend yok. next.config bu dosyayı gerçek
 * "use server" işleminin yerine koyar. Gerçek kayıt yapılmaz; gösterim amaçlı yanıt döner.
 */
export async function handoffAction(_input: unknown): Promise<{ ok: boolean; ticket?: string }> {
  return { ok: true, ticket: "TKT-DEMO-" + Math.floor(1000 + Math.random() * 9000) }
}
