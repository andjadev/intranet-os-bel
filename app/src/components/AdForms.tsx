'use client'

import { useState, useTransition } from 'react'

import { createAd, deleteAd } from '@/app/(frontend)/actions'
import { Icon } from '@/components/Icon'
import type { Dict } from '@/i18n/dict'

export function NewAdForm({ t }: { t: Dict }) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<'sell' | 'buy' | 'give'>('sell')
  const [pending, startTransition] = useTransition()

  if (!open) {
    return (
      <button className="btn" onClick={() => setOpen(true)}>
        <Icon name="plus" size={14} /> {t.newAd}
      </button>
    )
  }

  const submit = (form: FormData) =>
    startTransition(async () => {
      const res = await createAd({
        kind,
        title: String(form.get('title') || ''),
        description: String(form.get('description') || ''),
        price: String(form.get('price') || ''),
      })
      if (res.ok) setOpen(false)
    })

  return (
    <form className="card form-card" action={submit} style={{ width: '100%', maxWidth: 520 }}>
      <div className="filters">
        {(['sell', 'buy', 'give'] as const).map((k) => (
          <button key={k} type="button" className={`pill${kind === k ? ' active' : ''}`} onClick={() => setKind(k)}>
            {{ sell: t.adSell, buy: t.adBuy, give: t.adGive }[k]}
          </button>
        ))}
      </div>
      <input className="input" name="title" placeholder={t.adTitle} required maxLength={200} autoFocus />
      <textarea className="input" name="description" placeholder={t.adDescription} maxLength={2000} />
      <input className="input" name="price" placeholder={t.adPrice} maxLength={60} />
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
          {t.cancel}
        </button>
        <button className="btn btn-navy" disabled={pending}>
          {t.publish}
        </button>
      </div>
    </form>
  )
}

export function DeleteAdButton({ id, label }: { id: number; label: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      className="ad-delete"
      disabled={pending}
      onClick={() => {
        if (confirm(`${label}?`)) startTransition(() => deleteAd(id))
      }}
    >
      {label}
    </button>
  )
}
