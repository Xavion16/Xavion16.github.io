# Yurt Dışına Aktarım Kaydı (KVKK m.9 — 7499 s.K. ile değişik, Rapor §7.1.6)

Kademeli rejim (1 Haziran 2024'ten itibaren): **1) Yeterlilik kararı → 2) Uygun güvenceler** (Kurul'un standart sözleşmesi — imzadan itibaren **5 iş günü** içinde Kurul'a bildirim; bağlayıcı şirket kuralları; taahhütname) **→ 3) Arızi haller** (sınırlı, tekrarlanmayan).

| Servis                            | Ülke / bölge               | Aktarılan veri                         | Dayanak                                                     | Bildirim durumu   | Not                                                                  |
| --------------------------------- | -------------------------- | -------------------------------------- | ----------------------------------------------------------- | ----------------- | -------------------------------------------------------------------- |
| Storefront barındırma (Vercel)    | ABD/AB (bölge seçilebilir) | İstek logları, IP                      | Standart sözleşme                                           | ⏳ Lansman öncesi | Türkiye bölgesi yoksa AB bölgesi seçilir                             |
| Backend + DB (Railway/Render/Fly) | Bölgeye bağlı              | Tüm müşteri verisi                     | Standart sözleşme **veya Türkiye'de barındırma**            | ⏳                | Tercih: Türkiye'de barındırma (DECISIONS)                            |
| E-posta (Resend/SMTP)             | ABD/AB                     | E-posta adresi, işlemsel ileti içeriği | Standart sözleşme                                           | ⏳                | Demo: `.outbox` (aktarım yok)                                        |
| AI danışman (Claude/Gemini API)   | ABD                        | Maskelenmiş mesaj                      | **Ayrı açık rıza** (`ai_chat_transfer`) + standart sözleşme | ⏳ Faz 4          | Ad, telefon, adres maskelenir; Ayak İkizi verisi **asla** aktarılmaz |
| Chatwoot Cloud (alternatif)       | AB                         | Sohbet kayıtları                       | Standart sözleşme                                           | ⏳                | Tercih: self-host (aktarım yok)                                      |
| iyzico                            | Türkiye                    | Ödeme işlemi                           | —                                                           | Gerekmez          | Yurt içi                                                             |

**Mimari önlemler:** AI'a gitmeden önce kişisel veri maskeleme; Ayak İkizi verisinin hiçbir dış servise gönderilmemesi; demo ortamında hiçbir gerçek dış aktarım yapılmaması (tüm adapter'lar `mock`).

> Demo durumu: Şu an tüm servisler yerel/mock çalıştığı için **yurt dışına aktarım yapılmamaktadır**.
