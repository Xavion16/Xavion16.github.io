import { randomUUID } from "node:crypto"
import { AbstractPaymentProvider, MedusaError, PaymentSessionStatus } from "@medusajs/framework/utils"
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import { IyzicoClient, type IyzicoAddress } from "./iyzico-client"

/**
 * iyzico Checkout Form ödeme sağlayıcısı (Rapor §9.4).
 *
 * Akış: initiatePayment → iyzico ödeme sayfası URL'si → kullanıcı kartını İYZİCO'NUN sayfasında girer
 * (3D Secure dahil) → callback ile storefront'a döner → cart complete → authorizePayment.
 *
 * mode = "live":  authorizePayment sonucu SUNUCU TARAFINDA iyzico API'sinden doğrular (callback'e güvenilmez).
 * mode = "mock":  API anahtarı yokken demo/E2E için. Ödeme sayfası storefront'taki simülasyon sayfasıdır;
 *                 sonuç `data.client.mock_result` ile gelir. Mock mod GERÇEK PARA ALMAZ ve güvenlik iddiası taşımaz.
 *
 * Kart verisi hiçbir modda ARION'a gelmez, loglanmaz, saklanmaz.
 */

type Options = {
  mode?: "mock" | "live"
  apiKey?: string
  secretKey?: string
  baseUrl?: string
  /** iyzico'nun ödeme sonrası POST edeceği storefront adresi */
  callbackUrl?: string
  /** Mock modda kullanıcının yönlendirileceği simülasyon sayfası */
  mockPageUrl?: string
}

type SessionData = {
  mode: "mock" | "live"
  token: string
  conversation_id: string
  payment_page_url: string
  amount: number
  currency_code: string
  payment_id?: string
  client?: Record<string, unknown>
}

type Deps = { logger: Logger }

function toNumber(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value)
  if (value && typeof value === "object" && "toJSON" in value) {
    return Number((value as { toJSON: () => unknown }).toJSON())
  }
  return Number(value)
}

function readString(obj: Record<string, unknown> | undefined, key: string): string | undefined {
  const v = obj?.[key]
  return typeof v === "string" && v.trim() !== "" ? v : undefined
}

function asSession(data: Record<string, unknown> | undefined): SessionData {
  if (!data || typeof data.token !== "string" || (data.mode !== "mock" && data.mode !== "live")) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Geçersiz iyzico oturum verisi")
  }
  return data as unknown as SessionData
}

class IyzicoProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "iyzico"

  protected readonly logger: Logger
  protected readonly options: Required<Pick<Options, "mode">> & Options
  protected readonly client: IyzicoClient | null

  static validateOptions(options: Record<string, unknown>): void {
    if (options.mode === "live" && (!options.apiKey || !options.secretKey || !options.callbackUrl)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "iyzico live modu için apiKey, secretKey ve callbackUrl zorunludur",
      )
    }
  }

  constructor(cradle: Deps, options: Options) {
    super(cradle as unknown as Record<string, unknown>, options)
    this.logger = cradle.logger
    this.options = { ...options, mode: options.mode === "live" ? "live" : "mock" }
    this.client =
      this.options.mode === "live"
        ? new IyzicoClient({
            apiKey: options.apiKey ?? "",
            secretKey: options.secretKey ?? "",
            baseUrl: options.baseUrl ?? "https://sandbox-api.iyzipay.com",
          })
        : null
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const amount = toNumber(input.amount)
    const currency = input.currency_code.toUpperCase()
    if (currency !== "TRY") {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "iyzico yalnızca TRY ile çalışır")
    }
    const conversationId = randomUUID()

    if (this.options.mode === "mock") {
      const token = `mock_${randomUUID()}`
      const base = this.options.mockPageUrl ?? "http://localhost:8000/tr/odeme/simulasyon"
      const data: SessionData = {
        mode: "mock",
        token,
        conversation_id: conversationId,
        payment_page_url: `${base}?token=${encodeURIComponent(token)}`,
        amount,
        currency_code: currency,
      }
      return { id: token, status: PaymentSessionStatus.PENDING, data }
    }

    // ── live (sandbox ya da prod) ─────────────────────────────────────────
    const client = input.data ?? {}
    const customer = input.context?.customer
    const email = customer?.email ?? readString(client, "email")
    const firstName = readString(client, "first_name") ?? customer?.first_name ?? undefined
    const lastName = readString(client, "last_name") ?? customer?.last_name ?? undefined
    const addressLine = readString(client, "address_1")
    const city = readString(client, "city")
    if (!email || !firstName || !lastName || !addressLine || !city) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "iyzico için ad, soyad, e-posta, adres ve şehir gereklidir",
      )
    }
    const address: IyzicoAddress = {
      contactName: `${firstName} ${lastName}`,
      city,
      country: "Turkey",
      address: addressLine,
      zipCode: readString(client, "postal_code"),
    }
    const price = amount.toFixed(2)
    const result = await this.client!.initialize({
      locale: readString(client, "locale") === "en" ? "en" : "tr",
      conversationId,
      price,
      paidPrice: price,
      currency: "TRY",
      basketId: readString(client, "cart_id") ?? conversationId,
      paymentGroup: "PRODUCT",
      callbackUrl: this.options.callbackUrl!,
      enabledInstallments: [1, 2, 3, 6],
      buyer: {
        id: customer?.id ?? `guest_${conversationId}`,
        name: firstName,
        surname: lastName,
        email,
        // Demo: TCKN toplanmaz. iyzico sandbox'ı örnek numarayı kabul eder; prod'da fatura akışıyla ele alınmalı.
        identityNumber: "11111111111",
        registrationAddress: addressLine,
        city,
        country: "Turkey",
        ip: readString(client, "ip") ?? "127.0.0.1",
      },
      shippingAddress: address,
      billingAddress: address,
      basketItems: [
        { id: "order", name: "ARION sipariş", category1: "Ayakkabı", itemType: "PHYSICAL", price },
      ],
    })

    if (result.status !== "success" || !result.token || !result.paymentPageUrl) {
      this.logger.warn(`iyzico initialize başarısız: ${result.errorCode ?? "?"}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `iyzico ödeme başlatılamadı (${result.errorCode ?? "bilinmeyen hata"})`,
      )
    }

    const data: SessionData = {
      mode: "live",
      token: result.token,
      conversation_id: conversationId,
      payment_page_url: result.paymentPageUrl,
      amount,
      currency_code: currency,
    }
    return { id: result.token, status: PaymentSessionStatus.PENDING, data }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const session = asSession(input.data)

    if (session.mode === "mock") {
      // Yalnızca demo: sonuç storefront'un simülasyon sayfasından gelir.
      const result = readString(session.client, "mock_result")
      if (result === "success") {
        return {
          status: PaymentSessionStatus.AUTHORIZED,
          data: { ...session, payment_id: `mockpay_${session.token.slice(5, 13)}` },
        }
      }
      return { status: PaymentSessionStatus.ERROR, data: { ...session } }
    }

    // live: callback'e güvenme — sonucu iyzico API'sinden doğrula
    const res = await this.client!.retrieve(session.token, session.conversation_id)
    const paid = toNumber(res.paidPrice)
    const ok =
      res.status === "success" &&
      res.paymentStatus === "SUCCESS" &&
      Math.abs(paid - session.amount) < 0.01 &&
      res.conversationId === session.conversation_id

    if (!ok) {
      this.logger.warn(
        `iyzico doğrulama başarısız: status=${res.status} paymentStatus=${res.paymentStatus ?? "-"}`,
      )
      return { status: PaymentSessionStatus.ERROR, data: { ...session } }
    }
    // Checkout Form ödemeleri anında tahsil edilir
    return {
      status: PaymentSessionStatus.CAPTURED,
      data: { ...session, payment_id: res.paymentId },
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return { data: input.data }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data: input.data }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const session = asSession(input.data)
    if (session.mode === "mock") return { data: input.data }
    // Kalem bazlı iyzico iadesi (paymentTransactionId) iade sihirbazıyla birlikte Faz 4'te eklenecek.
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "iyzico canlı iade henüz desteklenmiyor (Faz 4)",
    )
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: input.data }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    // Tutar değiştiyse yeni ödeme sayfası gerekir
    const current = input.data ? toNumber(input.data.amount) : NaN
    if (Math.abs(current - toNumber(input.amount)) >= 0.01) {
      return this.initiatePayment(input)
    }
    return { status: PaymentSessionStatus.PENDING, data: input.data }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    return {
      status: input.data?.payment_id ? PaymentSessionStatus.AUTHORIZED : PaymentSessionStatus.PENDING,
      data: input.data,
    }
  }

  async getWebhookActionAndData(
    _payload: ProviderWebhookPayload["payload"],
  ): Promise<WebhookActionResult> {
    // Checkout Form sonucu callback + sunucu tarafı retrieve ile doğrulanır; webhook kullanılmaz.
    return { action: "not_supported" }
  }
}

export default IyzicoProviderService
