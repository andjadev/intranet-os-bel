import type { CollectionConfig } from 'payload'

import { hiddenForEditors, loggedIn, superadmins } from '../access'

export const Departments: CollectionConfig = {
  slug: 'departments',
  labels: {
    singular: { sr: 'Tim', en: 'Team', de: 'Team' },
    plural: { sr: 'Timovi', en: 'Teams', de: 'Teams' },
  },
  admin: { hidden: hiddenForEditors, useAsTitle: 'name', group: { sr: 'Podešavanja', en: 'Settings', de: 'Einstellungen' } },
  access: { read: loggedIn, create: superadmins, update: superadmins, delete: superadmins },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true, label: { sr: 'Naziv', en: 'Name', de: 'Name' } },
    { name: 'slug', type: 'text', required: true, unique: true, label: { sr: 'Oznaka u adresi', en: 'URL name', de: 'URL-Name' } },
  ],
}
