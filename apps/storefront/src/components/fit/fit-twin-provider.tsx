"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { FitTwinProfile, FitTwinSource } from "@/lib/fit/types"

/**
 * Ayak İkizi durumu (istemci). Misafir modunda profil YALNIZCA bu sekmenin sessionStorage'ında durur:
 * sunucuya gönderilmez, sekme kapanınca silinir (Rapor §6.1 "misafir modunda hiç saklama").
 * Üye profili sunucudan (şifreli kayıttan) gelir.
 */
const GUEST_KEY = "arion_fit_twin_guest"

type Ctx = {
  profile: FitTwinProfile | null
  source: FitTwinSource | null
  isMember: boolean
  setGuestProfile: (p: FitTwinProfile) => void
  clearGuestProfile: () => void
  setMemberProfile: (p: FitTwinProfile | null) => void
}

const FitTwinContext = createContext<Ctx | null>(null)

function readGuest(): FitTwinProfile | null {
  try {
    const raw = window.sessionStorage.getItem(GUEST_KEY)
    return raw ? (JSON.parse(raw) as FitTwinProfile) : null
  } catch {
    return null
  }
}

export function FitTwinProvider({
  initialMember,
  isMember,
  children,
}: {
  initialMember: FitTwinProfile | null
  isMember: boolean
  children: ReactNode
}) {
  const [member, setMember] = useState<FitTwinProfile | null>(initialMember)
  const [guest, setGuest] = useState<FitTwinProfile | null>(null)

  // Sunucudan yeni üye profili gelirse (kayıt/silme sonrası yenileme) yerel durumu eşitle
  const [prevInitial, setPrevInitial] = useState(initialMember)
  if (prevInitial !== initialMember) {
    setPrevInitial(initialMember)
    setMember(initialMember)
  }
  useEffect(() => {
    // sessionStorage yalnızca istemcide okunabilir (hidrasyon sonrası)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuest(readGuest())
  }, [])

  const setGuestProfile = useCallback((p: FitTwinProfile) => {
    setGuest(p)
    try {
      window.sessionStorage.setItem(GUEST_KEY, JSON.stringify(p))
    } catch {
      /* gizli pencere: yalnızca bellekte kalır */
    }
  }, [])

  const clearGuestProfile = useCallback(() => {
    setGuest(null)
    try {
      window.sessionStorage.removeItem(GUEST_KEY)
    } catch {
      /* yok sayılır */
    }
  }, [])

  const value = useMemo<Ctx>(() => {
    const profile = member ?? guest
    return {
      profile,
      source: member ? "member" : guest ? "guest" : null,
      isMember,
      setGuestProfile,
      clearGuestProfile,
      setMemberProfile: setMember,
    }
  }, [member, guest, isMember, setGuestProfile, clearGuestProfile])

  return <FitTwinContext.Provider value={value}>{children}</FitTwinContext.Provider>
}

export function useFitTwin(): Ctx {
  const ctx = useContext(FitTwinContext)
  if (!ctx) throw new Error("useFitTwin, FitTwinProvider içinde kullanılmalı")
  return ctx
}
