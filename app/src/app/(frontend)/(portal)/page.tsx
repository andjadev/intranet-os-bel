import Link from 'next/link'

import { getChat } from '@/app/(frontend)/actions'
import { Icon } from '@/components/Icon'
import { PollBox } from '@/components/PollBox'
import { CalendarProvider } from '@/components/home/CalendarContext'
import { CalendarPeek } from '@/components/home/CalendarPeek'
import { ChatCard } from '@/components/home/ChatCard'
import { FindColleague } from '@/components/home/FindColleague'
import { NewcomerCarousel } from '@/components/home/NewcomerCarousel'
import { NextFood } from '@/components/home/NextFood'
import { longDayLabel, shortDateLabel, WDAYS_LONG } from '@/i18n/dict'
import { themeColor, TILE_STYLES, type TileStyle } from '@/lib/constants'
import { linkHref, loadActivePoll, loadCalendar, loadDirectory, loadRecCategories, loadSettings, mediaUrl, opensNewTab } from '@/lib/data'
import { daysBetween, todayKey } from '@/lib/dates'
import { getDict, getLang, getPayloadClient, requireUser } from '@/lib/server'

export default async function HomePage() {
  const user = await requireUser()
  const lang = await getLang()
  const t = await getDict()
  const payload = await getPayloadClient()
  const today = todayKey()

  const [settings, events, directory, newcomers, tiles, linkCats, linkCatIds, adsCount, albums, cats, poll, chat] = await Promise.all([
    loadSettings(lang),
    loadCalendar(lang, today),
    loadDirectory(lang),
    payload.find({
      collection: 'users',
      locale: lang,
      where: { and: [{ isNewcomer: { equals: true } }, { active: { not_equals: false } }] },
      depth: 1,
      limit: 10,
      overrideAccess: true,
    }),
    payload.find({ collection: 'links', locale: lang, where: { tile: { exists: true } }, sort: 'order', limit: 4, depth: 1, overrideAccess: true }),
    payload.find({ collection: 'link-categories', locale: lang, sort: 'order', pagination: false, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'links', pagination: false, depth: 0, overrideAccess: true, select: { category: true } }),
    payload.count({ collection: 'classifieds', overrideAccess: true }),
    payload.find({ collection: 'albums', locale: lang, sort: 'order', limit: 50, depth: 0, overrideAccess: true, select: { name: true } }),
    loadRecCategories(lang),
    loadActivePoll(lang, user.id),
    getChat(),
  ])

  // Category shortcuts under the tiles; empty categories are not shown on /linkovi either.
  const usedCats = new Set(linkCatIds.docs.map((l) => l.category))
  const usefulCats = linkCats.docs.filter((c) => usedCats.has(c.id))

  // Next food in the office: first `food` event after today (README section 5).
  const food = events.filter((e) => e.type === 'food' && e.date > today).sort((a, b) => a.date.localeCompare(b.date))[0]
  const foodWhen = food
    ? (daysBetween(today, food.date) === 1
        ? t.tomorrow
        : `${WDAYS_LONG[lang][(new Date(food.date + 'T00:00:00').getDay() + 6) % 7]}, ${new Date(food.date + 'T00:00:00').getDate()}.`) +
      (food.time ? ` · ${food.time}` : '')
    : ''

  const recCards = await Promise.all(
    cats.map(async (c) => {
      const latest = await payload.find({
        collection: 'rec-posts',
        where: { category: { equals: c.id } },
        sort: '-createdAt',
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      return { ...c, count: latest.totalDocs, latest: latest.docs[0]?.title ?? '' }
    }),
  )

  const handymanTel = (settings.handymanPhone || '').replace(/[^\d+]/g, '')

  return (
    <CalendarProvider today={today}>
      <div className="home">
        <header className="hero hero-home">
          <div className="home-head">
            <div>
              <p className="home-date">{longDayLabel(today, lang)}</p>
              <h1 className="home-h1">{settings.homeTitle || t.homeTitle}</h1>
            </div>
            <p className="home-sub">{settings.homeSubtitle || t.homeSub}</p>
          </div>
        </header>

        <div className="top-row">
          <CalendarPeek events={events} lang={lang} t={t} />

          <div className="right-col">
            {settings.showNewcomers !== false && (
              <NewcomerCarousel
                t={t}
                people={newcomers.docs.map((p) => ({
                  id: p.id,
                  firstName: p.firstName || p.name.split(' ')[0],
                  initials: p.initials || '',
                  jobTitle: p.jobTitle || '',
                  avatar: mediaUrl(p.avatar, 'thumb'),
                }))}
              />
            )}

            <FindColleague t={t} people={directory} />

            <section className="card useful-card">
              <div className="row-between">
                <h2 className="card-title">
                  <span className="ico">
                    <Icon name="info" size={13} />
                  </span>
                  {t.usefulTitle}
                </h2>
                <Link href="/linkovi" className="link-more">
                  {t.allLinks} →
                </Link>
              </div>
              <div className="tiles">
                {tiles.docs.map((l) => {
                  const s = TILE_STYLES[(l.tile as TileStyle) || 'navy']
                  const href = linkHref(l)
                  return (
                    <a
                      key={l.id}
                      href={href}
                      className="tile"
                      style={{ background: s.bg, color: s.fg }}
                      {...(opensNewTab(href) ? { target: '_blank', rel: 'noreferrer' } : {})}
                    >
                      <span className="tile-ico">
                        <Icon name={l.icon || 'doc'} size={16} stroke={1.5} />
                      </span>
                      <span className="tile-title">{l.title}</span>
                    </a>
                  )
                })}
              </div>
              {usefulCats.length > 0 && (
                <div className="useful-cats">
                  {usefulCats.map((c) => (
                    <Link key={c.id} href={`/linkovi#kategorija-${c.id}`} className="useful-cat">
                      <Icon name={c.icon || 'folder'} size={13} />
                      {c.title}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="bottom-row">
          <section className="card">
            <h2 className="card-title">
              <span className="ico">
                <Icon name="home" size={13} />
              </span>
              {t.officeTitle}
            </h2>
            <div className="office-rows">
              <NextFood
                date={food?.date ?? null}
                title={food ? food.title : t.foodNone}
                where={food?.who ?? ''}
                when={foodWhen}
              />
              <Link href="/oglasi" className="office-row">
                <span className="ico-lg" style={{ color: 'var(--navy)', background: 'var(--blue-5)' }}>
                  <Icon name="tag" size={16} />
                </span>
                <span className="office-row-text">
                  <span className="office-row-title">{t.adsTitle}</span>
                  <span className="chips">
                    {[t.adSell, t.adBuy, t.adGive].map((c) => (
                      <span key={c} className="chip" style={{ color: 'var(--text-blue)', background: 'var(--blue-8)' }}>
                        {c}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="office-row-end">{adsCount.totalDocs} ›</span>
              </Link>
              <Link href="/galerija" className="office-row">
                <span className="ico-lg" style={{ color: 'var(--green)', background: 'var(--green-2)' }}>
                  <Icon name="image" size={16} />
                </span>
                <span className="office-row-text">
                  <span className="office-row-title">{t.galTitle}</span>
                  <span className="chips">
                    {albums.docs.slice(0, 3).map((a) => (
                      <span key={a.id} className="chip" style={{ color: 'var(--green)', background: 'var(--green-3)' }}>
                        {a.name}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="office-row-end">{albums.totalDocs} ›</span>
              </Link>
              {settings.handymanPhone && (
                <a href={`tel:${handymanTel}`} className="office-row">
                  <span className="ico-lg" style={{ color: 'var(--brown)', background: 'var(--sand-2)' }}>
                    <Icon name="wrench" size={16} />
                  </span>
                  <span className="office-row-text" style={{ gap: 2 }}>
                    <span className="office-row-title">{settings.handymanName || t.handyman}</span>
                    <span className="office-row-sub">{settings.handymanDescription || t.handymanSub}</span>
                  </span>
                  <span className="office-row-end">{settings.handymanPhone}</span>
                </a>
              )}
              {settings.parkingNote && (
                <div className="office-row parking-row">
                  <span className="ico-lg" style={{ color: 'var(--navy)', background: 'var(--blue-5)' }}>
                    <Icon name="parking" size={16} />
                  </span>
                  <span className="office-row-text" style={{ gap: 2 }}>
                    <span className="office-row-title">{t.parking}</span>
                    <span className="parking-note">{settings.parkingNote}</span>
                  </span>
                </div>
              )}
            </div>
          </section>

          <ChatCard initial={chat} subtitle={settings.chatSubtitle || t.teamsSub} teamsUrl={settings.teamsUrl || ''} t={t} />

          <section className="card">
            <div className="row-between">
              <h2 className="card-title">
                <span className="ico">
                  <Icon name="star" size={13} />
                </span>
                {t.recsTitle}
              </h2>
              <Link href="/preporuke" className="link-more" style={{ fontWeight: 600 }}>
                {t.more} →
              </Link>
            </div>
            <div className="rec-grid">
              {recCards.map((c) => (
                <Link key={c.id} href={`/preporuke/${c.slug}`} className="rec-cat">
                  <span className="row-between" style={{ gap: 6 }}>
                    <span className="rec-cat-ico" style={{ color: c.fg ? themeColor(c.fg) : undefined, background: c.bg ? themeColor(c.bg) : undefined }}>
                      <Icon name={c.icon || 'culture'} size={15} />
                    </span>
                    <span className="rec-cat-count">
                      {c.count} {t.posts}
                    </span>
                  </span>
                  <span className="rec-cat-name">{c.label}</span>
                  <span className="rec-cat-subs">{(c.subs ?? []).map((s) => s.label).join(' · ')}</span>
                  {c.latest && <span className="rec-cat-latest">{c.latest}</span>}
                </Link>
              ))}
              {poll && (
                <PollBox
                  poll={poll}
                  labels={{ votes: t.votes, poll: t.poll, until: poll.until ? t.pollUntil.replace('{d}', shortDateLabel(poll.until, lang)) : null }}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </CalendarProvider>
  )
}
