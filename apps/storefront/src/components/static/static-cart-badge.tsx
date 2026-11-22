"use client"

import { useEffect, useState } from "react"
import { readStaticCart, STATIC_CART_EVENT } from "@/lib/static/cart"

/** Statik yayında başlıktaki sepet sayacı: tarayıcı sepetinden okunur (DECISIONS #087). */
export function StaticCartBadge() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const sync = () => setCount(readStaticCart().reduce((n, l) => n + l.quantity, 0))
    sync()
    window.addEventListener(STATIC_CART_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(STATIC_CART_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])
  if (count <= 0) return null
  return (
    <span
      aria-hidden="true"
      data-testid="cart-count"
      className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-ember px-1 text-[0.65rem] font-bold text-ink"
    >
      {count}
    </span>
  )
}
