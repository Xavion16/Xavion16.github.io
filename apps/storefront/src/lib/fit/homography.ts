/**
 * A4 yöntemi için perspektif düzeltme (Rapor §6.1 madde 2). Görüntüdeki 4 köşeyi 210×297 mm
 * dikdörtgene eşleyen homografi hesaplanır; diğer noktalar milimetreye çevrilir. Tamamen tarayıcıda.
 */
export type Pt = { x: number; y: number }

export const A4_MM = { w: 210, h: 297 } as const

/** Gauss eliminasyonu (kısmi pivot) ile Ax = b */
function solve(A: number[][], b: number[]): number[] | null {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]!])
  for (let c = 0; c < n; c++) {
    let piv = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r]![c]!) > Math.abs(M[piv]![c]!)) piv = r
    if (Math.abs(M[piv]![c]!) < 1e-12) return null
    ;[M[c], M[piv]] = [M[piv]!, M[c]!]
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = M[r]![c]! / M[c]![c]!
      for (let k = c; k <= n; k++) M[r]![k]! -= f * M[c]![k]!
    }
  }
  return M.map((row, i) => row[n]! / row[i]!)
}

/** src (görüntü) → dst (mm) homografisi; 3×3 matris satır sıralı, h33 = 1 */
export function homography(src: [Pt, Pt, Pt, Pt], dst: [Pt, Pt, Pt, Pt]): number[] | null {
  const A: number[][] = []
  const b: number[] = []
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i]!
    const { x: X, y: Y } = dst[i]!
    A.push([x, y, 1, 0, 0, 0, -x * X, -y * X])
    b.push(X)
    A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y])
    b.push(Y)
  }
  const h = solve(A, b)
  return h ? [...h, 1] : null
}

export function apply(H: number[], p: Pt): Pt {
  const w = H[6]! * p.x + H[7]! * p.y + H[8]!
  return { x: (H[0]! * p.x + H[1]! * p.y + H[2]!) / w, y: (H[3]! * p.x + H[4]! * p.y + H[5]!) / w }
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)

/** 8 nokta: 4 köşe (SÜ, SağÜ, SağA, SA), topuk, parmak ucu, genişlik 1, genişlik 2 → mm */
export function measureFromPoints(points: Pt[]): { lengthMm: number; ballWidthMm: number } | null {
  if (points.length < 8) return null
  const corners = points.slice(0, 4) as [Pt, Pt, Pt, Pt]
  const H = homography(corners, [
    { x: 0, y: 0 },
    { x: A4_MM.w, y: 0 },
    { x: A4_MM.w, y: A4_MM.h },
    { x: 0, y: A4_MM.h },
  ])
  if (!H) return null
  const [heel, toe, w1, w2] = points.slice(4, 8).map((p) => apply(H, p)) as [Pt, Pt, Pt, Pt]
  return { lengthMm: Math.round(dist(heel, toe)), ballWidthMm: Math.round(dist(w1, w2)) }
}
