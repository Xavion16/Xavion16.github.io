/* ARION DEMO analitik — YALNIZCA analitik çerez rızası varsa yüklenir (Rapor §7.1.4).
   Üçüncü tarafa veri göndermez; kendi demo uç noktamıza sayfa görüntüleme sinyali atar. */
;(function () {
  document.cookie = "arion_metrics=" + Date.now() + "; path=/; max-age=" + 60 * 60 * 24 * 395 + "; samesite=lax"
  fetch("/api/demo/collect?t=analytics&p=" + encodeURIComponent(location.pathname), { method: "POST", keepalive: true })
})()
