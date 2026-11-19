import { notFound } from "next/navigation"

/** Tanımsız yollar dile özel 404 sayfasına düşsün (next-intl deseni). */
export default function CatchAll() {
  notFound()
}
