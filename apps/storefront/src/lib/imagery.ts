/**
 * Kadife Gece görsel seti (DECISIONS #071). Unsplash Lisansı ile ücretsiz fotoğraflar — DEMO:
 * gerçek ürün çekimiyle değiştirilecek.
 * Logo/marka görünen kareler bilinçli olarak seçilmedi.
 */
export type Photo = { id: string; alt: { tr: string; en: string } }

const P = (id: string, tr: string, en: string): Photo => ({ id, alt: { tr, en } })

export const PHOTOS = {
  // Vitrin: ürün heykel gibi, loş sahnede (marka işareti görünmeyen kareler)
  vitrineRed: P("photo-1552961449-a90c5f2a8179", "Kırmızı kaide üzerinde cam vitrinde siyah bilekten bağlı topuklu", "A black ankle-strap heel in a glass case on a red plinth"),
  goldReflect: P("photo-1784821926273-729302e327a7", "Karanlık zeminde yansımasıyla altın rengi topuklu", "A gold heel and its reflection on a dark surface"),
  sparkShelf: P("photo-1784450691035-74c718c3fcfe", "Loş raflarda ışıltılı iki topuklu", "Two sparkling heels on dim shelves"),
  sparkOne: P("photo-1784450691142-14f7129883c7", "Spot ışığında taşlı topuklu sandalet", "A jewelled heel sandal under a spotlight"),
  redPumpsStudio: P("photo-1637002932871-13be6fd3feb8", "Gri stüdyo fonunda kırmızı stiletto çift", "A pair of red stilettos on a grey studio backdrop"),
  redPumpsLight: P("photo-1566118610717-c17c521aae30", "Gün ışığı ve gölgeler arasında kırmızı stilettolar", "Red stilettos in sunlight and shadow"),
  wingtipTop: P("photo-1543201017-a54835bbbc5d", "Gri fonda üstten kahverengi brogue çift", "Brown brogues from above on grey"),
  oxfordSpot: P("photo-1698429518320-16d2363ca09e", "Karanlıkta spot ışığında cilalı kahverengi ayakkabılar", "Polished brown shoes under a spotlight in the dark"),
  redHeelProduct: P("photo-1670607231621-c00fd76d2387", "Kırmızı rugan bilekten bağlı topuklu", "Red patent ankle-strap heel"),
  bowRed: P("photo-1760473004054-eb0fd50ea9ae", "Fiyonklu kırmızı topuklu, kırmızı fon", "Red bow heels on red"),
  strapBlack: P("photo-1784047704771-58a53faadf33", "Kırmızı etek ve bilekten bağlı siyah sandalet", "Red skirt and black ankle-strap sandals"),
  satinBW: P("photo-1792731410749-6a5a768964a7", "Siyah saten topuklular, siyah beyaz", "Black satin heels, black and white"),
  blackPumps: P("photo-1559334417-1adb87b6e97f", "Siyah sivri burun stiletto çifti", "A pair of black pointed stilettos"),
  rooftop: P("photo-1527189919029-aeb3d997547d", "Kırmızı uzun elbiseli kadın, çatı terası", "A woman in a long red dress on a rooftop"),
  menShop: P("photo-1646139498425-5bceb422ba6a", "Deri erkek ayakkabıları, loş vitrin", "Leather men's shoes in a dim display"),
  menNeon: P("photo-1549290127-7f758fdadff7", "Kahverengi deri ayakkabılar, neon ışıklar", "Brown leather shoes under neon light"),
  menCoat: P("photo-1617137977259-bb83e191f377", "Siyah paltolu adam, şehir meydanında", "A man in a black coat in a city square"),
  oxford: P("photo-1777987601431-8d27d2039cc4", "Kahverengi brogue oxford", "Brown brogue oxford"),
  derby: P("photo-1614252235316-8c857d38b5f4", "Taba deri bağcıklı ayakkabı", "Tan leather lace-up shoe"),
  loafer: P("photo-1658837407083-308b902ee99d", "Çift tokalı kahverengi loafer, çimen", "Brown double-monk loafer on grass"),
  boot: P("photo-1774868678834-e2537f930143", "Eskitilmiş deri bot ve kot paça", "Worn leather boot and denim"),
  bootDark: P("photo-1648343615199-03567050abbb", "Ahşap tezgâhta siyah deri ayakkabılar", "Black leather shoes on a wooden bench"),
  sneakerTan: P("photo-1603808033192-082d6919d3e1", "Beyaz ve ten rengi deri sneaker, turuncu fon", "White and tan leather sneaker on orange"),
  sneakerWhite: P("photo-1608384177866-0bca0d225435", "Beyaz deri sneaker, üstten", "White leather sneakers from above"),
  sneakerLight: P("photo-1780824947013-dc7e01284025", "Beyaz sneaker, açık duvar önünde", "White sneaker against a light wall"),
  kidsTeal: P("photo-1678192568478-9488ee55def6", "Turkuaz bebek ayakkabıları", "Turquoise baby shoes"),
  kidsOrange: P("photo-1780850337330-855f790f35bb", "Çimende turuncu çocuk ayakkabıları", "Orange children's shoes on grass"),
  workshop: P("photo-1477517787936-70ba786643fd", "Usta, kalıp üzerinde deri işliyor", "A craftsperson working leather on a last"),
  pattern: P("photo-1787005241178-c9006ea9610b", "Deri üzerine kalıp çizen el", "A hand tracing a pattern onto leather"),
} as const

export type PhotoKey = keyof typeof PHOTOS

export function photoUrl(key: PhotoKey, w = 1200): string {
  return `https://images.unsplash.com/${PHOTOS[key].id}?w=${w}&q=80&auto=format&fit=crop`
}

/**
 * Ürün stüdyo görselleri (DECISIONS #080). Hepsi tek şablonla üretildi: sıcak siyah fon, yansımalı zemin,
 * 3/4 yandan açı, altın kenar ışığı. Etiket gösterilmez (DECISIONS #082).
 */
export const PRODUCT_SHOTS = new Set([
  "hebe-cocuk-sneaker",
  "delphinus-cocuk-sandalet",
  "artemis-topuklu-cizme",
  "hera-bilek-bot",
  "aurea-slingback",
  "aphrodite-sandalet",
  "astra-mule",
  "selene-stiletto",
  "eos-blok-topuk",
  "olympos-dag-botu",
  "boreas-termal-bot",
  "herakles-chelsea",
  "zephyros-kosu",
  "helios-sneaker",
  "hephaistos-vulkanize",
  "adrastus-oxford",
  "castor-loafer",
  "pollux-derby",
  "iris-cirtli",
  "triton-cocuk-botu",
])

/** Ürünün stüdyo görselinin yolu; yoksa null (çizim yedeğine düşülür) */
export function productShot(handle: string | null | undefined): string | null {
  return handle && PRODUCT_SHOTS.has(handle) ? `/products/${handle}.webp` : null
}

/** Renk adı → dosya eki (ilk renk ana görseldir, eki yoktur) */
const COLOR_SLUG: Record<string, string> = {
  Lacivert: "lacivert",
  Altın: "altin",
  Gümüş: "gumus",
  Bej: "bej",
  Siyah: "siyah",
  Bordo: "bordo",
  Taba: "taba",
  Kahverengi: "kahverengi",
  "Gece Mavisi": "gece-mavisi",
  Pembe: "pembe",
}

/** Ürünlerin ikinci renk görselleri (DECISIONS #083) */
const COLOR_SHOTS: Record<string, string[]> = {
  "hebe-cocuk-sneaker": ["Lacivert"],
  "delphinus-cocuk-sandalet": ["Pembe"],
  "artemis-topuklu-cizme": ["Bordo"],
  "hera-bilek-bot": ["Taba"],
  "aurea-slingback": ["Siyah"],
  "aphrodite-sandalet": ["Bej"],
  "astra-mule": ["Siyah"],
  "selene-stiletto": ["Bordo"],
  "eos-blok-topuk": ["Taba"],
  "olympos-dag-botu": ["Siyah"],
  "herakles-chelsea": ["Taba"],
  "zephyros-kosu": ["Gece Mavisi"],
  "helios-sneaker": ["Siyah"],
  "hephaistos-vulkanize": ["Siyah"],
  "adrastus-oxford": ["Kahverengi"],
  "castor-loafer": ["Kahverengi"],
  "pollux-derby": ["Siyah"],
  "iris-cirtli": ["Pembe"],
}

export type ProductGallery = {
  /** Varsayılan (ilk renk) yan görünüm */
  main: string
  /** Üstten görünüm */
  top: string
  /** Renk → o rengin yan görünümü (ilk renk dahil) */
  byColor: Record<string, string>
}

/** Ürün galerisi: yan + üstten görünüm ve renk görselleri. `colors` ürünün Renk seçenekleri (sırası önemli). */
export function productGallery(handle: string | null | undefined, colors: string[]): ProductGallery | null {
  const main = productShot(handle)
  if (!main || !handle) return null
  const byColor: Record<string, string> = {}
  if (colors[0]) byColor[colors[0]] = main
  for (const c of COLOR_SHOTS[handle] ?? []) {
    const slug = COLOR_SLUG[c]
    if (slug && colors.includes(c)) byColor[c] = `/products/${handle}-${slug}.webp`
  }
  return { main, top: `/products/${handle}-ust.webp`, byColor }
}
