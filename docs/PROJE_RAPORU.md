# ARION — Ayakkabı Atölyesi & Uyum Laboratuvarı
## Claude Code için Uygulama Odaklı Proje Raporu (v1.1 — 19 Kasım 2026, marka: ARION)

> **Bu dosya Claude Code'a verilmek üzere yazılmıştır.** Repo köküne `docs/PROJE_RAPORU.md` olarak koy, ardından aşağıdaki "Başlangıç Promptu"nu Claude Code'a yapıştır. Rapordaki sürüm numaraları ve mevzuat bilgileri Kasım 2026 itibarıyla araştırılmıştır. Claude Code kurulum sırasında sürümleri `npm view <paket> version` ile **yeniden doğrulamalıdır**.
>
> ⚠️ Hukuki metinler şablondur. Ödev için yeterlidir ama gerçek bir ticari lansmandan önce bir avukata kontrol ettirilmelidir.

---

## 0. Claude Code Başlangıç Promptu (kopyala-yapıştır)

```
Bu repoda docs/PROJE_RAPORU.md dosyasında tanımlı "ARION" ayakkabı e-ticaret
platformunu inşa edeceğiz. Önce dosyanın tamamını oku. Sonra:
1) Plan moduna geç ve Bölüm 12'deki fazları kendi uygulama planına çevir.
2) Bölüm 11'deki skill'leri ve MCP'leri kur (önce kaynaklarını gözden geçir).
3) Repo köküne Bölüm 13'teki CLAUDE.md'yi oluştur.
4) Faz 0'dan başla. Her fazın sonunda "Kabul Kriterleri"ni tek tek doğrula,
   Playwright ile ekran görüntüsü al, eksik kalanı raporla, sonra commit at.
Kurallar: TypeScript strict, TR (varsayılan) + EN arayüz, tüm hukuki/KVKK metinleri
docs/legal altında versiyonlu, demo verileri açıkça "DEMO" etiketli.
Bir sürüm ya da API bu raporla çelişirse resmi dokümana göre hareket et
ve farkı docs/DECISIONS.md dosyasına yaz.
```

---

## 1. Yönetici Özeti

**ARION** sadece ayakkabı satan bir site değil. Ayakkabıyı bir **mühendislik ve sorumluluk nesnesi** olarak gören, global hedefli bir D2C (doğrudan tüketiciye) markası ve teknoloji girişimidir. Alt başlık: **"Crafted in Türkiye."**

### 1.1 İsmin Hikâyesi: Arion (Areion)
Yunan mitolojisinde Arion, tanrılardan doğmuş, efsanevi hızda, ölümsüz bir attır. Homeros onu İlyada'da "ilahi soydan gelen hızlı at" olarak anar. Çoğu anlatıda Arion, deniz tanrısı Poseidon ile toprak ve bereket tanrıçası Demeter'in oğludur. Herakles'ten Argos kralı Adrastos'a geçer. Thebai'ye Karşı Yediler savaşında ordu yenildiğinde, Adrastos'u savaştan sağ çıkaran tek şey Arion'un hızıdır. Bazı Latin şairlere göre Arion konuşabilen bir attır.

Mitin her parçası markanın bir vaadine karşılık geliyor:

| Mitteki özellik | ARION'daki karşılığı |
|---|---|
| **Taşıyıcı ve kurtarıcı:** Sahibini savaştan sağ salim eve getirir | Manifesto: *Ayakkabı bir taşıma sözleşmesidir. Seni her koşulda eve taşır.* |
| **Toprak (Demeter) ve suyun (Poseidon) çocuğu** | Kışlık bot ve outdoor serisi: zemine sağlam basan, suya dayanan ayakkabı |
| **Efsanevi hız** | Sneaker ve hareket serisi: *Hareketin Fiziği* |
| **Ölümsüzlük** | Tamir edilebilirlik, Ömür Planı, Pasaport. *Ölümsüz ayakkabı yoktur, ama ölmesine izin vermeyen bir marka olabilir.* |
| **Konuşan at** | AI danışmanın adı **Areion** (bkz. 6.7) |

**Tek cümlelik vaat:** *"Önce ayağını tanırız, sonra ayakkabını yaparız. Ve ayakkabın yaşadıkça yanında oluruz."*
**Global slogan:** *"Carried by Arion."* / TR: *"Seni eve taşır."*

### 1.2 Telaffuz ve Yazım
- Uluslararası: **AR-ee-on** (Türkçedeki gibi "Ariyon"). İngilizce sözlük telaffuzu "ə-RAY-ən" olsa da marka kendi telaffuzunu belirler. Ana sayfada küçük bir "/ˈa.ri.on/" notu bırakılabilir.
- Logo yazımı: **ARION** (tamamı büyük harf, Türkçe karakter yok). Alan adı ve sosyal medyada Türkçe karakter sorunu yaşanmaz.

### 1.3 ⚠️ Marka Tescili Notu (önemli)
Hızlı bir taramada "Arion" adının ayakkabı sektöründe **ürün/model adı** olarak kullanıldığı görüldü: İspanyol ayakkabı markası Fluchos'un "ARION" adlı bir sneaker serisi ve İtalyan spor markası UYN'nin "Arion" adlı bir ayakkabı modeli var. Bunlar marka değil model adı, ama ayakkabının da içinde bulunduğu Nis sınıfı 25'te çakışma riski doğurabilir. Öneriler:
1. TÜRKPATENT ve WIPO Global Brand Database'de sınıf 25 (giyim/ayakkabı) ve sınıf 35 (perakende) için "ARION" sorgusu yap.
2. Risk çıkarsa ayırt edici bir ek kullan: **ARION Atelier**, **ARION Lab** ya da orijinal Yunanca yazımı **AREION**.
3. Sunumda bu tescil analizini bir slayt olarak göster. Startup ciddiyeti açısından artı puan getirir.

> Mitolojide aynı adı taşıyan, yunus tarafından kurtarılan şair Arion da vardır. Marka hikâyesinde **at** olan Arion esas alınır, şair Arion karıştırılmaz.

**Hocanın beklentilerine karşılık:**
| Ödev gereksinimi | ARION'daki karşılığı |
|---|---|
| E-ticaret sitesi | Katalog, varyant (numara/renk/genişlik), sepet, iyzico sandbox ödeme, sipariş yönetimi, yönetim paneli |
| Müşteri hizmetleri | Yardım merkezi, canlı destek + WhatsApp (Chatwoot), AI danışman, talep/bilet sistemi, iade sihirbazı, sipariş takibi |
| KVKK ve yasal aydınlatmalar | Veri toplanan her noktada katmanlı aydınlatma, ayrı açık rıza, çerez yönetimi, KVKK başvuru formu, saklama-imha politikası, mesafeli satış ve ön bilgilendirme, künye |
| Alışılmışın dışında, içine çeken unsurlar | Ayak İkizi + Kalıp Uyum Skoru, 3D Ayakkabı Anatomisi, Dayanıklılık Kartı, Ayakkabı Pasaportu (QR), Atölye Takibi, Ömür Planı |
| Startup potansiyeli | Uyum motoru B2B API olarak satılabilir, tamir ve bakım aboneliği, AB Dijital Ürün Pasaportu'na hazır altyapı ile e-ihracat |
| "Ticaret değil ideoloji" kanıtı | Her kategori için manifesto ve mühendislik açıklaması, ölçülebilir sözler, şeffaflık paneli |

---

## 2. İdeoloji: "Ayakkabı Bir Sözleşmedir"

### 2.1 Manifesto (site metni taslağı)
> Efsanede Arion, savaş kaybedildiğinde bile sahibini eve sağ salim taşıyan attı.
> Biz de ayakkabıyı böyle görüyoruz. Ayakkabı, ayağınla dünya arasındaki tek arayüzdür. Günde binlerce adımda tüm ağırlığını taşır. Bu yüzden onu bir moda nesnesi olarak değil, **bir taşıma sözleşmesi** olarak görürüz. Her modelin neden böyle yapıldığını açıklarız, iddialarımızı ölçeriz, ayakkabı eskidiğinde onu çöpe değil atölyeye çağırırız.
>
> *EN:* "In myth, Arion carried his rider home when every battle was lost. We build shoes with the same promise."

### 2.2 Kategori Manifestoları
Her kategori sayfasının en üstünde bir "Neden böyle yapıyoruz?" bölümü ve interaktif bir 3D anatomi görünümü bulunur. Hocanın örneği (topuklu ↔ kışlık bot) doğrudan bu yapıya oturur:

| Kategori | Manifesto Başlığı | Kanıtlanacak mühendislik unsurları (sitede gösterilecek) |
|---|---|---|
| **Topuklu** | *Denge Mühendisliği* | Topuk yüksekliği ile ağırlığın ön ayağa kayma ilişkisi; **şank** (taban içi destek çeliği/kompozit) neden zorunlu; topuk ekseninin ağırlık merkeziyle hizası; ön ayak yastığı (metatarsal pad); topuk ucu (topuk lastiği) değişimi; burun genişliği (toe box) ile parmak sıkışması |
| **Kışlık Bot** | *Dayanıklılık Sözleşmesi* | Su geçirmez membran ve dikişsiz körük dil; dikişli taban (welt) ile yapıştırma taban farkı ve tamir edilebilirlik; taban diş derinliği ve soğukta esneyen kauçuk karışımı; termal iç astar; ıslak zeminde kayma direnci |
| **Sneaker / Günlük** | *Hareketin Fiziği* | Ara taban sönümleme ve geri dönüş; topuk-burun yükseklik farkı (drop); nefes alan saya; esneme hattı |
| **Klasik Erkek / Kadın** | *Miras ve Tamir Edilebilirlik* | Dikişli taban yapısı, deri tabanın ayağa göre şekil alması, pençe yenileme, kalıp çeşitleri |
| **Çocuk** | *Büyüme Payı* | Esnek taban, geniş burun, büyüme payı (parmak boşluğu), cırt/bağcık ergonomisi, ölçüm hatırlatıcısı |

> **Claude Code notu:** Bu içerikler `content/manifestos/*.mdx` altında tutulacak. Her teknik iddianın yanında bir "Nasıl ölçtük?" açılır kutusu olacak. Demo değerler `DEMO` rozetiyle işaretlenecek. Sahte test sonucu gerçekmiş gibi sunulmayacak.

### 2.3 "Ölçülebilir Sözler" ve Şeffaflık Paneli
`/seffaflik` sayfasında canlı (demo) metrikler gösterilir:
- Ortalama iade oranı ve iade nedenleri dağılımı (uyum, renk, kusur…)
- Tamir edilen çift sayısı, ortalama ayakkabı ömrü (ay)
- Geri alınan ve yeniden kazandırılan çift sayısı
- Ortalama müşteri hizmetleri ilk yanıt süresi

Bu panel ideolojinin **iddia değil, veri** olduğunu kanıtlar ve sunumda en güçlü argümanlardan biri olur.

---

## 3. Pazar ve Startup Gerekçesi

### 3.1 Bağlam (Türkiye)
- APICCAPS World Footwear Yearbook 2026'ya göre Türkiye'nin ayakkabı üretimi 2024'teki 455 milyon çiftten 2025'te 391 milyon çifte geriledi. İhracat sıralamasında 6'ncılıktan 10'unculuğa düştü. *(Kaynak: Ekonomi Gazetesi)*
- Türkiye Ayakkabı Sanayicileri Derneği'ne göre ihracat 2022'deki 377 milyon çiftten 2025'te 187 milyon çifte, ihracat geliri 1,3 milyar dolardan 1 milyar dolara indi. *(Kaynak: Bloomberg HT)*
- Öte yandan sektör temsilcilerine göre Türkiye'den yurt dışına satılan her dört ayakkabıdan biri artık e-ihracat kanalıyla gidiyor. *(Kaynak: Ekonomist)*

**Çıkarım (sunumda kullanılacak):** Türkiye ucuz üretimde Çin'le fiyat savaşını kaybediyor. Kazanma yolu **katma değer**, yani tasarım, uyum teknolojisi, zanaat hikâyesi ve doğrudan e-ihracat. ARION tam bu boşluğa konumlanıyor.

### 3.2 Problem
- Online ayakkabı alışverişinde iadelerin en yaygın nedeni beden ve kalıp uyumsuzluğu. (Neatsy AI kurucusu da bu tespiti yapıyor.)
- Aynı numara farklı markalarda, hatta aynı markanın farklı kalıplarında farklı oturur.
- Tüketici bir ayakkabının *neden* pahalı ya da dayanıklı olduğunu göremiyor. Kalite görünmez.

### 3.3 Çözüm ve Rakip/İlham Haritası
| Oyuncu | Yaptığı | ARION farkı |
|---|---|---|
| Volumental | Mağaza ve mobil 3D ayak tarama, büyük veri setiyle beden önerisi | ARION kendi kalıp verisini ürüne bağlar. Uyum skoru "kalıp ↔ ayak" eşleşmesidir. |
| Neatsy, Xesto | iPhone derinlik kamerasıyla ayak tarama | ARION MVP'de donanım gerektirmez (manuel ölçüm + A4 yöntemi). Tarama bir sonraki fazdadır. |
| Snapfeet (Cambridge) | 3D ayak modelini ayakkabı kalıplarıyla karşılaştırma | Aynı fikir, ama üretici ile satıcı aynı çatıda. Uyumsuzluk doğrudan üretime geri bildirim olur. |

### 3.4 İş Modeli
1. **D2C satış:** Hazır stok + "Ön sipariş / Atölyede üretim" modelleri
2. **Ömür Planı aboneliği (ör. yıllık):** Bakım kiti, 1 pençe/taban yenileme, öncelikli destek
3. **Tamir ve yeniden doğuş servisi:** Başka markalarınki dahil, ücretli
4. **B2B "Arion Last Fit API":** Diğer Türk üreticilere ve pazaryerlerine beden önerisi motoru (SaaS)
5. **E-ihracat:** AB pazarı için Dijital Ürün Pasaportu'na hazır veri modeli (bkz. 7.6)

### 3.5 Kuzey Yıldızı Metrikleri
- Uyum kaynaklı iade oranı (hedef: sektör ortalamasının altı)
- Ortalama ayakkabı ömrü ve tamir oranı
- Ayak İkizi oluşturma oranı (ziyaretçi → profil)
- NPS ve ilk yanıt süresi

---

## 4. Marka ve Tasarım Yönü

> Claude Code, **anthropics/skills → frontend-design** skill'ini yükleyip bu yönü uygulamalıdır. Jenerik "AI sitesi" estetiğinden (mor gradyan, Inter, yuvarlak kart yığını) kaçınılacak.

**Konsept:** *"Zanaat Editoryal × Teknik Çizim"*. Bir ayakkabı ustasının çizim masası ile bir laboratuvar raporunun buluşması.

- **Renk paleti:** Kemik beyazı zemin (`#F3EEE6`), is siyahı metin (`#1B1A17`), taba deri (`#9A5B2E`), bordo vurgu (`#6E1F2A`), laboratuvar yeşili sadece veri vurgularında (`#2F6B4F`). Tüm kombinasyonlar WCAG AA kontrastını geçmeli.
- **Tipografi:** Başlıklar için karakterli bir serif (ör. Fraunces / Instrument Serif), gövde için okunaklı bir grotesk (ör. Geist / Manrope), ölçüm ve test verileri için monospace (ör. JetBrains Mono). Türkçe karakter desteği (ğ, ş, İ, ı) zorunlu olarak test edilecek.
- **Görsel dil:** Ürün fotoğraflarının üzerinde ince teknik çizim çizgileri, ölçü okları, kalıp kesitleri. Arka planda çok silik milimetrik ızgara. Antik Yunan vazo çizimlerindeki gibi **tek çizgiyle akan bir at yelesi/hareket çizgisi** markanın imza motifidir. Hız ve hareketi soyut şekilde anlatır.
- **Logo yönü:** Tipografik bir "ARION" yazısı ve soyut bir yele/hareket çizgisi. **Şaha kalkmış at figürü kullanılmaz.** Hem klişe, hem de bilinen otomobil markalarının amblemlerini çağrıştırarak marka karışıklığı riski yaratır. Gerçek antik eserlerin birebir kopyası da kullanılmaz, motifler özgün çizilir.
- **İmza etkileşimler:**
  - Sayfa kaydırma göstergesi olarak ilerleyen **ayak izi / hareket çizgisi**
  - Ürün kartında üzerine gelince ayakkabının **kesit (x-ray) görünümüne** geçiş
  - Ürün sayfasında "Anatomi" sekmesinde 3D patlatılmış görünüm (bkz. 6.2)
  - `prefers-reduced-motion` açıksa tüm animasyonlar sadeleşir

### 4.1 Global Hazırlık (i18n) ve İki Dilli Özellik Adları
Marka global olduğu için site ilk günden **iki dilli** kurulur: TR varsayılan, EN ikinci dil.
- **Teknik:** `next-intl` ile `/tr/...` ve `/en/...` yol yapısı, `hreflang` etiketleri, dil seçici. URL slug'ları da çevrilir (ör. `/tr/koleksiyon/kislik-bot` ↔ `/en/collection/winter-boots`).
- **Numara sistemleri:** EU numara varsayılan. Ürün sayfasında UK/US karşılık tablosu bulunur. Uyum motoru her zaman milimetreyle çalışır, numara sadece gösterimdir.
- **Para birimi:** Ödeme TRY. EN arayüzde bilgi amaçlı yaklaşık EUR/USD gösterimi yapılır (açıkça "yaklaşık" etiketiyle).
- **Hukuk:** Ödev kapsamında satış Türkiye'ye yapılır ve Türk hukuku uygulanır. EN yasal sayfalar "bilgilendirme amaçlı çeviridir, bağlayıcı metin Türkçedir" notu taşır. AB'ye doğrudan satış (GDPR, AB tüketici kuralları) startup yol haritasında ayrı bir faz olarak not edilir.

| TR | EN | Açıklama |
|---|---|---|
| Ayak İkizi | **Fit Twin** | Kullanıcının ayak ölçü profili |
| Kalıp Uyum Skoru | **Last Fit Score** | Ayak ↔ kalıp eşleşme puanı |
| Kalıp Kütüphanesi | **Last Library** | Kalıpların ölçü tabloları |
| Ayakkabı Anatomisi | **Shoe Anatomy** | 3D patlatılmış görünüm |
| Dayanıklılık Kartı | **Durability Card** | Test Lab metrikleri |
| Ayakkabı Pasaportu | **Shoe Passport** | QR'lı ürün kimliği |
| Atölye Takibi | **Atelier Tracker** | Üretim zaman çizelgesi |
| Ömür Planı | **Lifetime Plan** | Bakım, tamir, geri alım |
| Geri Al – Yeniden Doğ | **Return & Reborn** | Geri alım programı |
| Şeffaflık Paneli | **Transparency Board** | Ölçülebilir sözler |
| Areion (AI danışman) | **Areion** | İki dilde aynı |

---

## 5. Bilgi Mimarisi (Site Haritası)

> Aşağıdaki yollar TR içindir. Hepsinin başına `/tr` gelir, EN karşılıkları `/en` altında çevrilmiş slug'larla oluşturulur.

```
/                           Ana sayfa (manifesto hero, Ayak İkizi CTA, kategoriler, atölye hikâyesi)
/koleksiyon/[kategori]      Kategori + kategori manifestosu + filtreler (numara, genişlik, uyum skoru)
/urun/[slug]                Ürün: galeri, 3D/AR, video, Uyum Skoru, Dayanıklılık Kartı, Anatomi, Kalıp bilgisi, yorumlar
/ayak-ikizi                 Ayak profili sihirbazı (misafir veya üye)
/kaliplar                   Kalıp Kütüphanesi (her kalıbın ölçü tablosu)
/atolye                     Ustalar, üretim süreci, canlı sipariş akışı (demo)
/pasaport/[kod]             Ayakkabı Pasaportu (QR ile açılır)
/omur-plani                 Bakım, tamir, geri alım, abonelik
/seffaflik                  Ölçülebilir sözler paneli
/manifesto                  İdeoloji sayfası
/yardim                     Yardım merkezi (SSS, arama)
/yardim/siparis-takip       Giriş gerektirmeyen sipariş takibi (sipariş no + e-posta)
/yardim/iade                İade / değişim / cayma sihirbazı
/yardim/talep               Talep/şikâyet formu → bilet numarası
/iletisim                   Kanal listesi, çalışma saatleri, adres, KEP
/hesabim/...                Siparişler, adresler, Ayak İkizi, izinlerim (rıza yönetimi), veri talepleri
/sepet, /odeme              Sepet ve ödeme (ön bilgilendirme + mesafeli satış onayı)
/yasal/kvkk-aydinlatma      Genel aydınlatma metni
/yasal/gizlilik             Gizlilik politikası
/yasal/cerez-politikasi     Çerez politikası + tercih merkezi
/yasal/acik-riza            Açık rıza metinleri (her amaç ayrı)
/yasal/kvkk-basvuru         İlgili kişi başvuru formu (KVKK m.11)
/yasal/mesafeli-satis       Mesafeli satış sözleşmesi şablonu
/yasal/on-bilgilendirme     Ön bilgilendirme formu şablonu
/yasal/iade-politikasi      İade ve değişim politikası
/yasal/uyelik-sozlesmesi    Üyelik sözleşmesi
/yasal/kullanim-kosullari   Kullanım koşulları
/yasal/ticari-ileti         Ticari elektronik ileti onay metni
/yasal/kunye                Künye / satıcı bilgileri
/yasal/erisilebilirlik      Erişilebilirlik beyanı
/admin                      Medusa Admin (+ özel ARION widget'ları)
```

---

## 6. İmza Özellikler (Farklılaştırıcılar)

### 6.1 Ayak İkizi + Kalıp Uyum Skoru ⭐ (startup çekirdeği)
**Amaç:** Kullanıcının ayak ölçülerini ürünün kalıp ölçüleriyle karşılaştırıp 0–100 arası bir uyum skoru ve önerilen numara/genişlik vermek.

**MVP (ödev kapsamı):**
1. **Manuel ölçüm sihirbazı:** Animasyonlu talimatlarla ayak uzunluğu (mm), ön ayak genişliği (mm), çevre (opsiyonel), kemer tipi (düz/normal/yüksek), tercih (sıkı/rahat).
2. **A4 kâğıt yöntemi (opsiyonel, deneysel):** Kullanıcı ayağını A4 kâğıdın üzerine koyup fotoğraf çeker. Görüntü **tarayıcıda** işlenir (ör. OpenCV.js / TensorFlow.js ile kenar tespiti, A4 referansıyla ölçek). **Fotoğraf sunucuya gönderilmez.** Sadece çıkan sayısal ölçüler saklanır.
3. **Uyum motoru (`packages/fit-engine`):** Saf TypeScript, birim testli.
   - Girdi: `FootProfile` + `Last` (kalıp) ölçü tablosu + kategori kuralları
   - Kural örnekleri: Topuklu için ön ayak genişliğine daha yüksek ağırlık. Kışlık bot için kalın çorap payı olarak +X mm. Çocuk için büyüme payı.
   - Çıktı: `{ score, recommendedSize, recommendedWidth, reasons[] }`. `reasons` Türkçe ve açıklanabilir olmalı (ör. "Ön ayağınız bu kalıptan 4 mm geniş, W (geniş) seçeneğini öneriyoruz").
4. Ürün listesinde "Bana uyanlar" filtresi ve uyum skoruna göre sıralama.

**Sonraki faz:** Telefon LiDAR/derinlik taraması ile 3D ayak modeli ve iade verisiyle kendini düzelten öneri.

> 🔐 **KVKK kritik notu:** Ayak şekli verisi halluks valgus, düz taban gibi **sağlık durumlarını ima edebilir**. Bu nedenle ihtiyatlı yaklaş ve **özel nitelikli veri gibi davran**: ayrı ve açık rıza al, sadece ölçüleri sakla, fotoğrafı cihazda işleyip at, veriyi şifreli sakla, misafir modunda hiç saklama, "Ayak İkizimi sil" butonunu tek tıkla çalışır yap. Sağlık teşhisi koyan bir dil **kesinlikle kullanma** (ör. "halluks valgusunuz var" deme).

### 6.2 3D Ayakkabı Anatomisi ve AR
- **Ürün görüntüleyici:** Google `<model-viewer>` web bileşeni (GLB, iOS için USDZ). AR modu Android'de Scene Viewer/WebXR, iOS'ta Quick Look ile çalışır. Renk doğruluğu için `tone-mapping="commerce"` kullan.
- **Anatomi modu:** React Three Fiber (+ drei) ile patlatılmış görünüm. Katmanlar (saya, astar, iç taban, şank, ara taban, dış taban, topuk) kaydırmayla ayrışır. Her katmanda hotspot ve kısa açıklama bulunur.
- Kategoriye göre farklı hikâye:
  - Topuklu: Ağırlık merkezi oku, topuk açısı, şank vurgusu
  - Bot: Su geçirmez membran katmanı, dikiş hattı, taban dişleri
- Performans: GLB'ler `gltf-transform` ile Draco/Meshopt sıkıştırılır, dokular KTX2/WebP'ye çevrilir. Hedef ≤ 3 MB/model. Poster görseli önce yüklenir, 3D tembel (lazy) yüklenir.

### 6.3 Dayanıklılık Kartı (Test Lab)
Her ürün sayfasında bir laboratuvar raporu kartı bulunur:
- Taban bükülme dayanımı (döngü), aşınma, su geçirmezlik (saat), kayma direnci (ıslak/kuru), ağırlık (g/çift), tamir edilebilirlik puanı
- Her metrik için "Bu ne demek?" ve "Nasıl ölçülür?" açıklaması (SATRA ve ISO gibi standart test yöntemlerine atıf; demo veride somut standart numarası uydurulmaz)
- Kategoriler arası karşılaştırma (ör. aynı kartta topuklu ile botun öncelik farkı)
- Tüm demo değerler `DEMO` rozetli. Gerçek ürünlerde test raporu PDF'i eklenebilir.

### 6.4 Ayakkabı Pasaportu (QR) 
- Her çifte benzersiz kod: `/pasaport/ARN-2026-000123`
- İçerik: Model, kalıp, malzemeler ve kaynak bölgesi, usta, üretim tarihi, test kartı, bakım talimatı, **tamir geçmişi**, geri dönüşüm talimatı
- Admin panelde "Pasaport oluştur" ve QR etiket PDF çıktısı
- Veri modeli AB Dijital Ürün Pasaportu'na (DPP) genişletilebilir şekilde tasarlanır (bkz. 7.6)
- Kişisel veri **içermez**. Pasaport ürüne aittir, sahibine değil.

### 6.5 Atölye Takibi
"Atölyede üretilir" modellerde sipariş sonrası zaman çizelgesi: **Kesim → Saya dikimi → Kalıba çekme → Taban montajı → Finisaj → Kalite kontrol → Kargo**. Her adımda (demo) usta notu ve fotoğraf yer alır. Ön bilgilendirmede teslim süresi açıkça yazılır. Mesafeli satışta teslim en geç 30 gündür (bkz. 7.2).

### 6.6 Ömür Planı
- Satın alma tarihinden itibaren bakım hatırlatıcıları (e-posta). **Sadece ticari ileti onayı varsa** ya da işlemsel bilgilendirme niteliğindeyse gönderilir (bkz. 7.4).
- Tamir talebi formu: Fotoğraf yükle, ücret tahmini al, kargo kodu al
- "Geri Al – Yeniden Doğ": Eski çifti gönder, yeniden kazandırılsın ya da geri dönüştürülsün, karşılığında indirim kredisi al

### 6.7 AI Ayakkabı Danışmanı "Areion" (konuşan at)
- İsim, mitteki konuşabilen Arion'dan gelir. Kullanıcıya bir yapay zekâ asistanı olduğunu her zaman açıkça söyler, insan gibi davranmaz. TR ve EN konuşur.
- Ürün, kalıp, SSS ve politika dokümanları üzerinde RAG yapan sohbet asistanı
- Yetenekleri: Ürün önerisi (uyum skoruyla), beden sorusu, iade koşulu açıklama, sipariş durumu (doğrulanmış oturumda)
- Sınırları: Sağlık tavsiyesi vermez. Kart bilgisi istemez. Emin olmadığında "Seni bir temsilciye bağlıyorum" der ve Chatwoot'a devreder.
- Sağlayıcıdan bağımsız mimari (Vercel AI SDK). Seçenekler: Claude API (`claude-haiku-5-5` hızlı/ucuz, `claude-sonnet-5-5` kaliteli) ya da Gemini API (`gemini-3.8-flash`). Model adı tek bir config dosyasında tutulur.
- Sohbet penceresinde kısa KVKK bildirimi ve aydınlatma linki bulunur. Konuşmalar yurt dışındaki bir API'ye gidiyorsa bu durum aydınlatmada yazılır (bkz. 7.1.6).

---

## 7. Hukuk ve KVKK Uyum Katmanı (Ödevin en çok puan getiren kısmı)

> Claude Code: Bu bölümdeki her madde bir **kabul kriteri**dir. `docs/legal/COMPLIANCE_CHECKLIST.md` dosyasını oluştur ve her maddenin kodda nerede karşılandığını (dosya yolu) yaz.

### 7.1 KVKK (6698 sayılı Kanun)

**7.1.1 Veri envanteri önce gelir.** Envanter olmadan yazılan aydınlatma metni eksik kalır. `docs/legal/veri-envanteri.md` dosyasında her işleme faaliyeti için şu kolonlar bulunur: veri kategorisi, amaç, hukuki sebep (m.5/m.6), toplama yöntemi, aktarılan taraflar (kargo, ödeme kuruluşu, e-posta, AI sağlayıcı, hosting), yurt dışı aktarım var mı, saklama süresi, imha yöntemi.

| İşleme | Veri | Hukuki sebep (öneri) |
|---|---|---|
| Üyelik | Ad, e-posta, telefon, şifre hash | Sözleşmenin kurulması/ifası |
| Sipariş & teslimat | Adres, fatura bilgisi, sipariş geçmişi | Sözleşmenin ifası, kanuni yükümlülük (vergi) |
| Ödeme | Kart bilgisi **ARION'da tutulmaz**, ödeme kuruluşunda işlenir | Sözleşmenin ifası |
| Müşteri hizmetleri | Talep içeriği, sohbet kaydı | Sözleşmenin ifası, meşru menfaat |
| Ayak İkizi | Ayak ölçüleri | **Açık rıza** (ihtiyatlı yaklaşım, bkz. 6.1) |
| Pazarlama e-posta/SMS | İletişim bilgisi | **Açık rıza + İYS onayı** |
| Analitik/reklam çerezleri | Çevrim içi tanımlayıcılar | **Açık rıza** |
| Zorunlu çerezler | Oturum, sepet, güvenlik | Açık rıza aranmaz (meşru menfaat / sözleşme) |

**7.1.2 Aydınlatma yükümlülüğü (m.10 + Aydınlatma Tebliği):** Aydınlatma metni şunları içermelidir: veri sorumlusunun kimliği, işleme amaçları, aktarılan kişi grupları ve amaçları, toplama yöntemi ve hukuki sebep, m.11 hakları. **Veri toplanan her noktada** (kayıt formu, ödeme, iletişim formu, sohbet, Ayak İkizi) o noktaya özel kısa bir aydınlatma ve genel metne link bulunur. Aydınlatma **okundu onayı kutusu ile alınmaz**. Bilgilendirmedir, onay değildir.

**7.1.3 Açık rıza:** Aydınlatma ile açık rıza **ayrı** tutulur. Bu ikisini karıştırmak e-ticaret sitelerindeki en yaygın uyum hatasıdır. Kurallar:
- Her amaç için ayrı kutucuk. Hiçbiri önceden işaretli değil.
- Rıza, üyelik veya satın almanın ön koşulu yapılamaz.
- `consents` tablosunda kayıt: kullanıcı, amaç, metin versiyonu, zaman, IP/UA, kanal. Geri çekme kaydı da tutulur.
- `/hesabim/izinlerim` sayfasında tüm rızalar tek tek açılıp kapatılabilir.

**7.1.4 Çerezler (KVKK Çerez Uygulamaları Hakkında Rehber):**
- İlk ziyarette banner: **"Tümünü Kabul Et" ve "Tümünü Reddet" eşit görünürlükte**. Ayrıca "Tercihleri Yönet".
- "Siteyi kullanmaya devam ederek kabul etmiş sayılırsınız" ifadesi **kullanılmaz**. Önceden işaretli kategoriler **yoktur**.
- Kategoriler: Zorunlu (her zaman açık), İşlevsel, Analitik, Pazarlama
- Rıza verilmeden analitik/pazarlama script'i **yüklenmez**. Script'ler consent durumuna göre koşullu enjekte edilir. Playwright testi bunu doğrulamalıdır.
- Çerez envanteri tablosu (ad, sağlayıcı, amaç, süre, birinci/üçüncü taraf) çerez politikasında otomatik üretilir.
- Footer'da her zaman "Çerez Tercihleri" linki bulunur.

**7.1.5 İlgili kişi hakları (m.11):** `/yasal/kvkk-basvuru` formu ve `/hesabim/veri-taleplerim` sayfası. Talep türleri: bilgi talebi, verilerimi indir (JSON), düzeltme, silme, itiraz. Admin panelinde "KVKK Talepleri" kuyruğu bulunur, **30 gün** sayacıyla.

**7.1.6 Yurt dışına aktarım (7499 sayılı Kanunla değişen m.9):** 1 Haziran 2024'ten beri kademeli bir rejim uygulanıyor: önce yeterlilik kararı, yoksa uygun güvenceler (standart sözleşme, bağlayıcı şirket kuralları), o da yoksa sınırlı arızi haller. Standart sözleşme imzalandıktan sonra **5 iş günü içinde** Kurum'a bildirilmelidir. Bu projede yurt dışı aktarım riski taşıyan servisler: Vercel/bulut hosting, Gemini/Claude API, e-posta servisi, Chatwoot Cloud. Bunlar için:
- `docs/legal/yurtdisi-aktarim.md`: Servis, ülke, aktarılan veri, dayanak (standart sözleşme), bildirim durumu
- Mimari tercih: Kişisel veriyi AI'a göndermeden önce **maskele** (ad, telefon, adres). Ayak İkizi verisini AI'a hiç gönderme.
- Alternatif olarak Türkiye'de barındırma seçeneği `docs/DECISIONS.md` dosyasında tartışılır.

**7.1.7 Saklama ve İmha Politikası:** Her veri kategorisi için süre (ör. fatura için vergi mevzuatı süresi, pazarlama için rıza geri çekilene kadar). Periyodik imha cron job'u (`apps/backend/src/jobs/kvkk-imha.ts`) ve imha log'u.

**7.1.8 Veri güvenliği:** TLS, HSTS, CSP, güvenli çerez bayrakları, rol tabanlı admin erişimi, admin işlemlerinde audit log, Ayak İkizi alanlarının uygulama seviyesinde şifrelenmesi, rate-limit, Zod ile girdi doğrulama, bağımlılık taraması. Veri ihlali müdahale prosedürü `docs/legal/veri-ihlali-proseduru.md` dosyasında bulunur (Kurul'a bildirim ve ilgililere bilgilendirme adımlarıyla).

**7.1.9 VERBİS:** Kayıt yükümlülüğü genel olarak yıllık çalışan sayısı ve mali bilanço eşiklerine bağlıdır. Ana faaliyeti özel nitelikli veri işleme olanlar için eşikler çok daha düşüktür. Eşikler 2025'te Kurul kararıyla güncellendi. Küçük bir startup büyük olasılıkla istisnadır, ama **Ayak İkizi verisi özel nitelikli kabul edilirse** değerlendirme değişebilir. Bu not sunumda "risk analizi" olarak gösterilir.

### 7.2 Tüketici Mevzuatı (6502 sayılı Kanun + Mesafeli Sözleşmeler Yönetmeliği)

**Ödeme adımında zorunlu akış:**
1. Sepet → Adres → Kargo → **Ön Bilgilendirme Formu** (sipariş özetiyle dinamik doldurulmuş, kaydırılabilir kutu + ayrı onay kutusu)
2. **Mesafeli Satış Sözleşmesi** (dinamik, ayrı onay)
3. Buton metni ödeme yükümlülüğünü açıkça belirtir: **"Siparişi Onayla ve Öde"**
4. Sipariş sonrası her iki metnin PDF'i e-postayla ve `/hesabim/siparisler` altında kalıcı olarak sunulur. Metin versiyonu siparişe bağlanır.

**Ön bilgilendirme formunda olması gerekenler (özet):** Satıcı kimliği ve iletişim bilgileri, ürünün temel nitelikleri, vergiler dahil toplam fiyat, kargo ücreti, ödeme ve teslimat şekli, teslim süresi, cayma hakkı ve kullanım yöntemi, şikâyet ve itiraz yolları. **1 Ocak 2026'dan itibaren:** Parasal sınırlar dahilindeki uyuşmazlıklarda dava açmadan önce **arabulucuya başvuru şartı** bilgisinin de formda yer alması zorunlu.

**Cayma hakkı:**
- Teslimden itibaren **14 gün**, gerekçesiz ve cezasız
- **1 Ocak 2026'dan itibaren iade kargo ücreti tüketiciye yüklenemez.** Satıcı karşılar. → Sistem iade talebinde otomatik **ücretsiz iade kargo kodu** üretir.
- Para iadesi, cayma bildiriminin ulaşmasından itibaren yasal süre içinde (14 gün) yapılır. Admin panelde sayaç bulunur.
- Teslim süresi en geç 30 gün.
- ⚠️ **Kişiye özel üretim istisnası:** Tüketicinin isteği ve kişisel ihtiyaçları doğrultusunda hazırlanan mallarda cayma hakkı istisnası vardır. Ayak İkizi'ne göre **ölçüye özel** üretilen ayakkabılarda bu istisna uygulanabilir. Ancak bu durum ön bilgilendirmede **açıkça** yazılmalıdır. Marka değeri için yine de gönüllü bir **"Uyum Garantisi"** sunulması önerilir (ör. bir kez ücretsiz düzeltme ya da yeniden üretim).

**Ayıplı mal:** Tüketicinin seçimlik hakları (sözleşmeden dönme, bedel indirimi, ücretsiz onarım, ayıpsız misliyle değişim) iade politikasında ve iade sihirbazında ayrı bir yol olarak sunulur.

**Şikâyet yolları:** Tüketici hakem heyeti parasal sınırı 2026 için **186.000 TL** (her yıl güncellenir, config'de tutulur). Tüketici Bilgi Sistemi/e-Devlet başvurusu linki verilir.

### 7.3 İndirim ve Fiyat Gösterimi (Ticari Reklam ve Haksız Ticari Uygulamalar Yönetmeliği)
- **1 Ağustos 2026'dan itibaren:** İndirimli satış reklamlarında, **indirimin başlangıcından önceki son 10 gün** içinde uygulanan en düşük fiyat, indirimden önceki fiyat olarak (üstü çizili) gösterilir. (Önceki kuralda 30 gün baz alınıyordu.)
- Uygulama: `price_history` tablosu tut. Üstü çizili fiyatı **elle girilen değerden değil, bu tablodan otomatik hesapla.** Admin panelde manuel "eski fiyat" alanı **olmasın**.
- Fiyatlar KDV dahil gösterilir. Kargo ücreti sepette açıkça yazılır.
- Kural parametrik olsun (`DISCOUNT_REFERENCE_DAYS=10`). Mevzuat değişirse tek satırla güncellenebilmeli.

### 7.4 Ticari Elektronik İleti (6563 sayılı Kanun + İYS)
- Pazarlama e-postası/SMS'i için **ayrı, önceden işaretlenmemiş** onay kutusu. Üyelik sözleşmesiyle birleştirilmez.
- Onaylar **İYS (İleti Yönetim Sistemi)** ile senkronize edilir. MVP'de `IysAdapter` arayüzü + mock implementasyon yeterli.
- Her iletide tek tıkla ret linki bulunur. Ret kaydı İYS'ye iletilir.
- İşlemsel iletiler (sipariş, kargo, iade) onay gerektirmez, ama içlerine reklam konmaz.

### 7.5 E-Ticaret Kayıt ve Künye
- **ETBİS** kaydı (eticaret.gov.tr). Footer'da ETBİS doğrulama logosu ya da karekodu için alan (demo).
- **Künye sayfası:** Unvan, MERSİS no, vergi dairesi/no, adres, telefon, e-posta, **KEP adresi**, ticaret sicil bilgisi. Demo değerler açıkça "örnek" olarak işaretlenir.
- Fatura: e-Arşiv entegrasyonu için `InvoiceAdapter` arayüzü (Paraşüt, BirFatura vb. sonraki faza bırakılır).

### 7.6 Ürün Yorumları
- Sadece satın alma doğrulanmış kullanıcı yorum yapabilir ("Doğrulanmış alıcı" rozeti)
- Olumsuz yorumlar gizlenmez. Moderasyon kriterleri yayımlanır.
- Yorumların nasıl toplandığı ve sıralandığı yorum alanının yanında açıklanır. Teşvikli yorum varsa etiketlenir.

### 7.7 Dijital Erişilebilirlik (2025/10 Cumhurbaşkanlığı Genelgesi)
- Genelge WCAG 2.2'yi teknik standart olarak belirledi. E-ticaret firmalarına uyum için **2 yıl** süre tanındı (yani Haziran 2027'ye kadar).
- Temel zorunluluk Düzey A. **ARION hedefi: WCAG 2.2 AA.**
- Uygulama: Semantik HTML, klavye ile tam gezinme, görünür odak, alt metinler, form hata mesajları, 3D görüntüleyici için metin alternatifi, renk kontrastı, `lang="tr"`. CI'da `@axe-core/playwright` testleri çalışır.
- `/yasal/erisilebilirlik` beyan sayfası.

### 7.8 AI ile Üretilmiş İçeriğin Şeffaflığı
- AI ile üretilen ürün görselleri ve videoları **"Yapay zekâ ile üretilmiştir"** etiketiyle gösterilir. (Google modellerinin çıktılarında SynthID filigranı da bulunur.)
- AI görseli ürünü **olduğundan farklı göstermemeli** (renk, malzeme, oran). Aksi aldatıcı reklam riskidir. Her ürün için en az bir gerçek ya da referans fotoğraf tutulur.

### 7.9 AB'ye Hazırlık (e-ihracat vizyonu)
- AB'nin ESPR tüzüğü kapsamında büyük şirketler 19 Temmuz 2026'dan itibaren satılmayan ayakkabıları imha edemiyor. Ayakkabı için Dijital Ürün Pasaportu henüz zorunlu değil. Komisyonun çalışma planı ayakkabı için 2027 sonuna kadar bir çalışma öngörüyor.
- ARION'ın Pasaport veri modeli (malzeme, menşe, tamir edilebilirlik, geri dönüşüm) bu geleceğe hazırdır. Sunumda **"regülasyon gelmeden hazırız"** argümanı olarak kullanılır.

---

## 8. Müşteri Hizmetleri Modülü

### 8.1 Kanallar
| Kanal | Araç | Not |
|---|---|---|
| Canlı sohbet (site) | **Chatwoot** (açık kaynak, self-host edilebilir) widget | AI "Areion" ilk karşılar, temsilciye devreder |
| WhatsApp | Chatwoot WhatsApp kanalı | Demo için sandbox ya da mock |
| E-posta | Chatwoot e-posta inbox'ı | destek@… |
| Talep formu | Site içi form → Chatwoot conversation + bilet no | KVKK kısa aydınlatma |
| Geri arama talebi | Form → takvim slotu | Opsiyonel |
| Telefon | Çalışma saatleriyle iletişim sayfasında | |

> Chatwoot tek gelen kutusunda canlı sohbet, e-posta, WhatsApp ve sosyal medyayı birleştirir. Self-host edilirse veri kontrolü sende kalır. Bu KVKK için artıdır. Ödev demosunda `docker compose` ile ayağa kaldırılabilir. Kaynak kısıtlıysa Chatwoot Cloud ücretsiz planı kullanılır, ama bu durumda yurt dışı aktarım notu eklenmelidir.

### 8.2 Self-servis
- **Yardım merkezi:** Kategorili SSS (Beden & Uyum, Sipariş, Kargo, İade, Ödeme, Bakım, KVKK) ve tam metin arama
- **Sipariş takibi:** Giriş gerekmez (sipariş no + e-posta doğrulaması). Kargo durumu (mock kargo adapter'ı).
- **İade sihirbazı:**
  1. Sipariş seç → ürün seç
  2. Neden seç (uyum / beğenmedim / kusurlu / yanlış ürün). "Kusurlu" seçilirse **ayıplı mal yolu** açılır (seçimlik haklar).
  3. Cayma süresi otomatik kontrol edilir (14 gün). Kişiye özel ürünse bilgi gösterilir.
  4. Değişim mi iade mi? Değişimde Ayak İkizi'ne göre yeni numara önerilir.
  5. **Ücretsiz iade kargo kodu** üretilir.
  6. Durum takibi ve iade süresi sayacı
- Uyum kaynaklı iadeler `fit-engine`'e geri besleme olarak kaydedilir (anonimleştirilmiş).

### 8.3 Operasyon (Admin)
- Bilet kuyruğu, SLA göstergeleri (ilk yanıt, çözüm süresi)
- Hazır yanıt şablonları (Türkçe, marka tonunda)
- İade/cayma kuyruğu ve para iadesi son tarih uyarıları
- KVKK talepleri kuyruğu (30 gün sayacı)
- Müşteri memnuniyeti anketi (CSAT), görüşme sonrası

### 8.4 Ton ve Dil
Sıcak, bilgili, bir ayakkabı ustası gibi konuşan ama asla küçümsemeyen bir dil. Örnek: *"Bu kalıp ön ayakta biraz dar çalışıyor. Senin ölçülerinle bir yarım numara büyüğü ya da geniş (W) versiyonu daha rahat eder."*

---

## 9. Teknik Mimari

### 9.1 Teknoloji Yığını (Kasım 2026 itibarıyla doğrulandı)
| Katman | Seçim | Gerekçe / Not |
|---|---|---|
| Commerce backend | **Medusa v2** (2.18+, Node.js/TypeScript) | Açık kaynak, modüler, yönetim paneli dahil. Kendi modüllerimizi (Kalıp, Pasaport, Tamir) eklemeye uygun. |
| Storefront | **Next.js 16.x** (App Router, Turbopack, React 19.2) | Medusa v2.14'ten beri `create-medusa-app` backend'i ve Next.js storefront'u tek monorepo'da kuruyor. Bağımsız eski starter deprecated. **dtc-starter** yapısını kullan. Starter'ın Next.js sürümü 16'dan düşükse uyumluluğu kontrol edip yükselt, kararı `DECISIONS.md`'ye yaz. |
| UI | **Tailwind CSS v4** (CSS-first, `tailwind.config` yok) + **shadcn/ui** (Radix) | Erişilebilir primitive'ler, kopyala-sahiplen yaklaşımı |
| İçerik (manifesto, hikâye, SSS) | MDX (repo içinde) → *opsiyonel:* Payload CMS 3 | Payload 3 doğrudan Next.js içine kurulur. Ödev için MDX yeterli, startup fazında Payload'a geç. |
| Veritabanı | PostgreSQL 16+ | Medusa gereksinimi |
| Cache/Queue | Redis | Medusa event bus, workflow |
| Arama | Meilisearch (self-host) | Türkçe arama, filtre (numara, genişlik, uyum skoru) |
| Ödeme | **iyzico** (sandbox, Checkout Form / 3D Secure) | Kart verisi bizde tutulmaz, PCI kapsamı küçülür. Medusa'ya özel Payment Provider modülü yazılır. Alternatif: PayTR iFrame. |
| 3D | `@google/model-viewer` + React Three Fiber/drei + three.js | Ürün görüntüleme + AR + anatomi |
| Destek | Chatwoot (Docker) | Omnichannel, AI devri |
| AI sohbet | Vercel AI SDK + Claude API veya Gemini API | Sağlayıcıdan bağımsız |
| E-posta | React Email + SMTP/Resend adapter | İşlemsel e-postalar |
| Test | Vitest (unit), Playwright (E2E), axe-core (a11y), Lighthouse CI | |
| Gözlem | OpenTelemetry/Sentry (opsiyonel) | |
| Dağıtım | Docker Compose (lokal demo) → Vercel (storefront) + Railway/Render/Fly (Medusa, DB) | Yurt dışı aktarım notu (7.1.6) |

### 9.2 Monorepo Yapısı
```
arion/
├─ apps/
│  ├─ backend/                 # Medusa v2
│  │  ├─ src/modules/
│  │  │  ├─ last/              # Kalıp (Last) modülü + ölçü tabloları
│  │  │  ├─ passport/          # Ayakkabı Pasaportu
│  │  │  ├─ repair/            # Tamir/geri alım
│  │  │  ├─ consent/           # Rıza kayıtları, KVKK talepleri
│  │  │  ├─ price-history/     # İndirim referans fiyatı
│  │  │  └─ iyzico-payment/    # Payment provider
│  │  ├─ src/workflows/        # İade, cayma, kvkk-talep, pasaport-oluştur
│  │  ├─ src/jobs/             # kvkk-imha, bakım-hatırlatıcı
│  │  └─ src/admin/            # Admin widget'ları (Uyum, KVKK, Pasaport)
│  └─ storefront/              # Next.js 16
│     ├─ src/app/(shop)/…
│     ├─ src/app/(legal)/yasal/…
│     ├─ src/app/(help)/yardim/…
│     ├─ src/components/{three,fit,consent,support}/
│     └─ content/{manifestos,faq,legal}/*.mdx
├─ packages/
│  ├─ fit-engine/              # Saf TS uyum motoru + testler
│  ├─ legal-texts/             # Versiyonlu yasal metin şablonları + dinamik doldurucu
│  └─ ui/                      # Ortak tasarım token'ları (opsiyonel)
├─ scripts/
│  └─ media-pipeline/          # Gemini görsel/video + image-to-3D + gltf optimizasyon
├─ infra/docker-compose.yml    # postgres, redis, meilisearch, chatwoot
├─ docs/
│  ├─ PROJE_RAPORU.md          # bu dosya
│  ├─ DECISIONS.md
│  └─ legal/{veri-envanteri, yurtdisi-aktarim, saklama-imha, veri-ihlali-proseduru, COMPLIANCE_CHECKLIST}.md
└─ CLAUDE.md
```

### 9.3 Veri Modeli (Medusa'ya ek)
```ts
// Kategoriye özel teknik özellikler: product.metadata yerine tipli modül tablosu
Last { id, code, name, category, toeShape, sizeTable: Array<{ euSize, lengthMm, ballWidthMm, girthMm, widthFitting: 'N'|'M'|'W' }>, notes }
ProductTech {
  productId, lastId, construction: 'cemented'|'goodyear_welt'|'blake'|'vulcanized',
  heel?: { heightMm, type, shank: 'steel'|'composite'|'none', pitchDeg },
  boot?: { waterproofHours, membrane, insulationRating, lugDepthMm },
  materials: Array<{ part, material, origin }>, weightGramsPair, repairabilityScore
}
TestReport { productId, metrics: Array<{ key, value, unit, method, isDemo }>, pdfUrl? }
FootProfile { id, customerId?, lengthMm, ballWidthMm, archType, preference, encrypted: true, consentId, createdAt }  // hassas
FitFeedback { orderLineId, result: 'perfect'|'small'|'large'|'narrow'|'wide', anonymized: true }
Passport { code, productVariantId, craftsmanId, producedAt, repairHistory: RepairEvent[] }
Craftsman { id, name, specialty, bio, photo }
RepairOrder { id, customerId, passportCode?, type, status, quote, shippingCode }
Consent { id, subjectRef, purpose, textVersion, granted, at, ip, userAgent, channel, revokedAt? }
DataSubjectRequest { id, type, status, receivedAt, dueAt /* +30 gün */, resolvedAt }
PriceHistory { variantId, price, validFrom, validTo }
LegalTextVersion { key, version, contentHash, publishedAt }
SupportTicket → Chatwoot conversation id ile eşlenir
```

### 9.4 Kritik Entegrasyon Notları
- **iyzico:** Sandbox'ta Checkout Form başlat → callback'te ödeme sonucunu **sunucu tarafında iyzico API'den doğrula** (callback'e güvenme) → Medusa payment session'ı yetkilendir. Taksit ve BIN sorgusu opsiyonel.
- **Kargo:** `ShippingAdapter` arayüzü + mock (takip no üretir, durum simüle eder). Gerçek entegrasyon sonraki faz.
- **İYS, e-Arşiv:** Adapter arayüzü + mock.
- Tüm adapter'lar `.env` ile `mock|live` modunda çalışır.

---

## 10. AI Medya Üretim Hattı (Gemini ve 3D)

> Bu hat **build-time / admin aracı** olarak çalışır. Son kullanıcı isteğinde canlı üretim yapılmaz (maliyet ve kontrol). Çıktılar `public/media/` altına ya da object storage'a yazılır ve admin onayından geçer.

### 10.1 Güncel Model Durumu (Kasım 2026, Gemini API changelog'una göre)
- **Video:** `gemini-omni-1.1-flash` 27 Ağustos 2026'da GA oldu. Gemini API dokümanı Veo 3.1 preview modelleri yerine bunu öneriyor. **Veo 3.1 preview modelleri 22 Ekim 2026 itibarıyla devre dışı.** Veo 3.1'in GA sürümü (`veo-3.1-generate-001`) Google'ın kurumsal platformunda (Vertex) erişilebilir.
- **Görsel:** `gemini-nano-banana-2.1` (6 Ekim 2026'da GA, hızlı/ekonomik) ve Nano Banana Pro (Gemini 3 Pro Image, yüksek kalite, metin yazdırma ve ürün mockup'larında güçlü). Gemini görsellerinde SynthID filigranı bulunur.
- **Metin (opsiyonel):** `gemini-3.8-flash`, `gemini-4-argon`
- ⚠️ Google bu alanda modelleri çok hızlı değiştiriyor. **Model ID'leri `scripts/media-pipeline/models.config.ts` içinde tek yerde tut** ve kurulumda resmi dokümandan doğrula.

### 10.2 Hat Adımları
```
1) Kaynak: Gerçek ürün fotoğrafları (ya da ödev için tasarım çizimleri)
2) Stüdyo görselleri (Nano Banana): Arka plan temizleme, tutarlı stüdyo ışığı,
   ön/yan/arka/üst açılar (çok açılı referans set). Ürün formu DEĞİŞTİRİLMEZ.
3) 3D model (image-to-3D): Çok açılı set → Hunyuan3D / Tripo / Meshy API
   → GLB (PBR doku). Sağlayıcı adapter ile değiştirilebilir olsun.
4) Optimizasyon: gltf-transform (draco/meshopt + KTX2/WebP), ≤3 MB,
   iOS için USDZ dönüşümü, poster.webp üretimi
5) Video (Gemini Omni Flash, image-to-video):
   - "Turntable": Ürün 360° döner, nötr stüdyo, 5-8 sn
   - "Atölye anı": Usta eli, deri kesimi, sıcak ışık (mood videosu, ürün iddiası içermez)
   - "Kategori hikâyesi": Topuklu için denge, bot için kar/yağmur testi atmosferi
6) Admin onayı → yayın. Her medya kaydına `aiGenerated: true`, model adı ve prompt saklanır.
```

### 10.3 Prompt Şablonları (örnek, İngilizce prompt genelde daha iyi sonuç verir)
- **Turntable:** *"Slow 360-degree turntable of the exact shoe in the reference image, seamless loop, soft studio lighting on a warm bone-white seamless backdrop, subtle contact shadow, no text, no logos, product shape and colors must remain identical to the reference."*
- **Kışlık bot hikâyesi:** *"Macro shot of a waterproof leather winter boot stepping into shallow slush, water beading on the leather, cold blue morning light, cinematic, 24fps, no people's faces."*
- **Topuklu denge:** *"Elegant side profile of a heeled shoe on a minimalist plinth, a thin animated line traces the weight path from heel to forefoot, technical-drawing aesthetic, warm neutral palette."*

> **Kural:** Video ve görsellerde gerçek kişi, ünlü, başka marka logosu ya da telifli karakter **kullanılmaz**.

### 10.4 Maliyet ve Güvenlik
- API anahtarları sadece sunucu/CLI tarafında tutulur. `.env` git'e girmez.
- Script `--dry-run` ve bütçe limiti (`MAX_USD`) parametreleri alır.
- Kişisel veri (müşteri fotoğrafı, ayak görüntüsü) bu hatta **asla** gönderilmez.

---

## 11. Claude Code Ekosistemi: Skill'ler, MCP'ler ve Referans Repolar

### 11.1 Kurulacak Skill'ler
> Kurmadan önce her skill'in `SKILL.md` dosyasını oku. Topluluk skill'lerinde risk olabilir.

| Skill | Kaynak | Ne için |
|---|---|---|
| `frontend-design` | `anthropics/skills` (resmi) | Jenerik olmayan, karakterli UI kararları |
| `webapp-testing` | `anthropics/skills` (resmi) | Playwright ile lokal uygulamayı test etme, ekran görüntüsü, konsol log'ları |
| `skill-creator` | `anthropics/skills` (resmi) | Projeye özel skill yazmak için (ör. `arion-legal-check`) |
| `tailwind-v4-shadcn` | `jezweb/claude-skills` (topluluk) | Tailwind v4 + shadcn kurulum tuzakları. **Önce gözden geçir.** |

Kurulum seçenekleri:
```bash
# Claude Code içinde (resmi marketplace)
/plugin marketplace add anthropics/skills
# veya skills CLI
npx skills add anthropics/skills --skill frontend-design
npx skills add anthropics/skills --skill webapp-testing
```

### 11.2 Projeye Özel Skill Önerileri (Claude Code yazacak)
- **`arion-legal-check`:** Ödeme akışı, çerez banner'ı, formlar ve fiyat gösterimini Bölüm 7'deki kontrol listesine göre denetleyip rapor üretir.
- **`arion-content-voice`:** Marka tonu, terminoloji sözlüğü (kalıp, saya, pençe, şank, welt…) ve yasaklı ifadeler (sağlık iddiası, "en iyi" gibi kanıtsız üstünlük iddiaları).

### 11.3 MCP Sunucuları (opsiyonel ama faydalı)
- **Playwright MCP:** Tarayıcı otomasyonu (webapp-testing skill'ine alternatif ya da tamamlayıcı)
- **PostgreSQL MCP:** Geliştirme veritabanını sorgulama (sadece lokal)
- **GitHub MCP / `gh` CLI:** Issue ve PR akışı

### 11.4 Referans GitHub Repoları
| Repo | Kullanım |
|---|---|
| `medusajs/medusa` | Commerce çekirdeği, modül ve workflow örnekleri |
| `medusajs/dtc-starter` | Güncel monorepo starter (backend + Next.js storefront) |
| `vercel/next.js` | Framework |
| `shadcn-ui/ui` | Bileşenler |
| `google/model-viewer` | 3D/AR görüntüleyici |
| `pmndrs/react-three-fiber`, `pmndrs/drei` | Anatomi 3D sahnesi |
| `donmccurdy/glTF-Transform` | GLB optimizasyonu |
| `chatwoot/chatwoot` | Müşteri hizmetleri platformu |
| `iyzico/iyzipay-node` | iyzico resmi Node SDK'sı |
| `googleapis/js-genai` | Gemini API JS SDK'sı (`@google/genai`) |
| `vercel/ai` | Sağlayıcıdan bağımsız AI SDK |
| `meilisearch/meilisearch` | Arama |
| `payloadcms/payload` | (Opsiyonel) Next.js içine gömülü CMS |
| `dequelabs/axe-core-npm` | Erişilebilirlik testleri |
| `anthropics/skills` | Skill'ler |

---

## 12. Uygulama Fazları ve Kabul Kriterleri

> Claude Code her fazı ayrı branch'te yapar, sonunda kabul kriterlerini doğrular, Playwright ekran görüntülerini `docs/screenshots/faz-N/` altına koyar ve commit atar.

### Faz 0 — Kurulum
- `create-medusa-app` ile monorepo, `infra/docker-compose.yml` (postgres, redis, meilisearch, chatwoot)
- TypeScript strict, ESLint, Prettier, Vitest, Playwright, Husky
- `CLAUDE.md`, `docs/DECISIONS.md`, `.env.example`
- **Kabul:** `docker compose up` + `pnpm dev` ile backend (admin) ve storefront açılıyor. Örnek E2E testi geçiyor.

### Faz 1 — Tasarım Sistemi ve Marka
- Token'lar (renk, tipografi, boşluk), shadcn temalandırma, temel layout, header/footer (yasal linkler dahil)
- `next-intl` ile TR/EN altyapısı, dil seçici, `hreflang` (bkz. 4.1)
- ARION logosu (tipografik + yele/hareket çizgisi), favicon, Open Graph görselleri
- Ana sayfa ve manifesto sayfası (statik içerik, TR + EN)
- **Kabul:** Lighthouse Accessibility ≥ 95. Türkçe karakterler doğru render ediliyor. TR ↔ EN geçişi aynı sayfada çalışıyor. Mobil ve masaüstü ekran görüntüleri hazır.

### Faz 2 — Commerce Çekirdeği
- Kategoriler, ürünler, varyantlar (numara × renk × genişlik), `Last` ve `ProductTech` modülleri
- Seed: 5 kategoride ≥ 12 ürün, ≥ 4 kalıp (Türkçe gerçekçi içerik, `DEMO` etiketli)
- Sepet, adres, kargo (mock), **iyzico sandbox** ödeme, sipariş e-postası
- `price_history` ve otomatik indirim referans fiyatı (10 gün kuralı)
- **Kabul:** Misafir ve üye olarak uçtan uca sandbox satın alma E2E testi geçiyor. Üstü çizili fiyat yalnızca `price_history`'den geliyor.

### Faz 3 — Hukuk ve KVKK Katmanı
- Bölüm 7'deki tüm sayfalar ve akışlar: aydınlatma (genel + nokta bazlı), açık rıza (ayrı), çerez banner'ı + tercih merkezi + koşullu script yükleme, KVKK başvuru formu ve admin kuyruğu, ön bilgilendirme ve mesafeli satış (dinamik + PDF + versiyon), künye, İYS mock, saklama-imha job'u
- `docs/legal/*` dokümanları ve `COMPLIANCE_CHECKLIST.md`
- **Kabul:**
  - "Tümünü reddet" seçildiğinde hiçbir analitik/pazarlama isteği atılmadığı Playwright network testiyle kanıtlanıyor.
  - Hiçbir rıza kutusu varsayılan işaretli değil (otomatik test).
  - Ödeme butonu ön bilgilendirme ve mesafeli satış onayı olmadan pasif.
  - Ön bilgilendirmede arabuluculuk bilgisi ve iade kargo ücretinin satıcıya ait olduğu yazıyor.

### Faz 4 — Müşteri Hizmetleri
- Yardım merkezi + arama, giriş gerektirmeyen sipariş takibi, iade sihirbazı (cayma/ayıplı mal ayrımı, ücretsiz iade kodu), talep formu → Chatwoot, canlı sohbet widget'ı, AI "Areion" (RAG + devretme), admin SLA ve iade sayaçları
- **Kabul:** İade sihirbazı 14 günü aşan siparişte doğru uyarıyı veriyor. AI, sağlık sorusunda tavsiye vermeyip yönlendiriyor (test senaryosu). Sohbet temsilciye devredilebiliyor.

### Faz 5 — İmza Özellikler
- Ayak İkizi sihirbazı + `fit-engine` (≥ %90 test kapsamı) + "Bana uyanlar" filtresi
- Ürün sayfasında Uyum Skoru, Dayanıklılık Kartı, model-viewer (AR), Anatomi (R3F) sekmesi
- Pasaport sayfası + admin'den QR PDF, Atölye Takibi zaman çizelgesi, Ömür Planı ve tamir talebi
- Şeffaflık paneli
- **Kabul:** Ayak İkizi misafir modunda hiçbir şey saklamıyor. Üye modunda açık rıza olmadan kaydetmiyor. Sil butonu veriyi gerçekten siliyor (DB testi). 3D model mobilde ≤ 3 sn'de poster gösteriyor.

### Faz 6 — AI Medya Hattı
- `scripts/media-pipeline` (Node, `@google/genai`): stüdyo görseli → (opsiyonel) image-to-3D adapter'ı → gltf optimizasyonu → Omni Flash video. `--dry-run`, bütçe limiti, admin onay kuyruğu.
- **Kabul:** En az 2 ürün için AI turntable videosu ve 1 GLB modeli sitede "Yapay zekâ ile üretilmiştir" etiketiyle görünüyor. API anahtarı yoksa hat mock varlıklarla çalışıyor.

### Faz 7 — Kalite: Erişilebilirlik, Performans, Güvenlik
- axe-core ile kritik sayfalarda 0 ciddi ihlal. Klavye ile tam satın alma akışı.
- Core Web Vitals: LCP < 2,5 sn (mobil, ürün sayfası). Görsel optimizasyonu, font subsetting.
- Güvenlik başlıkları (CSP, HSTS), rate-limit, girdi doğrulama, `npm audit` temiz, admin audit log
- **Kabul:** CI'da unit + E2E + a11y + Lighthouse kontrolleri yeşil.

### Faz 8 — Demo, Sunum, Dağıtım
- Gerçekçi demo verisi, "Demo modu" şeridi (sitenin gerçek satış yapmadığını belirtir)
- `docs/DEMO_SENARYOSU.md` (Bölüm 14), README, mimari diyagramı
- Dağıtım (opsiyonel) ya da lokal sunum
- **Kabul:** Demo senaryosu baştan sona 7 dakikada hatasız oynatılabiliyor.

---

## 13. Repo Kökü İçin `CLAUDE.md` (Claude Code oluşturacak)

```md
# ARION — Claude Code Çalışma Kuralları

## Proje
Ayakkabı D2C e-ticaret + uyum teknolojisi. Ayrıntı: docs/PROJE_RAPORU.md (tek doğruluk kaynağı).

## Komutlar
- Altyapı: `docker compose -f infra/docker-compose.yml up -d`
- Geliştirme: `pnpm dev` | Test: `pnpm test` | E2E: `pnpm e2e` | A11y: `pnpm e2e:a11y`

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
- frontend-design skill'ini kullan. Bölüm 4'teki palet ve tipografi. Jenerik AI estetiği yok.
- prefers-reduced-motion'a saygı göster. WCAG 2.2 AA hedefi.

## Çalışma şekli
- Her faz sonunda kabul kriterlerini doğrula, ekran görüntüsü al, docs/DECISIONS.md'yi güncelle.
- Sürüm veya API bu dokümanla çelişirse resmi dokümana uy ve farkı DECISIONS.md'ye yaz.
```

---

## 14. Demo ve Sunum Senaryosu (7 dakika, tam not için)

1. **(0:00) Hook:** Ana sayfa. Arion mitiyle açılış: "Efsanede Arion sahibini savaştan eve taşıyan attı. Biz de ayakkabıyı böyle görüyoruz." Ardından: "Türkiye 2025'te 64 milyon çift daha az ayakkabı üretti. Ucuzla yarışamayız, akılla yarışırız."
2. **(0:45) Ayak İkizi:** Misafir olarak ölçü gir → "Bana uyanlar" filtresi → uyum skoruna göre sıralanmış ürünler.
3. **(1:45) Topuklu ürün sayfası:** Uyum Skoru açıklaması → Anatomi sekmesinde şank ve ağırlık çizgisi → Dayanıklılık Kartı.
4. **(2:45) Kışlık bot:** Aynı kartta farklı öncelikler (su geçirmezlik, taban dişi) → AR ile odaya yerleştir (telefon) → AI turntable videosu (etiketli).
5. **(3:30) Satın alma:** Ön bilgilendirme (arabuluculuk satırı) → mesafeli satış → iyzico sandbox 3D Secure → sipariş e-postası ve PDF'ler.
6. **(4:30) Müşteri hizmetleri:** AI Areion'a "41 mi 42 mi?" sor (sonra aynı soruyu İngilizce sor) → temsilciye devir (Chatwoot paneli) → iade sihirbazı → ücretsiz iade kodu.
7. **(5:30) KVKK:** Çerezleri "Tümünü Reddet" → DevTools network'te analitik isteği olmadığını göster → İzinlerim sayfası → Ayak İkizimi sil.
8. **(6:15) Startup kapanışı:** Pasaport QR'ını telefonla okut → Şeffaflık paneli → iş modeli (Ömür Planı, B2B Uyum API, AB DPP hazırlığı).

**Jüri/hoca soruları için hazır cevaplar:**
- *"KVKK'da en riskli nokta neydi?"* → Ayak verisi. Sağlık verisi gibi davrandık: cihazda işleme, ayrı rıza, şifreleme, tek tık silme.
- *"Ölçüye özel ayakkabıda cayma hakkı?"* → Kişiye özel mal istisnası var. Bunu ön bilgilendirmede açıkça yazıyoruz, yine de gönüllü Uyum Garantisi veriyoruz.
- *"İndirimler neden güvenilir?"* → Eski fiyat elle girilemiyor. Mevzuattaki 10 gün kuralıyla fiyat geçmişinden otomatik hesaplanıyor.
- *"Yapay zekâ görselleri yanıltıcı olmaz mı?"* → Etiketliyoruz, ürün formunu değiştirmiyoruz, gerçek referans fotoğrafı tutuyoruz.

---

## 15. Riskler ve Önlemler
| Risk | Önlem |
|---|---|
| Medusa + Chatwoot + Meilisearch kaynak tüketimi (öğrenci bilgisayarı) | Chatwoot ve Meilisearch opsiyonel profile'da. Mock fallback'ler. |
| iyzico özel provider modülü süresi | Önce Medusa'nın sistem (manual) provider'ıyla akışı bitir, sonra iyzico'yu ekle |
| AI model ID'lerinin değişmesi | Tek config dosyası, adapter, mock varlıklar |
| 3D model kalitesi | Çok açılı görsel seti, sağlayıcı değiştirilebilir, poster fallback |
| Hukuki metinlerde eksiklik | COMPLIANCE_CHECKLIST + arion-legal-check skill'i + "avukat kontrolü gerekir" notu |
| Kapsam şişmesi | Faz 0–5 zorunlu, 6–8 not yükseltici. Her faz kendi başına sunulabilir. |

---

## 16. Kaynaklar (araştırmada kullanılanlar)

**Mevzuat ve resmi kaynaklar**
- KVKK – Yurt Dışına Aktarım: https://www.kvkk.gov.tr/Icerik/2053/Yurtdisina-Aktarim
- KVKK – Standart Sözleşme Bildirim Modülü: https://www.kvkk.gov.tr/Icerik/8043/Standart-Sozlesme-Bildirim-Modulu-Hakkinda-Kamuoyu-Duyurusu
- KVKK – Çerez Uygulamaları Hakkında Rehber: https://kvkk.gov.tr/Icerik/7353/Cerez-Uygulamalari-Hakkinda-Rehber
- KVKK – VERBİS 2025 bilanço duyurusu: https://www.kvkk.gov.tr/Icerik/8752/
- Ticaret Bakanlığı – ETBİS kayıt ve bildirim esasları: https://ticaret.gov.tr/duyurular/elektronik-ticaret-bilgi-sistemine-etbis-kayit-ve-bildirim-esaslari
- Ticaret Bakanlığı – Ayakkabı Sektör Raporu 2026: https://ticaret.gov.tr/data/5b87000813b8761450e18d7b/Ayakkabı%20Sektör%20Raporu%202026.pdf
- Mesafeli Sözleşmeler Yönetmeliği 2026 değişiklikleri (Hukukçular Evi): https://hukukcularevi.com/danismanlik/mesafeli-sozlesmeler-yonetmeligi-2026-degisiklikleri-eticaret/
- İade kargo ve arabuluculuk bilgisi (Habertürk): https://www.haberturk.com/cep-telefonu-akilli-saat-tablet-bilgisayar-internet-alisverisinde-yeni-donem-cayma-hakkinda-onemli-degisiklikler-3793621-ekonomi
- İndirimde 10 gün kuralı (Alomaliye): https://www.alomaliye.com/2026/09/02/indirimli-satislarda-yeni-donem/amp/
- Tüketici hakem heyeti 2026 sınırı (CNBC-e): https://www.cnbce.com/haberler/tuketicinin-korunmasina-yonelik-idari-para-cezalari-artirildi-h21696
- 2025/10 Erişilebilirlik Genelgesi (Erdem & Erdem): https://www.erdem-erdem.av.tr/bilgi-bankasi/web-siteleri-ve-mobil-uygulamalarin-erisilebilirligi-hakkinda-2025-10-sayili-cumhurbaskanligi-genelgesi-yayimlandi
- Erişilebilirlik süreleri (Posta): https://www.posta.com.tr/bilim-teknoloji/zorunlu-hale-gelen-dijital-erisilebilirlik-neleri-kapsiyor-2894080
- E-ticaret KVKK rehberi 2026 (FFK Partner): https://www.ffkpartnerhukuk.com.tr/e-ticaret-kvkk-rehberi-2026-e-ticaret-siteleri-icin-kvkk-uyum-sureci/
- E-ticaret hukuki yükümlülükler 2026 (FFK Partner): https://www.ffkpartnerhukuk.com.tr/e-ticaret-sitelerinin-hukuki-yukumlulukleri-2026-guncel-rehber/

**Marka adı (Arion)**
- Arion (at), Yunan mitolojisi: https://en.wikipedia.org/wiki/Arion_(horse)
- Theoi – Areion: https://www.theoi.com/Ther/HipposAreion.html
- Ad çakışması örnekleri: Fluchos ARION serisi (https://fluchos.fr/en/products/arion-f1840-deportivo-taupe), UYN Arion (https://uynsports.com/en_gb/man-arion-shoes-blue-sole)
- Marka sorgusu: TÜRKPATENT (https://www.turkpatent.gov.tr), WIPO Global Brand Database (https://branddb.wipo.int)

**Pazar**
- Türkiye üretim ve ihracat 2025 (Ekonomi Gazetesi): https://www.ekonomigazetesi.com/sektor-haberleri/turkiye-ayakkabi-liginde-10-siraya-indi-86829
- TASD ihracat verisi (Bloomberg HT): https://www.bloomberght.com/ayakkabi-sanayicisinden-krizden-cikis-icin-dort-maddelik-oneri-3790679
- E-ihracat payı (Ekonomist): https://www.ekonomist.com.tr/etkinlikler/turk-ayakkabi-sektorunun-yeni-rotasi-sinir-otesi-e-ticaret-75084
- AB ESPR / DPP ve imha yasağı (BD Emerson): https://www.bdemerson.com/article/digital-product-passport-textiles
- Uyum teknolojisi örnekleri: Volumental (https://apps.shopify.com/volumental-app), Neatsy (https://www.fabbaloo.com/news/neatsy-ai-upgrades-shoe-fit-with-3d-foot-scans), Snapfeet (https://thebrighterside.news/post/new-mobile-phone-app-shows-how-well-shoes-will-fit-based-on-the-3d-shape-of-the-user-s-foot)

**Teknoloji**
- Next.js sürümleri: https://nextjs.org/blog
- Medusa Next.js Starter / dtc-starter: https://docs.medusajs.com/starters/nextjs-medusa-starter
- Medusa v2.18: https://medusajs.com/blog/announcing-medusa-v2.18
- Payload CMS: https://github.com/payloadcms/payload
- model-viewer: https://developers.google.com/ar/develop/webxr/model-viewer
- Gemini API changelog: https://ai.google.dev/gemini-api/docs/changelog
- Gemini video dokümanı: https://ai.google.dev/gemini-api/docs/video
- Nano Banana Pro: https://ai.google.dev/gemini-api/docs/models/gemini-3-pro-image
- iyzico 3DS dokümanı: https://docs.iyzico.com/en/payment-methods/api/3ds
- Chatwoot: https://github.com/chatwoot/chatwoot
- 3D üretim API karşılaştırması: https://www.3daistudio.com/blog/best-3d-model-generation-apis-2026
- anthropics/skills: https://github.com/anthropics/skills

---
*Rapor sonu. Claude Code: Bölüm 0'daki prompt ile başla.*
