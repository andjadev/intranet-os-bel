'use client'

import { createContext, useContext, useState } from 'react'

type Ctx = {
  today: string
  sel: string
  view: { y: number; m: number }
  select: (key: string) => void
  setView: (v: { y: number; m: number }) => void
}

const CalendarCtx = createContext<Ctx | null>(null)

export function CalendarProvider({ today, children }: { today: string; children: React.ReactNode }) {
  const [sel, setSel] = useState(today)
  const [view, setView] = useState({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 })
  const select = (key: string) => {
    setSel(key)
    setView({ y: Number(key.slice(0, 4)), m: Number(key.slice(5, 7)) - 1 })
  }
  return <CalendarCtx.Provider value={{ today, sel, view, select, setView }}>{children}</CalendarCtx.Provider>
}

export function useCalendar() {
  const ctx = useContext(CalendarCtx)
  if (!ctx) throw new Error('useCalendar outside CalendarProvider')
  return ctx
}
