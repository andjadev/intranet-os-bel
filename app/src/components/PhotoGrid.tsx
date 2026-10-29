'use client'

import { useCallback, useEffect, useState } from 'react'

type Photo = { thumb: string; full: string; alt: string }

/** Album grid with the lightbox suggested in the README (arrows + Esc). */
export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const step = useCallback(
    (d: number) => setOpen((i) => (i == null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  )

  useEffect(() => {
    if (open == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowLeft') step(-1)
      if (e.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, step])

  return (
    <>
      <div className="photos">
        {photos.map((p, i) => (
          <button key={p.full} className="photo" onClick={() => setOpen(i)}>
            <img src={p.thumb} alt={p.alt} loading="lazy" />
          </button>
        ))}
      </div>
      {open != null && (
        <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <img src={photos[open].full} alt={photos[open].alt} onClick={(e) => e.stopPropagation()} />
          {photos.length > 1 && (
            <>
              <button className="lb-prev" onClick={(e) => (e.stopPropagation(), step(-1))} aria-label="‹">‹</button>
              <button className="lb-next" onClick={(e) => (e.stopPropagation(), step(1))} aria-label="›">›</button>
            </>
          )}
          <button className="lb-close" onClick={() => setOpen(null)} aria-label="×">×</button>
        </div>
      )}
    </>
  )
}
