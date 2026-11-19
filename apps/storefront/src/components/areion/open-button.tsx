"use client"

import type { ReactNode } from "react"

export const OPEN_AREION_EVENT = "arion:open-areion"

/** Sayfanın herhangi bir yerinden Areion sohbetini açar. */
export function OpenAreionButton({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_AREION_EVENT))} className={className}>
      {children}
    </button>
  )
}
