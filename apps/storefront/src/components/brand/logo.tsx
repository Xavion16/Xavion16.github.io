import { cn } from "@/lib/utils"
import { ManeMark } from "./mane-mark"

/** Yele çizgisi + kalın, geniş ARION yazısı. Tamamı büyük harf, Türkçe karakter yok (Rapor §1.2). */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-white", className)}>
      <ManeMark className="size-7 text-ember" strokeWidth={4.2} />
      <span
        className="text-xl font-black tracking-[0.12em]"
        style={{ fontStretch: "125%", fontVariationSettings: '"wdth" 125' }}
      >
        ARION
      </span>
    </span>
  )
}
