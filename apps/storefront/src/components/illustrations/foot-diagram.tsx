import { cn } from "@/lib/utils"

/**
 * Ayak İkizi şeması: üstten ayak izi + uzunluk ve ön ayak genişliği ölçü okları.
 * Değerler örnektir (DEMO). Anlamı yakındaki metin verir; şekil dekoratiftir.
 */
export function FootDiagram({
  className,
  lengthLabel = "268 mm",
  widthLabel = "101 mm",
}: {
  className?: string
  lengthLabel?: string
  widthLabel?: string
}) {
  return (
    <svg
      viewBox="0 0 260 440"
      fill="none"
      className={cn("text-ink", className)}
      aria-hidden="true"
      focusable="false"
    >
      {/* Taban */}
      <path
        d="M98 404C66 404 50 384 50 352C50 314 62 286 60 250C58 214 44 190 44 150C44 104 66 76 104 74C140 72 160 98 160 142C160 184 150 214 148 250C146 290 150 320 148 352C146 386 128 404 98 404Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Parmaklar */}
      <g stroke="currentColor" strokeWidth="1.6">
        <ellipse cx="140" cy="46" rx="15" ry="21" />
        <ellipse cx="111" cy="38" rx="9.5" ry="13" />
        <ellipse cx="88" cy="42" rx="8.5" ry="11.5" />
        <ellipse cx="68" cy="52" rx="7.5" ry="10" />
        <ellipse cx="52" cy="67" rx="6.5" ry="8.5" />
      </g>
      {/* Kemer bölgesi (iç kısım) */}
      <path
        d="M146 214C138 236 138 266 146 290"
        stroke="var(--color-moss)"
        strokeWidth="1.3"
        strokeDasharray="4 3"
      />
      {/* Uzunluk ölçüsü */}
      <g stroke="var(--color-ember)" strokeWidth="1.2">
        <path d="M196 24V404" />
        <path d="M188 24H204M188 404H204" />
        <path d="M196 24L191 34M196 24L201 34M196 404L191 394M196 404L201 394" />
        <path d="M160 24H186M150 404H186" strokeDasharray="2 3" />
      </g>
      <text
        x="208"
        y="218"
        fill="var(--color-ember)"
        fontFamily="var(--font-mono)"
        fontSize="13"
        transform="rotate(90 208 218)"
        textAnchor="middle"
      >
        L {lengthLabel}
      </text>
      {/* Ön ayak genişliği */}
      <g stroke="var(--color-moss)" strokeWidth="1.2">
        <path d="M42 132H162" />
        <path d="M42 124V140M162 124V140" />
        <path d="M42 132L52 127M42 132L52 137M162 132L152 127M162 132L152 137" />
      </g>
      <text
        x="102"
        y="122"
        fill="var(--color-moss)"
        fontFamily="var(--font-mono)"
        fontSize="13"
        textAnchor="middle"
      >
        W {widthLabel}
      </text>
    </svg>
  )
}
