'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Icon } from '@/components/Icon'
import type { Dict } from '@/i18n/dict'

type Newcomer = { id: number; firstName: string; initials: string; jobTitle: string; avatar: string | null }

export function NewcomerCarousel({ people, t }: { people: Newcomer[]; t: Dict }) {
  const [idx, setIdx] = useState(0)
  if (people.length === 0) return null
  const multi = people.length > 1
  const p = people[idx % people.length]
  const go = (d: number) => setIdx((i) => (i + d + people.length) % people.length)

  return (
    <section className="newcomer">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="ico">
          <Icon name="rocket" size={13} />
        </span>
        <span className="newcomer-label">{multi ? t.newEmployees : t.newEmployee}</span>
        {multi && (
          <span className="dots">
            {people.map((x, i) => (
              <button key={x.id} className={`dot${i === idx ? ' active' : ''}`} onClick={() => setIdx(i)} aria-label={String(i + 1)} />
            ))}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href={`/kolega/${p.id}`} className="newcomer-person">
          <span className="avatar newcomer-avatar">{p.avatar ? <img src={p.avatar} alt="" /> : p.initials}</span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
            <span className="newcomer-hi">
              {t.hello}, {p.firstName}!
            </span>
            <span className="newcomer-role">{p.jobTitle}</span>
          </span>
        </Link>
        {multi && (
          <span style={{ display: 'flex', gap: 4, flex: '0 0 auto' }}>
            <button className="round-arrow" onClick={() => go(-1)} aria-label="‹">‹</button>
            <button className="round-arrow" onClick={() => go(1)} aria-label="›">›</button>
          </span>
        )}
      </div>
    </section>
  )
}
