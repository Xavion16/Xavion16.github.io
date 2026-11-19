import Iyzipay from "iyzipay"

/**
 * iyzico Checkout Form için dar, doğru tipli istemci.
 * @types/iyzipay'deki Checkout Form tipleri kart alanlarını zorunlu tutuyor; oysa Checkout Form'da
 * kart bilgisi iyzico'nun sayfasında girilir ve ARION'a HİÇ ulaşmaz (PCI kapsamı küçük).
 */

export type IyzicoAddress = {
  contactName: string
  city: string
  country: string
  address: string
  zipCode?: string
}

export type IyzicoBuyer = {
  id: string
  name: string
  surname: string
  email: string
  identityNumber: string
  registrationAddress: string
  city: string
  country: string
  ip: string
  gsmNumber?: string
}

export type CheckoutFormInitializeRequest = {
  locale: "tr" | "en"
  conversationId: string
  price: string
  paidPrice: string
  currency: "TRY"
  basketId: string
  paymentGroup: "PRODUCT"
  callbackUrl: string
  enabledInstallments: number[]
  buyer: IyzicoBuyer
  shippingAddress: IyzicoAddress
  billingAddress: IyzicoAddress
  basketItems: Array<{
    id: string
    name: string
    category1: string
    itemType: "PHYSICAL"
    price: string
  }>
}

export type CheckoutFormInitializeResult = {
  status: "success" | "failure"
  errorCode?: string
  errorMessage?: string
  token?: string
  paymentPageUrl?: string
  tokenExpireTime?: number
}

export type CheckoutFormRetrieveResult = {
  status: "success" | "failure"
  errorCode?: string
  errorMessage?: string
  paymentStatus?: "SUCCESS" | "FAILURE" | "INIT_THREEDS" | "CALLBACK_THREEDS"
  paymentId?: string
  paidPrice?: number
  price?: number
  currency?: string
  basketId?: string
  conversationId?: string
  fraudStatus?: number
}

type Callback<T> = (err: Error | null, result: T) => void

type IyzipaySdk = {
  checkoutFormInitialize: {
    create(data: CheckoutFormInitializeRequest, cb: Callback<CheckoutFormInitializeResult>): void
  }
  checkoutForm: {
    retrieve(
      data: { locale: "tr" | "en"; conversationId: string; token: string },
      cb: Callback<CheckoutFormRetrieveResult>,
    ): void
  }
}

export class IyzicoClient {
  private readonly sdk: IyzipaySdk

  constructor(opts: { apiKey: string; secretKey: string; baseUrl: string }) {
    // SDK'nın kendi tipleri Checkout Form için hatalı; yalnızca kullandığımız yüzeyi tipliyoruz.
    this.sdk = new Iyzipay({
      apiKey: opts.apiKey,
      secretKey: opts.secretKey,
      uri: opts.baseUrl,
    }) as unknown as IyzipaySdk
  }

  initialize(req: CheckoutFormInitializeRequest): Promise<CheckoutFormInitializeResult> {
    return new Promise((resolve, reject) =>
      this.sdk.checkoutFormInitialize.create(req, (err, res) => (err ? reject(err) : resolve(res))),
    )
  }

  retrieve(token: string, conversationId: string): Promise<CheckoutFormRetrieveResult> {
    return new Promise((resolve, reject) =>
      this.sdk.checkoutForm.retrieve({ locale: "tr", conversationId, token }, (err, res) =>
        err ? reject(err) : resolve(res),
      ),
    )
  }
}
