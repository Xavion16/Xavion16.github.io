# Kişisel Veri Saklama ve İmha Politikası (Rapor §7.1.7)

## Saklama süreleri

| Veri                                             | Süre                                     | Dayanak               | Süre sonunda                                              |
| ------------------------------------------------ | ---------------------------------------- | --------------------- | --------------------------------------------------------- |
| Fatura, muhasebe ve sipariş kayıtları            | 10 yıl                                   | VUK m.253, TTK m.82   | Silme                                                     |
| Mesafeli satış onay kayıtları (sürüm + hash)     | 10 yıl                                   | İspat, TBK zamanaşımı | Silme                                                     |
| Üyelik bilgileri                                 | Üyelik + 10 yıl                          | TBK m.146             | Silme                                                     |
| Terk edilmiş sepetler (adres/e-posta içerebilir) | **90 gün**                               | Amaç sona erer        | **Otomatik silme**                                        |
| Rıza kayıtlarındaki IP/UA                        | **1 yıl**                                | Ölçülülük             | **Otomatik anonimleştirme** (rıza kaydı ispat için kalır) |
| Pazarlama iletişim verisi                        | Rıza geri alınana kadar                  | Açık rıza             | Silme + İYS RET                                           |
| Ayak İkizi ölçüleri                              | Rıza geri alınana / silme talebine kadar | Açık rıza             | Kalıcı silme (Faz 5)                                      |
| KVKK başvuruları                                 | 3 yıl                                    | İspat                 | Silme                                                     |
| Geliştirme e-posta kutusu (`.outbox`)            | **30 gün**                               | Demo                  | **Otomatik imha**                                         |

## Periyodik imha

- İş: `apps/backend/src/jobs/kvkk-imha.ts` — her gece **03:30** (`kvkk-imha`).
- Her kural çalıştığında `retention_log` tablosuna kayıt düşer (kural, işlem, etkilenen kayıt sayısı, zaman). Yönetim panelinde **KVKK Talepleri → Saklama ve İmha Kaydı** bölümünde görünür; "Şimdi çalıştır" ile elle tetiklenebilir (`POST /admin/arion/retention`).
- KVKK'ya göre periyodik imha aralığı 6 ayı geçemez; günlük çalışma bunu karşılar.

## İmha yöntemleri

- **Silme:** Veritabanından kaldırma (yedeklerde yedekleme döngüsü sonunda).
- **Anonimleştirme:** Kişiyle ilişkilendirilebilir alanların (IP, UA) `null` yapılması.
- **Yok etme:** Dosyaların (e-posta kopyaları, PDF ekleri) diskten silinmesi.
