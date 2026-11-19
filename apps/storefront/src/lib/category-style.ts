import type { CategoryKey } from "./site"

/** Kategori kartı renk geçişleri: mitten gelen palet (hız, Poseidon, Demeter, deri, çocuk). */
export const CATEGORY_GRADIENT: Record<CategoryKey, string> = {
  topuklu: "from-[#ff5a36] via-[#e0283f] to-[#5c0a24]",
  "kislik-bot": "from-[#3d7bff] via-[#2348c9] to-[#0a1446]",
  sneaker: "from-[#2bd47d] via-[#12925a] to-[#06331f]",
  klasik: "from-[#d59457] via-[#8a4f22] to-[#2c160a]",
  cocuk: "from-[#b18cff] via-[#d94f9a] to-[#4a0f3d]",
}

export function isCategoryKey(v: string | undefined | null): v is CategoryKey {
  return v === "topuklu" || v === "kislik-bot" || v === "sneaker" || v === "klasik" || v === "cocuk"
}
