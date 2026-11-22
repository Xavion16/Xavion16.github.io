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
    code: "ARN-L02",
    name: "Cihangir",
    category: "topuklu",
    toe_shape: "almond",
    sizes: [36, 37, 38, 39, 40, 41],
    widthRatio: 0.36,
    fittings: ["M"],
    notes: "Topuklu çizme ve bilek bot için badem burun. Konç bilekte sarar; kalın çorapla yarım numara büyük önerilir.",
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
  /** İsmin hikâyesi (mitoloji ↔ ayakkabı) — TR / EN */
  story?: { tr: string; en: string }
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
    handle: "selene-stiletto",
    story: { tr: "Selene, Ay tanrıçası. Gece ışığını taşıyan ince, keskin bir siluet.", en: "Selene, goddess of the Moon. A fine, sharp silhouette that carries the night's light." },
    title: "Selene Stiletto",
    title_en: "Selene Stiletto",
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
    handle: "eos-blok-topuk",
    story: { tr: "Eos, şafağın tanrıçası. Güne sağlam basan, sabahtan akşama yürüyen topuk.", en: "Eos, goddess of the dawn. A heel that stands firm from morning to evening." },
    title: "Eos Blok Topuk",
    title_en: "Eos Block Heel",
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
  {
    handle: "artemis-topuklu-cizme",
    story: { tr: "Artemis, avcı tanrıça. Diz boyu konçla güçlü ve kararlı adımlar.", en: "Artemis, the huntress. A knee-high shaft for strong, decisive steps." },
    title: "Artemis Topuklu Çizme",
    title_en: "Artemis Heeled Knee Boot",
    subtitle: "Diz boyu, 75 mm blok topuk",
    description:
      "Diz boyu konç, iç yanda tam boy fermuar ve 75 mm blok topuk. Konç bileği sarar, baldırda rahat bırakır; çelik şank uzun yürüyüşte dengeyi korur.",
    description_en:
      "A knee-high shaft with a full-length inside zip and a 75 mm block heel. It hugs the ankle and leaves the calf easy; a steel shank keeps long walks balanced.",
    category: "topuklu",
    last: "ARN-L02",
    price: 6490,
    colors: ["Siyah", "Bordo"],
    sizes: [36, 37, 38, 39, 40, 41],
    widths: ["M"],
    construction: "blake",
    heel: { height_mm: 75, type: "block", shank: "steel", pitch_deg: 20 },
    materials: [leather(), { part: "Astar", material: "Bitkisel tabaklanmış keçi derisi", origin: "İzmir" }, { part: "Fermuar", material: "Metal, kilitli", origin: "İstanbul" }],
    weight: 1120,
    repairability: 8,
    metrics: [
      M("heel_stability", 0.5, "mm", METHOD.heel),
      M("flex_cycles", 28000, "döngü", METHOD.flex),
      M("slip_wet", 0.34, "μ", METHOD.slipWet),
      M("weight", 1120, "g/çift", METHOD.weight),
    ],
    made_to_order: true,
  },
  {
    handle: "hera-bilek-bot",
    story: { tr: "Hera, tanrıların kraliçesi. Bilekte asil, duruşta zarif.", en: "Hera, queen of the gods. Noble at the ankle, graceful in stance." },
    title: "Hera Bilek Bot",
    title_en: "Hera Ankle Boot",
    subtitle: "İnce topuk, bilek boyu",
    description:
      "Bilek boyu, 70 mm ince topuk ve yan fermuar. Sivri olmayan badem burun gün boyu parmaklara yer bırakır.",
    description_en:
      "Ankle height with a slim 70 mm heel and a side zip. The almond toe leaves the toes room all day.",
    category: "topuklu",
    last: "ARN-L02",
    price: 4890,
    colors: ["Siyah", "Taba"],
    sizes: [36, 37, 38, 39, 40, 41],
    widths: ["M"],
    construction: "cemented",
    heel: { height_mm: 70, type: "stiletto", shank: "steel", pitch_deg: 19 },
    materials: [leather(), { part: "Astar", material: "Bitkisel tabaklanmış keçi derisi", origin: "İzmir" }, { part: "Topuk ucu", material: "Değiştirilebilir TPU", origin: "İstanbul" }],
    weight: 760,
    repairability: 7,
    metrics: [
      M("heel_stability", 0.7, "mm", METHOD.heel),
      M("flex_cycles", 26000, "döngü", METHOD.flex),
      M("slip_wet", 0.32, "μ", METHOD.slipWet),
      M("weight", 760, "g/çift", METHOD.weight),
    ],
  },
  {
    handle: "aurea-slingback",
    story: { tr: "Aurea, Latince 'altından'. Işığı yakalayan metalik bir gece çizgisi.", en: "Aurea, Latin for 'golden'. A metallic evening line that catches the light." },
    title: "Aurea Slingback",
    title_en: "Aurea Slingback",
    subtitle: "Metalik deri, 80 mm",
    description:
      "Metalik deri, arkası açık slingback ve 80 mm ince topuk. Lastikli arka bant topuğu sıkmadan tutar; gece için ışığı yakalayan bir çizgi.",
    description_en:
      "Metallic leather, an open-back slingback and a slim 80 mm heel. The elasticated strap holds the heel without pinching; a line made to catch the light at night.",
    category: "topuklu",
    last: "ARN-L01",
    price: 4190,
    colors: ["Altın", "Siyah"],
    sizes: [36, 37, 38, 39, 40],
    widths: ["M"],
    construction: "cemented",
    heel: { height_mm: 80, type: "stiletto", shank: "steel", pitch_deg: 21 },
    materials: [{ part: "Saya", material: "Metalik kaplamalı keçi derisi", origin: "İzmir" }, { part: "Arka bant", material: "Lastik takviyeli deri", origin: "İstanbul" }, { part: "Ön ayak yastığı", material: "Hafızalı köpük", origin: "İstanbul" }],
    weight: 450,
    repairability: 6,
    metrics: [
      M("heel_stability", 0.9, "mm", METHOD.heel),
      M("flex_cycles", 22000, "döngü", METHOD.flex),
      M("slip_wet", 0.3, "μ", METHOD.slipWet),
      M("weight", 450, "g/çift", METHOD.weight),
    ],
  },
  {
    handle: "aphrodite-sandalet",
    story: { tr: "Aphrodite, köpükten doğan güzellik tanrıçası. İnce bantlarla hafif ve zarif.", en: "Aphrodite, goddess of beauty born from sea foam. Light and graceful on fine straps." },
    title: "Aphrodite Sandalet",
    title_en: "Aphrodite Sandal",
    subtitle: "İnce bantlı, 85 mm",
    description:
      "İnce deri bantlar, ayarlanabilir bilek kayışı ve 85 mm ince topuk. Ön ayaktaki yastık uzun gecelerde basıncı dağıtır.",
    description_en:
      "Fine leather straps, an adjustable ankle strap and a slim 85 mm heel. The forefoot cushion spreads pressure through long evenings.",
    category: "topuklu",
    last: "ARN-L01",
    price: 3590,
    colors: ["Siyah", "Bej"],
    sizes: [36, 37, 38, 39, 40],
    widths: ["M"],
    construction: "cemented",
    heel: { height_mm: 85, type: "stiletto", shank: "steel", pitch_deg: 22 },
    materials: [leather(), { part: "Ön ayak yastığı", material: "Hafızalı köpük", origin: "İstanbul" }, { part: "Toka", material: "Pirinç", origin: "İstanbul" }],
    weight: 390,
    repairability: 6,
    metrics: [
      M("heel_stability", 1, "mm", METHOD.heel),
      M("flex_cycles", 21000, "döngü", METHOD.flex),
      M("slip_wet", 0.29, "μ", METHOD.slipWet),
      M("weight", 390, "g/çift", METHOD.weight),
    ],
  },
  {
    handle: "astra-mule",
    story: { tr: "Astra, Latince 'yıldızlar'. Gümüş parıltısıyla gündüzden geceye.", en: "Astra, Latin for 'the stars'. A silver gleam from day into night." },
    title: "Astra Mule",
    title_en: "Astra Mule",
    subtitle: "Sivri burun, 55 mm",
    description:
      "Arkası açık, sivri burunlu mule ve 55 mm kadeh topuk. Saten görünümlü deri; girip çıkması kolay, gün ve gece arasında.",
    description_en:
      "An open-back, pointed mule with a 55 mm kitten heel. Satin-look leather; easy on and off, between day and night.",
    category: "topuklu",
    last: "ARN-L01",
    price: 3290,
    colors: ["Gümüş", "Siyah"],
    sizes: [36, 37, 38, 39, 40, 41],
    widths: ["M"],
    construction: "cemented",
    heel: { height_mm: 55, type: "kitten", shank: "composite", pitch_deg: 15 },
    materials: [{ part: "Saya", material: "Saten görünümlü metalik deri", origin: "İzmir" }, { part: "Astar", material: "Bitkisel tabaklanmış keçi derisi", origin: "İzmir" }],
    weight: 420,
    repairability: 6,
    metrics: [
      M("heel_stability", 0.5, "mm", METHOD.heel),
      M("flex_cycles", 30000, "döngü", METHOD.flex),
      M("slip_wet", 0.33, "μ", METHOD.slipWet),
      M("weight", 420, "g/çift", METHOD.weight),
    ],
  },
  // ── Kışlık Bot ────────────────────────────────────────────────────────
  {
    handle: "olympos-dag-botu",
    story: { tr: "Olympos, tanrıların dağı. Zirveye yürüyen su geçirmez bot.", en: "Olympos, mountain of the gods. A waterproof boot made for the summit." },
    title: "Olympos Dağ Botu",
    title_en: "Olympos Mountain Boot",
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
    handle: "boreas-termal-bot",
    story: { tr: "Boreas, kuzey rüzgârının tanrısı. Ayazda sıcak tutan bot.", en: "Boreas, god of the north wind. A boot that keeps you warm in the frost." },
    title: "Boreas Termal Bot",
    title_en: "Boreas Thermal Boot",
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
    handle: "herakles-chelsea",
    story: { tr: "Herakles, Arion'u da süren yarı tanrı kahraman. Şehirde kışa dayanıklı güç.", en: "Herakles, the demigod hero who also rode Arion. Winter-proof strength for the city." },
    title: "Herakles Chelsea",
    title_en: "Herakles Chelsea",
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
    handle: "zephyros-kosu",
    story: { tr: "Zephyros, hafif ve hızlı batı rüzgârı. Koşuda geride rüzgâr bırakır.", en: "Zephyros, the light and swift west wind. Leaves only wind behind on the run." },
    title: "Zephyros Koşu",
    title_en: "Zephyros Runner",
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
    handle: "helios-sneaker",
    story: { tr: "Helios, güneş tanrısı. Her gün, her zeminde aydınlık bir sneaker.", en: "Helios, god of the sun. A bright sneaker for every day and every ground." },
    title: "Helios Sneaker",
    title_en: "Helios Sneaker",
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
    handle: "hephaistos-vulkanize",
    story: { tr: "Hephaistos, ateşin ve demircinin tanrısı. Kauçuğu ısıyla birleştiren vulkanize taban.", en: "Hephaistos, god of fire and the forge. A sole bonded to rubber by heat." },
    title: "Hephaistos Vulkanize",
    title_en: "Hephaistos Vulcanised",
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
    handle: "adrastus-oxford",
    story: { tr: "Adrastus, efsanede Arion'u süren Argos kralı. Markanın en köklü klasiği.", en: "Adrastus, the king of Argos who rode Arion in legend. The brand's most rooted classic." },
    title: "Adrastus Oxford",
    title_en: "Adrastus Oxford",
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
    handle: "castor-loafer",
    story: { tr: "Castor, usta binici ikizlerden biri. Bağcıksız, rahat ve her yere hazır.", en: "Castor, one of the horseman twins. Laceless, easy and ready for anywhere." },
    title: "Castor Loafer",
    title_en: "Castor Loafer",
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
    handle: "pollux-derby",
    story: { tr: "Pollux, Castor'un ikizi. Loafer'ın kardeşi, açık bağcıklı derby.", en: "Pollux, Castor's twin. The loafer's sibling: an open-laced derby." },
    title: "Pollux Derby",
    title_en: "Pollux Derby",
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
    handle: "iris-cirtli",
    story: { tr: "Iris, gökkuşağının habercisi. Renkli, hafif ve küçük adımlar için.", en: "Iris, messenger of the rainbow. Colourful and light, for small steps." },
    title: "Iris Cırtlı",
    title_en: "Iris Strap Shoe",
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
    handle: "hebe-cocuk-sneaker",
    story: { tr: "Hebe, gençliğin tanrıçası. Bitmeyen enerjiye ayak uyduran hafif sneaker.", en: "Hebe, goddess of youth. A light sneaker that keeps up with endless energy." },
    title: "Hebe Çocuk Sneaker",
    title_en: "Hebe Kids' Sneaker",
    subtitle: "Lastik bağcık, hafif taban",
    description: "Bağlamaya gerek kalmayan lastik bağcık, arkada çekme halkası ve hafif EVA taban. 10 mm büyüme payı bırakılmıştır.",
    description_en: "No-tie elastic laces, a heel pull loop and a light EVA sole. 10 mm of growing room.",
    category: "cocuk",
    last: "ARN-L09",
    price: 1390,
    colors: ["Beyaz", "Lacivert"],
    sizes: [26, 27, 28, 29, 30, 31, 32, 33, 34],
    widths: ["M"],
    construction: "cemented",
    materials: [
      { part: "Saya", material: "Yumuşak dana derisi + nefes alan file", origin: "Bursa" },
      { part: "Taban", material: "Hafif EVA + kauçuk yama", origin: "Kocaeli" },
    ],
    weight: 300,
    repairability: 3,
    metrics: [
      M("flex_cycles", 45000, "döngü", METHOD.flex),
      M("slip_wet", 0.4, "μ", METHOD.slipWet),
      M("weight", 300, "g/çift", METHOD.weight),
    ],
  },
  {
    handle: "delphinus-cocuk-sandalet",
    story: { tr: "Delphinus, Arion'un babası Poseidon'un yunusu. Kumda ve suda özgür adımlar.", en: "Delphinus, the dolphin of Poseidon, Arion's father. Free steps on sand and in water." },
    title: "Delphinus Çocuk Sandalet",
    title_en: "Delphinus Kids' Sandal",
    subtitle: "Suya dayanıklı yaz sandaleti",
    description: "Kapalı burun parmakları korur, çift cırt bileği sarar; suya dayanıklı bantlar ve kaymaz taban kumsalda da rahat.",
    description_en: "A closed toe protects little toes and double straps hold the ankle; water-resistant straps and a non-slip sole, at home on the beach.",
    category: "cocuk",
    last: "ARN-L09",
    price: 1190,
    colors: ["Mavi", "Pembe"],
    sizes: [26, 27, 28, 29, 30, 31, 32],
    widths: ["M"],
    construction: "cemented",
    materials: [
      { part: "Bantlar", material: "Suya dayanıklı yumuşak deri", origin: "Bursa" },
      { part: "Taban", material: "Kaymaz kauçuk", origin: "Kocaeli" },
    ],
    weight: 280,
    repairability: 3,
    metrics: [
      M("flex_cycles", 42000, "döngü", METHOD.flex),
      M("slip_wet", 0.45, "μ", METHOD.slipWet),
      M("weight", 280, "g/çift", METHOD.weight),
    ],
  },
  {
    handle: "triton-cocuk-botu",
    story: { tr: "Triton, denizin habercisi. Okul yolunda ayakları kuru tutan bot.", en: "Triton, messenger of the sea. A boot that keeps feet dry on the way to school." },
    title: "Triton Çocuk Botu",
    title_en: "Triton Kids' Boot",
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
