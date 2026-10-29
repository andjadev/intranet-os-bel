import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PhotoGrid } from '@/components/PhotoGrid'
import { mediaUrl } from '@/lib/data'
import { getDict, getLang, getPayloadClient } from '@/lib/server'

export default async function AlbumPage({ params }: { params: Promise<{ album: string }> }) {
  const { album: id } = await params
  if (!/^\d+$/.test(id)) notFound()
  const lang = await getLang()
  const t = await getDict()
  const payload = await getPayloadClient()
  const album = await payload
    .findByID({ collection: 'albums', id: Number(id), locale: lang, depth: 1, overrideAccess: true })
    .catch(() => null)
  if (!album) notFound()

  const photos = (album.photos ?? [])
    .map((p) => ({ thumb: mediaUrl(p, 'thumb'), full: mediaUrl(p), alt: typeof p === 'object' ? p.alt || '' : '' }))
    .filter((p): p is { thumb: string; full: string; alt: string } => Boolean(p.thumb && p.full))

  return (
    <div>
      <header className="hero">
        <Link href="/galerija" className="back-link">
          {t.backGal}
        </Link>
        <h1 className="page-h1">{album.name}</h1>
        <p className="page-sub">
          {[album.dateLabel, `${photos.length} ${t.photos}`].filter(Boolean).join(' · ')}
        </p>
      </header>
      {photos.length === 0 ? <p className="empty">{t.noPhotos}</p> : <PhotoGrid photos={photos} />}
    </div>
  )
}
