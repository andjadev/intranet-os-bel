import Link from 'next/link'

import { Icon } from '@/components/Icon'
import { ALBUM_THEMES, type AlbumTheme } from '@/lib/constants'
import { mediaUrl } from '@/lib/data'
import { getDict, getLang, getPayloadClient } from '@/lib/server'

export default async function GalleryPage() {
  const lang = await getLang()
  const t = await getDict()
  const payload = await getPayloadClient()
  const albums = await payload.find({ collection: 'albums', locale: lang, sort: 'order', depth: 1, limit: 100, overrideAccess: true })

  return (
    <div>
      <header className="hero">
        <Link href="/" className="back-link">
          {t.back}
        </Link>
        <h1 className="page-h1">{t.galTitle}</h1>
        <p className="page-sub">
          {t.galSub}
        </p>
      </header>
      <div className="albums">
        {albums.docs.map((a) => {
          const theme = ALBUM_THEMES[(a.theme as AlbumTheme) || 'blue']
          const photos = (a.photos ?? []).map((p) => mediaUrl(p, 'thumb')).filter(Boolean) as string[]
          const count = a.photos?.length ?? 0
          return (
            <Link key={a.id} href={`/galerija/${a.id}`} className="album">
              <span className="mosaic">
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ background: theme.bg[i], color: theme.fg }}>
                    {photos[i] ? <img src={photos[i]} alt="" /> : i === 0 ? <Icon name="image" size={26} /> : null}
                  </span>
                ))}
              </span>
              <span className="album-info">
                <span className="album-ico" style={{ color: theme.fg, background: theme.bg[0] }}>
                  <Icon name="folder" size={15} />
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span className="album-name">{a.name}</span>
                  <span className="album-meta">
                    {count} {t.photos}
                    {a.dateLabel ? ` · ${a.dateLabel}` : ''}
                  </span>
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
