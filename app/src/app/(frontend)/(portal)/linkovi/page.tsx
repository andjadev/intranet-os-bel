import Link from 'next/link'

import { Icon } from '@/components/Icon'
import { idOf, linkHref, opensNewTab } from '@/lib/data'
import { getDict, getLang, getPayloadClient } from '@/lib/server'

export default async function LinksPage() {
  const lang = await getLang()
  const t = await getDict()
  const payload = await getPayloadClient()
  const [categories, links] = await Promise.all([
    payload.find({ collection: 'link-categories', locale: lang, sort: 'order', pagination: false, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'links', locale: lang, sort: 'order', pagination: false, depth: 1, overrideAccess: true }),
  ])

  return (
    <div>
      <header className="hero">
        <Link href="/" className="back-link">
          {t.back}
        </Link>
        <h1 className="page-h1">{t.usefulTitle}</h1>
        <p className="page-sub">{t.usefulPageSub}</p>
      </header>
      <div className="grid-3">
        {categories.docs.map((c) => {
          const items = links.docs.filter((l) => idOf(l.category) === c.id)
          if (items.length === 0) return null
          return (
            <section key={c.id} id={`kategorija-${c.id}`} className="card link-group">
              <h2>
                <Icon name={c.icon || 'folder'} size={14} />
                {c.title}
              </h2>
              {items.map((l) => {
                const href = linkHref(l)
                return (
                  <a
                    key={l.id}
                    href={href}
                    className="link-item"
                    {...(opensNewTab(href) ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    <span className="link-item-ico">
                      <Icon name={l.icon || 'doc'} size={15} />
                    </span>
                    <span>
                      <strong>{l.title}</strong>
                      {l.description && <small>{l.description}</small>}
                    </span>
                    <span>↗</span>
                  </a>
                )
              })}
            </section>
          )
        })}
      </div>
    </div>
  )
}
