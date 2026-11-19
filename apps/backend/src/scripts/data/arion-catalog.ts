/**
 * ARION demo kataloğu (Rapor §12 Faz 2: 5 kategori, ≥12 ürün, ≥4 kalıp).
 * TÜM değerler DEMO'dur: test metrikleri gerçek laboratuvar sonucu DEĞİLDİR; somut standart numarası uydurulmaz.
 */

export type CategoryHandle = "topuklu" | "kislik-bot" | "sneaker" | "klasik" | "cocuk"

export const CATEGORIES: Array<{ handle: CategoryHandle; name: string; name_en: string; rank: number }> = [
  { handle: "topuklu", name: "Topuklu", name_en: "Heels", rank: 0 },
  { handle: "kislik-bot", name: "Kışlık Bot", name_en: "Winter Boots", rank: 1 },
  { handle: "sneaker", name: "Sneaker", name_en: "Sneakers", rank: 2 },
  { handle: "klasik", name: "Klasik", name_en: "Classics", rank: 3 },
  { handle: "cocuk", name: "Çocuk", name_en: "Kids", rank: 4 },
]

// ── Kalıplar ─────────────────────────────────────────────────────────────
type WidthFitting = "N" | "M" | "W"

export type LastSeed = {
  code: string
  name: string
  category: CategoryHandle
  toe_shape: "round" | "almond" | "square" | "pointed"
  sizes: number[]
  /** ön ayak genişliği / kalıp uzunluğu oranı (M genişlik) */
  widthRatio: number
  fittings: WidthFitting[]
  notes: string
}

export const LASTS: LastSeed[] = [
  {
    code: "ARN-L01",
    name: "Pera",
    category: "topuklu",
    toe_shape: "almond",
    sizes: [35, 36, 37, 38, 39, 40, 41],
    widthRatio: 0.355,
    fittings: ["M"],
    notes: "Badem burun, 65 mm'ye kadar topuk için. Ön ayakta dar çalışır; arada kalanlara yarım numara büyük önerilir.",
  },
  {
    code: "ARN-L03",
    name: "Kaçkar",
    category: "kislik-bot",
    toe_shape: "round",
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    widthRatio: 0.395,
    fittings: ["M", "W"],
    notes: "Yuvarlak, hacimli burun. Kalın kışlık çorap için +4 mm pay bırakılmıştır.",
  },
  {
    code: "ARN-L05",
    name: "Rüzgar",
    category: "sneaker",
    toe_shape: "round",
    sizes: [37, 38, 39, 40, 41, 42, 43, 44, 45],
    widthRatio: 0.385,
    fittings: ["M", "W"],
    notes: "Atletik kalıp; topuk kilidi sıkı, ön ayak hareketli.",
  },
  {
    code: "ARN-L07",
    name: "Galata",
    category: "klasik",
    toe_shape: "almond",
    sizes: [39, 40, 41, 42, 43, 44, 45],
    widthRatio: 0.375,
    fittings: ["N", "M", "W"],
    notes: "Klasik badem burun. Deri taban zamanla ayağa göre şekil alır; ilk hafta hafif sıkı gelebilir.",
  },
  {
    code: "ARN-L09",
    name: "Fidan",
    category: "cocuk",
    toe_shape: "round",
    sizes: [26, 27, 28, 29, 30, 31, 32, 33, 34],
    widthRatio: 0.41,
    fittings: ["M"],
    notes: "Geniş burun, 12 mm büyüme payı. Çocuk ayağı her 3–4 ayda ölçülmelidir.",
  },
]

const PARIS_POINT_MM = 20 / 3
const FITTING_DELTA: Record<WidthFitting, number> = { N: -5, M: 0, W: 6 }

export function buildSizeTable(last: LastSeed) {
  return last.sizes.flatMap((eu) =>
    last.fittings.map((fit) => {
      const length = Math.round(eu * PARIS_POINT_MM)
      const ball = Math.round(length * last.widthRatio + FITTING_DELTA[fit])
      return {
        eu_size: eu,
        length_mm: length,
        ball_width_mm: ball,
        girth_mm: Math.round(ball * 2.35),
        width_fitting: fit,
      }
    }),
  )
}

// ── Ürünler ──────────────────────────────────────────────────────────────
export type Metric = { key: string; value: number; unit: string; method: string; is_demo: true }

const M = (key: string, value: number, unit: string, method: string): Metric => ({
  key,
  value,
  unit,
  method,
  is_demo: true,
})

/** "Nasıl ölçülür?" açıklamaları — standart numarası UYDURULMAZ (Rapor §6.3). */
const METHOD = {
  flex: "Taban bükülme testi: ön ayak bölgesi kırılma oluşana kadar tekrarlı bükülür (SATRA/ISO tipi yöntem, iç test).",
  abrasion: "Aşınma testi: taban malzemesi aşındırıcı silindirde döndürülür, hacim kaybı ölçülür (ISO tipi yöntem, iç test).",
  water: "Su geçirmezlik: ayakkabı sığ suda dinamik esnetilirken içeri su geçene kadar geçen süre.",
  slipWet: "Kayma direnci (ıslak seramik): sürtünme katsayısı, yüksek değer daha iyi tutunma.",
  slipDry: "Kayma direnci (kuru zemin): sürtünme katsayısı.",
  weight: "Çift ağırlığı, EU 40 / 42 referans numarada.",
  heel: "Topuk sabitlik testi: topuğa yan yük uygulanır, kalıcı açılma ölçülür.",
}

export type ProductSeed = {
  handle: string
  title: string
  title_en: string
  subtitle: string
  description: string
  description_en: string
  category: CategoryHandle
  last: string
  price: number
  colors: string[]
  sizes: number[]
  widths: Array<"M" | "W">
  construction: "cemented" | "goodyear_welt" | "blake" | "vulcanized"
  heel?: { height_mm: number; type: string; shank: "steel" | "composite" | "none"; pitch_deg: number }
  boot?: { waterproof_hours: number; membrane: string; insulation_rating: string; lug_depth_mm: number }
  materials: Array<{ part: string; material: string; origin: string }>
  weight: number
  repairability: number
  metrics: Metric[]
  made_to_order?: boolean
  /** Yalnızca demo: price_history geçmişi (gün önce, fiyat). Son kayıt = güncel fiyat. */
  history?: Array<{ daysAgo: number; price: number }>
}

const leather = (origin = "Bursa") => ({ part: "Saya", material: "Tam damarlı dana derisi", origin })

export const PRODUCTS: ProductSeed[] = [
  // ── Topuklu ───────────────────────────────────────────────────────────
  {
    handle: "pera-65-stiletto",
    title: "Pera 65 Stiletto",
    title_en: "Pera 65 Stiletto",
    subtitle: "Denge mühendisliği, 65 mm",
    description:
      "65 mm ince topuk, çelik şank ve ön ayak yastığıyla gün boyu dengeli basış. Topuk ekseni ağırlık merkeziyle hizalanmıştır.",
    description_en:
      "A 65 mm stiletto with a steel shank and forefoot cushion for balanced steps all day. The heel axis is aligned with the centre of mass.",
    category: "topuklu",
    last: "ARN-L01",
    price: 3490,
    colors: ["Siyah", "Bordo"],
    sizes: [36, 37, 38, 39, 40],
    widths: ["M"],
    construction: "cemented",
    heel: { height_mm: 65, type: "stiletto", shank: "steel", pitch_deg: 18 },
    materials: [
      leather(),
      { part: "Astar", material: "Bitkisel tabaklanmış keçi derisi", origin: "İzmir" },
      { part: "Ön ayak yastığı", material: "Hafızalı köpük", origin: "İstanbul" },
      { part: "Topuk ucu", material: "Değiştirilebilir TPU", origin: "İstanbul" },
    ],
    weight: 480,
    repairability: 7,
    metrics: [
      M("heel_stability", 0.8, "mm", METHOD.heel),
      M("flex_cycles", 25000, "döngü", METHOD.flex),
      M("slip_wet", 0.31, "μ", METHOD.slipWet),
      M("weight", 480, "g/çift", METHOD.weight),
    ],
  },
  {
    handle: "moda-45-blok-topuk",
    title: "Moda 45 Blok Topuk",
    title_en: "Moda 45 Block Heel",
    subtitle: "Geniş taban, sabit topuk",
    description:
      "45 mm blok topuk ve kompozit şank. Geniş burun (toe box) parmakları sıkıştırmaz; şehir yürüyüşü için tasarlandı.",
    description_en:
      "A 45 mm block heel with a composite shank. The roomy toe box does not pinch; made for city walking.",
    category: "topuklu",
    last: "ARN-L01",
    price: 2890,
    colors: ["Siyah", "Taba"],
    sizes: [36, 37, 38, 39, 40, 41],
    widths: ["M"],
    construction: "blake",
    heel: { height_mm: 45, type: "block", shank: "composite", pitch_deg: 12 },
    materials: [leather(), { part: "Taban", material: "Deri + kauçuk yama", origin: "İstanbul" }],
    weight: 520,
    repairability: 8,
    metrics: [
      M("heel_stability", 0.4, "mm", METHOD.heel),
      M("flex_cycles", 32000, "döngü", METHOD.flex),
      M("slip_wet", 0.36, "μ", METHOD.slipWet),
      M("weight", 520, "g/çift", METHOD.weight),
    ],
  },
  // ── Kışlık Bot ────────────────────────────────────────────────────────
  {
    handle: "kackar-su-gecirmez-bot",
    title: "Kaçkar Su Geçirmez Bot",
    title_en: "Kaçkar Waterproof Boot",
    subtitle: "Dayanıklılık sözleşmesi",
    description:
      "Su geçirmez membran, dikişsiz körük dil ve Goodyear welt taban. Taban değiştirilebilir; soğukta esnemeye devam eden kauçuk karışımı.",
    description_en:
      "Waterproof membrane, gusseted tongue and a Goodyear-welted sole that can be replaced. The rubber compound stays flexible in the cold.",
    category: "kislik-bot",
    last: "ARN-L03",
    price: 4990,
    colors: ["Kahverengi", "Siyah"],
    sizes: [39, 40, 41, 42, 43, 44],
    widths: ["M", "W"],
    construction: "goodyear_welt",
    boot: { waterproof_hours: 8, membrane: "Mikro gözenekli membran", insulation_rating: "-15 °C", lug_depth_mm: 6 },
    materials: [
      leather("Bursa"),
      { part: "Membran", material: "Mikro gözenekli su geçirmez katman", origin: "İthal" },
      { part: "Dış taban", material: "Soğuğa dayanıklı kauçuk", origin: "Kocaeli" },
      { part: "Astar", material: "Yün karışımlı termal astar", origin: "Uşak" },
    ],
    weight: 1380,
    repairability: 9,
    metrics: [
      M("waterproof_hours", 8, "saat", METHOD.water),
      M("slip_wet", 0.42, "μ", METHOD.slipWet),
      M("abrasion", 95, "mm³", METHOD.abrasion),
      M("weight", 1380, "g/çift", METHOD.weight),
    ],
  },
  {
    handle: "uludag-termal-bot",
    title: "Uludağ Termal Bot",
    title_en: "Uludağ Thermal Boot",
    subtitle: "Karda sıcak, buzda sabit",
    description: "Termal astar, 7 mm derin diş ve sıcak tutan yün tabanlık. Kar ve sulu kar için.",
    description_en: "Thermal lining, 7 mm deep lugs and a warm wool insole. Built for snow and slush.",
    category: "kislik-bot",
    last: "ARN-L03",
    price: 4290,
    colors: ["Antrasit"],
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    widths: ["M", "W"],
    construction: "cemented",
    boot: { waterproof_hours: 6, membrane: "Su itici kaplama + membran", insulation_rating: "-20 °C", lug_depth_mm: 7 },
    materials: [
      { part: "Saya", material: "Su itici nubuk", origin: "Bursa" },
      { part: "Astar", material: "Termal yün", origin: "Uşak" },
      { part: "Dış taban", material: "Derin dişli kauçuk", origin: "Kocaeli" },
    ],
    weight: 1290,
    repairability: 6,
    metrics: [
      M("waterproof_hours", 6, "saat", METHOD.water),
      M("slip_wet", 0.45, "μ", METHOD.slipWet),
      M("abrasion", 110, "mm³", METHOD.abrasion),
      M("weight", 1290, "g/çift", METHOD.weight),
    ],
  },
  {
    handle: "palandoken-chelsea",
    title: "Palandöken Chelsea",
    title_en: "Palandöken Chelsea",
    subtitle: "Şehirde kış",
    description: "Elastik yanlı Chelsea bot. Blake dikiş, ince ama kaymaz kauçuk taban.",
    description_en: "An elastic-sided Chelsea boot. Blake-stitched with a slim, grippy rubber sole.",
    category: "kislik-bot",
    last: "ARN-L03",
    price: 3790,
    colors: ["Siyah", "Taba"],
    sizes: [39, 40, 41, 42, 43, 44],
    widths: ["M"],
    construction: "blake",
    boot: { waterproof_hours: 2, membrane: "Su itici kaplama", insulation_rating: "-5 °C", lug_depth_mm: 3 },
    materials: [leather(), { part: "Yan panel", material: "Elastik dokuma", origin: "İstanbul" }],
    weight: 980,
    repairability: 8,
    metrics: [
      M("waterproof_hours", 2, "saat", METHOD.water),
      M("slip_wet", 0.37, "μ", METHOD.slipWet),
      M("flex_cycles", 40000, "döngü", METHOD.flex),
      M("weight", 980, "g/çift", METHOD.weight),
    ],
    // Fiyat şişirme senaryosu: indirimden önce fiyat yükseltildi → yasal referans yok, üstü çizili gösterilmez
    history: [
      { daysAgo: 60, price: 3290 },
      { daysAgo: 6, price: 3990 },
      { daysAgo: 3, price: 3790 },
    ],
  },
  // ── Sneaker ───────────────────────────────────────────────────────────
  {
    handle: "ruzgar-kosu",
    title: "Rüzgar Koşu",
    title_en: "Rüzgar Runner",
    subtitle: "Hareketin fiziği",
    description:
      "Yüksek geri dönüşlü ara taban, 8 mm topuk-burun farkı (drop) ve nefes alan örgü saya. Esneme hattı ön ayak eklemine hizalı.",
    description_en:
      "A high-rebound midsole, 8 mm heel-to-toe drop and a breathable knit upper. The flex line sits at the forefoot joint.",
    category: "sneaker",
    last: "ARN-L05",
    price: 2690,
    colors: ["Kor", "Gece Mavisi"],
    sizes: [38, 39, 40, 41, 42, 43, 44],
    widths: ["M", "W"],
    construction: "cemented",
    materials: [
      { part: "Saya", material: "Geri dönüştürülmüş PET örgü", origin: "Denizli" },
      { part: "Ara taban", material: "EVA/TPU karışımı köpük", origin: "İstanbul" },
      { part: "Dış taban", material: "Kauçuk", origin: "Kocaeli" },
    ],
    weight: 560,
    repairability: 4,
    metrics: [
      M("flex_cycles", 60000, "döngü", METHOD.flex),
      M("slip_wet", 0.4, "μ", METHOD.slipWet),
      M("abrasion", 140, "mm³", METHOD.abrasion),
      M("weight", 560, "g/çift", METHOD.weight),
    ],
  },
  {
    handle: "bogaz-gunluk-sneaker",
    title: "Boğaz Günlük Sneaker",
    title_en: "Boğaz Everyday Sneaker",
    subtitle: "Her gün, her zemin",
    description: "Deri saya, dikişli kenar (cupsole) ve değiştirilebilir tabanlık. Günlük kullanım için.",
    description_en: "Leather upper, stitched cupsole and a replaceable insole. For every day.",
    category: "sneaker",
    last: "ARN-L05",
    price: 2290,
    colors: ["Beyaz", "Siyah"],
    sizes: [37, 38, 39, 40, 41, 42, 43, 44],
    widths: ["M"],
    construction: "cemented",
    materials: [leather(), { part: "Taban", material: "Dikişli kauçuk cupsole", origin: "Kocaeli" }],
    weight: 760,
    repairability: 6,
    metrics: [
      M("flex_cycles", 45000, "döngü", METHOD.flex),
      M("slip_dry", 0.55, "μ", METHOD.slipDry),
      M("abrasion", 120, "mm³", METHOD.abrasion),
      M("weight", 760, "g/çift", METHOD.weight),
    ],
    // Gerçek indirim: 10 gün öncesinin en düşüğü 2.790 → üstü çizili 2.790
    history: [
      { daysAgo: 45, price: 2790 },
      { daysAgo: 4, price: 2290 },
    ],
  },
  {
    handle: "kadikoy-vulkanize",
    title: "Kadıköy Vulkanize",
    title_en: "Kadıköy Vulcanised",
    subtitle: "Kanvas klasiği",
    description: "Vulkanize kauçuk taban ve organik pamuk kanvas. Hafif ve esnek.",
    description_en: "A vulcanised rubber sole and organic cotton canvas. Light and flexible.",
    category: "sneaker",
    last: "ARN-L05",
    price: 1890,
    colors: ["Ekru", "Siyah"],
    sizes: [37, 38, 39, 40, 41, 42, 43, 44, 45],
    widths: ["M"],
    construction: "vulcanized",
    materials: [
      { part: "Saya", material: "Organik pamuk kanvas", origin: "Denizli" },
      { part: "Taban", material: "Vulkanize kauçuk", origin: "Kocaeli" },
    ],
    weight: 640,
    repairability: 3,
    metrics: [
      M("flex_cycles", 50000, "döngü", METHOD.flex),
      M("slip_dry", 0.5, "μ", METHOD.slipDry),
      M("weight", 640, "g/çift", METHOD.weight),
    ],
  },
  // ── Klasik ────────────────────────────────────────────────────────────
  {
    handle: "galata-oxford",
    title: "Galata Oxford",
    title_en: "Galata Oxford",
    subtitle: "Miras ve tamir edilebilirlik",
    description:
      "Goodyear welt yapı ve tam deri taban. Pençesi defalarca yenilenebilir; bir ömür sürmesi için yapılır.",
    description_en:
      "Goodyear-welted with a full leather sole. It can be resoled again and again; built to last a lifetime.",
    category: "klasik",
    last: "ARN-L07",
    price: 4490,
    colors: ["Siyah", "Kahverengi"],
    sizes: [40, 41, 42, 43, 44],
    widths: ["M", "W"],
    construction: "goodyear_welt",
    made_to_order: true,
    materials: [
      leather(),
      { part: "Taban", material: "Bitkisel tabaklanmış deri", origin: "İzmir" },
      { part: "Welt", material: "Deri şerit", origin: "İstanbul" },
    ],
    weight: 1120,
    repairability: 10,
    metrics: [
      M("flex_cycles", 30000, "döngü", METHOD.flex),
      M("slip_dry", 0.42, "μ", METHOD.slipDry),
      M("weight", 1120, "g/çift", METHOD.weight),
    ],
  },
  {
    handle: "beyoglu-loafer",
    title: "Beyoğlu Loafer",
    title_en: "Beyoğlu Loafer",
    subtitle: "Bağcıksız klasik",
    description: "Blake dikiş, esnek deri taban ve el dikişi önlük. Hafif ve zarif.",
    description_en: "Blake-stitched, with a flexible leather sole and hand-sewn apron. Light and refined.",
    category: "klasik",
    last: "ARN-L07",
    price: 3690,
    colors: ["Bordo", "Kahverengi"],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    widths: ["M"],
    construction: "blake",
    materials: [leather(), { part: "Taban", material: "Deri", origin: "İzmir" }],
    weight: 690,
    repairability: 8,
    metrics: [
      M("flex_cycles", 35000, "döngü", METHOD.flex),
      M("slip_dry", 0.4, "μ", METHOD.slipDry),
      M("weight", 690, "g/çift", METHOD.weight),
    ],
  },
  {
    handle: "nisantasi-derby",
    title: "Nişantaşı Derby",
    title_en: "Nişantaşı Derby",
    subtitle: "Açık bağcıklı, geniş oturuş",
    description: "Açık bağcık sistemi yüksek ayak sırtına uyum sağlar. Goodyear welt, kauçuk yamalı deri taban.",
    description_en: "An open lacing system that suits a high instep. Goodyear welt, leather sole with rubber insert.",
    category: "klasik",
    last: "ARN-L07",
    price: 3990,
    colors: ["Taba", "Siyah"],
    sizes: [40, 41, 42, 43, 44, 45],
    widths: ["M", "W"],
    construction: "goodyear_welt",
    materials: [leather(), { part: "Taban", material: "Deri + kauçuk yama", origin: "İzmir" }],
    weight: 1060,
    repairability: 10,
    metrics: [
      M("flex_cycles", 32000, "döngü", METHOD.flex),
      M("slip_wet", 0.35, "μ", METHOD.slipWet),
      M("weight", 1060, "g/çift", METHOD.weight),
    ],
  },
  // ── Çocuk ─────────────────────────────────────────────────────────────
  {
    handle: "fidan-cirtli",
    title: "Fidan Cırtlı Çocuk Ayakkabısı",
    title_en: "Fidan Kids' Strap Shoe",
    subtitle: "Büyüme payı",
    description: "Esnek taban, geniş burun ve çift cırt. 12 mm büyüme payı bırakılmıştır.",
    description_en: "A flexible sole, wide toe box and double straps. 12 mm of growing room.",
    category: "cocuk",
    last: "ARN-L09",
    price: 1290,
    colors: ["Mavi", "Pembe"],
    sizes: [26, 27, 28, 29, 30, 31, 32],
    widths: ["M"],
    construction: "cemented",
    materials: [
      { part: "Saya", material: "Yumuşak nubuk", origin: "Bursa" },
      { part: "Taban", material: "Esnek kauçuk", origin: "Kocaeli" },
    ],
    weight: 340,
    repairability: 3,
    metrics: [
      M("flex_cycles", 40000, "döngü", METHOD.flex),
      M("slip_wet", 0.41, "μ", METHOD.slipWet),
      M("weight", 340, "g/çift", METHOD.weight),
    ],
  },
  {
    handle: "filiz-cocuk-botu",
    title: "Filiz Çocuk Botu",
    title_en: "Filiz Kids' Boot",
    subtitle: "Okul yolunda kuru ayak",
    description: "Su itici saya, fermuar + cırt kapanma ve derin dişli taban.",
    description_en: "A water-repellent upper, zip and strap closure and a deep-lug sole.",
    category: "cocuk",
    last: "ARN-L09",
    price: 1590,
    colors: ["Lacivert"],
    sizes: [28, 29, 30, 31, 32, 33, 34],
    widths: ["M"],
    construction: "cemented",
    boot: { waterproof_hours: 3, membrane: "Su itici kaplama", insulation_rating: "-5 °C", lug_depth_mm: 5 },
    materials: [
      { part: "Saya", material: "Su itici nubuk", origin: "Bursa" },
      { part: "Taban", material: "Kauçuk", origin: "Kocaeli" },
    ],
    weight: 520,
    repairability: 4,
    metrics: [
      M("waterproof_hours", 3, "saat", METHOD.water),
      M("slip_wet", 0.43, "μ", METHOD.slipWet),
      M("weight", 520, "g/çift", METHOD.weight),
    ],
  },
]

export const COLOR_CODES: Record<string, string> = {
  Siyah: "SYH",
  Bordo: "BRD",
  Taba: "TBA",
  Kahverengi: "KHV",
  Antrasit: "ANT",
  Kor: "KOR",
  "Gece Mavisi": "GMV",
  Beyaz: "BYZ",
  Ekru: "EKR",
  Mavi: "MAV",
  Pembe: "PMB",
  Lacivert: "LCV",
}
