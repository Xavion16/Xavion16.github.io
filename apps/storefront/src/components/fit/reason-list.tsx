"use client"

import type { Reason } from "@arion/fit-engine"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

/** Uyum motorunun gerekçe kodlarını okunur cümleye çevirir (teşhis dili yok; yalnızca ölçü farkı). */
export function ReasonList({ reasons, className }: { reasons: Reason[]; className?: string }) {
  const t = useTranslations("fit.reasons")
  return (
    <ul className={cn("space-y-2 text-sm leading-relaxed", className)}>
      {reasons.map((r, i) => {
        const text =
          r.code === "length_short" || r.code === "length_long" || r.code === "girth_tight" || r.code === "extra_sock"
            ? t(r.code, { mm: r.mm })
            : r.code === "width_narrow" || r.code === "width_wide"
              ? t(r.code, { mm: r.mm, suggest: r.suggest ?? "none" })
              : r.code === "preference"
                ? t("preference", { preference: r.preference })
                : t(r.code)
        const warn = r.code === "no_good_size" || r.code === "length_short"
        return (
          <li key={`${r.code}-${i}`} className="flex gap-2">
            <span aria-hidden="true" className={cn("mt-2 size-1.5 shrink-0 rounded-full", warn ? "bg-ember" : "bg-moss")} />
            <span>{text}</span>
          </li>
        )
      })}
    </ul>
  )
}
