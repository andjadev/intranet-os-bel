'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { Icon } from '@/components/Icon'
import type { Dict } from '@/i18n/dict'
import type { PersonLite } from '@/lib/data'
import { normalizeName } from '@/lib/dates'

const FACES = 7

function Face({ p, size }: { p: PersonLite; size: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {p.avatar ? <img src={p.avatar} alt="" /> : p.initials}
    </span>
  )
}

export function FindColleague({ people, t }: { people: PersonLite[]; t: Dict }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)

  const indexed = useMemo(
    () => people.map((p) => ({ p, words: normalizeName(`${p.name} ${p.jobTitle}`).split(/\s+/) })),
    [people],
  )
  const query = q.trim()
  const hits = useMemo(() => {
    if (query.length < 2) return []
    const nq = normalizeName(query)
    return indexed.filter(({ words }) => words.some((w) => w.startsWith(nq))).map(({ p }) => p).slice(0, 6)
  }, [indexed, query])

  const open = (id: number) => {
    setQ('')
    router.push(`/kolega/${id}`)
  }

  return (
    <section className="card search-card">
      <div className="search-head">
        <h2 className="card-title">
          <span className="ico">
            <Icon name="personSearch" size={13} />
          </span>
          {t.searchEmployee}
        </h2>
        <span className="search-count">{people.length}</span>
      </div>

      <div className="search-wrap">
        <span className="search-ico">
          <Icon name="search" size={16} />
        </span>
        <input
          className="input search-input"
          value={q}
          placeholder={t.searchPlaceholder}
          onChange={(e) => {
            setQ(e.target.value)
            setActive(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((i) => Math.min(i + 1, hits.length - 1))
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((i) => Math.max(i - 1, 0))
            }
            if (e.key === 'Enter' && hits[active]) open(hits[active].id)
            if (e.key === 'Escape') setQ('')
          }}
          aria-label={t.searchEmployee}
        />
        {q.length > 0 && (
          <button className="search-clear" onClick={() => setQ('')} title={t.clear}>
            ×
          </button>
        )}
        {hits.length > 0 && (
          <div className="suggest">
            {hits.map((p, i) => (
              <button
                key={p.id}
                className={i === active ? 'first' : undefined}
                onMouseEnter={() => setActive(i)}
                onClick={() => open(p.id)}
              >
                <Face p={p} size={30} />
                <span className="suggest-text">
                  <span className="suggest-name">{p.name}</span>
                  {p.jobTitle && <span className="suggest-role">{p.jobTitle}</span>}
                </span>
                <span className="suggest-hint">{i === active ? '↵' : ''}</span>
              </button>
            ))}
          </div>
        )}
        {query.length >= 2 && hits.length === 0 && <span className="suggest suggest-none">{t.noHits}</span>}
      </div>

      {people.length > 0 && (
        <div className="faces">
          {people.slice(0, FACES).map((p) => (
            <Link key={p.id} href={`/kolega/${p.id}`} className="face" title={p.name} aria-label={p.name}>
              <Face p={p} size={34} />
            </Link>
          ))}
          {people.length > FACES && <span className="face face-more">+{people.length - FACES}</span>}
        </div>
      )}
    </section>
  )
}
