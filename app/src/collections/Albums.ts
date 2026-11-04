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
      admin: {
        description: {
          sr: '1) Prevucite slike ovde (može više odjednom). 2) U prozoru koji se otvori kliknite Sačuvaj. 3) Na kraju kliknite Sačuvaj gore desno, inače se album ne čuva. Do oko 5 MB po slici.',
          en: '1) Drop photos here (several at once is fine). 2) Click Save in the panel that opens. 3) Finally click Save at the top right, otherwise the album is not stored. Up to about 5 MB per photo.',
          de: '1) Fotos hierher ziehen (mehrere möglich). 2) Im Fenster auf Speichern klicken. 3) Zum Schluss oben rechts auf Speichern klicken, sonst wird das Album nicht gespeichert. Bis ca. 5 MB pro Foto.',
        },
      },
    },
  ],
}
