import {
  CONSUMER,
  DISCOUNT_REFERENCE_DAYS,
  DSR_RESPONSE_DAYS,
  SELLER,
} from "../config"
import type { LegalDoc } from "../types"

/** İngilizce sürümler BİLGİLENDİRME AMAÇLI çeviridir; bağlayıcı metin Türkçedir (Rapor §4.1). */
const controller = `${SELLER.title}, ${SELLER.address}. Email: ${SELLER.kvkkEmail} · KEP: ${SELLER.kep}`
const limit = CONSUMER.arbitrationLimitTry.toLocaleString("en-GB")

export const EN_DOCS: Record<string, LegalDoc> = {
  "kvkk-aydinlatma": {
    key: "kvkk-aydinlatma",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Privacy Notice (KVKK)",
    intro:
      "Under Art. 10 of the Turkish Personal Data Protection Law No. 6698 (KVKK) and the related Communiqué, this notice explains how we process your personal data. It is information only and does not require your approval.",
    sections: [
      { heading: "1. Data controller", paragraphs: [controller] },
      {
        heading: "2. Data, purposes and legal bases",
        table: {
          columns: ["Activity", "Data", "Purpose", "Legal basis"],
          rows: [
            [
              "Membership",
              "Name, email, password hash",
              "Setting up and managing membership",
              "KVKK Art. 5/2-c (contract)",
            ],
            [
              "Orders and delivery",
              "Delivery/billing address, phone, order history",
              "Delivering and invoicing orders",
              "Art. 5/2-c; Art. 5/2-ç (tax obligations)",
            ],
            [
              "Payment",
              "Card data is NOT held by ARION; payment result and transaction ID",
              "Taking payment",
              "Art. 5/2-c",
            ],
            [
              "Customer service",
              "Request content, messages and chat logs",
              "Resolving requests, service quality",
              "Art. 5/2-c; Art. 5/2-f (legitimate interest)",
            ],
            [
              "Fit Twin",
              "Foot measurements",
              "Size/last recommendations",
              "Explicit consent (protected like special category data)",
            ],
            [
              "Marketing",
              "Email, phone",
              "Campaign announcements",
              "Explicit consent + İYS registration (Law No. 6563)",
            ],
            [
              "Analytics/marketing cookies",
              "Online identifiers",
              "Measurement and personalisation",
              "Explicit consent",
            ],
            [
              "Strictly necessary cookies",
              "Session, cart, security IDs",
              "Running the site",
              "Art. 5/2-c; Art. 5/2-f",
            ],
            [
              "Data subject requests",
              "Identity and contact details, request",
              "Fulfilling Art. 11 rights",
              "Art. 5/2-ç (legal obligation)",
            ],
          ],
        },
      },
      {
        heading: "3. How we collect data",
        paragraphs: [
          "Through website forms (membership, checkout, contact, data requests, Fit Twin), cookies and customer service channels, electronically and by automated or partly automated means. If you use a photo for Fit Twin, it is processed on your device only and never uploaded.",
        ],
      },
      {
        heading: "4. Recipients",
        items: [
          "Courier companies — delivery (Türkiye).",
          "Payment institution (iyzico) — taking payment; card details are entered directly with them.",
          "Email and hosting providers — running our systems (may be abroad; see 5).",
          "AI advisor provider — only with your separate consent and with personal data masked (see 5).",
          "Competent public authorities — where legally required.",
        ],
      },
      {
        heading: "5. Transfers abroad",
        paragraphs: [
          "Under KVKK Art. 9 (as amended by Law No. 7499), transfers abroad rely on an adequacy decision, otherwise appropriate safeguards (e.g. the Board's standard contract, notified to the Board within 5 business days of signing), otherwise limited occasional-transfer grounds.",
        ],
      },
      {
        heading: "6. Retention",
        paragraphs: [
          "We keep data for as long as the purpose requires and as required by law, then delete, destroy or anonymise it. See the Retention and Destruction Policy.",
        ],
      },
      {
        heading: "7. Your rights under Art. 11",
        items: [
          "Learn whether your data is processed and request information,",
          "Learn the purpose and whether it is used accordingly,",
          "Know the third parties it is transferred to, in Türkiye or abroad,",
          "Request correction of incomplete or inaccurate data,",
          "Request deletion or destruction under Art. 7,",
          "Request that corrections/deletions are notified to recipients,",
          "Object to an adverse outcome arising solely from automated analysis,",
          "Claim compensation for damage caused by unlawful processing.",
        ],
        paragraphs: [
          `Use the form on the data subject request page, email ${SELLER.kvkkEmail} or our KEP address. Requests are answered free of charge within ${DSR_RESPONSE_DAYS} days.`,
        ],
      },
    ],
  },
  gizlilik: {
    key: "gizlilik",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Privacy Policy",
    intro:
      "A summary of how ARION protects personal data. Legal details are in the Privacy Notice (KVKK).",
    sections: [
      {
        heading: "Our principles",
        items: [
          "We collect no more data than we need.",
          "We keep information notices and explicit consent separate; no consent box is pre-ticked and consent is never a condition of purchase.",
          "We never see, store or log card details.",
          "We protect Fit Twin data like special category data: separate consent, encryption, no AI transfer, one-click deletion.",
          "Analytics and marketing cookies load only with your consent.",
        ],
      },
      {
        heading: "Security measures",
        items: [
          "TLS encryption and secure (httpOnly, SameSite) cookies.",
          "Role-based admin access with audit logging.",
          "Application-level encryption of Fit Twin fields.",
          "Input validation, rate limiting and dependency scanning.",
          "A breach response procedure including notification of the Board and affected people.",
        ],
      },
      {
        heading: "Exercising your rights",
        paragraphs: [
          "Manage each consent under Account > Permissions; download your data as JSON or request deletion under Account > Data requests.",
        ],
      },
    ],
  },
  "cerez-politikasi": {
    key: "cerez-politikasi",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Cookie Policy",
    intro:
      "Following the KVKK Cookie Guidelines, no cookie other than strictly necessary ones is used without your consent. We never treat 'continuing to browse' as consent.",
    sections: [
      {
        heading: "Your choices",
        paragraphs: [
          "On your first visit, 'Accept all' and 'Reject all' are shown with equal prominence, and 'Manage preferences' lets you choose each category. Change your choice at any time via 'Cookie Preferences' at the bottom of every page.",
        ],
      },
    ],
  },
  "acik-riza": {
    key: "acik-riza",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Explicit Consent Texts",
    intro:
      "Separate explicit consent is requested for each purpose. None is pre-ticked, none is a condition of membership or purchase, and all can be withdrawn at any time. We record the purpose, text version, time, channel and technical details, and we also record withdrawals.",
    sections: [],
  },
  "kvkk-basvuru": {
    key: "kvkk-basvuru",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Data Subject Request Form",
    intro: `Use the form below to exercise your rights under KVKK Art. 11. We answer free of charge within ${DSR_RESPONSE_DAYS} days.`,
    sections: [
      {
        heading: "Identity verification",
        paragraphs: [
          "Before replying, we verify your identity: members confirm via their registered email; others may be asked for an order number.",
        ],
      },
      {
        heading: "Other ways to apply",
        items: [
          `Email: ${SELLER.kvkkEmail}`,
          `KEP: ${SELLER.kep}`,
          `Post: ${SELLER.address}`,
        ],
      },
    ],
  },
  "iade-politikasi": {
    key: "iade-politikasi",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Returns & Exchange Policy",
    sections: [
      {
        heading: "Right of withdrawal",
        items: [
          `You can withdraw within ${CONSUMER.withdrawalDays} days of delivery without giving a reason.`,
          "Return shipping is paid by ARION; a free return code is generated for you.",
          `Refunds are made within ${CONSUMER.refundDays} days of your notice reaching us.`,
          "Send the goods back within 10 days of your notice.",
        ],
      },
      {
        heading: "Made-to-measure exception",
        paragraphs: [
          "Goods made to your personal measurements (e.g. from your Fit Twin) are exempt from withdrawal (Regulation Art. 15/1-ç); this is stated clearly before purchase. Atelier-made standard sizes are NOT exempt. For made-to-measure items we offer a voluntary Fit Guarantee: one free adjustment or remake.",
        ],
      },
      {
        heading: "Defective goods",
        paragraphs: [
          "You may choose termination, a price reduction, free repair or a replacement (Law No. 6502 Art. 11).",
        ],
      },
      {
        heading: "Complaints",
        paragraphs: [
          `Disputes up to TRY ${limit} (${CONSUMER.arbitrationLimitYear}) go to the Consumer Arbitration Committee (${CONSUMER.complaintPortal}). Above this limit, mediation is mandatory before suing at the Consumer Court.`,
        ],
      },
    ],
  },
  "uyelik-sozlesmesi": {
    key: "uyelik-sozlesmesi",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Membership Agreement",
    sections: [
      {
        heading: "1. Parties",
        paragraphs: [
          `${SELLER.title} ("ARION") and the natural person who signs up ("Member").`,
        ],
      },
      {
        heading: "2. Subject",
        paragraphs: [
          "The terms for using membership services: order history, addresses, preferences and consent management.",
        ],
      },
      {
        heading: "3. Member obligations",
        items: [
          "Provide accurate information; under-18s need parental approval.",
          "Keep the password secret and report unauthorised use.",
          "Use the site lawfully.",
        ],
      },
      {
        heading: "4. ARION obligations",
        items: [
          "Process personal data as described in the Privacy Notice.",
          "Send marketing only with separate, explicit consent. Membership never depends on it.",
        ],
      },
      {
        heading: "5. Termination",
        paragraphs: [
          "Members can close their account at any time. Data with a legal retention duty (e.g. invoices) is kept for that period; the rest is deleted.",
        ],
      },
    ],
  },
  "kullanim-kosullari": {
    key: "kullanim-kosullari",
    version: "1.1.0",
    updatedAt: "2026-11-21",
    title: "Terms of Use",
    sections: [
      {
        heading: "Demo notice",
        paragraphs: [
          "This site is a student project. No real sales, no payments, no shipments. Product, test and price data are DEMO.",
        ],
      },
      {
        heading: "Prices and discounts",
        paragraphs: [
          `Prices include VAT. For discounted items, the struck-through price is the lowest price applied in the ${DISCOUNT_REFERENCE_DAYS} days before the discount began, calculated automatically from price history.`,
        ],
      },
      {
        heading: "Intellectual property",
        paragraphs: [
          "Designs, texts, drawings, images and software belong to ARION. Product images are illustrative; colour and texture may look different on screen.",
        ],
      },
      {
        heading: "Liability",
        paragraphs: [
          "Technical content (e.g. Durability Card, Last Fit Score) is informational and not medical advice.",
        ],
      },
    ],
  },
  "ticari-ileti": {
    key: "ticari-ileti",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Commercial Message Consent",
    intro: "Under Law No. 6563 on E-Commerce and the related Regulation:",
    sections: [
      {
        items: [
          "Separate, unticked boxes for marketing email and SMS, never bundled with the membership agreement.",
          "Consents are registered with the Message Management System (İYS).",
          "Every message has a one-click opt-out; opt-outs are sent to İYS and messages stop within 3 business days.",
          "Transactional messages (order, shipping, returns) need no consent and contain no advertising.",
        ],
      },
    ],
  },
  kunye: {
    key: "kunye",
    version: "1.0.0",
    updatedAt: "2026-11-19",
    title: "Imprint",
    intro:
      "The details below are SAMPLES (student project) and do not belong to a real company.",
    sections: [
      {
        table: {
          columns: ["Item", "Value"],
          rows: [
            ["Company name", SELLER.title],
            ["MERSİS no", SELLER.mersis],
            ["Tax office / no", `${SELLER.taxOffice} / ${SELLER.taxNumber}`],
            ["Trade registry", SELLER.tradeRegistry],
            ["Address", SELLER.address],
            ["Phone", SELLER.phone],
            ["Email", SELLER.email],
            ["KEP address", SELLER.kep],
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
    title: "Accessibility Statement",
    intro:
      "Following Presidential Circular 2025/10, ARION uses WCAG 2.2. Level A is mandatory; our target is AA.",
    sections: [
      {
        heading: "What we do",
        items: [
          "Semantic HTML, consistent headings and a 'Skip to content' link.",
          "Full keyboard navigation and visible focus.",
          "AA text contrast, including on dark glass surfaces.",
          "Labelled form fields, error messages and screen reader announcements.",
          "Respect for prefers-reduced-motion.",
          "Meaning conveyed in text; decorative drawings hidden from screen readers.",
        ],
      },
      {
        heading: "How we test",
        paragraphs: [
          "Automated axe-core tests and Lighthouse audits run on every change. Automated tests cannot catch everything; please tell us about any barrier.",
        ],
      },
      {
        heading: "Feedback",
        paragraphs: [
          `Email: ${SELLER.email}. We reply within 10 business days.`,
        ],
      },
    ],
  },
}
