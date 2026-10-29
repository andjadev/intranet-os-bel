import Link from 'next/link'

import { LINK_GROUP_LABELS } from '@/i18n/dict'
import { LINK_GROUPS } from '@/lib/constants'
import { getDict, getLang, getPayloadClient } from '@/lib/server'

export default async function LinksPage() {
  const lang = await getLang()
  const t = await getDict()
  const payload = await getPayloadClient()
  const links = await payload.find({ collection: 'links', locale: lang, sort: 'order', pagination: false, depth: 0, overrideAccess: true })

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
        {LINK_GROUPS.map((g) => {
          const items = links.docs.filter((l) => l.group === g)
          if (items.length === 0) return null
          return (
            <section key={g} className="card link-group">
              <h2>{LINK_GROUP_LABELS[g][lang]}</h2>
              {items.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  className="link-item"
                  {...(/^https?:/.test(l.url) ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  <span>
                    <strong>{l.title}</strong>
                    {l.description && <small>{l.description}</small>}
                  </span>
                  <span>↗</span>
                </a>
              ))}
            </section>
          )
        })}
      </div>
    </div>
  )
}
