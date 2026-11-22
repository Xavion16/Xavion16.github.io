import type { CategoryKey } from "./site"

/** Kategori kartı renk geçişleri: Altın & Gümüş paleti (altın, konyak, gümüş, eski altın, bej). */
export const CATEGORY_GRADIENT: Record<CategoryKey, string> = {
  topuklu: "from-[#d9b770] via-[#7a5a1c] to-[#1a150e]",
  "kislik-bot": "from-[#8a6a46] via-[#3e2f20] to-[#110d09]",
  sneaker: "from-[#d6d8db] via-[#6b6e74] to-[#15140f]",
  klasik: "from-[#c9a253] via-[#5c4520] to-[#120e08]",
  cocuk: "from-[#e6d6b8] via-[#9c8660] to-[#1d1812]",
}

export function isCategoryKey(v: string | undefined | null): v is CategoryKey {
  return v === "topuklu" || v === "kislik-bot" || v === "sneaker" || v === "klasik" || v === "cocuk"
}
