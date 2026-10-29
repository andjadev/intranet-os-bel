import Link from 'next/link'
import { notFound } from 'next/navigation'

import { monthYearLabel } from '@/i18n/dict'
import { idOf, mediaUrl } from '@/lib/data'
import { dateKeyOf } from '@/lib/dates'
import { getDict, getLang, getPayloadClient } from '@/lib/server'

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()
  const lang = await getLang()
  const t = await getDict()
  const payload = await getPayloadClient()

  const person = await payload
    .findByID({ collection: 'users', id: Number(id), locale: lang, depth: 1, overrideAccess: true })
    .catch(() => null)
  if (!person) notFound()

  const dept = typeof person.department === 'object' ? person.department : null
  const mates = dept
    ? (
        await payload.find({
          collection: 'users',
          locale: lang,
          where: {
            and: [{ department: { equals: dept.id } }, { id: { not_equals: person.id } }, { active: { not_equals: false } }],
          },
          sort: 'name',
          depth: 1,
          limit: 50,
          overrideAccess: true,
        })
      ).docs
    : []

  const facts = [
    { label: t.email, value: person.email, href: `mailto:${person.email}` },
    { label: t.phone, value: person.phone, href: person.phone ? `tel:${person.phone.replace(/[^\d+]/g, '')}` : undefined },
    { label: t.office, value: person.office },
    { label: t.since, value: person.startDate ? monthYearLabel(dateKeyOf(person.startDate), lang) : null },
  ].filter((f) => f.value)

  const avatar = mediaUrl(person.avatar)

  return (
    <div>
      <header className="hero hero-slim">
        <Link href="/" className="back-link">
          {t.back}
        </Link>
      </header>
      <div className="profile-grid">
        <section className="card profile-main">
          <div className="profile-top">
            <div className="avatar profile-avatar">{avatar ? <img src={avatar} alt="" /> : person.initials}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
              <h1 className="profile-name">{person.name}</h1>
              {person.jobTitle && <span style={{ fontSize: 14, color: 'var(--text-2)' }}>{person.jobTitle}</span>}
              <span style={{ fontSize: 13, color: 'var(--muted-2)' }}>
                {[dept?.name, person.office].filter(Boolean).join(' · ')}
              </span>
            </div>
          </div>
          <div className="facts">
            {facts.map((f) => (
              <span key={f.label} className="fact">
                <span className="fact-label">{f.label}</span>
                {f.href ? (
                  <a className="fact-value" href={f.href}>
                    {f.value}
                  </a>
                ) : (
                  <span className="fact-value">{f.value}</span>
                )}
              </span>
            ))}
          </div>
          {(person.skills?.length ?? 0) > 0 && (
            <div className="skills">
              <span className="fact-label">{t.helpWith}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {person.skills!.map((s) => (
                  <span key={s} className="skill">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
        {mates.length > 0 && (
          <section className="card" style={{ padding: 24, gap: 14 }}>
            <h2 className="card-title">{t.sameTeam}</h2>
            {mates.map((p) => {
              const a = mediaUrl(p.avatar, 'thumb')
              return (
                <Link key={p.id} href={`/kolega/${idOf(p)}`} className="mate">
                  <span className="avatar" style={{ width: 34, height: 34, fontSize: 11 }}>
                    {a ? <img src={a} alt="" /> : p.initials}
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading)' }}>{p.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted-2)' }}>{p.jobTitle}</span>
                  </span>
                </Link>
              )
            })}
          </section>
        )}
      </div>
    </div>
  )
}
