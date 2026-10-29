import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Icon } from '@/components/Icon'
import { PollBox } from '@/components/PollBox'
import { NewPostForm, PostCard } from '@/components/RecPosts'
import { shortDateLabel } from '@/i18n/dict'
import { idOf, loadActivePoll, loadRecCategories, mediaUrl, timeAgo } from '@/lib/data'
import { solidColor, themeColor } from '@/lib/constants'
import { getDict, getLang, getPayloadClient, requireUser, shortName } from '@/lib/server'

const POLL_SLUG = 'anketa'
const POLL_COLORS = { fg: '#003768', bg: '#E8EEF2' }

export default async function RecsPage({
  params,
  searchParams,
}: {
  params: Promise<{ kategorija: string }>
  searchParams: Promise<{ sub?: string }>
}) {
  const { kategorija } = await params
  const { sub } = await searchParams
  const user = await requireUser()
  const lang = await getLang()
  const t = await getDict()
  const payload = await getPayloadClient()

  const cats = await loadRecCategories(lang)
  const isPoll = kategorija === POLL_SLUG
  const cat = cats.find((c) => c.slug === kategorija)
  if (!cat && !isPoll) notFound()

  const tabs = [
    ...cats.map((c) => ({ slug: c.slug, label: c.label, icon: c.icon || 'culture', fg: c.fg || '#003768', bg: c.bg || '#E8EEF2' })),
    { slug: POLL_SLUG, label: t.poll, icon: 'poll', ...POLL_COLORS },
  ]

  const poll = isPoll ? await loadActivePoll(lang, user.id) : null

  const posts = cat
    ? await payload.find({
        collection: 'rec-posts',
        where: { and: [{ category: { equals: cat.id } }, ...(sub ? [{ sub: { equals: sub } }] : [])] },
        sort: '-createdAt',
        depth: 1,
        limit: 100,
        overrideAccess: true,
      })
    : null

  const postIds = posts?.docs.map((p) => p.id) ?? []
  const comments = postIds.length
    ? await payload.find({
        collection: 'rec-comments',
        where: { post: { in: postIds } },
        sort: 'createdAt',
        depth: 1,
        pagination: false,
        overrideAccess: true,
      })
    : null

  return (
    <div>
      <header className="hero">
        <Link href="/" className="back-link">
          {t.back}
        </Link>
        <h1 className="page-h1">{t.recsTitle}</h1>
        <p className="page-sub">
          {t.recsSub}
        </p>
      </header>

      <div className="rec-tabs">
        {tabs.map((tab) => {
          const active = tab.slug === kategorija
          return (
            <Link
              key={tab.slug}
              href={`/preporuke/${tab.slug}`}
              className="rec-tab"
              style={active ? { borderColor: solidColor(tab.fg), background: solidColor(tab.fg), color: '#fff' } : undefined}
            >
              <span
                className="rec-tab-ico"
                style={{ background: active ? 'rgba(255,255,255,.18)' : themeColor(tab.bg), color: active ? '#fff' : themeColor(tab.fg) }}
              >
                <Icon name={tab.icon} size={14} />
              </span>
              {tab.label}
            </Link>
          )
        })}
      </div>

      {cat && (
        <div className="rec-subs">
          <Link href={`/preporuke/${cat.slug}`} className={`pill${!sub ? ' active' : ''}`}>
            {t.all}
          </Link>
          {(cat.subs ?? []).map((s) => (
            <Link key={s.slug} href={`/preporuke/${cat.slug}?sub=${s.slug}`} className={`pill${sub === s.slug ? ' active' : ''}`}>
              {s.label}
            </Link>
          ))}
        </div>
      )}
      {isPoll && <div style={{ height: 12 }} />}

      <div className="rec-layout">
        <div className="rec-posts">
          {isPoll &&
            (poll ? (
              <PollBox
                big
                poll={poll}
                labels={{ votes: t.votes, poll: t.poll, until: poll.until ? t.pollUntil.replace('{d}', shortDateLabel(poll.until, lang)) : null }}
              />
            ) : (
              <p className="empty">{t.noPoll}</p>
            ))}

          {cat && (
            <NewPostForm
              t={t}
              categoryId={cat.id}
              subs={(cat.subs ?? []).map((s) => ({ slug: s.slug, label: s.label }))}
              defaultSub={sub}
            />
          )}

          {posts?.docs.length === 0 && <p className="empty">{t.noPosts}</p>}

          {cat &&
            posts?.docs.map((p) => {
              const s = (cat.subs ?? []).find((x) => x.slug === p.sub)
              const likes = (p.likes ?? []).map(idOf)
              const author = typeof p.author === 'object' ? p.author : null
              return (
                <PostCard
                  key={p.id}
                  t={t}
                  post={{
                    id: p.id,
                    title: p.title,
                    text: p.text || '',
                    meta: p.meta || '',
                    tag: s?.label || '',
                    icon: s?.icon || cat.icon || 'culture',
                    image: mediaUrl(p.image, 'thumb'),
                    author: author?.name || '',
                    time: timeAgo(p.createdAt, t),
                    likes: likes.length,
                    liked: likes.includes(user.id),
                    comments: (comments?.docs ?? [])
                      .filter((c) => idOf(c.post) === p.id)
                      .map((c) => ({
                        id: c.id,
                        name: shortName(typeof c.author === 'object' ? c.author?.name : ''),
                        text: c.text,
                        time: timeAgo(c.createdAt, t),
                      })),
                  }}
                  colors={{ fg: themeColor(cat.fg || '#003768'), bg: themeColor(cat.bg || '#E8EEF2') }}
                />
              )
            })}
        </div>
      </div>
    </div>
  )
}
