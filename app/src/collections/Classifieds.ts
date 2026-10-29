import type { CollectionConfig } from 'payload'

import { authorOrEditors, loggedIn } from '../access'

export const Classifieds: CollectionConfig = {
  slug: 'classifieds',
  labels: {
    singular: { sr: 'Oglas', en: 'Classified', de: 'Anzeige' },
    plural: { sr: 'Mali oglasi', en: 'Classifieds', de: 'Kleinanzeigen' },
  },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'kind', 'author', 'price', 'createdAt'] },
  defaultSort: '-createdAt',
  access: { read: loggedIn, create: loggedIn, update: authorOrEditors(), delete: authorOrEditors() },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create' && !data.author && req.user) data.author = req.user.id
        return data
      },
    ],
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'sell',
      label: { sr: 'Vrsta', en: 'Kind', de: 'Art' },
      options: [
        { label: { sr: 'Prodajem', en: 'Selling', de: 'Verkaufe' }, value: 'sell' },
        { label: { sr: 'Kupujem', en: 'Buying', de: 'Kaufe' }, value: 'buy' },
        { label: { sr: 'Poklanjam', en: 'Giving away', de: 'Verschenke' }, value: 'give' },
      ],
    },
    { name: 'title', type: 'text', required: true, label: { sr: 'Naslov', en: 'Title', de: 'Titel' } },
    { name: 'description', type: 'textarea', label: { sr: 'Opis', en: 'Description', de: 'Beschreibung' } },
    { name: 'price', type: 'text', label: { sr: 'Cena', en: 'Price', de: 'Preis' } },
    { name: 'author', type: 'relationship', relationTo: 'users', label: { sr: 'Kolega', en: 'Colleague', de: 'Kolleg:in' } },
  ],
}
