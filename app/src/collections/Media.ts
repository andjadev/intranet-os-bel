import type { CollectionConfig } from 'payload'

import { editors, loggedIn } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { sr: 'Fajl', en: 'File', de: 'Datei' },
    plural: { sr: 'Fajlovi i slike', en: 'Media', de: 'Medien' },
  },
  access: { read: loggedIn, create: editors, update: editors, delete: editors },
  fields: [{ name: 'alt', type: 'text', label: { sr: 'Opis slike', en: 'Alt text', de: 'Alt-Text' } }],
  upload: {
    // In Docker this points into the data volume, next to the SQLite file.
    staticDir: process.env.MEDIA_DIR || 'media',
    mimeTypes: ['image/*'],
    imageSizes: [{ name: 'thumb', width: 480, height: 480, position: 'centre' }],
  },
}
