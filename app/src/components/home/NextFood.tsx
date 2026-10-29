'use client'

import { Icon } from '@/components/Icon'

import { useCalendar } from './CalendarContext'

export function NextFood({ date, title, where, when }: { date: string | null; title: string; where: string; when: string }) {
  const { select } = useCalendar()
  return (
    <button className="food-row" onClick={() => date && select(date)} disabled={!date}>
      <span className="ico-lg" style={{ color: '#fff', background: 'var(--brown)' }}>
        <Icon name="food" size={16} />
      </span>
      <span className="office-row-text" style={{ gap: 2 }}>
        <span className="office-row-title">{title}</span>
        {where && <span className="office-row-sub">{where}</span>}
      </span>
      <span className="office-row-end" style={{ color: 'var(--brown-2)' }}>{when}</span>
    </button>
  )
}
