import { cn } from "@/lib/utils"

/**
 * ARION imza motifi: antik vazo çizimlerindeki gibi tek çizgiyle akan yele / hareket çizgisi.
 * Şaha kalkmış at figürü KULLANILMAZ (Rapor §4). Özgün çizimdir.
 */
export function ManeMark({
  className,
  animated = false,
  strokeWidth = 3.4,
}: {
  className?: string
  animated?: boolean
  strokeWidth?: number
}) {
  const strokeClass = animated ? "draw-stroke" : undefined
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      <path
        pathLength={1}
        className={strokeClass}
        d="M6 46C19 44 29 35 35 23C39 15 47 9 58 7"
      />
      <path
        pathLength={1}
        className={strokeClass}
        d="M13 53C26 51 36 43 42 31C46 23 52 19 58 18"
      />
      <path
        pathLength={1}
        className={strokeClass}
        d="M22 58C32 57 41 51 47 41C50 35 54 31 58 30"
      />
    </svg>
  )
}
