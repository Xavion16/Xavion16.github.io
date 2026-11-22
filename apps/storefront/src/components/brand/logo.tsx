import { cn } from "@/lib/utils"
import { ManeMark } from "./mane-mark"

/** Yele çizgisi + Bodoni Moda, geniş harf aralıklı ARION. Tamamı büyük harf, Türkçe karakter yok (Rapor §1.2). */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-white", className)}>
      <ManeMark className="size-7 text-ember" strokeWidth={4.2} />
      <span className="font-display text-xl font-bold tracking-[0.2em] sm:tracking-[0.32em]">
        ARION
      </span>
    </span>
  )
}
