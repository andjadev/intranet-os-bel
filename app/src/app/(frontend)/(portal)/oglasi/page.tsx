import Link from 'next/link'

import { DeleteAdButton, NewAdForm } from '@/components/AdForms'
import { idOf } from '@/lib/data'
import { getDict, getPayloadClient, isEditor, requireUser } from '@/lib/server'

export default async function ClassifiedsPage() {
  const user = await requireUser()
  const t = await getDict()
  const payload = await getPayloadClient()
  const ads = await payload.find({ collection: 'classifieds', sort: '-createdAt', depth: 1, limit: 200, overrideAccess: true })
  const kindLabel = { sell: t.adSell, buy: t.adBuy, give: t.adGive }

  return (
    <div>
      <header className="hero">
        <Link href="/" className="back-link">
          {t.back}
        </Link>
        <div className="page-head">
          <div>
            <h1 className="page-h1">{t.adsTitle}</h1>
            <p className="page-sub">{t.homemadeSub}</p>
          </div>
          <NewAdForm t={t} />
        </div>
      </header>
      {ads.docs.length === 0 && <p className="empty">{t.noAds}</p>}
      <div className="grid-3">
        {ads.docs.map((ad) => {
          const author = typeof ad.author === 'object' ? ad.author : null
          const canDelete = idOf(ad.author) === user.id || isEditor(user)
          return (
            <section key={ad.id} className="card">
              <span className="row-between">
                <span className="ad-tag">{kindLabel[ad.kind]}</span>
                {canDelete && <DeleteAdButton id={ad.id} label={t.delete} />}
              </span>
              <span className="ad-title">{ad.title}</span>
              {ad.description && <span className="ad-note">{ad.description}</span>}
              <div className="ad-foot">
                {author ? (
                  <Link href={`/kolega/${author.id}`} className="ad-seller">
                    <span className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                      {author.initials}
                    </span>
                    {author.name}
                  </Link>
                ) : (
                  <span />
                )}
                {ad.price && <span className="ad-price">{ad.price}</span>}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
