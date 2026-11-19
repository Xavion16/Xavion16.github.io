import { cn } from "@/lib/utils"

/** 0–100 uyum skoru göstergesi (koyu zemin). Sayı metin olarak da okunur (role="img" + aria-label). */
export function ScoreDial({
  score,
  label,
  className,
}: {
  score: number
  label: string
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  const r = 52
  const c = 2 * Math.PI * r
  const dash = (clamped / 100) * c

  return (
    <svg
      viewBox="0 0 128 128"
      role="img"
      aria-label={`${label}: ${clamped}/100`}
      className={cn("size-32", className)}
    >
      <defs>
        <linearGradient id="score-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-moss)" />
          <stop offset="1" stopColor="var(--color-tide)" />
        </linearGradient>
      </defs>
      <circle cx="64" cy="64" r={r} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="8" />
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke="url(#score-grad)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 64 64)"
      />
      <text
        x="64"
        y="72"
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="38"
        fontWeight="800"
        fill="#fff"
      >
        {clamped}
      </text>
      <text
        x="64"
        y="90"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fill="var(--color-smoke)"
      >
        /100
      </text>
    </svg>
  )
}
