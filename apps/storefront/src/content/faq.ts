import type { Locale } from "@/i18n/routing"

/**
 * Yardım merkezi SSS (Rapor §8.2). Aynı içerik Areion'un bilgi tabanıdır (RAG) — tek kaynak.
 * Ton: sıcak, bilgili, küçümsemeyen bir ayakkabı ustası (Rapor §8.4). Sağlık teşhisi dili YOK.
 */
export type FaqCategory = "fit" | "order" | "shipping" | "returns" | "payment" | "care" | "kvkk"

export type FaqItem = {
  id: string
  category: FaqCategory
  q: Record<Locale, string>
  a: Record<Locale, string>
}

export const FAQ_CATEGORIES: Record<FaqCategory, Record<Locale, string>> = {
  fit: { tr: "Beden ve Uyum", en: "Size & Fit" },
  order: { tr: "Sipariş", en: "Orders" },
  shipping: { tr: "Kargo", en: "Shipping" },
  returns: { tr: "İade ve Değişim", en: "Returns & Exchanges" },
  payment: { tr: "Ödeme", en: "Payment" },
  care: { tr: "Bakım ve Tamir", en: "Care & Repair" },
  kvkk: { tr: "Kişisel Veriler (KVKK)", en: "Personal Data (KVKK)" },
}

export const FAQ: FaqItem[] = [
  {
    id: "fit-between-sizes",
    category: "fit",
    q: { tr: "İki numara arasında kaldım, hangisini almalıyım?", en: "I'm between two sizes. Which should I choose?" },
    a: {
      tr: "Önce ürün sayfasındaki kalıp notuna bak: bazı kalıplarımız ön ayakta dar çalışır. Genel kural: ayak uzunluğunu milimetre olarak ölç, numara tablosundaki kalıp uzunluğundan 10–15 mm kısa olan numarayı seç. Ön ayağın genişse aynı numaranın W (geniş) seçeneği, yarım numara büyütmekten çoğu zaman daha iyi oturur. Ayak İkizi (Faz 5) bu hesabı senin için yapacak.",
      en: "Check the last note on the product page first: some of our lasts run narrow at the forefoot. As a rule, measure your foot length in millimetres and choose the size whose last length is 10–15 mm longer. If your forefoot is wide, the W (wide) option in your usual size often fits better than going up half a size. Fit Twin (Phase 5) will do this calculation for you.",
    },
  },
  {
    id: "fit-measure",
    category: "fit",
    q: { tr: "Ayağımı nasıl ölçerim?", en: "How do I measure my foot?" },
    a: {
      tr: "Akşam saatlerinde (ayak gün içinde biraz genişler), ayakkabıyla giyeceğin çorapla bir A4 kâğıda bas. Topuğun duvara değsin; en uzun parmağının ucunu işaretle ve duvardan işarete kadar milimetre olarak ölç. Ön ayak genişliği için en geniş iki noktayı işaretle. İki ayağını da ölç ve büyük olanı esas al.",
      en: "In the evening (feet swell slightly during the day), stand on an A4 sheet wearing the socks you'll wear with the shoes. Put your heel against a wall, mark the tip of your longest toe and measure from the wall to the mark in millimetres. For forefoot width, mark the two widest points. Measure both feet and use the larger one.",
    },
  },
  {
    id: "fit-width",
    category: "fit",
    q: { tr: "M ve W genişlik ne demek?", en: "What do M and W widths mean?" },
    a: {
      tr: "M standart genişliktir. W aynı uzunlukta yaklaşık 6 mm daha geniş bir kalıptır. Klasik serimizde bazı numaralarda N (dar) da vardır. Uyum motoru numarayla değil milimetreyle çalışır; numara yalnızca bir göstergedir.",
      en: "M is standard width. W is a last about 6 mm wider at the same length. Some sizes in our classic range also come in N (narrow). The fit engine works in millimetres, not sizes; a size is just a label.",
    },
  },
  {
    id: "order-change",
    category: "order",
    q: { tr: "Siparişimi değiştirebilir veya iptal edebilir miyim?", en: "Can I change or cancel my order?" },
    a: {
      tr: "Kargoya verilmeden önce talep formundan ya da canlı destekten yazarsan değişiklik veya iptal yapabiliriz. Kargoya verildiyse teslim aldıktan sonra 14 gün içinde cayma hakkını kullanabilirsin.",
      en: "Write to us via the request form or live chat before it ships and we can change or cancel it. Once shipped, you can use your 14-day right of withdrawal after delivery.",
    },
  },
  {
    id: "order-made-to-order",
    category: "order",
    q: { tr: "\"Atölyede üretilir\" ne demek?", en: "What does \"made in the atelier\" mean?" },
    a: {
      tr: "Bu modeller siparişin üzerine atölyemizde üretilir (yaklaşık 21 gün). Süre, sipariş öncesinde ön bilgilendirme formunda açıkça yazar; teslim her durumda en geç 30 gün içinde yapılır. Standart numaralı atölye ürünlerinde cayma hakkın aynen geçerlidir.",
      en: "These models are made to order in our atelier (about 21 days). The time is stated in the pre-contract information before you order; delivery always happens within 30 days. Your right of withdrawal applies in full to atelier-made standard sizes.",
    },
  },
  {
    id: "shipping-time",
    category: "shipping",
    q: { tr: "Kargom ne zaman gelir?", en: "When will my order arrive?" },
    a: {
      tr: "Stoktaki ürünler 1–2 iş günü içinde kargoya verilir; Standart Kargo 2–4, Hızlı Kargo ertesi iş günü teslim eder (DEMO kargo). Siparişini giriş yapmadan, sipariş numarası ve e-posta adresinle Sipariş Takibi sayfasından izleyebilirsin.",
      en: "In-stock items ship within 1–2 business days; Standard Shipping takes 2–4 days, Express the next business day (DEMO courier). Track your order without signing in using your order number and email on the Order Tracking page.",
    },
  },
  {
    id: "shipping-cost",
    category: "shipping",
    q: { tr: "Kargo ücreti ne kadar?", en: "How much is shipping?" },
    a: {
      tr: "Standart Kargo 89,90 TL, Hızlı Kargo 149,90 TL'dir; ücret sepette ve ödeme adımında açıkça gösterilir. Fiyatlarımız KDV dahildir.",
      en: "Standard Shipping is TRY 89.90 and Express TRY 149.90; the cost is shown clearly in the cart and at checkout. Our prices include VAT.",
    },
  },
  {
    id: "returns-how",
    category: "returns",
    q: { tr: "Nasıl iade ederim?", en: "How do I return an item?" },
    a: {
      tr: "İade sihirbazına sipariş numaranı ve e-postanı gir, ürünü ve nedenini seç. Teslimden itibaren 14 gün içinde hiçbir gerekçe göstermeden cayabilirsin. Sistem ÜCRETSİZ iade kargo kodu üretir; iade kargo ücreti bize aittir. Para iaden, bildirimin bize ulaşmasından itibaren en geç 14 gün içinde yapılır.",
      en: "Enter your order number and email in the returns wizard, choose the item and the reason. You can withdraw within 14 days of delivery without giving a reason. The system generates a FREE return shipping code; return shipping is on us. Your refund is made within 14 days of your notice reaching us.",
    },
  },
  {
    id: "returns-defect",
    category: "returns",
    q: { tr: "Ürün kusurlu çıktı, ne yapmalıyım?", en: "My item is defective. What should I do?" },
    a: {
      tr: "İade sihirbazında \"Kusurlu\" seçeneğini seç. Ayıplı mal için haklarının 14 günlük cayma süresiyle ilgisi yoktur: sözleşmeden dönme, bedelde indirim, ücretsiz onarım ya da ayıpsız misliyle değişim arasından seçim yapabilirsin (6502 sayılı Kanun m.11).",
      en: "Choose \"Defective\" in the returns wizard. Your rights for defective goods are not tied to the 14-day withdrawal period: you can choose termination, a price reduction, free repair or a replacement (Law No. 6502 Art. 11).",
    },
  },
  {
    id: "returns-exchange",
    category: "returns",
    q: { tr: "Numara değişimi yapabilir miyim?", en: "Can I exchange for a different size?" },
    a: {
      tr: "Evet. İade sihirbazında neden olarak \"Uyum\"u seç ve değişim iste; istediğin numarayı ya da genişliği yaz. Uyum geri bildirimin (kimliğin olmadan) kalıplarımızı iyileştirmek için kullanılır.",
      en: "Yes. Choose \"Fit\" as the reason in the returns wizard and request an exchange; write the size or width you'd like. Your fit feedback (without your identity) is used to improve our lasts.",
    },
  },
  {
    id: "payment-methods",
    category: "payment",
    q: { tr: "Hangi ödeme yöntemleri var? Kart bilgim güvende mi?", en: "Which payment methods are there? Is my card safe?" },
    a: {
      tr: "Ödeme, ödeme kuruluşu iyzico'nun güvenli sayfasında kredi ya da banka kartıyla, 3D Secure ile yapılır. Kart bilgin ARION'a hiç ulaşmaz; ne görürüz ne saklarız. Sohbette ya da e-postada asla kart bilgisi istemeyiz. (Bu site DEMO'dur, gerçek ödeme alınmaz.)",
      en: "Payment is made by credit or debit card with 3D Secure on the secure page of the payment institution iyzico. Your card details never reach ARION; we neither see nor store them. We will never ask for card details in chat or email. (This site is a DEMO; no real payment is taken.)",
    },
  },
  {
    id: "payment-discount",
    category: "payment",
    q: { tr: "Üstü çizili fiyat neye göre belirleniyor?", en: "How is the struck-through price set?" },
    a: {
      tr: "Üstü çizili fiyat elle girilmez. İndirimin başlangıcından önceki son 10 gün içinde uygulanan en düşük fiyattır ve fiyat geçmişinden otomatik hesaplanır. İndirimden hemen önce fiyatı yükseltip \"indirim\" göstermek bu yüzden mümkün değildir.",
      en: "The struck-through price is never entered by hand. It is the lowest price applied in the 10 days before the discount began, calculated automatically from price history. That is why raising a price just before a \"sale\" is impossible here.",
    },
  },
  {
    id: "care-leather",
    category: "care",
    q: { tr: "Deri ayakkabımın bakımını nasıl yaparım?", en: "How do I care for my leather shoes?" },
    a: {
      tr: "Her giyişten sonra kalıp (shoe tree) kullan ve ayakkabıyı bir gün dinlendir. Haftada bir yumuşak fırçayla tozunu al, ayda bir deri kremi uygula. Islanırsa kalorifer yanında değil, oda sıcaklığında, içine gazete kâğıdı koyarak kurut.",
      en: "Use a shoe tree after every wear and let the pair rest for a day. Brush off dust weekly and apply leather cream monthly. If they get wet, dry them at room temperature with newspaper inside, not next to a radiator.",
    },
  },
  {
    id: "care-repair",
    category: "care",
    q: { tr: "Ayakkabımı tamir ettirebilir miyim?", en: "Can I have my shoes repaired?" },
    a: {
      tr: "Evet, ARION'un sözü bu. Goodyear welt modellerde pençe defalarca yenilenebilir; topuk uçları değiştirilebilir. Ömür Planı ve tamir talebi Faz 5'te açılacak; şimdilik talep formundan \"Bakım ve Tamir\" konusuyla yazabilirsin.",
      en: "Yes, that's ARION's promise. Goodyear-welted models can be resoled again and again; heel tips can be replaced. The Lifetime Plan and repair requests open in Phase 5; for now, write to us via the request form with the topic \"Care & Repair\".",
    },
  },
  {
    id: "kvkk-data",
    category: "kvkk",
    q: { tr: "Kişisel verilerimi nasıl görebilir veya silebilirim?", en: "How can I see or delete my personal data?" },
    a: {
      tr: "Üyeysen Hesabım > Veri Taleplerim'den verilerini JSON olarak hemen indirebilir, silme talebi oluşturabilirsin. Üye değilsen KVKK Başvuru Formu'nu kullan. Başvurular en geç 30 gün içinde ücretsiz yanıtlanır.",
      en: "Members can download their data as JSON immediately and request deletion under Account > Data requests. Otherwise use the Data Subject Request Form. Requests are answered free of charge within 30 days.",
    },
  },
  {
    id: "kvkk-ai",
    category: "kvkk",
    q: { tr: "Areion'a yazdıklarım nereye gidiyor?", en: "Where do my messages to Areion go?" },
    a: {
      tr: "Areion bir yapay zekâ asistanıdır. Mesajların, ayrı açık rızan alındıktan sonra yanıt üretmek için yurt dışındaki yapay zekâ sağlayıcısına (Google Gemini) gönderilir. Göndermeden önce e-posta, telefon ve kimlik/kart numarası gibi bilgiler maskelenir; Ayak İkizi verin asla gönderilmez.",
      en: "Areion is an AI assistant. After you give separate explicit consent, your messages are sent to an AI provider abroad (Google Gemini) to generate replies. Emails, phone numbers and ID/card numbers are masked before sending; your Fit Twin data is never sent.",
    },
  },
]
