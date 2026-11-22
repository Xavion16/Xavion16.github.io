/**
 * Ölçüm talimatı çizimi (animasyonlu SVG). Uzunluk: topuk duvara, cetvel parmak ucuna uzanır.
 * Genişlik: ön ayağın iki yan noktası arasında ölçü çizgisi. prefers-reduced-motion'da animasyon durur
 * (globals.css genel kuralı) ve çizim son haliyle görünür.
 */
export function MeasureIllustration({ kind, label }: { kind: "length" | "width"; label: string }) {
  return (
    <svg viewBox="0 0 240 300" role="img" aria-label={label} className="mx-auto h-64 w-auto">
      {/* duvar ve kâğıt */}
      <rect x="20" y="20" width="200" height="8" rx="2" className="fill-white/30" />
      <rect x="40" y="28" width="160" height="250" rx="6" className="fill-white/[0.06] stroke-white/25" strokeWidth="1.5" />
      {/* ayak silueti (stilize) */}
      <path
        d="M120 36 C 92 36 78 60 76 92 C 74 130 84 160 82 196 C 80 232 92 262 120 266 C 150 268 162 238 160 206 C 158 172 170 130 166 94 C 162 58 148 36 120 36 Z"
        className="fill-white/15 stroke-white/60"
        strokeWidth="2"
        transform={kind === "length" ? "rotate(180 120 151)" : undefined}
      />
      {kind === "length" ? (
        <>
          {/* topuk duvarda, ölçü çizgisi duvardan parmak ucuna */}
          <line x1="200" y1="30" x2="200" y2="266" className="measure-line stroke-ember" strokeWidth="3" strokeLinecap="round" />
          <line x1="190" y1="266" x2="210" y2="266" className="stroke-ember" strokeWidth="3" />
          <circle cx="120" cy="266" r="5" className="measure-pulse fill-ember" />
          <text x="206" y="150" className="fill-white text-[11px] font-semibold" transform="rotate(90 206 150)">mm</text>
        </>
      ) : (
        <>
          <line x1="78" y1="96" x2="166" y2="96" className="measure-line stroke-moss" strokeWidth="3" strokeLinecap="round" />
          <circle cx="78" cy="96" r="5" className="measure-pulse fill-moss" />
          <circle cx="166" cy="96" r="5" className="measure-pulse fill-moss" />
          <text x="112" y="88" className="fill-white text-[11px] font-semibold">mm</text>
        </>
      )}
    </svg>
  )
}
