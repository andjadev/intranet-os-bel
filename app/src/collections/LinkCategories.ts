import { APIError, type CollectionConfig } from 'payload'

import { hiddenForEditors, loggedIn, superadmins } from '../access'
import { INFO_ICONS, iconOptions } from '../lib/constants'

/** Sections of the "Korisne informacije" page; each link belongs to one. */
export const LinkCategories: CollectionConfig = {
  slug: 'link-categories',
  labels: {
    singular: { sr: 'Kategorija informacija', en: 'Info category', de: 'Info-Kategorie' },
    plural: { sr: 'Kategorije informacija', en: 'Info categories', de: 'Info-Kategorien' },
  },
  admin: { hidden: hiddenForEditors, useAsTitle: 'title', defaultColumns: ['title', 'icon', 'order'] },
  defaultSort: 'order',
  access: { read: loggedIn, create: superadmins, update: superadmins, delete: superadmins },
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        // Links require a category, so a category in use cannot go away under them.
        const { totalDocs } = await req.payload.count({ collection: 'links', where: { category: { equals: id } }, req })
        if (totalDocs > 0) {
          throw new APIError(`Kategorija ima ${totalDocs} informacija. Prvo ih premestite u drugu kategoriju ili obrišite.`, 400, null, true)
        }
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { sr: 'Naziv', en: 'Name', de: 'Name' } },
    {
      type: 'row',
      fields: [
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'folder',
          label: { sr: 'Ikonica', en: 'Icon', de: 'Symbol' },
          options: iconOptions(INFO_ICONS),
        },
        { name: 'order', type: 'number', defaultValue: 0, label: { sr: 'Redosled', en: 'Order', de: 'Reihenfolge' } },
      ],
    },
  ],
}
