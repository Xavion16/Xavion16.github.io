import { CONSUMER, DISCOUNT_REFERENCE_DAYS, SELLER } from "../config"
import type { LegalDoc } from "../types"
import { TR_CONSUMER_SUMMARY } from "./tr-privacy"

export const TR_TERMS: Record<string, LegalDoc> = {
  "iade-politikasi": {
    key: "iade-politikasi",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "İade ve Değişim Politikası",
    sections: [
      {
        heading: "Cayma hakkı",
        items: [
          `Ürünü teslim aldığın günden itibaren ${CONSUMER.withdrawalDays} gün içinde hiçbir gerekçe göstermeden ve cezai şart ödemeden cayabilirsin.`,
          "İade kargo ücreti ARION'a aittir; iade talebinde sistem ücretsiz iade kargo kodu üretir.",
          `Bedel, cayma bildiriminin bize ulaşmasından itibaren en geç ${CONSUMER.refundDays} gün içinde, ödemede kullandığın yöntemle iade edilir.`,
          "Ürünü, cayma bildiriminden itibaren 10 gün içinde göndermen gerekir. Ürünün olağan kullanımı dışındaki kullanım nedeniyle oluşan değer kaybından tüketici sorumludur.",
        ],
      },
      {
        heading: "Kişiye özel üretim istisnası",
        paragraphs: [
          "Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallarda (ör. Ayak İkizi ölçülerine göre ÖLÇÜYE ÖZEL üretilen ayakkabılar) Mesafeli Sözleşmeler Yönetmeliği m.15/1-ç uyarınca cayma hakkı kullanılamaz. Bu istisna sipariş öncesinde ön bilgilendirme formunda açıkça belirtilir. Atölyede üretilen standart numaralı modeller bu istisnaya GİRMEZ.",
          "Marka sözümüz olarak ölçüye özel ürünlerde gönüllü 'Uyum Garantisi' sunarız: uyum sorunu olursa bir kez ücretsiz düzeltme ya da yeniden üretim.",
        ],
      },
      {
        heading: "Ayıplı mal",
        paragraphs: [
          "Ürün ayıplı çıkarsa 6502 sayılı Kanun m.11 uyarınca seçimlik haklarından birini kullanabilirsin: sözleşmeden dönme, ayıp oranında bedel indirimi, ücretsiz onarım veya ayıpsız misli ile değişim. Bu yol iade sihirbazında 'Kusurlu' seçeneğiyle ayrı olarak sunulur.",
        ],
      },
      {
        heading: "Şikâyet yolları",
        paragraphs: [
          TR_CONSUMER_SUMMARY.arbitration,
          TR_CONSUMER_SUMMARY.mediation,
        ],
      },
    ],
  },

  "uyelik-sozlesmesi": {
    key: "uyelik-sozlesmesi",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Üyelik Sözleşmesi",
    sections: [
      {
        heading: "1. Taraflar",
        paragraphs: [
          `${SELLER.title} ("ARION") ile siteye üye olan gerçek kişi ("Üye").`,
        ],
      },
      {
        heading: "2. Konu",
        paragraphs: [
          "Sözleşme; üyenin sipariş geçmişini görmesi, adres ve tercihlerini yönetmesi, rızalarını kontrol etmesi gibi üyelik hizmetlerinden yararlanma koşullarını düzenler.",
        ],
      },
      {
        heading: "3. Üyenin yükümlülükleri",
        items: [
          "Doğru ve güncel bilgi vermek; 18 yaşından küçükse veli onayıyla üye olmak.",
          "Şifresini gizli tutmak; hesabın yetkisiz kullanımını fark ederse derhal bildirmek.",
          "Siteyi hukuka ve bu sözleşmeye uygun kullanmak.",
        ],
      },
      {
        heading: "4. ARION'un yükümlülükleri",
        items: [
          "Kişisel verileri KVKK Aydınlatma Metni ve Gizlilik Politikası'na uygun işlemek.",
          "Pazarlama iletişimini yalnızca üyenin ayrı ve açık onayıyla göndermek. Üyelik, pazarlama onayına bağlı değildir.",
        ],
      },
      {
        heading: "5. Fesih",
        paragraphs: [
          "Üye, dilediği an hesabını kapatma talebinde bulunabilir. Kanuni saklama yükümlülüğü olan veriler (ör. fatura kayıtları) bu süre boyunca saklanır, diğerleri silinir.",
        ],
      },
    ],
  },

  "kullanim-kosullari": {
    key: "kullanim-kosullari",
    version: "1.1.0",
    updatedAt: "2026-11-21",
    title: "Kullanım Koşulları",
    sections: [
      {
        heading: "Demo bildirimi",
        paragraphs: [
          "Bu site bir ödev projesidir. Gerçek satış yapılmaz, ödeme alınmaz ve ürün gönderilmez. Ürün, test ve fiyat verileri DEMO amaçlıdır.",
        ],
      },
      {
        heading: "Fiyat ve indirimler",
        paragraphs: [
          `Fiyatlar KDV dahildir. İndirimli ürünlerde üstü çizili fiyat, indirimin başlangıcından önceki son ${DISCOUNT_REFERENCE_DAYS} gün içinde uygulanan en düşük fiyattır ve fiyat geçmişinden otomatik hesaplanır.`,
        ],
      },
      {
        heading: "Fikri mülkiyet",
        paragraphs: [
          "Sitedeki tasarım, metin, çizim, görsel ve yazılımlar ARION'a aittir. Ürün görselleri temsilidir; renk ve doku ekrana göre farklı görünebilir.",
        ],
      },
      {
        heading: "Sorumluluk",
        paragraphs: [
          "Teknik içerikler (ör. Dayanıklılık Kartı, Kalıp Uyum Skoru) bilgilendirme amaçlıdır ve sağlık tavsiyesi değildir.",
        ],
      },
    ],
  },

  "ticari-ileti": {
    key: "ticari-ileti",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Ticari Elektronik İleti Onay Metni",
    intro:
      "6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik kapsamında:",
    sections: [
      {
        items: [
          "Pazarlama e-postası ve SMS için AYRI onay kutuları kullanılır; hiçbiri önceden işaretli değildir ve üyelik sözleşmesiyle birleştirilmez.",
          "Onaylar İleti Yönetim Sistemi'ne (İYS) kaydedilir.",
          "Her iletide tek tıkla ret bağlantısı bulunur; ret kaydı İYS'ye iletilir ve en geç 3 iş günü içinde ileti gönderimi durdurulur.",
          "Sipariş, kargo ve iade bilgilendirmeleri gibi işlemsel iletiler onay gerektirmez; bunların içine reklam konmaz.",
        ],
      },
    ],
  },

  kunye: {
    key: "kunye",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Künye",
    intro:
      "Aşağıdaki bilgiler ÖRNEKTİR (ödev projesi). Gerçek bir şirkete ait değildir.",
    sections: [
      {
        table: {
          columns: ["Bilgi", "Değer"],
          rows: [
            ["Unvan", SELLER.title],
            ["MERSİS no", SELLER.mersis],
            ["Vergi dairesi / no", `${SELLER.taxOffice} / ${SELLER.taxNumber}`],
            ["Ticaret sicili", SELLER.tradeRegistry],
            ["Adres", SELLER.address],
            ["Telefon", SELLER.phone],
            ["E-posta", SELLER.email],
            ["KEP adresi", SELLER.kep],
            ["ETBİS", SELLER.etbis],
          ],
        },
      },
    ],
  },

  erisilebilirlik: {
    key: "erisilebilirlik",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Erişilebilirlik Beyanı",
    intro:
      "ARION, 2025/10 sayılı Cumhurbaşkanlığı Genelgesi doğrultusunda WCAG 2.2'yi esas alır. Temel zorunluluk A düzeyidir; hedefimiz AA düzeyidir.",
    sections: [
      {
        heading: "Uyguladıklarımız",
        items: [
          "Semantik HTML ve tutarlı başlık yapısı, 'İçeriğe geç' bağlantısı.",
          "Klavye ile tam gezinme ve görünür odak göstergesi.",
          "Metin/arka plan kontrastında AA (koyu cam yüzeylerde dahil).",
          "Form alanlarında etiket, hata mesajı ve ekran okuyucu duyuruları.",
          "Hareket azaltma tercihine (prefers-reduced-motion) saygı.",
          "Görsellerin anlamını metinle verme; dekoratif çizimlerin ekran okuyucudan gizlenmesi.",
        ],
      },
      {
        heading: "Nasıl test ediyoruz",
        paragraphs: [
          "Her değişiklikte otomatik axe-core testleri ve Lighthouse erişilebilirlik ölçümü çalışır. Otomatik testler her sorunu yakalayamaz; bir engelle karşılaşırsan bize yaz.",
        ],
      },
      {
        heading: "Geri bildirim",
        paragraphs: [
          `E-posta: ${SELLER.email}. En geç 10 iş günü içinde yanıt veririz.`,
        ],
      },
    ],
  },
}
