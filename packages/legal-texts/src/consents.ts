import type { Locale } from "./types"

/**
 * Açık rıza amaçları (Rapor §7.1.3). Her amaç AYRI kutucuk, hiçbiri önceden işaretli değil,
 * hiçbiri üyelik/satın almanın ön koşulu değil. Metin değişirse `version` artırılır.
 */
export type ConsentPurpose =
  "marketing_email" | "marketing_sms" | "fit_twin" | "ai_chat_transfer"

export type ConsentText = {
  purpose: ConsentPurpose
  version: string
  /** Kısa kutucuk etiketi */
  label: Record<Locale, string>
  /** Açık rıza metni (bilgilendirilmiş, belirli konuya ilişkin, özgür irade) */
  text: Record<Locale, string>
  /** İYS'ye bildirilir mi (ticari elektronik ileti) */
  iys: boolean
}

export const CONSENT_TEXTS: Record<ConsentPurpose, ConsentText> = {
  marketing_email: {
    purpose: "marketing_email",
    version: "1.0.0",
    iys: true,
    label: {
      tr: "Kampanya ve yeniliklerden e-posta ile haberdar olmak istiyorum.",
      en: "I would like to receive campaigns and news by email.",
    },
    text: {
      tr: "6563 sayılı Kanun ve 6698 sayılı KVKK kapsamında; ad, soyad ve e-posta adresimin ARION tarafından kampanya, indirim ve yeni ürün duyuruları içeren ticari elektronik ileti gönderilmesi amacıyla işlenmesine ve İleti Yönetim Sistemi'ne (İYS) kaydedilmesine açık rıza veriyorum. Bu onayı dilediğim zaman, her iletideki ret bağlantısıyla veya Hesabım > İzinlerim sayfasından ücretsiz olarak geri alabilirim.",
      en: "Under Law No. 6563 and the KVKK (Law No. 6698), I give explicit consent for ARION to process my name and email address to send commercial electronic messages about campaigns, discounts and new products, and to register this consent with the Message Management System (İYS). I can withdraw it at any time, free of charge, via the opt-out link in each message or under Account > Permissions.",
    },
  },
  marketing_sms: {
    purpose: "marketing_sms",
    version: "1.0.0",
    iys: true,
    label: {
      tr: "Kampanya ve yeniliklerden SMS ile haberdar olmak istiyorum.",
      en: "I would like to receive campaigns and news by SMS.",
    },
    text: {
      tr: "Cep telefonu numaramın ARION tarafından kampanya ve yeni ürün duyurusu içeren SMS gönderilmesi amacıyla işlenmesine ve İYS'ye kaydedilmesine açık rıza veriyorum. Onayımı dilediğim zaman geri alabilirim.",
      en: "I give explicit consent for ARION to process my mobile number to send SMS about campaigns and new products and to register this consent with İYS. I can withdraw it at any time.",
    },
  },
  fit_twin: {
    purpose: "fit_twin",
    version: "1.0.0",
    iys: false,
    label: {
      tr: "Ayak İkizi ölçülerimin hesabımda saklanmasına açık rıza veriyorum.",
      en: "I give explicit consent to store my Fit Twin measurements in my account.",
    },
    text: {
      tr: "Ayak uzunluğu, ön ayak genişliği, kemer tipi ve tercih bilgilerimin; bana uygun numara ve kalıp önerisi sunulması amacıyla, şifrelenerek hesabımda saklanmasına açık rıza veriyorum. Ayak şekli verisinin sağlık durumuna ilişkin çıkarım yapılmasına elverişli olabileceğini, bu nedenle özel nitelikli veri gibi korunacağını; fotoğrafların cihazımda işlenip sunucuya gönderilmeyeceğini; verilerin yapay zekâ hizmetlerine aktarılmayacağını ve sağlık teşhisi amacıyla kullanılmayacağını biliyorum. Rızamı geri alırsam ve 'Ayak İkizimi sil' dediğimde ölçülerim kalıcı olarak silinir.",
      en: "I give explicit consent for my foot length, forefoot width, arch type and fit preference to be stored, encrypted, in my account to give me size and last recommendations. I understand that foot shape data could allow inferences about health and will therefore be protected like special category data; photos are processed on my device and never uploaded; the data is not sent to AI services and is not used for any medical diagnosis. If I withdraw consent or press 'Delete my Fit Twin', my measurements are permanently deleted.",
    },
  },
  ai_chat_transfer: {
    purpose: "ai_chat_transfer",
    version: "1.0.0",
    iys: false,
    label: {
      tr: "Yapay zekâ danışmanı için mesajlarımın yurt dışındaki hizmet sağlayıcıya aktarılmasına açık rıza veriyorum.",
      en: "I consent to my messages to the AI advisor being transferred to a service provider abroad.",
    },
    text: {
      tr: "Areion yapay zekâ danışmanına yazdığım mesajların, yanıt üretilmesi amacıyla yurt dışında bulunan yapay zekâ hizmet sağlayıcısına aktarılmasına açık rıza veriyorum. Mesajlar gönderilmeden önce ad, telefon ve adres gibi kişisel veriler maskelenir; Ayak İkizi verisi hiçbir koşulda aktarılmaz. (KVKK m.9; yeterlilik kararı ya da uygun güvence bulunmadığı durumlarda arızi aktarım dayanağı. Ayrıntı: Faz 4.)",
      en: "I consent to the messages I send to the Areion AI advisor being transferred to an AI service provider located abroad in order to generate replies. Personal data such as names, phone numbers and addresses are masked before sending; Fit Twin data is never transferred. (KVKK Art. 9; occasional-transfer basis where no adequacy decision or appropriate safeguard applies. Details: Phase 4.)",
    },
  },
}

export const CONSENT_PURPOSES = Object.keys(CONSENT_TEXTS) as ConsentPurpose[]
