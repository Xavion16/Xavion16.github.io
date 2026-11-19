import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const STOREFRONT_URL = process.env.STOREFRONT_URL ?? "http://localhost:8000"
const paymentMode = process.env.PAYMENT_ADAPTER === "live" ? "live" : "mock"

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    // ── ARION özel modülleri (Rapor §9.2) ──────────────────────────────
    { resolve: "./src/modules/last" },
    { resolve: "./src/modules/product-tech" },
    { resolve: "./src/modules/price-history" },

    // ── Ödeme: iyzico Checkout Form (mock | live) ─────────────────────
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/iyzico-payment",
            id: "iyzico",
            options: {
              mode: paymentMode,
              apiKey: process.env.IYZICO_API_KEY,
              secretKey: process.env.IYZICO_SECRET_KEY,
              baseUrl: process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com",
              callbackUrl: `${STOREFRONT_URL}/api/odeme/iyzico-donus`,
              mockPageUrl: `${STOREFRONT_URL}/tr/odeme/simulasyon`,
            },
          },
        ],
      },
    },

    // ── E-posta: geliştirmede .outbox/ klasörüne yazar ────────────────
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/outbox-notification",
            id: "outbox",
            options: { channels: ["email"], directory: ".outbox" },
          },
          {
            resolve: "@medusajs/medusa/notification-local",
            id: "local",
            options: { channels: ["feed"] },
          },
        ],
      },
    },
  ],
})
