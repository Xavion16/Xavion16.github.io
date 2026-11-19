/* ARION DEMO pazarlama pikseli — YALNIZCA pazarlama çerez rızası varsa yüklenir. Gerçek reklam ağı bağlı değil. */
;(function () {
  document.cookie = "arion_ads=" + Date.now() + "; path=/; max-age=" + 60 * 60 * 24 * 90 + "; samesite=lax"
  fetch("/api/demo/collect?t=marketing", { method: "POST", keepalive: true })
})()
