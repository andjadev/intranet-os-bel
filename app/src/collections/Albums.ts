import type { CollectionConfig } from 'payload'

import { editors, loggedIn } from '../access'

export const Albums: CollectionConfig = {
  slug: 'albums',
  labels: {
    singular: { sr: 'Album', en: 'Album', de: 'Album' },
    plural: { sr: 'Galerija', en: 'Gallery', de: 'Galerie' },
  },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'dateLabel', 'order'] },
  defaultSort: 'order',
  access: { read: loggedIn, create: editors, update: editors, delete: editors },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, localized: true, label: { sr: 'Naziv', en: 'Name', de: 'Name' } },
        { name: 'dateLabel', type: 'text', localized: true, label: { sr: 'Datum (tekst)', en: 'Date (text)', de: 'Datum (Text)' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'theme',
          type: 'select',
          defaultValue: 'blue',
          label: { sr: 'Boja', en: 'Color', de: 'Farbe' },
          options: [
            { label: { sr: 'Plava', en: 'Blue', de: 'Blau' }, value: 'blue' },
            { label: { sr: 'Tamna', en: 'Dark', de: 'Dunkel' }, value: 'sand' },
            { label: { sr: 'Siva', en: 'Grey', de: 'Grau' }, value: 'green' },
          ],
        },
        { name: 'order', type: 'number', defaultValue: 0, label: { sr: 'Redosled', en: 'Order', de: 'Reihenfolge' } },
      ],
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: { sr: 'Fotografije', en: 'Photos', de: 'Fotos' },
    },
  ],
}
