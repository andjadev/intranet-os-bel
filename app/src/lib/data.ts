import 'server-only'

import { TYPE_LABELS } from '../i18n/dict'
import type { Document, Media, RecCategory, User } from '../payload-types'
import type { EventType, Lang } from './constants'
import { addDays, dateKeyOf } from './dates'
import { getPayloadClient } from './server'

export type CalEvent = { date: string; type: EventType; time: string; title: string; who: string }
export type PersonLite = { id: number; name: string; initials: string; jobTitle: string; avatar: string | null }
export type PollData = {
  id: number
  question: string
  until: string | null
  options: { id: string; label: string }[]
  counts: Record<string, number>
  mine: string | null
}

export const idOf = (v: unknown): number | null =>
  v == null ? null : typeof v === 'object' ? ((v as { id?: number }).id ?? null) : (v as number)

export function mediaUrl(m: unknown, size: 'thumb' | null = null): string | null {
  if (!m || typeof m !== 'object') return null
  const media = m as Media
  return (size && media.sizes?.[size]?.url) || media.url || null
}

/** Where a useful-info entry points: its uploaded file (needs depth >= 1), else its link. */
export function linkHref(l: { url?: string | null; file?: number | Document | null }): string {
  return (typeof l.file === 'object' && l.file?.url) || l.url || '#'
}
/** Files and outside links open in a new tab. */
export const opensNewTab = (href: string) => /^https?:/.test(href) || href.startsWith('/api/')

export const personLite = (u: User): PersonLite => ({
  id: u.id,
  name: u.name,
  initials: u.initials || '',
  jobTitle: u.jobTitle || '',
  avatar: mediaUrl(u.avatar, 'thumb'),
})

/** Years ahead the calendar can be browsed; birthdays and slavas repeat in each of them. */
const CALENDAR_YEARS_AHEAD = 5

/** Calendar entries around today, plus yearly birthdays and slavas from colleague profiles. */
export async function loadCalendar(lang: Lang, today: string): Promise<CalEvent[]> {
  const payload = await getPayloadClient()
  const year = Number(today.slice(0, 4))
  const from = addDays(today, -120)
  const to = `${year + CALENDAR_YEARS_AHEAD}-12-31`
  const [events, people] = await Promise.all([
    payload.find({
      collection: 'events',
      locale: lang,
      where: { and: [{ date: { greater_than_equal: `${from}T00:00:00.000Z` } }, { date: { less_than_equal: `${to}T23:59:59.999Z` } }] },
      pagination: false,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'users',
      where: {
        and: [{ or: [{ birthday: { exists: true } }, { slavaDate: { exists: true } }] }, { active: { not_equals: false } }],
      },
      pagination: false,
      depth: 0,
      overrideAccess: true,
      select: { name: true, birthday: true, slavaName: true, slavaDate: true },
    }),
  ])

  const out: CalEvent[] = events.docs.map((e) => ({
    date: dateKeyOf(e.date),
    type: e.type as EventType,
    time: e.time || '',
    title: e.title,
    who: e.description || '',
  }))

  const yearly = (iso: string, type: 'bday' | 'slava', title: string, who: string) => {
    const md = dateKeyOf(iso).slice(5)
    for (let y = year - 1; y <= year + CALENDAR_YEARS_AHEAD; y++) {
      const key = `${y}-${md}`
      if (key >= from && key <= to) out.push({ date: key, type, time: '', title, who })
    }
  }
  for (const p of people.docs) {
    if (p.birthday) yearly(p.birthday, 'bday', p.name, TYPE_LABELS.bday[lang])
    if (p.slavaDate) yearly(p.slavaDate, 'slava', p.name, [TYPE_LABELS.slava[lang], p.slavaName].filter(Boolean).join(' · '))
  }
  return out
}

export async function loadDirectory(lang: Lang): Promise<PersonLite[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'users',
    locale: lang,
    where: { active: { not_equals: false } },
    sort: 'name',
    pagination: false,
    depth: 1,
    overrideAccess: true,
  })
  return res.docs.map(personLite)
}

export async function loadActivePoll(lang: Lang, userId: number): Promise<PollData | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'polls',
    locale: lang,
    where: { active: { equals: true } },
    sort: '-createdAt',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const poll = res.docs[0]
  if (!poll) return null
  const { counts, mine } = await pollCounts(poll.id, userId)
  return {
    id: poll.id,
    question: poll.question,
    until: poll.until ? dateKeyOf(poll.until) : null,
    options: (poll.options ?? []).map((o) => ({ id: o.id!, label: o.label })),
    counts,
    mine,
  }
}

export async function pollCounts(pollId: number, userId: number) {
  const payload = await getPayloadClient()
  const votes = await payload.find({
    collection: 'poll-votes',
    where: { poll: { equals: pollId } },
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  const counts: Record<string, number> = {}
  let mine: string | null = null
  for (const v of votes.docs) {
    counts[v.option] = (counts[v.option] ?? 0) + 1
    if (idOf(v.user) === userId) mine = v.option
  }
  return { counts, mine }
}

export async function loadRecCategories(lang: Lang): Promise<RecCategory[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'rec-categories', locale: lang, sort: 'order', pagination: false, depth: 0, overrideAccess: true })
  return res.docs
}

export async function loadSettings(lang: Lang) {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', locale: lang, depth: 0, overrideAccess: true })
}

/** "2 h" / "pre 2 h" style relative time used on posts. */
export function timeAgo(iso: string, t: { now: string; timeAgoMin: string; timeAgoH: string; timeAgoD: string }) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return t.now
  if (mins < 60) return t.timeAgoMin.replace('{n}', String(mins))
  const h = Math.round(mins / 60)
  if (h < 24) return t.timeAgoH.replace('{n}', String(h))
  return t.timeAgoD.replace('{n}', String(Math.round(h / 24)))
}
