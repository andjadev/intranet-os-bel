'use client'

import { useMemo } from 'react'

import { Icon } from '@/components/Icon'
import type { Dict } from '@/i18n/dict'
import { longDayLabel, MONTHS, TYPE_LABELS, WDAYS } from '@/i18n/dict'
import { EVENT_TYPES, TYPE_COLORS, type EventType, type Lang } from '@/lib/constants'
import type { CalEvent } from '@/lib/data'
import { ymd } from '@/lib/dates'

import { useCalendar } from './CalendarContext'

const byTime = (a: CalEvent, b: CalEvent) => (a.time || '99:99').localeCompare(b.time || '99:99')

export function TypeIcon({ type }: { type: EventType }) {
  const [fg, bg] = TYPE_COLORS[type]
  return (
    <span className="type-ico" style={{ color: fg, background: bg }}>
      <Icon name={type} size={10} stroke={1.7} />
    </span>
  )
}

export function CalendarPeek({ events, lang, t }: { events: CalEvent[]; lang: Lang; t: Dict }) {
  const { today, sel, view, select, setView } = useCalendar()
  const { y, m } = view

  const byDate = useMemo(() => {
    const map = new Map<string, CalEvent[]>()
    for (const e of events) map.set(e.date, [...(map.get(e.date) ?? []), e])
    for (const list of map.values()) list.sort(byTime)
    return map
  }, [events])

  const todayD = new Date(today + 'T00:00:00')
  const weekStart = ymd(new Date(todayD.getFullYear(), todayD.getMonth(), todayD.getDate() - ((todayD.getDay() + 6) % 7)))

  const first = new Date(y, m, 1)
  const last = new Date(y, m + 1, 0)
  const start = new Date(y, m, 1 - ((first.getDay() + 6) % 7))
  const weeks: { key: string; current: boolean; days: Date[] }[] = []
  for (let r = 0; r < 6; r++) {
    const ws = new Date(start.getFullYear(), start.getMonth(), start.getDate() + r * 7)
    if (ws > last) break
    weeks.push({
      key: ymd(ws),
      current: ymd(ws) === weekStart,
      days: Array.from({ length: 7 }, (_, i) => new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + i)),
    })
  }

  const shift = (n: number) => {
    const d = new Date(y, m + n, 1)
    setView({ y: d.getFullYear(), m: d.getMonth() })
  }
  const monthName = MONTHS[lang][m]
  const monthLabel = (lang === 'sr' ? monthName.charAt(0).toUpperCase() + monthName.slice(1) : monthName) + ' ' + y

  const selEvents = byDate.get(sel) ?? []
  // Untimed (all-day) events sort last, per README.
  const perRow = Math.min(Math.max(selEvents.length, 1), 4)

  return (
    <section className="card cal">
      <div className="cal-head">
        <h2 className="cal-title">{t.weekTitle}</h2>
        <div className="cal-nav">
          <button className="cal-arrow" onClick={() => shift(-1)} aria-label="‹">‹</button>
          <span className="cal-month">{monthLabel}</span>
          <button className="cal-arrow" onClick={() => shift(1)} aria-label="›">›</button>
          <button className="cal-today" onClick={() => select(today)}>{t.today}</button>
        </div>
      </div>

      <div className="legend">
        {EVENT_TYPES.map((k) => (
          <span key={k}>
            <TypeIcon type={k} />
            {TYPE_LABELS[k][lang]}
          </span>
        ))}
        <span>
          <span className="legend-week" />
          {t.thisWeek}
        </span>
      </div>

      <div className="cal-grid">
        <div className="cal-row">
          {WDAYS[lang].map((wd) => (
            <span key={wd} className="cal-wd">{wd}</span>
          ))}
        </div>
        {weeks.map((w) => (
          <div key={w.key} className={`cal-row${w.current ? ' current' : ''}`}>
            {w.days.map((d, i) => {
              const key = ymd(d)
              const evs = byDate.get(key) ?? []
              const cls = [
                'cal-day',
                i > 4 && 'wknd',
                key < today && 'past',
                key === sel && 'sel',
                d.getMonth() !== m && 'out',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button key={key} className={cls} onClick={() => select(key)}>
                  <span className={`cal-num${key === today ? ' today' : ''}`}>{d.getDate()}</span>
                  {evs.slice(0, 1).map((e, j) => (
                    <span key={j} className="cal-item">
                      <TypeIcon type={e.type} />
                      <span className="cal-item-text">{e.title}</span>
                    </span>
                  ))}
                  {evs.length > 1 && <span className="cal-more">+{evs.length - 1}</span>}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="day-detail">
        <span className="label-caps">
          {sel === today ? `${t.today} · ` : ''}
          {longDayLabel(sel, lang)}
        </span>
        {selEvents.length > 0 ? (
          <div className="day-cards">
            {selEvents.map((e, i) => (
              <span key={i} className="day-card" style={{ flex: `1 1 calc(${100 / perRow}% - 8px)` }}>
                <TypeIcon type={e.type} />
                <span className="day-card-body">
                  <span className="day-card-time">{e.time || t.allDay}</span>
                  <span className="day-card-title">{e.title}</span>
                  <span className="day-card-who">{e.who || TYPE_LABELS[e.type][lang]}</span>
                </span>
              </span>
            ))}
          </div>
        ) : (
          <span className="empty">{t.nothing}</span>
        )}
      </div>
    </section>
  )
}
