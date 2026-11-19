import { CONSUMER, DSR_RESPONSE_DAYS, SELLER } from "../config"
import type { LegalDoc } from "../types"

const controller = `${SELLER.title}, ${SELLER.address}. E-posta: ${SELLER.kvkkEmail} · KEP: ${SELLER.kep}`

export const TR_PRIVACY: Record<string, LegalDoc> = {
  "kvkk-aydinlatma": {
    key: "kvkk-aydinlatma",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "KVKK Aydınlatma Metni",
    intro:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) m.10 ve Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca, kişisel verilerinin nasıl işlendiğini aşağıda açıklıyoruz. Bu metin bilgilendirme amaçlıdır; onayın alınmasını gerektirmez.",
    sections: [
      { heading: "1. Veri sorumlusu", paragraphs: [controller] },
      {
        heading: "2. İşlenen veriler, amaçlar ve hukuki sebepler",
        table: {
          columns: [
            "İşleme faaliyeti",
            "Veri kategorisi",
            "Amaç",
            "Hukuki sebep",
          ],
          rows: [
            [
              "Üyelik",
              "Ad, soyad, e-posta, şifre özeti",
              "Üyelik sözleşmesinin kurulması ve yönetimi",
              "KVKK m.5/2-c (sözleşmenin kurulması/ifası)",
            ],
            [
              "Sipariş ve teslimat",
              "Teslimat/fatura adresi, telefon, sipariş geçmişi",
              "Siparişin teslimi, faturalama",
              "m.5/2-c; m.5/2-ç (vergi mevzuatından doğan yükümlülük)",
            ],
            [
              "Ödeme",
              "Kart bilgisi ARION'da TUTULMAZ; ödeme kuruluşu sonucu ve işlem no",
              "Ödemenin alınması",
              "m.5/2-c",
            ],
            [
              "Müşteri hizmetleri",
              "Talep içeriği, yazışma ve sohbet kayıtları",
              "Taleplerin çözümü, hizmet kalitesi",
              "m.5/2-c; m.5/2-f (meşru menfaat)",
            ],
            [
              "Ayak İkizi",
              "Ayak ölçüleri (uzunluk, genişlik, kemer tipi)",
              "Numara/kalıp önerisi",
              "Açık rıza (m.5/1; ihtiyatla özel nitelikli veri gibi korunur)",
            ],
            [
              "Pazarlama iletişimi",
              "E-posta, telefon",
              "Kampanya duyuruları",
              "Açık rıza + İYS onayı (6563 s.K.)",
            ],
            [
              "Analitik/pazarlama çerezleri",
              "Çevrim içi tanımlayıcılar",
              "Ölçüm ve kişiselleştirme",
              "Açık rıza",
            ],
            [
              "Zorunlu çerezler",
              "Oturum, sepet, güvenlik tanımlayıcıları",
              "Sitenin çalışması",
              "m.5/2-c; m.5/2-f",
            ],
            [
              "KVKK başvuruları",
              "Kimlik ve iletişim bilgisi, talep",
              "m.11 haklarının yerine getirilmesi",
              "m.5/2-ç (hukuki yükümlülük)",
            ],
          ],
        },
      },
      {
        heading: "3. Toplama yöntemi",
        paragraphs: [
          "Veriler; web sitesindeki formlar (üyelik, ödeme, iletişim, KVKK başvurusu, Ayak İkizi), çerezler ve müşteri hizmetleri kanalları aracılığıyla elektronik ortamda, otomatik ya da kısmen otomatik yollarla toplanır. Ayak İkizi'nde fotoğraf kullanılırsa görüntü yalnızca cihazında işlenir; sunucuya gönderilmez.",
        ],
      },
      {
        heading: "4. Aktarılan kişi grupları",
        items: [
          "Kargo şirketleri — teslimat (yurt içi).",
          "Ödeme kuruluşu (iyzico) — ödemenin alınması; kart bilgisi doğrudan ödeme kuruluşuna girilir.",
          "E-posta ve barındırma hizmet sağlayıcıları — sistemlerin işletilmesi (yurt dışı olabilir; bkz. 5).",
          "Yapay zekâ danışmanı sağlayıcısı — yalnızca ayrı açık rıza verirsen ve kişisel veriler maskelenerek (bkz. 5).",
          "Yetkili kamu kurum ve kuruluşları — kanuni yükümlülük halinde.",
        ],
      },
      {
        heading: "5. Yurt dışına aktarım",
        paragraphs: [
          "KVKK m.9 (7499 sayılı Kanunla değişik) uyarınca yurt dışına aktarım; yeterlilik kararı, yoksa uygun güvenceler (ör. Kurul'un standart sözleşmesi — imzadan itibaren 5 iş günü içinde Kurul'a bildirim), bunlar da yoksa arızi haller çerçevesinde yapılır. Bulut barındırma, e-posta ve yapay zekâ hizmetlerine ilişkin aktarımların listesi ve dayanakları kayıt altındadır.",
        ],
      },
      {
        heading: "6. Saklama süresi",
        paragraphs: [
          "Veriler işleme amacının gerektirdiği süre ve ilgili mevzuattaki zamanaşımı/saklama süreleri boyunca saklanır; süre bitince silinir, yok edilir ya da anonim hale getirilir. Ayrıntılı süreler Saklama ve İmha Politikası'nda yer alır (ör. fatura ve muhasebe kayıtları vergi mevzuatı süresince; pazarlama verisi rıza geri alınana kadar; Ayak İkizi silme talebine kadar).",
        ],
      },
      {
        heading: "7. KVKK m.11 kapsamındaki hakların",
        items: [
          "Kişisel verilerinin işlenip işlenmediğini öğrenme ve bilgi talep etme,",
          "İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme,",
          "Yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme,",
          "Eksik veya yanlış işlenmişse düzeltilmesini isteme,",
          "KVKK m.7 çerçevesinde silinmesini veya yok edilmesini isteme,",
          "Düzeltme/silme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme,",
          "Münhasıran otomatik sistemlerle analiz sonucu aleyhine bir sonucun ortaya çıkmasına itiraz etme,",
          "Kanuna aykırı işleme nedeniyle zarara uğrarsan zararın giderilmesini talep etme.",
        ],
        paragraphs: [
          `Başvurunu /yasal/kvkk-basvuru sayfasındaki formla, ${SELLER.kvkkEmail} adresine ya da KEP adresimize iletebilirsin. Başvurular en geç ${DSR_RESPONSE_DAYS} gün içinde ücretsiz sonuçlandırılır.`,
        ],
      },
    ],
  },

  gizlilik: {
    key: "gizlilik",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Gizlilik Politikası",
    intro:
      "Bu politika, ARION'un kişisel verileri nasıl koruduğunu özetler. Hukuki ayrıntılar KVKK Aydınlatma Metni'ndedir.",
    sections: [
      {
        heading: "Temel ilkelerimiz",
        items: [
          "Gerekenden fazla veri toplamayız (veri minimizasyonu).",
          "Aydınlatma ile açık rızayı ayrı tutarız; hiçbir rıza kutusu önceden işaretli değildir ve rıza satın almanın ön koşulu değildir.",
          "Kart bilgini görmeyiz, saklamayız, loglamayız; ödeme, ödeme kuruluşunun güvenli sayfasında yapılır.",
          "Ayak İkizi verisini özel nitelikli veri gibi koruruz: ayrı rıza, şifreli saklama, yapay zekâya aktarmama, tek tıkla silme.",
          "Analitik ve pazarlama çerezleri yalnızca rızanla yüklenir.",
        ],
      },
      {
        heading: "Güvenlik önlemleri",
        items: [
          "TLS ile şifreli iletişim, güvenli (httpOnly, SameSite) çerezler.",
          "Rol tabanlı yönetici erişimi ve yönetici işlemlerinin kayıt altına alınması.",
          "Ayak İkizi alanlarının uygulama düzeyinde şifrelenmesi.",
          "Girdi doğrulama, hız sınırlama ve düzenli bağımlılık taraması.",
          "Veri ihlali halinde Kurul'a ve ilgili kişilere bildirim prosedürü.",
        ],
      },
      {
        heading: "Haklarını kullanmak",
        paragraphs: [
          "Hesabım > İzinlerim sayfasından rızalarını tek tek açıp kapatabilir, Hesabım > Veri Taleplerim sayfasından verilerini JSON olarak indirebilir ya da silme talebi oluşturabilirsin.",
        ],
      },
    ],
  },

  "cerez-politikasi": {
    key: "cerez-politikasi",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Çerez Politikası",
    intro:
      "KVKK Çerez Uygulamaları Hakkında Rehber doğrultusunda: zorunlu çerezler dışında hiçbir çerez rızan olmadan kullanılmaz. 'Siteyi kullanmaya devam ederek kabul etmiş sayılırsınız' gibi bir yaklaşım benimsemeyiz.",
    sections: [
      {
        heading: "Tercihlerin",
        paragraphs: [
          "İlk ziyarette 'Tümünü Kabul Et' ve 'Tümünü Reddet' seçenekleri eşit görünürlükte sunulur; 'Tercihleri Yönet' ile kategorileri tek tek seçebilirsin. Seçimini her sayfanın altındaki 'Çerez Tercihleri' bağlantısıyla dilediğin an değiştirebilirsin.",
        ],
      },
      // Kategori ve envanter tabloları uygulama tarafından COOKIE_INVENTORY'den eklenir.
    ],
  },

  "acik-riza": {
    key: "acik-riza",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Açık Rıza Metinleri",
    intro:
      "Her amaç için ayrı açık rıza alınır. Hiçbiri önceden işaretli değildir, hiçbiri üyelik ya da satın almanın ön koşulu değildir ve hepsi her an geri alınabilir. Rıza kaydında; amaç, metin sürümü, zaman, kanal ve teknik kayıt bilgileri tutulur; geri alma da kaydedilir.",
    sections: [
      // Rıza metinleri uygulama tarafından CONSENT_TEXTS'ten eklenir.
    ],
  },

  "kvkk-basvuru": {
    key: "kvkk-basvuru",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "KVKK Başvuru Formu",
    intro: `KVKK m.11 kapsamındaki haklarını kullanmak için aşağıdaki formu doldurabilirsin. Başvurun en geç ${DSR_RESPONSE_DAYS} gün içinde ücretsiz yanıtlanır; işlemin ayrıca bir maliyet gerektirmesi halinde Kurul tarifesindeki ücret alınabilir.`,
    sections: [
      {
        heading: "Kimlik doğrulama",
        paragraphs: [
          "Verilerin yanlış kişiye verilmemesi için yanıt göndermeden önce kimliğini doğrularız: üyeysen hesabına kayıtlı e-posta adresinden onay isteriz; değilsen sipariş numarası gibi ek bilgi isteyebiliriz.",
        ],
      },
      {
        heading: "Alternatif başvuru yolları",
        items: [
          `E-posta: ${SELLER.kvkkEmail} (kayıtlı e-posta adresinden)`,
          `KEP: ${SELLER.kep}`,
          `Yazılı: ${SELLER.address}`,
        ],
      },
    ],
  },
}

export const TR_CONSUMER_SUMMARY = {
  arbitration: `Şikâyet ve itirazlarını ${CONSUMER.arbitrationLimitYear} yılı için ${CONSUMER.arbitrationLimitTry.toLocaleString("tr-TR")} TL'ye kadar olan uyuşmazlıklarda yerleşim yerindeki veya işlemin yapıldığı yerdeki Tüketici Hakem Heyeti'ne (e-Devlet / Tüketici Bilgi Sistemi: ${CONSUMER.complaintPortal}) yapabilirsin.`,
  mediation:
    "Bu sınırın üzerindeki uyuşmazlıklarda Tüketici Mahkemesi'nde dava açmadan önce arabulucuya başvurulması zorunludur (dava şartı arabuluculuk, 6502 s.K. m.73/A).",
}
