import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Kadife Gece butonları (DECISIONS #077): köşeli (2 px), küçük büyük harf, ölçülü harf aralığı.
 * Parlama gölgesi, basınca küçülme ve ok ikonu yok; hiyerarşiyi dolgu / çizgi ayrımı taşır.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[2px] font-sans font-medium uppercase tracking-[0.14em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Gül zemin üzerinde metin her zaman koyu (CLAUDE.md)
        primary: "bg-ember text-ink hover:bg-chalk",
        light: "bg-chalk text-ink hover:bg-ember",
        dark: "bg-ink text-chalk hover:bg-ember hover:text-ink",
        // Eski "glass" hap: ince çizgili ikincil buton
        glass: "btn-glass border border-chalk/40 text-chalk hover:border-chalk hover:bg-chalk hover:text-ink",
        outline: "border border-ink/80 text-ink hover:bg-ink hover:text-chalk",
      },
      size: {
        md: "min-h-11 px-6 text-[0.72rem]",
        lg: "min-h-13 px-8 text-[0.78rem]",
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
