# ARION — Claude Code Çalışma Kuralları

## Proje

Ayakkabı D2C e-ticaret + uyum teknolojisi. Ayrıntı: docs/PROJE_RAPORU.md (tek doğruluk kaynağı).

Medusa'ya özel dizin yapısı, kurallar ve yasak yollar için [AGENTS.md](./AGENTS.md) dosyasını da oku (dtc-starter ile geldi). Bu dosyayla çelişirse bu dosya geçerlidir.

## Komutlar

- Altyapı (Docker'sız, DECISIONS #006): `pnpm db` → yerel PostgreSQL (infra/db). Redis yok, Medusa in-memory modüllerle çalışır.
- Geliştirme: `pnpm dev` | Test: `pnpm test` | E2E: `pnpm e2e` | A11y: `pnpm e2e:a11y`
- Paket yöneticisi: pnpm 12. Ayarlar `pnpm-workspace.yaml` içinde (package.json'daki `pnpm` alanı okunmaz).

## Kod kuralları

- TypeScript strict, `any` yasak. Zod ile tüm dış girdiler doğrulanır.
- Arayüz metinleri TR (varsayılan) + EN, next-intl mesaj dosyalarında ve `content/{tr,en}/` altında. Bileşene gömülü uzun metin yok.
- Server Components varsayılan. İstemci bileşeni sadece etkileşim için.
- Dış servisler adapter arkasında: Payment, Shipping, Iys, Invoice, AiChat, MediaGen, ImageTo3D (mock|live).

## Hukuk/KVKK kırmızı çizgileri (asla ihlal etme)

- Rıza kutuları varsayılan işaretli olamaz. Aydınlatma için "onay" kutusu konmaz.
- Rıza yokken analitik/pazarlama script'i yüklenmez.
- Kart verisi hiçbir yerde loglanmaz ya da saklanmaz.
- Ayak İkizi verisi şifreli saklanır, AI'a gönderilmez, sağlık teşhisi dili kullanılmaz.
- Üstü çizili fiyat sadece price_history'den hesaplanır.
- Yasal metin değişirse LegalTextVersion artırılır.
- AI üretimi medya "Yapay zekâ ile üretilmiştir" etiketi taşır.

## Tasarım

- Tasarım yönü: "Performans × Cam" (DECISIONS #026) — koyu zemin, kor/mavi/yeşil vurgular, buzlu cam yüzeyler, Archivo sıkışık büyük harf. Token'lar `apps/storefront/src/styles/globals.css`. Rapor §4'teki palet bunun yerini almıştır.
- Başka markaların logosu, fontu, sloganı ya da görselleri kullanılmaz.
- Cam panellerde metin kontrastı AA'yı geçmeli; kor zemin üzerinde metin her zaman koyu.
- prefers-reduced-motion'a saygı göster. WCAG 2.2 AA hedefi.

## Çalışma şekli

- Her faz sonunda kabul kriterlerini doğrula, ekran görüntüsü al, docs/DECISIONS.md'yi güncelle.
- Sürüm veya API bu dokümanla çelişirse resmi dokümana uy ve farkı DECISIONS.md'ye yaz.
