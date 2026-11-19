# Veri İhlali Müdahale Prosedürü (Rapor §7.1.8)

KVKK m.12/5: İşlenen verilerin kanuni olmayan yollarla başkaları tarafından elde edilmesi halinde veri sorumlusu bu durumu **en kısa sürede** ilgilisine ve Kurul'a bildirir. Kurul kararı (2019/10) uyarınca "en kısa süre" **72 saat** olarak yorumlanır.

## 1. Tespit (0. saat)

- Kaynaklar: hata/erişim logları, yönetici işlem kaydı (audit), bağımlılık taraması uyarıları, kullanıcı bildirimi.
- Olayı tespit eden kişi ihlal sorumlusuna (veri koruma irtibat kişisi) derhal bildirir.

## 2. Sınırlama (0–4. saat)

- Etkilenen erişim anahtarlarını / oturumları iptal et (`JWT_SECRET`, `COOKIE_SECRET` rotasyonu; admin şifreleri).
- Saldırı vektörünü kapat (yama, rate-limit, IP engeli).
- Kanıtları koru (logların kopyası, zaman damgaları).

## 3. Değerlendirme (4–24. saat)

- Hangi veri kategorileri etkilendi? (Envanter: `docs/legal/veri-envanteri.md`)
- Kaç kişi? Özel nitelikli/hassas veri var mı (Ayak İkizi)? Kart verisi tutulmadığı için kart verisi ihlali kapsam dışıdır.
- Olası sonuçlar ve risk seviyesi.

## 4. Bildirim (en geç 72. saat)

- **Kurul'a:** KVKK "Veri İhlali Bildirim Formu" ile (kvkk.gov.tr). 72 saat aşılırsa gecikme gerekçesi eklenir.
- **İlgili kişilere:** Makul en kısa sürede; doğrudan iletişim (e-posta) ya da doğrudan ulaşılamıyorsa web sitesinde duyuru. İçerik: ne oldu, hangi veriler, olası sonuçlar, alınan önlemler, kişinin alabileceği önlemler, iletişim kanalı.

## 5. Düzeltme ve kayıt

- Kök neden analizi ve kalıcı düzeltme.
- İhlal kaydı (tarih, kapsam, etki, alınan önlemler, bildirim tarihleri) en az 5 yıl saklanır.
- Gerekirse bu prosedür, aydınlatma metni ve envanter güncellenir (metin sürümü artırılır).

## İletişim

- Veri koruma irtibat: kvkk@arion.example (örnek)
- KEP: arion@hs00.kep.tr (örnek)
