// ARION uyum motoru — birim yardımcıları.
// Uyum motoru her zaman milimetreyle çalışır; numara yalnızca gösterimdir (Rapor 4.1).

/** Paris noktası: 1 EU numara = 2/3 cm = 6.667 mm kalıp uzunluğu. */
export const PARIS_POINT_MM = 20 / 3

/**
 * EU numarasından yaklaşık KALIP uzunluğu (mm).
 * Not: Kalıp uzunluğu ayak uzunluğundan büyüktür; gerçek eşleştirme
 * Last.sizeTable üzerinden yapılır (Faz 5). Bu fonksiyon yalnızca yedek tahmindir.
 */
export function euSizeToLastLengthMm(euSize: number): number {
  if (!Number.isFinite(euSize) || euSize <= 0) {
    throw new RangeError(`Geçersiz EU numara: ${euSize}`)
  }
  return Math.round(euSize * PARIS_POINT_MM * 10) / 10
}

/** Kalıp uzunluğundan (mm) en yakın yarım EU numara. */
export function lastLengthMmToEuSize(lengthMm: number): number {
  if (!Number.isFinite(lengthMm) || lengthMm <= 0) {
    throw new RangeError(`Geçersiz uzunluk: ${lengthMm}`)
  }
  return Math.round((lengthMm / PARIS_POINT_MM) * 2) / 2
}
