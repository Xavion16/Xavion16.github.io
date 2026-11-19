import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/** shadcn/ui deseninde hap (pill) butonlar, ARION v2 token'larıyla. */
export const buttonVariants = cva(
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold tracking-tight transition-[background-color,color,transform,box-shadow] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Kor zemin üzerinde metin her zaman koyu (kontrast 6.4:1)
        primary:
          "bg-ember text-ink shadow-[0_10px_30px_-10px_rgb(255_90_54/0.7)] hover:bg-white",
        light: "bg-white text-ink hover:bg-ember",
        dark: "bg-ink text-white hover:bg-ember hover:text-ink",
        glass: "glass text-white hover:bg-white hover:text-ink",
        outline: "border border-ink/80 text-ink hover:bg-ink hover:text-white",
      },
      size: {
        md: "min-h-11 px-5 text-sm",
        lg: "min-h-13 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

export function buttonClass(
  props: ButtonVariantProps & { className?: string },
): string {
  const { className, ...variants } = props
  return cn(buttonVariants(variants), className)
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "transition-transform duration-200 group-hover/btn:translate-x-0.5",
        className,
      )}
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}
