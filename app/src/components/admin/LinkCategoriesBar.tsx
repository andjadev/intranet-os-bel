import type { Payload } from 'payload'
import React from 'react'

import { Icon } from '../Icon'

const LABELS = {
  rs: { title: 'Kategorije', add: 'Nova kategorija', empty: 'Još nema kategorija. Prvo dodajte jednu.' },
  en: { title: 'Categories', add: 'New category', empty: 'No categories yet. Add one first.' },
  de: { title: 'Kategorien', add: 'Neue Kategorie', empty: 'Noch keine Kategorien. Zuerst eine anlegen.' },
}

type Props = { payload: Payload; i18n?: { language?: string }; locale?: { code?: string } }

/** Above the "Korisne informacije" list: the categories (click to edit) and a button for a new one. */
export async function LinkCategoriesBar({ payload, i18n, locale }: Props) {
  const l = LABELS[(i18n?.language ?? 'rs') as keyof typeof LABELS] ?? LABELS.rs
  const lang = (locale?.code ?? 'sr') as 'sr' | 'en' | 'de'
  const [categories, links] = await Promise.all([
    payload.find({ collection: 'link-categories', locale: lang, sort: 'order', pagination: false, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'links', pagination: false, depth: 0, overrideAccess: true, select: { category: true } }),
  ])
  const counts = new Map<number, number>()
  for (const link of links.docs) {
    const id = typeof link.category === 'object' ? link.category?.id : link.category
    if (id != null) counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  return (
    <div className="osbel-cats">
      <span className="osbel-cats__title">{l.title}</span>
      {categories.docs.length === 0 && <span className="osbel-cats__empty">{l.empty}</span>}
      {categories.docs.map((c) => (
        <a key={c.id} className="osbel-cats__chip" href={`/admin/collections/link-categories/${c.id}`}>
          <Icon name={c.icon || 'folder'} size={14} />
          {c.title}
          <span className="osbel-cats__count">{counts.get(c.id) ?? 0}</span>
        </a>
      ))}
      <a className="osbel-cats__add" href="/admin/collections/link-categories/create">
        + {l.add}
      </a>
    </div>
  )
}
