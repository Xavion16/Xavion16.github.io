# Uyum Kontrol Listesi (Rapor §7)

Durum: ✅ uygulandı ve testli · 🟡 uygulandı, kısmi/mock · ⏳ sonraki faz.
"Test" sütunu, maddeyi otomatik doğrulayan testi gösterir.

## 7.1 KVKK

| Madde                                                                     | Durum | Kodda nerede                                                                                       | Test                                                      |
| ------------------------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Veri envanteri                                                            | ✅    | `docs/legal/veri-envanteri.md`                                                                     | —                                                         |
| Genel aydınlatma metni (m.10, Tebliğ)                                     | ✅    | `packages/legal-texts/src/texts/tr-privacy.ts` → `kvkk-aydinlatma`; `/tr/yasal/kvkk-aydinlatma`    | `legal-texts.test.ts` (kayıt defteri)                     |
| Nokta bazlı kısa aydınlatma (kayıt, ödeme, KVKK formu)                    | ✅    | `hesabim/kayit/page.tsx`, `odeme/page.tsx`, `components/legal/data-request-form.tsx`               | `faz3-legal.spec.ts`                                      |
| Aydınlatma için onay kutusu YOK                                           | ✅    | aynı dosyalar (yalnızca metin + link)                                                              | `faz3-legal.spec.ts` → "onay kutusu yok"                  |
| Açık rıza aydınlatmadan ayrı, amaç başına ayrı kutu                       | ✅    | `packages/legal-texts/src/consents.ts`, `components/shop/auth-forms.tsx`                           | `faz3-legal.spec.ts`                                      |
| Hiçbir rıza kutusu önceden işaretli değil                                 | ✅    | `defaultChecked={false}`, çerez anahtarları                                                        | `faz3-legal.spec.ts` (kayıt formu, tercih merkezi, ödeme) |
| Rıza üyelik/satın alma ön koşulu değil                                    | ✅    | Kayıt yalnızca sözleşme onayı ister; pazarlama isteğe bağlı                                        | `faz3-legal.spec.ts`                                      |
| Rıza kaydı: kullanıcı, amaç, sürüm, zaman, IP/UA, kanal; geri çekme kaydı | ✅    | `apps/backend/src/modules/consent/models/consent.ts` (append-only), `workflows/record-consents.ts` | `faz3-legal.spec.ts` (JSON dışa aktarımda `[true,false]`) |
| İzinlerim: rızaları tek tek aç/kapat                                      | ✅    | `/tr/hesabim/izinlerim`                                                                            | `faz3-legal.spec.ts`                                      |
| Çerez banner'ı: Kabul/Ret eşit görünürlükte                               | ✅    | `components/consent/cookie-consent.tsx`                                                            | `faz3-legal.spec.ts` → stil eşitliği                      |
| "Devam ederek kabul" ifadesi yok; önceden işaretli kategori yok           | ✅    | aynı                                                                                               | `faz3-legal.spec.ts`                                      |
| Rıza olmadan analitik/pazarlama script'i yüklenmez                        | ✅    | `components/consent/consent-scripts.tsx`                                                           | `faz3-legal.spec.ts` → **network testi**                  |
| Çerez envanteri politikada otomatik                                       | ✅    | `packages/legal-texts/src/cookies.ts` → `getLegalDoc("cerez-politikasi")`                          | `legal-texts.test.ts`, `faz3-legal.spec.ts`               |
| Footer'da her zaman "Çerez Tercihleri"                                    | ✅    | `components/layout/site-footer.tsx`                                                                | `faz3-legal.spec.ts`                                      |
| m.11 başvuru formu + referans no                                          | ✅    | `/tr/yasal/kvkk-basvuru`, `POST /store/arion/data-requests`                                        | `faz3-legal.spec.ts`                                      |
| Verilerimi indir (JSON)                                                   | ✅    | `GET /store/arion/me/export`, `/api/hesabim/veri-indir`                                            | `faz3-legal.spec.ts`                                      |
| Admin KVKK kuyruğu + 30 gün sayacı                                        | ✅    | `apps/backend/src/admin/routes/kvkk/page.tsx`, `/admin/arion/data-requests`                        | Manuel (admin)                                            |
| Yurt dışı aktarım kaydı + AI maskeleme kararı                             | 🟡    | `docs/legal/yurtdisi-aktarim.md`, `consents.ts → ai_chat_transfer`                                 | Maskeleme Faz 4                                           |
| Saklama-imha politikası + periyodik iş + imha log'u                       | ✅    | `docs/legal/saklama-imha.md`, `jobs/kvkk-imha.ts`, `retention_log`                                 | Manuel (admin "Şimdi çalıştır")                           |
| Veri güvenliği (TLS, güvenli çerez, Zod, rol bazlı admin)                 | 🟡    | httpOnly+SameSite çerezler, Zod tüm aksiyon/rotalarda                                              | CSP/HSTS/rate-limit Faz 7                                 |
| Veri ihlali prosedürü                                                     | ✅    | `docs/legal/veri-ihlali-proseduru.md`                                                              | —                                                         |
| VERBİS değerlendirmesi                                                    | ✅    | Sunum risk analizi (Rapor §7.1.9)                                                                  | —                                                         |

## 7.2 Tüketici mevzuatı

| Madde                                                            | Durum | Kodda nerede                                                                                 | Test                                                   |
| ---------------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Ön Bilgilendirme Formu: dinamik, kaydırılabilir kutu + ayrı onay | ✅    | `packages/legal-texts/src/contracts.ts`, `components/checkout/legal-acceptance.tsx`          | `faz3-legal.spec.ts`                                   |
| Mesafeli Satış Sözleşmesi: dinamik + ayrı onay                   | ✅    | aynı                                                                                         | `faz3-legal.spec.ts`                                   |
| Buton "Siparişi Onayla ve Öde"; onaylar olmadan PASİF            | ✅    | `legal-acceptance.tsx`                                                                       | `faz3-legal.spec.ts`                                   |
| Onaysız sipariş SUNUCUDA da reddedilir                           | ✅    | `apps/backend/src/api/middlewares.ts → requireLegalAcceptance`                               | `faz3-legal.spec.ts` (400 `legal_acceptance_required`) |
| Onay kaydı: metin sürümü + hash siparişe bağlı                   | ✅    | `legal_acceptance` modeli, `cart-input.ts → acceptanceDocs`                                  | `faz3-legal.spec.ts`                                   |
| PDF: e-postada ve sipariş sayfasında kalıcı                      | ✅    | `packages/legal-texts/src/pdf.ts`, `subscribers/order-placed.ts`, `/api/belge/[order]/[doc]` | `faz3-legal.spec.ts` (`%PDF-`), `legal-texts.test.ts`  |
| Arabuluculuk bilgisi (dava şartı)                                | ✅    | `contracts.ts → complaintParagraphs`                                                         | `legal-texts.test.ts`, `faz3-legal.spec.ts`            |
| İade kargo ücreti satıcıya ait (1 Ocak 2026)                     | ✅    | `contracts.ts → withdrawalItems`, `config.ts`                                                | aynı                                                   |
| 14 gün cayma, 14 gün iade, en geç 30 gün teslim                  | ✅    | `config.ts → CONSUMER`                                                                       | `legal-texts.test.ts`                                  |
| Kişiye özel üretim istisnası açıkça yazılır                      | ✅    | `contracts.ts` (`customMade`)                                                                | `legal-texts.test.ts`                                  |
| Tüketici hakem heyeti sınırı config'te (2026: 186.000 TL)        | ✅    | `config.ts`                                                                                  | `legal-texts.test.ts`                                  |
| Ayıplı mal seçimlik hakları                                      | ✅    | `contracts.ts`, `iade-politikasi`                                                            | —                                                      |
| İade sihirbazı, ücretsiz iade kodu, para iadesi sayacı           | ⏳    | Faz 4                                                                                        | —                                                      |

## 7.3 Fiyat gösterimi

| Üstü çizili fiyat yalnızca `price_history`'den, 10 gün kuralı, parametrik | ✅  | `packages/pricing-rules`, `apps/backend/src/lib/price-reference.ts` | `reference-price.test.ts`, `faz2-commerce.spec.ts` |
| ------------------------------------------------------------------------- | --- | ------------------------------------------------------------------- | -------------------------------------------------- |
| KDV dahil fiyat, kargo sepette açık                                       | ✅  | `seed-arion.ts` (fiyat tercihleri), `cart-totals.tsx`               | `faz2-commerce.spec.ts`                            |

## 7.4 Ticari elektronik ileti

| Madde                                                    | Durum | Kodda nerede                                     | Test                                       |
| -------------------------------------------------------- | ----- | ------------------------------------------------ | ------------------------------------------ |
| Ayrı, işaretsiz pazarlama onayı; üyelikle birleştirilmez | ✅    | `auth-forms.tsx`                                 | `faz3-legal.spec.ts`                       |
| İYS senkronizasyonu (adapter + mock)                     | 🟡    | `apps/backend/src/lib/iys.ts`, `iys_sync` modeli | `faz3-legal.spec.ts` (`iys-*-EPOSTA-ONAY`) |
| Her iletide tek tık ret                                  | ⏳    | Pazarlama e-postası gönderimi henüz yok          | —                                          |
| İşlemsel iletilerde reklam yok                           | ✅    | `lib/emails/order-placed.ts`                     | —                                          |

## 7.5 E-ticaret kayıt ve künye

| Künye (unvan, MERSİS, vergi, adres, KEP — örnek) | ✅  | `texts/tr-terms.ts → kunye` | `faz3-legal.spec.ts` |
| ------------------------------------------------ | --- | --------------------------- | -------------------- |
| ETBİS alanı (demo)                               | ✅  | `site-footer.tsx`           | —                    |
| e-Arşiv `InvoiceAdapter`                         | ⏳  | Sonraki faz                 | —                    |

## 7.6–7.9

| Doğrulanmış alıcı yorumları                         | ⏳ Faz 4–5                                                |
| --------------------------------------------------- | --------------------------------------------------------- |
| Erişilebilirlik (WCAG 2.2 AA hedefi, beyan sayfası) | ✅ `/tr/yasal/erisilebilirlik`, axe + Lighthouse testleri |
| AI içerik etiketi                                   | ⏳ Faz 6                                                  |
| AB DPP hazırlığı                                    | ⏳ Faz 5 (Pasaport)                                       |
