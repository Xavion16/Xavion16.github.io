import type { CategoryKey } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * Kategori siluetleri — teknik çizim (yan görünüş), özgün ve basitleştirilmiş.
 * Renk currentColor'dan gelir; kesikli çizgiler kategoriye özgü mühendislik unsurudur
 * (şank, welt dikişi, esneme hattı…). Dekoratiftir; anlam metinde verilir.
 */
const DRAWINGS: Record<CategoryKey, React.ReactNode> = {
  topuklu: (
    <>
      <path d="M18 96C16 86 26 81 40 79C62 75 86 67 106 58C126 50 152 46 176 40C190 36 202 39 204 48L200 66L198 106H189L185 72C158 77 118 93 72 98C50 100 26 100 18 96Z" />
      <path className="tech" d="M185 73C152 80 112 93 72 98" />
      <path className="dim" d="M218 66V106M214 66H222M214 106H222" />
      <path className="tech" d="M196 58L120 92" />
      <circle className="dot" cx="196" cy="58" r="3" />
    </>
  ),
  "kislik-bot": (
    <>
      <path d="M20 104V93C20 85 30 79 46 77L96 71C110 69 116 61 118 51L120 14H196L198 60C200 70 204 80 206 92V104Z" />
      <path className="tech" d="M22 94H205" />
      <path d="M20 104H206" />
      <path className="thin" d="M30 104V110M48 104V110M66 104V110M84 104V110M102 104V110M120 104V110M138 104V110M156 104V110M174 104V110M192 104V110" />
      <path className="thin" d="M126 22H190M126 34H190" />
      <path className="tech" d="M128 18L130 66C131 76 120 84 104 84L50 88" />
    </>
  ),
  sneaker: (
    <>
      <path d="M16 98C16 86 26 80 44 78C70 74 90 64 108 52L140 40C156 34 176 34 190 40C202 46 208 58 210 72L212 98Z" />
      <path d="M16 90C80 90 150 88 212 86" />
      <path className="thin" d="M104 56L112 66M116 50L124 60M128 45L136 55M140 41L148 51" />
      <path className="tech" d="M64 72V100" />
      <path className="dim" d="M222 72V98M218 72H226M218 98H226" />
    </>
  ),
  klasik: (
    <>
      <path d="M14 96C14 88 26 82 46 80C80 76 100 70 120 60C140 52 170 52 194 56C204 58 208 66 208 80V96Z" />
      <path d="M14 96H208V100H14Z" />
      <path d="M176 100H208V108H176Z" />
      <path className="tech" d="M18 93H205" />
      <path className="thin" d="M96 72C108 70 118 64 126 58M120 60L150 74" />
    </>
  ),
  cocuk: (
    <>
      <path d="M30 98C28 80 46 70 70 68C96 66 110 56 126 52C150 46 180 50 190 64C196 74 196 88 194 98Z" />
      <path d="M30 98H194" />
      <rect className="thin" x="106" y="58" width="44" height="10" rx="5" transform="rotate(-14 128 63)" />
      <rect className="thin" x="122" y="74" width="48" height="10" rx="5" transform="rotate(-8 146 79)" />
      <path className="dim" d="M14 74V98M10 74H18M10 98H18" />
      <path className="tech" d="M30 96C32 86 36 80 44 76" />
    </>
  ),
}

export function ShoeDrawing({
  category,
  className,
}: {
  category: CategoryKey
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 240 120"
      fill="none"
      className={cn(
        "[&_path]:stroke-current [&_path]:[stroke-width:2.2] [&_path]:[stroke-linejoin:round] [&_path]:[stroke-linecap:round] [&_rect]:stroke-current [&_rect]:[stroke-width:1.4]",
        "[&_.thin]:[stroke-width:1.4] [&_.dim]:[stroke-width:1.2] [&_.dim]:opacity-60",
        "[&_.tech]:[stroke-dasharray:5_4] [&_.tech]:[stroke-width:1.6] [&_.tech]:opacity-75",
        "[&_.dot]:fill-current",
        className,
      )}
      aria-hidden="true"
      focusable="false"
    >
      {DRAWINGS[category]}
    </svg>
  )
}
